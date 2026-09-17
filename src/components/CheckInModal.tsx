import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Navigation,
  Utensils,
  Sparkles,
  Search,
  Code2,
  ArrowRight
} from 'lucide-react';
import { PontoCasinha, GPSCoords, ApiResponse } from '../types';
import { calculateDistanceMeters, formatDistance, formatDateTime } from '../utils/geo';
import { processCheckIn, RAIO_MAXIMO_CHECKIN_METROS } from '../utils/engine';

interface CheckInModalProps {
  ponto: PontoCasinha | null;
  userCoords: GPSCoords;
  onClose: () => void;
  onSuccess: (updatedPonto: PontoCasinha, apiResponse: ApiResponse<PontoCasinha>) => void;
  onSetUserCoords: (coords: GPSCoords) => void;
  currentSimulatedTime: Date;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  ponto,
  userCoords,
  onClose,
  onSuccess,
  onSetUserCoords,
  currentSimulatedTime,
}) => {
  if (!ponto) return null;

  const [tipoAcao, setTipoAcao] = useState<'abastecimento' | 'limpeza' | 'vistoria_geral'>('abastecimento');
  const [observacao, setObservacao] = useState('');
  const [lastResponse, setLastResponse] = useState<ApiResponse<PontoCasinha> | null>(null);

  const distanceMeters = calculateDistanceMeters(
    userCoords.latitude,
    userCoords.longitude,
    ponto.latitude,
    ponto.longitude
  );

  const isWithinRadius = distanceMeters <= RAIO_MAXIMO_CHECKIN_METROS;

  const handleSimulatePosition = (targetDistance: number) => {
    // Calcula um deslocamento em latitude para bater aproximadamente a distância desejada
    // 1 grau ~ 111.320 metros -> 1 metro ~ 0.00000898 graus
    const offsetDegrees = (targetDistance / 111320);
    onSetUserCoords({
      latitude: ponto.latitude + offsetDegrees,
      longitude: ponto.longitude,
      accuracy: 5,
    });
    setLastResponse(null);
  };

  const handleExecuteCheckIn = () => {
    const result = processCheckIn(
      ponto,
      {
        ponto_id: ponto.id,
        tipo_acao: tipoAcao,
        user_latitude: userCoords.latitude,
        user_longitude: userCoords.longitude,
        observacao,
      },
      currentSimulatedTime
    );

    setLastResponse(result.response);

    if (result.success && result.updatedCasinha) {
      setTimeout(() => {
        onSuccess(result.updatedCasinha!, result.response);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isWithinRadius ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Check-in de Presença</h3>
              <p className="text-xs text-stone-500 font-mono">Ponto #{ponto.id}: {ponto.nome_ponto}</p>
            </div>
          </div>
          <button
            id="close-checkin-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Anti-Fraude GPS Diagnostic Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isWithinRadius
              ? 'bg-emerald-50/70 border-emerald-300'
              : 'bg-red-50/70 border-red-300'
          }`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {isWithinRadius ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Verificação Anti-Fraude GPS
                </span>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                isWithinRadius
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-red-100 text-red-800 border-red-300'
              }`}>
                {isWithinRadius ? 'AUTORIZADO' : 'BLOQUEADO'}
              </span>
            </div>

            {/* Distance Comparison Visual Meter */}
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-600">Distância Calculada:</span>
                <span className={`font-bold text-sm ${isWithinRadius ? 'text-emerald-700' : 'text-red-700'}`}>
                  {formatDistance(distanceMeters)}
                </span>
              </div>
              
              {/* Progress visual bar */}
              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isWithinRadius ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (distanceMeters / RAIO_MAXIMO_CHECKIN_METROS) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                <span>0m</span>
                <span className="font-bold text-stone-700">Limite Máximo: 50.0m</span>
                <span>{distanceMeters > 50 ? `${Math.round(distanceMeters)}m` : '100m+'}</span>
              </div>
            </div>

            {/* Diagnostic message */}
            <p className={`text-xs mt-3 leading-relaxed ${
              isWithinRadius ? 'text-emerald-800' : 'text-red-800 font-medium'
            }`}>
              {isWithinRadius
                ? `✅ Proximidade verificada: Você está a apenas ${formatDistance(distanceMeters)} da casinha. O check-in presencial é permitido e atualizará o status para 🟢 Verde.`
                : `🚫 Ação bloqueada pelo Anti-Fraude: Você está a ${formatDistance(distanceMeters)} de distância. O sistema exige proximidade presencial menor que 50 metros para evitar check-ins falsos.`}
            </p>

            {/* Simulation test shortcuts */}
            <div className="mt-3 pt-3 border-t border-stone-200/60 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-stone-600 text-[11px]">Testar no simulador:</span>
              <button
                id="test-near-gps-btn"
                onClick={() => handleSimulatePosition(16)}
                className="px-2.5 py-1 bg-white hover:bg-stone-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
              >
                📍 Ficar a 16m (Permitido)
              </button>
              <button
                id="test-far-gps-btn"
                onClick={() => handleSimulatePosition(135)}
                className="px-2.5 py-1 bg-white hover:bg-stone-100 text-red-800 border border-red-300 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
              >
                📍 Ficar a 135m (Recusar)
              </button>
            </div>
          </div>

          {/* Action Choice */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Tipo de Ação Realizada:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipoAcao('abastecimento')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  tipoAcao === 'abastecimento'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-200'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Utensils className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span className="text-xs block">Abasteci Comida/Água</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoAcao('limpeza')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  tipoAcao === 'limpeza'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-200'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Sparkles className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span className="text-xs block">Limpei o Local</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoAcao('vistoria_geral')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  tipoAcao === 'vistoria_geral'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-200'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Search className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                <span className="text-xs block">Vistoria Geral</span>
              </button>
            </div>
          </div>

          {/* Observação */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Observação voluntária (opcional):
            </label>
            <input
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Ração reposicionada e pote de água trocado"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Live API Response Display */}
          {lastResponse && (
            <div className="p-3 bg-stone-900 rounded-xl text-stone-200 text-xs font-mono space-y-2 border border-stone-800">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span className="flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" /> Resposta da API
                </span>
                <span className={lastResponse.sucesso ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  HTTP {lastResponse.codigo_status} {lastResponse.sucesso ? 'OK' : 'FORBIDDEN'}
                </span>
              </div>
              <pre className="text-[11px] text-stone-300 overflow-x-auto p-2 bg-stone-950 rounded-lg max-h-40">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              id="cancel-checkin-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              id="submit-checkin-btn"
              type="button"
              onClick={handleExecuteCheckIn}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                isWithinRadius
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              <span>{isWithinRadius ? 'Confirmar Check-in (<50m)' : 'Tentar Validar (>50m)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
