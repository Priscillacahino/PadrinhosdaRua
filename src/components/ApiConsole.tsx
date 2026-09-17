import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Database,
  Terminal,
  Play,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { PontoCasinha, LogAcao, GPSCoords } from '../types';
import { exportToStrictDatabase } from '../utils/engine';
import { formatDateTime } from '../utils/geo';

interface ApiConsoleProps {
  pontos: PontoCasinha[];
  logs: LogAcao[];
  userCoords: GPSCoords;
  currentSimulatedTime: Date;
  onRunTTLScan: () => void;
  onSimulateCheckInApi: (pontoId: number, simulatedDistanceMeters: number, withPhoto?: boolean) => void;
}

export const ApiConsole: React.FC<ApiConsoleProps> = ({
  pontos,
  logs,
  userCoords,
  currentSimulatedTime,
  onRunTTLScan,
  onSimulateCheckInApi,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<'GET_PONTOS' | 'CHECKIN_VALID' | 'CHECKIN_INVALID' | 'TTL_SCAN'>('GET_PONTOS');

  // JSON estrito conforme exigência do banco de dados (Pontos_Casinhas)
  const strictDatabaseJson = exportToStrictDatabase(pontos);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(strictDatabaseJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(strictDatabaseJson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pontos_casinhas_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner / API Context */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 border border-stone-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Motor de Banco de Dados Central & API
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ONLINE • v1.0.4
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Estrutura estrita da tabela <code className="text-emerald-400 font-mono">Pontos_Casinhas</code> e endpoints simulados em tempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-strict-json-btn"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono rounded-xl border border-stone-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar JSON Estrito'}</span>
            </button>
            <button
              id="download-strict-json-btn"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar .JSON</span>
            </button>
          </div>
        </div>

        {/* Database Schema Specs Badge */}
        <div className="mt-5 pt-4 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
            <span className="text-stone-500 text-[10px] block">Tabela Principal</span>
            <span className="text-emerald-400 font-bold">Pontos_Casinhas</span>
          </div>
          <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
            <span className="text-stone-500 text-[10px] block">Registros Ativos</span>
            <span className="text-white font-bold">{pontos.length} linhas</span>
          </div>
          <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
            <span className="text-stone-500 text-[10px] block">Validação Proximidade</span>
            <span className="text-blue-400 font-bold">&lt; 50 metros</span>
          </div>
          <div className="bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
            <span className="text-stone-500 text-[10px] block">Janela de TTL</span>
            <span className="text-amber-400 font-bold">48 horas (2 dias)</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Strict JSON Viewer + API Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Strict Database JSON Output (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-stone-900">
                Estrutura Estrita do Banco de Dados (Pontos_Casinhas)
              </h3>
            </div>
            <span className="text-xs font-mono text-stone-500">
              Formato JSON Padronizado
            </span>
          </div>

          <div className="bg-stone-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-[520px] leading-relaxed border border-stone-800 shadow-inner">
            <pre>{JSON.stringify(strictDatabaseJson, null, 2)}</pre>
          </div>

          <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-600">
            <strong className="text-stone-800">Conformidade de Esquema:</strong> Cada registro respeita rigorosamente os tipos:
            <code className="text-[11px] text-stone-700 block mt-1">
              id (Int), latitude (Float), longitude (Float), nome_ponto (Str), status (🟢, 🟡, 🔴), apoiador_logotipo (Str), ultimo_check_in (AAAA-MM-DD HH:MM:SS)
            </code>
          </div>
        </div>

        {/* Right Column: API Sandbox & Realtime Logs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick API Sandbox Tester */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 mb-3">
              <Play className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-stone-900">
                Simulador de Requisições da API
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <p className="text-stone-600">
                Dispare chamadas de API para verificar o comportamento das regras do motor:
              </p>

              {/* Test Case 1: Valid Check-in (<50m with Camera Photo) */}
              <button
                id="api-test-valid-checkin"
                onClick={() => onSimulateCheckInApi(1, 15, true)}
                className="w-full text-left p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition-colors flex items-start justify-between gap-2 cursor-pointer"
              >
                <div>
                  <span className="font-bold text-emerald-900 block flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    POST /check-in (Sucesso &lt;50m com Foto da Câmera)
                  </span>
                  <span className="text-[11px] text-emerald-700 block mt-0.5">
                    Envia coordenadas a 15m da Casinha #1 com foto em tempo real da câmera. Retorna HTTP 200 e atualiza status para 🟢 Verde.
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  TESTAR
                </span>
              </button>

              {/* Test Case 2: Missing Photo rejection (PHOTO_EVIDENCE_REQUIRED) */}
              <button
                id="api-test-no-photo-checkin"
                onClick={() => onSimulateCheckInApi(1, 15, false)}
                className="w-full text-left p-3 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-100/60 transition-colors flex items-start justify-between gap-2 cursor-pointer"
              >
                <div>
                  <span className="font-bold text-orange-900 block flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                    POST /check-in (Rejeição: Sem Foto da Câmera)
                  </span>
                  <span className="text-[11px] text-orange-700 block mt-0.5">
                    Envia requisição presencial sem a foto da câmera. Bloqueia com HTTP 422 PHOTO_EVIDENCE_REQUIRED e não altera status.
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-200 text-orange-900">
                  TESTAR
                </span>
              </button>

              {/* Test Case 3: Anti-fraud rejection (>50m) */}
              <button
                id="api-test-invalid-checkin"
                onClick={() => onSimulateCheckInApi(1, 145, true)}
                className="w-full text-left p-3 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100/60 transition-colors flex items-start justify-between gap-2 cursor-pointer"
              >
                <div>
                  <span className="font-bold text-red-900 block flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    POST /check-in (Rejeição Anti-Fraude &gt;50m)
                  </span>
                  <span className="text-[11px] text-red-700 block mt-0.5">
                    Envia coordenadas a 145m da Casinha #1 (Parque da Lagoa - Centro). Deve recusar com código GPS_OUT_OF_RANGE.
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-200 text-red-900">
                  TESTAR
                </span>
              </button>

              {/* Test Case 3: TTL Scan */}
              <button
                id="api-test-ttl-scan"
                onClick={onRunTTLScan}
                className="w-full text-left p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition-colors flex items-start justify-between gap-2 cursor-pointer"
              >
                <div>
                  <span className="font-bold text-amber-900 block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    POST /ttl/scan (Varredura de 48 horas)
                  </span>
                  <span className="text-[11px] text-amber-700 block mt-0.5">
                    Verifica todos os registros com mais de 48h desde o último check-in e transita para 🟡 Amarelo.
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                  EXECUTAR
                </span>
              </button>
            </div>
          </div>

          {/* Activity Logs Stream */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span>Histórico de Ações da Comunidade</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full">
                  {logs.length}
                </span>
              </h3>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6">
                  Nenhuma transação registrada nesta sessão. Realize check-ins ou reportes para visualizar aqui.
                </p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl border border-stone-100 bg-stone-50/80 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-stone-500 text-[10px]">
                      <span>{log.timestamp}</span>
                      <span className="font-bold text-stone-700">#{log.ponto_id}</span>
                    </div>
                    <div className="font-sans font-semibold text-stone-800">
                      {log.acao}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-600">
                      <span>Transição: {log.status_anterior} ➔ {log.status_novo}</span>
                      {log.distancia_metros !== undefined && (
                        <span className="text-emerald-700 font-bold">
                          {log.distancia_metros.toFixed(1)}m
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
