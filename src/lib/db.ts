import type { SQLiteDatabase } from 'expo-sqlite';
import { addDays, toDayKey } from './dates';

export const DATABASE_NAME = 'levelup.db';

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workout_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES workout_sessions(id),
      exercise TEXT NOT NULL,
      weight REAL NOT NULL,
      reps INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      name TEXT NOT NULL,
      energy REAL NOT NULL,
      carbs REAL NOT NULL,
      protein REAL NOT NULL
    );
  `);
}

export interface WorkoutSetInput {
  exercise: string;
  weight: number;
  reps: number;
}

export async function saveWorkoutSession(db: SQLiteDatabase, sets: WorkoutSetInput[]): Promise<void> {
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync('INSERT INTO workout_sessions (date) VALUES (?)', new Date().toISOString());
    const sessionId = result.lastInsertRowId;
    for (const set of sets) {
      await db.runAsync(
        'INSERT INTO workout_sets (session_id, exercise, weight, reps) VALUES (?, ?, ?, ?)',
        sessionId,
        set.exercise,
        set.weight,
        set.reps
      );
    }
  });
}

export interface MealInput {
  name: string;
  energy: number;
  carbs: number;
  protein: number;
}

export interface MealEntry extends MealInput {
  id: number;
  date: string;
}

export async function saveMeal(db: SQLiteDatabase, meal: MealInput): Promise<void> {
  await db.runAsync(
    'INSERT INTO meals (date, name, energy, carbs, protein) VALUES (?, ?, ?, ?, ?)',
    new Date().toISOString(),
    meal.name,
    meal.energy,
    meal.carbs,
    meal.protein
  );
}

export interface Macros {
  energy: number;
  carbs: number;
  protein: number;
}

const EMPTY_MACROS: Macros = { energy: 0, carbs: 0, protein: 0 };

/** Meals from the last `days` local days (including today), grouped by local day key. */
export async function getDailyMacros(db: SQLiteDatabase, days: number, now = new Date()): Promise<Map<string, Macros>> {
  // Pad the cutoff by a day so timezone offsets can't drop a boundary meal; filtering happens per local key.
  const cutoff = addDays(now, -days - 1).toISOString();
  const rows = await db.getAllAsync<{ date: string; energy: number; carbs: number; protein: number }>(
    'SELECT date, energy, carbs, protein FROM meals WHERE date >= ?',
    cutoff
  );
  const wanted = new Set(Array.from({ length: days }, (_, i) => toDayKey(addDays(now, -i))));
  const byDay = new Map<string, Macros>();
  for (const row of rows) {
    const key = toDayKey(new Date(row.date));
    if (!wanted.has(key)) continue;
    const prev = byDay.get(key) ?? EMPTY_MACROS;
    byDay.set(key, {
      energy: prev.energy + row.energy,
      carbs: prev.carbs + row.carbs,
      protein: prev.protein + row.protein,
    });
  }
  return byDay;
}

export async function getTodaysMeals(db: SQLiteDatabase, now = new Date()): Promise<MealEntry[]> {
  const rows = await db.getAllAsync<MealEntry>(
    'SELECT id, date, name, energy, carbs, protein FROM meals WHERE date >= ? ORDER BY date DESC',
    addDays(now, -1).toISOString()
  );
  const today = toDayKey(now);
  return rows.filter((r) => toDayKey(new Date(r.date)) === today);
}

export async function getLastWorkoutDate(db: SQLiteDatabase): Promise<Date | null> {
  const row = await db.getFirstAsync<{ date: string }>('SELECT date FROM workout_sessions ORDER BY date DESC LIMIT 1');
  return row ? new Date(row.date) : null;
}

/** Local day keys with at least one workout, for the whole history (cheap: one short string per session). */
export async function getWorkoutDayKeys(db: SQLiteDatabase): Promise<Set<string>> {
  const rows = await db.getAllAsync<{ date: string }>('SELECT date FROM workout_sessions');
  return new Set(rows.map((r) => toDayKey(new Date(r.date))));
}

/** Local day keys with any logged activity (workout or meal). */
export async function getActiveDayKeys(db: SQLiteDatabase): Promise<Set<string>> {
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM workout_sessions UNION ALL SELECT date FROM meals'
  );
  return new Set(rows.map((r) => toDayKey(new Date(r.date))));
}

export async function getCounts(db: SQLiteDatabase): Promise<{ workouts: number; meals: number }> {
  const w = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM workout_sessions');
  const m = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM meals');
  return { workouts: w?.n ?? 0, meals: m?.n ?? 0 };
}
