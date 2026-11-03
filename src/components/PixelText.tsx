import React from 'react';
import { Text, type TextProps } from 'react-native';
import { colors, fonts } from '../theme';

type Variant = 'body' | 'bold' | 'label';

interface Props extends TextProps {
  variant?: Variant;
  size?: number;
  color?: string;
}

/** `label` is small spaced caps for section headings and stat names; `bold` is for numbers and titles. */
export function PixelText({ variant = 'body', size, color, style, children, ...rest }: Props) {
  const label = variant === 'label';
  const fontFamily = label ? fonts.label : variant === 'bold' ? fonts.bodyBold : fonts.body;
  const fontSize = size ?? (label ? 11 : 16);
  return (
    <Text
      {...rest}
      style={[
        { fontFamily, fontSize, color: color ?? (label ? colors.textDim : colors.text) },
        label && { letterSpacing: 1 },
        style,
      ]}
    >
      {label && typeof children === 'string' ? children.toUpperCase() : children}
    </Text>
  );
}
