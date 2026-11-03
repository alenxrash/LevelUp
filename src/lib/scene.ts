import type { Mood } from './character';

/** Logical pixel grid of the room; the character sprite is drawn on the same grid. */
export const SCENE_W = 96;
export const SCENE_H = 100;
export const CHAR_X = 31;
/** Sprite top row; the sprite's feet row (36) lands on y = 78. */
export const CHAR_Y = 42;

export interface SceneRect {
  x: number;
  y: number;
  w: number;
  h: number;
  c: string;
  o?: number;
}

class Painter {
  rects: SceneRect[] = [];

  r(x: number, y: number, w: number, h: number, c: string, o?: number) {
    this.rects.push({ x, y, w, h, c, o });
  }

  /** Filled ellipse built from one-pixel rows, so edges stay stair-stepped. */
  ellipse(cx: number, cy: number, rx: number, ry: number, c: string, o?: number) {
    for (let dy = -ry; dy <= ry; dy++) {
      const half = Math.round(rx * Math.sqrt(1 - (dy / (ry + 0.5)) ** 2));
      this.r(cx - half, cy + dy, half * 2, 1, c, o);
    }
  }
}

const WIRE_Y = (x: number) => 5 + Math.round(3 * Math.sin((Math.PI * x) / (SCENE_W - 1)));

function wall(p: Painter) {
  p.r(0, 0, SCENE_W, 60, '#2a2147');
  for (let x = 0; x < SCENE_W; x += 8) p.r(x, 0, 4, 60, '#2e2551');
  p.r(0, 0, SCENE_W, 3, '#1c1537');
  p.r(0, 3, SCENE_W, 2, '#1c1537', 0.5);
  p.r(0, 56, SCENE_W, 4, '#1d1634');
  p.r(0, 56, SCENE_W, 1, '#3a2f63');
}

function floor(p: Painter) {
  p.r(0, 60, SCENE_W, SCENE_H - 60, '#6a4538');
  let row = 0;
  for (let y = 60; y < SCENE_H; y += 7) {
    p.r(0, y, SCENE_W, 1, '#54352c');
    for (let x = (row % 2) * 12; x < SCENE_W; x += 24) p.r(x, y, 1, 7, '#54352c');
    row += 1;
  }
  p.r(0, 60, SCENE_W, 2, '#3b2420', 0.6);
}

function windowAndCurtains(p: Painter) {
  p.r(5, 10, 24, 29, '#5c3a28');
  p.r(6, 11, 22, 9, '#14103a');
  p.r(6, 20, 22, 9, '#1d1850');
  p.r(6, 29, 22, 9, '#2a2266');
  for (let x = 6; x < 28; x += 2) {
    p.r(x, 19, 1, 1, '#1d1850');
    p.r(x + 1, 20, 1, 1, '#14103a');
    p.r(x, 28, 1, 1, '#2a2266');
    p.r(x + 1, 29, 1, 1, '#1d1850');
  }
  p.r(21, 15, 3, 1, '#f6e8c0');
  p.r(20, 16, 5, 3, '#f6e8c0');
  p.r(21, 19, 3, 1, '#f6e8c0');
  p.r(21, 17, 1, 1, '#e2d0a0');
  p.r(22, 18, 1, 1, '#e2d0a0');
  for (const [x, y, c] of [[9, 14, '#fff'], [14, 13, '#ffd98a'], [11, 22, '#fff'], [18, 26, '#ffd98a'], [25, 24, '#fff'], [8, 27, '#fff'], [15, 17, '#fff'], [26, 13, '#ffd98a']] as const) {
    p.r(x, y, 1, 1, c, 0.8);
  }
  for (const [x, w, h] of [[6, 3, 6], [9, 4, 9], [13, 3, 5], [16, 5, 11], [21, 3, 7], [24, 4, 9]] as const) {
    p.r(x, 38 - h, w, h, '#0d0a26');
  }
  for (const [x, y, c] of [[10, 31, '#ffd98a'], [11, 34, '#ffb86b'], [17, 29, '#ffd98a'], [19, 33, '#ffb86b'], [18, 35, '#ffd98a'], [22, 33, '#ffd98a'], [25, 31, '#ffb86b'], [26, 35, '#ffd98a'], [7, 34, '#ffb86b']] as const) {
    p.r(x, y, 1, 1, c);
  }
  p.r(16, 11, 2, 27, '#6e472e');
  p.r(6, 24, 22, 2, '#6e472e');
  p.r(4, 38, 26, 2, '#a06a44');
  p.r(4, 40, 26, 1, '#6e472e');
  p.r(22, 35, 4, 3, '#c1673e');
  p.r(22, 32, 1, 3, '#6fbf73');
  p.r(24, 30, 1, 5, '#4f9a5a');
  p.r(25, 33, 1, 2, '#6fbf73');
  p.r(3, 9, 28, 1, '#3a2a20');
  p.r(2, 8, 2, 3, '#a06a44');
  p.r(30, 8, 2, 3, '#a06a44');
  p.r(5, 10, 5, 29, '#8c3a5a');
  p.r(7, 10, 1, 29, '#6e2a46');
  p.r(24, 10, 5, 29, '#8c3a5a');
  p.r(26, 10, 1, 29, '#6e2a46');
  for (let i = 0; i < 12; i++) p.r(32 + Math.floor(i / 2) + 0, 62 + i, 14 + (i % 2), 1, '#9db4ff', 0.06);
}

function posters(p: Painter) {
  p.r(38, 13, 14, 17, '#e8d5b0');
  p.r(39, 14, 12, 15, '#241b45');
  p.r(39, 14, 12, 5, '#f2788f');
  p.r(39, 19, 12, 4, '#ffb86b');
  p.r(43, 18, 4, 2, '#ffe3a0');
  p.r(39, 23, 12, 6, '#3a2f63');
  p.r(40, 22, 3, 1, '#3a2f63');
  p.r(41, 21, 1, 1, '#3a2f63');
  p.r(46, 22, 4, 1, '#3a2f63');
  p.r(47, 21, 2, 1, '#3a2f63');
  p.r(43, 12, 4, 1, '#6fd6c3');
  p.r(56, 17, 9, 12, '#e8d5b0');
  p.r(57, 18, 7, 10, '#1d1850');
  p.r(59, 20, 3, 3, '#f6e8c0');
  p.r(58, 25, 1, 1, '#fff', 0.8);
  p.r(62, 26, 1, 1, '#ffd98a');
  p.r(59, 16, 4, 1, '#f2788f');
}

function shelf(p: Painter) {
  p.r(67, 31, 28, 2, '#7a4f34');
  p.r(67, 33, 28, 1, '#4a2f20');
  p.r(70, 34, 1, 3, '#4a2f20');
  p.r(91, 34, 1, 3, '#4a2f20');
  for (const [x, w, h, c] of [[68, 2, 8, '#f2788f'], [70, 2, 6, '#6fd6c3'], [72, 3, 9, '#a99bff'], [75, 2, 7, '#ffb86b'], [77, 2, 5, '#8fd694'], [79, 3, 8, '#e8697d']] as const) {
    p.r(x, 31 - h, w, h, c);
    p.r(x, 31 - h, w, 1, '#ffffff', 0.18);
  }
  p.r(84, 26, 3, 5, '#e8d5b0');
  p.r(89, 27, 4, 4, '#c1673e');
  p.r(88, 22, 2, 5, '#6fbf73');
  p.r(90, 20, 2, 7, '#4f9a5a');
  p.r(92, 23, 2, 4, '#6fbf73');
}

function desk(p: Painter) {
  p.r(66, 53, 30, 2, '#8a5a3a');
  p.r(66, 53, 30, 1, '#a8744c');
  p.r(67, 55, 28, 3, '#6e472e');
  p.r(68, 58, 2, 22, '#5c3a28');
  p.r(92, 58, 2, 22, '#5c3a28');
  p.r(68, 51, 12, 2, '#9a93c4');
  p.r(69, 41, 10, 10, '#4a4680');
  p.r(70, 42, 8, 8, '#2b2a55');
  p.r(71, 44, 5, 1, '#6fd6c3');
  p.r(71, 46, 6, 1, '#a99bff');
  p.r(71, 48, 3, 1, '#ffb86b');
  p.r(68, 53, 12, 1, '#6fd6c3', 0.2);
  p.r(83, 49, 4, 4, '#e8d5b0');
  p.r(87, 50, 1, 2, '#e8d5b0');
  p.r(84, 49, 2, 1, '#6b3f2a');
  p.r(88, 51, 5, 2, '#3a2f63');
  p.r(90, 42, 1, 9, '#3a2f63');
  p.r(87, 41, 4, 1, '#3a2f63');
  p.r(86, 38, 7, 3, '#ffb86b');
  p.r(86, 38, 7, 1, '#ffd9a8');
}

function rugAndShadow(p: Painter) {
  p.ellipse(47, 76, 25, 6, '#8a3a52');
  p.ellipse(47, 76, 23, 5, '#b9556c');
  p.ellipse(47, 76, 15, 3, '#d97a8e');
  p.ellipse(47, 76, 13, 2, '#b9556c');
  p.r(36, 79, 22, 2, '#000000', 0.28);
  p.r(38, 81, 18, 1, '#000000', 0.2);
}

function catCushion(p: Painter) {
  p.r(5, 77, 19, 4, '#6a5bb0');
  p.r(6, 76, 17, 1, '#8a7bd0');
  p.r(5, 81, 19, 1, '#000000', 0.25);
}

function clutter(p: Painter, mood: Mood) {
  if (mood === 'scruffy') {
    p.r(70, 80, 13, 5, '#d9b27a');
    p.r(70, 80, 13, 1, '#e8c48a');
    p.r(72, 81, 9, 3, '#c76b4a');
    p.r(74, 82, 1, 1, '#f2d27a');
    p.r(78, 82, 1, 1, '#f2d27a');
    p.r(86, 81, 3, 4, '#e8d5b0');
    p.r(86, 81, 3, 1, '#6b3f2a');
    p.r(57, 83, 4, 2, '#a99bff');
    p.r(60, 84, 3, 2, '#a99bff');
  } else if (mood === 'bulking') {
    p.r(72, 80, 7, 3, '#e8d5b0');
    p.r(73, 79, 5, 1, '#ffb86b');
  } else if (mood === 'leanTired') {
    p.r(86, 81, 3, 4, '#e8d5b0');
    p.r(86, 81, 3, 1, '#6b3f2a');
  }
}

const DIM: Record<Mood, number> = { thriving: 0, bulking: 0.08, leanTired: 0.2, scruffy: 0.28 };

const staticCache = new Map<Mood, SceneRect[]>();

/** Everything that never animates; rebuilt only when the mood (lighting and clutter) changes. */
export function buildStaticScene(mood: Mood): SceneRect[] {
  const cached = staticCache.get(mood);
  if (cached) return cached;

  const p = new Painter();
  wall(p);
  floor(p);
  for (let x = 0; x < SCENE_W; x++) p.r(x, WIRE_Y(x), 1, 1, '#1a1334');
  windowAndCurtains(p);
  posters(p);
  shelf(p);
  desk(p);
  rugAndShadow(p);
  catCushion(p);
  clutter(p, mood);

  if (DIM[mood] > 0) p.r(0, 0, SCENE_W, SCENE_H, '#0a0618', DIM[mood]);

  const glow = mood === 'thriving' ? 0.06 : mood === 'bulking' ? 0.05 : 0.035;
  for (let k = 0; k < 5; k++) p.ellipse(90, 46, 9 + k * 5, 7 + k * 4, '#ffb86b', glow);

  staticCache.set(mood, p.rects);
  return p.rects;
}

const BULBS = ['#ffb86b', '#f2788f', '#6fd6c3', '#a99bff'];

/** Parts that move: string lights, candle, steam, laptop cursor, sleeping cat. */
export function buildDynamicScene(tick: number): SceneRect[] {
  const p = new Painter();

  for (let i = 0; i < 10; i++) {
    const x = 6 + i * 9;
    const y = WIRE_Y(x) + 1;
    const on = (tick + i) % 4 !== 0;
    const c = BULBS[i % BULBS.length];
    p.r(x - 1, y, 4, 4, c, on ? 0.2 : 0.05);
    p.r(x, y + 1, 2, 2, c, on ? 1 : 0.4);
  }

  p.r(85, 24, 1, 2, '#ffd98a');
  if (tick % 2 === 0) p.r(85, 23, 1, 1, '#ffb86b');
  p.r(85, 25, 1, 1, '#fff', 0.7);

  for (let i = 0; i < 3; i++) {
    p.r(84 + ((tick + i) % 2), 47 - i * 2, 1, 1, '#ffffff', 0.55 - i * 0.15);
  }

  if (tick % 4 < 2) p.r(76, 48, 1, 1, '#ffffff', 0.9);

  const breathe = Math.floor(tick / 2) % 2;
  p.r(10, 72 - breathe, 10, 5 + breathe, '#d98d4c');
  p.r(8, 73, 5, 4, '#d98d4c');
  p.r(8, 72, 1, 1, '#d98d4c');
  p.r(12, 72, 1, 1, '#d98d4c');
  p.r(13, 72 - breathe, 1, 3, '#b66c33');
  p.r(16, 72 - breathe, 1, 3, '#b66c33');
  p.r(18, 73, 1, 3, '#b66c33');
  p.r(9, 75, 2, 1, '#2a1d3f');
  p.r(9, 76, 1, 1, '#f2a0a8');
  if (Math.floor(tick / 4) % 2 === 0) p.r(20, 76, 4, 1, '#d98d4c');
  else p.r(20, 75, 3, 1, '#d98d4c');
  p.r(22, 76, 2, 1, '#b66c33');

  const z = tick % 6;
  p.r(10 + (z > 2 ? 1 : 0), 68 - Math.floor(z / 2), 2, 1, '#a99bff', 0.9);
  p.r(13 + (z > 2 ? 1 : 0), 65 - Math.floor(z / 3), 2, 1, '#a99bff', 0.6);

  return p.rects;
}
