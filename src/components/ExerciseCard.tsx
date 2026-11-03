import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { workoutStore, type DraftExercise, type DraftSet } from '../lib/activeWorkout';
import { colors, fonts } from '../theme';
import { PixelButton } from './PixelButton';
import { PixelPanel } from './PixelPanel';
import { PixelText } from './PixelText';

function SetRow({ exercise, set, index }: { exercise: DraftExercise; set: DraftSet; index: number }) {
  const prev = exercise.previous[index];
  const prevLabel = prev ? `${prev.weight}kg x ${prev.reps}` : '-';

  return (
    <View style={[styles.row, set.done && styles.rowDone]}>
      <PixelText weight="bold" style={styles.setCol}>{index + 1}</PixelText>

      <Pressable
        style={styles.prevCol}
        disabled={!prev}
        onPress={() => workoutStore.updateSet(exercise.id, set.id, { kg: String(prev.weight), reps: String(prev.reps) })}
      >
        <PixelText size={13} color={colors.inkSoft} numberOfLines={1}>{prevLabel}</PixelText>
      </Pressable>

      <TextInput
        style={[styles.input, styles.numCol]}
        value={set.kg}
        placeholder={prev ? String(prev.weight) : '0'}
        placeholderTextColor={colors.parchmentDark}
        keyboardType="decimal-pad"
        editable={!set.done}
        onChangeText={(kg) => workoutStore.updateSet(exercise.id, set.id, { kg })}
      />
      <TextInput
        style={[styles.input, styles.numCol]}
        value={set.reps}
        placeholder={prev ? String(prev.reps) : '0'}
        placeholderTextColor={colors.parchmentDark}
        keyboardType="number-pad"
        editable={!set.done}
        onChangeText={(reps) => workoutStore.updateSet(exercise.id, set.id, { reps })}
      />

      <Pressable
        accessibilityLabel={set.done ? 'Mark set incomplete' : 'Complete set'}
        onPress={() => workoutStore.toggleSet(exercise.id, set.id)}
        style={[styles.check, set.done && styles.checkDone]}
      >
        {set.done ? <View style={styles.checkMark} /> : null}
      </Pressable>

      <Pressable accessibilityLabel="Delete set" onPress={() => workoutStore.removeSet(exercise.id, set.id)} hitSlop={6} style={styles.delCol}>
        <PixelText weight="bold" size={14} color={colors.berry}>x</PixelText>
      </Pressable>
    </View>
  );
}

export function ExerciseCard({ exercise, focused }: { exercise: DraftExercise; focused: boolean }) {
  return (
    <PixelPanel>
      <View style={styles.header}>
        <Pressable style={{ flex: 1 }} onPress={() => workoutStore.setFocus(exercise.id)}>
          <View style={styles.titleRow}>
            {focused ? <View style={styles.focusDot} /> : null}
            <PixelText weight="bold" size={18} style={{ flexShrink: 1 }}>{exercise.name}</PixelText>
          </View>
          <PixelText size={13} color={colors.inkSoft}>{exercise.muscle}</PixelText>
        </Pressable>
        <Pressable onPress={() => workoutStore.removeExercise(exercise.id)} hitSlop={8}>
          <PixelText weight="bold" size={14} color={colors.berry}>Remove</PixelText>
        </Pressable>
      </View>

      <View style={styles.row}>
        <PixelText weight="bold" size={12} color={colors.inkSoft} style={styles.setCol}>SET</PixelText>
        <PixelText weight="bold" size={12} color={colors.inkSoft} style={styles.prevCol}>PREVIOUS</PixelText>
        <PixelText weight="bold" size={12} color={colors.inkSoft} style={[styles.numCol, styles.centered]}>KG</PixelText>
        <PixelText weight="bold" size={12} color={colors.inkSoft} style={[styles.numCol, styles.centered]}>REPS</PixelText>
        <View style={styles.checkSpacer} />
        <View style={styles.delCol} />
      </View>

      <View style={{ gap: 6 }}>
        {exercise.sets.map((set, i) => (
          <SetRow key={set.id} exercise={exercise} set={set} index={i} />
        ))}
      </View>

      <PixelButton label="+ Add Set" color={colors.parchmentDark} onPress={() => workoutStore.addSet(exercise.id)} style={{ marginTop: 12 }} />
    </PixelPanel>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  focusDot: { width: 10, height: 10, backgroundColor: colors.moss, borderWidth: 2, borderColor: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 2 },
  rowDone: { backgroundColor: 'rgba(127,176,105,0.35)' },
  setCol: { width: 26 },
  prevCol: { flex: 1 },
  numCol: { width: 54 },
  centered: { textAlign: 'center' },
  delCol: { width: 16, alignItems: 'center' },
  input: {
    height: 34,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.ink,
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
    padding: 0,
  },
  check: { width: 30, height: 30, borderWidth: 3, borderColor: colors.ink, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  checkSpacer: { width: 30 },
  checkDone: { backgroundColor: colors.moss },
  checkMark: { width: 12, height: 12, backgroundColor: colors.ink },
});
