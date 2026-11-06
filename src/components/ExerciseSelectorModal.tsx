import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Dumbbell } from 'lucide-react';
import { Exercise, MuscleGroup } from '../types/workout';
import { MUSCLE_GROUP_LABELS } from '../data/exerciseCatalog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
  onAddCustomExercise: (newEx: Omit<Exercise, 'id'>) => Exercise;
}

const MUSCLE_FILTERS: { key: string; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'pecho', label: 'Pecho' },
  { key: 'espalda', label: 'Espalda' },
  { key: 'cuadriceps', label: 'Cuádriceps' },
  { key: 'isquios', label: 'Isquios/Glúteo' },
  { key: 'hombros', label: 'Hombros' },
  { key: 'biceps', label: 'Bíceps' },
  { key: 'triceps', label: 'Tríceps' },
  { key: 'core', label: 'Core' },
];

export const ExerciseSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  exercises,
  onSelectExercise,
  onAddCustomExercise,
}) => {
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('todos');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('pecho');

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        (MUSCLE_GROUP_LABELS[ex.muscleGroup] || '').toLowerCase().includes(search.toLowerCase());

      const matchesMuscle =
        selectedMuscle === 'todos' ||
        ex.muscleGroup === selectedMuscle ||
        (selectedMuscle === 'isquios' && (ex.muscleGroup === 'isquios' || ex.muscleGroup === 'gluteos'));

      return matchesSearch && matchesMuscle;
    });
  }, [exercises, search, selectedMuscle]);

  if (!isOpen) return null;

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const created = onAddCustomExercise({
      name: customName.trim(),
      muscleGroup: customMuscle,
      equipment: 'mancuernas',
      isCustom: true,
    });
    setCustomName('');
    setIsCreatingCustom(false);
    onSelectExercise(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl flex flex-col max-h-[90vh] shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Seleccionar Ejercicio</h3>
              <p className="text-xs text-slate-400">Elige o crea un ejercicio para tu rutina</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o músculo..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              autoFocus
            />
          </div>

          {/* Muscle Filters (Horizontal scroll on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
            {MUSCLE_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedMuscle(f.key)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors shrink-0 ${
                  selectedMuscle === f.key
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => {
                  onSelectExercise(ex);
                  onClose();
                }}
                className="w-full text-left p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between transition group min-h-[56px]"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-400 transition">
                    {ex.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="capitalize">{MUSCLE_GROUP_LABELS[ex.muscleGroup]}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{ex.equipment}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-emerald-500 text-slate-400 group-hover:text-slate-950 flex items-center justify-center transition">
                  <Plus className="w-4 h-4" />
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400 mb-3">No encontramos ese ejercicio.</p>
              <button
                onClick={() => {
                  setIsCreatingCustom(true);
                  setCustomName(search);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-medium text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Crear "{search || 'Nuevo Ejercicio'}"
              </button>
            </div>
          )}
        </div>

        {/* Custom exercise drawer / form */}
        {isCreatingCustom ? (
          <form onSubmit={handleCreateCustom} className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Crear Ejercicio Personalizado
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nombre del ejercicio"
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
              <select
                value={customMuscle}
                onChange={(e) => setCustomMuscle(e.target.value as MuscleGroup)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(MUSCLE_GROUP_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition"
            >
              Guardar y Agregar
            </button>
          </form>
        ) : (
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/90 text-center">
            <button
              onClick={() => setIsCreatingCustom(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1.5 py-1"
            >
              <Plus className="w-3.5 h-3.5" /> ¿No encuentras tu ejercicio? Crear uno nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
