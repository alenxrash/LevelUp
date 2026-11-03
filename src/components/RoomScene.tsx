import React, { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import type { Mood } from '../lib/character';
import { buildDynamicScene, buildStaticScene, CHAR_X, CHAR_Y, SCENE_H, SCENE_W, type SceneRect } from '../lib/scene';
import { getFrames, type Activity } from '../lib/sprite';
import { colors } from '../theme';

// Not in react-native-svg's types, but the web build forwards it to the DOM to avoid seams between pixels.
const CRISP = { shapeRendering: 'crispEdges' } as object;

function Rects({ rects, dx = 0, dy = 0 }: { rects: SceneRect[]; dx?: number; dy?: number }) {
  return (
    <>
      {rects.map((r, i) => (
        <Rect key={i} x={r.x + dx} y={r.y + dy} width={r.w} height={r.h} fill={r.c} fillOpacity={r.o} {...CRISP} />
      ))}
    </>
  );
}

const StaticLayer = memo(function StaticLayer({ mood }: { mood: Mood }) {
  return <Rects rects={buildStaticScene(mood)} />;
});

const TICK_MS = 330;

interface Props {
  mood: Mood;
  activity?: Activity;
  /** Crops to the lower part of the room, for screens where the room is a backdrop. */
  compact?: boolean;
  /** Absolutely-positioned overlay drawn on top of the scene. */
  children?: React.ReactNode;
}

export function RoomScene({ mood, activity = 'idle', compact = false, children }: Props) {
  const [width, setWidth] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  // Whole-number scale keeps every pixel the same size, so the room and character never mismatch.
  const scale = width > 0 ? Math.max(2, Math.floor(width / SCENE_W)) : 0;
  const y0 = compact ? 30 : 0;
  const h = SCENE_H - y0;

  const dynamic = useMemo(() => buildDynamicScene(tick), [tick]);
  const frames = getFrames(mood, activity);
  const frame = frames[(activity === 'idle' ? Math.floor(tick / 2) : tick) % frames.length];
  const character = useMemo(
    () => frame.map((r) => ({ x: r.x, y: r.y, w: r.w, h: 1, c: r.color })),
    [frame]
  );

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {scale > 0 && (
        <View style={{ width: SCENE_W * scale, height: h * scale }}>
          <Svg width={SCENE_W * scale} height={h * scale} viewBox={`0 ${y0} ${SCENE_W} ${h}`}>
            <StaticLayer mood={mood} />
            <Rects rects={dynamic} />
            <Rects rects={character} dx={CHAR_X} dy={CHAR_Y} />
          </Svg>
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {children}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', backgroundColor: colors.night, alignItems: 'center', overflow: 'hidden' },
});
