import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import type { Macros } from '../lib/db';
import { DAILY_TARGETS } from '../lib/targets';
import { colors } from '../theme';
import { PixelText } from './PixelText';

const CRISP = { shapeRendering: 'crispEdges' } as object;
const INTERIOR_ROWS = 11;

/** A glass jar that fills from the bottom, drawn on a 12x16 pixel grid. */
function PixelJar({ fraction, color, px = 5 }: { fraction: number; color: string; px?: number }) {
  const n = Math.round(Math.max(0, Math.min(1, fraction)) * INTERIOR_ROWS);
  const glass = colors.borderHi;
  const rects: { x: number; y: number; w: number; h: number; c: string; o?: number }[] = [
    { x: 3, y: 0, w: 6, h: 2, c: '#8a5a3a' },
    { x: 3, y: 0, w: 6, h: 1, c: '#a8744c' },
    { x: 4, y: 2, w: 4, h: 1, c: glass },
    { x: 2, y: 3, w: 8, h: 1, c: glass },
    { x: 1, y: 4, w: 1, h: 11, c: glass },
    { x: 10, y: 4, w: 1, h: 11, c: glass },
    { x: 2, y: 15, w: 8, h: 1, c: glass },
    { x: 2, y: 4, w: 8, h: INTERIOR_ROWS, c: '#ffffff', o: 0.05 },
  ];
  if (n > 0) {
    rects.push({ x: 2, y: 15 - n, w: 8, h: n, c: color });
    rects.push({ x: 2, y: 15 - n, w: 8, h: 1, c: '#ffffff', o: 0.3 });
  }
  rects.push({ x: 3, y: 5, w: 1, h: 6, c: '#ffffff', o: 0.22 });

  return (
    <Svg width={12 * px} height={16 * px} viewBox="0 0 12 16">
      {rects.map((r, i) => (
        <Rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.c} fillOpacity={r.o} {...CRISP} />
      ))}
    </Svg>
  );
}

interface Item {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}

export function MacroJars({ today }: { today: Macros }) {
  const items: Item[] = [
    { label: 'Energy', value: today.energy, target: DAILY_TARGETS.energy, unit: 'kcal', color: colors.amber },
    { label: 'Carbs', value: today.carbs, target: DAILY_TARGETS.carbs, unit: 'g', color: colors.teal },
    { label: 'Protein', value: today.protein, target: DAILY_TARGETS.protein, unit: 'g', color: colors.rose },
  ];

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <PixelJar fraction={item.value / item.target} color={item.color} />
          <PixelText variant="label" size={10}>{item.label}</PixelText>
          <PixelText variant="bold" size={20}>{Math.round(item.value)}</PixelText>
          <PixelText size={13} color={colors.textFaint}>of {item.target} {item.unit}</PixelText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  item: { flex: 1, alignItems: 'center', gap: 4 },
});
