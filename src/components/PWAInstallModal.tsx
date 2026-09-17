import React from 'react';
import {
  X,
  Smartphone,
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  WifiOff,
  BatteryCharging,
  HardDrive
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  onNativeInstall: () => void;
  isIOS: boolean;
  isAndroid: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  onNativeInstall,
  isIOS,
  isAndroid,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden border border-stone-200 shadow-2xl animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-linear-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white relative">
          <button
            id="close-pwa-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shrink-0">
              <img src="/icon.svg" alt="Padrinhos de Rua" className="w-8 h-8" />
            </div>
            <div>
              <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Progressive Web App (PWA)
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Instalar Padrinhos de Rua
              </h3>
            </div>
          </div>
          <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
            Instale o app diretamente no seu celular para acessar mais rápido, usar em tela cheia e continuar monitorando casinhas mesmo com internet instável.
          </p>
        </div>

        {/* Body Instructions */}
        <div className="p-5 space-y-4 text-xs text-stone-700">
          
          {/* Quick Native Install Button if supported by browser */}
          {isInstallable && (
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instalação Direta Disponível!</span>
              </div>
              <p className="text-emerald-800 text-xs">
                Seu navegador suporta instalação instantânea com um único toque.
              </p>
              <button
                id="modal-direct-install-btn"
                onClick={() => {
                  onNativeInstall();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Agora no Celular</span>
              </button>
            </div>
          )}

          {/* iOS Safari Instructions */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <Smartphone className="w-4 h-4 text-stone-700" />
              <span>Como instalar no iPhone / iPad (Safari):</span>
              {isIOS && (
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  Seu aparelho
                </span>
              )}
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-stone-600 pl-1">
              <li className="leading-snug">
                Abra esta página no navegador <strong>Safari</strong> do iOS.
              </li>
              <li className="leading-snug flex items-center gap-1.5 flex-wrap">
                <span>Toque no botão de <strong>Compartilhar</strong></span>
                <span className="inline-flex items-center px-1.5 py-0.5 bg-white border border-stone-300 rounded text-[11px] font-semibold text-blue-600">
                  <Share className="w-3 h-3 mr-1 inline" /> Compartilhar
                </span>
              </li>
              <li className="leading-snug flex items-center gap-1.5 flex-wrap">
                <span>Role para baixo e selecione</span>
                <span className="inline-flex items-center px-1.5 py-0.5 bg-white border border-stone-300 rounded text-[11px] font-semibold text-stone-800">
                  <PlusSquare className="w-3 h-3 mr-1 inline text-stone-700" /> Adicionar à Tela de Início
                </span>
              </li>
              <li className="leading-snug">
                Confirme tocando em <strong>Adicionar</strong> no canto superior direito.
              </li>
            </ol>
          </div>

          {/* Android Chrome Instructions */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>Como instalar no Android (Google Chrome):</span>
              {isAndroid && !isInstallable && (
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  Seu aparelho
                </span>
              )}
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-stone-600 pl-1">
              <li className="leading-snug">
                Toque no menu de três pontos <strong>(⋮)</strong> no canto superior do Chrome.
              </li>
              <li className="leading-snug">
                Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
              </li>
              <li className="leading-snug">
                O ícone do <strong>Padrinhos de Rua</strong> aparecerá na tela de aplicativos do seu celular.
              </li>
            </ol>
          </div>

          {/* Benefits Grid */}
          <div className="pt-1">
            <span className="font-bold text-stone-800 block mb-2 text-[11px] uppercase tracking-wider">
              Vantagens para o voluntário em campo:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-2">
                <WifiOff className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-950 block">Modo Offline</span>
                  <span className="text-stone-500 text-[10px]">Acesso cached mesmo sem sinal</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-2">
                <HardDrive className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-950 block">Carregamento Rápido</span>
                  <span className="text-stone-500 text-[10px]">Abre instantaneamente</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end">
          <button
            id="close-pwa-instructions-btn"
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
