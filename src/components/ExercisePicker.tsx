import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { EXERCISES, MUSCLES, type Exercise, type Muscle } from '../lib/exercises';
import { BORDER, colors, fonts } from '../theme';
import { PixelButton } from './PixelButton';
import { PixelText } from './PixelText';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (items: Exercise[]) => void;
}

export function ExercisePicker({ visible, onClose, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<Muscle | 'All'>('All');
  const [selected, setSelected] = useState<Exercise[]>([]);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => EXERCISES.filter((x) => (muscle === 'All' || x.muscle === muscle) && x.name.toLowerCase().includes(q)),
    [q, muscle]
  );
  const canCreate = q.length > 0 && !EXERCISES.some((x) => x.name.toLowerCase() === q);

  const isSelected = (name: string) => selected.some((s) => s.name === name);
  const toggle = (item: Exercise) =>
    setSelected((prev) => (isSelected(item.name) ? prev.filter((s) => s.name !== item.name) : [...prev, item]));

  function reset() {
    setQuery('');
    setMuscle('All');
    setSelected([]);
  }

  function close() {
    reset();
    onClose();
  }

  function confirm() {
    onAdd(selected);
    reset();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <PixelText weight="bold" size={20} color={colors.parchment}>Add Exercise</PixelText>
          <Pressable onPress={close} hitSlop={10}>
            <PixelText weight="bold" size={16} color={colors.butter}>Close</PixelText>
          </Pressable>
        </View>

        <TextInput
          style={styles.search}
          placeholder="Search or create an exercise"
          placeholderTextColor={colors.inkSoft}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />

        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {(['All', ...MUSCLES] as const).map((m) => (
              <Pressable key={m} onPress={() => setMuscle(m)} style={[styles.chip, muscle === m && styles.chipActive]}>
                <PixelText weight="bold" size={14} color={muscle === m ? colors.ink : colors.parchment}>{m}</PixelText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          data={filtered}
          keyExtractor={(x) => x.name}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            canCreate ? (
              <Pressable
                onPress={() => toggle({ name: query.trim(), muscle: 'Other' })}
                style={[styles.row, isSelected(query.trim()) && styles.rowActive]}
              >
                <PixelText weight="bold" color={colors.ink}>Create &quot;{query.trim()}&quot;</PixelText>
                <PixelText size={13} color={colors.inkSoft}>Custom</PixelText>
              </Pressable>
            ) : undefined
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => toggle(item)} style={[styles.row, isSelected(item.name) && styles.rowActive]}>
              <PixelText weight="bold" style={{ flex: 1 }}>{item.name}</PixelText>
              <PixelText size={13} color={colors.inkSoft}>{item.muscle}</PixelText>
            </Pressable>
          )}
        />

        <View style={styles.footer}>
          <PixelButton
            label={selected.length === 0 ? 'Select exercises' : `Add ${selected.length} exercise${selected.length === 1 ? '' : 's'}`}
            color={colors.moss}
            disabled={selected.length === 0}
            onPress={confirm}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night, paddingTop: 56 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  search: {
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderWidth: BORDER,
    borderColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: fonts.regular,
    fontSize: 17,
    color: colors.ink,
  },
  chips: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  chip: { borderWidth: 2, borderColor: colors.parchment, paddingHorizontal: 10, paddingVertical: 4 },
  chipActive: { backgroundColor: colors.butter, borderColor: colors.butter },
  list: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: colors.parchment,
    borderWidth: 3,
    borderColor: colors.ink,
    padding: 12,
  },
  rowActive: { backgroundColor: colors.moss },
  footer: { padding: 20, paddingBottom: 32 },
});
