import React, { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmModal } from '../components/ConfirmModal';
import { PixelButton } from '../components/PixelButton';
import { PixelText } from '../components/PixelText';
import { deleteMeal, getMealHistory, type MealEntry } from '../lib/db';
import { colors } from '../theme';

export default function MealHistory() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [selected, setSelected] = useState<MealEntry | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const lock = useRef(false);
  const load = useCallback(async () => {
    setError(''); setLoading(true);
    try { setMeals(await getMealHistory(db)); }
    catch { setError('Could not load meals. Please retry.'); }
    finally { setLoading(false); }
  }, [db]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  async function remove() {
    if (!selected || lock.current) return;
    lock.current = true; setDeleting(true); setError('');
    try {
      await deleteMeal(db, selected.id);
      setMeals((all) => all.filter((meal) => meal.id !== selected.id));
      setSelected(null);
    } catch { setSelected(null); setError('Could not delete meal. Please try again.'); }
    finally { lock.current = false; setDeleting(false); }
  }
  return <View style={styles.screen}>
    <FlatList data={meals} keyExtractor={(meal) => String(meal.id)} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      ListHeaderComponent={<View style={styles.header}><PixelText variant="bold" size={28}>Your food log</PixelText><PixelText color={colors.textDim}>Remove any logged meal. Daily macros and meal XP update when you return to the dashboard.</PixelText>{error ? <><PixelText accessibilityRole="alert" color={colors.danger}>{error}</PixelText><PixelButton label="Retry" onPress={load} /></> : null}</View>}
      ListEmptyComponent={<PixelText color={colors.textDim}>{loading ? 'Loading meals...' : error ? '' : 'No meals logged yet.'}</PixelText>}
      renderItem={({ item }) => <View style={styles.meal}><View style={styles.copy}><PixelText variant="bold" size={20}>{item.name}</PixelText><PixelText color={colors.textDim} size={14}>{new Date(item.date).toLocaleString()}</PixelText><PixelText color={colors.amber}>{Math.round(item.energy)} kcal</PixelText><PixelText color={colors.textDim} size={14}>P {item.protein}g / C {item.carbs}g / F {item.fat ?? 0}g</PixelText></View><PixelButton label="Delete" tone="danger" disabled={deleting} onPress={() => setSelected(item)} /></View>}
    />
    <ConfirmModal visible={!!selected} title="Delete logged food?" message={`Remove ${selected?.name ?? 'this meal'} from your food log? This also removes its macros and meal XP. Your saved recipe stays in the cookbook.`} confirmLabel={deleting ? 'Deleting...' : 'Delete'} onConfirm={remove} onCancel={() => { if (!lock.current) setSelected(null); }} />
  </View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.bg }, content: { padding: 16, width: '100%', maxWidth: 720, alignSelf: 'center', gap: 12 }, header: { gap: 12, marginBottom: 12 }, meal: { backgroundColor: colors.panel, borderWidth: 2, borderColor: colors.border, padding: 12, gap: 12, flexDirection: 'row', alignItems: 'center' }, copy: { flex: 1, gap: 6 } });
