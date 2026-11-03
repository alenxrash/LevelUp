import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { AvatarRoom } from '../components/AvatarRoom';
import { MacroBars } from '../components/MacroBars';
import { PixelButton } from '../components/PixelButton';
import { PixelPanel } from '../components/PixelPanel';
import { PixelText } from '../components/PixelText';
import { SegmentBar } from '../components/SegmentBar';
import { WorkoutCalendar } from '../components/WorkoutCalendar';
import {
  computeMood,
  isNutritionOnTarget,
  isWorkoutConsistent,
  MOOD_BLURB,
  MOOD_LABEL,
  NUTRITION_WINDOW_DAYS,
} from '../lib/character';
import { toDayKey, addDays } from '../lib/dates';
import {
  getActiveDayKeys,
  getCounts,
  getDailyMacros,
  getLastWorkoutDate,
  getWorkoutDayKeys,
  type Macros,
} from '../lib/db';
import { computeLevel, computeStreak, type Level } from '../lib/progress';
import { DAILY_TARGETS } from '../lib/targets';
import { colors } from '../theme';

interface DashboardData {
  lastWorkout: Date | null;
  workoutDays: Set<string>;
  today: Macros;
  recentEnergy: number[];
  level: Level;
  streak: number;
}

const EMPTY_MACROS: Macros = { energy: 0, carbs: 0, protein: 0 };

async function loadDashboard(db: ReturnType<typeof useSQLiteContext>): Promise<DashboardData> {
  const now = new Date();
  const [lastWorkout, workoutDays, activeDays, counts, daily] = await Promise.all([
    getLastWorkoutDate(db),
    getWorkoutDayKeys(db),
    getActiveDayKeys(db),
    getCounts(db),
    getDailyMacros(db, NUTRITION_WINDOW_DAYS, now),
  ]);
  return {
    lastWorkout,
    workoutDays,
    today: daily.get(toDayKey(now)) ?? EMPTY_MACROS,
    recentEnergy: Array.from({ length: NUTRITION_WINDOW_DAYS }, (_, i) => daily.get(toDayKey(addDays(now, -i)))?.energy ?? 0),
    level: computeLevel(counts.workouts, counts.meals),
    streak: computeStreak(activeDays, now),
  };
}

export default function Home() {
  const db = useSQLiteContext();
  const [data, setData] = useState<DashboardData | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadDashboard(db).then((d) => {
        if (!cancelled) setData(d);
      });
      return () => {
        cancelled = true;
      };
    }, [db])
  );

  if (!data) return <View style={styles.screen} />;

  const mood = computeMood({
    workoutConsistent: isWorkoutConsistent(data.lastWorkout),
    nutritionOnTarget: isNutritionOnTarget(data.recentEnergy, DAILY_TARGETS.energy),
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <PixelPanel title={`LV ${data.level.level}`} tone="night">
        <View style={styles.levelRow}>
          <View style={{ flex: 1 }}>
            <SegmentBar fraction={data.level.xpIntoLevel / data.level.xpPerLevel} color={colors.butter} segments={16} />
          </View>
          <PixelText size={14} color={colors.parchment}>
            {data.level.xpIntoLevel}/{data.level.xpPerLevel} XP
          </PixelText>
        </View>
        <PixelText size={14} color={colors.butter} style={styles.streak}>
          {data.streak > 0 ? `${data.streak}-day streak` : 'Log something today to start a streak'}
        </PixelText>
      </PixelPanel>

      <View>
        <AvatarRoom mood={mood} />
        <View style={styles.moodBanner}>
          <PixelText weight="bold" size={18} color={colors.parchment}>{MOOD_LABEL[mood]}</PixelText>
          <PixelText size={14} color={colors.parchmentDark}>{MOOD_BLURB[mood]}</PixelText>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <PixelButton label="Log Workout" color={colors.moss} onPress={() => router.push('/log-workout')} style={{ flex: 1 }} />
        <PixelButton label="Log Meal" color={colors.butter} onPress={() => router.push('/log-meal')} style={{ flex: 1 }} />
      </View>

      <PixelPanel title="Today's Fuel">
        <MacroBars today={data.today} />
      </PixelPanel>

      <PixelPanel title="Training Log">
        <WorkoutCalendar workoutDays={data.workoutDays} />
      </PixelPanel>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  content: { padding: 20, paddingTop: 28, paddingBottom: 48, gap: 28 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streak: { marginTop: 8 },
  moodBanner: {
    backgroundColor: colors.ink,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 2,
  },
  buttonRow: { flexDirection: 'row', gap: 16 },
});
