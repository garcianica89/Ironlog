import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Plus,
  Play,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Calendar,
  Dumbbell,
  Sparkles,
  Copy,
  Check,
  X,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Exercise, Routine, RoutineExerciseConfig } from '../types/workout';
import { DAY_NAMES, SHORT_DAY_NAMES, MUSCLE_GROUP_LABELS } from '../data/exerciseCatalog';
import { parseRoutinesByDays } from '../services/routineParser';
import { DEFAULT_ROUTINES } from '../data/defaultRoutines';

interface Props {
  routines: Routine[];
  onSaveRoutines: (routines: Routine[]) => void;
  onStartRoutineToday: (routine: Routine) => void;
  exercisesCatalog: Exercise[];
  onAddMultipleExercises?: (newExs: Exercise[]) => void;
  onOpenExerciseSelectorForRoutine: (callback: (ex: Exercise) => void) => void;
}

export const RoutineManager: React.FC<Props> = ({
  routines,
  onSaveRoutines,
  onStartRoutineToday,
  exercisesCatalog,
  onAddMultipleExercises,
  onOpenExerciseSelectorForRoutine,
}) => {
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showQuickPaste, setShowQuickPaste] = useState(false);
  const [quickPasteText, setQuickPasteText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  // Real-time parsed preview
  const parseResult = useMemo(() => {
    if (!quickPasteText.trim()) return null;
    return parseRoutinesByDays(quickPasteText, exercisesCatalog);
  }, [quickPasteText, exercisesCatalog]);

  // Start creating new routine
  const handleStartCreate = () => {
    setEditingRoutine({
      id: `routine-${Date.now()}`,
      name: 'Mi Nueva Rutina',
      description: 'Rutina personalizada para gym',
      muscleGroups: ['pecho'],
      assignedDays: [1, 3, 5],
      exercises: [],
    });
    setIsCreatingNew(true);
  };

  // Start editing existing routine
  const handleStartEdit = (routine: Routine) => {
    setEditingRoutine(JSON.parse(JSON.stringify(routine)));
    setIsCreatingNew(false);
  };

  // Duplicate routine
  const handleDuplicate = (routine: Routine) => {
    const dup: Routine = {
      ...JSON.parse(JSON.stringify(routine)),
      id: `routine-${Date.now()}`,
      name: `${routine.name} (Copia)`,
    };
    onSaveRoutines([...routines, dup]);
  };

  // Delete routine
  const handleDeleteRoutine = (id: string) => {
    if (confirm('¿Eliminar esta rutina? Podrás crear otra cuando quieras.')) {
      onSaveRoutines(routines.filter((r) => r.id !== id));
      if (editingRoutine?.id === id) {
        setEditingRoutine(null);
      }
    }
  };

  // Toggle assigned day of week
  const handleToggleDay = (dayIndex: number) => {
    if (!editingRoutine) return;
    const days = editingRoutine.assignedDays.includes(dayIndex)
      ? editingRoutine.assignedDays.filter((d) => d !== dayIndex)
      : [...editingRoutine.assignedDays, dayIndex].sort();
    setEditingRoutine({ ...editingRoutine, assignedDays: days });
  };

  // Move exercise up/down in routine
  const handleMoveExercise = (idx: number, direction: 'up' | 'down') => {
    if (!editingRoutine) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= editingRoutine.exercises.length) return;

    const list = [...editingRoutine.exercises];
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    setEditingRoutine({ ...editingRoutine, exercises: list });
  };

  // Remove exercise from routine
  const handleRemoveExercise = (idx: number) => {
    if (!editingRoutine) return;
    const list = editingRoutine.exercises.filter((_, i) => i !== idx);
    setEditingRoutine({ ...editingRoutine, exercises: list });
  };

  // Update exercise config
  const handleUpdateExerciseConfig = (
    idx: number,
    field: keyof RoutineExerciseConfig,
    value: unknown
  ) => {
    if (!editingRoutine) return;
    const list = [...editingRoutine.exercises];
    list[idx] = { ...list[idx], [field]: value };
    setEditingRoutine({ ...editingRoutine, exercises: list });
  };

  // Add exercise to editing routine
  const handleAddExerciseToRoutine = () => {
    onOpenExerciseSelectorForRoutine((ex: Exercise) => {
      if (!editingRoutine) return;
      const newConfig: RoutineExerciseConfig = {
        exerciseId: ex.id,
        exerciseName: ex.name,
        defaultSets: 3,
        targetReps: '8-12',
        targetWeight: 0,
      };
      setEditingRoutine((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          exercises: [...prev.exercises, newConfig],
        };
      });
    });
  };

  // Save routine changes
  const handleSaveEditing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoutine) return;

    if (isCreatingNew) {
      onSaveRoutines([...routines, editingRoutine]);
    } else {
      onSaveRoutines(routines.map((r) => (r.id === editingRoutine.id ? editingRoutine : r)));
    }
    setEditingRoutine(null);
    setIsCreatingNew(false);
  };

  // Direct 1-click restore to user's pristine 6-day split
  const handleRestoreDefaultWeeklyPlan = () => {
    if (confirm('¿Restablecer tus 6 rutinas semanales (Lunes a Sábado) con sus 25 ejercicios limpios y ordenados?')) {
      onSaveRoutines(DEFAULT_ROUTINES);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
  };

  // Helper to sort routines chronologically from Lunes (1) to Domingo (0/7)
  const sortRoutinesByWeekDay = (list: Routine[]): Routine[] => {
    return [...list].sort((a, b) => {
      const dayA = a.assignedDays[0] === 0 ? 7 : (a.assignedDays[0] ?? 99);
      const dayB = b.assignedDays[0] === 0 ? 7 : (b.assignedDays[0] ?? 99);
      return dayA - dayB;
    });
  };

  // Confirm and import parsed multi-day routines
  const handleConfirmMultiDayImport = () => {
    if (!parseResult || parseResult.routines.length === 0) return;

    // Add new exercises to catalog if any
    if (onAddMultipleExercises && parseResult.newExercisesToAdd.length > 0) {
      onAddMultipleExercises(parseResult.newExercisesToAdd);
    }

    const sortedParsed = sortRoutinesByWeekDay(parseResult.routines);

    // Save routines
    if (importMode === 'replace') {
      onSaveRoutines(sortedParsed);
    } else {
      onSaveRoutines(sortRoutinesByWeekDay([...routines, ...sortedParsed]));
    }

    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    setShowQuickPaste(false);
    setQuickPasteText('');
  };

  // Preset sample user text
  const userFullRoutineSample = `LUNES — PECHO Y BÍCEPS

- Press de pecho en máquina — 3 × 8–12
- Press inclinado con mancuernas — 3 × 8–12
- Aperturas en máquina — 2 × 12–15
- Curl de bíceps con barra Z — 3 × 10–12
- Curl martillo con mancuernas — 2 × 10–12

MARTES — ESPALDA Y TRÍCEPS

- Jalón al pecho — 3 × 8–12
- Remo sentado en polea — 3 × 8–12
- Remo con pecho apoyado — 2 × 10–12
- Extensión de tríceps en polea — 3 × 10–12
- Extensión de tríceps por encima de la cabeza — 2 × 10–12

MIÉRCOLES — CUÁDRICEPS Y PIERNAS

- Prensa de piernas — 3 × 8–12
- Sentadilla hack o guiada — 2 × 8–12
- Extensión de cuádriceps — 3 × 10–15
- Curl femoral sentado — 2 × 10–12
- Elevación de gemelos de pie — 3 × 12–15

JUEVES — PECHO, ESPALDA Y BÍCEPS

- Press inclinado en máquina — 3 × 8–12
- Aperturas en máquina — 2 × 12–15
- Remo con pecho apoyado — 3 × 8–12
- Jalón al pecho con agarre neutro — 2 × 10–12
- Curl de bíceps con mancuernas — 2 × 10–12

VIERNES — GLÚTEOS Y FEMORALES

- Hip thrust — 3 × 8–12
- Curl femoral sentado — 3 × 10–12
- Peso muerto rumano con mancuernas — 2 × 8–10
- Abducción de cadera en máquina — 2 × 12–15
- Elevación de gemelos de pie — 2 × 12–15

SÁBADO — HOMBROS Y TRÍCEPS

- Press de hombros en máquina — 2 × 8–12
- Elevaciones laterales con mancuernas — 3 × 12–15
- Pájaros en máquina — 3 × 12–15
- Extensión de tríceps en polea — 3 × 10–12
- Extensión de tríceps con cuerda por encima de la cabeza — 2 × 10–12`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <Dumbbell className="w-4 h-4" />
              <span>Gestor de Rutinas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Mis Rutinas de Gym ({routines.length} Activas)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Organizadas por día de la semana. Reordena ejercicios con las flechas o importa tu rutina completa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleRestoreDefaultWeeklyPlan}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              title="Restablecer exactamente las 6 rutinas de Lunes a Sábado con sus 25 ejercicios"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restablecer Plan Semanal</span>
            </button>

            <button
              onClick={() => setShowQuickPaste(true)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition"
              title="Pegar texto completo por días para que la app lo organice"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Importar por Días</span>
            </button>

            <button
              onClick={handleStartCreate}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Rutina</span>
            </button>
          </div>
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routines.map((routine) => (
          <div
            key={routine.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 text-slate-100 shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-lg font-bold font-display text-white">{routine.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                    {routine.description || 'Sin descripción'}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleDuplicate(routine)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Duplicar rutina"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStartEdit(routine)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Editar rutina y reordenar ejercicios"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRoutine(routine.id)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Eliminar rutina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Days assigned pill strip */}
              <div className="flex items-center gap-1.5 my-3 flex-wrap">
                <span className="text-[11px] text-slate-400 mr-1">Días:</span>
                {SHORT_DAY_NAMES.map((name, dayIdx) => {
                  const isAssigned = routine.assignedDays.includes(dayIdx);
                  return (
                    <span
                      key={dayIdx}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                        isAssigned
                          ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                          : 'bg-slate-800/60 text-slate-500'
                      }`}
                    >
                      {name}
                    </span>
                  );
                })}
              </div>

              {/* Exercises summary list */}
              <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 mb-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-1.5">
                  <span className="font-medium">
                    {routine.exercises.length} Ejercicios en orden:
                  </span>
                  <span>{routine.exercises.reduce((acc, e) => acc + e.defaultSets, 0)} series</span>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {routine.exercises.map((re, idx) => {
                    const exObj = exercisesCatalog.find((e) => e.id === re.exerciseId);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-slate-300 py-0.5"
                      >
                        <span className="truncate pr-2">
                          <span className="text-emerald-400 font-mono text-[11px] mr-1.5">
                            {idx + 1}.
                          </span>
                          {re.exerciseName || exObj?.name || 'Ejercicio'}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px] shrink-0">
                          {re.defaultSets} × {re.targetReps}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Start this routine CTA */}
            <button
              onClick={() => onStartRoutineToday(routine)}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition group"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400 group-hover:text-slate-950" />
              <span>Cargar y Entrenar Hoy</span>
            </button>
          </div>
        ))}
      </div>

      {/* Routine Edit / Create Modal */}
      {editingRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-slate-100 shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-xl font-bold font-display text-white">
                {isCreatingNew ? 'Crear Nueva Rutina' : 'Editar Rutina'}
              </h3>
              <button
                onClick={() => setEditingRoutine(null)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditing} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Nombre de la Rutina
                  </label>
                  <input
                    type="text"
                    value={editingRoutine.name}
                    onChange={(e) => setEditingRoutine({ ...editingRoutine, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Descripción / Enfoque
                  </label>
                  <input
                    type="text"
                    value={editingRoutine.description || ''}
                    onChange={(e) =>
                      setEditingRoutine({ ...editingRoutine, description: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Ej: Pecho y bíceps pesado"
                  />
                </div>
              </div>

              {/* Day assignment */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Días asignados en la semana:
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {SHORT_DAY_NAMES.map((name, dayIdx) => {
                    const isSelected = editingRoutine.assignedDays.includes(dayIdx);
                    return (
                      <button
                        type="button"
                        key={dayIdx}
                        onClick={() => handleToggleDay(dayIdx)}
                        className={`py-2 rounded-xl text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exercises List with REORDERING */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Ejercicios en orden ({editingRoutine.exercises.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddExerciseToRoutine}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Ejercicio
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {editingRoutine.exercises.map((re, idx) => {
                    const ex = exercisesCatalog.find((e) => e.id === re.exerciseId);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-sm font-semibold text-white block">
                              {re.exerciseName || ex?.name || 'Ejercicio'}
                            </span>
                            <span className="text-[11px] text-slate-400 capitalize">
                              {ex ? MUSCLE_GROUP_LABELS[ex.muscleGroup] : ''}
                            </span>
                          </div>
                        </div>

                        {/* Sets, Reps and Reordering */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <span>Series:</span>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={re.defaultSets}
                              onChange={(e) =>
                                handleUpdateExerciseConfig(
                                  idx,
                                  'defaultSets',
                                  parseInt(e.target.value) || 3
                                )
                              }
                              className="w-12 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-center font-mono"
                            />
                          </div>

                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <span>Reps:</span>
                            <input
                              type="text"
                              value={re.targetReps}
                              onChange={(e) =>
                                handleUpdateExerciseConfig(idx, 'targetReps', e.target.value)
                              }
                              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-center font-mono"
                              placeholder="8-12"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleMoveExercise(idx, 'up')}
                            disabled={idx === 0}
                            className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                            title="Mover arriba"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveExercise(idx, 'down')}
                            disabled={idx === editingRoutine.exercises.length - 1}
                            className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                            title="Mover abajo"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(idx)}
                            className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                            title="Quitar de la rutina"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRoutine(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Guardar Rutina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Intelligent Multi-Day Routine Parser Modal */}
      {showQuickPaste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-slate-100 shadow-2xl my-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-white">
                    Reconocimiento Inteligente por Días
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pega tu rutina semanal y la app la organizará día por día automáticamente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickPaste(false)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick paste button to load the user's specific routine */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Pega tu texto aquí:</span>
              <button
                type="button"
                onClick={() => setQuickPasteText(userFullRoutineSample)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
              >
                Cargar tu rutina enviada (Lunes a Sábado)
              </button>
            </div>

            <textarea
              rows={7}
              value={quickPasteText}
              onChange={(e) => setQuickPasteText(e.target.value)}
              placeholder={`LUNES — PECHO Y BÍCEPS\n- Press de pecho en máquina — 3 × 8–12\n- Press inclinado con mancuernas — 3 × 8–12\n\nMARTES — ESPALDA Y TRÍCEPS\n- Jalón al pecho — 3 × 8–12\n- Remo sentado en polea — 3 × 8–12...`}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
            />

            {/* Real-time Parsed Result Breakdown */}
            {parseResult && parseResult.parsedDays.length > 0 && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    ¡Reconocidos con éxito {parseResult.parsedDays.length} días de entrenamiento!
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {parseResult.parsedDays.reduce((acc, d) => acc + d.exercises.length, 0)} ejercicios detectados
                  </span>
                </div>

                {/* Day Previews */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {parseResult.parsedDays.map((d, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{d.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                          Día: {d.dayName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                        {d.exercises.map((ex, exIdx) => (
                          <div key={exIdx} className="flex justify-between truncate">
                            <span className="truncate pr-1">• {ex.name}</span>
                            <span className="font-mono text-emerald-400/90 shrink-0">
                              {ex.sets} × {ex.targetReps}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Import Mode selection */}
                <div className="pt-2 flex items-center gap-4 text-xs text-slate-300">
                  <span className="font-medium text-slate-400">Modo de importación:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-emerald-500"
                    />
                    <span>Reemplazar rutinas anteriores</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="accent-emerald-500"
                    />
                    <span>Añadir a las existentes</span>
                  </label>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onSaveRoutines(DEFAULT_ROUTINES);
                  confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
                  setShowQuickPaste(false);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5"
                title="Carga directamente las 6 rutinas de Lunes a Sábado ya preconfiguradas con tus 25 ejercicios"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Cargar Plan Semanal Directo</span>
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowQuickPaste(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMultiDayImport}
                  disabled={!parseResult || parseResult.routines.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    Importar {parseResult ? parseResult.routines.length : 0} Rutinas Reconocidas
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
