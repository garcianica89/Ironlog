export type MuscleGroup =
  | 'pecho'
  | 'espalda'
  | 'cuadriceps'
  | 'isquios'
  | 'gluteos'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'pantorrillas'
  | 'cuerpo_completo';

export type EquipmentType =
  | 'barra'
  | 'mancuernas'
  | 'maquina'
  | 'polea'
  | 'peso_corporal'
  | 'kettlebell'
  | 'otro';

export type SetType = 'warmup' | 'normal' | 'dropset' | 'failure';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
  secondaryMuscles?: MuscleGroup[];
  instructions?: string;
  isCustom?: boolean;
  aliases?: string[];
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: SetType;
  weightKg: number;
  reps: number;
  completed: boolean;
  rpe?: number;
  previousWeight?: number;
  previousReps?: number;
}

export interface SessionExercise {
  id: string; // unique instance in this session
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  notes?: string;
  sets: WorkoutSet[];
  order: number;
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  routineId?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  notes?: string;
  completed: boolean;
  exercises: SessionExercise[];
}

export interface RoutineExerciseConfig {
  exerciseId: string;
  exerciseName?: string;
  defaultSets: number;
  targetReps: string; // e.g. "8-10"
  targetWeight?: number;
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  muscleGroups: MuscleGroup[];
  assignedDays: number[]; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  exercises: RoutineExerciseConfig[];
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxRepsAtMaxWeight: number;
  estimated1RM: number;
  achievedDate: string;
  totalVolume: number;
}

export type ActiveTab = 'hoy' | 'rutinas' | 'historial' | 'graficas' | 'herramientas';
