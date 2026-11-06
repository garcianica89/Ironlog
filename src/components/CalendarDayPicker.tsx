import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
  Dumbbell,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';
import { WorkoutSession } from '../types/workout';
import { DAY_NAMES, SHORT_DAY_NAMES } from '../data/exerciseCatalog';

interface Props {
  history: WorkoutSession[];
  onSelectDateToTrain: (dateStr: string) => void;
  onMoveWorkoutSession: (sessionId: string, newDateStr: string) => void;
  unit: 'kg' | 'lb';
}

export const CalendarDayPicker: React.FC<Props> = ({
  history,
  onSelectDateToTrain,
  onMoveWorkoutSession,
  unit,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [movingSession, setMovingSession] = useState<WorkoutSession | null>(null);
  const [targetMoveDate, setTargetMoveDate] = useState('');

  // Month navigation
  const prevMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonthDate(d);
  };

  const nextMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonthDate(d);
  };

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Compute days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map workouts by date
  const workoutsByDate: Record<string, WorkoutSession[]> = {};
  history.forEach((session) => {
    if (!workoutsByDate[session.date]) {
      workoutsByDate[session.date] = [];
    }
    workoutsByDate[session.date].push(session);
  });

  // Selected date's workouts
  const selectedDateWorkouts = workoutsByDate[selectedDateStr] || [];

  const handleConfirmMove = () => {
    if (!movingSession || !targetMoveDate) return;
    onMoveWorkoutSession(movingSession.id, targetMoveDate);
    setSelectedDateStr(targetMoveDate);
    setMovingSession(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <CalendarIcon className="w-4 h-4" />
              <span>Agenda y Calendario</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Organizar Entrenamientos por Día
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Revisa los días entrenados, planifica sesiones futuras y mueve cualquier entrenamiento a otra fecha.
            </p>
          </div>

          <button
            onClick={() => onSelectDateToTrain(selectedDateStr)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/10 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Entrenar el {selectedDateStr}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calendar Grid (8 cols on desktop) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          {/* Month Controller */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-lg font-bold font-display text-white capitalize">{monthName}</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonthDate(new Date())}
                className="px-2.5 py-1 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Hoy
              </button>
              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {SHORT_DAY_NAMES.map((d, i) => (
              <div key={i} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 sm:h-16 rounded-xl bg-slate-950/20" />
            ))}

            {/* Days in month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDateStr === dateStr;
              const hasWorkouts = (workoutsByDate[dateStr] || []).length > 0;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-14 sm:h-16 rounded-2xl p-1.5 flex flex-col justify-between items-center transition relative border ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-transparent bg-slate-800/40 hover:bg-slate-800'
                  }`}
                >
                  <span
                    className={`text-xs font-mono font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : isSelected
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {/* Workout Indicator pill / dot */}
                  {hasWorkouts && (
                    <div className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[9px] font-mono text-emerald-400 font-bold hidden sm:inline">
                        Gym
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details (5 cols on desktop) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                Detalle del Día
              </span>
              <h3 className="text-xl font-bold font-display text-white capitalize mt-0.5">
                {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h3>
            </div>

            {selectedDateWorkouts.length > 0 ? (
              <div className="space-y-3">
                {selectedDateWorkouts.map((session) => {
                  const vol = session.exercises.reduce(
                    (acc, ex) =>
                      acc +
                      ex.sets.reduce((sAcc, s) => (s.completed ? sAcc + s.weightKg * s.reps : sAcc), 0),
                    0
                  );

                  return (
                    <div
                      key={session.id}
                      className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            {session.name}
                          </h4>
                          <span className="text-xs text-slate-400">
                            {session.exercises.length} ejercicios registrados
                          </span>
                        </div>

                        {/* Move this workout to another date button */}
                        <button
                          onClick={() => {
                            setMovingSession(session);
                            setTargetMoveDate(session.date);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1 border border-slate-700 transition"
                          title="Mover este entrenamiento a otro día"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Mover de día</span>
                        </button>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-3 pt-1 border-t border-slate-800/80">
                        <span>Volumen: <strong className="text-white">{vol.toLocaleString()} {unit}</strong></span>
                        <span>·</span>
                        <span>
                          {session.exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.completed).length, 0)} series
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 p-6">
                <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No hay entrenamientos en esta fecha.</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  ¿Entrenaste este día o quieres programar una sesión aquí?
                </p>
                <button
                  onClick={() => onSelectDateToTrain(selectedDateStr)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold inline-flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Registrar Entrenamiento Aquí
                </button>
              </div>
            )}
          </div>

          {/* Quick Consistency Info */}
          <div className="pt-4 mt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Total este mes: <strong className="text-emerald-400 font-mono">{Object.keys(workoutsByDate).filter(d => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length} días</strong></span>
            <span>Semana actual activa</span>
          </div>
        </div>
      </div>

      {/* Move Session Modal */}
      {movingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-xl font-bold font-display text-white mb-1">
              Mover Entrenamiento de Día
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Mover sesión <strong>"{movingSession.name}"</strong> a una nueva fecha.
            </p>

            <label className="block text-xs font-medium text-slate-400 mb-1">
              Nueva Fecha Destino
            </label>
            <input
              type="date"
              value={targetMoveDate}
              onChange={(e) => setTargetMoveDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm mb-4 focus:outline-none focus:border-emerald-500 font-mono"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setMovingSession(null)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmMove}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Confirmar Mover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
