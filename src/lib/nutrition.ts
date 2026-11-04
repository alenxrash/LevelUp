export type Sex = 'female' | 'male';
export type Goal = 'cut' | 'maintain' | 'bulk';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';

export interface Profile {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
}

/** Standard Harris-Benedict-style multipliers applied to Mifflin-St Jeor BMR. */
export const ACTIVITY_LEVELS: { id: ActivityLevel; factor: number; title: string; hint: string }[] = [
  { id: 'sedentary', factor: 1.2, title: 'Mostly seated', hint: 'Desk job, little exercise' },
  { id: 'light', factor: 1.375, title: 'Lightly active', hint: 'Exercise 1-3 days a week' },
  { id: 'moderate', factor: 1.55, title: 'Moderately active', hint: 'Exercise 3-5 days a week' },
  { id: 'very', factor: 1.725, title: 'Very active', hint: 'Hard training 6-7 days a week' },
  { id: 'extra', factor: 1.9, title: 'Athlete / physical job', hint: 'Training twice a day or heavy labour' },
];

export const GOALS: { id: Goal; title: string; hint: string }[] = [
  { id: 'cut', title: 'Cut', hint: 'Lose fat, keep your muscle' },
  { id: 'maintain', title: 'Maintain', hint: 'Hold your weight, build fitness' },
  { id: 'bulk', title: 'Bulk', hint: 'Gain muscle with a small surplus' },
];

export function bmi(heightCm: number, weightKg: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export type BmiBand = 'underweight' | 'healthy' | 'overweight' | 'obese';

export function bmiBand(value: number): BmiBand {
  if (value < 18.5) return 'underweight';
  if (value < 25) return 'healthy';
  if (value < 30) return 'overweight';
  return 'obese';
}

export interface GoalAssessment {
  suggested: Goal;
  bmi: number;
  band: BmiBand;
  reason: string;
  /** Set when the chosen goal works against the numbers; shown as a caution, never blocks. */
  caution: (chosen: Goal) => string | null;
}

/**
 * BMI is a blunt tool (it can't see muscle), so this only suggests a goal and
 * the user stays in control: the caution never blocks a choice.
 */
export function assessGoal(heightCm: number, weightKg: number): GoalAssessment {
  const value = bmi(heightCm, weightKg);
  const band = bmiBand(value);
  const rounded = value.toFixed(1);

  const reasons: Record<BmiBand, { goal: Goal; reason: string }> = {
    underweight: {
      goal: 'bulk',
      reason: `Your BMI is ${rounded}, in the underweight range. Gaining weight with strength training is the healthiest direction.`,
    },
    healthy: {
      goal: 'maintain',
      reason: `Your BMI is ${rounded}, in the healthy range. Maintaining while you train is a solid base. Pick bulk if you want to add muscle, or cut if you want to get leaner.`,
    },
    overweight: {
      goal: 'cut',
      reason: `Your BMI is ${rounded}, in the overweight range. A steady cut will do the most for your health. If you're already muscular, BMI overstates this, so maintain is fine too.`,
    },
    obese: {
      goal: 'cut',
      reason: `Your BMI is ${rounded}, in the obese range. A steady cut is the best starting point. Check in with a doctor if you can.`,
    },
  };

  return {
    suggested: reasons[band].goal,
    bmi: value,
    band,
    reason: reasons[band].reason,
    caution: (chosen) => {
      if (band === 'underweight' && chosen === 'cut') return 'You are already in the underweight range. Cutting could harm your health.';
      if (band === 'obese' && chosen === 'bulk') return 'Gaining weight at this BMI works against your health. Consider maintain or cut.';
      return null;
    },
  };
}

/** Mifflin-St Jeor resting energy expenditure, kcal/day. */
export function bmr(p: Pick<Profile, 'sex' | 'age' | 'heightCm' | 'weightKg'>): number {
  return 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === 'male' ? 5 : -161);
}

export function activityFactor(level: ActivityLevel): number {
  return ACTIVITY_LEVELS.find((a) => a.id === level)?.factor ?? 1.2;
}

export interface Targets {
  /** kcal */
  energy: number;
  /** grams */
  protein: number;
  carbs: number;
  fat: number;
  bmr: number;
  tdee: number;
  /** Target minus maintenance, kcal/day. */
  adjustment: number;
  /** Set when the calorie floor stopped a deficit from going lower. */
  flooredAtMinimum: boolean;
}

const round = (n: number, step: number) => Math.round(n / step) * step;

/** Protein g per kg bodyweight by goal; higher on a cut to protect muscle (ISSN: up to ~2.4 g/kg in a deficit). */
const PROTEIN_PER_KG: Record<Goal, number> = { cut: 2.0, maintain: 1.6, bulk: 1.8 };

export function targetsFor(p: Profile): Targets {
  const rest = bmr(p);
  const tdee = rest * activityFactor(p.activity);

  let adjustment = 0;
  if (p.goal === 'cut') adjustment = -Math.min(750, Math.max(300, tdee * 0.2));
  if (p.goal === 'bulk') adjustment = Math.min(500, Math.max(200, tdee * 0.1));

  // Don't eat below a safe floor, however large the deficit would otherwise be.
  const floor = Math.max(p.sex === 'female' ? 1200 : 1500, rest);
  const raw = tdee + adjustment;
  const energy = round(Math.max(raw, p.goal === 'cut' ? floor : 0), 10);

  const protein = round(p.weightKg * PROTEIN_PER_KG[p.goal], 5);
  const fat = round(Math.max((energy * 0.25) / 9, p.weightKg * 0.6), 5);
  const carbs = Math.max(0, round((energy - protein * 4 - fat * 9) / 4, 5));

  return {
    energy,
    protein,
    carbs,
    fat,
    bmr: round(rest, 10),
    tdee: round(tdee, 10),
    adjustment: energy - round(tdee, 10),
    flooredAtMinimum: p.goal === 'cut' && raw < floor,
  };
}

/** Used until a profile exists, so nothing divides by zero. */
export const FALLBACK_TARGETS: Pick<Targets, 'energy' | 'protein' | 'carbs' | 'fat'> = {
  energy: 2200,
  protein: 120,
  carbs: 250,
  fat: 70,
};
