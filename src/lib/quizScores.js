const clampPercent = (value) => Math.min(100, Math.max(0, Math.round(value)));

export const quizAttemptPercent = (attempt) => {
  if (!attempt) return null;

  const explicitPercent = Number(attempt.score_percent);
  if (Number.isFinite(explicitPercent) && explicitPercent >= 0) {
    return clampPercent(explicitPercent);
  }

  const score = Number(attempt.score);
  if (!Number.isFinite(score)) return null;

  const total = Number(attempt.total_marks) || Number(attempt.total_questions) || 0;
  if (total > 0) return clampPercent((score / total) * 100);

  if (score >= 0 && score <= 100) return clampPercent(score);
  return null;
};

export const quizAttemptPercentOrZero = (attempt) => quizAttemptPercent(attempt) ?? 0;

export const averageQuizPercent = (attempts = []) => {
  const percents = attempts
    .map(quizAttemptPercent)
    .filter((percent) => percent !== null);

  if (!percents.length) return null;
  return clampPercent(percents.reduce((sum, percent) => sum + percent, 0) / percents.length);
};

export const bestQuizAttempt = (attempts = []) => {
  const validAttempts = attempts.filter((attempt) => quizAttemptPercent(attempt) !== null);
  if (!validAttempts.length) return attempts[0] || null;

  return validAttempts.reduce((best, attempt) => (
    quizAttemptPercent(attempt) > quizAttemptPercent(best) ? attempt : best
  ), validAttempts[0]);
};

export const quizScoreLabel = (attempt) => {
  const score = Number(attempt?.score);
  const total = Number(attempt?.total_marks) || Number(attempt?.total_questions) || 0;

  if (Number.isFinite(score) && total > 0) return `${score}/${total}`;
  if (Number.isFinite(score)) return String(score);
  return "-";
};