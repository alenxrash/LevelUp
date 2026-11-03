import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { workoutStore, type DraftExercise, type DraftSet } from '../lib/activeWorkout';
import { colors, fonts } from '../theme';
import { PixelButton } from './PixelButton';
import { PixelFrame } from './PixelFrame';
import { PixelIcon } from './PixelIcon';
import { PixelPanel } from './PixelPanel';
import { PixelText } from './PixelText';

function NumberField({ value, placeholder, editable, keyboardType, onChange }: {
  value: string;
  placeholder: string;
  editable: boolean;
  keyboardType: 'decimal-pad' | 'number-pad';
  onChange: (v: string) => void;
}) {
  return (
    <PixelFrame fill={colors.panelDeep} edge={colors.border} step={2} style={styles.numCol}>
      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType={keyboardType}
        editable={editable}
        onChangeText={onChange}
      />
    </PixelFrame>
  );
}

function SetRow({ exercise, set, index }: { exercise: DraftExercise; set: DraftSet; index: number }) {
  const prev = exercise.previous[index];
  const prevLabel = prev ? `${prev.weight}kg x ${prev.reps}` : '-';

  return (
    <View style={[styles.row, set.done && styles.rowDone]}>
      <PixelText variant="bold" size={15} color={set.done ? colors.teal : colors.textDim} style={styles.setCol}>{index + 1}</PixelText>

      <Pressable
        style={styles.prevCol}
        disabled={!prev}
        onPress={() => workoutStore.updateSet(exercise.id, set.id, { kg: String(prev.weight), reps: String(prev.reps) })}
      >
        <PixelText size={13} color={colors.textFaint} numberOfLines={1}>{prevLabel}</PixelText>
      </Pressable>

      <NumberField
        value={set.kg}
        placeholder={prev ? String(prev.weight) : '0'}
        keyboardType="decimal-pad"
        editable={!set.done}
        onChange={(kg) => workoutStore.updateSet(exercise.id, set.id, { kg })}
      />
      <NumberField
        value={set.reps}
        placeholder={prev ? String(prev.reps) : '0'}
        keyboardType="number-pad"
        editable={!set.done}
        onChange={(reps) => workoutStore.updateSet(exercise.id, set.id, { reps })}
      />

      <Pressable
        accessibilityLabel={set.done ? 'Mark set incomplete' : 'Complete set'}
        onPress={() => workoutStore.toggleSet(exercise.id, set.id)}
      >
        <PixelFrame fill={set.done ? colors.teal : colors.panelDeep} edge={set.done ? '#b4f0e6' : colors.borderHi} step={2} style={styles.check}>
          {set.done ? (
            <View style={styles.checkIcon}>
              <PixelIcon name="check" color="#16302c" px={3} />
            </View>
          ) : null}
        </PixelFrame>
      </Pressable>

      <Pressable accessibilityLabel="Delete set" onPress={() => workoutStore.removeSet(exercise.id, set.id)} hitSlop={6} style={styles.delCol}>
        <PixelIcon name="x" color={colors.textFaint} px={2} />
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
            <PixelText variant="bold" size={18} style={{ flexShrink: 1 }}>{exercise.name}</PixelText>
          </View>
          <PixelText variant="label" size={9} color={colors.textFaint}>{exercise.muscle}</PixelText>
        </Pressable>
        <Pressable onPress={() => workoutStore.removeExercise(exercise.id)} hitSlop={8}>
          <PixelText variant="label" size={10} color={colors.danger}>Remove</PixelText>
        </Pressable>
      </View>

      <View style={styles.row}>
        <PixelText variant="label" size={9} style={styles.setCol}>Set</PixelText>
        <PixelText variant="label" size={9} style={styles.prevCol}>Previous</PixelText>
        <PixelText variant="label" size={9} style={[styles.numCol, styles.centered]}>Kg</PixelText>
        <PixelText variant="label" size={9} style={[styles.numCol, styles.centered]}>Reps</PixelText>
        <View style={styles.check} />
        <View style={styles.delCol} />
      </View>

      <View style={{ gap: 6 }}>
        {exercise.sets.map((set, i) => (
          <SetRow key={set.id} exercise={exercise} set={set} index={i} />
        ))}
      </View>

      <PixelButton label="Add Set" tone="ghost" icon="plus" onPress={() => workoutStore.addSet(exercise.id)} />
    </PixelPanel>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  focusDot: { width: 8, height: 8, backgroundColor: colors.teal },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 },
  rowDone: { backgroundColor: 'rgba(111,214,195,0.10)' },
  setCol: { width: 24, paddingLeft: 2 },
  prevCol: { flex: 1 },
  numCol: { width: 54 },
  centered: { textAlign: 'center' },
  delCol: { width: 16, alignItems: 'center' },
  input: {
    position: 'relative',
    height: 34,
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
    padding: 0,
  },
  check: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  checkIcon: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
