import { connectDB, disconnectDB } from '../config/db.js';
import { CourseEnrollment } from '../models/index.js';
import { logger } from './logger.js';

/**
 * One-off migration: repair enrollments that are marked `status: "completed"`
 * but still store `progress_percent < 100`.
 *
 * Background: `updateEnrollment` used to let an admin set `status` and
 * `progress_percent` independently, so setting status to "completed" left the
 * old progress (often 0) in place. The overview/analytics screens average
 * `progress_percent`, so a finished course read as 0%. The controller now keeps
 * the two fields in sync; this repairs rows written before that fix.
 *
 * Detection: `status: "completed"` AND `progress_percent < 100`.
 * Repair: set `progress_percent = 100` and, if missing, stamp `completed_date`.
 *
 * SAFE BY DEFAULT: dry-run only. Pass `--apply` (or APPLY=true) to write.
 *   Dry run : node src/utils/fixCompletedProgress.js
 *   Apply   : node src/utils/fixCompletedProgress.js --apply
 */
const APPLY = process.argv.includes('--apply') || String(process.env.APPLY).toLowerCase() === 'true';

const run = async () => {
  await connectDB();

  const broken = await CourseEnrollment.find({
    status: 'completed',
    progress_percent: { $lt: 100 },
  }).lean();

  logger.info(
    `[fix-completed] Scanning complete. Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}. Found ${broken.length} mismatched enrollment(s).`
  );

  if (broken.length === 0) {
    logger.info('[fix-completed] No mismatched enrollments found. Nothing to do.');
    await disconnectDB();
    return;
  }

  for (const e of broken) {
    // eslint-disable-next-line no-console
    console.log(
      `  - ${e.user_name || e.user_email || e.user_id} - "${e.course_title || e.course_id}" (${e._id}): progress_percent ${e.progress_percent || 0} -> 100`
    );
  }

  if (!APPLY) {
    logger.info('[fix-completed] DRY-RUN complete. Re-run with --apply to write these changes.');
    await disconnectDB();
    return;
  }

  const now = new Date();
  let written = 0;
  for (const e of broken) {
    const update = { progress_percent: 100 };
    if (!e.completed_date) update.completed_date = now;
    await CourseEnrollment.updateOne({ _id: e._id }, { $set: update });
    written += 1;
  }
  logger.info(`[fix-completed] APPLIED. Updated ${written} enrollment(s).`);

  await disconnectDB();
};

run().catch(async (err) => {
  logger.error(`[fix-completed] Migration failed: ${err?.message}`);
  try {
    await disconnectDB();
  } catch {
    // ignore
  }
  process.exit(1);
});
