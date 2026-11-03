import React from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts } from '../theme';
import { PixelFrame } from './PixelFrame';
import { PixelText } from './PixelText';

interface Props extends TextInputProps {
  label?: string;
}

export function PixelInput({ label, style, ...rest }: Props) {
  return (
    <View style={styles.field}>
      {label ? <PixelText variant="label" size={10}>{label}</PixelText> : null}
      <PixelFrame fill={colors.panelDeep} edge={colors.border} step={2}>
        <TextInput placeholderTextColor={colors.textFaint} {...rest} style={[styles.input, style]} />
      </PixelFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6, flex: 1 },
  input: {
    position: 'relative',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.text,
  },
});
