import React, { useState } from 'react';
import { MapPin, Navigation, Crosshair, Sparkles, Check, AlertCircle } from 'lucide-react';
import { PontoCasinha, GPSCoords } from '../types';
import { calculateDistanceMeters, formatDistance } from '../utils/geo';
import { RAIO_MAXIMO_CHECKIN_METROS } from '../utils/engine';

interface InteractiveMapProps {
  pontos: PontoCasinha[];
  userCoords: GPSCoords;
  onSetUserCoords: (coords: GPSCoords) => void;
  selectedPontoId: number | null;
  onSelectPonto: (id: number) => void;
  onOpenCheckIn: (ponto: PontoCasinha) => void;
  onOpenUrgency: (ponto: PontoCasinha) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pontos,
  userCoords,
  onSetUserCoords,
  selectedPontoId,
  onSelectPonto,
  onOpenCheckIn,
  onOpenUrgency,
}) => {
  const [hoveredPointId, setHoveredPointId] = useState<number | null>(null);

  // Calcula bounding box para projeção SVG
  const allLats = [...pontos.map((p) => p.latitude), userCoords.latitude];
  const allLons = [...pontos.map((p) => p.longitude), userCoords.longitude];

  const minLat = Math.min(...allLats);
  const maxLat = Math.max(...allLats);
  const minLon = Math.min(...allLons);
  const maxLon = Math.max(...allLons);

  // Adiciona margem de segurança de 20%
  const latPadding = Math.max(0.006, (maxLat - minLat) * 0.25);
  const lonPadding = Math.max(0.008, (maxLon - minLon) * 0.25);

  const boundMinLat = minLat - latPadding;
  const boundMaxLat = maxLat + latPadding;
  const boundMinLon = minLon - lonPadding;
  const boundMaxLon = maxLon + lonPadding;

  const mapWidth = 800;
  const mapHeight = 440;

  const project = (lat: number, lon: number) => {
    const x = ((lon - boundMinLon) / (boundMaxLon - boundMinLon)) * (mapWidth - 100) + 50;
    // Invertido para latitude norte/sul
    const y = ((boundMaxLat - lat) / (boundMaxLat - boundMinLat)) * (mapHeight - 80) + 40;
    return { x, y };
  };

  const userSvgPos = project(userCoords.latitude, userCoords.longitude);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Normaliza para o viewBox
    const scaleX = mapWidth / rect.width;
    const scaleY = mapHeight / rect.height;
    const svgX = clickX * scaleX;
    const svgY = clickY * scaleY;

    // Converte de volta para coordenadas lat/lon
    const lon = boundMinLon + ((svgX - 50) / (mapWidth - 100)) * (boundMaxLon - boundMinLon);
    const lat = boundMaxLat - ((svgY - 40) / (mapHeight - 80)) * (boundMaxLat - boundMinLat);

    onSetUserCoords({
      latitude: Math.round(lat * 100000) / 100000,
      longitude: Math.round(lon * 100000) / 100000,
      accuracy: 10,
    });
  };

  const activePoint = pontos.find((p) => p.id === (hoveredPointId || selectedPontoId));
  const activeDistance = activePoint
    ? calculateDistanceMeters(
        userCoords.latitude,
        userCoords.longitude,
        activePoint.latitude,
        activePoint.longitude
      )
    : null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs mb-8">
      {/* Map Header */}
      <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/60">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-stone-900">
              Mapeamento Geoespacial & Radar Anti-Fraude
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 font-mono">
              Raio Seguro: 50m
            </span>
          </div>
          <p className="text-xs text-stone-700 mt-0.5">
            Clique em qualquer ponto do mapa para reposicionar o GPS do usuário e testar a proximidade em tempo real.
          </p>
        </div>

        {/* Quick GPS Positioning presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-stone-700 flex items-center gap-1">
            <Crosshair className="w-3.5 h-3.5" />
            Posicionar GPS (JP):
          </span>
          <button
            id="preset-centro-btn"
            onClick={() => {
              onSetUserCoords({
                latitude: -7.1153,
                longitude: -34.8611,
                accuracy: 5,
              });
            }}
            className="px-2 py-0.5 text-[11px] bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 font-medium transition-colors cursor-pointer"
            title="Centro (Coordenada Central Padrão: -7.1153, -34.8611)"
          >
            Centro
          </button>
          <button
            id="preset-tambau-btn"
            onClick={() => {
              onSetUserCoords({
                latitude: -7.1195,
                longitude: -34.8253,
                accuracy: 5,
              });
            }}
            className="px-2 py-0.5 text-[11px] bg-stone-200 text-stone-800 rounded-md hover:bg-stone-300 font-medium transition-colors cursor-pointer"
          >
            Tambaú
          </button>
          <button
            id="preset-manaira-btn"
            onClick={() => {
              onSetUserCoords({
                latitude: -7.0984,
                longitude: -34.8322,
                accuracy: 5,
              });
            }}
            className="px-2 py-0.5 text-[11px] bg-stone-200 text-stone-800 rounded-md hover:bg-stone-300 font-medium transition-colors cursor-pointer"
          >
            Manaíra
          </button>
          <button
            id="preset-bessa-btn"
            onClick={() => {
              onSetUserCoords({
                latitude: -7.0650,
                longitude: -34.8320,
                accuracy: 5,
              });
            }}
            className="px-2 py-0.5 text-[11px] bg-stone-200 text-stone-800 rounded-md hover:bg-stone-300 font-medium transition-colors cursor-pointer"
          >
            Bessa
          </button>
          <button
            id="preset-ufpb-btn"
            onClick={() => {
              onSetUserCoords({
                latitude: -7.1396,
                longitude: -34.8454,
                accuracy: 5,
              });
            }}
            className="px-2 py-0.5 text-[11px] bg-stone-200 text-stone-800 rounded-md hover:bg-stone-300 font-medium transition-colors cursor-pointer"
          >
            UFPB
          </button>
          <button
            id="preset-mangabeira-btn"
            onClick={() => {
              onSetUserCoords({
                latitude: -7.1650,
                longitude: -34.8378,
                accuracy: 5,
              });
            }}
            className="px-2 py-0.5 text-[11px] bg-stone-200 text-stone-800 rounded-md hover:bg-stone-300 font-medium transition-colors cursor-pointer"
          >
            Mangabeira
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative bg-stone-900 select-none overflow-hidden" style={{ minHeight: '340px' }}>
        {/* Subtle Grid pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full cursor-crosshair block"
          onClick={handleSvgClick}
        >
          {/* Defs for gradients & filters */}
          <defs>
            <radialGradient id="userBeacon" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Dotted lines between user and points */}
          {pontos.map((p) => {
            const pSvg = project(p.latitude, p.longitude);
            const dist = calculateDistanceMeters(
              userCoords.latitude,
              userCoords.longitude,
              p.latitude,
              p.longitude
            );
            const isNear = dist <= RAIO_MAXIMO_CHECKIN_METROS;
            const isSelected = p.id === (hoveredPointId || selectedPontoId);

            return (
              <g key={`line-${p.id}`}>
                <line
                  x1={userSvgPos.x}
                  y1={userSvgPos.y}
                  x2={pSvg.x}
                  y2={pSvg.y}
                  stroke={isNear ? '#10b981' : isSelected ? '#ef4444' : '#57534e'}
                  strokeWidth={isSelected ? 2 : 1}
                  strokeDasharray={isSelected ? '4,4' : '2,4'}
                  strokeOpacity={isSelected ? 0.9 : 0.3}
                />
              </g>
            );
          })}

          {/* 50m Radius Circles around points */}
          {pontos.map((p) => {
            const pSvg = project(p.latitude, p.longitude);
            // Estimativa de pixels para 50 metros na escala local
            const rPixels = 26;

            const isVerde = p.status.includes('Verde');
            const isAmarelo = p.status.includes('Amarelo');
            const strokeColor = isVerde ? '#10b981' : isAmarelo ? '#f59e0b' : '#ef4444';

            return (
              <g key={`circle-${p.id}`}>
                {/* 50m limit buffer circle */}
                <circle
                  cx={pSvg.x}
                  cy={pSvg.y}
                  r={rPixels}
                  fill={strokeColor}
                  fillOpacity="0.08"
                  stroke={strokeColor}
                  strokeWidth="1.2"
                  strokeDasharray="3,3"
                />
              </g>
            );
          })}

          {/* Points Markers */}
          {pontos.map((p) => {
            const pSvg = project(p.latitude, p.longitude);
            const dist = calculateDistanceMeters(
              userCoords.latitude,
              userCoords.longitude,
              p.latitude,
              p.longitude
            );
            const isNear = dist <= RAIO_MAXIMO_CHECKIN_METROS;
            const isSelected = p.id === (hoveredPointId || selectedPontoId);

            const isVerde = p.status.includes('Verde');
            const isAmarelo = p.status.includes('Amarelo');
            const badgeBg = isVerde ? '#10b981' : isAmarelo ? '#f59e0b' : '#ef4444';

            return (
              <g
                key={`marker-${p.id}`}
                className="cursor-pointer transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPonto(p.id);
                }}
                onMouseEnter={() => setHoveredPointId(p.id)}
                onMouseLeave={() => setHoveredPointId(null)}
              >
                {/* Selection ring */}
                {isSelected && (
                  <circle
                    cx={pSvg.x}
                    cy={pSvg.y}
                    r={18}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeOpacity="0.8"
                  />
                )}

                {/* Point Icon Base */}
                <circle
                  cx={pSvg.x}
                  cy={pSvg.y}
                  r={12}
                  fill={badgeBg}
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#glow)"
                />

                {/* Text ID inside marker */}
                <text
                  x={pSvg.x}
                  y={pSvg.y + 4}
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  #{p.id}
                </text>

                {/* Name Label */}
                <text
                  x={pSvg.x}
                  y={pSvg.y - 18}
                  fill="#e7e5e4"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  className="drop-shadow-md"
                  pointerEvents="none"
                >
                  {p.nome_ponto}
                </text>

                {/* Distance Chip */}
                <rect
                  x={pSvg.x - 30}
                  y={pSvg.y + 16}
                  width="60"
                  height="16"
                  rx="4"
                  fill={isNear ? '#065f46' : '#292524'}
                  stroke={isNear ? '#10b981' : '#44403c'}
                  strokeWidth="1"
                />
                <text
                  x={pSvg.x}
                  y={pSvg.y + 28}
                  fill={isNear ? '#a7f3d0' : '#d6d3d1'}
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                  pointerEvents="none"
                >
                  {formatDistance(dist)}
                </text>
              </g>
            );
          })}

          {/* User Location Beacon (Pulsing) */}
          <g>
            {/* Outer pulse wave */}
            <circle
              cx={userSvgPos.x}
              cy={userSvgPos.y}
              r="24"
              fill="url(#userBeacon)"
              className="animate-pulse"
            />
            {/* User inner pin */}
            <circle
              cx={userSvgPos.x}
              cy={userSvgPos.y}
              r="8"
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Center dot */}
            <circle cx={userSvgPos.x} cy={userSvgPos.y} r="3" fill="#ffffff" />

            <text
              x={userSvgPos.x}
              y={userSvgPos.y - 14}
              fill="#93c5fd"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
              className="drop-shadow-md font-mono"
            >
              📍 VOCÊ (Voluntário)
            </text>
          </g>
        </svg>

        {/* Floating Active Info Overlay */}
        {activePoint && activeDistance !== null && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-stone-900/90 backdrop-blur-md text-white p-3 rounded-xl border border-stone-700 shadow-xl flex items-center justify-between gap-3 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-100">{activePoint.nome_ponto}</span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-stone-800 text-stone-300">
                  {activePoint.status}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 font-mono text-[11px]">
                <span>Distância: <strong className={activeDistance <= 50 ? 'text-emerald-400' : 'text-red-400'}>{formatDistance(activeDistance)}</strong></span>
                <span>•</span>
                <span className={activeDistance <= 50 ? 'text-emerald-400 font-semibold' : 'text-red-400'}>
                  {activeDistance <= 50 ? '✅ Dentro do limite (<50m)' : '🚫 Fora do limite (>50m)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id={`map-checkin-btn-${activePoint.id}`}
                onClick={() => onOpenCheckIn(activePoint)}
                className={`px-2.5 py-1.5 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                  activeDistance <= 50
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                }`}
              >
                Check-in
              </button>
              <button
                id={`map-urgency-btn-${activePoint.id}`}
                onClick={() => onOpenUrgency(activePoint)}
                className="px-2.5 py-1.5 rounded-lg font-medium text-xs bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
              >
                Urgência
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Guide */}
      <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-200 text-xs text-stone-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 🟢 Verde (&lt;48h abastecido)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 🟡 Amarelo (&gt;48h s/ check-in)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> 🔴 Vermelho (Urgência com foto)
          </span>
        </div>
        <div className="text-[11px] text-stone-700">
          Círculo tracejado = Raio de validação de 50 metros
        </div>
      </div>
    </div>
  );
};
