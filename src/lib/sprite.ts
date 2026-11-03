import type { Mood } from './character';

export const SPRITE_W = 32;
export const SPRITE_H = 38;
const CX = 16;
/** Row of the feet; every pose keeps its soles on this row so the character never floats. */
const GROUND = 36;

export type Routine = 'squat' | 'curl' | 'press' | 'pull' | 'jacks';
export type Activity = 'idle' | Routine;

export const ROUTINE_LABEL: Record<Routine, string> = {
  squat: 'Squats',
  curl: 'Curls',
  press: 'Presses',
  pull: 'Pulls',
  jacks: 'Jumping jacks',
};

type Piece = string[];

const mirror = (p: Piece): Piece => p.map((row) => [...row].reverse().join(''));
const widen = (p: Piece, cols: number[]): Piece =>
  p.map((row) => [...row].flatMap((ch, i) => (cols.includes(i) ? [ch, ch] : [ch])).join(''));

// K/k hair, S/s skin + shade, E eye, J/j jacket, F/f fur collar, G shirt, P/p jeans, B shoe, b sole, A sparkle
const HEAD: Piece = [
  '...K..K...',
  '..KKKKKK..',
  '.KKKkKKKK.',
  'KKKKKKKKKK',
  'KKKSSSSKKK',
  'KSSSSSSSSK',
  'KSEESSEESK',
  'KSSSSSSSSK',
  'KSSSssSSSK',
  '.SSSSSSSS.',
  '..SSssSS..',
];

const TORSO: Piece = [
  '..FFFSSFFF..',
  '.FFfFGGFfFF.',
  'JJjFGGGGFjJJ',
  'JJJJGGGGJJJJ',
  'JJJJGGGGJJJJ',
  'JjJJGGGGJJjJ',
  'JJJJGGGGJJJJ',
  'JJJJGGGGJJJJ',
  'JJjJGGGGJjJJ',
  'JJJJGGGGJJJJ',
  'jjjjGGGGjjjj',
];

const ARM_DOWN: Piece = ['JJJ', 'JJJ', 'JjJ', 'JJJ', 'JJJ', 'JjJ', 'JJJ', 'jjj', 'SSS', 'SSS', '.S.'];
const ARM_TOP: Piece = ['JJJ', 'JJJ', 'JjJ', 'JJJ', 'JJJ'];
const FOREARM_UP: Piece = ['SSS', 'SSS', 'jjj', 'JJJ', 'JJJ'];
const ARM_UP: Piece = ['SSS', 'SSS', 'jjj', 'JJJ', 'JjJ', 'JJJ', 'JJJ', 'JjJ', 'JJJ', 'JJJ', 'JJJ'];
const ARM_OUT: Piece = ['SSSjJJJJJ', 'SSSjJjJJJ', 'SSSjJJJJJ'];

const LEGS_STAND: Piece = [
  'PPPPPPPPPPPP',
  'PPPPPPPPPPPP',
  'PPPPP..PPPPP',
  'PPPPp..pPPPP',
  'PPPPP..PPPPP',
  'PPpPP..PPpPP',
  'PPPPP..PPPPP',
  'PPPPP..PPPPP',
  'PpPPP..PPPpP',
  'ppppp..ppppp',
  'BBBBB..BBBBB',
  'BBBBB..BBBBB',
  'bbbbb..bbbbb',
];

const LEGS_SQUAT: Piece = [
  '..PPPPPPPPPPPP..',
  '.PPPPPPPPPPPPPP.',
  'PPPPPP....PPPPPP',
  'PPpPPP....PPPpPP',
  'PPPPP......PPPPP',
  '.PPPP......PPPP.',
  '.PPPP......PPPP.',
  '.BBBB......BBBB.',
  '.BBBB......BBBB.',
  '.bbbb......bbbb.',
];

const LEGS_JACK: Piece = [
  '..PPPPPPPPPPPP..',
  '..PPPPPPPPPPPP..',
  '.PPPPP....PPPPP.',
  '.PPPPP....PPPPP.',
  'PPPPP......PPPPP',
  'PPpPP......PPpPP',
  'PPPP........PPPP',
  'PPPP........PPPP',
  'pppp........pppp',
  'BBBB........BBBB',
  'BBBB........BBBB',
  'bbbb........bbbb',
];

const LEGS = { stand: LEGS_STAND, squat: LEGS_SQUAT, jack: LEGS_JACK };

type Palette = Record<string, string>;

const BRIGHT: Palette = {
  K: '#1f1a24', k: '#3a3446',
  S: '#e0a96d', s: '#bf8650', E: '#1a1420',
  J: '#2d3140', j: '#3d4356',
  F: '#7a3340', f: '#9a4a58',
  G: '#8a909c',
  P: '#3f6a9a', p: '#2f4f75',
  B: '#23232b', b: '#ece8de',
  A: '#ffd166',
};

const MUTED: Palette = {
  ...BRIGHT,
  S: '#cfa078', s: '#a8805a',
  J: '#3a3a44', j: '#484852',
  F: '#5e3a40', f: '#704850',
  G: '#7c7f86',
  P: '#55657a', p: '#43526a',
};

interface Flags {
  wide: boolean;
  slouch: boolean;
  messy: boolean;
  tired: boolean;
  stubble: boolean;
  sparkle: boolean;
}

/** Same body for every mood; only these traits change, so the four looks stay comparable. */
const FLAGS: Record<Mood, Flags> = {
  thriving: { wide: false, slouch: false, messy: false, tired: false, stubble: false, sparkle: true },
  bulking: { wide: true, slouch: false, messy: false, tired: false, stubble: false, sparkle: false },
  leanTired: { wide: false, slouch: true, messy: true, tired: true, stubble: false, sparkle: false },
  scruffy: { wide: true, slouch: true, messy: true, tired: true, stubble: true, sparkle: false },
};

type ArmPose = 'down' | 'curl' | 'goblet' | 'out' | 'up';
type LegPose = keyof typeof LEGS;

interface Pose {
  legs: LegPose;
  armL: ArmPose;
  armR: ArmPose;
  /** Rows the torso and head sink, for breathing. */
  bob?: number;
  /** Rows the whole body lifts off the ground. */
  jump?: number;
  blink?: boolean;
  sparkle?: 1 | 2;
}

const down = (extra: Partial<Pose> = {}): Pose => ({ legs: 'stand', armL: 'down', armR: 'down', ...extra });

const IDLE: Pose[] = [
  down({ sparkle: 1 }),
  down({ bob: 1, sparkle: 2 }),
  down({ sparkle: 1 }),
  down({ bob: 1, blink: true, sparkle: 2 }),
];

const ROUTINES: Record<Routine, Pose[]> = {
  squat: [
    { legs: 'stand', armL: 'goblet', armR: 'goblet' },
    { legs: 'squat', armL: 'goblet', armR: 'goblet' },
    { legs: 'squat', armL: 'goblet', armR: 'goblet' },
    { legs: 'stand', armL: 'goblet', armR: 'goblet' },
  ],
  curl: [
    down(),
    { legs: 'stand', armL: 'curl', armR: 'down' },
    { legs: 'stand', armL: 'curl', armR: 'curl' },
    { legs: 'stand', armL: 'down', armR: 'curl' },
  ],
  press: [
    { legs: 'stand', armL: 'curl', armR: 'curl' },
    { legs: 'stand', armL: 'up', armR: 'up' },
    { legs: 'stand', armL: 'up', armR: 'up' },
    { legs: 'stand', armL: 'curl', armR: 'curl' },
  ],
  pull: [
    { legs: 'stand', armL: 'up', armR: 'up' },
    { legs: 'stand', armL: 'up', armR: 'up' },
    { legs: 'stand', armL: 'curl', armR: 'curl' },
    { legs: 'stand', armL: 'curl', armR: 'curl' },
  ],
  jacks: [
    down(),
    { legs: 'jack', armL: 'up', armR: 'up', jump: 1 },
    down(),
    { legs: 'jack', armL: 'out', armR: 'out', jump: 1 },
  ],
};

function blit(canvas: string[][], piece: Piece, x: number, y: number) {
  piece.forEach((row, dy) => {
    [...row].forEach((ch, dx) => {
      const cx = x + dx;
      const cy = y + dy;
      if (ch !== '.' && cy >= 0 && cy < SPRITE_H && cx >= 0 && cx < SPRITE_W) canvas[cy][cx] = ch;
    });
  });
}

function drawArm(canvas: string[][], pose: ArmPose, left: boolean, torsoX: number, torsoW: number, shoulderRow: number) {
  const armX = left ? torsoX - 3 : torsoX + torsoW;
  const side = (p: Piece) => (left ? p : mirror(p));
  switch (pose) {
    case 'down':
      blit(canvas, side(ARM_DOWN), armX, shoulderRow);
      break;
    case 'curl':
      blit(canvas, side(ARM_TOP), armX, shoulderRow);
      blit(canvas, side(FOREARM_UP), left ? armX + 2 : armX - 2, shoulderRow);
      break;
    case 'goblet':
      blit(canvas, side(ARM_TOP), armX, shoulderRow);
      blit(canvas, side(FOREARM_UP), left ? CX - 3 : CX, shoulderRow);
      break;
    case 'out':
      blit(canvas, side(ARM_OUT), left ? torsoX - 9 : torsoX + torsoW, shoulderRow);
      break;
    case 'up':
      blit(canvas, side(ARM_UP), armX, shoulderRow - 10);
      break;
  }
}

function headPiece(f: Flags, blink: boolean): Piece {
  const rows = [...HEAD];
  if (f.messy) {
    rows[0] = 'K..K.KK..K';
    rows[1] = '.KKKKKKKK.';
  }
  if (f.tired) rows[7] = 'KSsSSSSsSK';
  if (f.stubble) rows[9] = '.SsSsSSsS.';
  if (blink) rows[6] = 'KSssSSssSK';
  return rows;
}

export interface PixelRect {
  x: number;
  y: number;
  w: number;
  color: string;
}

function buildFrame(mood: Mood, pose: Pose): PixelRect[] {
  const f = FLAGS[mood];
  const palette = f.tired ? MUTED : BRIGHT;
  const canvas: string[][] = Array.from({ length: SPRITE_H }, () => Array<string>(SPRITE_W).fill('.'));

  const legs = LEGS[pose.legs];
  const legsTop = GROUND - legs.length + 1 - (pose.jump ?? 0);
  blit(canvas, legs, CX - legs[0].length / 2, legsTop);

  const torso = f.wide ? widen(TORSO, [2, 9]) : TORSO;
  const torsoW = torso[0].length;
  const torsoX = CX - torsoW / 2;
  const torsoTop = legsTop - TORSO.length + (pose.bob ?? 0);
  blit(canvas, torso, torsoX, torsoTop);

  const shoulderRow = torsoTop + 1;
  drawArm(canvas, pose.armL, true, torsoX, torsoW, shoulderRow);
  drawArm(canvas, pose.armR, false, torsoX, torsoW, shoulderRow);

  const headTop = torsoTop - HEAD.length + (f.slouch ? 1 : 0);
  const headX = CX - 5;
  blit(canvas, headPiece(f, pose.blink ?? false), headX, headTop);

  if (f.sparkle && pose.sparkle === 1) {
    blit(canvas, ['A'], headX - 3, headTop + 3);
    blit(canvas, ['A'], headX + 12, headTop + 1);
  } else if (f.sparkle && pose.sparkle === 2) {
    blit(canvas, ['A'], headX - 4, headTop + 1);
    blit(canvas, ['A'], headX + 13, headTop + 3);
    blit(canvas, ['A'], headX + 11, headTop + 6);
  }

  const rects: PixelRect[] = [];
  canvas.forEach((row, y) => {
    let x = 0;
    while (x < SPRITE_W) {
      const ch = row[x];
      let end = x + 1;
      while (end < SPRITE_W && row[end] === ch) end += 1;
      const color = palette[ch];
      if (ch !== '.' && color) rects.push({ x, y, w: end - x, color });
      x = end;
    }
  });
  return rects;
}

const cache = new Map<string, PixelRect[][]>();

export function getFrames(mood: Mood, activity: Activity): PixelRect[][] {
  const key = `${mood}:${activity}`;
  let frames = cache.get(key);
  if (!frames) {
    const poses = activity === 'idle' ? IDLE : ROUTINES[activity];
    frames = poses.map((pose) => buildFrame(mood, pose));
    cache.set(key, frames);
  }
  return frames;
}
