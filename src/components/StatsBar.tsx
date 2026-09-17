import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { PontoCasinha } from '../types';

interface StatsBarProps {
  pontos: PontoCasinha[];
  onFilterStatus: (status: string | null) => void;
  activeFilter: string | null;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  pontos,
  onFilterStatus,
  activeFilter,
}) => {
  const total = pontos.length;
  const verdes = pontos.filter((p) => p.status === '🟢 Verde').length;
  const amarelos = pontos.filter((p) => p.status === '🟡 Amarelo').length;
  const vermelhos = pontos.filter((p) => p.status === '🔴 Vermelho').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
      
      {/* 🟢 Verde */}
      <button
        id="filter-verde-btn"
        onClick={() => onFilterStatus(activeFilter === '🟢 Verde' ? null : '🟢 Verde')}
        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
          activeFilter === '🟢 Verde'
            ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300'
            : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/40'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Abastecidos (🟢)
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-700">{verdes}</span>
        </div>
        <p className="text-xs text-stone-700">Comida e água em dia (&lt;48h)</p>
      </button>

      {/* 🟡 Amarelo */}
      <button
        id="filter-amarelo-btn"
        onClick={() => onFilterStatus(activeFilter === '🟡 Amarelo' ? null : '🟡 Amarelo')}
        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
          activeFilter === '🟡 Amarelo'
            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
            : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-amber-50/40'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Atenção (🟡)
          </span>
          <span className="text-2xl font-bold font-mono text-amber-700">{amarelos}</span>
        </div>
        <p className="text-xs text-stone-700">Sem comida/água ou &gt;48h</p>
      </button>

      {/* 🔴 Vermelho */}
      <button
        id="filter-vermelho-btn"
        onClick={() => onFilterStatus(activeFilter === '🔴 Vermelho' ? null : '🔴 Vermelho')}
        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
          activeFilter === '🔴 Vermelho'
            ? 'bg-red-50 border-red-400 ring-2 ring-red-300'
            : 'bg-white border-stone-200 hover:border-red-300 hover:bg-red-50/40'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-red-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-600" />
            Urgências (🔴)
          </span>
          <span className="text-2xl font-bold font-mono text-red-700">{vermelhos}</span>
        </div>
        <p className="text-xs text-stone-700">Danos, animais feridos (com foto)</p>
      </button>

      {/* Regras Técnicas & Total */}
      <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/80 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
            Total de Pontos
          </span>
          <span className="text-2xl font-bold font-mono text-stone-900">{total}</span>
        </div>
        <div className="flex items-center gap-3 pt-2 border-t border-stone-200/80 text-[11px] text-stone-700 font-mono">
          <span className="flex items-center gap-1 text-emerald-700" title="Raio Anti-Fraude">
            <MapPin className="w-3 h-3" /> &lt;50m
          </span>
          <span className="flex items-center gap-1 text-amber-700" title="Time To Live">
            <Clock className="w-3 h-3" /> TTL 48h
          </span>
          <span className="flex items-center gap-1 text-blue-700" title="Anti-Fraude Ativo">
            <ShieldCheck className="w-3 h-3" /> Ativo
          </span>
        </div>
      </div>

    </div>
  );
};
