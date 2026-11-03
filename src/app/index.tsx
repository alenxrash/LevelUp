import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { AvatarRoom } from '../components/AvatarRoom';
import { formatNumber, WorkoutCalendarWidget } from '../components/CalendarWidget';
import { MacroBars } from '../components/MacroBars';
import { PixelButton } from '../components/PixelButton';
import { PixelPanel } from '../components/PixelPanel';
import { PixelText } from '../components/PixelText';
import { SegmentBar } from '../components/SegmentBar';
import { useActiveWorkout, workoutStore } from '../lib/activeWorkout';
import { MOOD_BLURB, MOOD_LABEL, NUTRITION_WINDOW_DAYS, type Mood } from '../lib/character';
import { toDayKey } from '../lib/dates';
import {
  getActiveDayKeys,
  getCounts,
  getDailyMacros,
  getWorkoutSummaries,
  type Macros,
  type WorkoutSummary,
} from '../lib/db';
import { moodFrom } from '../lib/mood';
import { computeLevel, computeStreak, type Level } from '../lib/progress';
import { colors } from '../theme';

interface DashboardData {
  mood: Mood;
  summaries: WorkoutSummary[];
  today: Macros;
  level: Level;
  streak: number;
}

const EMPTY_MACROS: Macros = { energy: 0, carbs: 0, protein: 0 };

async function loadDashboard(db: SQLiteDatabase): Promise<DashboardData> {
  const now = new Date();
  const [summaries, activeDays, counts, daily] = await Promise.all([
    getWorkoutSummaries(db),
    getActiveDayKeys(db),
    getCounts(db),
    getDailyMacros(db, NUTRITION_WINDOW_DAYS, now),
  ]);
  return {
    mood: moodFrom(summaries[0] ? new Date(summaries[0].date) : null, daily, now),
    summaries,
    today: daily.get(toDayKey(now)) ?? EMPTY_MACROS,
    level: computeLevel(counts.workouts, counts.meals),
    streak: computeStreak(activeDays, now),
  };
}

export default function Home() {
  const db = useSQLiteContext();
  const activeWorkout = useActiveWorkout();
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

  const now = new Date();
  const thisMonth = data.summaries.filter((s) => {
    const d = new Date(s.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const monthVolume = thisMonth.reduce((sum, s) => sum + s.volume, 0);

  function startWorkout() {
    workoutStore.start();
    router.push('/workout');
  }

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
      </PixelPanel>

      <View>
        <AvatarRoom mood={data.mood} />
        <View style={styles.moodBanner}>
          <PixelText weight="bold" size={18} color={colors.parchment}>{MOOD_LABEL[data.mood]}</PixelText>
          <PixelText size={14} color={colors.parchmentDark}>{MOOD_BLURB[data.mood]}</PixelText>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <PixelButton
          label={activeWorkout ? 'Resume Workout' : 'Start Workout'}
          color={colors.moss}
          onPress={startWorkout}
          style={{ flex: 1 }}
        />
        <PixelButton label="Log Meal" color={colors.butter} onPress={() => router.push('/log-meal')} style={{ flex: 1 }} />
      </View>

      <View style={styles.widgetRow}>
        <PixelPanel title="Training" style={{ flex: 1.55 }}>
          <WorkoutCalendarWidget summaries={data.summaries} />
        </PixelPanel>
        <View style={styles.widgetColumn}>
          <PixelPanel title="Streak">
            <PixelText weight="bold" size={30} color={colors.terracotta}>{data.streak}</PixelText>
            <PixelText size={13} color={colors.inkSoft}>{data.streak === 1 ? 'day' : 'days'} in a row</PixelText>
          </PixelPanel>
          <PixelPanel title="This Month">
            <PixelText weight="bold" size={30} color={colors.mossDark}>{thisMonth.length}</PixelText>
            <PixelText size={13} color={colors.inkSoft}>workouts</PixelText>
            <PixelText size={13} color={colors.inkSoft}>{formatNumber(monthVolume)} kg lifted</PixelText>
          </PixelPanel>
        </View>
      </View>

      <PixelPanel title="Today's Fuel">
        <MacroBars today={data.today} />
      </PixelPanel>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  content: { padding: 20, paddingTop: 28, paddingBottom: 48, gap: 28 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  moodBanner: { backgroundColor: colors.ink, paddingVertical: 8, paddingHorizontal: 12, gap: 2 },
  buttonRow: { flexDirection: 'row', gap: 16 },
  widgetRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  widgetColumn: { flex: 1, gap: 24 },
});
