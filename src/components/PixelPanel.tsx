import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BORDER, SHADOW, colors } from '../theme';
import { PixelText } from './PixelText';

interface Props {
  title?: string;
  tone?: 'parchment' | 'night';
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function PixelPanel({ title, tone = 'parchment', style, children }: Props) {
  const bg = tone === 'parchment' ? colors.parchment : colors.nightLight;
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.shadow} />
      <View style={[styles.panel, { backgroundColor: bg }]}>
        {title ? (
          <View style={styles.titleTab}>
            <PixelText weight="bold" size={14} color={colors.parchment}>
              {title}
            </PixelText>
          </View>
        ) : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginRight: SHADOW, marginBottom: SHADOW },
  shadow: {
    position: 'absolute',
    top: SHADOW,
    left: SHADOW,
    right: -SHADOW,
    bottom: -SHADOW,
    backgroundColor: '#1a1220',
  },
  panel: {
    borderWidth: BORDER,
    borderColor: colors.ink,
    padding: 14,
    paddingTop: 18,
  },
  titleTab: {
    position: 'absolute',
    top: -BORDER - 11,
    left: 10,
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
