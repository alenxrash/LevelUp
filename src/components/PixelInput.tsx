import React from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { BORDER, colors, fonts } from '../theme';
import { PixelText } from './PixelText';

interface Props extends TextInputProps {
  label: string;
}

export function PixelInput({ label, style, ...rest }: Props) {
  return (
    <View style={styles.field}>
      <PixelText weight="bold" size={13} color={colors.inkSoft}>{label}</PixelText>
      <TextInput
        placeholderTextColor={colors.inkSoft}
        {...rest}
        style={[styles.input, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 4, flex: 1 },
  input: {
    backgroundColor: colors.white,
    borderWidth: BORDER,
    borderColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: fonts.regular,
    fontSize: 17,
    color: colors.ink,
  },
});
