import React from 'react';
import {
  Dumbbell,
  ClipboardList,
  Calendar,
  TrendingUp,
  Settings,
  Smartphone,
  Plus
} from 'lucide-react';
import { ActiveTab } from '../types/workout';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenPWAInstall: () => void;
  isPWAInstalled: boolean;
  hasActiveSession: boolean;
}

export const Navigation: React.FC<Props> = ({
  activeTab,
  onTabChange,
  onOpenPWAInstall,
  isPWAInstalled,
  hasActiveSession,
}) => {
  return (
    <>
      {/* Desktop / Tablet Top Navigation Bar */}
      <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <div
            onClick={() => onTabChange('hoy')}
            className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold font-display tracking-wider text-white">
              IRON<span className="text-emerald-400">LOG</span>
            </span>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
            <button
              onClick={() => onTabChange('hoy')}
              className={`hover:text-white transition whitespace-nowrap shrink-0 relative py-1 ${
                activeTab === 'hoy' ? 'text-white font-semibold' : ''
              }`}
            >
              Entrenar
              {hasActiveSession && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-1.5 align-middle animate-pulse" />
              )}
              {activeTab === 'hoy' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => onTabChange('rutinas')}
              className={`hover:text-white transition whitespace-nowrap shrink-0 relative py-1 ${
                activeTab === 'rutinas' ? 'text-white font-semibold' : ''
              }`}
            >
              Mis Rutinas
              {activeTab === 'rutinas' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => onTabChange('historial')}
              className={`hover:text-white transition whitespace-nowrap shrink-0 relative py-1 ${
                activeTab === 'historial' ? 'text-white font-semibold' : ''
              }`}
            >
              Historial
              {activeTab === 'historial' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => onTabChange('graficas')}
              className={`hover:text-white transition whitespace-nowrap shrink-0 relative py-1 ${
                activeTab === 'graficas' ? 'text-white font-semibold' : ''
              }`}
            >
              Progreso y Gráficas
              {activeTab === 'graficas' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => onTabChange('herramientas')}
              className={`hover:text-white transition whitespace-nowrap shrink-0 relative py-1 ${
                activeTab === 'herramientas' ? 'text-white font-semibold' : ''
              }`}
            >
              Herramientas
              {activeTab === 'herramientas' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenPWAInstall}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
              title="Instalar IronLog en tu celular"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">
                {isPWAInstalled ? 'App Instalada' : 'Instalar en Celular'}
              </span>
              <span className="sm:hidden">Instalar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Fixed Tab Bar (Natural Thumb Zone) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5">
        <div className="grid grid-cols-5 items-center max-w-md mx-auto">
          {/* Tab 1: Entrenar */}
          <button
            onClick={() => onTabChange('hoy')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors relative ${
              activeTab === 'hoy' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Dumbbell className="w-5 h-5" />
              {hasActiveSession && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-1 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Entrenar</span>
          </button>

          {/* Tab 2: Rutinas */}
          <button
            onClick={() => onTabChange('rutinas')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              activeTab === 'rutinas' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Rutinas</span>
          </button>

          {/* Tab 3: Calendario */}
          <button
            onClick={() => onTabChange('historial')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              activeTab === 'historial' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Historial</span>
          </button>

          {/* Tab 4: Gráficas */}
          <button
            onClick={() => onTabChange('graficas')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              activeTab === 'graficas' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Progreso</span>
          </button>

          {/* Tab 5: Herramientas */}
          <button
            onClick={() => onTabChange('herramientas')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              activeTab === 'herramientas' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight">Ajustes</span>
          </button>
        </div>
      </div>
    </>
  );
};
