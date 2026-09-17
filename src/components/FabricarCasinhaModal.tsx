import React, { useState } from 'react';
import {
  X,
  Hammer,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  ArrowRight,
  ShieldCheck,
  User,
  MapPin
} from 'lucide-react';
import { MaterialEstoque, PrevisaoCasinhaBairro } from '../types';

interface FabricarCasinhaModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiais: MaterialEstoque[];
  previsoes: PrevisaoCasinhaBairro[];
  onConfirmarFabricacao: (
    previsaoId: string,
    voluntarioNome: string,
    observacao: string
  ) => void;
}

export const FabricarCasinhaModal: React.FC<FabricarCasinhaModalProps> = ({
  isOpen,
  onClose,
  materiais,
  previsoes,
  onConfirmarFabricacao,
}) => {
  // Casinhas elegíveis para montagem (planejadas ou em montagem)
  const casinhasDisponiveis = previsoes.filter(
    (p) => p.status === 'planejada' || p.status === 'em_montagem'
  );

  const [previsaoId, setPrevisaoId] = useState<string>(
    casinhasDisponiveis[0]?.id || ''
  );
  const [voluntarioNome, setVoluntarioNome] = useState<string>('');
  const [observacao, setObservacao] = useState<string>('');
  const [erro, setErro] = useState<string | null>(null);

  if (!isOpen) return null;

  // Checagem de disponibilidade de insumos para fabricar 1 casinha completa
  const checagemInsumos = materiais.map((m) => {
    const temEstoqueSuficiente = m.quantidade_atual >= m.consumo_por_casinha;
    return {
      material: m,
      temSuficiente: temEstoqueSuficiente,
      falta: Math.max(0, m.consumo_por_casinha - m.quantidade_atual),
    };
  });

  const insumosFaltando = checagemInsumos.filter((c) => !c.temSuficiente);
  const podeFabricar = insumosFaltando.length === 0;

  const casinhaAlvo = previsoes.find((p) => p.id === previsaoId);

  const handleFabricar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podeFabricar) {
      setErro('Não há materiais suficientes no estoque para concluir 1 casinha.');
      return;
    }
    if (!previsaoId) {
      setErro('Selecione a casinha / bairro de João Pessoa.');
      return;
    }
    if (!voluntarioNome.trim()) {
      setErro('Informe o nome do voluntário ou equipe responsável pela montagem.');
      return;
    }

    onConfirmarFabricacao(previsaoId, voluntarioNome.trim(), observacao.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-stone-200 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-linear-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Oficina de Fabricação JP
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Concluir Montagem de 1 Casinha
              </h3>
            </div>
          </div>
          <p className="text-xs text-emerald-100/90 mt-2">
            Ao confirmar a montagem, o sistema deduz automaticamente o kit de materiais do estoque e atualiza a casinha para o status <strong>Pronta para Instalação</strong>.
          </p>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleFabricar} className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Validação de Insumos / BOM da Casinha */}
          <div className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-emerald-600" />
                Kit de Insumos Necessários (Consumo Unitário)
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  podeFabricar
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                {podeFabricar ? '✅ Estoque Suficiente' : '❌ Falta Insumo'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
              {checagemInsumos.map(({ material, temSuficiente }) => (
                <div
                  key={material.id}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-1.5 ${
                    temSuficiente
                      ? 'bg-white border-stone-200 text-stone-800'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  <span className="truncate">{material.nome}</span>
                  <span
                    className={`font-mono font-bold shrink-0 text-[10px] ${
                      temSuficiente ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    -{material.consumo_por_casinha} ({material.quantidade_atual})
                  </span>
                </div>
              ))}
            </div>

            {!podeFabricar && (
              <div className="p-2.5 bg-red-100/70 rounded-xl text-[11px] text-red-900 flex items-start gap-1.5 mt-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Atenção:</strong> Faltam materiais no estoque ({insumosFaltando.map((i) => i.material.nome).join(', ')}). Registre doações primeiro para liberar a montagem.
                </span>
              </div>
            )}
          </div>

          {/* Selecionar a Casinha do Plano João Pessoa */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Casinha / Bairro de Destino em João Pessoa *
            </label>
            <select
              id="select-casinha-fabricacao"
              value={previsaoId}
              onChange={(e) => setPrevisaoId(e.target.value)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-stone-800"
            >
              {casinhasDisponiveis.map((cas) => (
                <option key={cas.id} value={cas.id}>
                  Casinha #{cas.numero_casinha} - {cas.bairro} ({cas.local_referencia}) [{cas.status === 'em_montagem' ? 'Em Montagem' : 'Planejada'}]
                </option>
              ))}
            </select>
            {casinhaAlvo && (
              <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>
                  {casinhaAlvo.ponto_id
                    ? `Integrada ao ponto existente #${casinhaAlvo.ponto_id} de alimentação/água.`
                    : 'Nova expansão territorial no bairro.'}
                </span>
              </p>
            )}
          </div>

          {/* Voluntário / Equipe Responsável */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Voluntário(a) / Equipe que Realizou a Montagem *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-voluntario-montagem"
                type="text"
                placeholder="Ex: Matheus, Carla e Grupo de Voluntários do Bessa"
                value={voluntarioNome}
                onChange={(e) => setVoluntarioNome(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Observações da Fabricação */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Detalhes da Montagem / Local onde ficou guardada (Opcional)
            </label>
            <textarea
              rows={2}
              id="input-obs-montagem"
              placeholder="Ex: Concluída com adesivo oficial Padrinhos de Rua, guardada no galpão de apoio da UFPB pronta para envio."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="submit-fabricar-btn"
              type="submit"
              disabled={!podeFabricar}
              className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer ${
                podeFabricar
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluir Fabricação & Deduzir Estoque</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
