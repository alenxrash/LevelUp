import React, { memo } from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

/** Small, original pixel covers; vector shapes stay sharp at any device density. */
export const RecipeBook = memo(function RecipeBook({ color, size = 104 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size * 1.12} viewBox="0 0 40 45" accessible={false}>
      <Path d="M6 3H34V5H37V40H34V43H5V40H3V7H6Z" fill="#100c20" />
      <Rect x="6" y="4" width="28" height="34" fill={color} />
      <Rect x="6" y="5" width="4" height="33" fill="#332441" fillOpacity="0.6" />
      <Rect x="11" y="5" width="2" height="28" fill="#fff8ea" fillOpacity="0.3" />
      <Rect x="14" y="7" width="17" height="2" fill="#fff8ea" fillOpacity="0.4" />
      <Rect x="31" y="9" width="3" height="26" fill="#100c20" fillOpacity="0.25" />
      <Rect x="7" y="35" width="27" height="6" fill="#d9c6a0" />
      <Rect x="11" y="35" width="23" height="2" fill="#fff8ea" />
      <Rect x="11" y="39" width="23" height="1" fill="#9a8567" />
      <Path d="M26 35H30V44L28 42L26 44Z" fill="#f2788f" />
      <Path d="M15 19H29V22H27V25H17V22H15Z M18 27H26V29H18Z" fill="#f4e4c1" />
      <Path d="M18 13H20V16H18Z M24 12H26V15H24Z" fill="#ffce83" />
      <Rect x="6" y="41" width="28" height="2" fill={color} />
    </Svg>
  );
});
