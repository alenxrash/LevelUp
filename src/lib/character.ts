export type Mood = 'thriving' | 'bulking' | 'leanTired' | 'scruffy';

export interface CharacterInputs {
  /** A workout was logged within the last 3 days. */
  workoutConsistent: boolean;
  /** Calorie intake has stayed near target. Defaults to true until the food diary tracks this. */
  nutritionOnTarget: boolean;
}

/**
 * The avatar's look is the intersection of two independent stats (design doc:
 * "Character system"). No quadrant is a failure state — it's just where the
 * character is right now, and it moves back toward thriving as behavior does.
 */
export function computeMood({ workoutConsistent, nutritionOnTarget }: CharacterInputs): Mood {
  if (workoutConsistent && nutritionOnTarget) return 'thriving';
  if (workoutConsistent && !nutritionOnTarget) return 'bulking';
  if (!workoutConsistent && nutritionOnTarget) return 'leanTired';
  return 'scruffy';
}

export const MOOD_LABEL: Record<Mood, string> = {
  thriving: 'Thriving',
  bulking: 'Bulking',
  leanTired: 'Lean but tired',
  scruffy: 'Scruffy',
};

export const MOOD_BLURB: Record<Mood, string> = {
  thriving: 'Toned up and full of energy.',
  bulking: 'Getting stronger, but the diet could use some love.',
  leanTired: 'Eating well, but training has slipped.',
  scruffy: "Hasn't trained or eaten well in a few days.",
};

const WORKOUT_CONSISTENCY_WINDOW_DAYS = 3;

/** True if `lastWorkoutDate` falls within the rolling consistency window, as of `now`. */
export function isWorkoutConsistent(lastWorkoutDate: Date | null, now: Date = new Date()): boolean {
  if (!lastWorkoutDate) return false;
  const msSinceLastWorkout = now.getTime() - lastWorkoutDate.getTime();
  const windowMs = WORKOUT_CONSISTENCY_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return msSinceLastWorkout <= windowMs;
}
