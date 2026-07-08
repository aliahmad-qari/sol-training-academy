import { connectDB, disconnectDB } from '../config/db.js';
import { CourseTopic } from '../models/index.js';
import { logger } from './logger.js';

/**
 * One-off migration: repair quiz topics whose `passing_marks` was saved as a
 * PERCENTAGE instead of ABSOLUTE marks.
 *
 * Background: the AI Quiz Generator used to save `passing_marks: passingScore`
 * where `passingScore` is a percentage (e.g. 75). The grader treats
 * `passing_marks` as absolute marks (`passed = score >= passing_marks`), so a
 * 5-mark quiz saved with `passing_marks: 75` was impossible to pass. The UI has
 * since been fixed to store absolute marks; this repairs the rows written
 * before that fix.
 *
 * Detection: any `type: "quiz"` topic where `passing_marks > total_marks`.
 * Repair: reinterpret the stored number as a percentage of `total_marks`,
 * clamped to [1, total_marks]. total_marks is recomputed from the questions
 * (1 mark each unless a per-question `marks` is set) as a safety net.
 *
 * SAFE BY DEFAULT: dry-run only. Pass `--apply` (or APPLY=true) to write.
 *   Dry run : node src/utils/fixQuizPassingMarks.js
 *   Apply   : node src/utils/fixQuizPassingMarks.js --apply
 */
const APPLY = process.argv.includes('--apply') || String(process.env.APPLY).toLowerCase() === 'true';

const computeTotalMarks = (questions = []) =>
  questions.reduce((sum, q) => sum + (Number(q?.marks) || 1), 0);

const run = async () => {
  await connectDB();

  const quizzes = await CourseTopic.find({ type: 'quiz' }).lean();
  logger.info(`[fix-quiz] Scanning ${quizzes.length} quiz topic(s). Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);

  let broken = 0;
  const updates = [];

  for (const q of quizzes) {
    const total = computeTotalMarks(q.quiz_questions);
    const stored = Number(q.passing_marks);

    // Only touch rows that are actually impossible to pass. A valid row has
    // passing_marks <= total_marks; anything above that is the percentage bug.
    if (total > 0 && Number.isFinite(stored) && stored > total) {
      broken += 1;
      // Reinterpret the stored value as a percentage of the real total.
      const fixed = Math.min(total, Math.max(1, Math.round((stored / 100) * total)));
      updates.push({ id: q._id, title: q.title, total, from: stored, to: fixed });
    }
  }

  if (updates.length === 0) {
    logger.info('[fix-quiz] No broken quiz rows found. Nothing to do.');
    await disconnectDB();
    return;
  }

  logger.info(`[fix-quiz] Found ${broken} broken quiz row(s):`);
  for (const u of updates) {
    // eslint-disable-next-line no-console
    console.log(
      `  - "${u.title}" (${u.id}): passing_marks ${u.from} → ${u.to}  (total_marks=${u.total})`
    );
  }

  if (!APPLY) {
    logger.info('[fix-quiz] DRY-RUN complete. Re-run with --apply to write these changes.');
    await disconnectDB();
    return;
  }

  let written = 0;
  for (const u of updates) {
    await CourseTopic.updateOne(
      { _id: u.id },
      { $set: { passing_marks: u.to, total_marks: u.total } }
    );
    written += 1;
  }
  logger.info(`[fix-quiz] APPLIED. Updated ${written} quiz row(s).`);

  await disconnectDB();
};

run().catch(async (err) => {
  logger.error(`[fix-quiz] Migration failed: ${err?.message}`);
  try {
    await disconnectDB();
  } catch {
    // ignore
  }
  process.exit(1);
});
