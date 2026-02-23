/**
 * Calculate XP earned for an activity with multipliers.
 */
export function calculateXP(baseXP, { sleepMultiplier = 1, criticalHit = false, criticalMultiplier = 2 }) {
  let xp = baseXP;
  if (sleepMultiplier > 1) xp *= sleepMultiplier;
  if (criticalHit) xp *= criticalMultiplier;
  return Math.round(xp * 10) / 10;
}

/**
 * Roll for critical hit.
 */
export function rollCriticalHit(chance = 0.1) {
  return Math.random() < chance;
}

/**
 * Format XP value for display.
 */
export function formatXP(xp) {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
  return String(Math.round(xp));
}

/**
 * Calculate level progress percentage.
 */
export function levelProgress(currentWeeklyXP, targetWeeklyXP) {
  return Math.min(100, Math.round((currentWeeklyXP / targetWeeklyXP) * 100));
}
