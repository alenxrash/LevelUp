import React, { useEffect, useState } from 'react';
import Svg, { Rect } from 'react-native-svg';
import type { Mood } from '../lib/character';
import { getFrames, SPRITE_H, SPRITE_W, type Activity } from '../lib/sprite';

interface Props {
  mood: Mood;
  activity?: Activity;
  /** Screen pixels per sprite pixel. */
  px?: number;
}

// Not in react-native-svg's types, but the web build forwards it to the DOM to avoid seams between pixels.
const CRISP = { shapeRendering: 'crispEdges' } as object;

const IDLE_FRAME_MS = 650;
const ROUTINE_FRAME_MS = 330;

export function PixelAvatar({ mood, activity = 'idle', px = 6 }: Props) {
  const frames = getFrames(mood, activity);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), activity === 'idle' ? IDLE_FRAME_MS : ROUTINE_FRAME_MS);
    return () => clearInterval(id);
  }, [activity]);

  const frame = frames[tick % frames.length];

  return (
    <Svg width={SPRITE_W * px} height={SPRITE_H * px} viewBox={`0 0 ${SPRITE_W} ${SPRITE_H}`}>
      {frame.map((r, i) => (
        <Rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.color} {...CRISP} />
      ))}
    </Svg>
  );
}
