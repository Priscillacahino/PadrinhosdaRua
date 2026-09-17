import React from 'react';
import {
  PawPrint,
  Clock,
  Navigation,
  RefreshCw,
  FastForward,
  Code2,
  SlidersHorizontal,
  Plus,
  Hammer
} from 'lucide-react';
import { formatDateTime } from '../utils/geo';
import { GPSCoords } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentSimulatedTime: Date;
  onAdvanceHours: (hours: number) => void;
  onResetTime: () => void;
  onRunTTLScan: () => void;
  ttlChangesCount: number;
  userCoords: GPSCoords;
  onToggleGpsMode: (mode: 'real' | 'simulated') => void;
  gpsMode: 'real' | 'simulated';
  activeTab: 'painel' | 'oficina' | 'api';
  setActiveTab: (tab: 'painel' | 'oficina' | 'api') => void;
  onOpenNewPointModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSimulatedTime,
  onAdvanceHours,
  onResetTime,
  onRunTTLScan,
  ttlChangesCount,
  userCoords,
  onToggleGpsMode,
  gpsMode,
  activeTab,
  setActiveTab,
  onOpenNewPointModal,
}) => {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner / Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <PawPrint className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                  Padrinhos de Rua
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Motor de Lógica & BD
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  📍 João Pessoa - PB
                </span>
              </div>
              <p className="text-xs text-stone-700">
                Região de atuação: João Pessoa - PB (Centro: -7.1153, -34.8611) • Semáforo de status e anti-fraude GPS
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
            <div className="bg-stone-100 p-1 rounded-xl flex items-center border border-stone-200">
              <button
                id="tab-painel-btn"
                onClick={() => setActiveTab('painel')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'painel'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Pontos de Água & Comida
              </button>
              <button
                id="tab-oficina-btn"
                onClick={() => setActiveTab('oficina')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'oficina'
                    ? 'bg-white text-emerald-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Hammer className="w-3.5 h-3.5 text-emerald-600" />
                <span>Oficina de Casinhas (JP)</span>
              </button>
              <button
                id="tab-api-btn"
                onClick={() => setActiveTab('api')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'api'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Console API
              </button>
            </div>

            <PWAInstallButton />

            <button
              id="new-point-header-btn"
              onClick={onOpenNewPointModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Ponto
            </button>
          </div>
        </div>

        {/* Real-time System Engine Control Bar */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Relógio do Sistema & TTL Simulator */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg text-stone-700 font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">{formatDateTime(currentSimulatedTime)}</span>
            </div>

            {/* Simuladores de Avanço de Tempo para testar TTL 48h */}
            <div className="flex items-center gap-1">
              <span className="text-stone-700 hidden sm:inline">Simular TTL:</span>
              <button
                id="time-forward-12h"
                onClick={() => onAdvanceHours(12)}
                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 rounded-md font-mono text-[11px] transition-colors"
                title="Avançar 12 horas no relógio"
              >
                +12h
              </button>
              <button
                id="time-forward-24h"
                onClick={() => onAdvanceHours(24)}
                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 rounded-md font-mono text-[11px] transition-colors"
                title="Avançar 24 horas no relógio"
              >
                +24h
              </button>
              <button
                id="time-forward-48h"
                onClick={() => onAdvanceHours(49)}
                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-md font-semibold text-[11px] transition-colors flex items-center gap-1"
                title="Avançar 49 horas (forçar TTL >48h)"
              >
                <FastForward className="w-3 h-3" />
                +49h (Forçar TTL)
              </button>
              <button
                id="time-reset"
                onClick={onResetTime}
                className="px-2 py-1 text-stone-700 hover:text-stone-800 transition-colors"
                title="Resetar para hora atual do sistema"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Gatilho Manual de Varredura TTL & GPS Status */}
          <div className="flex items-center gap-2">
            <button
              id="run-ttl-scan-btn"
              onClick={onRunTTLScan}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-3 h-3 text-emerald-600" />
              <span>Verificar TTL (48h)</span>
              {ttlChangesCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {ttlChangesCount}
                </span>
              )}
            </button>

            {/* GPS Status Indicator */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-stone-700">GPS:</span>
              <button
                id="gps-mode-toggle"
                onClick={() => onToggleGpsMode(gpsMode === 'real' ? 'simulated' : 'real')}
                className="font-medium text-blue-700 hover:underline cursor-pointer"
                title="Clique para alternar entre GPS Real do dispositivo ou Simulador"
              >
                {gpsMode === 'real' ? 'Dispositivo Real' : 'Simulador'}
              </button>
              <span className="font-mono text-stone-700 text-[11px] hidden lg:inline">
                [{userCoords.latitude.toFixed(4)}, {userCoords.longitude.toFixed(4)}]
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
