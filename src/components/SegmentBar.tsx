import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

interface Props {
  /** 0..1, values above 1 render as full. */
  fraction: number;
  color: string;
  segments?: number;
}

export function SegmentBar({ fraction, color, segments = 12 }: Props) {
  const filled = Math.round(Math.max(0, Math.min(1, fraction)) * segments);
  return (
    <View style={styles.bar}>
      {Array.from({ length: segments }, (_, i) => (
        <View key={i} style={[styles.segment, { backgroundColor: i < filled ? color : colors.parchmentDark }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 2,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: 2,
    backgroundColor: colors.ink,
  },
  segment: { flex: 1, height: 12 },
});
