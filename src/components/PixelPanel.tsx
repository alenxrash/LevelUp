import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../theme';
import { PixelFrame } from './PixelFrame';
import { PixelText } from './PixelText';

interface Props {
  label?: string;
  /** `paper` renders a cream card for things that should read as printed objects. */
  tone?: 'night' | 'paper';
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function PixelPanel({ label, tone = 'night', style, children }: Props) {
  const paper = tone === 'paper';
  return (
    <PixelFrame
      fill={paper ? colors.paper : colors.panel}
      edge={paper ? colors.paperDark : colors.border}
      step={3}
      style={style}
    >
      <View style={styles.inner}>
        {label ? (
          <PixelText variant="label" size={10} color={paper ? colors.paperFaint : colors.textDim} style={styles.label}>
            {label}
          </PixelText>
        ) : null}
        {children}
      </View>
    </PixelFrame>
  );
}

const styles = StyleSheet.create({
  inner: { padding: 14, gap: 10 },
  label: { marginBottom: 2 },
});
