import type { Mood } from '../character';
import { Painter, SCENE_H, SCENE_W, type DynamicLayers, type SceneRect } from './painter';
import type { Phase } from './time';

const GLYPHS: Record<string, string[]> = {
  L: ['#..', '#..', '#..', '#..', '###'],
  E: ['###', '#..', '##.', '#..', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  P: ['###', '#.#', '###', '#..', '#..'],
};

const SIGN_TEXT = 'LEVEL UP';
const SIGN_X = 33;
const SIGN_Y = 22;

function signGlyphs(p: Painter, color: string, o?: number) {
  let x = SIGN_X;
  for (const ch of SIGN_TEXT) {
    if (ch === ' ') {
      x += 3;
      continue;
    }
    p.art(GLYPHS[ch], x, SIGN_Y, color, o);
    x += 4;
  }
}

function dumbbell(p: Painter, x: number, y: number, plate: string) {
  p.r(x, y - 2, 1, 3, plate);
  p.r(x + 1, y - 1, 3, 1, '#8a93a8');
  p.r(x + 4, y - 2, 1, 3, plate);
}

function kettlebell(p: Painter, x: number, y: number) {
  p.r(x + 1, y, 4, 1, '#3a4156');
  p.r(x, y + 1, 1, 2, '#3a4156');
  p.r(x + 5, y + 1, 1, 2, '#3a4156');
  p.r(x, y + 3, 6, 5, '#4a5570');
  p.r(x + 1, y + 4, 1, 2, '#6a7488');
}

const DIM: Record<Mood, number> = { thriving: 0, bulking: 0.04, leanTired: 0.1, scruffy: 0.14 };
const PHASE_DIM: Record<Phase, number> = { day: 0, dawn: 0.04, dusk: 0.08, night: 0.14 };

const staticCache = new Map<string, SceneRect[]>();

export function buildGymStatic(mood: Mood, phase: Phase): SceneRect[] {
  const key = `${mood}:${phase}`;
  const cached = staticCache.get(key);
  if (cached) return cached;

  const p = new Painter();

  // back wall: painted concrete blocks
  p.r(0, 0, SCENE_W, 60, '#232c3d');
  for (let row = 0; row * 8 < 56; row++) {
    const y = row * 8;
    p.r(0, y, SCENE_W, 1, '#1c2433');
    for (let x = (row % 2) * 8; x < SCENE_W; x += 16) p.r(x, y, 1, 8, '#1c2433');
  }
  p.r(0, 0, SCENE_W, 4, '#151b27');
  p.r(0, 56, SCENE_W, 4, '#171d2a');
  p.r(0, 56, SCENE_W, 1, '#33405a');

  // ceiling strip lights
  for (const x of [8, 66]) {
    p.ellipse(x + 11, 8, 15, 6, '#fff6d0', 0.05);
    p.r(x, 2, 22, 2, '#fff6d0');
  }

  // mirror
  p.r(5, 15, 26, 34, '#5b6d88');
  p.r(6, 16, 24, 32, '#6f93b3');
  for (let y = 16; y < 48; y++) {
    p.r(8 + Math.floor((y - 16) / 2), y, 4, 1, '#a8c6dc', 0.5);
    p.r(18 + Math.floor((y - 16) / 2), y, 2, 1, '#a8c6dc', 0.35);
  }
  p.r(6, 16, 24, 1, '#ffffff', 0.25);

  // clock face (hands are dynamic)
  p.ellipse(79, 28, 5, 5, '#8a93a8');
  p.ellipse(79, 28, 4, 4, '#e8e4f0');
  for (const [x, y] of [[79, 24], [79, 32], [75, 28], [83, 28]] as const) p.r(x, y, 1, 1, '#2a3347');

  // squat rack with a loaded barbell
  p.r(66, 22, 3, 38, '#6a7488');
  p.r(90, 22, 3, 38, '#6a7488');
  p.r(66, 22, 27, 2, '#8a93a8');
  p.r(66, 46, 27, 1, '#4a5570');
  p.r(66, 34, 3, 2, '#4a5570');
  p.r(90, 34, 3, 2, '#4a5570');
  p.r(60, 34, 34, 1, '#c8d0e0');
  p.r(60, 29, 3, 11, '#d94a5c');
  p.r(63, 31, 2, 7, '#ffb86b');
  p.r(91, 29, 3, 11, '#d94a5c');
  p.r(89, 31, 2, 7, '#ffb86b');

  // dumbbell rack
  p.r(6, 57, 1, 22, '#3a4156');
  p.r(27, 57, 1, 22, '#3a4156');
  p.r(5, 57, 24, 2, '#4a5570');
  p.r(5, 67, 24, 2, '#4a5570');
  for (let i = 0; i < 4; i++) {
    dumbbell(p, 7 + i * 5, 55, '#2a2f42');
    dumbbell(p, 7 + i * 5, 65, i % 2 ? '#e8697d' : '#6fd6c3');
  }

  // rubber floor
  p.r(0, 60, SCENE_W, SCENE_H - 60, '#2b2f3c');
  for (let x = 0; x < SCENE_W; x += 12) p.r(x, 60, 1, SCENE_H - 60, '#242836');
  for (let y = 70; y < SCENE_H; y += 10) p.r(0, y, SCENE_W, 1, '#242836');
  p.r(0, 60, SCENE_W, 2, '#000000', 0.3);
  p.ellipse(48, 78, 30, 8, '#fff6d0', 0.04);

  // yoga mat under the character
  p.r(29, 74, 38, 10, '#a8405a');
  p.r(29, 74, 38, 1, '#d9667d');
  p.r(29, 83, 38, 1, '#7a2e44');
  p.r(36, 79, 22, 2, '#000000', 0.28);
  p.r(38, 81, 18, 1, '#000000', 0.2);

  // bench, kettlebells, plates, bottle, towel
  p.r(68, 66, 26, 4, '#d94a5c');
  p.r(68, 66, 26, 1, '#f07a88');
  p.r(71, 70, 2, 8, '#8a93a8');
  p.r(89, 70, 2, 8, '#8a93a8');
  p.r(86, 64, 6, 2, '#f4e4c1');
  kettlebell(p, 72, 82);
  kettlebell(p, 80, 82);
  p.r(5, 86, 10, 2, '#3a4156');
  p.r(6, 84, 8, 2, '#4a5570');
  p.r(7, 82, 6, 2, '#d94a5c');
  p.r(22, 80, 3, 6, '#6fd6c3');
  p.r(22, 79, 3, 1, '#f4e4c1');

  // dark neon tubes (the lit glyphs are dynamic)
  signGlyphs(p, '#5a2a45');

  const dim = DIM[mood] + PHASE_DIM[phase];
  if (dim > 0) p.r(0, 0, SCENE_W, SCENE_H, '#0a0618', dim);

  staticCache.set(key, p.rects);
  return p.rects;
}

/** Neon flicker and a clock showing the real time. */
export function buildGymDynamic(tick: number, now: Date): DynamicLayers {
  const p = new Painter();

  const on = tick % 9 !== 4;
  p.r(SIGN_X - 2, SIGN_Y - 2, 32, 9, '#ff6b9d', on ? 0.12 : 0.03);
  signGlyphs(p, '#ff6b9d', on ? 1 : 0.35);
  signGlyphs(p, '#ffd0e0', on ? 0.35 : 0);

  const minute = now.getMinutes();
  const hour = (now.getHours() % 12) + minute / 60;
  const mAngle = (minute / 60) * 2 * Math.PI;
  const hAngle = (hour / 12) * 2 * Math.PI;
  p.line(79, 28, Math.round(79 + 4 * Math.sin(mAngle)), Math.round(28 - 4 * Math.cos(mAngle)), '#2a3347');
  p.line(79, 28, Math.round(79 + 2.5 * Math.sin(hAngle)), Math.round(28 - 2.5 * Math.cos(hAngle)), '#d94a5c');

  return { back: p.rects, front: [] };
}
