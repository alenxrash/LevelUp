import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { PixelButton } from '../components/PixelButton';
import { PixelInput } from '../components/PixelInput';
import { PixelPanel } from '../components/PixelPanel';
import { PixelText } from '../components/PixelText';
import { saveWorkoutSession, type WorkoutSetInput } from '../lib/db';
import { colors } from '../theme';

interface DraftSet extends WorkoutSetInput {
  id: string;
}

export default function LogWorkout() {
  const db = useSQLiteContext();
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState<DraftSet[]>([]);
  const [saving, setSaving] = useState(false);

  const canAddSet = exercise.trim().length > 0 && weight !== '' && Number(weight) >= 0 && Number(reps) > 0;

  function addSet() {
    if (!canAddSet) return;
    setSets((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, exercise: exercise.trim(), weight: Number(weight), reps: Number(reps) },
    ]);
    setWeight('');
    setReps('');
  }

  async function finishWorkout() {
    if (sets.length === 0 || saving) return;
    setSaving(true);
    try {
      await saveWorkoutSession(db, sets);
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <PixelPanel title="New Set">
        <View style={styles.form}>
          <PixelInput label="Exercise" placeholder="Bench Press" value={exercise} onChangeText={setExercise} />
          <View style={styles.row}>
            <PixelInput label="Weight" placeholder="60" keyboardType="numeric" value={weight} onChangeText={setWeight} />
            <PixelInput label="Reps" placeholder="8" keyboardType="numeric" value={reps} onChangeText={setReps} />
          </View>
          <PixelButton label="Add Set" color={colors.sky} onPress={addSet} disabled={!canAddSet} />
        </View>
      </PixelPanel>

      <PixelPanel title={`Sets (${sets.length})`}>
        {sets.length === 0 ? (
          <PixelText color={colors.inkSoft}>No sets yet. Add your first one above.</PixelText>
        ) : (
          <View style={styles.setList}>
            {sets.map((s, i) => (
              <View key={s.id} style={styles.setRow}>
                <PixelText weight="bold">{i + 1}.</PixelText>
                <PixelText style={{ flex: 1 }}>{s.exercise}</PixelText>
                <PixelText color={colors.inkSoft}>{s.weight} x {s.reps}</PixelText>
                <PixelText
                  weight="bold"
                  color={colors.berry}
                  onPress={() => setSets((prev) => prev.filter((x) => x.id !== s.id))}
                >
                  X
                </PixelText>
              </View>
            ))}
          </View>
        )}
      </PixelPanel>

      <PixelButton
        label={saving ? 'Saving...' : 'Finish Workout  +50 XP'}
        color={colors.moss}
        onPress={finishWorkout}
        disabled={sets.length === 0 || saving}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  content: { padding: 20, paddingTop: 28, gap: 28 },
  form: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  setList: { gap: 8 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
