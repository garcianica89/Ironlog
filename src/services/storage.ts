import { DEFAULT_EXERCISES } from '../data/exerciseCatalog';
import { DEFAULT_ROUTINES, INITIAL_SAMPLE_HISTORY } from '../data/defaultRoutines';
import { Exercise, PersonalRecord, Routine, WorkoutSession, WorkoutSet } from '../types/workout';

const STORAGE_KEYS = {
  EXERCISES: 'ironlog_exercises_v1',
  ROUTINES: 'ironlog_routines_v1',
  HISTORY: 'ironlog_history_v1',
  ACTIVE_SESSION: 'ironlog_active_session_v1',
  SETTINGS: 'ironlog_settings_v1',
};

export interface AppSettings {
  unit: 'kg' | 'lb';
  soundEnabled: boolean;
  defaultRestSeconds: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  unit: 'kg',
  soundEnabled: true,
  defaultRestSeconds: 90,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Error reading settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Error saving settings:', e);
  }
}

export function loadExercises(): Exercise[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    if (raw) {
      const custom = JSON.parse(raw);
      // Merge with default ensuring defaults exist
      const existingIds = new Set(custom.map((e: Exercise) => e.id));
      const missingDefaults = DEFAULT_EXERCISES.filter((d) => !existingIds.has(d.id));
      return [...custom, ...missingDefaults];
    }
  } catch (e) {
    console.warn('Error loading exercises:', e);
  }
  return DEFAULT_EXERCISES;
}

export function saveExercises(exercises: Exercise[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  } catch (e) {
    console.warn('Error saving exercises:', e);
  }
}

export function loadRoutines(): Routine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-upgrade if using old demo routines
      if (Array.isArray(parsed) && parsed.some((r: Routine) => r.id === 'routine-empuje')) {
        saveRoutines(DEFAULT_ROUTINES);
        return DEFAULT_ROUTINES;
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Error loading routines:', e);
  }
  return DEFAULT_ROUTINES;
}

export function saveRoutines(routines: Routine[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  } catch (e) {
    console.warn('Error saving routines:', e);
  }
}

export function loadWorkoutHistory(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error loading history:', e);
  }
  return INITIAL_SAMPLE_HISTORY;
}

export function saveWorkoutHistory(history: WorkoutSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.warn('Error saving history:', e);
  }
}

export function loadActiveSession(): WorkoutSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error loading active session:', e);
  }
  return null;
}

export function saveActiveSession(session: WorkoutSession | null): void {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
  } catch (e) {
    console.warn('Error saving active session:', e);
  }
}

// Calculate estimated 1 Rep Max using the standard Epley formula
export function calculate1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

// Find previous performance for a given exercise from completed workouts
export function findPreviousExercisePerformance(
  exerciseId: string,
  history: WorkoutSession[],
  currentSessionId?: string
): WorkoutSet[] | null {
  // Sort history newest first
  const completed = history
    .filter((s) => s.completed && s.id !== currentSessionId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const session of completed) {
    const foundExercise = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (foundExercise && foundExercise.sets.some((s) => s.completed && s.weightKg > 0)) {
      return foundExercise.sets.filter((s) => s.completed && s.weightKg > 0);
    }
  }
  return null;
}

// Calculate Personal Records for all exercises or a single exercise
export function calculatePersonalRecords(history: WorkoutSession[]): Record<string, PersonalRecord> {
  const records: Record<string, PersonalRecord> = {};

  const completed = history.filter((s) => s.completed);

  for (const session of completed) {
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (!set.completed || set.weightKg <= 0 || set.reps <= 0) continue;

        const current1RM = calculate1RM(set.weightKg, set.reps);
        const existing = records[ex.exerciseId];

        if (!existing) {
          records[ex.exerciseId] = {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            maxWeight: set.weightKg,
            maxRepsAtMaxWeight: set.reps,
            estimated1RM: current1RM,
            achievedDate: session.date,
            totalVolume: set.weightKg * set.reps,
          };
        } else {
          existing.totalVolume += set.weightKg * set.reps;
          if (current1RM > existing.estimated1RM) {
            existing.estimated1RM = current1RM;
            existing.achievedDate = session.date;
          }
          if (set.weightKg > existing.maxWeight) {
            existing.maxWeight = set.weightKg;
            existing.maxRepsAtMaxWeight = set.reps;
          }
        }
      }
    }
  }

  return records;
}

// Export full database to JSON file
export function exportDataAsJSON(): void {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    exercises: loadExercises(),
    routines: loadRoutines(),
    history: loadWorkoutHistory(),
    settings: loadSettings(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ironlog-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import database from JSON
export function importDataFromJSON(
  jsonString: string
): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.routines || !data.history) {
      return { success: false, message: 'El archivo no contiene un formato válido de IronLog.' };
    }
    if (data.exercises) saveExercises(data.exercises);
    if (data.routines) saveRoutines(data.routines);
    if (data.history) saveWorkoutHistory(data.history);
    if (data.settings) saveSettings(data.settings);
    return { success: true, message: '¡Datos restaurados con éxito!' };
  } catch (e) {
    return { success: false, message: 'Error al procesar el archivo JSON.' };
  }
}
