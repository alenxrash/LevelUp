import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { saveWorkoutSession, type WorkoutSetInput } from '../lib/db';

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

  const canAddSet = exercise.trim().length > 0 && Number(weight) >= 0 && Number(reps) > 0;

  function addSet() {
    if (!canAddSet) return;
    setSets((prev) => [
      ...prev,
      { id: `${Date.now()}`, exercise: exercise.trim(), weight: Number(weight), reps: Number(reps) },
    ]);
    setWeight('');
    setReps('');
  }

  function removeSet(id: string) {
    setSets((prev) => prev.filter((s) => s.id !== id));
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
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Exercise (e.g. Bench Press)"
          placeholderTextColor="#6f7890"
          value={exercise}
          onChangeText={setExercise}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="Weight"
            placeholderTextColor="#6f7890"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="Reps"
            placeholderTextColor="#6f7890"
            keyboardType="numeric"
            value={reps}
            onChangeText={setReps}
          />
        </View>
        <Pressable style={[styles.addButton, !canAddSet && styles.buttonDisabled]} onPress={addSet} disabled={!canAddSet}>
          <Text style={styles.addButtonText}>Add Set</Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.list}
        data={sets}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No sets added yet</Text>}
        renderItem={({ item }) => (
          <View style={styles.setRow}>
            <Text style={styles.setText}>
              {item.exercise} — {item.weight} × {item.reps}
            </Text>
            <Pressable onPress={() => removeSet(item.id)}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        )}
      />

      <Pressable
        style={[styles.finishButton, (sets.length === 0 || saving) && styles.buttonDisabled]}
        onPress={finishWorkout}
        disabled={sets.length === 0 || saving}
      >
        <Text style={styles.finishButtonText}>{saving ? 'Saving…' : 'Finish Workout'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2430',
    padding: 20,
    gap: 16,
  },
  form: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowInput: {
    flex: 1,
  },
  input: {
    backgroundColor: '#2a3040',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3a4256',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  emptyText: {
    color: '#6f7890',
    textAlign: 'center',
    marginTop: 24,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a3040',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  setText: {
    color: '#fff',
    fontSize: 15,
  },
  removeText: {
    color: '#e0767a',
    fontSize: 13,
  },
  finishButton: {
    backgroundColor: '#36c2a4',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#0e2a24',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
