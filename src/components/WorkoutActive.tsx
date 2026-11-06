import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Check,
  Trophy,
  Dumbbell,
  Clock,
  ArrowUpDown,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import {
  Exercise,
  Routine,
  SessionExercise,
  SetType,
  WorkoutSession,
  WorkoutSet
} from '../types/workout';
import { MUSCLE_GROUP_LABELS } from '../data/exerciseCatalog';
import {
  calculate1RM,
  calculatePersonalRecords,
  findPreviousExercisePerformance
} from '../services/storage';
import { playPRFanfare, playSetCompleteSound } from '../services/audio';

interface Props {
  session: WorkoutSession | null;
  onUpdateSession: (session: WorkoutSession | null) => void;
  onFinishSession: (session: WorkoutSession) => void;
  routines: Routine[];
  exercisesCatalog: Exercise[];
  history: WorkoutSession[];
  unit: 'kg' | 'lb';
  onOpenExerciseSelector: () => void;
  onStartRestTimer: (seconds: number) => void;
  soundEnabled: boolean;
}

export const WorkoutActive: React.FC<Props> = ({
  session,
  onUpdateSession,
  onFinishSession,
  routines,
  exercisesCatalog,
  history,
  unit,
  onOpenExerciseSelector,
  onStartRestTimer,
  soundEnabled,
}) => {
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(session?.date || new Date().toISOString().split('T')[0]);
  const [newPrAlert, setNewPrAlert] = useState<string | null>(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  // All time PRs cache to detect new records during workout
  const currentPRs = calculatePersonalRecords(history);

  // Start new empty workout
  const handleStartEmpty = (dateStr: string = selectedDate) => {
    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      date: dateStr,
      name: 'Entrenamiento Libre',
      completed: false,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exercises: [],
    };
    onUpdateSession(newSession);
  };

  // Start workout from a routine template
  const handleStartFromRoutine = (routine: Routine, dateStr: string = selectedDate) => {
    const sessionExercises: SessionExercise[] = routine.exercises.map((re, idx) => {
      const catalogEx = exercisesCatalog.find((e) => e.id === re.exerciseId);
      const exerciseName = re.exerciseName || catalogEx?.name || 'Ejercicio';
      const muscleGroup = catalogEx ? catalogEx.muscleGroup : 'pecho';

      // Look up previous sets
      const previousSets = findPreviousExercisePerformance(re.exerciseId, history);

      const sets: WorkoutSet[] = [];
      const numSets = re.defaultSets || 3;

      for (let i = 1; i <= numSets; i++) {
        const prevSet = previousSets && previousSets[i - 1];
        const defaultWeight = prevSet ? prevSet.weightKg : re.targetWeight || 0;
        const defaultReps = prevSet ? prevSet.reps : 10;

        sets.push({
          id: `set-${Date.now()}-${idx}-${i}`,
          setNumber: i,
          type: 'normal',
          weightKg: defaultWeight,
          reps: defaultReps,
          completed: false,
          previousWeight: prevSet?.weightKg,
          previousReps: prevSet?.reps,
        });
      }

      return {
        id: `se-${Date.now()}-${idx}`,
        exerciseId: re.exerciseId,
        exerciseName,
        muscleGroup,
        order: idx + 1,
        sets,
      };
    });

    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      date: dateStr,
      name: routine.name,
      routineId: routine.id,
      completed: false,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exercises: sessionExercises,
    };

    onUpdateSession(newSession);
  };

  // Move workout date
  const handleMoveDate = (newDate: string) => {
    if (!session) return;
    const updated = { ...session, date: newDate };
    onUpdateSession(updated);
    setSelectedDate(newDate);
    setShowDatePickerModal(false);
  };

  // Move exercise Up / Down
  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (!session) return;
    const exercises = [...session.exercises];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= exercises.length) return;

    // Swap
    const temp = exercises[index];
    exercises[index] = exercises[targetIndex];
    exercises[targetIndex] = temp;

    // Re-index order
    exercises.forEach((ex, idx) => {
      ex.order = idx + 1;
    });

    onUpdateSession({ ...session, exercises });
  };

  // Delete exercise from session
  const handleDeleteExercise = (exId: string) => {
    if (!session) return;
    const exercises = session.exercises
      .filter((e) => e.id !== exId)
      .map((ex, idx) => ({ ...ex, order: idx + 1 }));
    onUpdateSession({ ...session, exercises });
  };

  // Add a set to an exercise
  const handleAddSet = (exerciseIndex: number) => {
    if (!session) return;
    const exercises = [...session.exercises];
    const targetEx = exercises[exerciseIndex];
    const lastSet = targetEx.sets[targetEx.sets.length - 1];

    const newSet: WorkoutSet = {
      id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      setNumber: targetEx.sets.length + 1,
      type: lastSet ? lastSet.type : 'normal',
      weightKg: lastSet ? lastSet.weightKg : 20,
      reps: lastSet ? lastSet.reps : 10,
      completed: false,
      previousWeight: lastSet?.previousWeight,
      previousReps: lastSet?.previousReps,
    };

    targetEx.sets.push(newSet);
    onUpdateSession({ ...session, exercises });
  };

  // Delete set
  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    if (!session) return;
    const exercises = [...session.exercises];
    exercises[exerciseIndex].sets.splice(setIndex, 1);
    // Renumber
    exercises[exerciseIndex].sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    onUpdateSession({ ...session, exercises });
  };

  // Update a single set field
  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    updates: Partial<WorkoutSet>
  ) => {
    if (!session) return;
    const exercises = [...session.exercises];
    const targetSet = exercises[exerciseIndex].sets[setIndex];
    const updatedSet = { ...targetSet, ...updates };

    // Check if user just checked completed
    if (updates.completed === true && !targetSet.completed) {
      if (soundEnabled) playSetCompleteSound();
      // Start rest timer automatically
      onStartRestTimer(90);

      // Check for PR
      const exId = exercises[exerciseIndex].exerciseId;
      const exName = exercises[exerciseIndex].exerciseName;
      const existingPR = currentPRs[exId];
      const est1RM = calculate1RM(updatedSet.weightKg, updatedSet.reps);

      if (
        est1RM > 0 &&
        (!existingPR || updatedSet.weightKg > existingPR.maxWeight || est1RM > existingPR.estimated1RM)
      ) {
        // We have a PR!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        if (soundEnabled) playPRFanfare();
        setNewPrAlert(`¡Nuevo Récord Personal en ${exName}! ${updatedSet.weightKg} ${unit} × ${updatedSet.reps} reps (1RM: ${est1RM} ${unit})`);
        setTimeout(() => setNewPrAlert(null), 5000);
      }
    }

    exercises[exerciseIndex].sets[setIndex] = updatedSet;
    onUpdateSession({ ...session, exercises });
  };

  // Format date readable in Spanish
  const formatDateReadable = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    } catch {
      return dateStr;
    }
  };

  // Calculate session summary stats
  const totalVolume = session
    ? session.exercises.reduce((acc, ex) => {
        return (
          acc +
          ex.sets.reduce((sAcc, s) => {
            return s.completed ? sAcc + s.weightKg * s.reps : sAcc;
          }, 0)
        );
      }, 0)
    : 0;

  const totalCompletedSets = session
    ? session.exercises.reduce((acc, ex) => {
        return acc + ex.sets.filter((s) => s.completed).length;
      }, 0)
    : 0;

  // Empty state: no active session
  if (!session) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-24">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                <Dumbbell className="w-4 h-4" />
                <span>Entrenamiento del Día</span>
              </div>
              <h2 className="text-3xl font-bold font-display text-white tracking-tight">
                ¿Qué entrenamos hoy?
              </h2>
              <p className="text-sm text-slate-400 mt-1 capitalize">
                {formatDateReadable(selectedDate)}
              </p>
            </div>

            {/* Change Day Button */}
            <button
              onClick={() => setShowDatePickerModal(true)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-medium text-slate-200 flex items-center gap-2 self-start sm:self-auto transition"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Cambiar fecha: {selectedDate}</span>
            </button>
          </div>

          {/* Quick Routine Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cargar una de mis Rutinas:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {routines.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleStartFromRoutine(r, selectedDate)}
                  className="p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 text-left transition group min-h-[72px]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white group-hover:text-emerald-400 transition text-sm">
                      {r.name}
                    </span>
                    <Play className="w-4 h-4 text-emerald-400 opacity-80 group-hover:translate-x-0.5 transition" />
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                    {r.description || 'Rutina personalizada'}
                  </p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{r.exercises.length} ejercicios</span>
                    <span>·</span>
                    <span>{r.exercises.reduce((acc, e) => acc + e.defaultSets, 0)} series aprox.</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => handleStartEmpty(selectedDate)}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/10"
              >
                <Plus className="w-4 h-4" /> Comenzar Entrenamiento Libre
              </button>
              <span className="text-xs text-slate-500">
                O elige una rutina arriba para cargar ejercicios y series previas.
              </span>
            </div>
          </div>
        </div>

        {/* Date Picker Modal for starting on another date */}
        {showDatePickerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl">
              <h3 className="text-lg font-bold font-display text-white mb-2">
                Seleccionar Día de Entrenamiento
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Elige qué día quieres registrar o cargar.
              </p>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm mb-4 focus:outline-none focus:border-emerald-500"
              />
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const y = new Date();
                    y.setDate(y.getDate() - 1);
                    setSelectedDate(y.toISOString().split('T')[0]);
                  }}
                  className="py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Ayer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const m = new Date();
                    m.setDate(m.getDate() + 1);
                    setSelectedDate(m.toISOString().split('T')[0]);
                  }}
                  className="py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Mañana
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowDatePickerModal(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs"
              >
                Confirmar Fecha
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active workout session in progress!
  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-28">
      {/* PR Alert Toast */}
      {newPrAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md p-4 bg-emerald-500 text-slate-950 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 border-2 border-emerald-300">
          <Trophy className="w-7 h-7 shrink-0 text-slate-950 animate-bounce" />
          <div className="text-xs font-medium">
            <span className="font-bold text-sm block">¡RÉCORD PERSONAL! 🔥</span>
            {newPrAlert}
          </div>
        </div>
      )}

      {/* Session Top Bar: Name, Date, Volume stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-slate-100 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <input
                type="text"
                value={session.name}
                onChange={(e) => onUpdateSession({ ...session, name: e.target.value })}
                className="text-xl sm:text-2xl font-bold font-display text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none transition"
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="capitalize">{formatDateReadable(session.date)}</span>
              <span>·</span>
              <span>Inicio: {session.startTime || 'En curso'}</span>
            </div>
          </div>

          {/* Mover por día button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDatePickerModal(true)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              title="Cambiar la fecha de este entrenamiento"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Mover de día ({session.date})</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Series Hechas</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{totalCompletedSets}</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Volumen Total</span>
            <span className="text-lg font-bold font-mono text-white">
              {totalVolume.toLocaleString()} <span className="text-xs font-normal text-slate-400">{unit}</span>
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Ejercicios</span>
            <span className="text-lg font-bold font-mono text-white">{session.exercises.length}</span>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {session.exercises.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl">
            <Dumbbell className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-white mb-1">Aún no hay ejercicios agregados</h4>
            <p className="text-xs text-slate-400 mb-4">
              Agrega tu primer ejercicio o carga una rutina para comenzar a registrar pesos y repeticiones.
            </p>
            <button
              onClick={onOpenExerciseSelector}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Agregar Ejercicio
            </button>
          </div>
        ) : (
          session.exercises.map((ex, exIndex) => {
            const bestPr = currentPRs[ex.exerciseId];
            return (
              <div
                key={ex.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 text-slate-100 shadow-md relative overflow-hidden"
              >
                {/* Exercise Header */}
                <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    {/* Index badge */}
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono flex items-center justify-center">
                      {exIndex + 1}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white tracking-wide">
                        {ex.exerciseName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="capitalize">{MUSCLE_GROUP_LABELS[ex.muscleGroup]}</span>
                        {bestPr && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-400/90 text-[11px] font-mono flex items-center gap-1">
                              <Trophy className="w-3 h-3 inline" /> PR: {bestPr.maxWeight} {unit} × {bestPr.maxRepsAtMaxWeight}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reordering Controls (UP / DOWN) & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveExercise(exIndex, 'up')}
                      disabled={exIndex === 0}
                      className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition"
                      title="Mover arriba"
                      aria-label="Mover ejercicio arriba"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveExercise(exIndex, 'down')}
                      disabled={exIndex === session.exercises.length - 1}
                      className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition"
                      title="Mover abajo"
                      aria-label="Mover ejercicio abajo"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExercise(ex.id)}
                      className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition ml-1"
                      title="Eliminar ejercicio de la sesión"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800/80">
                        <th className="py-2 px-1 text-center w-12">SET</th>
                        <th className="py-2 px-1 text-center w-28 hidden sm:table-cell">ANTERIOR</th>
                        <th className="py-2 px-1 text-center w-28">{unit.toUpperCase()}</th>
                        <th className="py-2 px-1 text-center w-24">REPS</th>
                        <th className="py-2 px-1 text-center w-14">✓</th>
                        <th className="py-2 px-1 text-center w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {ex.sets.map((set, setIndex) => {
                        const est1RM = calculate1RM(set.weightKg, set.reps);
                        return (
                          <tr
                            key={set.id}
                            className={`transition-colors ${
                              set.completed ? 'bg-emerald-950/20' : 'hover:bg-slate-800/30'
                            }`}
                          >
                            {/* Set Number & Type */}
                            <td className="py-2.5 px-1 text-center">
                              <select
                                value={set.type}
                                onChange={(e) =>
                                  handleUpdateSet(exIndex, setIndex, {
                                    type: e.target.value as SetType,
                                  })
                                }
                                className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                                  set.type === 'warmup'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : set.type === 'dropset'
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : set.type === 'failure'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                <option value="normal">{set.setNumber}</option>
                                <option value="warmup">W</option>
                                <option value="dropset">D</option>
                                <option value="failure">F</option>
                              </select>
                            </td>

                            {/* Previous Workout info */}
                            <td className="py-2.5 px-1 text-center text-slate-400 font-mono text-[11px] hidden sm:table-cell">
                              {set.previousWeight ? (
                                <span>
                                  {set.previousWeight} {unit} × {set.previousReps}
                                </span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>

                            {/* Weight input with quick +/- adjustments */}
                            <td className="py-2.5 px-1">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSet(exIndex, setIndex, {
                                      weightKg: Math.max(0, Math.round((set.weightKg - 2.5) * 10) / 10),
                                    })
                                  }
                                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  value={set.weightKg === 0 ? '' : set.weightKg}
                                  onChange={(e) =>
                                    handleUpdateSet(exIndex, setIndex, {
                                      weightKg: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-16 bg-slate-950 border border-slate-700/80 rounded-lg py-1.5 px-1 text-center font-mono font-bold text-white text-sm focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSet(exIndex, setIndex, {
                                      weightKg: Math.round((set.weightKg + 2.5) * 10) / 10,
                                    })
                                  }
                                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* Reps input with quick +/- */}
                            <td className="py-2.5 px-1">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSet(exIndex, setIndex, {
                                      reps: Math.max(0, set.reps - 1),
                                    })
                                  }
                                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={set.reps === 0 ? '' : set.reps}
                                  onChange={(e) =>
                                    handleUpdateSet(exIndex, setIndex, {
                                      reps: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="w-12 bg-slate-950 border border-slate-700/80 rounded-lg py-1.5 px-1 text-center font-mono font-bold text-white text-sm focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSet(exIndex, setIndex, {
                                      reps: set.reps + 1,
                                    })
                                  }
                                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* Big Checkbox ✓ */}
                            <td className="py-2.5 px-1 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateSet(exIndex, setIndex, {
                                    completed: !set.completed,
                                  })
                                }
                                className={`min-w-[44px] min-h-[44px] mx-auto rounded-xl flex items-center justify-center transition-all ${
                                  set.completed
                                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                                    : 'bg-slate-800 text-slate-500 hover:text-white hover:bg-slate-700 border border-slate-700'
                                }`}
                                aria-label="Completar serie"
                              >
                                <Check className="w-5 h-5 stroke-[3]" />
                              </button>
                            </td>

                            {/* Delete set */}
                            <td className="py-2.5 px-1 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteSet(exIndex, setIndex)}
                                className="w-6 h-6 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 flex items-center justify-center transition"
                                title="Eliminar serie"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add Set button */}
                <div className="pt-3 mt-1 flex items-center justify-between">
                  <button
                    onClick={() => handleAddSet(exIndex)}
                    className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" /> Añadir Serie
                  </button>

                  <button
                    onClick={() => onStartRestTimer(90)}
                    className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                  >
                    <Clock className="w-3.5 h-3.5" /> Temporizador de Descanso
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Footer: Add exercise & Finish workout */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={onOpenExerciseSelector}
          className="w-full sm:w-1/2 min-h-[48px] px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4 text-emerald-400" /> Agregar Ejercicio
        </button>

        <button
          onClick={() => setShowFinishConfirm(true)}
          disabled={session.exercises.length === 0}
          className="w-full sm:w-1/2 min-h-[48px] px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-500/20"
        >
          <CheckCircle2 className="w-5 h-5" /> Finalizar Entrenamiento
        </button>
      </div>

      {/* Date Mover Modal */}
      {showDatePickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold font-display text-white mb-1">
              Mover Entrenamiento a Otro Día
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Cambia la fecha de esta sesión para moverla a ayer, mañana o cualquier día.
            </p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm mb-4 focus:outline-none focus:border-emerald-500"
            />
            <div className="grid grid-cols-3 gap-2 mb-5">
              <button
                type="button"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => {
                  const y = new Date();
                  y.setDate(y.getDate() - 1);
                  setSelectedDate(y.toISOString().split('T')[0]);
                }}
                className="py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Ayer
              </button>
              <button
                type="button"
                onClick={() => {
                  const m = new Date();
                  m.setDate(m.getDate() + 1);
                  setSelectedDate(m.toISOString().split('T')[0]);
                }}
                className="py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Mañana
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDatePickerModal(false)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleMoveDate(selectedDate)}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs"
              >
                Guardar Cambio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Workout Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-white mb-1">
              ¿Finalizar Entrenamiento?
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Se guardarán todas las series completadas en tu historial y se actualizarán tus gráficas de progreso.
            </p>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 mb-5 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Series Completadas:</span>
                <span className="font-mono font-bold text-emerald-400">{totalCompletedSets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Volumen Total Levantado:</span>
                <span className="font-mono font-bold text-white">
                  {totalVolume.toLocaleString()} {unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fecha Asignada:</span>
                <span className="font-mono text-slate-300">{session.date}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="w-1/2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Continuar Entrenando
              </button>
              <button
                onClick={() => {
                  setShowFinishConfirm(false);
                  onFinishSession(session);
                }}
                className="w-1/2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Sí, Finalizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
