import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { PixelText } from './PixelText';
import { colors } from '../theme';
export function TagPicker({ tags, selected, onToggle }: { tags: string[]; selected: string[]; onToggle: (tag: string) => void }) {
  return <View style={styles.wrap}>{tags.map((tag) => <Pressable key={tag} accessibilityRole="button" accessibilityState={{ selected: selected.includes(tag) }} onPress={() => onToggle(tag)} style={[styles.tag, selected.includes(tag) && styles.selected]}><PixelText size={15} color={selected.includes(tag) ? colors.paperInk : colors.textDim}>{tag}</PixelText></Pressable>)}</View>;
}
const styles = StyleSheet.create({ wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, tag: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border }, selected: { backgroundColor: colors.teal, borderColor: colors.teal } });
