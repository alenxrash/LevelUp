import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { EXERCISES, MUSCLES, type Exercise, type Muscle } from '../lib/exercises';
import { colors, fonts } from '../theme';
import { PixelButton } from './PixelButton';
import { PixelFrame } from './PixelFrame';
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

  const renderRow = (item: Exercise, custom = false) => {
    const on = isSelected(item.name);
    return (
      <Pressable onPress={() => toggle(item)}>
        <PixelFrame fill={on ? '#1f4a47' : colors.panel} edge={on ? colors.teal : colors.border} step={2}>
          <View style={styles.row}>
            <PixelText variant="bold" size={16} style={{ flex: 1 }}>{custom ? `Create "${item.name}"` : item.name}</PixelText>
            <PixelText variant="label" size={9} color={colors.textFaint}>{custom ? 'Custom' : item.muscle}</PixelText>
          </View>
        </PixelFrame>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <PixelText variant="bold" size={22}>Add Exercise</PixelText>
          <Pressable onPress={close} hitSlop={10}>
            <PixelText variant="label" size={11} color={colors.amber}>Close</PixelText>
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <PixelFrame fill={colors.panelDeep} edge={colors.border} step={2}>
            <TextInput
              style={styles.search}
              placeholder="Search or create an exercise"
              placeholderTextColor={colors.textFaint}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
          </PixelFrame>
        </View>

        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {(['All', ...MUSCLES] as const).map((m) => (
              <Pressable key={m} onPress={() => setMuscle(m)}>
                <PixelFrame fill={muscle === m ? colors.amber : colors.panel} edge={muscle === m ? '#ffd9a8' : colors.border} step={2}>
                  <PixelText variant="label" size={10} color={muscle === m ? '#2a1d3f' : colors.textDim} style={styles.chip}>{m}</PixelText>
                </PixelFrame>
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
          ListHeaderComponent={canCreate ? renderRow({ name: query.trim(), muscle: 'Other' }, true) : undefined}
          renderItem={({ item }) => renderRow(item)}
        />

        <View style={styles.footer}>
          <PixelButton
            label={selected.length === 0 ? 'Select exercises' : `Add ${selected.length} exercise${selected.length === 1 ? '' : 's'}`}
            tone="teal"
            disabled={selected.length === 0}
            onPress={confirm}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingTop: 56 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14 },
  searchWrap: { paddingHorizontal: 20 },
  search: { position: 'relative', paddingHorizontal: 12, paddingVertical: 10, fontFamily: fonts.body, fontSize: 17, color: colors.text },
  chips: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6 },
  list: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  footer: { padding: 20, paddingBottom: 32 },
});
