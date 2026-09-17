import React, { useState } from 'react';
import { Smartphone, Download, Check, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        id="btn-pwa-install"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ${
          isInstalled
            ? 'bg-emerald-100/90 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
            : isInstallable
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/20 active:scale-95'
            : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
        }`}
        title={
          isInstalled
            ? 'Aplicativo instalado no celular. Clique para ver instruções do PWA.'
            : 'Instalar portal no celular para uso rápido e offline.'
        }
      >
        {isInstalled ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">PWA Ativo</span>
            <span className="sm:hidden">Instalado</span>
          </>
        ) : isInstallable ? (
          <>
            <Download className="w-3.5 h-3.5" />
            <span>Instalar App</span>
            <span className="hidden md:inline text-[10px] px-1 py-0.2 bg-emerald-700/60 rounded">
              PWA
            </span>
          </>
        ) : (
          <>
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instalar no Celular</span>
          </>
        )}
      </button>

      <PWAInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        isInstallable={isInstallable}
        onNativeInstall={install}
        isIOS={isIOS}
        isAndroid={isAndroid}
      />
    </>
  );
};
