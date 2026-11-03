import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Macros } from '../lib/db';
import { DAILY_TARGETS } from '../lib/targets';
import { colors } from '../theme';
import { PixelText } from './PixelText';
import { SegmentBar } from './SegmentBar';

interface Row {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}

export function MacroBars({ today }: { today: Macros }) {
  const rows: Row[] = [
    { label: 'Energy', value: today.energy, target: DAILY_TARGETS.energy, unit: 'kcal', color: colors.terracotta },
    { label: 'Carbs', value: today.carbs, target: DAILY_TARGETS.carbs, unit: 'g', color: colors.butter },
    { label: 'Protein', value: today.protein, target: DAILY_TARGETS.protein, unit: 'g', color: colors.berry },
  ];

  return (
    <View style={styles.wrap}>
      {rows.map((row) => (
        <View key={row.label} style={styles.item}>
          <View style={styles.labelRow}>
            <PixelText weight="bold" size={15}>{row.label}</PixelText>
            <PixelText size={14} color={colors.inkSoft}>
              {Math.round(row.value)} / {row.target} {row.unit}
            </PixelText>
          </View>
          <SegmentBar fraction={row.value / row.target} color={row.color} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  item: { gap: 4 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
