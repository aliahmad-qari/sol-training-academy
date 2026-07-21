import { Quiz, QuizAttempt, QuizSession, CourseTopic, CourseEnrollment } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';
import { applyTopicProgress } from '../services/enrollmentProgress.service.js';

const QUIZ_SUBMIT_GRACE_MS = 15 * 1000;

/**
 * Remove answer keys before returning a quiz to a student.
 */
const stripAnswers = (quiz) => ({
  ...quiz,
  questions: (quiz.questions || []).map(({ correct_index, correct_indices, model_answer, explanation, ...q }) => q),
});

const normalizePassingMarks = (passingMarks, totalMarks) => {
  const n = Number(passingMarks);
  if (!Number.isFinite(n) || n <= 0) return 0;

  // Backward compatibility: older admin screens stored a percentage in
  // passing_marks. If the value cannot fit inside totalMarks but looks like a
  // percentage, convert it to absolute marks for grading.
  if (totalMarks > 0 && n > totalMarks && n <= 100) {
    return Math.ceil((n / 100) * totalMarks);
  }

  return n;
};

const sameNumberSet = (left = [], right = []) => {
  const a = [...new Set(left.map(Number))].sort((x, y) => x - y);
  const b = [...new Set(right.map(Number))].sort((x, y) => x - y);
  return a.length === b.length && a.every((value, index) => value === b[index]);
};

/**
 * GET /api/v1/quizzes?course_id=...   (protected)
 * Students receive quizzes WITHOUT answer keys; staff receive full data.
 */
export const listQuizzes = asyncHandler(async (req, res) => {
  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['course_id', 'topic_id', 'is_published'],
    searchFields: ['title'],
    defaultSort: '-createdAt',
  });
  if (!isStaff) filter.is_published = true;

  const [items, total] = await Promise.all([
    Quiz.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Quiz.countDocuments(filter),
  ]);

  const data = isStaff ? items : items.map(stripAnswers);
  return sendOk(res, data, 'Quizzes', paginationMeta(total, page, limit));
});

/**
 * GET /api/v1/quizzes/:id   (protected)
 */
export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).lean();
  if (!quiz) throw ApiError.notFound('Quiz not found.');
  const isStaff = ['admin', 'team_member'].includes(req.user.role);
  return sendOk(res, isStaff ? quiz : stripAnswers(quiz), 'Quiz detail');
});

/**
 * POST /api/v1/quizzes   (staff)
 */
export const createQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.create(req.body);
  return sendCreated(res, quiz, 'Quiz created');
});

/**
 * PUT /api/v1/quizzes/:id   (staff)
 */
export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) throw ApiError.notFound('Quiz not found.');
  Object.assign(quiz, req.body);
  await quiz.save();
  return sendOk(res, quiz, 'Quiz updated');
});

/**
 * DELETE /api/v1/quizzes/:id   (staff)
 */
export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findByIdAndDelete(req.params.id);
  if (!quiz) throw ApiError.notFound('Quiz not found.');
  return sendOk(res, { id: req.params.id }, 'Quiz deleted');
});

/**
 * Grade a set of answers against a question array.
 * `answers` = { "<index>": selectedOptionIndex | selectedOptionIndexes[] }
 */
const gradeAnswers = (questions, answers) => {
  let score = 0;
  let totalMarks = 0;
  let correctCount = 0;
  const review = [];

  questions.forEach((q, i) => {
    const marks = Number(q.marks ?? 1);
    const qMarks = Number.isFinite(marks) ? marks : 1;
    totalMarks += qMarks;
    const given = answers?.[i] ?? answers?.[String(i)];
    let correct = false;

    if (q.type === 'multi_select') {
      const correctIndices = Array.isArray(q.correct_indices) && q.correct_indices.length > 0
        ? q.correct_indices
        : [q.correct_index];
      correct = Array.isArray(given) && sameNumberSet(given, correctIndices);
    } else if (q.type === 'short_answer') {
      correct = false;
    } else {
      correct = given !== undefined && Number(given) === Number(q.correct_index);
    }

    if (correct) {
      score += qMarks;
      correctCount += 1;
    }

    // Per-question review so the student can see the right answer + explanation
    // after submitting. Safe to expose now — the attempt is already graded.
    review.push({
      index: i,
      type: q.type || 'mcq',
      given: given ?? null,
      correct,
      correct_index: q.correct_index ?? null,
      correct_indices: Array.isArray(q.correct_indices) ? q.correct_indices : null,
      model_answer: q.model_answer ?? null,
      explanation: q.explanation ?? '',
    });
  });

  return { score, totalMarks, totalQuestions: questions.length, correctCount, review };
};


const ensureActiveEnrollment = async ({ userId, courseId }) => {
  const enrollment = await CourseEnrollment.findOne({
    user_id: userId,
    course_id: courseId,
    status: { $in: ['active', 'completed'] },
    $or: [{ expiry_date: null }, { expiry_date: { $exists: false } }, { expiry_date: { $gt: new Date() } }],
  }).lean();

  if (!enrollment) {
    throw ApiError.forbidden('You are not enrolled in this course, or your access has expired.');
  }

  return enrollment;
};

const resolveQuizTarget = async ({ topic_id, quiz_id, course_id }) => {
  if (topic_id) {
    const topic = await CourseTopic.findById(topic_id).lean();
    if (!topic || topic.type !== 'quiz') throw ApiError.badRequest('Invalid quiz topic.');
    if (String(topic.course_id) !== String(course_id)) {
      throw ApiError.badRequest('Quiz topic does not belong to this course.');
    }
    return {
      target_type: 'topic',
      topic_id: topic._id,
      quiz_id: undefined,
      course_id: topic.course_id,
      questions: topic.quiz_questions || [],
      passing_marks: topic.passing_marks || 0,
      time_limit_mins: Number(topic.time_limit_mins || 0),
      max_attempts: 0,
      completionTopicId: topic._id,
      available_from: topic.available_from,
      available_until: topic.available_until,
    };
  }

  const quiz = await Quiz.findById(quiz_id).lean();
  if (!quiz) throw ApiError.notFound('Quiz not found.');
  if (String(quiz.course_id) !== String(course_id)) {
    throw ApiError.badRequest('Quiz does not belong to this course.');
  }
  return {
    target_type: 'quiz',
    topic_id: quiz.topic_id,
    quiz_id: quiz._id,
    course_id: quiz.course_id,
    questions: quiz.questions || [],
    passing_marks: quiz.passing_marks || 0,
    time_limit_mins: Number(quiz.time_limit_mins || 0),
    max_attempts: Number(quiz.max_attempts || 0),
    completionTopicId: quiz.topic_id,
  };
};

const assertQuizWindow = (target) => {
  const now = Date.now();
  if (target.available_from && new Date(target.available_from).getTime() > now) {
    throw ApiError.badRequest('This quiz is not open yet.');
  }
  if (target.available_until && new Date(target.available_until).getTime() < now) {
    throw ApiError.badRequest('This quiz has closed.');
  }
};

const targetAttemptFilter = (target) => (
  target.target_type === 'topic' ? { topic_id: target.topic_id } : { quiz_id: target.quiz_id }
);

const sessionTargetFilter = (target) => (
  target.target_type === 'topic' ? { topic_id: target.topic_id } : { quiz_id: target.quiz_id }
);

/**
 * POST /api/v1/quizzes/attempts/start   (protected; student)
 * Body: { topic_id?, quiz_id?, course_id }
 * Starts or resumes a server-owned quiz session.
 */
export const startAttempt = asyncHandler(async (req, res) => {
  const { topic_id, quiz_id, course_id } = req.body;
  if (!course_id || (!topic_id && !quiz_id)) {
    throw ApiError.badRequest('course_id and (topic_id or quiz_id) are required.');
  }

  await ensureActiveEnrollment({ userId: req.user._id, courseId: course_id });
  const target = await resolveQuizTarget({ topic_id, quiz_id, course_id });
  assertQuizWindow(target);
  if (target.questions.length === 0) throw ApiError.badRequest('This quiz has no questions.');

  const now = new Date();
  const sessionFilter = { user_id: req.user._id, ...sessionTargetFilter(target) };
  await QuizSession.updateMany(
    { ...sessionFilter, status: 'in_progress', expires_at: { $lte: now } },
    { $set: { status: 'expired' } }
  );

  let session = await QuizSession.findOne({
    ...sessionFilter,
    status: 'in_progress',
    $or: [{ expires_at: null }, { expires_at: { $exists: false } }, { expires_at: { $gt: now } }],
  }).sort('-createdAt');

  if (!session) {
    const prior = await QuizAttempt.countDocuments({ user_id: req.user._id, ...targetAttemptFilter(target) });
    if (target.max_attempts > 0 && prior >= target.max_attempts) {
      throw ApiError.forbidden('Maximum quiz attempts reached.');
    }
    const expiresAt = target.time_limit_mins > 0
      ? new Date(now.getTime() + target.time_limit_mins * 60 * 1000)
      : null;
    session = await QuizSession.create({
      user_id: req.user._id,
      course_id,
      topic_id: target.topic_id,
      quiz_id: target.quiz_id,
      attempt_number: prior + 1,
      time_limit_mins: target.time_limit_mins,
      started_at: now,
      expires_at: expiresAt,
      status: 'in_progress',
    });
  }

  const secondsLeft = session.expires_at
    ? Math.max(0, Math.floor((session.expires_at.getTime() - Date.now()) / 1000))
    : null;

  return sendOk(res, {
    session_id: session._id,
    attempt_number: session.attempt_number,
    started_at: session.started_at,
    expires_at: session.expires_at,
    seconds_left: secondsLeft,
    time_limit_mins: session.time_limit_mins,
  }, 'Quiz session started');
});

/**
 * POST /api/v1/quizzes/attempts   (protected; student)
 * Body: { topic_id?, quiz_id?, course_id, session_id?, answers }
 */
export const submitAttempt = asyncHandler(async (req, res) => {
  const { topic_id, quiz_id, course_id, session_id, answers = {} } = req.body;
  if (!course_id || (!topic_id && !quiz_id)) {
    throw ApiError.badRequest('course_id and (topic_id or quiz_id) are required.');
  }

  await ensureActiveEnrollment({ userId: req.user._id, courseId: course_id });
  const target = await resolveQuizTarget({ topic_id, quiz_id, course_id });
  assertQuizWindow(target);

  const questions = target.questions;
  const passingMarksInput = target.passing_marks;
  const completionTopicId = target.completionTopicId;
  if (questions.length === 0) throw ApiError.badRequest('This quiz has no questions.');

  let session = null;
  if (target.time_limit_mins > 0 || session_id) {
    if (!session_id) throw ApiError.badRequest('A quiz session is required for timed quizzes.');
    session = await QuizSession.findById(session_id);
    if (!session) throw ApiError.notFound('Quiz session not found.');
    if (String(session.user_id) !== String(req.user._id) || String(session.course_id) !== String(course_id)) {
      throw ApiError.forbidden('Quiz session does not belong to this user.');
    }
    if (target.target_type === 'topic' && String(session.topic_id) !== String(target.topic_id)) {
      throw ApiError.badRequest('Quiz session does not match this topic.');
    }
    if (target.target_type === 'quiz' && String(session.quiz_id) !== String(target.quiz_id)) {
      throw ApiError.badRequest('Quiz session does not match this quiz.');
    }
    if (session.status !== 'in_progress' || session.submitted_at) {
      throw ApiError.badRequest('This quiz session has already been submitted.');
    }
    if (session.expires_at && session.expires_at.getTime() + QUIZ_SUBMIT_GRACE_MS < Date.now()) {
      session.status = 'expired';
      await session.save();
      throw ApiError.badRequest('Quiz time has expired.');
    }
  }

  const prior = session
    ? session.attempt_number - 1
    : await QuizAttempt.countDocuments({ user_id: req.user._id, ...targetAttemptFilter(target) });
  if (!session && target.max_attempts > 0 && prior >= target.max_attempts) {
    throw ApiError.forbidden('Maximum quiz attempts reached.');
  }

  const { score, totalMarks, totalQuestions, correctCount, review } = gradeAnswers(questions, answers);
  const passingMarks = normalizePassingMarks(passingMarksInput, totalMarks);
  const passed = score >= passingMarks;

  const attempt = await QuizAttempt.create({
    user_id: req.user._id,
    course_id,
    topic_id: target.topic_id,
    quiz_id: target.quiz_id,
    session_id: session?._id,
    answers,
    score,
    total_marks: totalMarks,
    total_questions: totalQuestions,
    passed,
    attempt_number: prior + 1,
  });

  if (session) {
    session.status = 'submitted';
    session.submitted_at = new Date();
    session.attempt_id = attempt._id;
    await session.save();
  }

  let progress = null;
  if (passed && completionTopicId) {
    progress = await applyTopicProgress({
      userId: req.user._id,
      courseId: course_id,
      actor: req.user,
      topicId: completionTopicId,
      completed: true,
    });
  }

  return sendCreated(
    res,
    {
      attempt,
      passed,
      score,
      total_marks: totalMarks,
      total_questions: totalQuestions,
      correct_count: correctCount,
      passing_marks: passingMarks,
      review,
      enrollment: progress?.enrollment || null,
      certificate: progress?.certificate || null,
      certificate_error: progress?.certificate_error || null,
    },
    passed ? 'Quiz passed' : 'Quiz submitted'
  );
});

/**
 * GET /api/v1/quizzes/attempts/mine   (protected)
 * Query: topic_id?, course_id?
 */
export const listMyAttempts = asyncHandler(async (req, res) => {
  const filter = { user_id: req.user._id };
  if (req.query.topic_id) filter.topic_id = req.query.topic_id;
  if (req.query.course_id) filter.course_id = req.query.course_id;
  const attempts = await QuizAttempt.find(filter).sort('-createdAt').lean();
  return sendOk(res, attempts, 'My quiz attempts');
});

/**
 * GET /api/v1/quizzes/attempts   (staff) - all attempts with filters
 */
export const listAllAttempts = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = buildQuery(req.query, {
    allowedFilters: ['user_id', 'course_id', 'topic_id', 'quiz_id', 'passed'],
    defaultSort: '-createdAt',
  });
  const [items, total] = await Promise.all([
    QuizAttempt.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    QuizAttempt.countDocuments(filter),
  ]);
  return sendOk(res, items, 'Quiz attempts', paginationMeta(total, page, limit));
});
