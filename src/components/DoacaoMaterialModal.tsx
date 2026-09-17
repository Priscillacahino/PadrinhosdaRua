import React, { useState } from 'react';
import { X, PackagePlus, CheckCircle2, AlertTriangle, User, HeartHandshake } from 'lucide-react';
import { MaterialEstoque, DoacaoMaterialPayload } from '../types';

interface DoacaoMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiais: MaterialEstoque[];
  onConfirmarDoacao: (payload: DoacaoMaterialPayload) => void;
  materialPreselecionadoId?: string;
}

export const DoacaoMaterialModal: React.FC<DoacaoMaterialModalProps> = ({
  isOpen,
  onClose,
  materiais,
  onConfirmarDoacao,
  materialPreselecionadoId,
}) => {
  const [materialId, setMaterialId] = useState<string>(
    materialPreselecionadoId || materiais[0]?.id || ''
  );
  const [quantidade, setQuantidade] = useState<number>(1);
  const [doadorNome, setDoadorNome] = useState<string>('');
  const [observacao, setObservacao] = useState<string>('');
  const [erro, setErro] = useState<string | null>(null);

  if (!isOpen) return null;

  const materialSelecionado = materiais.find((m) => m.id === materialId) || materiais[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialId) {
      setErro('Selecione o material que foi doado.');
      return;
    }
    if (quantidade <= 0) {
      setErro('A quantidade deve ser maior que zero.');
      return;
    }
    if (!doadorNome.trim()) {
      setErro('Informe o nome do doador, empresa parceira ou voluntário.');
      return;
    }

    onConfirmarDoacao({
      material_id: materialId,
      quantidade: Number(quantidade),
      doador_nome: doadorNome.trim(),
      observacao: observacao.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-stone-200 shadow-2xl animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-linear-to-r from-emerald-700 to-teal-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <PackagePlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Oficina de Casinhas JP
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Registrar Doação de Material
              </h3>
            </div>
          </div>
          <p className="text-xs text-emerald-100/90 mt-2">
            Adicione ao estoque comunitário os insumos arrecadados para a fabricação das casinhas em João Pessoa.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Seleção do Material */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Material Insumo *
            </label>
            <select
              id="select-doacao-material"
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-stone-800"
            >
              {materiais.map((mat) => (
                <option key={mat.id} value={mat.id}>
                  {mat.nome} (Estoque atual: {mat.quantidade_atual} {mat.unidade})
                </option>
              ))}
            </select>
            {materialSelecionado && (
              <p className="text-[11px] text-stone-500 mt-1">
                {materialSelecionado.descricao} (Consumo: {materialSelecionado.consumo_por_casinha} {materialSelecionado.unidade} por casinha)
              </p>
            )}
          </div>

          {/* Quantidade Doada */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Quantidade Doada *
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="input-doacao-qtd"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-stone-800"
                />
                <span className="text-xs font-medium text-stone-600 shrink-0">
                  {materialSelecionado?.unidade}
                </span>
              </div>
            </div>

            {/* Quick buttons */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Ajuste Rápido
              </label>
              <div className="flex items-center gap-1.5 pt-0.5">
                {[1, 2, 5, 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuantidade(val)}
                    className="flex-1 py-1.5 text-xs font-bold bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-700 border border-stone-200 rounded-lg transition-colors cursor-pointer"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Doador / Empresa Parceira */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Nome do Doador / Empresa Parceira *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-doacao-doador"
                type="text"
                placeholder="Ex: Pet Shop Tambaú, Depósito Epitácio ou Voluntário João"
                value={doadorNome}
                onChange={(e) => setDoadorNome(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Observações / Local de Entrega */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Observação / Ponto de Coleta em João Pessoa (Opcional)
            </label>
            <input
              id="input-doacao-obs"
              type="text"
              placeholder="Ex: Entregue no galpão de apoio da UFPB ou retirado no Centro"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Impacto da Doação */}
          {materialSelecionado && quantidade > 0 && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
              <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Impacto na Linha de Produção:</span>
                <span className="text-[11px] text-emerald-800">
                  Com essa doação, o estoque deste item passa para{' '}
                  <strong>{(materialSelecionado.quantidade_atual + quantidade).toFixed(1)} {materialSelecionado.unidade}</strong>,
                  suficiente para montar até{' '}
                  <strong>{Math.floor((materialSelecionado.quantidade_atual + quantidade) / materialSelecionado.consumo_por_casinha)}</strong> casinhas comunitárias.
                </span>
              </div>
            </div>
          )}

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
              id="submit-doacao-btn"
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Entrada no Estoque</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
