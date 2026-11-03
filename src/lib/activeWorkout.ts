import { useSyncExternalStore } from 'react';
import type { FinishedWorkout } from './db';
import type { Muscle } from './exercises';

export interface DraftSet {
  id: string;
  kg: string;
  reps: string;
  done: boolean;
}

export interface DraftExercise {
  id: string;
  name: string;
  muscle: Muscle;
  sets: DraftSet[];
  /** Sets from the last session with this exercise, shown in the PREVIOUS column. */
  previous: { weight: number; reps: number }[];
}

export interface ActiveWorkout {
  name: string;
  startedAt: number;
  exercises: DraftExercise[];
  /** Exercise the character is currently performing the routine for. */
  focusedId: string | null;
  restEndsAt: number | null;
}

export const REST_SECONDS = 90;

let state: ActiveWorkout | null = null;
const listeners = new Set<() => void>();
let counter = 0;
const uid = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;

function commit(next: ActiveWorkout | null) {
  state = next;
  listeners.forEach((l) => l());
}

function update(fn: (w: ActiveWorkout) => ActiveWorkout) {
  if (state) commit(fn(state));
}

function mapExercise(id: string, fn: (e: DraftExercise) => DraftExercise) {
  update((w) => ({ ...w, exercises: w.exercises.map((e) => (e.id === id ? fn(e) : e)) }));
}

function defaultName(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return 'Morning Workout';
  if (h < 17) return 'Afternoon Workout';
  if (h < 21) return 'Evening Workout';
  return 'Night Workout';
}

const newSet = (): DraftSet => ({ id: uid(), kg: '', reps: '', done: false });

export const workoutStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => state,

  start() {
    if (!state) commit({ name: defaultName(), startedAt: Date.now(), exercises: [], focusedId: null, restEndsAt: null });
  },
  discard() {
    commit(null);
  },
  rename(name: string) {
    update((w) => ({ ...w, name }));
  },

  addExercises(items: { name: string; muscle: Muscle; previous: DraftExercise['previous'] }[]) {
    if (items.length === 0) return;
    const added = items.map((i) => ({ id: uid(), name: i.name, muscle: i.muscle, previous: i.previous, sets: [newSet()] }));
    update((w) => ({ ...w, exercises: [...w.exercises, ...added], focusedId: added[added.length - 1].id }));
  },
  removeExercise(id: string) {
    update((w) => ({
      ...w,
      exercises: w.exercises.filter((e) => e.id !== id),
      focusedId: w.focusedId === id ? null : w.focusedId,
    }));
  },
  setFocus(id: string) {
    update((w) => ({ ...w, focusedId: id }));
  },

  addSet(exerciseId: string) {
    mapExercise(exerciseId, (e) => ({ ...e, sets: [...e.sets, newSet()] }));
  },
  removeSet(exerciseId: string, setId: string) {
    mapExercise(exerciseId, (e) => ({ ...e, sets: e.sets.filter((s) => s.id !== setId) }));
  },
  updateSet(exerciseId: string, setId: string, patch: Partial<Pick<DraftSet, 'kg' | 'reps'>>) {
    mapExercise(exerciseId, (e) => ({ ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) }));
  },

  /**
   * Completes (or un-completes) a set. Completing fills blank fields from the
   * previous session and needs at least one rep; completing starts the rest timer.
   * Returns false if the set couldn't be completed.
   */
  toggleSet(exerciseId: string, setId: string): boolean {
    const exercise = state?.exercises.find((e) => e.id === exerciseId);
    const index = exercise?.sets.findIndex((s) => s.id === setId) ?? -1;
    if (!exercise || index < 0) return false;
    const set = exercise.sets[index];

    if (set.done) {
      mapExercise(exerciseId, (e) => ({ ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, done: false } : s)) }));
      return true;
    }

    const prev = exercise.previous[index];
    const reps = set.reps !== '' ? set.reps : prev ? String(prev.reps) : '';
    const kg = set.kg !== '' ? set.kg : prev ? String(prev.weight) : '';
    if (!(Number(reps) > 0)) return false;

    mapExercise(exerciseId, (e) => ({
      ...e,
      sets: e.sets.map((s) => (s.id === setId ? { ...s, reps, kg, done: true } : s)),
    }));
    update((w) => ({ ...w, focusedId: exerciseId, restEndsAt: Date.now() + REST_SECONDS * 1000 }));
    return true;
  },

  adjustRest(deltaSeconds: number) {
    update((w) => (w.restEndsAt ? { ...w, restEndsAt: w.restEndsAt + deltaSeconds * 1000 } : w));
  },
  skipRest() {
    update((w) => ({ ...w, restEndsAt: null }));
  },

  /** Only completed sets are kept; exercises with none are dropped. */
  buildFinished(): FinishedWorkout | null {
    if (!state) return null;
    const exercises = state.exercises
      .map((e) => ({
        name: e.name,
        sets: e.sets.filter((s) => s.done).map((s) => ({ weight: Number(s.kg) || 0, reps: Number(s.reps) })),
      }))
      .filter((e) => e.sets.length > 0);
    if (exercises.length === 0) return null;
    return {
      name: state.name.trim() || defaultName(new Date(state.startedAt)),
      startedAt: new Date(state.startedAt),
      durationSec: Math.max(1, Math.round((Date.now() - state.startedAt) / 1000)),
      exercises,
    };
  },
};

export function useActiveWorkout(): ActiveWorkout | null {
  return useSyncExternalStore(workoutStore.subscribe, workoutStore.getSnapshot, workoutStore.getSnapshot);
}

export function workoutTotals(w: ActiveWorkout): { sets: number; volume: number } {
  let sets = 0;
  let volume = 0;
  for (const e of w.exercises) {
    for (const s of e.sets) {
      if (!s.done) continue;
      sets += 1;
      volume += (Number(s.kg) || 0) * Number(s.reps);
    }
  }
  return { sets, volume };
}
