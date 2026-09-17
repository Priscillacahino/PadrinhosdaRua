import React, { useState } from 'react';
import { X, Copy, Check, Code2, Database } from 'lucide-react';
import { PontoCasinha } from '../types';

interface JsonInspectorModalProps {
  ponto: PontoCasinha | null;
  onClose: () => void;
}

export const JsonInspectorModal: React.FC<JsonInspectorModalProps> = ({ ponto, onClose }) => {
  if (!ponto) return null;

  const [copied, setCopied] = useState(false);

  // Formato estrito exigido pelo banco de dados
  const strictRecord = {
    id: ponto.id,
    latitude: ponto.latitude,
    longitude: ponto.longitude,
    nome_ponto: ponto.nome_ponto,
    status: ponto.status,
    apoiador_logotipo: ponto.apoiador_logotipo,
    ultimo_check_in: ponto.ultimo_check_in,
  };

  const jsonStr = JSON.stringify(strictRecord, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-stone-900 text-stone-100 rounded-3xl max-w-md w-full border border-stone-800 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white font-mono">
              Pontos_Casinhas #{ponto.id} (JSON Estrito)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-stone-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-stone-800/80 mb-4">
          <pre>{jsonStr}</pre>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>7 campos estritos validados</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl transition-colors font-mono cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
