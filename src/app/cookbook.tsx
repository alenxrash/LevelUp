import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PixelInput } from '../components/PixelInput';
import { PixelText } from '../components/PixelText';
import { RecipeBook } from '../components/RecipeBook';
import { recipes } from '../lib/recipes';
import { colors } from '../theme';

const filters = ['All recipes', 'High protein', 'Under 450 kcal', 'Quick bites'] as const;
type Filter = typeof filters[number];

export default function Cookbook() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All recipes');
  const filtered = useMemo(() => recipes.filter((recipe) => {
    const matches = `${recipe.name} ${recipe.category} ${recipe.ingredients.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase());
    return matches && (filter === 'All recipes' || (filter === 'High protein' && recipe.protein >= 30) || (filter === 'Under 450 kcal' && recipe.energy < 450) || (filter === 'Quick bites' && recipe.minutes <= 10));
  }), [query, filter]);

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
          <RecipeBook color="#9b68ba" size={64} />
        </View>
        <PixelInput accessibilityLabel="Search recipes or ingredients" placeholder="Search a recipe or ingredient..." value={query} onChangeText={setQuery} autoCorrect={false} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: filter === item }} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.activeFilter]}>
            <PixelText size={14} color={filter === item ? colors.paperInk : colors.textDim}>{item}</PixelText>
          </Pressable>)}
        </ScrollView>
        <View style={styles.shelfLabel}><PixelText variant="label" size={10} color={colors.amber}>THE RECIPE SHELF</PixelText><PixelText color={colors.textDim}>{filtered.length} recipes</PixelText></View>
      </View>}
      renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`${item.name}, ${item.energy} calories, ${item.protein} grams protein. Open recipe.`} onPress={() => router.push({ pathname: '/recipe', params: { id: item.id } })} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={[styles.cover, { borderBottomColor: item.color }]}>
          <PixelText variant="label" size={9} color={colors.textDim}>{item.category}</PixelText>
          <RecipeBook color={item.color} />
          <PixelText size={13} color={colors.textDim}>{item.minutes} MIN PREP</PixelText>
        </View>
        <View style={styles.cardCopy}>
          <PixelText variant="bold" size={20}>{item.name}</PixelText>
          <PixelText size={13} color={colors.textDim}>{item.subtitle}</PixelText>
          <PixelText size={16} color={colors.amber}>{item.energy} kcal</PixelText>
          <PixelText size={13} color={colors.teal}>P {item.protein}g  ·  C {item.carbs}g  ·  F {item.fat}g</PixelText>
          <PixelText variant="label" size={9} color={colors.textDim}>OPEN RECIPE →</PixelText>
        </View>
      </Pressable>}
      ListEmptyComponent={<View style={styles.empty}><PixelText size={22}>No recipes on this shelf</PixelText><PixelText color={colors.textDim}>Try another ingredient or select All recipes.</PixelText></View>}
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
