import { addDays, toDayKey } from './dates';
import { computeMood, isNutritionOnTarget, isWorkoutConsistent, NUTRITION_WINDOW_DAYS, type Mood } from './character';
import type { Macros } from './db';
import { DAILY_TARGETS } from './targets';

/** `daily` must cover at least the last NUTRITION_WINDOW_DAYS days. */
export function moodFrom(lastWorkout: Date | null, daily: Map<string, Macros>, now = new Date()): Mood {
  const recentEnergy = Array.from(
    { length: NUTRITION_WINDOW_DAYS },
    (_, i) => daily.get(toDayKey(addDays(now, -i)))?.energy ?? 0
  );
  return computeMood({
    workoutConsistent: isWorkoutConsistent(lastWorkout, now),
    nutritionOnTarget: isNutritionOnTarget(recentEnergy, DAILY_TARGETS.energy),
  });
}
