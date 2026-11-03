import React, { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/** Rectangle with stair-stepped corners, the way pixel games cut their UI panels. */
function stepPath(w: number, h: number, s: number, x = 0, y = 0): string {
  const pts: [number, number][] = [
    [2 * s, 0], [w - 2 * s, 0], [w - 2 * s, s], [w - s, s], [w - s, 2 * s], [w, 2 * s],
    [w, h - 2 * s], [w - s, h - 2 * s], [w - s, h - s], [w - 2 * s, h - s], [w - 2 * s, h], [2 * s, h],
    [2 * s, h - s], [s, h - s], [s, h - 2 * s], [0, h - 2 * s],
    [0, 2 * s], [s, 2 * s], [s, s], [2 * s, s],
  ];
  return `M${pts.map(([px, py]) => `${px + x} ${py + y}`).join('L')}Z`;
}

interface Props {
  fill: string;
  edge?: string;
  /** Border thickness in screen px. */
  border?: number;
  /** Corner step size in screen px. */
  step?: number;
  /** Darker slab under the frame, giving buttons a pressable lip. */
  lip?: number;
  lipColor?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function PixelFrame({ fill, edge, border = 2, step = 3, lip = 0, lipColor, style, children }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
  };

  const { w, h } = size;
  const bodyH = h - lip;

  return (
    <View style={style} onLayout={onLayout}>
      {w > 0 && (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
          {lip > 0 && lipColor ? <Path d={stepPath(w, bodyH, step, 0, lip)} fill={lipColor} /> : null}
          {edge ? <Path d={stepPath(w, bodyH, step)} fill={edge} /> : null}
          <Path
            d={
              edge
                ? stepPath(w - 2 * border, bodyH - 2 * border, Math.max(1, step - 1), border, border)
                : stepPath(w, bodyH, step)
            }
            fill={fill}
          />
        </Svg>
      )}
      {children}
    </View>
  );
}
