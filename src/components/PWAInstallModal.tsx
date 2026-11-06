import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  Smartphone,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  Copy,
  ExternalLink,
  QrCode,
  Sparkles,
  Package,
  Layers,
  HelpCircle,
  FileDown,
  Info,
  MoreVertical
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [installStatus, setInstallStatus] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'apk'>('direct');

  if (!isOpen) return null;

  // The active running development URL
  const devUrl = 'https://ais-dev-t4jlbjnqk3gyj5mndyudaz-345402705194.us-west1.run.app';
  // Shared URL
  const sharedUrl = 'https://ais-pre-t4jlbjnqk3gyj5mndyudaz-345402705194.us-west1.run.app';

  // Active URL to scan or open
  const currentUrl = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
    ? window.location.origin
    : devUrl;

  const handleInstallClick = async () => {
    const res = await install();
    if (res === 'accepted') {
      setInstallStatus('¡Instalando con éxito! Revisa tu pantalla de inicio.');
      setTimeout(() => onClose(), 2500);
    } else if (res === 'manual_needed') {
      setShowManualGuide(true);
    }
  };

  const handleCopyLink = (urlToCopy: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(urlToCopy);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-slate-100 shadow-2xl my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                App Móvil Oficial
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold font-display tracking-wide text-white">
              Instalar IronLog en tu Celular
            </h3>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-5">
          <button
            onClick={() => setActiveTab('direct')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'direct'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Instalación Directa (Celular)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'apk'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Descargar Archivo APK</span>
          </button>
        </div>

        {/* TAB 1: Direct Install */}
        {activeTab === 'direct' && (
          <div className="space-y-4">
            {/* Installed state */}
            {isInstalled && (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-300">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
                <div className="text-xs">
                  <span className="font-semibold block text-sm text-white">¡App instalada correctamente!</span>
                  IronLog ya se encuentra añadida a tu pantalla de inicio en modo nativo.
                </div>
              </div>
            )}

            {/* Install Button (Always visible) */}
            {!isInstalled && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Instalar en este Dispositivo
                  </span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs text-slate-200">
                  Presiona el botón para añadir IronLog a tu pantalla de inicio como app nativa:
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition"
                >
                  <Download className="w-5 h-5 stroke-[2.5]" />
                  Instalar App Ahora
                </button>

                {installStatus && (
                  <p className="text-xs text-center text-emerald-400 font-semibold">{installStatus}</p>
                )}

                {/* Manual guide reveal if programmatic prompt not supported */}
                {showManualGuide && (
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <MoreVertical className="w-4 h-4" />
                      <span>Pasos en Google Chrome (Android):</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-xs pl-1">
                      <li>Toca los <strong>tres puntos (⋮)</strong> en la esquina superior derecha de Chrome.</li>
                      <li>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla principal"</strong>.</li>
                      <li>Toca <strong>"Instalar"</strong> para confirmar.</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* QR Code & Link to Open on Mobile */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="bg-white p-2.5 rounded-2xl shadow-lg shrink-0">
                  <QRCodeSVG value={currentUrl} size={118} level="M" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    <QrCode className="w-4 h-4" />
                    <span>Abrir en tu Celular</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Escanea este código con la cámara de tu celular
                  </h4>
                  <p className="text-xs text-slate-400">
                    O abre este enlace directo desde tu navegador Chrome en el teléfono:
                  </p>
                </div>
              </div>

              {/* URL Box with Copy Button */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 select-all focus:outline-none"
                />
                <button
                  onClick={() => handleCopyLink(currentUrl)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 shrink-0 border border-slate-700 transition"
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Enlace</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Explanation of Auth / Share button */}
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Info className="w-4 h-4" />
                <span>¿Por qué no cargaba el enlace anterior?</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                El enlace compartido público (<code>ais-pre-...</code>) se activa cuando presionas el botón <strong>"Share" (Compartir)</strong> en la barra superior de Google AI Studio. Mientras tanto, tu enlace activo de desarrollo es <strong>{devUrl}</strong> (iniciando sesión con tu cuenta de Google <code>garcianica89@gmail.com</code>).
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: APK Download */}
        {activeTab === 'apk' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Package className="w-5 h-5" />
                <span>Generar Archivo .APK con PWABuilder</span>
              </div>

              {/* Manifest status badge */}
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>El archivo <strong>manifest.json</strong> ya está creado y configurado al 100% en la app.</span>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200/90 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-400">
                  <Info className="w-4 h-4" /> ¿Por qué PWABuilder dice "Create a web app manifest"?
                </span>
                <p className="text-[11px] leading-relaxed">
                  Porque tu enlace actual (<code>ais-dev-...</code>) es privado y está protegido con tu cuenta de Google (<code>garcianica89@gmail.com</code>). Cuando el robot de PWABuilder intenta entrar, se topa con la pantalla de inicio de sesión de Google y no puede leer el manifest.
                </p>
                <p className="text-[11px] pt-1 font-medium text-amber-300">
                  👉 <strong>Solución para PWABuilder:</strong> Haz clic en el botón <strong>"Share" (Compartir)</strong> en la esquina superior de Google AI Studio para publicar la versión pública (<code>ais-pre-...</code>), y luego pega ese enlace público en PWABuilder.
                </p>
              </div>

              <a
                href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(sharedUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
              >
                <FileDown className="w-5 h-5" />
                <span>Abrir PWABuilder con Enlace Público</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
              </a>
            </div>

            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-slate-200 space-y-1">
              <span className="font-bold text-emerald-400 block text-xs">
                💡 Consejo: No necesitas ningún APK para tenerla en tu celular
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Si abres este enlace en Google Chrome desde tu celular (con tu cuenta de Google iniciada), Chrome te instalará la app directamente en tu pantalla de inicio en 1 segundo como app oficial, con icono, pantalla de carga y soporte sin conexión a internet.
              </p>
            </div>
          </div>
        )}

        {/* Benefits reminder */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>✓ 100% Offline para el Gym</span>
          <span>✓ Sin anuncios</span>
          <span>✓ Ligera y Rápida</span>
        </div>
      </div>
    </div>
  );
};
