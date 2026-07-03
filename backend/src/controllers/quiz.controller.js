import { Quiz, QuizAttempt, CourseTopic, CourseEnrollment } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendOk, sendCreated } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildQuery, paginationMeta } from '../helpers/queryFeatures.js';

/**
 * Remove answer keys before returning a quiz to a student.
 */
const stripAnswers = (quiz) => ({
  ...quiz,
  questions: (quiz.questions || []).map(({ correct_index, explanation, ...q }) => q),
});

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
  await quiz.save(); // triggers total_marks recompute hook
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
 * `answers` = { "<index>": selectedOptionIndex }
 * Returns { score, totalMarks, totalQuestions, correctCount }.
 */
const gradeAnswers = (questions, answers) => {
  let score = 0;
  let totalMarks = 0;
  let correctCount = 0;
  questions.forEach((q, i) => {
    const marks = q.marks || 1;
    totalMarks += marks;
    const given = answers?.[i] ?? answers?.[String(i)];
    if (given !== undefined && Number(given) === Number(q.correct_index)) {
      score += marks;
      correctCount += 1;
    }
  });
  return { score, totalMarks, totalQuestions: questions.length, correctCount };
};

/**
 * POST /api/v1/quizzes/attempts   (protected; student)
 * Body: { topic_id?, quiz_id?, course_id, answers }
 * Grades server-side and records a QuizAttempt. Marks the topic complete on pass.
 * 201 → { attempt, passed, score, total_marks }
 */
export const submitAttempt = asyncHandler(async (req, res) => {
  const { topic_id, quiz_id, course_id, answers = {} } = req.body;
  if (!course_id || (!topic_id && !quiz_id)) {
    throw ApiError.badRequest('course_id and (topic_id or quiz_id) are required.');
  }

  // Load the question source (topic-embedded or standalone quiz).
  let questions;
  let passingMarks = 0;
  if (topic_id) {
    const topic = await CourseTopic.findById(topic_id).lean();
    if (!topic || topic.type !== 'quiz') throw ApiError.badRequest('Invalid quiz topic.');
    questions = topic.quiz_questions || [];
    passingMarks = topic.passing_marks || 0;
  } else {
    const quiz = await Quiz.findById(quiz_id).lean();
    if (!quiz) throw ApiError.notFound('Quiz not found.');
    questions = quiz.questions || [];
    passingMarks = quiz.passing_marks || 0;
  }
  if (questions.length === 0) throw ApiError.badRequest('This quiz has no questions.');

  const { score, totalMarks, totalQuestions } = gradeAnswers(questions, answers);
  const passed = score >= passingMarks;

  // Attempt number = existing attempts + 1.
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

  // On pass, mark the topic complete on the enrollment (best-effort).
  if (passed && topic_id) {
    await CourseEnrollment.findOneAndUpdate(
      { user_id: req.user._id, course_id },
      { $addToSet: { completed_topic_ids: topic_id } }
    );
  }

  return sendCreated(
    res,
    { attempt, passed, score, total_marks: totalMarks, total_questions: totalQuestions },
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
 * GET /api/v1/quizzes/attempts   (staff) — all attempts with filters
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
