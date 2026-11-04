import type { Mood } from './character';

export const SPRITE_W = 32;
export const SPRITE_H = 38;
const CX = 16;
/** Row of the feet; every pose keeps its soles on this row so the character never floats. */
const GROUND = 36;

export type Gender = 'female' | 'male';

/** Gym exercises the character performs during a workout. */
export type Routine = 'squat' | 'curl' | 'press' | 'pull' | 'jacks';
/** Things the character does at home when you're not training. */
export type HomeActivity = 'phone' | 'gaming' | 'reading' | 'cleaning' | 'stretch';
export type Activity = 'idle' | Routine | HomeActivity;

export const ROUTINE_LABEL: Record<Routine, string> = {
  squat: 'Squats',
  curl: 'Curls',
  press: 'Presses',
  pull: 'Pulls',
  jacks: 'Jumping jacks',
};

export const HOME_ACTIVITY_LABEL: Record<HomeActivity, string> = {
  phone: 'Scrolling on the couch',
  gaming: 'Playing a game',
  reading: 'Reading a book',
  cleaning: 'Tidying up',
  stretch: 'Stretching',
};

export const HOME_ACTIVITIES = Object.keys(HOME_ACTIVITY_LABEL) as HomeActivity[];

type Piece = string[];

const mirror = (p: Piece): Piece => p.map((row) => [...row].reverse().join(''));
const widen = (p: Piece, cols: number[]): Piece =>
  p.map((row) => [...row].flatMap((ch, i) => (cols.includes(i) ? [ch, ch] : [ch])).join(''));

// K/k hair, S/s skin + shade, E eye, J/j jacket, F/f collar, G shirt, P/p trousers, B shoe, b sole,
// A sparkle, T hair tie, r blush, m lips
const HEAD_MALE: Piece = [
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

const HEAD_FEMALE: Piece = [
  '...KKKK...',
  '..KKkKKK..',
  '.KKKKKkKK.',
  'KKKKKKKKKK',
  'KKKKSSSKKK',
  'KSESSSSESK',
  'KSEESSEESK',
  'KSSSSSSSSK',
  'KSrSssSrSK',
  '.SSSSSSSS.',
  '..SSmmSS..',
];

const TORSO_MALE: Piece = [
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

const TORSO_FEMALE: Piece = [
  '...FFSSFF...',
  '..FFfGGfFF..',
  '.JJjFGGFjJJ.',
  '.JJJGGGGJJJ.',
  '.JJJGGGGJJJ.',
  '..JJGGGGJJ..',
  '..JjGGGGjJ..',
  '..JJGGGGJJ..',
  '...JGGGGJ...',
  '...JGGGGJ...',
  '..jjGGGGjj..',
];

const PONYTAIL: Piece = ['TK', 'KK', 'KK', 'KK', '.K', '.K'];

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

/** Thighs foreshortened, lower legs and shoes visible: a front view of someone seated. */
const LEGS_SIT: Piece = [
  'PPPPPPPPPPPP',
  'PPPPPPPPPPPP',
  'PPPPP..PPPPP',
  'PPPPP..PPPPP',
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

const LEGS = { stand: LEGS_STAND, sit: LEGS_SIT, squat: LEGS_SQUAT, jack: LEGS_JACK };

type Palette = Record<string, string>;

const MALE_BRIGHT: Palette = {
  K: '#1f1a24', k: '#3a3446',
  S: '#e0a96d', s: '#bf8650', E: '#1a1420',
  J: '#2d3140', j: '#3d4356',
  F: '#7a3340', f: '#9a4a58',
  G: '#8a909c',
  P: '#3f6a9a', p: '#2f4f75',
  B: '#23232b', b: '#ece8de',
  A: '#ffd166',
};

const MALE_MUTED: Palette = {
  ...MALE_BRIGHT,
  S: '#cfa078', s: '#a8805a',
  J: '#3a3a44', j: '#484852',
  F: '#5e3a40', f: '#704850',
  G: '#7c7f86',
  P: '#55657a', p: '#43526a',
};

const FEMALE_BRIGHT: Palette = {
  K: '#4a2a2e', k: '#6b3d3a',
  S: '#f0b89a', s: '#d4977a', E: '#2a1a22',
  J: '#3d9c8c', j: '#2f7c70',
  F: '#a99bff', f: '#8a7bd0',
  G: '#f4e4c1',
  P: '#3b3566', p: '#2b2650',
  B: '#f4e4c1', b: '#a79ccd',
  A: '#ffd166', T: '#f2788f', r: '#e8878a', m: '#c4566a',
};

const FEMALE_MUTED: Palette = {
  ...FEMALE_BRIGHT,
  S: '#d9a68e', s: '#b88a72',
  J: '#4f6f6a', j: '#3f5a56',
  F: '#8479b8', f: '#6d639a',
  G: '#d9c9a8',
  P: '#4a4768', p: '#3a3856',
  r: '#c98a88', m: '#a8606c',
};

interface Body {
  head: Piece;
  torso: Piece;
  bright: Palette;
  muted: Palette;
  /** How far the arms tuck in toward the torso (narrower shoulders). */
  armInset: number;
  ponytail: boolean;
}

const BODIES: Record<Gender, Body> = {
  male: { head: HEAD_MALE, torso: TORSO_MALE, bright: MALE_BRIGHT, muted: MALE_MUTED, armInset: 0, ponytail: false },
  female: { head: HEAD_FEMALE, torso: TORSO_FEMALE, bright: FEMALE_BRIGHT, muted: FEMALE_MUTED, armInset: 1, ponytail: true },
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

type ArmPose = 'down' | 'curl' | 'goblet' | 'hold' | 'out' | 'up';
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
const seated = (extra: Partial<Pose> = {}): Pose => ({ legs: 'sit', armL: 'goblet', armR: 'goblet', ...extra });

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

const HOME_POSES: Record<HomeActivity, Pose[]> = {
  phone: [seated(), seated({ bob: 1 }), seated(), seated({ bob: 1, blink: true })],
  gaming: [seated(), seated({ bob: 1 }), seated(), seated({ bob: 1 })],
  reading: [seated(), seated({ blink: true }), seated({ bob: 1 }), seated()],
  cleaning: [
    { legs: 'stand', armL: 'hold', armR: 'hold' },
    { legs: 'stand', armL: 'hold', armR: 'hold', bob: 1 },
    { legs: 'stand', armL: 'hold', armR: 'hold' },
    { legs: 'stand', armL: 'hold', armR: 'hold', bob: 1 },
  ],
  stretch: [
    { legs: 'stand', armL: 'up', armR: 'up' },
    { legs: 'stand', armL: 'up', armR: 'up', bob: 1 },
    { legs: 'stand', armL: 'out', armR: 'out' },
    { legs: 'stand', armL: 'out', armR: 'out', bob: 1 },
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

function drawArm(
  canvas: string[][],
  pose: ArmPose,
  left: boolean,
  torsoX: number,
  torsoW: number,
  shoulderRow: number,
  inset: number
) {
  const armX = left ? torsoX - 3 + inset : torsoX + torsoW - inset;
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
    case 'hold':
      blit(canvas, side(ARM_TOP), armX, shoulderRow);
      blit(canvas, side(FOREARM_UP), left ? CX - 3 : CX, shoulderRow + 3);
      break;
    case 'out':
      blit(canvas, side(ARM_OUT), left ? torsoX - 9 + inset : torsoX + torsoW - inset, shoulderRow);
      break;
    case 'up':
      blit(canvas, side(ARM_UP), armX, shoulderRow - 10);
      break;
  }
}

function headPiece(body: Body, gender: Gender, f: Flags, blink: boolean): Piece {
  const rows = [...body.head];
  if (f.messy) {
    rows[0] = 'K..K.KK..K';
    rows[1] = '.KKKKKKKK.';
  }
  if (f.tired) rows[7] = 'KSsSSSSsSK';
  if (f.stubble && gender === 'male') rows[9] = '.SsSsSSsS.';
  if (blink) rows[6] = 'KSssSSssSK';
  return rows;
}

export interface PixelRect {
  x: number;
  y: number;
  w: number;
  color: string;
}

function buildFrame(gender: Gender, mood: Mood, pose: Pose): PixelRect[] {
  const body = BODIES[gender];
  const f = FLAGS[mood];
  const palette = f.tired ? body.muted : body.bright;
  const canvas: string[][] = Array.from({ length: SPRITE_H }, () => Array<string>(SPRITE_W).fill('.'));

  const legs = LEGS[pose.legs];
  const legsTop = GROUND - legs.length + 1 - (pose.jump ?? 0);
  blit(canvas, legs, CX - legs[0].length / 2, legsTop);

  const torso = f.wide ? widen(body.torso, [2, 9]) : body.torso;
  const torsoW = torso[0].length;
  const torsoX = CX - torsoW / 2;
  const torsoTop = legsTop - body.torso.length + (pose.bob ?? 0);
  blit(canvas, torso, torsoX, torsoTop);

  const shoulderRow = torsoTop + 1;
  drawArm(canvas, pose.armL, true, torsoX, torsoW, shoulderRow, body.armInset);
  drawArm(canvas, pose.armR, false, torsoX, torsoW, shoulderRow, body.armInset);

  const headTop = torsoTop - body.head.length + (f.slouch ? 1 : 0);
  const headX = CX - 5;
  blit(canvas, headPiece(body, gender, f, pose.blink ?? false), headX, headTop);
  if (body.ponytail) blit(canvas, PONYTAIL, headX + 10, headTop + 2);

  if (f.sparkle && pose.sparkle === 1) {
    blit(canvas, ['A'], headX - 3, headTop + 3);
    blit(canvas, ['A'], headX + 13, headTop + 1);
  } else if (f.sparkle && pose.sparkle === 2) {
    blit(canvas, ['A'], headX - 4, headTop + 1);
    blit(canvas, ['A'], headX + 14, headTop + 3);
    blit(canvas, ['A'], headX + 11, headTop + 8);
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

export function getFrames(mood: Mood, activity: Activity, gender: Gender = 'male'): PixelRect[][] {
  const key = `${gender}:${mood}:${activity}`;
  let frames = cache.get(key);
  if (!frames) {
    const poses =
      activity === 'idle' ? IDLE : activity in ROUTINES ? ROUTINES[activity as Routine] : HOME_POSES[activity as HomeActivity];
    frames = poses.map((pose) => buildFrame(gender, mood, pose));
    cache.set(key, frames);
  }
  return frames;
}

/** Whether an activity is a seated one, so the scene can place props relative to the couch. */
export const SEATED: ReadonlySet<Activity> = new Set<Activity>(['phone', 'gaming', 'reading']);

/** Calm activities animate slowly; effortful ones tick every frame. */
export const SLOW_ACTIVITIES: ReadonlySet<Activity> = new Set<Activity>(['idle', 'phone', 'reading', 'stretch']);
