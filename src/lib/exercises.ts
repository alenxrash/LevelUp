import type { Routine } from './sprite';

export type Muscle = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio' | 'Other';

export const MUSCLES: Muscle[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

export interface Exercise {
  name: string;
  muscle: Muscle;
}

const e = (muscle: Muscle, ...names: string[]): Exercise[] => names.map((name) => ({ name, muscle }));

export const EXERCISES: Exercise[] = [
  ...e('Chest', 'Bench Press (Barbell)', 'Incline Bench Press (Dumbbell)', 'Chest Fly (Dumbbell)', 'Push Up', 'Chest Dip'),
  ...e('Back', 'Deadlift (Barbell)', 'Pull Up', 'Lat Pulldown', 'Bent Over Row (Barbell)', 'Seated Cable Row', 'T-Bar Row'),
  ...e('Legs', 'Squat (Barbell)', 'Leg Press', 'Romanian Deadlift', 'Lunge (Dumbbell)', 'Leg Extension', 'Leg Curl', 'Calf Raise', 'Hip Thrust'),
  ...e('Shoulders', 'Overhead Press (Barbell)', 'Shoulder Press (Dumbbell)', 'Lateral Raise (Dumbbell)', 'Face Pull', 'Rear Delt Fly'),
  ...e('Arms', 'Bicep Curl (Dumbbell)', 'Hammer Curl', 'Barbell Curl', 'Triceps Pushdown', 'Skull Crusher', 'Triceps Dip'),
  ...e('Core', 'Plank', 'Crunch', 'Hanging Leg Raise', 'Russian Twist', 'Cable Crunch'),
  ...e('Cardio', 'Running', 'Cycling', 'Rowing Machine', 'Jump Rope', 'Jumping Jacks'),
].sort((a, b) => a.name.localeCompare(b.name));

const byName = new Map(EXERCISES.map((x) => [x.name.toLowerCase(), x]));

export function findExercise(name: string): Exercise | undefined {
  return byName.get(name.trim().toLowerCase());
}

/** Which routine the character performs for an exercise; unknown ones fall back on name keywords. */
export function routineFor(name: string): Routine {
  const n = name.toLowerCase();
  if (/squat|lunge|leg |calf|deadlift|glute|hip thrust/.test(n)) return 'squat';
  if (/curl|bicep|hammer/.test(n)) return 'curl';
  if (/row|pull|lat |chin|face pull/.test(n)) return 'pull';
  if (/press|push|bench|dip|tricep|shoulder|raise|fly|skull/.test(n)) return 'press';
  return 'jacks';
}
