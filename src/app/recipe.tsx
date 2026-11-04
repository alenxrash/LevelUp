import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PixelButton } from '../components/PixelButton';
import { PixelText } from '../components/PixelText';
import { RecipeBook } from '../components/RecipeBook';
import { saveMeal } from '../lib/db';
import { recipeMacros, recipes } from '../lib/recipes';
import { colors } from '../theme';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = recipes.find((item) => item.id === id);
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const [servings, setServings] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  if (!recipe) return <View style={styles.content}><PixelText>Recipe not found.</PixelText><PixelButton label="Back to cookbook" onPress={() => router.replace('/cookbook')} /></View>;
  const macros = recipeMacros(recipe, servings);

  async function logRecipe() {
    if (!recipe || lock.current) return;
    lock.current = true;
    setSaving(true);
    setError('');
    try {
      await saveMeal(db, { name: `${recipe.name} (${servings} serving${servings === 1 ? '' : 's'})`, ...macros });
      setSaved(true);
    } catch {
      setError('Could not save your meal. Please try again.');
      lock.current = false;
    } finally { setSaving(false); }
  }

  return <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
    <View style={styles.title}>
      <RecipeBook color={recipe.color} size={80} />
      <View style={styles.titleCopy}><PixelText variant="label" size={10} color={colors.amber}>{recipe.category} · {recipe.minutes} min prep</PixelText><PixelText variant="bold" size={30}>{recipe.name}</PixelText><PixelText color={colors.textDim}>{recipe.subtitle}</PixelText></View>
    </View>
    <View style={styles.paper}>
      <PixelText variant="label" size={11} color={colors.paperInk}>RECIPE NOTES / 01</PixelText>
      <PixelText variant="bold" size={26} color={colors.paperInk}>Gather your ingredients</PixelText>
      <PixelText size={14} color={colors.paperInk}>Quantities below make 1 serving.</PixelText>
      {recipe.ingredients.map((ingredient) => <PixelText key={ingredient} size={18} color={colors.paperInk}>· {ingredient}</PixelText>)}
      <View style={styles.rule} />
      <PixelText variant="bold" size={26} color={colors.paperInk}>Let’s get cooking</PixelText>
      {recipe.steps.map((step, index) => <View key={step} style={styles.step}><PixelText variant="bold" size={22} color={colors.paperInk}>{String(index + 1).padStart(2, '0')}</PixelText><PixelText style={styles.stepCopy} size={18} color={colors.paperInk}>{step}</PixelText></View>)}
    </View>
    <View style={styles.fuel}>
      <PixelText variant="label" size={10} color={colors.amber}>LOG YOUR PORTION</PixelText>
      <View style={styles.servings}><PixelButton label="−" tone="ghost" disabled={servings <= 0.5 || saving || saved} onPress={() => setServings((s) => s - 0.5)} /><PixelText variant="bold" size={20}>{servings} serving{servings === 1 ? '' : 's'}</PixelText><PixelButton label="+" tone="ghost" disabled={servings >= 6 || saving || saved} onPress={() => setServings((s) => s + 0.5)} /></View>
      <View style={styles.macros}>{([['kcal', macros.energy, colors.amber], ['protein', `${macros.protein}g`, colors.teal], ['carbs', `${macros.carbs}g`, colors.lilac], ['fat', `${macros.fat}g`, colors.rose]] as const).map(([label, value, color]) => <View key={label} style={styles.macro}><PixelText variant="bold" size={23} color={color}>{value}</PixelText><PixelText size={13} color={colors.textDim}>{label}</PixelText></View>)}</View>
      <PixelText size={13} color={colors.textDim}>Estimated macros for your selected portion. Ingredient quantities above stay at 1 serving.</PixelText>
    </View>
    {error ? <PixelText accessibilityRole="alert" color={colors.danger}>{error}</PixelText> : null}
    {saved ? <><PixelText accessibilityLiveRegion="polite" color={colors.teal}>Meal logged. +10 XP! Your daily fuel has been updated.</PixelText><PixelButton label="View today’s meals" tone="teal" onPress={() => router.replace('/log-meal')} /></> : <PixelButton label={saving ? 'Logging...' : 'Log this meal  +10 XP'} icon="bowl" disabled={saving} onPress={logRecipe} />}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 20, width: '100%', maxWidth: 720, alignSelf: 'center' },
  title: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  titleCopy: { flex: 1, gap: 8 },
  paper: { backgroundColor: colors.paper, borderWidth: 4, borderColor: colors.paperDark, borderLeftWidth: 8, padding: 18, gap: 14 },
  rule: { height: 2, backgroundColor: colors.paperDark, marginVertical: 8 },
  step: { flexDirection: 'row', gap: 12 },
  stepCopy: { flex: 1, lineHeight: 26 },
  fuel: { padding: 16, backgroundColor: colors.panel, borderWidth: 2, borderColor: colors.border, gap: 16 },
  servings: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  macros: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  macro: { gap: 4 },
});
