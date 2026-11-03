import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Mood } from '../lib/character';
import type { Activity } from '../lib/sprite';
import { BORDER, colors } from '../theme';
import { PixelAvatar } from './PixelAvatar';

const WALL = '#e6b8a2';
const FLOOR = '#8a5a44';
const FLOOR_LINE = '#74483a';

interface Props {
  mood: Mood;
  activity?: Activity;
  /** Shorter room used on the workout screen. */
  compact?: boolean;
}

export function AvatarRoom({ mood, activity = 'idle', compact = false }: Props) {
  const px = compact ? 4 : 6;
  const floorH = compact ? 52 : 78;
  return (
    <View style={[styles.room, { height: compact ? 210 : 310 }]}>
      <View style={[styles.window, compact && { width: 52, height: 52, top: 16, left: 16 }]}>
        <View style={[styles.windowCrossV, compact && { left: 20 }]} />
        <View style={[styles.windowCrossH, compact && { top: 20 }]} />
      </View>

      <View style={[styles.floor, { height: floorH }]}>
        <View style={styles.plankLine} />
        <View style={[styles.plankLine, { top: compact ? 32 : 38 }]} />
      </View>

      {!compact && (
        <>
          <View style={styles.plantPot} />
          <View style={styles.plantLeafL} />
          <View style={styles.plantLeafR} />
        </>
      )}

      <View style={[styles.rug, { bottom: compact ? 8 : 12, width: compact ? 130 : 190, height: compact ? 18 : 26 }]} />
      <View style={{ position: 'absolute', bottom: compact ? 16 : 22 }}>
        <PixelAvatar mood={mood} activity={activity} px={px} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  room: {
    backgroundColor: WALL,
    borderWidth: BORDER,
    borderColor: colors.ink,
    overflow: 'hidden',
    alignItems: 'center',
  },
  window: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 72,
    height: 72,
    backgroundColor: colors.sky,
    borderWidth: BORDER,
    borderColor: colors.ink,
  },
  windowCrossV: { position: 'absolute', left: 30, top: 0, bottom: 0, width: 3, backgroundColor: colors.ink },
  windowCrossH: { position: 'absolute', top: 30, left: 0, right: 0, height: 3, backgroundColor: colors.ink },
  floor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: FLOOR,
    borderTopWidth: BORDER,
    borderColor: colors.ink,
  },
  plankLine: { position: 'absolute', left: 0, right: 0, top: 18, height: 2, backgroundColor: FLOOR_LINE },
  rug: {
    position: 'absolute',
    backgroundColor: colors.terracotta,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  plantPot: {
    position: 'absolute',
    right: 20,
    bottom: 56,
    width: 28,
    height: 22,
    backgroundColor: colors.terracotta,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  plantLeafL: {
    position: 'absolute',
    right: 38,
    bottom: 78,
    width: 12,
    height: 24,
    backgroundColor: colors.moss,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  plantLeafR: {
    position: 'absolute',
    right: 20,
    bottom: 78,
    width: 12,
    height: 32,
    backgroundColor: colors.mossDark,
    borderWidth: 2,
    borderColor: colors.ink,
  },
});
