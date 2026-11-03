import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { AvatarRoom } from '../components/AvatarRoom';
import { formatDuration, formatNumber } from '../components/CalendarWidget';
import { ConfirmModal } from '../components/ConfirmModal';
import { ExerciseCard } from '../components/ExerciseCard';
import { ExercisePicker } from '../components/ExercisePicker';
import { PixelButton } from '../components/PixelButton';
import { PixelInput } from '../components/PixelInput';
import { PixelPanel } from '../components/PixelPanel';
import { PixelText } from '../components/PixelText';
import { useActiveWorkout, workoutStore, workoutTotals } from '../lib/activeWorkout';
import type { Mood } from '../lib/character';
import { NUTRITION_WINDOW_DAYS } from '../lib/character';
import { getDailyMacros, getPreviousSets, getWorkoutSummaries, saveWorkout } from '../lib/db';
import { routineFor, type Exercise } from '../lib/exercises';
import { moodFrom } from '../lib/mood';
import { ROUTINE_LABEL, type Activity } from '../lib/sprite';
import { useNow } from '../lib/useNow';
import { colors } from '../theme';

interface Result {
  name: string;
  durationSec: number;
  volume: number;
  sets: number;
}

const XP_FOR_WORKOUT = 50;

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

function clock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <PixelText size={12} color={colors.inkSoft} weight="bold">{label}</PixelText>
      <PixelText size={20} weight="bold">{value}</PixelText>
    </View>
  );
}

export default function WorkoutScreen() {
  const db = useSQLiteContext();
  const workout = useActiveWorkout();
  const now = useNow(1000);
  const [mood, setMood] = useState<Mood>('thriving');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let cancelled = false;
    const t = new Date();
    Promise.all([getWorkoutSummaries(db), getDailyMacros(db, NUTRITION_WINDOW_DAYS, t)]).then(([summaries, daily]) => {
      if (!cancelled) setMood(moodFrom(summaries[0] ? new Date(summaries[0].date) : null, daily, t));
    });
    return () => {
      cancelled = true;
    };
  }, [db]);

  const restEndsAt = workout?.restEndsAt ?? null;
  const restLeft = restEndsAt ? Math.ceil((restEndsAt - now) / 1000) : null;

  useEffect(() => {
    if (restLeft !== null && restLeft <= 0) workoutStore.skipRest();
  }, [restLeft]);

  useEffect(() => {
    if (!workout && !result) leave();
  }, [workout, result]);

  if (result) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <AvatarRoom mood="thriving" compact />
        <PixelPanel title="Workout Complete">
          <PixelText weight="bold" size={20} style={{ marginBottom: 12 }}>{result.name}</PixelText>
          <View style={styles.statRow}>
            <Stat label="TIME" value={formatDuration(result.durationSec) || '1m'} />
            <Stat label="VOLUME" value={`${formatNumber(result.volume)} kg`} />
            <Stat label="SETS" value={String(result.sets)} />
          </View>
          <PixelText weight="bold" color={colors.mossDark} style={{ marginTop: 14 }}>+{XP_FOR_WORKOUT} XP earned</PixelText>
        </PixelPanel>
        <PixelButton label="Done" color={colors.moss} onPress={leave} />
      </ScrollView>
    );
  }

  if (!workout) return <View style={styles.screen} />;

  const totals = workoutTotals(workout);
  const resting = restLeft !== null && restLeft > 0;
  const focused = workout.exercises.find((e) => e.id === workout.focusedId);
  const routine = focused ? routineFor(focused.name) : null;
  const activity: Activity = !resting && routine ? routine : 'idle';
  const caption = resting
    ? 'Catching a breather...'
    : routine
      ? `Doing ${ROUTINE_LABEL[routine].toLowerCase()} with you`
      : 'Add an exercise to get moving';
  const unfinishedSets = workout.exercises.reduce((n, e) => n + e.sets.filter((s) => !s.done).length, 0);

  async function addExercises(items: Exercise[]) {
    setPickerOpen(false);
    const withPrevious = await Promise.all(
      items.map(async (item) => ({ ...item, previous: await getPreviousSets(db, item.name) }))
    );
    workoutStore.addExercises(withPrevious);
  }

  async function finish() {
    const finished = workoutStore.buildFinished();
    if (!finished || saving) return;
    setSaving(true);
    try {
      await saveWorkout(db, finished);
      const sets = finished.exercises.reduce((n, e) => n + e.sets.length, 0);
      const volume = finished.exercises.reduce((n, e) => n + e.sets.reduce((v, s) => v + s.weight * s.reps, 0), 0);
      setResult({ name: finished.name, durationSec: finished.durationSec, volume, sets });
      workoutStore.discard();
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, resting && { paddingBottom: 140 }]} keyboardShouldPersistTaps="handled">
        <PixelInput label="Workout name" value={workout.name} onChangeText={workoutStore.rename} />

        <PixelPanel>
          <View style={styles.statRow}>
            <Stat label="DURATION" value={clock(Math.floor((now - workout.startedAt) / 1000))} />
            <Stat label="VOLUME" value={`${formatNumber(totals.volume)} kg`} />
            <Stat label="SETS" value={String(totals.sets)} />
          </View>
        </PixelPanel>

        <View>
          <AvatarRoom mood={mood} activity={activity} compact />
          <View style={styles.caption}>
            <PixelText size={14} color={colors.parchment}>{caption}</PixelText>
          </View>
        </View>

        {workout.exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} focused={exercise.id === workout.focusedId} />
        ))}

        <PixelButton label="+ Add Exercise" color={colors.sky} onPress={() => setPickerOpen(true)} />

        <View style={{ gap: 14 }}>
          <PixelButton
            label={saving ? 'Saving...' : `Finish Workout  +${XP_FOR_WORKOUT} XP`}
            color={colors.moss}
            disabled={totals.sets === 0 || saving}
            onPress={finish}
          />
          {totals.sets === 0 ? (
            <PixelText size={13} color={colors.parchmentDark} style={styles.hint}>Complete at least one set to finish.</PixelText>
          ) : unfinishedSets > 0 ? (
            <PixelText size={13} color={colors.parchmentDark} style={styles.hint}>
              {unfinishedSets} unfinished set{unfinishedSets === 1 ? '' : 's'} will be discarded.
            </PixelText>
          ) : null}
          <PixelButton label="Discard Workout" color={colors.terracotta} onPress={() => setConfirmDiscard(true)} />
        </View>
      </ScrollView>

      {resting && restLeft !== null ? (
        <View style={styles.restBar}>
          <PixelPanel tone="night">
            <View style={styles.restRow}>
              <View>
                <PixelText size={12} weight="bold" color={colors.butter}>REST</PixelText>
                <PixelText size={26} weight="bold" color={colors.parchment}>{clock(restLeft)}</PixelText>
              </View>
              <View style={styles.restButtons}>
                <PixelButton label="-15" color={colors.parchmentDark} onPress={() => workoutStore.adjustRest(-15)} />
                <PixelButton label="+15" color={colors.parchmentDark} onPress={() => workoutStore.adjustRest(15)} />
                <PixelButton label="Skip" color={colors.butter} onPress={() => workoutStore.skipRest()} />
              </View>
            </View>
          </PixelPanel>
        </View>
      ) : null}

      <ExercisePicker visible={pickerOpen} onClose={() => setPickerOpen(false)} onAdd={addExercises} />
      <ConfirmModal
        visible={confirmDiscard}
        title="Discard Workout"
        message="This throws away everything you've logged in this workout."
        confirmLabel="Discard"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          workoutStore.discard();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  content: { padding: 20, paddingTop: 24, paddingBottom: 48, gap: 24 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { gap: 2 },
  caption: { backgroundColor: colors.ink, paddingVertical: 6, paddingHorizontal: 12 },
  hint: { textAlign: 'center' },
  restBar: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  restRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  restButtons: { flexDirection: 'row', gap: 8 },
});
