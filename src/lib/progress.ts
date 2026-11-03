import { addDays, toDayKey } from './dates';

const XP_PER_WORKOUT = 50;
const XP_PER_MEAL = 10;
const XP_PER_LEVEL = 200;

export interface Level {
  level: number;
  xp: number;
  /** XP earned inside the current level. */
  xpIntoLevel: number;
  xpPerLevel: number;
}

export function computeLevel(workouts: number, meals: number): Level {
  const xp = workouts * XP_PER_WORKOUT + meals * XP_PER_MEAL;
  return {
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    xp,
    xpIntoLevel: xp % XP_PER_LEVEL,
    xpPerLevel: XP_PER_LEVEL,
  };
}

/**
 * Consecutive days with any logged activity, counting back from today. If today
 * is still empty the streak holds from yesterday, so it never reads as broken
 * before the day is over.
 */
export function computeStreak(activeDays: Set<string>, now = new Date()): number {
  let cursor = activeDays.has(toDayKey(now)) ? now : addDays(now, -1);
  let streak = 0;
  while (activeDays.has(toDayKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
