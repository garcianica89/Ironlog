import React, { useState } from 'react';
import {
  Settings,
  Calculator,
  Download,
  Upload,
  Smartphone,
  Volume2,
  VolumeX,
  RotateCcw,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AppSettings, exportDataAsJSON, importDataFromJSON } from '../services/storage';
import { calculate1RM } from '../services/storage';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onOpenPlateCalculator: () => void;
  onOpenPWAInstall: () => void;
  onResetData: () => void;
  isPWAInstalled: boolean;
}

export const ToolsSettings: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onOpenPlateCalculator,
  onOpenPWAInstall,
  onResetData,
  isPWAInstalled,
}) => {
  const [weightInput, setWeightInput] = useState<number>(80);
  const [repsInput, setRepsInput] = useState<number>(5);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const calculated1RM = calculate1RM(weightInput, repsInput);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataFromJSON(content);
      if (res.success) {
        setImportStatus(res.message);
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus(res.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>Herramientas y Ajustes</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
          Configuración y Utilidades
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Calculadora de 1RM, discos de barra, instalación móvil y copias de seguridad.
        </p>
      </div>

      {/* Mobile PWA and APK Card */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                App Móvil & APK Android
              </span>
            </div>
            <h3 className="text-lg font-bold font-display text-white">
              {isPWAInstalled ? 'App Instalada en tu Celular' : 'Tener IronLog en tu Celular (WebAPK o .APK)'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Instálala directamente con Google Chrome o genera el archivo instalador <strong>.apk</strong> para tu celular Android.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenPWAInstall}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shrink-0 shadow-lg shadow-emerald-500/20"
        >
          <Smartphone className="w-4 h-4" />
          <span>Ver Opciones de Instalación / APK</span>
        </button>
      </div>

      {/* Tools Grid: 1RM Calculator & Plate Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1RM Calculator */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Scale className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold font-display text-white">Calculadora de 1RM</h3>
              <p className="text-[11px] text-slate-400">Fórmula de Epley para estimar tu repetición máxima</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 font-medium mb-1">
                Peso levantado ({settings.unit})
              </label>
              <input
                type="number"
                value={weightInput || ''}
                onChange={(e) => setWeightInput(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 font-medium mb-1">
                Repeticiones hechas
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={repsInput || ''}
                onChange={(e) => setRepsInput(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">1RM Estimado:</span>
              <span className="text-2xl font-mono font-bold text-emerald-400">
                {calculated1RM} <span className="text-xs text-slate-400">{settings.unit}</span>
              </span>
            </div>
            <div className="text-right text-[11px] text-slate-400 font-mono space-y-0.5">
              <div>90%: {Math.round(calculated1RM * 0.9)} {settings.unit}</div>
              <div>80%: {Math.round(calculated1RM * 0.8)} {settings.unit}</div>
              <div>70%: {Math.round(calculated1RM * 0.7)} {settings.unit}</div>
            </div>
          </div>
        </div>

        {/* Plate Calculator Trigger */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3 mb-3">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold font-display text-white">Calculadora de Discos</h3>
                <p className="text-[11px] text-slate-400">Calcula la combinación exacta de discos en cada lado</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Ideal para barras olímpicas de 20 kg o barras cortas: introduce el peso que deseas mover y la app te indica qué discos (25kg, 20kg, 15kg, 10kg, 5kg, 2.5kg, 1.25kg) cargar por extremo.
            </p>
          </div>

          <button
            onClick={onOpenPlateCalculator}
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <Calculator className="w-4 h-4" />
            <span>Abrir Calculadora de Discos</span>
          </button>
        </div>
      </div>

      {/* App Preferences */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold font-display text-white border-b border-slate-800 pb-2">
          Preferencias de Entrenamiento
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Unit Toggle */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-sm text-white block">Unidad de Peso</span>
              <span className="text-xs text-slate-400">Kilogramos (kg) o Libras (lb)</span>
            </div>
            <div className="flex gap-1 p-1 bg-slate-900 rounded-xl border border-slate-700">
              <button
                onClick={() => onUpdateSettings({ ...settings, unit: 'kg' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  settings.unit === 'kg'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                KG
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, unit: 'lb' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  settings.unit === 'lb'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                LB
              </button>
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-sm text-white block">Sonidos de Alarma</span>
              <span className="text-xs text-slate-400">Pitidos de fin de descanso y PRs</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition ${
                settings.soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold font-display text-white border-b border-slate-800 pb-2">
          Copia de Seguridad y Datos
        </h3>

        <p className="text-xs text-slate-400">
          Tus rutinas, pesos y repeticiones se guardan en la memoria local de tu celular. Descarga una copia de seguridad para respaldar o transferir tus datos a otro dispositivo en cualquier momento.
        </p>

        {importStatus && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportDataAsJSON}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-2 border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar Copia (JSON)</span>
          </button>

          <label className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-2 border border-slate-700 transition cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Restaurar Copia (JSON)</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('¿Restablecer datos de ejemplo iniciales?')) {
                onResetData();
              }
            }}
            className="min-h-[44px] px-4 py-2.5 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 font-medium text-xs flex items-center gap-2 transition ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer Ejemplo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
