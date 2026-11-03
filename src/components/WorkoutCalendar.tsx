import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { toDayKey } from '../lib/dates';
import { colors } from '../theme';
import { PixelText } from './PixelText';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  /** Local day keys ("YYYY-MM-DD") that had a workout. */
  workoutDays: Set<string>;
}

export function WorkoutCalendar({ workoutDays }: Props) {
  const today = new Date();
  const todayKey = toDayKey(today);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay();
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  function shiftMonth(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const workoutsThisMonth = Array.from({ length: daysInMonth }, (_, i) =>
    toDayKey(new Date(cursor.year, cursor.month, i + 1))
  ).filter((k) => workoutDays.has(k)).length;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Pressable onPress={() => shiftMonth(-1)} style={styles.nav} hitSlop={8}>
          <PixelText weight="bold" size={18}>{'<'}</PixelText>
        </Pressable>
        <View style={styles.headerCenter}>
          <PixelText weight="bold" size={18}>
            {MONTHS[cursor.month]} {cursor.year}
          </PixelText>
          <PixelText size={13} color={colors.inkSoft}>
            {workoutsThisMonth} workout {workoutsThisMonth === 1 ? 'day' : 'days'}
          </PixelText>
        </View>
        <Pressable onPress={() => shiftMonth(1)} style={styles.nav} hitSlop={8}>
          <PixelText weight="bold" size={18}>{'>'}</PixelText>
        </Pressable>
      </View>

      <View style={styles.row}>
        {WEEKDAYS.map((d, i) => (
          <View key={i} style={styles.cellSlot}>
            <PixelText size={13} color={colors.inkSoft} style={styles.weekday}>
              {d}
            </PixelText>
          </View>
        ))}
      </View>

      {rows.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((day, c) => {
            if (day === null) return <View key={c} style={styles.cellSlot} />;
            const key = toDayKey(new Date(cursor.year, cursor.month, day));
            const worked = workoutDays.has(key);
            const isToday = key === todayKey;
            return (
              <View key={c} style={styles.cellSlot}>
                <View
                  style={[
                    styles.cell,
                    worked && styles.cellWorked,
                    isToday && styles.cellToday,
                  ]}
                >
                  <PixelText weight={worked || isToday ? 'bold' : 'regular'} size={14} color={worked ? colors.white : colors.ink}>
                    {day}
                  </PixelText>
                </View>
              </View>
            );
          })}
        </View>
      ))}

      <View style={styles.legend}>
        <View style={[styles.legendSwatch, { backgroundColor: colors.moss }]} />
        <PixelText size={13} color={colors.inkSoft}>Workout</PixelText>
        <View style={[styles.legendSwatch, { backgroundColor: colors.parchment, borderColor: colors.berry, borderWidth: 3 }]} />
        <PixelText size={13} color={colors.inkSoft}>Today</PixelText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  headerCenter: { alignItems: 'center' },
  nav: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.parchmentDark,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  row: { flexDirection: 'row' },
  cellSlot: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  weekday: { textAlign: 'center' },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.parchmentDark,
  },
  cellWorked: {
    backgroundColor: colors.moss,
    borderWidth: 2,
    borderColor: colors.mossDark,
  },
  cellToday: {
    borderWidth: 3,
    borderColor: colors.berry,
  },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  legendSwatch: { width: 14, height: 14, marginRight: 2 },
});
