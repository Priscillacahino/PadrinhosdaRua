import React, { useState } from 'react';
import {
  Hammer,
  Package,
  PackagePlus,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Share2,
  MapPin,
  TrendingUp,
  Clock,
  Sparkles,
  Info,
  Wrench,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Layers,
  HeartHandshake
} from 'lucide-react';
import {
  MaterialEstoque,
  PrevisaoCasinhaBairro,
  StatusFabricacaoCasinha,
  CategoriaMaterial,
  DoacaoMaterialPayload
} from '../types';
import { calcularDiagnosticoProducao, gerarTextoCampanhaDoacaoWhatsApp } from '../utils/oficina';
import { DoacaoMaterialModal } from './DoacaoMaterialModal';
import { FabricarCasinhaModal } from './FabricarCasinhaModal';

interface OficinaCasinhasProps {
  materiais: MaterialEstoque[];
  previsoes: PrevisaoCasinhaBairro[];
  metaCasinhas: number;
  onAdicionarDoacao: (payload: DoacaoMaterialPayload) => void;
  onConcluirFabricacao: (
    previsaoId: string,
    voluntarioNome: string,
    observacao: string
  ) => void;
  onAtualizarStatusCasinha: (
    previsaoId: string,
    novoStatus: StatusFabricacaoCasinha
  ) => void;
}

export const OficinaCasinhas: React.FC<OficinaCasinhasProps> = ({
  materiais,
  previsoes,
  metaCasinhas,
  onAdicionarDoacao,
  onConcluirFabricacao,
  onAtualizarStatusCasinha,
}) => {
  // Sub-abas da Oficina
  const [subTab, setSubTab] = useState<'estoque' | 'distribuicao' | 'guia'>('estoque');

  // Filtros
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [buscaBairro, setBuscaBairro] = useState<string>('');

  // Modais
  const [isDoacaoModalOpen, setIsDoacaoModalOpen] = useState(false);
  const [doacaoPreselecionadaId, setDoacaoPreselecionadaId] = useState<string | undefined>(undefined);
  const [isFabricarModalOpen, setIsFabricarModalOpen] = useState(false);
  const [copiadoWhatsapp, setCopiadoWhatsapp] = useState(false);

  // Cálculos do motor de estoque e diagnóstico
  const diagnostico = calcularDiagnosticoProducao(materiais, metaCasinhas);
  const casinhasProntas = previsoes.filter((p) => p.status === 'pronta').length;
  const casinhasEmMontagem = previsoes.filter((p) => p.status === 'em_montagem').length;
  const casinhasInstaladas = previsoes.filter((p) => p.status === 'instalada').length;
  const casinhasPlanejadas = previsoes.filter((p) => p.status === 'planejada').length;

  // Compartilhamento no WhatsApp
  const handleShareWhatsApp = () => {
    const texto = gerarTextoCampanhaDoacaoWhatsApp(
      materiais,
      metaCasinhas,
      diagnostico.capacidadeAtualCasinhas,
      casinhasProntas + casinhasEmMontagem
    );

    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto);
      setCopiadoWhatsapp(true);
      setTimeout(() => setCopiadoWhatsapp(false), 3000);
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  // Filtragem de materiais
  const materiaisFiltrados = materiais.filter((m) => {
    if (categoriaFiltro === 'todas') return true;
    return m.categoria === categoriaFiltro;
  });

  // Filtragem de casinhas previstas por bairro
  const previsoesFiltradas = previsoes.filter((p) => {
    const matchStatus = statusFiltro === 'todos' || p.status === statusFiltro;
    const matchBusca =
      buscaBairro.trim() === '' ||
      p.bairro.toLowerCase().includes(buscaBairro.toLowerCase()) ||
      p.local_referencia.toLowerCase().includes(buscaBairro.toLowerCase()) ||
      p.numero_casinha.toString() === buscaBairro.trim();
    return matchStatus && matchBusca;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Banner de Contexto Regional de João Pessoa */}
      <div className="bg-linear-to-r from-emerald-800 via-teal-800 to-stone-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 uppercase tracking-wide">
              Plano de Expansão Comunitária • João Pessoa (PB)
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/10 text-white border border-white/20">
              Oficina & Estoque de Casinhas
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Fabricação e Distribuição das Casinhas de Proteção
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
            Em João Pessoa, os pontos de <strong>água e comida já estão instalados e ativos</strong>. Esta oficina organiza a construção física dos abrigos impermeáveis contra chuva torrencial e sol forte, gerencia o estoque de materiais doados e monitora a meta de distribuição nos bairros da capital paraibana.
          </p>

          {/* Quick CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <button
              id="btn-open-doacao-modal"
              onClick={() => {
                setDoacaoPreselecionadaId(undefined);
                setIsDoacaoModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <PackagePlus className="w-4 h-4" />
              <span>Registrar Doação de Material</span>
            </button>

            <button
              id="btn-open-fabricar-modal"
              onClick={() => setIsFabricarModalOpen(true)}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/30 backdrop-blur-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Hammer className="w-4 h-4 text-emerald-300" />
              <span>Concluir Montagem de 1 Casinha</span>
            </button>

            <button
              id="btn-share-whatsapp-oficina"
              onClick={handleShareWhatsApp}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Compartilhar lista de materiais faltantes nos grupos de voluntários"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiadoWhatsapp ? 'Lista Copiada!' : 'Pedir Insumos no WhatsApp'}</span>
            </button>
          </div>
        </div>

        {/* Decorative Watermark */}
        <Hammer className="w-64 h-64 text-white/5 absolute -right-12 -bottom-12 pointer-events-none" />
      </div>

      {/* KPI Cards: Diagnóstico de Produção & Estoque */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Meta Total João Pessoa */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Meta Prevista (JP)</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900">{metaCasinhas}</span>
            <span className="text-xs text-stone-500">casinhas</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-600 flex items-center gap-1">
            <span className="font-semibold text-emerald-700">{casinhasProntas + casinhasInstaladas} concluídas</span>
            <span>({Math.round(((casinhasProntas + casinhasInstaladas) / metaCasinhas) * 100)}% da meta)</span>
          </div>
        </div>

        {/* Capacidade Imediata com Estoque Atual */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Produção Imediata</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">
              {diagnostico.capacidadeAtualCasinhas}
            </span>
            <span className="text-xs text-stone-500">casinhas completas</span>
          </div>
          <p className="mt-2 text-[11px] text-stone-600">
            Possíveis de montar <strong>agora</strong> com o estoque disponível.
          </p>
        </div>

        {/* Item Gargalo do Estoque */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Gargalo da Linha</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1">
            <span className="text-sm font-bold text-stone-900 block truncate" title={diagnostico.itemGargalo?.nome}>
              {diagnostico.itemGargalo?.nome || 'Estoque Equilibrado'}
            </span>
            <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">
              {diagnostico.itemGargalo
                ? `Resta apenas ${diagnostico.itemGargalo.quantidade_atual} ${diagnostico.itemGargalo.unidade}`
                : 'Sem restrição imediata'}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-stone-500 truncate">
            Insumo que mais limita novas montagens
          </p>
        </div>

        {/* Casinhas no Pipeline */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Status do Parque</span>
            <Hammer className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-1.5 grid grid-cols-3 gap-1 text-center">
            <div className="p-1 rounded bg-stone-50 border border-stone-200">
              <span className="text-xs font-black text-amber-700 block">{casinhasEmMontagem}</span>
              <span className="text-[9px] text-stone-500 uppercase">Montando</span>
            </div>
            <div className="p-1 rounded bg-stone-50 border border-stone-200">
              <span className="text-xs font-black text-emerald-700 block">{casinhasProntas}</span>
              <span className="text-[9px] text-stone-500 uppercase">Prontas</span>
            </div>
            <div className="p-1 rounded bg-stone-50 border border-stone-200">
              <span className="text-xs font-black text-blue-700 block">{casinhasPlanejadas}</span>
              <span className="text-[9px] text-stone-500 uppercase">A Fazer</span>
            </div>
          </div>
        </div>

      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-stone-200 p-1.5 shadow-xs flex items-center gap-1">
        <button
          id="subtab-estoque-btn"
          onClick={() => setSubTab('estoque')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'estoque'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Controle de Estoque & O Que Está Faltando</span>
        </button>

        <button
          id="subtab-distribuicao-btn"
          onClick={() => setSubTab('distribuicao')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'distribuicao'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Distribuição Prevista nos Bairros (JP)</span>
        </button>

        <button
          id="subtab-guia-btn"
          onClick={() => setSubTab('guia')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'guia'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Manual de Montagem dos Voluntários</span>
        </button>
      </div>

      {/* VISTA 1: CONTROLE DE ESTOQUE & DÉFICIT DE MATERIAIS */}
      {subTab === 'estoque' && (
        <div className="space-y-4">
          
          {/* Toolbar de Categorias */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-stone-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Categoria:
              </span>
              {[
                { id: 'todas', label: 'Todas as Peças' },
                { id: 'estrutura', label: 'Estrutura & Casco' },
                { id: 'alimentacao', label: 'Alimentação & Tubos PVC' },
                { id: 'fixacao', label: 'Fixação Inox' },
                { id: 'acabamento', label: 'Acabamento & Proteção' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaFiltro(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    categoriaFiltro === cat.id
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setDoacaoPreselecionadaId(undefined);
                setIsDoacaoModalOpen(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ml-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Doação</span>
            </button>
          </div>

          {/* Cards de Insumos com Barra de Arrecadação e Déficit */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {diagnostico.resumoDeficit
              .filter(
                (item) =>
                  categoriaFiltro === 'todas' ||
                  item.material.categoria === categoriaFiltro
              )
              .map(({ material, necessarioTotal, disponivelEstoque, faltaQuantidade, percentualAtendido }) => {
                const isGargalo = diagnostico.itemGargalo?.id === material.id;
                const emFaltaCritica = faltaQuantidade > 0;

                return (
                  <div
                    key={material.id}
                    className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all hover:border-emerald-300 ${
                      isGargalo
                        ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-300'
                        : 'border-stone-200'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                          {material.categoria}
                        </span>

                        {isGargalo ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Gargalo Atual
                          </span>
                        ) : emFaltaCritica ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                            Falta para a Meta
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Estoque Suficiente
                          </span>
                        )}
                      </div>

                      {/* Material Name */}
                      <h4 className="text-sm font-bold text-stone-900 leading-snug">
                        {material.nome}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                        {material.descricao}
                      </p>

                      {/* Números: Estoque vs Necessário */}
                      <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200 grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <span className="text-[10px] text-stone-500 block uppercase">No Estoque</span>
                          <span className="font-bold text-stone-900 font-mono text-sm">
                            {disponivelEstoque}
                          </span>
                          <span className="text-[10px] text-stone-500 block">{material.unidade}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-stone-500 block uppercase">Por Casinha</span>
                          <span className="font-bold text-stone-700 font-mono text-sm">
                            {material.consumo_por_casinha}
                          </span>
                          <span className="text-[10px] text-stone-500 block">{material.unidade}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-red-600 block uppercase font-semibold">Falta (Déficit)</span>
                          <span className={`font-bold font-mono text-sm ${faltaQuantidade > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {faltaQuantidade > 0 ? `-${faltaQuantidade}` : '0'}
                          </span>
                          <span className="text-[10px] text-stone-500 block">{material.unidade}</span>
                        </div>
                      </div>

                      {/* Barra de Progresso de Arrecadação */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] text-stone-600 mb-1">
                          <span>Arrecadação para {metaCasinhas} casinhas:</span>
                          <span className="font-bold font-mono">{percentualAtendido}%</span>
                        </div>
                        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              percentualAtendido >= 100
                                ? 'bg-emerald-500'
                                : percentualAtendido >= 50
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${percentualAtendido}%` }}
                          />
                        </div>
                      </div>

                      {/* Último doador */}
                      {material.ultimo_doador && (
                        <div className="mt-2.5 text-[10px] text-stone-500 truncate flex items-center gap-1">
                          <HeartHandshake className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Último apoio: <strong>{material.ultimo_doador}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Ação rápida de doação */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setDoacaoPreselecionadaId(material.id);
                          setIsDoacaoModalOpen(true);
                        }}
                        className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                        <span>Registrar Doação</span>
                      </button>

                      <button
                        onClick={() => {
                          onAdicionarDoacao({
                            material_id: material.id,
                            quantidade: 1,
                            doador_nome: 'Doação rápida balcão JP',
                          });
                        }}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="Adicionar +1 unidade rápida ao estoque"
                      >
                        +1
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

        </div>
      )}

      {/* VISTA 2: DISTRIBUIÇÃO PREVISTA NOS BAIRROS DE JOÃO PESSOA */}
      {subTab === 'distribuicao' && (
        <div className="space-y-4">
          
          {/* Barra de Filtro e Busca de Bairros */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por bairro (Tambaú, Bessa, UFPB, etc.)..."
                value={buscaBairro}
                onChange={(e) => setBuscaBairro(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 flex-wrap w-full sm:w-auto">
              {[
                { id: 'todos', label: 'Todas as Casinhas' },
                { id: 'planejada', label: 'Planejadas' },
                { id: 'em_montagem', label: 'Em Montagem' },
                { id: 'pronta', label: 'Prontas p/ Envio' },
                { id: 'instalada', label: 'Já Instaladas' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFiltro(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    statusFiltro === st.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Casinhas Previstas por Bairro */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {previsoesFiltradas.map((casinha) => {
              const statusConfig = {
                planejada: {
                  bg: 'bg-stone-50 border-stone-200 text-stone-700',
                  badge: 'bg-stone-100 text-stone-800 border-stone-300',
                  label: 'Planejada / Aguardando Insumos',
                },
                em_montagem: {
                  bg: 'bg-amber-50/40 border-amber-200 text-amber-900',
                  badge: 'bg-amber-100 text-amber-900 border-amber-300',
                  label: 'Em Fabricação na Oficina',
                },
                pronta: {
                  bg: 'bg-emerald-50/40 border-emerald-200 text-emerald-900',
                  badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                  label: 'Pronta p/ Instalação no Ponto',
                },
                instalada: {
                  bg: 'bg-blue-50/40 border-blue-200 text-blue-900',
                  badge: 'bg-blue-100 text-blue-900 border-blue-300',
                  label: 'Instalada & Em Operação',
                },
              }[casinha.status];

              return (
                <div
                  key={casinha.id}
                  className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all ${
                    casinha.status === 'pronta' ? 'ring-1 ring-emerald-300' : ''
                  }`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 bg-stone-100 text-stone-800 rounded-md">
                        Casinha #{casinha.numero_casinha}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.badge}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Bairro & Local */}
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{casinha.bairro}</span>
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5 pl-5">
                      {casinha.local_referencia}
                    </p>

                    {/* Info Ponto Existente */}
                    {casinha.ponto_id && (
                      <div className="mt-2.5 p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          Integrada ao <strong>Ponto #{casinha.ponto_id}</strong> (Comida e água já funcionando)
                        </span>
                      </div>
                    )}

                    {/* Voluntário & Previsão */}
                    <div className="mt-3 space-y-1 text-xs text-stone-600">
                      {casinha.voluntario_responsavel && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-stone-500">Voluntário/Padrinho:</span>
                          <span className="font-semibold text-stone-800">{casinha.voluntario_responsavel}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-500">Cronograma:</span>
                        <span className="font-mono text-stone-700">{casinha.previsao_instalacao}</span>
                      </div>
                    </div>

                    {casinha.observacao && (
                      <p className="mt-2 text-[10px] text-stone-500 italic bg-stone-50 p-2 rounded-lg">
                        "{casinha.observacao}"
                      </p>
                    )}
                  </div>

                  {/* Transição de Status */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5">
                    {casinha.status === 'planejada' && (
                      <button
                        onClick={() => onAtualizarStatusCasinha(casinha.id, 'em_montagem')}
                        className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Iniciar Montagem
                      </button>
                    )}

                    {casinha.status === 'em_montagem' && (
                      <button
                        onClick={() => onAtualizarStatusCasinha(casinha.id, 'pronta')}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Finalizar Casinha</span>
                      </button>
                    )}

                    {casinha.status === 'pronta' && (
                      <button
                        onClick={() => onAtualizarStatusCasinha(casinha.id, 'instalada')}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Confirmar Instalação no Bairro</span>
                      </button>
                    )}

                    {casinha.status === 'instalada' && (
                      <span className="flex-1 py-1.5 text-center text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl">
                        Casinha Ativa no Ponto
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VISTA 3: MANUAL E FICHA TÉCNICA DE MONTAGEM */}
      {subTab === 'guia' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6">
          <div className="max-w-3xl">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Ficha Técnica Sustentável
            </span>
            <h3 className="text-lg font-bold text-stone-900 mt-1">
              Guia Prático dos Voluntários: Como Construir a Casinha Comunitária
            </h3>
            <p className="text-xs text-stone-600 mt-1">
              Manual elaborado para que qualquer grupo de voluntários de João Pessoa consiga montar uma casinha durável, térmica e segura para animais comunitários.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Passo 1 */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="text-xs font-bold text-stone-900">
                Higienização & Recorte Seguro
              </h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Lave a bombona de 200L com água e sabão neutro. Marque a entrada oval a pelo menos 15cm do chão (para impedir entrada de enxurrada e poças de chuva). Lixe as bordas cortadas para não machucar os animais.
              </p>
            </div>

            {/* Passo 2 */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="text-xs font-bold text-stone-900">
                Dispensadores PVC Antiformiga
              </h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Fixe internamente os dois tubos PVC de 100mm (um para ração seca e outro para água potável) com braçadeiras de aço e joelhos de 90°. A curva voltada para cima impede que a chuva molhe a ração.
              </p>
            </div>

            {/* Passo 3 */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="text-xs font-bold text-stone-900">
                Isolamento Térmico & Pintura Anti-UV
              </h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Instale o estrado plástico térmico no piso interno. Aplique a aba superior protetora contra sol forte e pinte o exterior com esmalte ecológico reflexivo para suportar o calor do clima de João Pessoa.
              </p>
            </div>

          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Ponto de Atenção em João Pessoa:</span>
              <p className="text-[11px] text-emerald-900 mt-0.5 leading-relaxed">
                Devido à maresia constante nas áreas costeiras (Tambaú, Cabo Branco, Manaíra, Bessa), <strong>utilize apenas parafusos e arruelas de aço inoxidável</strong>. Parafusos comuns oxidam em menos de 3 meses na orla de JP.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Modais da Oficina */}
      <DoacaoMaterialModal
        isOpen={isDoacaoModalOpen}
        onClose={() => setIsDoacaoModalOpen(false)}
        materiais={materiais}
        onConfirmarDoacao={onAdicionarDoacao}
        materialPreselecionadoId={doacaoPreselecionadaId}
      />

      <FabricarCasinhaModal
        isOpen={isFabricarModalOpen}
        onClose={() => setIsFabricarModalOpen(false)}
        materiais={materiais}
        previsoes={previsoes}
        onConfirmarFabricacao={onConcluirFabricacao}
      />

    </div>
  );
};
