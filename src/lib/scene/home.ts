import type { Mood } from '../character';
import type { Activity } from '../sprite';
import { Painter, SCENE_H, SCENE_W, type DynamicLayers, type SceneRect } from './painter';
import { PHASES, type Phase, type PhasePalette } from './time';

const WIRE_Y = (x: number) => 5 + Math.round(3 * Math.sin((Math.PI * x) / (SCENE_W - 1)));

function wall(p: Painter, pal: PhasePalette) {
  p.r(0, 0, SCENE_W, 60, pal.wall);
  for (let x = 0; x < SCENE_W; x += 8) p.r(x, 0, 4, 60, pal.stripe);
  p.r(0, 0, SCENE_W, 3, pal.topShade);
  p.r(0, 3, SCENE_W, 2, pal.topShade, 0.5);
  p.r(0, 56, SCENE_W, 4, pal.base1);
  p.r(0, 56, SCENE_W, 1, pal.base2);
}

function floor(p: Painter, pal: PhasePalette) {
  p.r(0, 60, SCENE_W, SCENE_H - 60, pal.floor);
  let row = 0;
  for (let y = 60; y < SCENE_H; y += 7) {
    p.r(0, y, SCENE_W, 1, pal.floorLine);
    for (let x = (row % 2) * 12; x < SCENE_W; x += 24) p.r(x, y, 1, 7, pal.floorLine);
    row += 1;
  }
  p.r(0, 60, SCENE_W, 2, '#000000', 0.2);
}

function windowAndCurtains(p: Painter, pal: PhasePalette, phase: Phase) {
  p.r(5, 10, 24, 29, '#5c3a28');
  p.r(6, 11, 22, 9, pal.sky[0]);
  p.r(6, 20, 22, 9, pal.sky[1]);
  p.r(6, 29, 22, 9, pal.sky[2]);
  for (let x = 6; x < 28; x += 2) {
    p.r(x, 19, 1, 1, pal.sky[1]);
    p.r(x + 1, 20, 1, 1, pal.sky[0]);
    p.r(x, 28, 1, 1, pal.sky[2]);
    p.r(x + 1, 29, 1, 1, pal.sky[1]);
  }

  if (pal.moon) {
    p.r(21, 15, 3, 1, '#f6e8c0');
    p.r(20, 16, 5, 3, '#f6e8c0');
    p.r(21, 19, 3, 1, '#f6e8c0');
    p.r(21, 17, 1, 1, '#e2d0a0');
    p.r(22, 18, 1, 1, '#e2d0a0');
  }
  if (pal.stars) {
    for (const [x, y, c] of [[9, 14, '#fff'], [14, 13, '#ffd98a'], [11, 22, '#fff'], [18, 26, '#ffd98a'], [25, 24, '#fff'], [8, 27, '#fff'], [15, 17, '#fff'], [26, 13, '#ffd98a']] as const) {
      p.r(x, y, 1, 1, c, 0.8);
    }
  }
  if (pal.sun === 'high') {
    p.ellipse(22, 17, 6, 6, '#fff2b0', 0.18);
    p.ellipse(22, 17, 3, 3, '#ffe27a');
    p.ellipse(11, 15, 4, 1, '#ffffff', 0.9);
    p.ellipse(24, 26, 3, 1, '#ffffff', 0.85);
  } else if (pal.sun === 'low') {
    const sx = phase === 'dawn' ? 13 : 22;
    p.ellipse(sx, 33, 7, 5, '#ffe0a0', 0.2);
    p.ellipse(sx, 33, 4, 3, phase === 'dawn' ? '#ffd27a' : '#ffcf70');
  }

  for (const [x, w, h] of [[6, 3, 6], [9, 4, 9], [13, 3, 5], [16, 5, 11], [21, 3, 7], [24, 4, 9]] as const) {
    p.r(x, 38 - h, w, h, pal.skyline);
  }
  if (pal.litWindows) {
    for (const [x, y, c] of [[10, 31, '#ffd98a'], [11, 34, '#ffb86b'], [17, 29, '#ffd98a'], [19, 33, '#ffb86b'], [18, 35, '#ffd98a'], [22, 33, '#ffd98a'], [25, 31, '#ffb86b'], [26, 35, '#ffd98a'], [7, 34, '#ffb86b']] as const) {
      p.r(x, y, 1, 1, c);
    }
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
  p.r(5, 10, 5, 29, pal.curtain[0]);
  p.r(7, 10, 1, 29, pal.curtain[1]);
  p.r(24, 10, 5, 29, pal.curtain[0]);
  p.r(26, 10, 1, 29, pal.curtain[1]);
  for (let i = 0; i < 12; i++) p.r(32 + Math.floor(i / 2), 62 + i, 14 + (i % 2), 1, pal.spill.c, pal.spill.o);
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

/** Drawn after the rug so it reads as sitting in front of the wall, with the character seated on top of it. */
function couch(p: Painter) {
  p.r(29, 54, 36, 14, '#5b6aa8');
  p.r(29, 54, 36, 2, '#7d8bc8');
  p.r(29, 66, 36, 2, '#46548a');
  p.r(26, 58, 5, 18, '#4d5a96');
  p.r(26, 58, 5, 2, '#7d8bc8');
  p.r(63, 58, 5, 18, '#4d5a96');
  p.r(63, 58, 5, 2, '#7d8bc8');
  p.r(31, 68, 32, 6, '#6a7ac0');
  p.r(31, 68, 32, 1, '#8e9ce0');
  p.r(46, 69, 1, 5, '#566498');
  p.r(30, 74, 34, 3, '#46548a');
  p.r(29, 77, 3, 2, '#2a2147');
  p.r(62, 77, 3, 2, '#2a2147');
  p.r(32, 60, 6, 6, '#f2788f');
  p.r(32, 60, 6, 1, '#ffb4c2');
  p.r(34, 62, 2, 2, '#c95a73');
  p.r(60, 58, 6, 9, '#f4e4c1');
  p.r(60, 61, 6, 1, '#e8c48a');
  p.r(60, 64, 6, 1, '#e8c48a');
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

const staticCache = new Map<string, SceneRect[]>();

/** Everything that never animates; rebuilt only when the mood or the time-of-day phase changes. */
export function buildHomeStatic(mood: Mood, phase: Phase): SceneRect[] {
  const key = `${mood}:${phase}`;
  const cached = staticCache.get(key);
  if (cached) return cached;

  const pal = PHASES[phase];
  const p = new Painter();
  wall(p, pal);
  floor(p, pal);
  for (let x = 0; x < SCENE_W; x++) p.r(x, WIRE_Y(x), 1, 1, '#1a1334');
  windowAndCurtains(p, pal, phase);
  posters(p);
  shelf(p);
  desk(p);
  rugAndShadow(p);
  couch(p);
  catCushion(p);
  clutter(p, mood);

  if (pal.tint) p.r(0, 0, SCENE_W, SCENE_H, pal.tint.c, pal.tint.o);
  if (DIM[mood] > 0) p.r(0, 0, SCENE_W, SCENE_H, '#0a0618', DIM[mood]);

  const glow = (mood === 'thriving' ? 0.06 : mood === 'bulking' ? 0.05 : 0.035) * pal.lamp;
  if (glow > 0) for (let k = 0; k < 5; k++) p.ellipse(90, 46, 9 + k * 5, 7 + k * 4, '#ffb86b', glow);

  staticCache.set(key, p.rects);
  return p.rects;
}

const BULBS = ['#ffb86b', '#f2788f', '#6fd6c3', '#a99bff'];

function sweepOffset(tick: number): number {
  return [0, 3, 6, 3, 0, -3, -6, -3][tick % 8];
}

/** Props the character holds or uses, drawn in front of the character. */
function activityProps(p: Painter, activity: Activity, tick: number) {
  switch (activity) {
    case 'phone': {
      p.r(44, 56, 6, 7, '#6fd6c3', 0.07);
      p.r(46, 59, 2, 4, '#1a1334');
      p.r(46, 60, 2, 2, tick % 2 ? '#6fd6c3' : '#a99bff');
      break;
    }
    case 'gaming': {
      p.r(40, 54, 14, 10, '#7fb6e8', 0.05 + (tick % 3) * 0.02);
      p.r(42, 60, 10, 4, '#1a1334');
      p.r(41, 60, 2, 4, '#4fb3d9');
      p.r(51, 60, 2, 4, '#e8697d');
      p.r(44, 60, 6, 3, '#2d6a9f');
      p.r(44 + (tick % 5), 61, 1, 1, '#ffffff');
      p.r(52, 61, 1, 1, '#ffffff', tick % 2 ? 1 : 0.4);
      break;
    }
    case 'reading': {
      p.r(42, 59, 10, 5, '#f4e4c1');
      p.r(46, 59, 1, 5, '#c98a5a');
      p.r(43, 60, 3, 1, '#9a8567');
      p.r(43, 62, 3, 1, '#9a8567');
      p.r(48, 60, 3, 1, '#9a8567');
      p.r(48, 62, 3, 1, '#9a8567');
      if (tick % 8 < 2) p.r(47, 59, 4, 5, '#e8d5b0');
      break;
    }
    case 'cleaning': {
      const dx = sweepOffset(tick);
      const bx = 47 + dx;
      p.line(47, 56, bx, 76, '#a06a44');
      p.r(bx - 3, 76, 7, 3, '#d9b27a');
      p.r(bx - 3, 76, 7, 1, '#b8905a');
      for (let i = 0; i < 3; i++) p.r(bx + (i - 1) * 4 + (tick % 2), 77 - ((tick + i) % 3), 1, 1, '#d8c8e8', 0.7);
      break;
    }
    default:
      break;
  }
}

/** Parts that move: string lights, candle, steam, laptop cursor, sleeping cat, and whatever the character is holding. */
export function buildHomeDynamic(tick: number, phase: Phase, activity: Activity): DynamicLayers {
  const pal = PHASES[phase];
  const back = new Painter();

  for (let i = 0; i < 10; i++) {
    const x = 6 + i * 9;
    const y = WIRE_Y(x) + 1;
    const on = (tick + i) % 4 !== 0;
    const c = BULBS[i % BULBS.length];
    if (pal.bulbs > 0.5) back.r(x - 1, y, 4, 4, c, on ? 0.2 : 0.05);
    back.r(x, y + 1, 2, 2, c, on ? pal.bulbs : pal.bulbs * 0.35);
  }

  back.r(85, 24, 1, 2, '#ffd98a');
  if (tick % 2 === 0) back.r(85, 23, 1, 1, '#ffb86b');
  back.r(85, 25, 1, 1, '#fff', 0.7);

  for (let i = 0; i < 3; i++) {
    back.r(84 + ((tick + i) % 2), 47 - i * 2, 1, 1, '#ffffff', 0.55 - i * 0.15);
  }
  if (tick % 4 < 2) back.r(76, 48, 1, 1, '#ffffff', 0.9);

  const breathe = Math.floor(tick / 2) % 2;
  back.r(10, 72 - breathe, 10, 5 + breathe, '#d98d4c');
  back.r(8, 73, 5, 4, '#d98d4c');
  back.r(8, 72, 1, 1, '#d98d4c');
  back.r(12, 72, 1, 1, '#d98d4c');
  back.r(13, 72 - breathe, 1, 3, '#b66c33');
  back.r(16, 72 - breathe, 1, 3, '#b66c33');
  back.r(18, 73, 1, 3, '#b66c33');
  back.r(9, 75, 2, 1, '#2a1d3f');
  back.r(9, 76, 1, 1, '#f2a0a8');
  if (Math.floor(tick / 4) % 2 === 0) back.r(20, 76, 4, 1, '#d98d4c');
  else back.r(20, 75, 3, 1, '#d98d4c');
  back.r(22, 76, 2, 1, '#b66c33');

  const z = tick % 6;
  back.r(10 + (z > 2 ? 1 : 0), 68 - Math.floor(z / 2), 2, 1, '#a99bff', 0.9);
  back.r(13 + (z > 2 ? 1 : 0), 65 - Math.floor(z / 3), 2, 1, '#a99bff', 0.6);

  const front = new Painter();
  activityProps(front, activity, tick);

  return { back: back.rects, front: front.rects };
}
