import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { formatDuration, formatNumber } from '../components/CalendarWidget';
import { ConfirmModal } from '../components/ConfirmModal';
import { ExerciseCard } from '../components/ExerciseCard';
import { ExercisePicker } from '../components/ExercisePicker';
import { PixelButton } from '../components/PixelButton';
import { PixelFrame } from '../components/PixelFrame';
import { PixelInput } from '../components/PixelInput';
import { PixelPanel } from '../components/PixelPanel';
import { PixelText } from '../components/PixelText';
import { RoomScene } from '../components/RoomScene';
import { useActiveWorkout, workoutStore, workoutTotals } from '../lib/activeWorkout';
import { NUTRITION_WINDOW_DAYS, type Mood } from '../lib/character';
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
const GLASS = 'rgba(18,14,36,0.8)';

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
      <PixelText variant="label" size={9}>{label}</PixelText>
      <PixelText variant="bold" size={22}>{value}</PixelText>
    </View>
  );
}

function Caption({ text }: { text: string }) {
  return (
    <View style={styles.caption}>
      <PixelFrame fill={GLASS} edge={colors.border} step={2}>
        <PixelText size={14} style={styles.captionText}>{text}</PixelText>
      </PixelFrame>
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
      <ScrollView style={styles.screen} contentContainerStyle={styles.summary}>
        <RoomScene mood="thriving" compact>
          <Caption text="Nice work. See you next session." />
        </RoomScene>
        <View style={styles.summaryBody}>
          <PixelPanel label="Workout complete">
            <PixelText variant="bold" size={22}>{result.name}</PixelText>
            <View style={styles.statRow}>
              <Stat label="Time" value={formatDuration(result.durationSec) || '1m'} />
              <Stat label="Volume" value={`${formatNumber(result.volume)} kg`} />
              <Stat label="Sets" value={String(result.sets)} />
            </View>
            <PixelText variant="bold" color={colors.amber}>+{XP_FOR_WORKOUT} XP</PixelText>
          </PixelPanel>
          <PixelButton label="Done" tone="teal" onPress={leave} />
        </View>
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
      <ScrollView contentContainerStyle={[styles.scroll, resting && { paddingBottom: 150 }]} keyboardShouldPersistTaps="handled">
        <RoomScene mood={mood} activity={activity} compact>
          <Caption text={caption} />
        </RoomScene>

        <View style={styles.body}>
          <PixelInput label="Workout name" value={workout.name} onChangeText={workoutStore.rename} />

          <PixelPanel>
            <View style={styles.statRow}>
              <Stat label="Duration" value={clock(Math.floor((now - workout.startedAt) / 1000))} />
              <Stat label="Volume" value={`${formatNumber(totals.volume)} kg`} />
              <Stat label="Sets" value={String(totals.sets)} />
            </View>
          </PixelPanel>

          {workout.exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} focused={exercise.id === workout.focusedId} />
          ))}

          <PixelButton label="Add Exercise" tone="lilac" icon="plus" onPress={() => setPickerOpen(true)} />

          <View style={{ gap: 10 }}>
            <PixelButton
              label={saving ? 'Saving...' : `Finish Workout  +${XP_FOR_WORKOUT} XP`}
              tone="teal"
              disabled={totals.sets === 0 || saving}
              onPress={finish}
            />
            {totals.sets === 0 ? (
              <PixelText size={13} color={colors.textFaint} style={styles.hint}>Complete at least one set to finish.</PixelText>
            ) : unfinishedSets > 0 ? (
              <PixelText size={13} color={colors.textFaint} style={styles.hint}>
                {unfinishedSets} unfinished set{unfinishedSets === 1 ? '' : 's'} will be discarded.
              </PixelText>
            ) : null}
            <PixelButton label="Discard Workout" tone="danger" onPress={() => setConfirmDiscard(true)} />
          </View>
        </View>
      </ScrollView>

      {resting && restLeft !== null ? (
        <View style={styles.restBar}>
          <PixelFrame fill={colors.panel} edge={colors.amber} step={3}>
            <View style={styles.restRow}>
              <View>
                <PixelText variant="label" size={10} color={colors.amber}>Rest</PixelText>
                <PixelText variant="bold" size={28}>{clock(restLeft)}</PixelText>
              </View>
              <View style={styles.restButtons}>
                <PixelButton label="-15" tone="ghost" onPress={() => workoutStore.adjustRest(-15)} />
                <PixelButton label="+15" tone="ghost" onPress={() => workoutStore.adjustRest(15)} />
                <PixelButton label="Skip" tone="amber" onPress={() => workoutStore.skipRest()} />
              </View>
            </View>
          </PixelFrame>
        </View>
      ) : null}

      <ExercisePicker visible={pickerOpen} onClose={() => setPickerOpen(false)} onAdd={addExercises} />
      <ConfirmModal
        visible={confirmDiscard}
        title="Discard workout"
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
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 48 },
  body: { padding: 16, paddingTop: 20, gap: 18 },
  summary: { paddingBottom: 48 },
  summaryBody: { padding: 16, paddingTop: 20, gap: 18 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { gap: 4 },
  caption: { position: 'absolute', left: 10, right: 10, bottom: 10 },
  captionText: { paddingHorizontal: 12, paddingVertical: 9 },
  hint: { textAlign: 'center' },
  restBar: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  restRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: 12 },
  restButtons: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});
