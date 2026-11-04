import { HOME_ACTIVITIES, type HomeActivity } from './sprite';
import type { Phase } from './scene';

/** What someone is plausibly doing at home at this time of day; higher weight = more likely. */
const WEIGHTS: Record<Phase, Record<HomeActivity, number>> = {
  dawn: { stretch: 4, phone: 2, reading: 2, cleaning: 2, gaming: 0.5 },
  day: { cleaning: 4, reading: 2, stretch: 2, phone: 2, gaming: 2 },
  dusk: { gaming: 4, phone: 3, reading: 2, cleaning: 1, stretch: 1 },
  night: { gaming: 4, phone: 3, reading: 3, cleaning: 0.3, stretch: 0.5 },
};

export function pickHomeActivity(phase: Phase, exclude?: HomeActivity): HomeActivity {
  const options = HOME_ACTIVITIES.filter((a) => a !== exclude);
  const total = options.reduce((sum, a) => sum + WEIGHTS[phase][a], 0);
  let roll = Math.random() * total;
  for (const a of options) {
    roll -= WEIGHTS[phase][a];
    if (roll <= 0) return a;
  }
  return options[options.length - 1];
}
