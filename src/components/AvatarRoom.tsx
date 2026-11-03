import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { Mood } from '../lib/character';
import { BORDER, colors } from '../theme';
import { PixelAvatar } from './PixelAvatar';

const WALL = '#e6b8a2';
const FLOOR = '#8a5a44';
const FLOOR_LINE = '#74483a';
const RUG = colors.terracotta;

export function AvatarRoom({ mood }: { mood: Mood }) {
  return (
    <View style={styles.room}>
      <View style={styles.window}>
        <View style={styles.windowCrossV} />
        <View style={styles.windowCrossH} />
      </View>

      <View style={styles.floor}>
        <View style={styles.plankLine} />
        <View style={[styles.plankLine, { top: 38 }]} />
      </View>

      <View style={styles.plantPot} />
      <View style={styles.plantLeafL} />
      <View style={styles.plantLeafR} />

      <View style={styles.rug} />
      <View style={styles.avatar}>
        <PixelAvatar mood={mood} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  room: {
    height: 290,
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
    height: 78,
    backgroundColor: FLOOR,
    borderTopWidth: BORDER,
    borderColor: colors.ink,
  },
  plankLine: { position: 'absolute', left: 0, right: 0, top: 18, height: 2, backgroundColor: FLOOR_LINE },
  rug: {
    position: 'absolute',
    bottom: 12,
    width: 190,
    height: 26,
    backgroundColor: RUG,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  avatar: { position: 'absolute', bottom: 22 },
  plantPot: {
    position: 'absolute',
    right: 28,
    bottom: 56,
    width: 28,
    height: 22,
    backgroundColor: colors.terracotta,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  plantLeafL: {
    position: 'absolute',
    right: 46,
    bottom: 78,
    width: 12,
    height: 24,
    backgroundColor: colors.moss,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  plantLeafR: {
    position: 'absolute',
    right: 28,
    bottom: 78,
    width: 12,
    height: 32,
    backgroundColor: colors.mossDark,
    borderWidth: 2,
    borderColor: colors.ink,
  },
});
