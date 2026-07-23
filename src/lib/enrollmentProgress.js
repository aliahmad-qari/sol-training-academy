/**
 * Effective progress for an enrollment.
 *
 * A "completed" enrollment is 100% by definition, even if its stored
 * progress_percent was left at 0 (e.g. status set manually via the admin
 * enrollment manager, or the backend total-topic count drifting above the
 * number of topics a student can actually finish). Averaging the raw
 * progress_percent otherwise makes a finished course read as 0%.
 */
export function effectiveProgress(enrollment) {
  if (!enrollment) return 0;
  if (enrollment.status === "completed") return 100;
  return enrollment.progress_percent || 0;
}

export default effectiveProgress;
