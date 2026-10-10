/**
 * Shared helpers for per-category scoring limits.
 *
 * The database enforces these too (trigger enforce_score_category_limit on
 * public.scores); the UI just mirrors the same rules so chairs get a clear
 * error before submitting instead of a server rejection.
 */

/** Sum of a delegate's points within one category, regardless of id type. */
export function categoryTotal(scores, delegateId, category) {
  const key = String(delegateId)
  return scores
    .filter((s) => String(s.delegate_id) === key && s.category === category)
    .reduce((sum, s) => sum + (Number(s.points) || 0), 0)
}

/**
 * How many more points a delegate may earn in a category before hitting
 * its cap. Returns Infinity when the category has no cap.
 */
export function remainingPoints(maxPoints, scores, delegateId, category) {
  if (maxPoints == null || Number.isNaN(Number(maxPoints))) return Infinity
  return Math.max(0, Number(maxPoints) - categoryTotal(scores, delegateId, category))
}