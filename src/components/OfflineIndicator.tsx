import React from 'react';
import { WifiOff, CloudOff, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-banner"
      role="status"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-amber-900/95 text-amber-50 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-amber-500/40 animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/30 flex items-center justify-center shrink-0 text-amber-300">
          <WifiOff className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-200 uppercase tracking-wide">
              Modo Offline Ativo
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <p className="text-amber-100/90 mt-0.5 leading-relaxed">
            Conexão instável ou ausente. O PWA está operando com dados em cache local para garantir o uso contínuo em campo pelos voluntários.
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Validações GPS e câmera continuam funcionando offline</span>
          </div>
        </div>
      </div>
    </div>
  );
};
