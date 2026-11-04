import React, { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import type { Mood } from '../lib/character';
import {
  buildDynamicScene,
  buildStaticScene,
  CHAR_X,
  CHAR_Y,
  phaseFor,
  SCENE_H,
  SCENE_W,
  type Phase,
  type SceneKind,
  type SceneRect,
} from '../lib/scene';
import { getFrames, SLOW_ACTIVITIES, type Activity, type Gender } from '../lib/sprite';
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

const StaticLayer = memo(function StaticLayer({ kind, mood, phase }: { kind: SceneKind; mood: Mood; phase: Phase }) {
  return <Rects rects={buildStaticScene(kind, mood, phase)} />;
});

const TICK_MS = 330;

interface Props {
  mood: Mood;
  gender: Gender;
  /** `home` follows the system clock (sky, lighting); `gym` is the workout backdrop. */
  scene?: SceneKind;
  activity?: Activity;
  /** Crops to the lower part of the room, for screens where the room is a backdrop. */
  compact?: boolean;
  onPress?: () => void;
  /** Absolutely-positioned overlay drawn on top of the scene. */
  children?: React.ReactNode;
}

export function RoomScene({ mood, gender, scene = 'home', activity = 'idle', compact = false, onPress, children }: Props) {
  const [width, setWidth] = useState(0);
  const [clock, setClock] = useState(() => ({ tick: 0, now: new Date() }));

  useEffect(() => {
    const id = setInterval(() => setClock((c) => ({ tick: c.tick + 1, now: new Date() })), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  // Whole-number scale keeps every pixel the same size, so the room and character never mismatch.
  const scale = width > 0 ? Math.max(2, Math.floor(width / SCENE_W)) : 0;
  const y0 = compact ? (scene === 'gym' ? 20 : 30) : 0;
  const h = SCENE_H - y0;

  const { tick, now } = clock;
  const phase = phaseFor(now.getHours());
  const layers = useMemo(() => buildDynamicScene(scene, tick, phase, activity, now), [scene, tick, phase, activity, now]);
  const frames = getFrames(mood, activity, gender);
  const frame = frames[(SLOW_ACTIVITIES.has(activity) ? Math.floor(tick / 2) : tick) % frames.length];
  const character = useMemo(() => frame.map((r) => ({ x: r.x, y: r.y, w: r.w, h: 1, c: r.color })), [frame]);

  const art = (
    <Svg width={SCENE_W * scale} height={h * scale} viewBox={`0 ${y0} ${SCENE_W} ${h}`}>
      <StaticLayer kind={scene} mood={mood} phase={phase} />
      <Rects rects={layers.back} />
      <Rects rects={character} dx={CHAR_X} dy={CHAR_Y} />
      <Rects rects={layers.front} />
    </Svg>
  );

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {scale > 0 && (
        <View style={{ width: SCENE_W * scale, height: h * scale }}>
          {onPress ? <Pressable onPress={onPress}>{art}</Pressable> : art}
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
