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

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <PixelPanel title="New Meal">
        <View style={styles.form}>
          <PixelInput label="Meal" placeholder="Chicken & rice" value={name} onChangeText={setName} />
          <View style={styles.row}>
            <PixelInput label="Energy (kcal)" placeholder="650" keyboardType="numeric" value={energy} onChangeText={setEnergy} />
          </View>
          <View style={styles.row}>
            <PixelInput label="Carbs (g)" placeholder="70" keyboardType="numeric" value={carbs} onChangeText={setCarbs} />
            <PixelInput label="Protein (g)" placeholder="45" keyboardType="numeric" value={protein} onChangeText={setProtein} />
          </View>
          <PixelButton label="Add & Log Another" color={colors.sky} onPress={() => addMeal(false)} disabled={!canSave || saving} />
        </View>
      </PixelPanel>

      <PixelPanel title={`Eaten Today (${todays.length})`}>
        {todays.length === 0 ? (
          <PixelText color={colors.inkSoft}>Nothing logged yet today.</PixelText>
        ) : (
          <View style={styles.list}>
            {todays.map((m) => (
              <View key={m.id} style={styles.mealRow}>
                <PixelText weight="bold" style={{ flex: 1 }}>{m.name}</PixelText>
                <PixelText color={colors.inkSoft}>{Math.round(m.energy)} kcal</PixelText>
              </View>
            ))}
          </View>
        )}
      </PixelPanel>

      <PixelButton
        label={saving ? 'Saving...' : 'Add Meal  +10 XP'}
        color={colors.butter}
        onPress={() => addMeal(true)}
        disabled={!canSave || saving}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  content: { padding: 20, paddingTop: 28, gap: 28 },
  form: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  list: { gap: 8 },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
