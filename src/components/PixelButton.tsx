import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme';
import { PixelFrame } from './PixelFrame';
import { PixelIcon, type IconName } from './PixelIcon';
import { PixelText } from './PixelText';

export type Tone = 'amber' | 'teal' | 'rose' | 'lilac' | 'ghost' | 'danger';

const TONES: Record<Tone, { fill: string; edge: string; lip: string; text: string }> = {
  amber: { fill: colors.amber, edge: '#ffd9a8', lip: colors.amberDeep, text: '#2a1d3f' },
  teal: { fill: colors.teal, edge: '#b4f0e6', lip: colors.tealDeep, text: '#16302c' },
  rose: { fill: colors.rose, edge: '#ffb4c2', lip: colors.roseDeep, text: '#3a1220' },
  lilac: { fill: colors.lilac, edge: '#d2c9ff', lip: colors.lilacDeep, text: '#1d1540' },
  ghost: { fill: colors.panel, edge: colors.borderHi, lip: colors.bg, text: colors.text },
  danger: { fill: colors.panel, edge: colors.danger, lip: colors.bg, text: colors.danger },
};

const LIP = 4;

interface Props {
  label: string;
  onPress: () => void;
  tone?: Tone;
  icon?: IconName;
  /** Stacks the icon above the label for big action tiles. */
  tile?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PixelButton({ label, onPress, tone = 'amber', icon, tile, disabled, style }: Props) {
  const t = TONES[tone];
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} onPress={onPress} disabled={disabled} style={[{ marginBottom: LIP }, disabled && styles.disabled, style]}>
      {({ pressed }) => (
        <PixelFrame
          fill={t.fill}
          edge={t.edge}
          border={2}
          step={3}
          lip={pressed ? 0 : LIP}
          lipColor={t.lip}
          style={pressed ? { transform: [{ translateY: LIP }] } : undefined}
        >
          <View style={[tile ? styles.tile : styles.row, { paddingBottom: LIP + (tile ? 14 : 12) }]}>
            {icon ? <PixelIcon name={icon} color={t.text} color2={t.edge} px={tile ? 4 : 3} /> : null}
            <PixelText variant="bold" size={tile ? 17 : 16} color={t.text}>{label}</PixelText>
          </View>
        </PixelFrame>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disabled: { opacity: 0.45 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 12, paddingHorizontal: 14 },
  tile: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 14, paddingHorizontal: 12 },
});
