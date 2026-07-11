import { Quiz, QuizAttempt, CourseTopic, CourseEnrollment } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';
import { applyTopicProgress } from '../services/enrollmentProgress.service.js';

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

  questions.forEach((q, i) => {
    const marks = Number(q.marks ?? 1);
    totalMarks += Number.isFinite(marks) ? marks : 1;
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
      score += Number.isFinite(marks) ? marks : 1;
      correctCount += 1;
    }
  });

  return { score, totalMarks, totalQuestions: questions.length, correctCount };
};

/**
 * POST /api/v1/quizzes/attempts   (protected; student)
 * Body: { topic_id?, quiz_id?, course_id, answers }
 */
export const submitAttempt = asyncHandler(async (req, res) => {
  const { topic_id, quiz_id, course_id, answers = {} } = req.body;
  if (!course_id || (!topic_id && !quiz_id)) {
    throw ApiError.badRequest('course_id and (topic_id or quiz_id) are required.');
  }

  const enrollment = await CourseEnrollment.findOne({
    user_id: req.user._id,
    course_id,
    status: { $ne: 'expired' },
    $or: [{ expiry_date: null }, { expiry_date: { $exists: false } }, { expiry_date: { $gt: new Date() } }],
  }).lean();

  if (!enrollment) {
    throw ApiError.forbidden('You are not enrolled in this course, or your access has expired.');
  }

  let questions;
  let passingMarksInput = 0;
  let completionTopicId = topic_id;

  if (topic_id) {
    const topic = await CourseTopic.findById(topic_id).lean();
    if (!topic || topic.type !== 'quiz') throw ApiError.badRequest('Invalid quiz topic.');
    if (String(topic.course_id) !== String(course_id)) {
      throw ApiError.badRequest('Quiz topic does not belong to this course.');
    }
    questions = topic.quiz_questions || [];
    passingMarksInput = topic.passing_marks || 0;
  } else {
    const quiz = await Quiz.findById(quiz_id).lean();
    if (!quiz) throw ApiError.notFound('Quiz not found.');
    if (String(quiz.course_id) !== String(course_id)) {
      throw ApiError.badRequest('Quiz does not belong to this course.');
    }
    questions = quiz.questions || [];
    passingMarksInput = quiz.passing_marks || 0;
    completionTopicId = quiz.topic_id;
  }

  if (questions.length === 0) throw ApiError.badRequest('This quiz has no questions.');

  const { score, totalMarks, totalQuestions, correctCount } = gradeAnswers(questions, answers);
  const passingMarks = normalizePassingMarks(passingMarksInput, totalMarks);
  const passed = score >= passingMarks;

  const prior = await QuizAttempt.countDocuments({
    user_id: req.user._id,
    ...(topic_id ? { topic_id } : { quiz_id }),
  });

  const attempt = await QuizAttempt.create({
    user_id: req.user._id,
    course_id,
    topic_id,
    quiz_id,
    answers,
    score,
    total_marks: totalMarks,
    total_questions: totalQuestions,
    passed,
    attempt_number: prior + 1,
  });

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
