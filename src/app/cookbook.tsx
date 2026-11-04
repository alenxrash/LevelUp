import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PixelInput } from '../components/PixelInput';
import { PixelText } from '../components/PixelText';
import { FoodSprite } from '../components/FoodSprite';
import { PixelButton } from '../components/PixelButton';
import { TagPicker } from '../components/TagPicker';
import { useSQLiteContext } from 'expo-sqlite';
import { getRecipes, getTags, type Recipe } from '../lib/recipes';
import { colors } from '../theme';

const filters = ['All recipes', 'High protein', 'Under 450 kcal', 'Quick bites'] as const;
type Filter = typeof filters[number];

export default function Cookbook() {
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useFocusEffect(useCallback(() => {
    void attempt; // Retry explicitly reruns this focus subscription.
    let active = true;
    setLoading(true); setError('');
    Promise.all([getRecipes(db), getTags(db)]).then(([items, allTags]) => {
      if (active) { setRecipes(items); setTags(allTags); }
    }).catch(() => { if (active) setError('Could not load your cookbook. Please retry.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [db, attempt]));
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All recipes');
  const filtered = useMemo(() => recipes.filter((recipe) => {
    const matches = `${recipe.name} ${recipe.tags.join(' ')} ${recipe.ingredients.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase());
    return matches && selectedTags.every((tag) => recipe.tags.includes(tag)) && (filter === 'All recipes' || (filter === 'High protein' && recipe.protein >= 30) || (filter === 'Under 450 kcal' && recipe.energy < 450) || (filter === 'Quick bites' && recipe.minutes <= 10));
  }), [recipes, query, filter, selectedTags]);

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      data={filtered}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<View style={styles.header}>
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <PixelText variant="label" size={10} color={colors.amber}>THE NOURISHMENT GUILD</PixelText>
            <PixelText variant="bold" size={34}>Your cookbook</PixelText>
            <PixelText size={17} color={colors.textDim}>Good food. More fuel. Next level.</PixelText>
          </View>
          <FoodSprite icon="carrot" size={64} />
        </View>
        <PixelButton label="Add recipe" icon="plus" tone="teal" onPress={() => router.push('/recipe-editor')} />
        {error ? <><PixelText accessibilityRole="alert" color={colors.danger}>{error}</PixelText><PixelButton label="Retry" onPress={() => setAttempt((n) => n + 1)} /></> : null}
        <PixelInput accessibilityLabel="Search recipes or ingredients" placeholder="Search a recipe or ingredient..." value={query} onChangeText={setQuery} autoCorrect={false} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: filter === item }} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.activeFilter]}>
            <PixelText size={14} color={filter === item ? colors.paperInk : colors.textDim}>{item}</PixelText>
          </Pressable>)}
        </ScrollView>
        <PixelText size={14} color={colors.textDim}>Filter by food tags (matches all selected)</PixelText>
        <TagPicker tags={tags} selected={selectedTags} onToggle={(tag) => setSelectedTags((all) => all.includes(tag) ? all.filter((t) => t !== tag) : [...all, tag])} />
        {selectedTags.length ? <PixelButton label="Clear tags" tone="ghost" onPress={() => setSelectedTags([])} /> : null}
        <View style={styles.shelfLabel}><PixelText variant="label" size={10} color={colors.amber}>THE RECIPE SHELF</PixelText><PixelText color={colors.textDim}>{filtered.length} recipes</PixelText></View>
      </View>}
      renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`${item.name}, ${item.energy} calories, ${item.protein} grams protein. Open recipe.`} onPress={() => router.push({ pathname: '/recipe', params: { id: item.id } })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={[styles.cover, { borderBottomColor: colors.teal }]}>
          <PixelText variant="label" size={9} color={colors.textDim}>{item.tags[0] ?? 'Homemade'}</PixelText>
          <FoodSprite icon={item.icon} />
          <PixelText size={13} color={colors.textDim}>{item.minutes} MIN PREP</PixelText>
        </View>
        <View style={styles.cardCopy}>
          <PixelText variant="bold" size={20}>{item.name}</PixelText>
          <PixelText size={13} color={colors.textDim}>{item.tags.join(' / ') || 'Your own recipe'}</PixelText>
          <PixelText size={16} color={colors.amber}>{item.energy} kcal</PixelText>
          <PixelText size={13} color={colors.teal}>P {item.protein}g  ·  C {item.carbs}g  ·  F {item.fat}g</PixelText>
          <PixelText variant="label" size={9} color={colors.textDim}>OPEN RECIPE →</PixelText>
        </View>
      </Pressable>}
      ListEmptyComponent={<View style={styles.empty}><PixelText size={22}>{loading ? 'Loading recipes...' : recipes.length ? 'No matching recipes' : 'Your cookbook starts here'}</PixelText><PixelText color={colors.textDim}>{recipes.length ? 'Try another search or clear your filters.' : 'Tap Add recipe to save your first favourite with macros, tags and a video link.'}</PixelText></View>}
      ListFooterComponent={<PixelText style={styles.footer} size={13} color={colors.textDim}>Made for your everyday quests. Macros are estimates per serving; brands and preparation may vary.</PixelText>}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, maxWidth: 720, width: '100%', alignSelf: 'center' },
  header: { gap: 18, paddingBottom: 18 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  heroCopy: { flex: 1, gap: 8 },
  filters: { gap: 8 },
  filter: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel },
  activeFilter: { backgroundColor: colors.paper, borderColor: colors.amber },
  shelfLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { gap: 12 },
  card: { flex: 1, maxWidth: '50%', marginBottom: 16, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.panel },
  pressed: { opacity: 0.75, transform: [{ translateY: 2 }] },
  cover: { alignItems: 'center', gap: 8, paddingVertical: 16, backgroundColor: colors.bgSoft, borderBottomWidth: 4 },
  cardCopy: { padding: 12, gap: 9 },
  empty: { paddingVertical: 40, gap: 10 },
  footer: { textAlign: 'center', paddingVertical: 16, lineHeight: 20 },
});
