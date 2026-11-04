import React, { useCallback, useRef, useState } from 'react';
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
  const [fat, setFat] = useState('');
  const [error, setError] = useState('');
  const saveLock = useRef(false);
  const [saving, setSaving] = useState(false);
  const [todays, setTodays] = useState<MealEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getTodaysMeals(db).then((m) => {
        if (!cancelled) setTodays(m);
      }).catch(() => { if (!cancelled) setError('Could not load today’s meals. Reopen this screen to retry.'); });
      return () => {
        cancelled = true;
      };
    }, [db])
  );

  const canSave = [energy, carbs, protein, fat].every((value) => Number.isFinite(Number(value)) && Number(value) >= 0);

  async function addMeal(thenClose: boolean) {
    if (!canSave || saveLock.current) return;
    saveLock.current = true;
    setError('');
    setSaving(true);
    try {
      await saveMeal(db, {
        name: name.trim(),
        energy: Number(energy),
        carbs: Number(carbs) || 0,
        protein: Number(protein) || 0,
        fat: Number(fat) || 0,
      });
      if (thenClose) {
        router.back();
        return;
      }
      setName('');
      setEnergy('');
      setCarbs('');
      setProtein('');
      setFat('');
      try { setTodays(await getTodaysMeals(db)); }
      catch { setError('Meal saved, but the list could not refresh. Reopen this screen to refresh it.'); }
    } catch {
      setError('Could not save your meal. Please try again.');
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  }

  const total = todays.reduce((sum, m) => sum + m.energy, 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <PixelPanel label="Pick from your cookbook">
        <PixelText color={colors.textDim}>Ready-to-cook recipes with macros already filled in.</PixelText>
        <PixelButton label="Browse the recipe shelf" tone="teal" icon="bowl" onPress={() => router.push('/cookbook')} />
      </PixelPanel>
      {error ? <PixelText accessibilityRole="alert" color={colors.danger}>{error}</PixelText> : null}
      <PixelPanel label="New meal">
        <PixelInput label="Meal" placeholder="Chicken & rice" value={name} onChangeText={setName} />
        <PixelInput label="Energy (kcal)" placeholder="650" keyboardType="numeric" value={energy} onChangeText={setEnergy} />
        <View style={styles.row}>
          <PixelInput label="Carbs (g)" placeholder="70" keyboardType="numeric" value={carbs} onChangeText={setCarbs} />
          <PixelInput label="Protein (g)" placeholder="45" keyboardType="numeric" value={protein} onChangeText={setProtein} />
        </View>
        <PixelInput label="Fat (g)" placeholder="15" keyboardType="numeric" value={fat} onChangeText={setFat} />
        <PixelButton label="Add & Log Another" tone="ghost" icon="plus" onPress={() => addMeal(false)} disabled={!canSave || saving} />
      </PixelPanel>

      <PixelButton label="Meal history / delete logged food" tone="ghost" onPress={() => router.push('/meal-history')} />
      <PixelPanel label={`Eaten today (${todays.length})`}>
        {todays.length === 0 ? (
          <PixelText color={colors.textFaint}>Nothing logged yet today.</PixelText>
        ) : (
          <View style={styles.list}>
            {todays.map((m) => (
              <View key={m.id} style={styles.mealRow}>
                <View style={{ flex: 1 }}><PixelText variant="bold" size={16}>{m.name}</PixelText><PixelText size={13} color={colors.textDim}>P {Math.round(m.protein)}g · C {Math.round(m.carbs)}g · F {Math.round(m.fat ?? 0)}g</PixelText></View>
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
