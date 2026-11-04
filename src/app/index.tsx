import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatNumber, WorkoutCalendarWidget } from '../components/CalendarWidget';
import { MacroJars } from '../components/MacroJars';
import { PixelButton } from '../components/PixelButton';
import { PixelFrame } from '../components/PixelFrame';
import { PixelIcon } from '../components/PixelIcon';
import { PixelPanel } from '../components/PixelPanel';
import { PixelText } from '../components/PixelText';
import { RoomScene } from '../components/RoomScene';
import { SegmentBar } from '../components/SegmentBar';
import { useActiveWorkout, workoutStore } from '../lib/activeWorkout';
import { MOOD_BLURB, MOOD_LABEL, NUTRITION_WINDOW_DAYS, type Mood } from '../lib/character';
import { toDayKey } from '../lib/dates';
import {
  getActiveDayKeys,
  getCounts,
  getDailyMacros,
  getProfile,
  getWorkoutSummaries,
  type Macros,
  type WorkoutSummary,
} from '../lib/db';
import { pickHomeActivity } from '../lib/homeActivity';
import { lastActiveDate, moodFrom } from '../lib/mood';
import { targetsFor, type Profile, type Targets } from '../lib/nutrition';
import { computeLevel, computeStreak, type Level } from '../lib/progress';
import { phaseFor } from '../lib/scene';
import { HOME_ACTIVITY_LABEL, type HomeActivity } from '../lib/sprite';
import { colors } from '../theme';

interface DashboardData {
  profile: Profile | null;
  targets: Targets | null;
  mood: Mood;
  summaries: WorkoutSummary[];
  today: Macros;
  level: Level;
  streak: number;
}

const EMPTY_MACROS: Macros = { energy: 0, carbs: 0, protein: 0 };
const GLASS = 'rgba(18,14,36,0.8)';
const ACTIVITY_SWAP_MS = 25000;

const MOOD_DOT: Record<Mood, string> = {
  thriving: colors.teal,
  bulking: colors.amber,
  leanTired: colors.lilac,
  scruffy: colors.rose,
};

async function loadDashboard(db: SQLiteDatabase): Promise<DashboardData> {
  const now = new Date();
  const [profile, summaries, activeDays, counts, daily] = await Promise.all([
    getProfile(db),
    getWorkoutSummaries(db),
    getActiveDayKeys(db),
    getCounts(db),
    getDailyMacros(db, NUTRITION_WINDOW_DAYS, now),
  ]);
  const targets = profile ? targetsFor(profile) : null;
  return {
    profile,
    targets,
    mood: moodFrom(lastActiveDate(summaries[0]?.date, profile?.createdAt), daily, targets?.energy ?? 2200, now),
    summaries,
    today: daily.get(toDayKey(now)) ?? EMPTY_MACROS,
    level: computeLevel(counts.workouts, counts.meals),
    streak: computeStreak(activeDays, now),
  };
}

export default function Home() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const activeWorkout = useActiveWorkout();
  const [data, setData] = useState<DashboardData | null>(null);
  const [activity, setActivity] = useState<HomeActivity>(() => pickHomeActivity(phaseFor(new Date().getHours())));

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadDashboard(db).then((d) => {
        if (cancelled) return;
        if (!d.profile) router.replace('/setup');
        else setData(d);
      });
      return () => {
        cancelled = true;
      };
    }, [db])
  );

  const nextActivity = useCallback(() => {
    setActivity((prev) => pickHomeActivity(phaseFor(new Date().getHours()), prev));
  }, []);

  useEffect(() => {
    const id = setInterval(nextActivity, ACTIVITY_SWAP_MS);
    return () => clearInterval(id);
  }, [nextActivity]);

  if (!data || !data.profile || !data.targets) return <View style={styles.screen} />;

  const now = new Date();
  const thisMonth = data.summaries.filter((s) => {
    const d = new Date(s.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const monthVolume = thisMonth.reduce((sum, s) => sum + s.volume, 0);
  const lastWorkout = data.summaries[0];
  const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const daysAgo = lastWorkout ? Math.round((midnight(now) - midnight(new Date(lastWorkout.date))) / 86400000) : null;
  const lastLabel = daysAgo === null ? 'None yet' : daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;

  function startWorkout() {
    workoutStore.start();
    router.push('/workout');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <RoomScene mood={data.mood} gender={data.profile.sex} activity={activity} onPress={nextActivity}>
        <View style={[styles.hud, { top: insets.top + 10 }]}>
          <PixelFrame fill={GLASS} edge={colors.border} step={2}>
            <View style={styles.chip}>
              <PixelText variant="label" size={10} color={colors.amber}>Lv {data.level.level}</PixelText>
              <View style={{ width: 84 }}>
                <SegmentBar fraction={data.level.xpIntoLevel / data.level.xpPerLevel} color={colors.amber} segments={10} />
              </View>
            </View>
          </PixelFrame>

          <View style={styles.hudRight}>
            <PixelFrame fill={GLASS} edge={colors.border} step={2}>
              <View style={styles.chip}>
                <PixelIcon name="flame" color={colors.amber} color2="#ffe08a" px={2} />
                <PixelText variant="bold" size={16}>{data.streak}</PixelText>
              </View>
            </PixelFrame>
            <Pressable accessibilityLabel="Edit profile" onPress={() => router.push('/setup')}>
              <PixelFrame fill={GLASS} edge={colors.border} step={2}>
                <View style={styles.gear}>
                  <PixelIcon name="gear" color={colors.textDim} px={2} />
                </View>
              </PixelFrame>
            </Pressable>
          </View>
        </View>

        <View style={styles.caption}>
          <PixelFrame fill={GLASS} edge={colors.border} step={2}>
            <View style={styles.captionInner}>
              <View style={[styles.dot, { backgroundColor: MOOD_DOT[data.mood] }]} />
              <View style={{ flex: 1 }}>
                <PixelText variant="bold" size={16}>
                  {MOOD_LABEL[data.mood]} <PixelText size={14} color={colors.textDim}>{`- ${HOME_ACTIVITY_LABEL[activity].toLowerCase()}`}</PixelText>
                </PixelText>
                <PixelText size={13} color={colors.textDim}>{MOOD_BLURB[data.mood]}</PixelText>
              </View>
            </View>
          </PixelFrame>
        </View>
      </RoomScene>

      <View style={styles.body}>
        <View style={styles.dock}>
          <PixelButton
            tile
            icon="dumbbell"
            tone="teal"
            label={activeWorkout ? 'Resume Workout' : 'Start Workout'}
            onPress={startWorkout}
            style={{ flex: 1 }}
          />
          <PixelButton tile icon="bowl" tone="amber" label="Log Meal" onPress={() => router.push('/log-meal')} style={{ flex: 1 }} />
        </View>

        <PixelPanel label={`Today's fuel - ${data.profile.goal} plan`}>
          <MacroJars today={data.today} targets={data.targets} />
          <PixelButton label="Open cookbook" tone="ghost" icon="bowl" onPress={() => router.push('/cookbook')} />
        </PixelPanel>

        <View style={styles.widgets}>
          <View style={{ flex: 1.65 }}>
            <WorkoutCalendarWidget summaries={data.summaries} />
          </View>
          <View style={styles.tiles}>
            <PixelPanel label="Last workout">
              <PixelText variant="bold" size={22}>{lastLabel}</PixelText>
              <PixelText size={13} color={colors.textDim} numberOfLines={1}>{lastWorkout?.name ?? 'Time to start'}</PixelText>
            </PixelPanel>
            <PixelPanel label="This month">
              <View style={styles.tileValue}>
                <PixelIcon name="dumbbell" color={colors.teal} px={2} />
                <PixelText variant="bold" size={28}>{thisMonth.length}</PixelText>
              </View>
              <PixelText size={13} color={colors.textDim}>{formatNumber(monthVolume)} kg lifted</PixelText>
            </PixelPanel>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 48 },
  hud: { position: 'absolute', left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  hudRight: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 8 },
  gear: { padding: 10 },
  caption: { position: 'absolute', left: 10, right: 10, bottom: 10 },
  captionInner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  dot: { width: 10, height: 10 },
  body: { padding: 16, paddingTop: 20, gap: 20 },
  dock: { flexDirection: 'row', gap: 12 },
  widgets: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  tiles: { flex: 1, gap: 12 },
  tileValue: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
