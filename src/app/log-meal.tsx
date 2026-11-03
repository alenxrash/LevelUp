import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { PixelButton } from '../components/PixelButton';
import { PixelInput } from '../components/PixelInput';
import { PixelPanel } from '../components/PixelPanel';
import { PixelText } from '../components/PixelText';
import { getTodaysMeals, saveMeal, type MealEntry } from '../lib/db';
import { colors } from '../theme';

export default function LogMeal() {
  const db = useSQLiteContext();
  const [name, setName] = useState('');
  const [energy, setEnergy] = useState('');
  const [carbs, setCarbs] = useState('');
  const [protein, setProtein] = useState('');
  const [saving, setSaving] = useState(false);
  const [todays, setTodays] = useState<MealEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getTodaysMeals(db).then((m) => {
        if (!cancelled) setTodays(m);
      });
      return () => {
        cancelled = true;
      };
    }, [db])
  );

  const canSave = name.trim().length > 0 && Number(energy) > 0;

  async function addMeal(thenClose: boolean) {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await saveMeal(db, {
        name: name.trim(),
        energy: Number(energy),
        carbs: Number(carbs) || 0,
        protein: Number(protein) || 0,
      });
      if (thenClose) {
        router.back();
        return;
      }
      setName('');
      setEnergy('');
      setCarbs('');
      setProtein('');
      setTodays(await getTodaysMeals(db));
    } finally {
      setSaving(false);
    }
  }

  const total = todays.reduce((sum, m) => sum + m.energy, 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <PixelPanel label="New meal">
        <PixelInput label="Meal" placeholder="Chicken & rice" value={name} onChangeText={setName} />
        <PixelInput label="Energy (kcal)" placeholder="650" keyboardType="numeric" value={energy} onChangeText={setEnergy} />
        <View style={styles.row}>
          <PixelInput label="Carbs (g)" placeholder="70" keyboardType="numeric" value={carbs} onChangeText={setCarbs} />
          <PixelInput label="Protein (g)" placeholder="45" keyboardType="numeric" value={protein} onChangeText={setProtein} />
        </View>
        <PixelButton label="Add & Log Another" tone="ghost" icon="plus" onPress={() => addMeal(false)} disabled={!canSave || saving} />
      </PixelPanel>

      <PixelPanel label={`Eaten today (${todays.length})`}>
        {todays.length === 0 ? (
          <PixelText color={colors.textFaint}>Nothing logged yet today.</PixelText>
        ) : (
          <View style={styles.list}>
            {todays.map((m) => (
              <View key={m.id} style={styles.mealRow}>
                <PixelText variant="bold" size={16} style={{ flex: 1 }}>{m.name}</PixelText>
                <PixelText color={colors.textDim}>{Math.round(m.energy)} kcal</PixelText>
              </View>
            ))}
            <View style={styles.totalRow}>
              <PixelText variant="label" size={10}>Total</PixelText>
              <PixelText variant="bold" color={colors.amber}>{Math.round(total)} kcal</PixelText>
            </View>
          </View>
        )}
      </PixelPanel>

      <PixelButton
        label={saving ? 'Saving...' : 'Add Meal  +10 XP'}
        tone="amber"
        icon="bowl"
        onPress={() => addMeal(true)}
        disabled={!canSave || saving}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingTop: 20, gap: 18 },
  row: { flexDirection: 'row', gap: 12 },
  list: { gap: 8 },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 2, borderColor: colors.border, paddingTop: 8, marginTop: 4 },
});
