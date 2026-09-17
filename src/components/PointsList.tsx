import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Clock,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Navigation,
  Image as ImageIcon,
  Share2,
  Camera,
  Download,
  Wrench
} from 'lucide-react';
import { PontoCasinha, GPSCoords } from '../types';
import { calculateDistanceMeters, formatDistance, getTTLStatus } from '../utils/geo';
import { RAIO_MAXIMO_CHECKIN_METROS, generateWhatsAppUrgencyLink } from '../utils/engine';

interface PointsListProps {
  pontos: PontoCasinha[];
  userCoords: GPSCoords;
  currentSimulatedTime: Date;
  onOpenCheckIn: (ponto: PontoCasinha) => void;
  onOpenUrgency: (ponto: PontoCasinha) => void;
  onSelectPonto: (id: number) => void;
  selectedPontoId: number | null;
  onTeleportToPonto: (ponto: PontoCasinha, distanceOffsetMeters?: number) => void;
  onInspectJson: (ponto: PontoCasinha) => void;
}

export const PointsList: React.FC<PointsListProps> = ({
  pontos,
  userCoords,
  currentSimulatedTime,
  onOpenCheckIn,
  onOpenUrgency,
  onSelectPonto,
  selectedPontoId,
  onTeleportToPonto,
  onInspectJson,
}) => {
  if (pontos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
        <AlertCircle className="w-10 h-10 mx-auto text-stone-400 mb-3" />
        <p className="font-semibold text-stone-700">Nenhum ponto de apoio encontrado.</p>
        <p className="text-xs text-stone-500 mt-1">Ajuste os filtros de status ou cadastre um novo ponto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <span>Pontos de Apoio Cadastrados</span>
          <span className="text-xs font-mono font-normal px-2 py-0.5 bg-stone-100 border border-stone-200 rounded-full text-stone-600">
            {pontos.length} unidades
          </span>
        </h3>
        <span className="text-xs text-stone-500 hidden sm:inline">
          Validação anti-fraude: &lt;50 metros obrigatório para check-in
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pontos.map((ponto) => {
          const distance = calculateDistanceMeters(
            userCoords.latitude,
            userCoords.longitude,
            ponto.latitude,
            ponto.longitude
          );
          const isNear = distance <= RAIO_MAXIMO_CHECKIN_METROS;
          const ttl = getTTLStatus(ponto.ultimo_check_in, currentSimulatedTime);
          const isSelected = ponto.id === selectedPontoId;

          const isVerde = ponto.status === '🟢 Verde';
          const isAmarelo = ponto.status === '🟡 Amarelo';
          const isVermelho = ponto.status === '🔴 Vermelho';

          const whatsappUrl = generateWhatsAppUrgencyLink(ponto);

          return (
            <motion.div
              layout
              key={ponto.id}
              id={`card-ponto-${ponto.id}`}
              onClick={() => onSelectPonto(ponto.id)}
              animate={{
                borderColor: isSelected
                  ? '#10b981'
                  : isVermelho
                  ? '#fca5a5'
                  : isAmarelo
                  ? '#fde68a'
                  : '#e7e5e4',
              }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className={`bg-white rounded-2xl border p-5 shadow-xs relative transition-shadow ${
                isSelected
                  ? 'ring-2 ring-emerald-100 shadow-sm'
                  : 'hover:border-stone-300'
              }`}
            >
              {/* Animated top accent bar reflecting status */}
              <motion.div
                layout
                initial={false}
                animate={{
                  backgroundColor: isVerde ? '#10b981' : isAmarelo ? '#f59e0b' : '#ef4444',
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="absolute top-0 left-6 right-6 h-1 rounded-b-full"
              />

              {/* Top Row: ID, Title & Status Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md border border-stone-200">
                      ID #{ponto.id}
                    </span>
                    
                    {/* Status Badge with framer-motion color & icon transitions */}
                    <motion.div
                      layout
                      initial={false}
                      animate={{
                        backgroundColor: isVerde
                          ? 'rgba(236, 253, 245, 1)'
                          : isAmarelo
                          ? 'rgba(254, 243, 199, 1)'
                          : 'rgba(254, 242, 242, 1)',
                        borderColor: isVerde
                          ? 'rgba(167, 243, 208, 1)'
                          : isAmarelo
                          ? 'rgba(253, 230, 138, 1)'
                          : 'rgba(254, 202, 202, 1)',
                        color: isVerde ? '#065f46' : isAmarelo ? '#92400e' : '#991b1b',
                      }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={ponto.status}
                          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          className="flex items-center gap-1"
                        >
                          {isVerde && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          {isAmarelo && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                          {isVermelho && <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 animate-pulse" />}
                          <span>{ponto.status}</span>
                        </motion.span>
                      </AnimatePresence>
                    </motion.div>
                  </div>
                  <h4 className="text-base font-bold text-stone-900 tracking-tight">
                    {ponto.nome_ponto}
                  </h4>
                  {ponto.descricao_local && (
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                      {ponto.descricao_local}
                    </p>
                  )}
                </div>

                {/* Distance Badge relative to user */}
                <div className="text-right shrink-0">
                  <div
                    className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-1 rounded-lg border ${
                      isNear
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-stone-50 text-stone-600 border-stone-200'
                    }`}
                    title={isNear ? 'Você está no raio permitido de 50m!' : 'Você está fora do raio de 50m'}
                  >
                    <Navigation className="w-3 h-3" />
                    <span>{formatDistance(distance)}</span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {isNear ? '✅ No raio (<50m)' : '🚫 Fora do raio'}
                  </div>
                </div>
              </div>

              {/* Coordinates & Sponsor info */}
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-2 mb-4 text-xs">
                {/* GPS Coordinates */}
                <div className="flex items-center justify-between text-stone-600 font-mono text-[11px]">
                  <span className="flex items-center gap-1 text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    Coordenadas:
                  </span>
                  <span>
                    Lat: {ponto.latitude.toFixed(5)}, Lon: {ponto.longitude.toFixed(5)}
                  </span>
                </div>

                {/* Sponsor */}
                <div className="flex items-center gap-1.5 text-stone-700">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="font-medium text-stone-800 truncate">
                    {ponto.apoiador_logotipo}
                  </span>
                </div>

                {/* Last Check-in & TTL */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[11px]">
                  <span className="flex items-center gap-1 text-stone-500">
                    <Clock className="w-3 h-3 text-stone-400" />
                    Último Check-in:
                  </span>
                  <span className="font-mono text-stone-800 font-semibold">
                    {ponto.ultimo_check_in}
                  </span>
                </div>

                {/* TTL Status Banner */}
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-stone-500">Regra TTL (48h):</span>
                  <span
                    className={`font-semibold ${
                      ttl.expired
                        ? 'text-amber-700'
                        : ttl.urgentCheck
                        ? 'text-amber-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {ttl.text}
                  </span>
                </div>
              </div>

              {/* Urgency Alert Details if Red with AnimatePresence */}
              <AnimatePresence>
                {isVermelho && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, scale: 0.96 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.96 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-red-800 mb-1">
                        <AlertCircle className="w-4 h-4 text-red-600 animate-bounce" />
                        Urgência Ativa (🔴)
                      </div>
                      {ponto.motivo_urgencia && (
                        <p className="text-red-700 mb-2 font-medium">{ponto.motivo_urgencia}</p>
                      )}
                      {ponto.foto_urgencia && (
                        <div className="mb-2 relative rounded-lg overflow-hidden border border-red-200 max-h-36 bg-black/10">
                          <img
                            src={ponto.foto_urgencia}
                            alt="Evidência da Urgência"
                            className="w-full h-32 object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> Evidência Fotográfica Validada
                          </span>
                        </div>
                      )}
                      <a
                        id={`btn-whatsapp-sos-${ponto.id}`}
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs shadow-xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Disparar Alerta SOS no WhatsApp
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Comprovante do Último Atendimento (Câmera ao Vivo) */}
              {ponto.ultima_foto_comprovante && (
                <div className="mb-3 p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img
                      src={ponto.ultima_foto_comprovante}
                      alt="Comprovante de atendimento"
                      className="w-10 h-10 rounded-lg object-cover border border-emerald-300 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0">
                      <span className="font-semibold text-emerald-950 block truncate flex items-center gap-1 text-[11px]">
                        <Camera className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Atendimento Comprovado ao Vivo
                      </span>
                      <span className="text-[10px] text-emerald-700 block truncate font-mono">
                        {ponto.ultima_foto_timestamp || ponto.ultimo_check_in}
                      </span>
                    </div>
                  </div>
                  <a
                    href={ponto.ultima_foto_comprovante}
                    download={`comprovante_casinha_${ponto.id}.jpg`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-semibold shrink-0 flex items-center gap-1 transition-colors shadow-2xs"
                    title="Baixar comprovante fotográfico"
                  >
                    <Download className="w-3 h-3" />
                    Baixar
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                {/* Check-in / Atendimento Button */}
                <button
                  id={`btn-checkin-${ponto.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCheckIn(ponto);
                  }}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isVermelho
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-xs'
                      : isNear
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                  title={
                    isVermelho
                      ? 'Atender urgência e realizar reparo com envio obrigatório de foto da câmera do celular.'
                      : isNear
                      ? 'Proximidade validada (<50m)! Fotografe com a câmera para concluir check-in.'
                      : 'Distância >50m. Abra para simular ou aproximar-se da casinha.'
                  }
                >
                  {isVermelho ? <Wrench className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{isVermelho ? 'Atender Reparo (Foto)' : 'Atender (Foto Obrigatória)'}</span>
                  {!isNear && <span className="text-[10px] text-stone-500 font-normal">(&gt;50m)</span>}
                </button>

                {/* Urgência (🔴) Button */}
                <button
                  id={`btn-urgencia-${ponto.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenUrgency(ponto);
                  }}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer"
                  title="Reportar Urgência com Foto Obrigatória"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Urgência</span>
                </button>

                {/* Quick Simulation Teleport Button */}
                <button
                  id={`btn-teleport-${ponto.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTeleportToPonto(ponto, 15);
                  }}
                  className="px-2.5 py-2 rounded-xl text-xs bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                  title="Posicionar meu GPS a 15m desta casinha para testar check-in"
                >
                  📍 Ir aqui
                </button>

                {/* JSON Inspector */}
                <button
                  id={`btn-json-inspect-${ponto.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspectJson(ponto);
                  }}
                  className="px-2.5 py-2 rounded-xl text-xs bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200 font-mono transition-colors cursor-pointer"
                  title="Inspecionar objeto JSON estrito"
                >
                  {'{ }'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
