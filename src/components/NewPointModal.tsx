import React, { useState } from 'react';
import { X, Plus, MapPin, HeartHandshake, FileText, Compass } from 'lucide-react';
import { PontoCasinha, GPSCoords } from '../types';
import { formatDateTime } from '../utils/geo';
import { JOAO_PESSOA_LOCAIS_REFERENCIA } from '../data/initialData';

interface NewPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPoint: (novoPonto: PontoCasinha) => void;
  userCoords: GPSCoords;
  nextId: number;
}

export const NewPointModal: React.FC<NewPointModalProps> = ({
  isOpen,
  onClose,
  onAddPoint,
  userCoords,
  nextId,
}) => {
  if (!isOpen) return null;

  const [nomePonto, setNomePonto] = useState('');
  const [latitude, setLatitude] = useState(userCoords.latitude.toString());
  const [longitude, setLongitude] = useState(userCoords.longitude.toString());
  const [apoiador, setApoiador] = useState('Insumos doados por: ');
  const [descricao, setDescricao] = useState('');

  const handleSelectBairroPreset = (bairroKey: string) => {
    const loc = JOAO_PESSOA_LOCAIS_REFERENCIA[bairroKey];
    if (loc) {
      setNomePonto(`Casinha / Comedouro ${bairroKey}`);
      setLatitude(loc.lat.toFixed(4));
      setLongitude(loc.lon.toFixed(4));
      setDescricao(loc.descricao);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomePonto.trim()) return;

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    const novoPonto: PontoCasinha = {
      id: nextId,
      latitude: isNaN(lat) ? userCoords.latitude : lat,
      longitude: isNaN(lon) ? userCoords.longitude : lon,
      nome_ponto: nomePonto.trim(),
      status: '🟢 Verde',
      apoiador_logotipo: apoiador.trim() || 'Insumos doados por: Voluntários da Comunidade',
      ultimo_check_in: formatDateTime(new Date()),
      descricao_local: descricao.trim() || undefined,
    };

    onAddPoint(novoPonto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">
              Cadastrar Novo Ponto de Apoio
            </h3>
          </div>
          <button
            id="close-new-point-modal"
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bairros de Referência de João Pessoa - PB */}
        <div className="mb-3.5 p-3 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Preenchimento Rápido (João Pessoa - PB):</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {Object.keys(JOAO_PESSOA_LOCAIS_REFERENCIA).map((bairro) => (
              <button
                key={bairro}
                type="button"
                onClick={() => handleSelectBairroPreset(bairro)}
                className="px-2 py-0.5 text-[11px] bg-white hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-md font-medium transition-colors cursor-pointer"
              >
                {bairro}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Nome do Ponto:
            </label>
            <input
              type="text"
              required
              value={nomePonto}
              onChange={(e) => setNomePonto(e.target.value)}
              placeholder="Ex: Casinha da Praça Central"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Latitude:
              </label>
              <input
                type="text"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-3 py-2 font-mono border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Longitude:
              </label>
              <input
                type="text"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-3 py-2 font-mono border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Apoiador / Patrocinador Local:
            </label>
            <input
              type="text"
              value={apoiador}
              onChange={(e) => setApoiador(e.target.value)}
              placeholder="Insumos doados por: ..."
              className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Descrição do Local / Ponto de Referência:
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Próximo à banca de jornal"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium"
            >
              Cancelar
            </button>
            <button
              id="confirm-add-point-btn"
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
            >
              Cadastrar Ponto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
