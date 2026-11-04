import type { SQLiteDatabase } from 'expo-sqlite';
import { addDays, toDayKey } from './dates';
import type { ActivityLevel, Goal, Profile, Sex } from './nutrition';
import { initCookbook } from './recipes';

export const DATABASE_NAME = 'levelup.db';

async function addColumnIfMissing(db: SQLiteDatabase, table: string, column: string, type: string) {
  const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  if (!cols.some((c) => c.name === column)) {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await initCookbook(db);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      name TEXT,
      duration INTEGER
    );
    CREATE TABLE IF NOT EXISTS workout_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES workout_sessions(id),
      exercise TEXT NOT NULL,
      weight REAL NOT NULL,
      reps INTEGER NOT NULL,
      set_index INTEGER
    );
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      name TEXT NOT NULL,
      energy REAL NOT NULL,
      carbs REAL NOT NULL,
      protein REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      sex TEXT NOT NULL,
      age INTEGER NOT NULL,
      height_cm REAL NOT NULL,
      weight_kg REAL NOT NULL,
      activity TEXT NOT NULL,
      goal TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  // Databases created by earlier builds lack these columns.
  await addColumnIfMissing(db, 'workout_sessions', 'name', 'TEXT');
  await addColumnIfMissing(db, 'workout_sessions', 'duration', 'INTEGER');
  await addColumnIfMissing(db, 'workout_sets', 'set_index', 'INTEGER');
  await addColumnIfMissing(db, 'meals', 'fat', 'REAL NOT NULL DEFAULT 0');
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS meals_date_idx ON meals(date);
    CREATE INDEX IF NOT EXISTS workout_sessions_date_idx ON workout_sessions(date);
    CREATE INDEX IF NOT EXISTS workout_sets_session_idx ON workout_sets(session_id);
    CREATE INDEX IF NOT EXISTS workout_sets_exercise_idx ON workout_sets(exercise, session_id);
  `);
}

export interface FinishedWorkout {
  name: string;
  startedAt: Date;
  durationSec: number;
  exercises: { name: string; sets: { weight: number; reps: number }[] }[];
}

export async function saveWorkout(db: SQLiteDatabase, workout: FinishedWorkout): Promise<void> {
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      'INSERT INTO workout_sessions (date, name, duration) VALUES (?, ?, ?)',
      workout.startedAt.toISOString(),
      workout.name,
      workout.durationSec
    );
    const sessionId = result.lastInsertRowId;
    for (const exercise of workout.exercises) {
      for (const [index, set] of exercise.sets.entries()) {
        await db.runAsync(
          'INSERT INTO workout_sets (session_id, exercise, weight, reps, set_index) VALUES (?, ?, ?, ?, ?)',
          sessionId,
          exercise.name,
          set.weight,
          set.reps,
          index
        );
      }
    }
  });
}

/** The sets from the most recent session that included this exercise, in order. */
export async function getPreviousSets(db: SQLiteDatabase, exercise: string): Promise<{ weight: number; reps: number }[]> {
  const last = await db.getFirstAsync<{ session_id: number }>(
    `SELECT ws.session_id FROM workout_sets ws
     JOIN workout_sessions s ON s.id = ws.session_id
     WHERE ws.exercise = ? ORDER BY s.date DESC LIMIT 1`,
    exercise
  );
  if (!last) return [];
  return db.getAllAsync<{ weight: number; reps: number }>(
    'SELECT weight, reps FROM workout_sets WHERE session_id = ? AND exercise = ? ORDER BY COALESCE(set_index, id), id',
    last.session_id,
    exercise
  );
}

export interface WorkoutSummary {
  id: number;
  date: string;
  name: string | null;
  durationSec: number | null;
  sets: number;
  volume: number;
}

export async function getWorkoutSummaries(db: SQLiteDatabase): Promise<WorkoutSummary[]> {
  const rows = await db.getAllAsync<{
    id: number;
    date: string;
    name: string | null;
    duration: number | null;
    sets: number;
    volume: number;
  }>(
    `SELECT s.id, s.date, s.name, s.duration,
            COUNT(ws.id) AS sets, COALESCE(SUM(ws.weight * ws.reps), 0) AS volume
     FROM workout_sessions s LEFT JOIN workout_sets ws ON ws.session_id = s.id
     GROUP BY s.id ORDER BY s.date DESC`
  );
  return rows.map((r) => ({ id: r.id, date: r.date, name: r.name, durationSec: r.duration, sets: r.sets, volume: r.volume }));
}

export interface MealInput {
  name: string;
  energy: number;
  carbs: number;
  protein: number;
  fat?: number;
}

export interface MealEntry extends MealInput {
  id: number;
  date: string;
}

export async function saveMeal(db: SQLiteDatabase, meal: MealInput): Promise<void> {
  const values = [meal.energy, meal.carbs, meal.protein, meal.fat ?? 0];
  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error('Use non-negative numbers for macros.');
  }
  await db.runAsync(
    'INSERT INTO meals (date, name, energy, carbs, protein, fat) VALUES (?, ?, ?, ?, ?, ?)',
    new Date().toISOString(),
    meal.name.trim() || 'Untitled meal',
    meal.energy,
    meal.carbs,
    meal.protein,
    meal.fat ?? 0
  );
}

export interface Macros {
  energy: number;
  carbs: number;
  protein: number;
}

export async function deleteMeal(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM meals WHERE id = ?', id);
}

export async function getMealHistory(db: SQLiteDatabase): Promise<MealEntry[]> {
  return db.getAllAsync<MealEntry>('SELECT id, date, name, energy, carbs, protein, fat FROM meals ORDER BY date DESC');
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
    'SELECT id, date, name, energy, carbs, protein, fat FROM meals WHERE date >= ? ORDER BY date DESC',
    addDays(now, -1).toISOString()
  );
  const today = toDayKey(now);
  return rows.filter((r) => toDayKey(new Date(r.date)) === today);
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

export type StoredProfile = Profile & { createdAt: string };

export async function getProfile(db: SQLiteDatabase): Promise<StoredProfile | null> {
  const row = await db.getFirstAsync<{
    sex: Sex;
    age: number;
    height_cm: number;
    weight_kg: number;
    activity: ActivityLevel;
    goal: Goal;
    created_at: string;
  }>('SELECT sex, age, height_cm, weight_kg, activity, goal, created_at FROM profile WHERE id = 1');
  if (!row) return null;
  return { sex: row.sex, age: row.age, heightCm: row.height_cm, weightKg: row.weight_kg, activity: row.activity, goal: row.goal, createdAt: row.created_at };
}

export async function saveProfile(db: SQLiteDatabase, p: Profile): Promise<void> {
  await db.runAsync(
    `INSERT INTO profile (id, sex, age, height_cm, weight_kg, activity, goal, created_at, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET sex = excluded.sex, age = excluded.age, height_cm = excluded.height_cm,
       weight_kg = excluded.weight_kg, activity = excluded.activity, goal = excluded.goal, updated_at = excluded.updated_at`,
    p.sex,
    p.age,
    p.heightCm,
    p.weightKg,
    p.activity,
    p.goal,
    new Date().toISOString(),
    new Date().toISOString()
  );
}
