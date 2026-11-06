import React, { useState, useMemo } from 'react';
import {
  History,
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Play,
  Trash2,
  ArrowRightLeft,
  CheckCircle2,
  Trophy
} from 'lucide-react';
import { WorkoutSession } from '../types/workout';
import { MUSCLE_GROUP_LABELS } from '../data/exerciseCatalog';

interface Props {
  history: WorkoutSession[];
  onRepeatSession: (session: WorkoutSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onMoveSessionDate: (sessionId: string, newDate: string) => void;
  unit: 'kg' | 'lb';
}

export const WorkoutHistory: React.FC<Props> = ({
  history,
  onRepeatSession,
  onDeleteSession,
  onMoveSessionDate,
  unit,
}) => {
  const [search, setSearch] = useState('');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [movingSessionId, setMovingSessionId] = useState<string | null>(null);
  const [newDateValue, setNewDateValue] = useState('');

  const completedSessions = useMemo(() => {
    return [...history]
      .filter((s) => s.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  const filteredSessions = useMemo(() => {
    if (!search.trim()) return completedSessions;
    const lower = search.toLowerCase();
    return completedSessions.filter((s) => {
      const matchName = s.name.toLowerCase().includes(lower);
      const matchDate = s.date.includes(lower);
      const matchEx = s.exercises.some((e) => e.exerciseName.toLowerCase().includes(lower));
      return matchName || matchDate || matchEx;
    });
  }, [completedSessions, search]);

  const handleOpenMoveModal = (s: WorkoutSession) => {
    setMovingSessionId(s.id);
    setNewDateValue(s.date);
  };

  const handleSaveMove = () => {
    if (!movingSessionId || !newDateValue) return;
    onMoveSessionDate(movingSessionId, newDateValue);
    setMovingSessionId(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <History className="w-4 h-4" />
              <span>Registro Completo</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Historial de Entrenamientos
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Consulta tus sesiones pasadas, pesos levantados y repite cualquier rutina.
            </p>
          </div>

          <div className="text-xs text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 self-start sm:self-auto font-mono">
            Total sesiones: <strong className="text-emerald-400">{completedSessions.length}</strong>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ejercicio, nombre o fecha (ej: Press de banca, 2026-11)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            const totalVolume = session.exercises.reduce(
              (acc, ex) =>
                acc +
                ex.sets.reduce((sAcc, s) => (s.completed ? sAcc + s.weightKg * s.reps : sAcc), 0),
              0
            );
            const totalSets = session.exercises.reduce(
              (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
              0
            );

            return (
              <div
                key={session.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-slate-100 shadow-md transition"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div
                    onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                    className="cursor-pointer flex-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-mono text-xs font-semibold">
                        {session.date}
                      </span>
                      <span className="text-slate-600">·</span>
                      <h3 className="text-base font-bold text-white hover:text-emerald-400 transition">
                        {session.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{session.exercises.length} ejercicios</span>
                      <span>·</span>
                      <span>{totalSets} series</span>
                      <span>·</span>
                      <span className="font-mono text-slate-300">
                        {totalVolume.toLocaleString()} {unit}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => handleOpenMoveModal(session)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 border border-slate-700/80 transition"
                      title="Mover entrenamiento a otra fecha"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Mover fecha</span>
                    </button>

                    <button
                      onClick={() => onRepeatSession(session)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-1 border border-emerald-500/30 transition"
                      title="Cargar y repetir este entrenamiento hoy"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Cargar Hoy</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar esta sesión del historial?')) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                      title="Eliminar sesión"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                      className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Exercise & Sets Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-150">
                    {session.exercises.map((ex, exIdx) => (
                      <div
                        key={ex.id || exIdx}
                        className="bg-slate-950/70 rounded-2xl p-3 border border-slate-800/80"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-white mb-2">
                          <span className="flex items-center gap-1.5">
                            <span className="text-emerald-400 font-mono">{exIdx + 1}.</span>
                            {ex.exerciseName}
                          </span>
                          <span className="text-[11px] text-slate-400 capitalize">
                            {MUSCLE_GROUP_LABELS[ex.muscleGroup]}
                          </span>
                        </div>

                        {/* Sets list */}
                        <div className="flex flex-wrap gap-2">
                          {ex.sets.map((s, sIdx) => (
                            <div
                              key={s.id || sIdx}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1 ${
                                s.completed
                                  ? 'bg-slate-900 border-slate-700/80 text-emerald-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-500'
                              }`}
                            >
                              <span className="text-[10px] text-slate-500">S{s.setNumber}:</span>
                              <span>
                                {s.weightKg} {unit} × {s.reps}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 p-6">
            <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No se encontraron sesiones en el historial.</p>
          </div>
        )}
      </div>

      {/* Move Date Modal */}
      {movingSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-xl font-bold font-display text-white mb-1">
              Cambiar Fecha de la Sesión
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Indica en qué día se realizó o debe figurar este entrenamiento.
            </p>

            <input
              type="date"
              value={newDateValue}
              onChange={(e) => setNewDateValue(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm mb-4 focus:outline-none focus:border-emerald-500 font-mono"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setMovingSessionId(null)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveMove}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Mover a esta Fecha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
