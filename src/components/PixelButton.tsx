import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BORDER, SHADOW, colors } from '../theme';
import { PixelText } from './PixelText';

interface Props {
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PixelButton({ label, onPress, color = colors.moss, disabled, style }: Props) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.wrap, disabled && styles.disabled, style]}>
      {({ pressed }) => (
        <View>
          <View style={styles.shadow} />
          <View
            style={[
              styles.face,
              { backgroundColor: color },
              pressed && { transform: [{ translateX: SHADOW }, { translateY: SHADOW }] },
            ]}
          >
            <PixelText weight="bold" size={17} color={colors.ink}>
              {label}
            </PixelText>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginRight: SHADOW, marginBottom: SHADOW },
  disabled: { opacity: 0.45 },
  shadow: {
    position: 'absolute',
    top: SHADOW,
    left: SHADOW,
    right: -SHADOW,
    bottom: -SHADOW,
    backgroundColor: '#1a1220',
  },
  face: {
    borderWidth: BORDER,
    borderColor: colors.ink,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
