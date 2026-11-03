import type { SQLiteDatabase } from 'expo-sqlite';

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
  `);
}

export interface WorkoutSetInput {
  exercise: string;
  weight: number;
  reps: number;
}

export async function saveWorkoutSession(db: SQLiteDatabase, sets: WorkoutSetInput[]): Promise<void> {
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      'INSERT INTO workout_sessions (date) VALUES (?)',
      new Date().toISOString()
    );
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

export async function getLastWorkoutDate(db: SQLiteDatabase): Promise<Date | null> {
  const row = await db.getFirstAsync<{ date: string }>(
    'SELECT date FROM workout_sessions ORDER BY date DESC LIMIT 1'
  );
  return row ? new Date(row.date) : null;
}

export interface WorkoutHistoryEntry {
  id: number;
  date: string;
  sets: WorkoutSetInput[];
}

export async function getWorkoutHistory(db: SQLiteDatabase, limit = 10): Promise<WorkoutHistoryEntry[]> {
  const sessions = await db.getAllAsync<{ id: number; date: string }>(
    'SELECT id, date FROM workout_sessions ORDER BY date DESC LIMIT ?',
    limit
  );
  const history: WorkoutHistoryEntry[] = [];
  for (const session of sessions) {
    const sets = await db.getAllAsync<WorkoutSetInput>(
      'SELECT exercise, weight, reps FROM workout_sets WHERE session_id = ?',
      session.id
    );
    history.push({ id: session.id, date: session.date, sets });
  }
  return history;
}
