import React, { useEffect, useState } from 'react';
import Svg, { Rect } from 'react-native-svg';
import type { Mood } from '../lib/character';
import { getFrames, SPRITE_H, SPRITE_W, type Gender } from '../lib/sprite';

// Not in react-native-svg's types, but the web build forwards it to the DOM to avoid seams between pixels.
const CRISP = { shapeRendering: 'crispEdges' } as object;

/** The bare character, idling, for places where the whole room would be too much (e.g. picking a body). */
export function AvatarPortrait({ gender, mood = 'thriving', px = 3 }: { gender: Gender; mood?: Mood; px?: number }) {
  const frames = getFrames(mood, 'idle', gender);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 650);
    return () => clearInterval(id);
  }, []);

  const frame = frames[tick % frames.length];
  return (
    <Svg width={SPRITE_W * px} height={SPRITE_H * px} viewBox={`0 0 ${SPRITE_W} ${SPRITE_H}`}>
      {frame.map((r, i) => (
        <Rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.color} {...CRISP} />
      ))}
    </Svg>
  );
}
