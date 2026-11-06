import React, { useState } from 'react';
import { Calculator, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  unit: 'kg' | 'lb';
}

const AVAILABLE_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATE_COLORS_KG: Record<number, string> = {
  25: 'bg-red-600 border-red-500 text-white',
  20: 'bg-blue-600 border-blue-500 text-white',
  15: 'bg-yellow-500 border-yellow-400 text-slate-950 font-bold',
  10: 'bg-emerald-600 border-emerald-500 text-white',
  5: 'bg-white border-slate-300 text-slate-900 font-bold',
  2.5: 'bg-slate-700 border-slate-600 text-white',
  1.25: 'bg-slate-800 border-slate-600 text-slate-300',
};

export const PlateCalculatorModal: React.FC<Props> = ({ isOpen, onClose, unit }) => {
  const [targetWeight, setTargetWeight] = useState<number>(80);
  const [barWeight, setBarWeight] = useState<number>(20);

  if (!isOpen) return null;

  // Calculate plates per side
  const weightPerSide = Math.max(0, (targetWeight - barWeight) / 2);
  let remainder = weightPerSide;
  const platesNeeded: { weight: number; count: number }[] = [];

  for (const plate of AVAILABLE_PLATES_KG) {
    if (remainder >= plate) {
      const count = Math.floor(remainder / plate);
      platesNeeded.push({ weight: plate, count });
      remainder = Math.round((remainder - count * plate) * 100) / 100;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">Calculadora de Discos</h3>
            <p className="text-xs text-slate-400">¿Qué discos poner en cada lado de la barra?</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <label className="block text-[11px] text-slate-400 font-medium mb-1">
              Peso Objetivo ({unit})
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={targetWeight || ''}
              onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <label className="block text-[11px] text-slate-400 font-medium mb-1">
              Peso Barra ({unit})
            </label>
            <select
              value={barWeight}
              onChange={(e) => setBarWeight(parseFloat(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="20">20 {unit} (Olímpica)</option>
              <option value="15">15 {unit} (Olímpica técnica)</option>
              <option value="10">10 {unit} (Barra Z / corta)</option>
              <option value="0">0 {unit} (Máquina Smith)</option>
            </select>
          </div>
        </div>

        {/* Result Breakdown */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-2 border-b border-slate-800">
            <span>Carga por cada lado:</span>
            <span className="font-mono text-emerald-400 font-bold text-sm">
              {weightPerSide} {unit}
            </span>
          </div>

          {platesNeeded.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Discos por lado:
              </span>
              <div className="flex flex-wrap gap-2 items-center">
                {platesNeeded.map((p, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 shadow-sm ${
                      PLATE_COLORS_KG[p.weight] || 'bg-slate-800 text-white border-slate-700'
                    }`}
                  >
                    <span>{p.count}x</span>
                    <span>{p.weight} {unit}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">
              Solo necesitas la barra vacía ({barWeight} {unit}).
            </p>
          )}

          {remainder > 0 && (
            <p className="text-[11px] text-amber-400 mt-3">
              * Faltan {remainder * 2} {unit} en total no alcanzados con discos estándar.
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
