import React from 'react';
import Svg, { Rect } from 'react-native-svg';

// '#' = main colour, 'o' = secondary colour
const ICONS = {
  dumbbell: [
    '.##........##.',
    '###........###',
    '###........###',
    '##############',
    '##############',
    '###........###',
    '###........###',
    '.##........##.',
  ],
  bowl: [
    '.o..o..o....',
    '..o..o..o...',
    '############',
    '############',
    '.##########.',
    '..########..',
    '...######...',
    '..########..',
  ],
  flame: [
    '....#....',
    '...##....',
    '...###..#',
    '..####.##',
    '.########',
    '.###o###.',
    '###ooo###',
    '###ooo###',
    '.##ooo##.',
    '..#ooo#..',
    '...###...',
  ],
  check: [
    '.......#',
    '......##',
    '#....##.',
    '##..##..',
    '.####...',
    '..##....',
  ],
  x: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  plus: ['..#..', '..#..', '#####', '..#..', '..#..'],
  chevL: ['...#', '..#.', '.#..', '#...', '.#..', '..#.', '...#'],
  chevR: ['#...', '.#..', '..#.', '...#', '..#.', '.#..', '#...'],
  star: ['..#..', '..#..', '#####', '.###.', '##.##'],
  moon: ['.###.', '##...', '##...', '##...', '.###.'],
  gear: ['#.###.#', '.#####.', '###.###', '###.###', '###.###', '.#####.', '#.###.#'],
} as const;

export type IconName = keyof typeof ICONS;

interface Props {
  name: IconName;
  color: string;
  color2?: string;
  /** Screen pixels per icon pixel. */
  px?: number;
}

export function PixelIcon({ name, color, color2, px = 3 }: Props) {
  const rows: readonly string[] = ICONS[name];
  const w = rows[0].length;
  const rects: React.ReactElement[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      const ch = row[x];
      let end = x + 1;
      while (end < w && row[end] === ch) end += 1;
      if (ch !== '.') {
        rects.push(<Rect key={`${y}-${x}`} x={x} y={y} width={end - x} height={1} fill={ch === 'o' ? color2 ?? color : color} />);
      }
      x = end;
    }
  });
  return (
    <Svg width={w * px} height={rows.length * px} viewBox={`0 0 ${w} ${rows.length}`}>
      {rects}
    </Svg>
  );
}
