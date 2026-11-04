import type { Mood } from '../character';
import type { Activity } from '../sprite';
import { buildGymDynamic, buildGymStatic } from './gym';
import { buildHomeDynamic, buildHomeStatic } from './home';
import type { DynamicLayers, SceneRect } from './painter';
import type { Phase } from './time';

export { CHAR_X, CHAR_Y, SCENE_H, SCENE_W } from './painter';
export type { DynamicLayers, SceneRect } from './painter';
export { phaseFor, PHASE_LABEL, type Phase } from './time';

export type SceneKind = 'home' | 'gym';

export function buildStaticScene(kind: SceneKind, mood: Mood, phase: Phase): SceneRect[] {
  return kind === 'gym' ? buildGymStatic(mood, phase) : buildHomeStatic(mood, phase);
}

export function buildDynamicScene(kind: SceneKind, tick: number, phase: Phase, activity: Activity, now: Date): DynamicLayers {
  return kind === 'gym' ? buildGymDynamic(tick, now) : buildHomeDynamic(tick, phase, activity);
}
