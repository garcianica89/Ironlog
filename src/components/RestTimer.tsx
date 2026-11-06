import React, { useEffect, useState } from 'react';
import { Timer, Play, Pause, RotateCcw, X, Plus, Volume2, VolumeX } from 'lucide-react';
import { playTimerFinishBeep } from '../services/audio';

interface Props {
  initialSeconds?: number;
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const RestTimer: React.FC<Props> = ({
  initialSeconds = 90,
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Sync if initialSeconds changes when user starts a new timer
  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setRemainingSeconds(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (soundEnabled) {
              playTimerFinishBeep();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (remainingSeconds === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, remainingSeconds, soundEnabled]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const addTime = (secs: number) => {
    setRemainingSeconds((prev) => prev + secs);
    setTotalSeconds((prev) => Math.max(prev, remainingSeconds + secs));
    setIsActive(true);
  };

  const resetTimer = () => {
    setRemainingSeconds(totalSeconds);
    setIsActive(true);
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  // Minimized Floating Pill on mobile bottom
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-40 animate-in slide-in-from-bottom-2">
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl border font-mono font-bold text-sm tracking-wide transition-all ${
            remainingSeconds === 0
              ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
              : 'bg-slate-900/95 text-emerald-400 border-slate-700/80 backdrop-blur-md'
          }`}
        >
          <Timer className="w-4 h-4 animate-spin [animation-duration:4s]" />
          <span>{formatTime(remainingSeconds)}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-40">
      <div className="bg-slate-900/95 border border-slate-800 backdrop-blur-md rounded-2xl p-4 shadow-2xl text-slate-100 animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Descanso
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleSound}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title={soundEnabled ? 'Silenciar alarma' : 'Activar sonido'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-xs px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
              title="Minimizar"
            >
              Minimizar
            </button>
            <button
              onClick={onClose}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Time Display */}
        <div className="flex items-center justify-between my-2">
          <div className="flex flex-col">
            <span className={`text-4xl font-mono font-bold tracking-tight ${remainingSeconds === 0 ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
              {formatTime(remainingSeconds)}
            </span>
            <span className="text-[11px] text-slate-400">
              {remainingSeconds === 0 ? '¡Tiempo cumplido! Dale a la siguiente' : 'Tiempo restante'}
            </span>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              <button
                onClick={() => addTime(30)}
                className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> 30s
              </button>
              <button
                onClick={() => addTime(60)}
                className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> 1m
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-3">
          <div
            className={`h-full transition-all duration-300 ${
              remainingSeconds === 0 ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex-1 min-h-[40px] px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            {isActive ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Reanudar
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="min-h-[40px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
};
