import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Trophy,
  Dumbbell,
  Activity,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Exercise, WorkoutSession } from '../types/workout';
import { calculate1RM, calculatePersonalRecords } from '../services/storage';
import { MUSCLE_GROUP_LABELS } from '../data/exerciseCatalog';

interface Props {
  history: WorkoutSession[];
  exercisesCatalog: Exercise[];
  unit: 'kg' | 'lb';
}

export const ProgressCharts: React.FC<Props> = ({ history, exercisesCatalog, unit }) => {
  // Find all exercises that have at least one logged set in history
  const activeExerciseIds = useMemo(() => {
    const ids = new Set<string>();
    history
      .filter((s) => s.completed)
      .forEach((s) => {
        s.exercises.forEach((ex) => {
          if (ex.sets.some((set) => set.completed && set.weightKg > 0)) {
            ids.add(ex.exerciseId);
          }
        });
      });
    return Array.from(ids);
  }, [history]);

  // Default to the first active exercise or 'press-banca-barra'
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    activeExerciseIds[0] || 'press-banca-barra'
  );
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1m' | '3m' | '6m' | 'all'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    weight: number;
    reps: number;
    oneRM: number;
    volume: number;
    x: number;
    y: number;
  } | null>(null);

  // Selected exercise details
  const selectedExercise = useMemo(() => {
    return exercisesCatalog.find((e) => e.id === selectedExerciseId) || {
      id: selectedExerciseId,
      name: 'Ejercicio',
      muscleGroup: 'pecho',
      equipment: 'barra',
    };
  }, [exercisesCatalog, selectedExerciseId]);

  // Extract datapoints for selected exercise across sessions
  const exerciseDataPoints = useMemo(() => {
    const completedSessions = [...history]
      .filter((s) => s.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const points: {
      date: string;
      rawDate: string;
      maxWeight: number;
      repsAtMaxWeight: number;
      best1RM: number;
      totalVolume: number;
      setsCount: number;
    }[] = [];

    completedSessions.forEach((session) => {
      const ex = session.exercises.find((e) => e.exerciseId === selectedExerciseId);
      if (!ex) return;

      const validSets = ex.sets.filter((s) => s.completed && s.weightKg > 0);
      if (validSets.length === 0) return;

      let maxWeight = 0;
      let repsAtMaxWeight = 0;
      let best1RM = 0;
      let totalVolume = 0;

      validSets.forEach((s) => {
        const est1RM = calculate1RM(s.weightKg, s.reps);
        totalVolume += s.weightKg * s.reps;
        if (s.weightKg > maxWeight) {
          maxWeight = s.weightKg;
          repsAtMaxWeight = s.reps;
        }
        if (est1RM > best1RM) {
          best1RM = est1RM;
        }
      });

      points.push({
        date: session.date,
        rawDate: session.date,
        maxWeight,
        repsAtMaxWeight,
        best1RM,
        totalVolume,
        setsCount: validSets.length,
      });
    });

    // Filter by time range if necessary
    if (selectedTimeRange !== 'all') {
      const now = new Date();
      const months = selectedTimeRange === '1m' ? 1 : selectedTimeRange === '3m' ? 3 : 6;
      const cutoff = new Date(now.setMonth(now.getMonth() - months));
      return points.filter((p) => new Date(p.rawDate) >= cutoff);
    }

    return points;
  }, [history, selectedExerciseId, selectedTimeRange]);

  // Personal Records
  const allPRs = useMemo(() => calculatePersonalRecords(history), [history]);
  const currentPR = allPRs[selectedExerciseId];

  // Overall workout stats
  const totalCompletedWorkouts = history.filter((s) => s.completed).length;
  const totalKgAllTime = useMemo(() => {
    return history
      .filter((s) => s.completed)
      .reduce((sum, s) => {
        return (
          sum +
          s.exercises.reduce((exSum, ex) => {
            return (
              exSum +
              ex.sets.reduce((setSum, set) => {
                return set.completed ? setSum + set.weightKg * set.reps : setSum;
              }, 0)
            );
          }, 0)
        );
      }, 0);
  }, [history]);

  // Muscle Volume Distribution
  const muscleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    history
      .filter((s) => s.completed)
      .forEach((s) => {
        s.exercises.forEach((ex) => {
          const validSets = ex.sets.filter((st) => st.completed).length;
          counts[ex.muscleGroup] = (counts[ex.muscleGroup] || 0) + validSets;
        });
      });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [history]);

  // SVG Chart Dimensions & Computations
  const chartWidth = 640;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const weights = exerciseDataPoints.map((p) => p.maxWeight);
  const oneRMs = exerciseDataPoints.map((p) => p.best1RM);
  const allValues = [...weights, ...oneRMs];
  const minVal = allValues.length ? Math.floor(Math.min(...allValues) * 0.9) : 0;
  const maxVal = allValues.length ? Math.ceil(Math.max(...allValues) * 1.1) : 100;

  const pointsCoordinates = useMemo(() => {
    if (exerciseDataPoints.length === 0) return [];
    const count = exerciseDataPoints.length;
    const availableWidth = chartWidth - paddingX * 2;
    const availableHeight = chartHeight - paddingY * 2;

    return exerciseDataPoints.map((p, idx) => {
      const x = count === 1 ? chartWidth / 2 : paddingX + (idx / (count - 1)) * availableWidth;
      const normalizedY = (p.maxWeight - minVal) / (maxVal - minVal || 1);
      const y = chartHeight - paddingY - normalizedY * availableHeight;

      const norm1RM = (p.best1RM - minVal) / (maxVal - minVal || 1);
      const y1RM = chartHeight - paddingY - norm1RM * availableHeight;

      return {
        ...p,
        x,
        y,
        y1RM,
      };
    });
  }, [exerciseDataPoints, minVal, maxVal]);

  // Generate SVG path strings
  const linePath = useMemo(() => {
    if (pointsCoordinates.length === 0) return '';
    return pointsCoordinates.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [pointsCoordinates]);

  const line1RMPath = useMemo(() => {
    if (pointsCoordinates.length === 0) return '';
    return pointsCoordinates.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y1RM}` : `${acc} L ${pt.x} ${pt.y1RM}`;
    }, '');
  }, [pointsCoordinates]);

  const areaPath = useMemo(() => {
    if (pointsCoordinates.length === 0) return '';
    const first = pointsCoordinates[0];
    const last = pointsCoordinates[pointsCoordinates.length - 1];
    const bottom = chartHeight - paddingY;
    return `${linePath} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
  }, [pointsCoordinates, linePath]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28 text-slate-100">
      {/* Header & Exercise Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Progreso y Rendimiento</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Historial de Progresos
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualiza tus ganancias de fuerza, sobrecarga progresiva y récords en el gimnasio.
            </p>
          </div>

          {/* Time range tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
            {(['1m', '3m', '6m', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  selectedTimeRange === r
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === '1m' ? '1 Mes' : r === '3m' ? '3 Meses' : r === '6m' ? '6 Meses' : 'Todo'}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Selector Dropdown */}
        <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <span>Seleccionar ejercicio a analizar:</span>
          </label>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500 min-w-[260px]"
          >
            {exercisesCatalog.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({MUSCLE_GROUP_LABELS[ex.muscleGroup]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards for the selected exercise */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Récord Peso</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {currentPR ? currentPR.maxWeight : 0}{' '}
            <span className="text-xs font-normal text-slate-400">{unit}</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            {currentPR ? `× ${currentPR.maxRepsAtMaxWeight} reps` : 'Sin registros'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Mejor 1RM</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {currentPR ? currentPR.estimated1RM : 0}{' '}
            <span className="text-xs font-normal text-slate-400">{unit}</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Estimado Epley
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Sesiones</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {exerciseDataPoints.length}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Entrenamientos
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Volumen Total</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {exerciseDataPoints.reduce((acc, p) => acc + p.totalVolume, 0).toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">{unit}</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Acumulado
          </span>
        </div>
      </div>

      {/* Main SVG Progression Line Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              Evolución de Carga en {selectedExercise.name}
            </h3>
            <p className="text-xs text-slate-400">
              Verde: Peso Máximo levantado | Línea discontinua: 1RM Estimado
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-3 h-1 bg-emerald-400 rounded-full inline-block" /> Peso Máximo
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 font-medium hidden sm:inline-flex">
              <span className="w-3 h-0.5 border-t border-dashed border-slate-400 inline-block" /> 1RM
            </span>
          </div>
        </div>

        {pointsCoordinates.length > 0 ? (
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10b981" stop-opacity="0.3" />
                  <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const yPos = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
                const val = Math.round(minVal + ratio * (maxVal - minVal));
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={yPos}
                      x2={chartWidth - paddingX}
                      y2={yPos}
                      stroke="#334155"
                      strokeDasharray="3 3"
                      strokeOpacity="0.4"
                    />
                    <text
                      x={paddingX - 6}
                      y={yPos + 4}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={areaPath} fill="url(#chartGradient)" />

              {/* 1RM Line (dashed) */}
              <path
                d={line1RMPath}
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Main Weight Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Points */}
              {pointsCoordinates.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.date === pt.date ? 7 : 5}
                    fill="#10b981"
                    stroke="#020617"
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all duration-150 hover:scale-125"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        date: pt.date,
                        weight: pt.maxWeight,
                        reps: pt.repsAtMaxWeight,
                        oneRM: pt.best1RM,
                        volume: pt.totalVolume,
                        x: pt.x,
                        y: pt.y,
                      })
                    }
                    onClick={() =>
                      setHoveredPoint({
                        date: pt.date,
                        weight: pt.maxWeight,
                        reps: pt.repsAtMaxWeight,
                        oneRM: pt.best1RM,
                        volume: pt.totalVolume,
                        x: pt.x,
                        y: pt.y,
                      })
                    }
                  />
                  {/* Date labels along bottom */}
                  <text
                    x={pt.x}
                    y={chartHeight - 8}
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {pt.date.slice(5)}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute z-20 pointer-events-none bg-slate-950/95 border border-emerald-500/40 rounded-xl p-3 shadow-2xl text-xs space-y-1 transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                  top: `${Math.max(10, (hoveredPoint.y / chartHeight) * 100 - 15)}%`,
                }}
              >
                <div className="font-semibold text-white border-b border-slate-800 pb-1">
                  Fecha: {hoveredPoint.date}
                </div>
                <div className="text-emerald-400 font-mono font-bold">
                  Peso Máximo: {hoveredPoint.weight} {unit} × {hoveredPoint.reps} reps
                </div>
                <div className="text-slate-300 font-mono text-[11px]">
                  1RM Estimado: {hoveredPoint.oneRM} {unit}
                </div>
                <div className="text-slate-400 text-[10px]">
                  Volumen sesión: {hoveredPoint.volume.toLocaleString()} {unit}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aún no hay series registradas para este ejercicio.</p>
            <p className="text-xs text-slate-600 mt-1">
              Completa un entrenamiento incluyendo {selectedExercise.name} para trazar la curva.
            </p>
          </div>
        )}
      </div>

      {/* Bar Chart: Volume Progression per Session */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <h3 className="text-lg font-bold font-display text-white mb-1">
          Volumen Total Levantado por Sesión ({unit})
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          La sobrecarga progresiva se refleja en el tonelaje total movido por cada día de entrenamiento.
        </p>

        {exerciseDataPoints.length > 0 ? (
          <div className="space-y-2.5">
            {exerciseDataPoints.map((pt, idx) => {
              const maxVol = Math.max(...exerciseDataPoints.map((p) => p.totalVolume), 1);
              const percent = Math.min(100, Math.round((pt.totalVolume / maxVol) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{pt.date}</span>
                    <span className="text-emerald-400 font-bold">
                      {pt.totalVolume.toLocaleString()} {unit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800/80">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">Sin datos de volumen disponibles.</p>
        )}
      </div>

      {/* Muscle Group Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <h3 className="text-lg font-bold font-display text-white mb-1">
          Frecuencia y Series por Grupo Muscular
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Distribución de todas tus series completadas para equilibrar el entrenamiento.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {muscleDistribution.map(([muscle, sets]) => {
            const maxSets = Math.max(...muscleDistribution.map((m) => m[1]), 1);
            const pct = Math.round((sets / maxSets) * 100);
            return (
              <div key={muscle} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-white capitalize">
                    {MUSCLE_GROUP_LABELS[muscle] || muscle}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{sets} series</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
