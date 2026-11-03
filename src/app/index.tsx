import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { getLastWorkoutDate } from '../lib/db';
import { computeMood, isWorkoutConsistent, MOOD_BLURB, MOOD_LABEL } from '../lib/character';
import { PixelAvatar } from '../components/PixelAvatar';

function formatLastWorkout(date: Date | null): string {
  if (!date) return 'No workouts logged yet';
  const days = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'Last workout: today';
  if (days === 1) return 'Last workout: yesterday';
  return `Last workout: ${days} days ago`;
}

export default function Home() {
  const db = useSQLiteContext();
  const [lastWorkoutDate, setLastWorkoutDate] = useState<Date | null>(null);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getLastWorkoutDate(db).then((date) => {
        if (!cancelled) {
          setLastWorkoutDate(date);
          setLoaded(true);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [db])
  );

  const mood = computeMood({
    workoutConsistent: isWorkoutConsistent(lastWorkoutDate),
    nutritionOnTarget: true,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LevelUp</Text>

      <View style={styles.card}>
        {loaded ? <PixelAvatar mood={mood} /> : <View style={{ width: 140, height: 196 }} />}
        <Text style={styles.moodLabel}>{MOOD_LABEL[mood]}</Text>
        <Text style={styles.moodBlurb}>{MOOD_BLURB[mood]}</Text>
        <Text style={styles.statusLine}>{formatLastWorkout(lastWorkoutDate)}</Text>
      </View>

      <Pressable style={styles.button} onPress={() => router.push('/log-workout')}>
        <Text style={styles.buttonText}>Log a Workout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2430',
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 20,
    gap: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#2a3040',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  moodLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  moodBlurb: {
    color: '#aab2c0',
    fontSize: 14,
    textAlign: 'center',
  },
  statusLine: {
    color: '#6f7890',
    fontSize: 13,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#36c2a4',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#0e2a24',
    fontSize: 16,
    fontWeight: '700',
  },
});
