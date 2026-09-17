import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Camera,
  Upload,
  Image as ImageIcon,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Code2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { PontoCasinha, ApiResponse } from '../types';
import { processUrgenciaReport, generateWhatsAppUrgencyLink } from '../utils/engine';
import rescueKittenImg from '../assets/images/rescue_kitten_1789603606974.jpg';

interface UrgencyModalProps {
  ponto: PontoCasinha | null;
  onClose: () => void;
  onSuccess: (updatedPonto: PontoCasinha, apiResponse: ApiResponse<PontoCasinha>, whatsappLink?: string) => void;
  currentSimulatedTime: Date;
}

export const UrgencyModal: React.FC<UrgencyModalProps> = ({
  ponto,
  onClose,
  onSuccess,
  currentSimulatedTime,
}) => {
  if (!ponto) return null;

  const [motivo, setMotivo] = useState('Casinha danificada / telhado quebrado');
  const [detalhes, setDetalhes] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [lastResponse, setLastResponse] = useState<ApiResponse<PontoCasinha> | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Preset de imagens de evidência para teste rápido
  const SAMPLE_PHOTOS = [
    {
      label: 'Gatinho / Casinha Avariada',
      url: rescueKittenImg,
    },
    {
      label: 'Animal Ferido',
      url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Vandalismo no Comedouro',
      url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFotoUrl(reader.result);
          setLastResponse(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecuteReport = () => {
    const result = processUrgenciaReport(
      ponto,
      {
        ponto_id: ponto.id,
        motivo,
        detalhes,
        foto_evidencia_url: fotoUrl,
      },
      currentSimulatedTime
    );

    setLastResponse(result.response);

    if (result.success && result.updatedCasinha) {
      setWhatsappLink(result.whatsappLink || null);
      setTimeout(() => {
        onSuccess(result.updatedCasinha!, result.response, result.whatsappLink);
      }, 1500);
    }
  };

  const previewWhatsappUrl = generateWhatsAppUrgencyLink(
    { ...ponto, motivo_urgencia: motivo },
    motivo,
    detalhes
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(previewWhatsappUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Alerta de Urgência (🔴 Vermelho)</h3>
              <p className="text-xs text-stone-500 font-mono">Ponto #{ponto.id}: {ponto.nome_ponto}</p>
            </div>
          </div>
          <button
            id="close-urgency-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          
          {/* Rule Reminder */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-0.5">Regra Estrita: Validação de Evidência Visual</strong>
              <span>
                Alertas para o status 🔴 Vermelho só podem ser aceitos e publicados se o usuário fornecer um arquivo/registro visual (foto). Alertas sem foto são estritamente rejeitados.
              </span>
            </div>
          </div>

          {/* Motivo Selector */}
          <div>
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1.5">
              Motivo da Urgência:
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            >
              <option value="Casinha danificada / telhado quebrado">Casinha danificada / telhado quebrado</option>
              <option value="Animal ferido ou doente no local">Animal ferido ou doente no local</option>
              <option value="Vandalismo ou comedouro furtado">Vandalismo ou comedouro furtado</option>
              <option value="Infestação de parasitas ou insetos">Infestação de parasitas ou insetos</option>
              <option value="Alimento contaminado ou estragado">Alimento contaminado ou estragado</option>
              <option value="Outra emergência no ponto de apoio">Outra emergência no ponto de apoio</option>
            </select>
          </div>

          {/* Detalhes Adicionais */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Detalhes adicionais para o resgate / voluntários:
            </label>
            <textarea
              rows={2}
              value={detalhes}
              onChange={(e) => setDetalhes(e.target.value)}
              placeholder="Ex: Cãozinho com pata machucada, necessita transporte veterinário urgente..."
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Compulsory Photo Evidence Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-red-600" />
                Evidência Fotográfica Obrigatória:
              </label>
              {fotoUrl ? (
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Foto anexada
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-red-600">
                  * Obrigatória
                </span>
              )}
            </div>

            {/* Photo Preview Box */}
            {fotoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 max-h-48 bg-stone-900 group">
                <img
                  src={fotoUrl}
                  alt="Evidência fotográfica"
                  className="w-full h-44 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFotoUrl('')}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                  >
                    Remover Foto
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-stone-300 hover:border-red-400 rounded-2xl p-4 text-center bg-stone-50 transition-colors">
                <label className="cursor-pointer block">
                  <Upload className="w-8 h-8 mx-auto text-stone-400 mb-1" />
                  <span className="text-xs font-semibold text-stone-700 block">
                    Carregar foto do dispositivo ou câmera
                  </span>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    PNG, JPG, WebP suportados
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Preset Fast Testing Buttons */}
                <div className="mt-3 pt-3 border-t border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-700 block mb-1.5">
                    Ou selecione um exemplo para teste rápido:
                  </span>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {SAMPLE_PHOTOS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFotoUrl(sample.url);
                          setLastResponse(null);
                        }}
                        className="px-2.5 py-1 text-[11px] bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-100 font-medium transition-colors cursor-pointer"
                      >
                        📷 {sample.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Preview Generator */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Integração WhatsApp Automática
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedLink ? 'Copiado!' : 'Copiar Link'}
              </button>
            </div>
            <p className="text-[11px] text-emerald-800">
              Ao publicar a urgência, o sistema gera instantaneamente o link formatado com coordenadas GPS e descrição para o grupo de voluntários e padrinhos da região.
            </p>
          </div>

          {/* Live API Response Display */}
          {lastResponse && (
            <div className="p-3 bg-stone-900 rounded-xl text-stone-200 text-xs font-mono space-y-2 border border-stone-800">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span className="flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" /> Resposta da API
                </span>
                <span className={lastResponse.sucesso ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  HTTP {lastResponse.codigo_status} {lastResponse.sucesso ? 'OK' : 'REJEITADO'}
                </span>
              </div>
              <pre className="text-[11px] text-stone-300 overflow-x-auto p-2 bg-stone-950 rounded-lg max-h-36">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              id="cancel-urgency-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              id="submit-urgency-btn"
              type="button"
              onClick={handleExecuteReport}
              className="px-5 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Publicar Urgência (🔴)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
