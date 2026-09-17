import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { InteractiveMap } from './components/InteractiveMap';
import { PointsList } from './components/PointsList';
import { CheckInModal } from './components/CheckInModal';
import { UrgencyModal } from './components/UrgencyModal';
import { NewPointModal } from './components/NewPointModal';
import { JsonInspectorModal } from './components/JsonInspectorModal';
import { ApiConsole } from './components/ApiConsole';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OficinaCasinhas } from './components/OficinaCasinhas';
import { INITIAL_PONTOS_CASINHAS, DEFAULT_USER_LOCATION } from './data/initialData';
import {
  INITIAL_MATERIAIS_ESTOQUE,
  INITIAL_PREVISOES_CASINHAS,
  META_CASINHAS_JOAO_PESSOA
} from './data/oficinaData';
import {
  PontoCasinha,
  GPSCoords,
  LogAcao,
  ApiResponse,
  MaterialEstoque,
  PrevisaoCasinhaBairro,
  StatusFabricacaoCasinha,
  DoacaoMaterialPayload
} from './types';
import { applyTTLLogic, processCheckIn } from './utils/engine';
import { formatDateTime } from './utils/geo';
import {
  Search,
  SlidersHorizontal,
  X,
  Bell,
  Sparkles,
  Info,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Hammer,
  ArrowRight
} from 'lucide-react';

export default function App() {
  // Estado do Banco de Dados
  const [pontos, setPontos] = useState<PontoCasinha[]>(INITIAL_PONTOS_CASINHAS);
  
  // Estado de Geolocalização do Usuário (Anti-Fraude GPS)
  const [userCoords, setUserCoords] = useState<GPSCoords>({
    latitude: DEFAULT_USER_LOCATION.latitude,
    longitude: DEFAULT_USER_LOCATION.longitude,
    accuracy: 10,
  });
  const [gpsMode, setGpsMode] = useState<'real' | 'simulated'>('simulated');

  // Relógio do Sistema & Simulação de TTL (48 horas)
  const [currentSimulatedTime, setCurrentSimulatedTime] = useState<Date>(new Date());
  const [ttlChangesCount, setTtlChangesCount] = useState<number>(0);
  const [bannerNotice, setBannerNotice] = useState<{
    tipo: 'sucesso' | 'aviso' | 'erro';
    mensagem: string;
  } | null>(null);

  // Histórico de transações / Logs de auditoria (João Pessoa - PB)
  const [logs, setLogs] = useState<LogAcao[]>([
    {
      id: 'init_log_1',
      ponto_id: 1,
      nome_ponto: 'Casinha do Parque da Lagoa (Centro)',
      acao: 'Check-in presencial com abastecimento',
      timestamp: formatDateTime(new Date(Date.now() - 3.5 * 3600 * 1000)),
      distancia_metros: 18.4,
      status_anterior: '🟡 Amarelo',
      status_novo: '🟢 Verde',
    },
    {
      id: 'init_log_2',
      ponto_id: 3,
      nome_ponto: 'Ponto de Apoio Parque Parahyba (Praia do Bessa)',
      acao: 'Varredura automática TTL (>48h sem check-in)',
      timestamp: formatDateTime(new Date(Date.now() - 1.2 * 3600 * 1000)),
      status_anterior: '🟢 Verde',
      status_novo: '🟡 Amarelo',
    },
  ]);

  // Filtros e Seleção
  const [activeTab, setActiveTab] = useState<'painel' | 'oficina' | 'api'>('painel');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPontoId, setSelectedPontoId] = useState<number | null>(null);

  // Estado da Oficina Comunitária de Fabricação de Casinhas (João Pessoa - PB)
  const [materiais, setMateriais] = useState<MaterialEstoque[]>(INITIAL_MATERIAIS_ESTOQUE);
  const [previsoesCasinhas, setPrevisoesCasinhas] = useState<PrevisaoCasinhaBairro[]>(INITIAL_PREVISOES_CASINHAS);

  // Modais
  const [checkInTarget, setCheckInTarget] = useState<PontoCasinha | null>(null);
  const [urgencyTarget, setUrgencyTarget] = useState<PontoCasinha | null>(null);
  const [inspectJsonTarget, setInspectJsonTarget] = useState<PontoCasinha | null>(null);
  const [isNewPointModalOpen, setIsNewPointModalOpen] = useState<boolean>(false);

  // Efeito para obter GPS Real do dispositivo quando solicitado
  useEffect(() => {
    if (gpsMode === 'real' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setBannerNotice({
            tipo: 'sucesso',
            mensagem: `GPS real conectado: [${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}] com precisão de ${Math.round(position.coords.accuracy)}m.`,
          });
        },
        (error) => {
          setGpsMode('simulated');
          setBannerNotice({
            tipo: 'aviso',
            mensagem: `Permissão de GPS negada ou indisponível (${error.message}). Retornando ao modo Simulador interativo.`,
          });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [gpsMode]);

  // Executa varredura de TTL (Regra de 48h)
  const handleRunTTLScan = () => {
    const { pontosAtualizados, alteracoes } = applyTTLLogic(pontos, currentSimulatedTime);
    setPontos(pontosAtualizados);
    setTtlChangesCount(alteracoes.length);

    if (alteracoes.length > 0) {
      const novalog: LogAcao = {
        id: `ttl_scan_${Date.now()}`,
        ponto_id: alteracoes[0].id,
        nome_ponto: alteracoes.map((a) => a.nome_ponto).join(', '),
        acao: `Varredura TTL: ${alteracoes.length} ponto(s) transitaram para 🟡 Amarelo (>48h)`,
        timestamp: formatDateTime(currentSimulatedTime),
        status_anterior: '🟢 Verde',
        status_novo: '🟡 Amarelo',
      };
      setLogs((prev) => [novalog, ...prev]);

      setBannerNotice({
        tipo: 'aviso',
        mensagem: `Varredura de TTL executada: ${alteracoes.length} ponto(s) ultrapassaram o limite de 48h sem check-in e foram atualizados para 🟡 Amarelo.`,
      });
    } else {
      setBannerNotice({
        tipo: 'sucesso',
        mensagem: 'Varredura de TTL concluída: Todos os pontos verdes estão dentro da janela de 48 horas.',
      });
    }
  };

  // Avança o relógio do sistema para simular a passagem de tempo do TTL
  const handleAdvanceHours = (hours: number) => {
    const newDate = new Date(currentSimulatedTime.getTime() + hours * 3600 * 1000);
    setCurrentSimulatedTime(newDate);

    // Imediatamente aplica a regra de TTL com a nova hora
    const { pontosAtualizados, alteracoes } = applyTTLLogic(pontos, newDate);
    setPontos(pontosAtualizados);

    if (alteracoes.length > 0) {
      setBannerNotice({
        tipo: 'aviso',
        mensagem: `Relógio avançado em +${hours}h: ${alteracoes.length} casinha(s) ultrapassaram 48h de inatividade e entraram em 🟡 Amarelo!`,
      });
    } else {
      setBannerNotice({
        tipo: 'sucesso',
        mensagem: `Relógio avançado em +${hours}h com sucesso. Hora simulada: ${formatDateTime(newDate)}`,
      });
    }
  };

  const handleResetTime = () => {
    const freshNow = new Date();
    setCurrentSimulatedTime(freshNow);
    setBannerNotice({
      tipo: 'sucesso',
      mensagem: `Relógio do sistema sincronizado com a data/hora atual: ${formatDateTime(freshNow)}`,
    });
  };

  // Teletransporta o usuário para próximo ou longe de uma casinha
  const handleTeleport = (ponto: PontoCasinha, distanceOffsetMeters: number = 15) => {
    // 1 metro ~ 0.00000898 graus de latitude
    const offset = distanceOffsetMeters * 0.00000898;
    setUserCoords({
      latitude: ponto.latitude + offset,
      longitude: ponto.longitude,
      accuracy: 5,
    });
    setSelectedPontoId(ponto.id);
    setBannerNotice({
      tipo: 'sucesso',
      mensagem: `GPS simulado posicionado a ~${distanceOffsetMeters}m de '${ponto.nome_ponto}'. Raio <50m satisfeito!`,
    });
  };

  // Sucesso de Check-in / Atendimento com Foto em Tempo Real
  const handleCheckInSuccess = (updatedPonto: PontoCasinha, apiResponse: ApiResponse<PontoCasinha>) => {
    const previousPonto = pontos.find((p) => p.id === updatedPonto.id);
    const wasVermelho = previousPonto?.status === '🔴 Vermelho';

    setPontos((prev) => prev.map((p) => (p.id === updatedPonto.id ? updatedPonto : p)));
    setCheckInTarget(null);

    const logItem: LogAcao = {
      id: `checkin_${Date.now()}`,
      ponto_id: updatedPonto.id,
      nome_ponto: updatedPonto.nome_ponto,
      acao: updatedPonto.ultimo_atendimento_tipo === 'reparo_vandalismo'
        ? 'Reparo de danos/vandalismo concluído com foto da câmera (<50m)'
        : 'Atendimento presencial comprovado com foto da câmera (<50m)',
      timestamp: apiResponse.timestamp,
      distancia_metros: apiResponse.erro ? undefined : 14.2,
      status_anterior: wasVermelho ? '🔴 Vermelho' : '🟡 Amarelo',
      status_novo: '🟢 Verde',
      foto_anexada: true,
    };
    setLogs((prev) => [logItem, ...prev]);

    setBannerNotice({
      tipo: 'sucesso',
      mensagem: wasVermelho
        ? `✅ Reparo de vandalismo e urgência concluídos em '${updatedPonto.nome_ponto}' com foto da câmera ao vivo! Status restaurado para 🟢 Verde.`
        : `✅ Atendimento confirmado no ponto '${updatedPonto.nome_ponto}' com foto em tempo real da câmera! Status atualizado para 🟢 Verde.`,
    });
  };

  // Sucesso de Reporte de Urgência
  const handleUrgencySuccess = (
    updatedPonto: PontoCasinha,
    apiResponse: ApiResponse<PontoCasinha>,
    whatsappLink?: string
  ) => {
    setPontos((prev) => prev.map((p) => (p.id === updatedPonto.id ? updatedPonto : p)));
    setUrgencyTarget(null);

    const logItem: LogAcao = {
      id: `urgencia_${Date.now()}`,
      ponto_id: updatedPonto.id,
      nome_ponto: updatedPonto.nome_ponto,
      acao: `Alerta de Urgência com Foto: ${updatedPonto.motivo_urgencia || 'Dano físico'}`,
      timestamp: apiResponse.timestamp,
      status_anterior: '🟢 Verde',
      status_novo: '🔴 Vermelho',
      foto_anexada: true,
    };
    setLogs((prev) => [logItem, ...prev]);

    setBannerNotice({
      tipo: 'erro',
      mensagem: `🚨 Alerta de Urgência publicado para '${updatedPonto.nome_ponto}'! Evidência visual arquivada e canal SOS WhatsApp ativado.`,
    });
  };

  // Adiciona novo ponto ao banco de dados
  const handleAddPoint = (novoPonto: PontoCasinha) => {
    setPontos((prev) => [...prev, novoPonto]);
    setBannerNotice({
      tipo: 'sucesso',
      mensagem: `Novo ponto '${novoPonto.nome_ponto}' registrado no banco de dados com ID #${novoPonto.id}!`,
    });
  };

  // Testador simulado do console API
  const handleSimulateApiCheckIn = (
    pontoId: number,
    simulatedDistanceMeters: number,
    withPhoto: boolean = true
  ) => {
    const ponto = pontos.find((p) => p.id === pontoId) || pontos[0];
    if (!ponto) return;

    // Calcula coordenadas para dar a distância exata
    const offset = simulatedDistanceMeters * 0.00000898;
    const testCoords = {
      latitude: ponto.latitude + offset,
      longitude: ponto.longitude,
    };

    const res = processCheckIn(
      ponto,
      {
        ponto_id: ponto.id,
        tipo_acao: ponto.status === '🔴 Vermelho' ? 'reparo_vandalismo' : 'abastecimento',
        user_latitude: testCoords.latitude,
        user_longitude: testCoords.longitude,
        foto_comprovante_camera: withPhoto
          ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23059669"/><text x="20" y="50" fill="white" font-size="16">FOTO AO VIVO CAMERA TESTE</text></svg>'
          : '',
        foto_timestamp: formatDateTime(currentSimulatedTime),
      },
      currentSimulatedTime
    );

    if (res.success && res.updatedCasinha) {
      setPontos((prev) => prev.map((p) => (p.id === res.updatedCasinha!.id ? res.updatedCasinha! : p)));
      if (res.log) setLogs((prev) => [res.log!, ...prev]);
      setBannerNotice({
        tipo: 'sucesso',
        mensagem: `Simulação API: Atendimento a ${simulatedDistanceMeters}m com foto da câmera aprovado (HTTP 200). Status atualizado para 🟢 Verde.`,
      });
    } else {
      const errDetail =
        res.response.erro?.codigo === 'PHOTO_EVIDENCE_REQUIRED'
          ? 'PHOTO_EVIDENCE_REQUIRED (Foto da câmera em tempo real obrigatória)'
          : 'GPS_OUT_OF_RANGE (Distância excedeu 50m)';
      setBannerNotice({
        tipo: 'erro',
        mensagem: `Simulação API: Operação rejeitada (${errDetail} - HTTP ${res.response.codigo_status}).`,
      });
    }
  };

  // Handlers da Oficina de Casinhas (João Pessoa - PB)
  const handleAdicionarDoacao = (payload: DoacaoMaterialPayload) => {
    const matAlvo = materiais.find((m) => m.id === payload.material_id);
    const nomeMaterial = matAlvo?.nome || 'Insumo';
    const unidade = matAlvo?.unidade || 'un';

    setMateriais((prev) =>
      prev.map((m) => {
        if (m.id === payload.material_id) {
          return {
            ...m,
            quantidade_atual: Number((m.quantidade_atual + payload.quantidade).toFixed(1)),
            ultimo_doador: payload.doador_nome,
          };
        }
        return m;
      })
    );

    const novoLog: LogAcao = {
      id: `doacao_${Date.now()}`,
      ponto_id: 0,
      nome_ponto: 'Oficina Central (João Pessoa)',
      acao: `Entrada de doação: +${payload.quantidade} ${unidade} de ${nomeMaterial} (${payload.doador_nome})`,
      timestamp: formatDateTime(currentSimulatedTime),
      status_anterior: '🟢 Verde',
      status_novo: '🟢 Verde',
    };
    setLogs((prev) => [novoLog, ...prev]);

    setBannerNotice({
      tipo: 'sucesso',
      mensagem: `Doação registrada com sucesso! Adicionado +${payload.quantidade} ${unidade} de ${nomeMaterial} ao estoque comunitário (Doador: ${payload.doador_nome}).`,
    });
  };

  const handleConcluirFabricacao = (
    previsaoId: string,
    voluntarioNome: string,
    observacao: string
  ) => {
    // 1. Deduzir insumos necessários do estoque
    setMateriais((prev) =>
      prev.map((m) => ({
        ...m,
        quantidade_atual: Math.max(
          0,
          Number((m.quantidade_atual - m.consumo_por_casinha).toFixed(1))
        ),
      }))
    );

    // 2. Atualizar status da casinha para 'pronta'
    let casinhaNome = '';
    setPrevisoesCasinhas((prev) =>
      prev.map((cas) => {
        if (cas.id === previsaoId) {
          casinhaNome = `Casinha #${cas.numero_casinha} (${cas.bairro})`;
          return {
            ...cas,
            status: 'pronta',
            voluntario_responsavel: voluntarioNome,
            data_fabricacao: formatDateTime(currentSimulatedTime).split(' ')[0],
            observacao: observacao || cas.observacao,
          };
        }
        return cas;
      })
    );

    const novoLog: LogAcao = {
      id: `fabricar_${Date.now()}`,
      ponto_id: 0,
      nome_ponto: 'Oficina Central (João Pessoa)',
      acao: `Montagem concluída: ${casinhaNome} pronta para instalação! Responsável: ${voluntarioNome}. Insumos deduzidos do estoque.`,
      timestamp: formatDateTime(currentSimulatedTime),
      status_anterior: '🟢 Verde',
      status_novo: '🟢 Verde',
    };
    setLogs((prev) => [novoLog, ...prev]);

    setBannerNotice({
      tipo: 'sucesso',
      mensagem: `Parabéns! ${casinhaNome} foi finalizada com sucesso pelos voluntários e está pronta para transporte e instalação nos bairros de João Pessoa!`,
    });
  };

  const handleAtualizarStatusCasinha = (
    previsaoId: string,
    novoStatus: StatusFabricacaoCasinha
  ) => {
    let casinhaNome = '';
    setPrevisoesCasinhas((prev) =>
      prev.map((cas) => {
        if (cas.id === previsaoId) {
          casinhaNome = `Casinha #${cas.numero_casinha} (${cas.bairro})`;
          return { ...cas, status: novoStatus };
        }
        return cas;
      })
    );

    const labelStatus = {
      planejada: 'Planejada',
      em_montagem: 'Em Montagem na Oficina',
      pronta: 'Pronta para Instalação',
      instalada: 'Instalada no Bairro',
    }[novoStatus];

    const novoLog: LogAcao = {
      id: `status_casinha_${Date.now()}`,
      ponto_id: 0,
      nome_ponto: 'Oficina Central (João Pessoa)',
      acao: `Status de casinha atualizado: ${casinhaNome} alterada para [${labelStatus}]`,
      timestamp: formatDateTime(currentSimulatedTime),
      status_anterior: '🟢 Verde',
      status_novo: '🟢 Verde',
    };
    setLogs((prev) => [novoLog, ...prev]);

    setBannerNotice({
      tipo: 'sucesso',
      mensagem: `Status de ${casinhaNome} atualizado para "${labelStatus}".`,
    });
  };

  // Filtragem e busca
  const filteredPontos = pontos.filter((p) => {
    const matchesFilter = activeFilter ? p.status === activeFilter : true;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.nome_ponto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.apoiador_logotipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toString() === searchQuery.trim();

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Top Header & System Time & GPS Engine Controls */}
      <Header
        currentSimulatedTime={currentSimulatedTime}
        onAdvanceHours={handleAdvanceHours}
        onResetTime={handleResetTime}
        onRunTTLScan={handleRunTTLScan}
        ttlChangesCount={ttlChangesCount}
        userCoords={userCoords}
        gpsMode={gpsMode}
        onToggleGpsMode={(mode) => setGpsMode(mode)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewPointModal={() => setIsNewPointModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Banner de Notificação de Ações / Regras do Motor */}
        {bannerNotice && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-150 ${
              bannerNotice.tipo === 'sucesso'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : bannerNotice.tipo === 'aviso'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-medium">
              {bannerNotice.tipo === 'sucesso' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {bannerNotice.tipo === 'aviso' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
              {bannerNotice.tipo === 'erro' && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
              <span>{bannerNotice.mensagem}</span>
            </div>
            <button
              onClick={() => setBannerNotice(null)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TAB 1: Painel Operacional */}
        {activeTab === 'painel' && (
          <>
            {/* Banner de Contexto João Pessoa: Pontos de Comida instalados vs Fabricação de Casinhas */}
            <div className="bg-linear-to-r from-emerald-900 to-teal-950 text-white rounded-2xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 border border-emerald-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Hammer className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      João Pessoa: {pontos.length} Pontos de Água e Comida Instalados
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950">
                      Fase 2: Fabricação das Casinhas
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    Os comedouros estão ativos. Acesse a Oficina para acompanhar o estoque de materiais, ver o que está faltando para construir as casinhas e gerenciar o plano de distribuição.
                  </p>
                </div>
              </div>
              <button
                id="btn-goto-oficina-banner"
                onClick={() => setActiveTab('oficina')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 shadow-xs cursor-pointer"
              >
                <span>Acessar Oficina de Casinhas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Stats & Quick Semáforo Filters */}
            <StatsBar
              pontos={pontos}
              activeFilter={activeFilter}
              onFilterStatus={setActiveFilter}
            />

            {/* Interactive Geospatial Radar & Anti-fraud Map */}
            <InteractiveMap
              pontos={filteredPontos}
              userCoords={userCoords}
              onSetUserCoords={setUserCoords}
              selectedPontoId={selectedPontoId}
              onSelectPonto={(id) => setSelectedPontoId(id)}
              onOpenCheckIn={(ponto) => setCheckInTarget(ponto)}
              onOpenUrgency={(ponto) => setUrgencyTarget(ponto)}
            />

            {/* Search & Active Filters Toolbar */}
            <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome, apoiador ou ID..."
                  className="w-full pl-9 pr-8 py-2 text-xs border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                {activeFilter && (
                  <button
                    onClick={() => setActiveFilter(null)}
                    className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <span>Filtro: {activeFilter}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                <span className="text-xs text-stone-700">
                  Mostrando <strong>{filteredPontos.length}</strong> de {pontos.length} pontos
                </span>
              </div>
            </div>

            {/* Points List */}
            <PointsList
              pontos={filteredPontos}
              userCoords={userCoords}
              currentSimulatedTime={currentSimulatedTime}
              onOpenCheckIn={(ponto) => setCheckInTarget(ponto)}
              onOpenUrgency={(ponto) => setUrgencyTarget(ponto)}
              onSelectPonto={(id) => setSelectedPontoId(id)}
              selectedPontoId={selectedPontoId}
              onTeleportToPonto={(ponto, offset) => handleTeleport(ponto, offset)}
              onInspectJson={(ponto) => setInspectJsonTarget(ponto)}
            />
          </>
        )}

        {/* TAB 2: Oficina Comunitária de Fabricação de Casinhas (João Pessoa) */}
        {activeTab === 'oficina' && (
          <OficinaCasinhas
            materiais={materiais}
            previsoes={previsoesCasinhas}
            metaCasinhas={META_CASINHAS_JOAO_PESSOA}
            onAdicionarDoacao={handleAdicionarDoacao}
            onConcluirFabricacao={handleConcluirFabricacao}
            onAtualizarStatusCasinha={handleAtualizarStatusCasinha}
          />
        )}

        {/* TAB 3: Console API & JSON Estrito */}
        {activeTab === 'api' && (
          <ApiConsole
            pontos={pontos}
            logs={logs}
            userCoords={userCoords}
            currentSimulatedTime={currentSimulatedTime}
            onRunTTLScan={handleRunTTLScan}
            onSimulateCheckInApi={handleSimulateApiCheckIn}
          />
        )}

      </main>

      {/* Modais do Sistema */}
      <CheckInModal
        ponto={checkInTarget}
        userCoords={userCoords}
        currentSimulatedTime={currentSimulatedTime}
        onClose={() => setCheckInTarget(null)}
        onSuccess={handleCheckInSuccess}
        onSetUserCoords={setUserCoords}
      />

      <UrgencyModal
        ponto={urgencyTarget}
        currentSimulatedTime={currentSimulatedTime}
        onClose={() => setUrgencyTarget(null)}
        onSuccess={handleUrgencySuccess}
      />

      <NewPointModal
        isOpen={isNewPointModalOpen}
        onClose={() => setIsNewPointModalOpen(false)}
        onAddPoint={handleAddPoint}
        userCoords={userCoords}
        nextId={pontos.length > 0 ? Math.max(...pontos.map((p) => p.id)) + 1 : 1}
      />

      <JsonInspectorModal
        ponto={inspectJsonTarget}
        onClose={() => setInspectJsonTarget(null)}
      />

      {/* Offline Status Warning & Cache Banner */}
      <OfflineIndicator />

      {/* Simple Footer */}
      <footer className="mt-12 py-6 border-t border-stone-200 bg-white text-center text-xs text-stone-700">
        <p className="font-medium text-stone-800">
          Padrinhos de Rua • Motor de Lógica e Banco de Dados Central
        </p>
        <p className="text-[11px] text-stone-700 mt-1">
          Validação Anti-Fraude GPS (&lt;50m) • Lógica de TTL (48 horas) • Validação de Evidência Fotográfica • Despacho WhatsApp SOS
        </p>
      </footer>

    </div>
  );
}
