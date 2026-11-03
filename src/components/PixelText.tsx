import React from 'react';
import { Text, type TextProps } from 'react-native';
import { colors, fonts } from '../theme';

type Weight = 'regular' | 'medium' | 'bold';

interface Props extends TextProps {
  weight?: Weight;
  size?: number;
  color?: string;
}

export function PixelText({ weight = 'regular', size = 16, color = colors.ink, style, ...rest }: Props) {
  return <Text {...rest} style={[{ fontFamily: fonts[weight], fontSize: size, color }, style]} />;
}
