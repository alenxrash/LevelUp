import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Mood } from '../lib/character';

const COLS = 10;
const ROWS = 14;
const PIXEL = 14;

type Palette = {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  accent: string;
};

const PALETTES: Record<Mood, Palette> = {
  thriving: { skin: '#e8b690', hair: '#4a3728', shirt: '#36c2a4', pants: '#2e4057', accent: '#ffd166' },
  bulking: { skin: '#e8b690', hair: '#4a3728', shirt: '#6fae8a', pants: '#3a4a3f', accent: '#f2c572' },
  leanTired: { skin: '#dba87c', hair: '#5a4636', shirt: '#8aa0b0', pants: '#4a5560', accent: '#9aa4ad' },
  scruffy: { skin: '#cf9e76', hair: '#4a3b2e', shirt: '#7a6a58', pants: '#4a4a46', accent: '#8d8d8d' },
};

/**
 * Builds a 10x14 pixel grid for a given mood. The same body plan is reused for
 * every mood; only palette, posture (slouched vs upright) and hair (neat vs
 * messy) change, so the four looks stay visually comparable.
 */
function buildGrid(mood: Mood): (string | null)[][] {
  const palette = PALETTES[mood];
  const messy = mood === 'scruffy' || mood === 'leanTired';
  const armsRaised = mood === 'thriving' || mood === 'bulking';
  const slouched = mood === 'scruffy' || mood === 'leanTired';

  const grid: (string | null)[][] = Array.from({ length: ROWS }, () => Array<string | null>(COLS).fill(null));

  for (let c = 3; c <= 6; c++) grid[0][c] = palette.hair;
  if (messy) {
    grid[0][2] = palette.hair;
    grid[0][7] = palette.hair;
    grid[1][2] = palette.hair;
  }

  const headRowStart = slouched ? 2 : 1;
  for (let r = headRowStart; r < headRowStart + 3; r++) {
    for (let c = 3; c <= 6; c++) grid[r][c] = palette.skin;
  }

  const torsoRowStart = headRowStart + 3;
  for (let r = torsoRowStart; r < torsoRowStart + 5; r++) {
    for (let c = 2; c <= 7; c++) grid[r][c] = palette.shirt;
  }

  const armRowStart = armsRaised ? torsoRowStart - 1 : torsoRowStart;
  for (let r = armRowStart; r < armRowStart + 4; r++) {
    if (r >= 0 && r < ROWS) {
      grid[r][1] = palette.skin;
      grid[r][8] = palette.skin;
    }
  }

  const legRowStart = torsoRowStart + 5;
  for (let r = legRowStart; r < Math.min(legRowStart + 4, ROWS); r++) {
    grid[r][3] = palette.pants;
    grid[r][4] = palette.pants;
    grid[r][5] = palette.pants;
    grid[r][6] = palette.pants;
  }

  grid[0][1] = palette.accent;
  grid[0][8] = palette.accent;

  return grid;
}

export function PixelAvatar({ mood }: { mood: Mood }) {
  const grid = buildGrid(mood);
  return (
    <View style={styles.wrap}>
      {grid.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((color, c) => (
            <View key={c} style={[styles.pixel, { backgroundColor: color ?? 'transparent' }]} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  row: { flexDirection: 'row' },
  pixel: { width: PIXEL, height: PIXEL },
});
