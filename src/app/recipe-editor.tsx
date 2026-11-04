import React, { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PixelInput } from '../components/PixelInput';
import { PixelButton } from '../components/PixelButton';
import { PixelText } from '../components/PixelText';
import { FoodSprite } from '../components/FoodSprite';
import { TagPicker } from '../components/TagPicker';
import { createTag, foodIcons, getRecipe, getTags, saveRecipe, type FoodIcon } from '../lib/recipes';
import { colors } from '../theme';

export default function RecipeEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('');
  const [energy, setEnergy] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState<FoodIcon>('stew');
  const [tags, setTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagSaving, setTagSaving] = useState(false);
  const lock = useRef(false);
  useFocusEffect(useCallback(() => {
    let active = true;
    Promise.all([getTags(db), id ? getRecipe(db, id) : Promise.resolve(null)]).then(([allTags, recipe]) => {
      if (!active) return;
      if (id && !recipe) { setError('Recipe not found. Go back and try again.'); return; }
      setTags(allTags);
      if (recipe) {
        setName(recipe.name); setMinutes(String(recipe.minutes)); setEnergy(String(recipe.energy)); setProtein(String(recipe.protein)); setCarbs(String(recipe.carbs)); setFat(String(recipe.fat));
        setIngredients(recipe.ingredients.join('\n')); setSteps(recipe.steps.join('\n')); setUrl(recipe.tiktokUrl); setIcon(recipe.icon); setSelected(recipe.tags);
      }
      setLoading(false);
    }).catch(() => { if (active) setError('Could not load the editor. Go back and reopen it to retry.'); });
    return () => { active = false; };
  }, [db, id]));
  async function addTag() {
    if (tagSaving) return;
    setTagSaving(true); setError('');
    try { const tag = await createTag(db, newTag); setTags((all) => [...new Set([...all, tag])].sort()); setSelected((all) => [...new Set([...all, tag])]); setNewTag(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not create tag. Try again.'); }
    finally { setTagSaving(false); }
  }
  async function save() {
    if (lock.current) return;
    lock.current = true; setSaving(true); setError('');
    try {
      const lines = (value: string) => value.split('\n').map((line) => line.trim()).filter(Boolean);
      const recipeId = await saveRecipe(db, { name, minutes: Number(minutes), energy: Number(energy), protein: Number(protein), carbs: Number(carbs), fat: Number(fat), ingredients: lines(ingredients), steps: lines(steps), tiktokUrl: url, icon, tags: selected }, id);
      if (id) router.back(); else router.replace({ pathname: '/recipe', params: { id: recipeId } });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save recipe. Try again.'); lock.current = false; }
    finally { setSaving(false); }
  }
  return <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
    <PixelText variant="bold" size={30}>{id ? 'Edit your recipe' : 'A new favourite'}</PixelText>
    {error ? <PixelText accessibilityRole="alert" color={colors.danger}>{error}</PixelText> : null}
    {loading ? <PixelText>Loading editor...</PixelText> : <View style={styles.fields} pointerEvents={saving ? 'none' : 'auto'}>
      <PixelText color={colors.textDim}>All fields are optional. Save what you have and fill in the rest later.</PixelText>
      <PixelInput label="Recipe name (optional)" value={name} onChangeText={setName} placeholder="My chicken curry" />
      <PixelText variant="label" size={10}>CHOOSE YOUR FOOD ICON</PixelText>
      <View style={styles.icons}>{foodIcons.map((food) => <Pressable key={food} accessibilityRole="button" accessibilityLabel={`${food} icon`} accessibilityState={{ selected: icon === food }} onPress={() => setIcon(food)} style={[styles.icon, icon === food && styles.chosen]}><FoodSprite icon={food} size={64} /><PixelText size={13}>{food}</PixelText></Pressable>)}</View>
      <PixelInput label="Prep + cook time (minutes)" value={minutes} onChangeText={setMinutes} keyboardType="numeric" placeholder="30" />
      <PixelText color={colors.textDim}>Enter ingredients and macros for ONE serving. Portions can be adjusted when logging.</PixelText>
      <View style={styles.row}><PixelInput label="Calories (kcal)" value={energy} onChangeText={setEnergy} keyboardType="decimal-pad" placeholder="450" /><PixelInput label="Protein (g)" value={protein} onChangeText={setProtein} keyboardType="decimal-pad" placeholder="0" /></View>
      <View style={styles.row}><PixelInput label="Carbs (g)" value={carbs} onChangeText={setCarbs} keyboardType="decimal-pad" placeholder="0" /><PixelInput label="Fat (g)" value={fat} onChangeText={setFat} keyboardType="decimal-pad" placeholder="0" /></View>
      <PixelInput label="Ingredients (optional, one per line)" value={ingredients} onChangeText={setIngredients} multiline style={styles.multiline} placeholder={'150 g chicken\n100 g cooked rice'} />
      <PixelInput label="Method (optional, one step per line)" value={steps} onChangeText={setSteps} multiline style={styles.multiline} placeholder="Add each cooking step on a new line" />
      <PixelText variant="label" size={10}>FOOD TAGS · PICK AS MANY AS YOU LIKE</PixelText>
      <TagPicker tags={tags} selected={selected} onToggle={(tag) => setSelected((all) => all.includes(tag) ? all.filter((t) => t !== tag) : [...all, tag])} />
      <View style={styles.row}><PixelInput label="Create a tag" value={newTag} onChangeText={setNewTag} placeholder="vegetarian" /><PixelButton label={tagSaving ? 'Adding...' : 'Add tag'} tone="ghost" disabled={!newTag.trim() || tagSaving} onPress={addTag} /></View>
      <PixelInput label="TikTok link (optional)" value={url} onChangeText={setUrl} keyboardType="url" autoCapitalize="none" autoCorrect={false} placeholder="https://www.tiktok.com/@creator/video/..." />
      <PixelText color={colors.textDim} size={14}>Save a video as a cooking reference. It opens in TikTok or your browser.</PixelText>
      <PixelButton label={saving ? 'Saving...' : 'Save recipe'} icon="check" onPress={save} disabled={saving || tagSaving} />
    </View>}
  </ScrollView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.bg }, content: { padding: 16, gap: 18, maxWidth: 720, width: '100%', alignSelf: 'center' }, fields: { gap: 18 }, row: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' }, icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, icon: { alignItems: 'center', padding: 6, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.panel }, chosen: { borderColor: colors.teal }, multiline: { minHeight: 110, textAlignVertical: 'top' } });
