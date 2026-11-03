import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

interface Props {
  title: string;
  detail: string;
  hint?: string;
  onRetry?: () => void;
}

/** Deliberately uses the system font and no app components, so it still renders when those are what broke. */
export function ProblemScreen({ title, detail, hint, onRetry }: Props) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <Text style={styles.detail} selectable>{detail}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  content: { padding: 24, paddingTop: 64, gap: 16 },
  title: { color: colors.parchment, fontSize: 22, fontWeight: '700' },
  hint: { color: colors.butter, fontSize: 16, lineHeight: 22 },
  detail: { color: colors.parchmentDark, fontSize: 13, lineHeight: 18, fontFamily: 'monospace' },
  button: { backgroundColor: colors.moss, paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'flex-start' },
  buttonText: { color: colors.ink, fontSize: 16, fontWeight: '700' },
});
