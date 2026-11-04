import { addDays, toDayKey } from './dates';
import { computeMood, isNutritionOnTarget, isWorkoutConsistent, NUTRITION_WINDOW_DAYS, type Mood } from './character';
import type { Macros } from './db';

/**
 * The date the workout streak is measured from: the last workout, or the day the
 * profile was created if there hasn't been one yet, so a new user starts in a
 * good mood and the usual 3-day window runs from sign-up.
 */
export function lastActiveDate(lastWorkoutIso: string | undefined, profileCreatedIso: string | undefined): Date | null {
  const iso = lastWorkoutIso ?? profileCreatedIso;
  return iso ? new Date(iso) : null;
}

/** `daily` must cover at least the last NUTRITION_WINDOW_DAYS days. */
export function moodFrom(lastWorkout: Date | null, daily: Map<string, Macros>, energyTarget: number, now = new Date()): Mood {
  const recentEnergy = Array.from(
    { length: NUTRITION_WINDOW_DAYS },
    (_, i) => daily.get(toDayKey(addDays(now, -i)))?.energy ?? 0
  );
  return computeMood({
    workoutConsistent: isWorkoutConsistent(lastWorkout, now),
    nutritionOnTarget: isNutritionOnTarget(recentEnergy, energyTarget),
  });
}
