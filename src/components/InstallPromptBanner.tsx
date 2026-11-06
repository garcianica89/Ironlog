import React, { useState } from 'react';
import { Smartphone, Download, X, QrCode } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  onOpenModal: () => void;
}

export const InstallPromptBanner: React.FC<Props> = ({ onOpenModal }) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  // If already running standalone or user dismissed in this session
  if (isInstalled || dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-slate-950 px-3 sm:px-6 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-slate-950/15 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-slate-950" />
          </div>
          <div className="text-xs truncate">
            <span className="font-bold">¿Quieres usar IronLog en tu celular?</span>{' '}
            <span className="hidden sm:inline opacity-90">
              Descárgala e instálala en tu pantalla de inicio para usarla offline en el gym.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenModal}
            className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-slate-950 text-white hover:bg-slate-900 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Descargar / Instalar</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-950/10 text-slate-950 transition"
            aria-label="Cerrar banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
