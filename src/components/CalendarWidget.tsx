import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { toDayKey } from '../lib/dates';
import type { WorkoutSummary } from '../lib/db';
import { colors } from '../theme';
import { PixelFrame } from './PixelFrame';
import { PixelIcon } from './PixelIcon';
import { PixelText } from './PixelText';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDuration(sec: number | null): string {
  if (!sec) return '';
  const m = Math.round(sec / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${Math.max(1, m)}m`;
}

export function formatNumber(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** A pinned paper wall calendar; days with a workout get a stamp, and tapping one shows that session. */
export function WorkoutCalendarWidget({ summaries }: { summaries: WorkoutSummary[] }) {
  const today = new Date();
  const todayKey = toDayKey(today);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, WorkoutSummary[]>();
    for (const s of summaries) {
      const key = toDayKey(new Date(s.date));
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return map;
  }, [summaries]);

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
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(null);
  }

  const selectedWorkouts = selected ? byDay.get(selected) ?? [] : [];

  return (
    <PixelFrame fill={colors.paper} edge={colors.paperDark} step={3}>
      <View style={styles.pegs}>
        <View style={styles.peg} />
        <View style={styles.peg} />
      </View>
      <View style={styles.body}>
        <View style={styles.header}>
          <Pressable onPress={() => shiftMonth(-1)} hitSlop={10} style={styles.nav}>
            <PixelIcon name="chevL" color={colors.paperInk} px={2} />
          </Pressable>
          <PixelText variant="bold" size={16} color={colors.paperInk}>{MONTHS[cursor.month]} {cursor.year}</PixelText>
          <Pressable onPress={() => shiftMonth(1)} hitSlop={10} style={styles.nav}>
            <PixelIcon name="chevR" color={colors.paperInk} px={2} />
          </Pressable>
        </View>
        <View style={styles.rule} />

        <View style={styles.row}>
          {WEEKDAYS.map((d, i) => (
            <View key={i} style={styles.slot}>
              <PixelText variant="label" size={9} color={colors.paperFaint} style={styles.center}>{d}</PixelText>
            </View>
          ))}
        </View>

        {rows.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((day, c) => {
              if (day === null) return <View key={c} style={styles.slot} />;
              const key = toDayKey(new Date(cursor.year, cursor.month, day));
              const worked = byDay.has(key);
              return (
                <Pressable key={c} style={styles.slot} disabled={!worked} onPress={() => setSelected(selected === key ? null : key)}>
                  <View
                    style={[
                      styles.cell,
                      worked && styles.cellWorked,
                      key === todayKey && styles.cellToday,
                      key === selected && styles.cellSelected,
                    ]}
                  >
                    <PixelText variant={worked ? 'bold' : 'body'} size={12} color={worked ? colors.white : colors.paperInk}>
                      {day}
                    </PixelText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}

        {selectedWorkouts.length > 0 && (
          <View style={styles.detail}>
            {selectedWorkouts.map((w) => (
              <View key={w.id}>
                <PixelText variant="bold" size={14} color={colors.paperInk}>{w.name ?? 'Workout'}</PixelText>
                <PixelText size={12} color={colors.paperFaint}>
                  {[formatDuration(w.durationSec), `${formatNumber(w.volume)} kg`, `${w.sets} sets`].filter(Boolean).join(' / ')}
                </PixelText>
              </View>
            ))}
          </View>
        )}
      </View>
    </PixelFrame>
  );
}

const styles = StyleSheet.create({
  pegs: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 18, paddingTop: 6 },
  peg: { width: 8, height: 8, backgroundColor: colors.paperInk },
  body: { padding: 10, paddingTop: 8, gap: 2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4 },
  nav: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  rule: { height: 2, backgroundColor: colors.rose, marginBottom: 6 },
  row: { flexDirection: 'row' },
  slot: { width: `${100 / 7}%`, aspectRatio: 1, padding: 1 },
  center: { textAlign: 'center' },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cellWorked: { backgroundColor: colors.tealDeep },
  cellToday: { borderWidth: 2, borderColor: colors.roseDeep },
  cellSelected: { borderWidth: 2, borderColor: colors.paperInk },
  detail: { marginTop: 8, paddingTop: 8, borderTopWidth: 2, borderColor: colors.paperDark, gap: 6 },
});
