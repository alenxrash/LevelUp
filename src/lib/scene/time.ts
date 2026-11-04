export type Phase = 'dawn' | 'day' | 'dusk' | 'night';

export function phaseFor(hour: number): Phase {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

export interface PhasePalette {
  wall: string;
  stripe: string;
  topShade: string;
  base1: string;
  base2: string;
  floor: string;
  floorLine: string;
  /** Window sky, top to bottom. */
  sky: [string, string, string];
  skyline: string;
  curtain: [string, string];
  stars: boolean;
  moon: boolean;
  sun: 'none' | 'high' | 'low';
  litWindows: boolean;
  /** Overall warm/cool wash over the room. */
  tint?: { c: string; o: number };
  /** 0..1 strength of the desk lamp's glow. */
  lamp: number;
  /** 0..1 brightness of the string lights. */
  bulbs: number;
  /** Light coming through the window onto the floor. */
  spill: { c: string; o: number };
}

export const PHASES: Record<Phase, PhasePalette> = {
  night: {
    wall: '#2a2147', stripe: '#2e2551', topShade: '#1c1537', base1: '#1d1634', base2: '#3a2f63',
    floor: '#6a4538', floorLine: '#54352c',
    sky: ['#14103a', '#1d1850', '#2a2266'], skyline: '#0d0a26', curtain: ['#8c3a5a', '#6e2a46'],
    stars: true, moon: true, sun: 'none', litWindows: true,
    lamp: 1, bulbs: 1, spill: { c: '#9db4ff', o: 0.06 },
  },
  day: {
    wall: '#d9b9c6', stripe: '#d2b0be', topShade: '#b98fa3', base1: '#a97f93', base2: '#ecd0d8',
    floor: '#b98a62', floorLine: '#a07650',
    sky: ['#7ec8f0', '#9ad6f6', '#bfe6fa'], skyline: '#7d8fb8', curtain: ['#e8a0b0', '#c98294'],
    stars: false, moon: false, sun: 'high', litWindows: false,
    lamp: 0, bulbs: 0.2, spill: { c: '#fff3c0', o: 0.18 },
  },
  dawn: {
    wall: '#b79ab6', stripe: '#b192b0', topShade: '#8e7090', base1: '#7a5e7c', base2: '#d4b6cf',
    floor: '#9a6f5c', floorLine: '#84594a',
    sky: ['#8a78c0', '#f2a0a0', '#f6c98a'], skyline: '#6a4a78', curtain: ['#c9788f', '#a85c74'],
    stars: false, moon: false, sun: 'low', litWindows: true,
    tint: { c: '#ffd0a0', o: 0.05 }, lamp: 0.5, bulbs: 0.6, spill: { c: '#ffd0a0', o: 0.12 },
  },
  dusk: {
    wall: '#7a5a86', stripe: '#765680', topShade: '#5a3f6a', base1: '#4a3258', base2: '#a98ab8',
    floor: '#85584a', floorLine: '#6f4639',
    sky: ['#3a2a6a', '#c8587a', '#ffb070'], skyline: '#2a1a44', curtain: ['#a8506a', '#843c54'],
    stars: false, moon: false, sun: 'low', litWindows: true,
    tint: { c: '#ff8a50', o: 0.06 }, lamp: 0.9, bulbs: 1, spill: { c: '#ffb070', o: 0.12 },
  },
};

export const PHASE_LABEL: Record<Phase, string> = {
  dawn: 'Early morning',
  day: 'Daytime',
  dusk: 'Evening',
  night: 'Night',
};
