import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Droplets,
  FlaskConical,
  Hammer,
  HeartHandshake,
  Home,
  Info,
  Map,
  MapPin,
  PackagePlus,
  PawPrint,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
  Utensils,
  Wrench,
} from 'lucide-react';
import {
  CASINHAS_INSTALADAS_REAIS,
  INITIAL_MATERIAIS_ESTOQUE,
  INITIAL_PREVISOES_CASINHAS,
  META_CASINHAS_JOAO_PESSOA,
} from './data/oficinaData';
import type { MaterialEstoque, PrevisaoCasinhaBairro, StatusFabricacaoCasinha } from './types';

type Tab = 'inicio' | 'mapa' | 'oficina' | 'estoque' | 'perfil';
type PontoDemo = {
  id: number;
  nome: string;
  bairro: string;
  comida: 'ok' | 'atenção';
  agua: 'ok' | 'atenção';
  casinha: 'planejada';
};

const PONTOS_DEMONSTRATIVOS: PontoDemo[] = [
  { id: 1, nome: 'Ponto demonstrativo - Centro', bairro: 'Centro', comida: 'ok', agua: 'ok', casinha: 'planejada' },
  { id: 2, nome: 'Ponto demonstrativo - Tambaú', bairro: 'Tambaú', comida: 'ok', agua: 'atenção', casinha: 'planejada' },
  { id: 3, nome: 'Ponto demonstrativo - Bessa', bairro: 'Bessa', comida: 'atenção', agua: 'ok', casinha: 'planejada' },
  { id: 4, nome: 'Ponto demonstrativo - Castelo Branco', bairro: 'Castelo Branco', comida: 'ok', agua: 'ok', casinha: 'planejada' },
];

const DEMO_STORAGE_KEY = 'padrinhos-de-rua-demo-v1';

type DemoPersistido = {
  materiais: MaterialEstoque[];
  casinhas: PrevisaoCasinhaBairro[];
};

function carregarDemoLocal(): DemoPersistido | null {
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DemoPersistido>;
    if (!Array.isArray(parsed.materiais) || !Array.isArray(parsed.casinhas)) return null;
    return { materiais: parsed.materiais, casinhas: parsed.casinhas };
  } catch {
    return null;
  }
}

const statusLabel: Record<StatusFabricacaoCasinha, string> = {
  planejada: 'planejada',
  em_montagem_demo: 'simulação: em montagem',
  pronta_demo: 'simulação: pronta',
  instalada_real: 'instalada - validação real',
};

function App() {
  const [tab, setTab] = useState<Tab>('inicio');
  const [query, setQuery] = useState('');
  const demoInicial = useMemo(() => carregarDemoLocal(), []);
  const [materiais, setMateriais] = useState<MaterialEstoque[]>(demoInicial?.materiais ?? INITIAL_MATERIAIS_ESTOQUE);
  const [casinhas, setCasinhas] = useState<PrevisaoCasinhaBairro[]>(demoInicial?.casinhas ?? INITIAL_PREVISOES_CASINHAS);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify({ materiais, casinhas }));
    } catch {
      // A aplicação continua funcional mesmo se o navegador bloquear armazenamento local.
    }
  }, [materiais, casinhas]);

  const stats = useMemo(() => {
    const simulacaoMontagem = casinhas.filter((c) => c.status === 'em_montagem_demo').length;
    const simulacaoProntas = casinhas.filter((c) => c.status === 'pronta_demo').length;
    const faltando = materiais.filter(
      (m) => m.quantidade_atual < m.consumo_por_casinha * META_CASINHAS_JOAO_PESSOA,
    ).length;
    const capacidadeDemo = Math.max(
      0,
      Math.min(...materiais.map((m) => Math.floor(m.quantidade_atual / m.consumo_por_casinha))),
    );
    return { simulacaoMontagem, simulacaoProntas, faltando, capacidadeDemo };
  }, [casinhas, materiais]);

  const filteredPoints = PONTOS_DEMONSTRATIVOS.filter((p) =>
    `${p.nome} ${p.bairro}`.toLowerCase().includes(query.toLowerCase()),
  );

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  };

  const registerDonationDemo = (material: MaterialEstoque) => {
    setMateriais((previous) =>
      previous.map((m) =>
        m.id === material.id ? { ...m, quantidade_atual: m.quantidade_atual + 1 } : m,
      ),
    );
    notify(`Simulação atualizada: +1 ${material.unidade} de ${material.nome}.`);
  };

  const startNextHouseDemo = () => {
    const next = casinhas.find((c) => c.status === 'planejada');
    if (!next) return notify('Todas as 10 casinhas já foram usadas na simulação.');
    if (stats.capacidadeDemo < 1) return notify('Na simulação, ainda faltam materiais para iniciar outra casinha.');

    setCasinhas((previous) =>
      previous.map((c) => (c.id === next.id ? { ...c, status: 'em_montagem_demo' } : c)),
    );
    setMateriais((previous) =>
      previous.map((m) => ({
        ...m,
        quantidade_atual: Math.max(0, m.quantidade_atual - m.consumo_por_casinha),
      })),
    );
    notify(`Simulação: casinha #${next.numero_casinha} passou para “em montagem”. Nenhuma ação física foi registrada.`);
  };

  const resetDemo = () => {
    setMateriais(INITIAL_MATERIAIS_ESTOQUE);
    setCasinhas(INITIAL_PREVISOES_CASINHAS);
    try { window.localStorage.removeItem(DEMO_STORAGE_KEY); } catch { /* sem impacto no MVP */ }
    notify('Dados demonstrativos restaurados.');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white">
            <PawPrint size={22} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-black text-emerald-950">Padrinhos de Rua</h1>
            <p className="text-xs text-slate-500">MVP acadêmico • João Pessoa - PB</p>
          </div>
          <div className="rounded-xl bg-orange-50 px-2.5 py-1.5 text-right">
            <div className="text-[10px] font-bold uppercase tracking-wide text-orange-700">Meta piloto</div>
            <div className="text-sm font-black text-orange-800">até 10 casinhas</div>
          </div>
        </div>
      </header>

      {toast && (
        <div role="status" className="fixed left-1/2 top-20 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      <main className="mx-auto max-w-md space-y-4 px-4 py-4">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-950">
          <div className="flex gap-2">
            <FlaskConical className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
            <div>
              <p className="text-xs font-black uppercase tracking-wide">Modo demonstrativo</p>
              <p className="mt-1 text-xs leading-relaxed">
                Nenhuma casinha está instalada. Locais, estoque e movimentações desta versão servem para demonstrar o funcionamento do MVP até que existam validação de campo, materiais e autorizações. As alterações da simulação ficam salvas apenas neste navegador.
              </p>
            </div>
          </div>
        </section>

        {tab === 'inicio' && (
          <>
            <section className="rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-950 p-5 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Fase atual</p>
              <h2 className="mt-1 text-3xl font-black">Planejamento do piloto</h2>
              <p className="mt-2 text-sm leading-relaxed text-emerald-50">
                O projeto prepara uma rede comunitária para acompanhar pontos de água, alimento e futuros abrigos, sem apresentar planejamento como implantação já realizada.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => setTab('mapa')} className="rounded-2xl bg-white px-3 py-3 text-left text-emerald-950">
                  <MapPin className="mb-1" size={20} aria-hidden="true" />
                  <span className="text-sm font-black">Ver cenário</span>
                </button>
                <button onClick={() => setTab('oficina')} className="rounded-2xl bg-orange-500 px-3 py-3 text-left text-white">
                  <Hammer className="mb-1" size={20} aria-hidden="true" />
                  <span className="text-sm font-black">Simular oficina</span>
                </button>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <Kpi label="Instaladas de verdade" value={CASINHAS_INSTALADAS_REAIS} icon={<CheckCircle2 />} />
              <Kpi label="Meta planejada" value={META_CASINHAS_JOAO_PESSOA} icon={<Home />} />
              <Kpi label="Em montagem (demo)" value={stats.simulacaoMontagem} icon={<Hammer />} />
              <Kpi label="Itens abaixo da meta (demo)" value={stats.faltando} icon={<Boxes />} />
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
              <h3 className="font-black text-slate-900">Como o projeto pretende ajudar</h3>
              <div className="mt-3 space-y-2">
                <Action title="Organizar necessidades" subtitle="Registrar reposição, limpeza e manutenção" icon={<HeartHandshake />} onClick={() => setTab('mapa')} />
                <Action title="Direcionar materiais" subtitle="Mostrar o que falta para o piloto" icon={<PackagePlus />} onClick={() => setTab('estoque')} />
                <Action title="Planejar a execução" subtitle="Acompanhar as etapas antes da instalação" icon={<Wrench />} onClick={() => setTab('oficina')} />
              </div>
            </section>

            <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex gap-2">
                <ShieldCheck className="mt-0.5 shrink-0 text-emerald-700" size={19} aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-black text-emerald-950">Compromisso de transparência</h3>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-900">
                    O aplicativo diferencia planejamento, demonstração e execução real. Uma casinha só poderá aparecer como instalada quando houver comprovação de campo e autorização do local.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}

        {tab === 'mapa' && (
          <>
            <section>
              <h2 className="text-2xl font-black text-emerald-950">Cenário de pontos</h2>
              <p className="text-sm text-slate-500">Referências demonstrativas para validar o fluxo do aplicativo.</p>
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2.5 shadow-sm">
                <Search size={18} className="text-slate-400" aria-hidden="true" />
                <input aria-label="Buscar ponto demonstrativo" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por bairro" className="w-full bg-transparent text-sm outline-none" />
              </div>
            </section>

            <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 via-emerald-100 to-blue-100 px-4 text-center text-sm font-semibold text-slate-600">
                <Map className="mr-2 shrink-0" aria-hidden="true" />
                Mapa cartográfico real ainda não implementado. Esta área é um marcador de evolução futura.
              </div>
            </section>

            <section className="space-y-2">
              {filteredPoints.map((point) => <PointCard key={point.id} point={point} onReport={() => notify(`Simulação: ocorrência preparada para ${point.bairro}. Nenhum chamado real foi enviado.`)} />)}
            </section>
          </>
        )}

        {tab === 'oficina' && (
          <>
            <section className="rounded-3xl bg-emerald-950 p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-emerald-300">Oficina comunitária</p>
                  <h2 className="text-2xl font-black">Planejamento das casinhas</h2>
                </div>
                <Hammer size={34} className="shrink-0 text-orange-400" aria-hidden="true" />
              </div>
              <p className="mt-2 text-sm text-emerald-100">A simulação serve para validar materiais e fluxo. Não equivale a uma construção física iniciada.</p>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
              <h3 className="font-black">Etapas antes da instalação</h3>
              <div className="mt-3 space-y-3">
                <Step n="1" title="Validar o local" text="Confirmar necessidade, responsável de referência e autorização do espaço." />
                <Step n="2" title="Validar o modelo" text="Definir dimensões, materiais seguros, higienização e proteção climática." />
                <Step n="3" title="Garantir recursos" text="Confirmar materiais, ferramentas, transporte e responsáveis pela manutenção." />
                <Step n="4" title="Executar e registrar" text="Somente depois da implantação física, registrar evidências e mudar o status para instalado." />
              </div>
              <button onClick={startNextHouseDemo} className="mt-4 w-full rounded-2xl bg-orange-500 px-4 py-3 font-black text-white">Simular início de uma montagem</button>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-black">Planejamento das 10 casinhas</h3>
                <button onClick={resetDemo} className="flex items-center gap-1 text-xs font-black text-emerald-700"><RotateCcw size={14} aria-hidden="true" />Reiniciar demo</button>
              </div>
              <div className="mt-3 space-y-2">
                {casinhas.map((casinha) => (
                  <div key={casinha.id} className="rounded-2xl bg-stone-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold">#{casinha.numero_casinha} • {casinha.bairro}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{casinha.local_referencia}</div>
                      </div>
                      <StatusBadge status={casinha.status} />
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{casinha.observacao}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === 'estoque' && (
          <>
            <section>
              <h2 className="text-2xl font-black text-emerald-950">Estoque demonstrativo</h2>
              <p className="text-sm text-slate-500">Cálculo acadêmico para testar necessidade, disponibilidade e déficit.</p>
            </section>

            <section className="grid grid-cols-3 gap-2">
              <Mini label="Meta" value="10" />
              <Mini label="Capacidade demo" value={String(stats.capacidadeDemo)} />
              <Mini label="Itens abaixo da meta" value={String(stats.faltando)} />
            </section>

            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-950">
              <div className="flex gap-2"><Info size={17} className="mt-0.5 shrink-0" aria-hidden="true" /><p>Os números abaixo não representam estoque físico comprovado. Antes do piloto real, cada entrada deverá ter origem, data, quantidade e responsável pela conferência.</p></div>
            </section>

            <section className="space-y-2">
              {materiais.map((material) => {
                const necessario = material.consumo_por_casinha * META_CASINHAS_JOAO_PESSOA;
                const falta = Math.max(0, necessario - material.quantidade_atual);
                const percentual = Math.min(100, Math.round((material.quantidade_atual / necessario) * 100));
                return (
                  <div key={material.id} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black">{material.nome}</h3>
                        <p className="text-xs text-slate-500">{material.quantidade_atual} {material.unidade} na simulação • meta: {necessario}</p>
                      </div>
                      <span className={`h-fit rounded-full px-2.5 py-1 text-xs font-bold ${falta ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{falta ? `Faltam ${falta}` : 'Meta simulada atendida'}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${percentual}%` }} /></div>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{material.descricao}</p>
                    <button onClick={() => registerDonationDemo(material)} className="mt-3 text-xs font-black text-emerald-700">+ Simular entrada de 1 {material.unidade}</button>
                  </div>
                );
              })}
            </section>
          </>
        )}

        {tab === 'perfil' && (
          <>
            <section className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-100 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-800"><User size={30} aria-hidden="true" /></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Perfil demonstrativo</p>
                  <h2 className="text-xl font-black">Voluntário(a)</h2>
                  <p className="text-sm text-slate-600">Sem cadastro pessoal nesta fase</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
              <h3 className="font-black">Resultados reais registrados</h3>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Mini label="Casinhas" value="0" />
                <Mini label="Doações" value="0" />
                <Mini label="Atendimentos" value="0" />
              </div>
              <p className="mt-4 text-sm text-slate-500">Indicadores reais só deverão ser incrementados após atividade de campo comprovada. A interface pode usar dados fictícios apenas quando estiver claramente identificada como demonstração.</p>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex gap-2">
                <CircleHelp size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-black">Próxima validação</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Testar a jornada com voluntários e responsáveis reais, sem coletar dados pessoais além do necessário e sem publicar localização sensível antes de definir regras de acesso.</p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <nav aria-label="Navegação principal" className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-5 px-2 py-2">
          <NavItem active={tab === 'inicio'} icon={<Home />} label="Início" onClick={() => setTab('inicio')} />
          <NavItem active={tab === 'mapa'} icon={<Map />} label="Mapa" onClick={() => setTab('mapa')} />
          <NavItem active={tab === 'oficina'} icon={<Hammer />} label="Oficina" onClick={() => setTab('oficina')} />
          <NavItem active={tab === 'estoque'} icon={<Boxes />} label="Estoque" onClick={() => setTab('estoque')} />
          <NavItem active={tab === 'perfil'} icon={<User />} label="Perfil" onClick={() => setTab('perfil')} />
        </div>
      </nav>
    </div>
  );
}

function Kpi({ label, value, icon }: { label: string; value: number; icon: React.ReactElement }) {
  return <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><div className="mb-2 text-emerald-700">{icon}</div><div className="text-2xl font-black">{value}</div><div className="text-xs font-semibold text-slate-500">{label}</div></div>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-stone-50 p-3"><div className="text-xl font-black text-emerald-950">{value}</div><div className="text-[11px] font-semibold text-slate-500">{label}</div></div>;
}

function Action({ title, subtitle, icon, onClick }: { title: string; subtitle: string; icon: React.ReactElement; onClick: () => void }) {
  return <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-stone-50 p-3 text-left"><div className="text-emerald-700">{icon}</div><div className="flex-1"><div className="text-sm font-black">{title}</div><div className="text-xs text-slate-500">{subtitle}</div></div><ChevronRight size={18} aria-hidden="true" /></button>;
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return <div className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-black text-white">{n}</div><div><div className="text-sm font-black">{title}</div><p className="text-xs leading-relaxed text-slate-500">{text}</p></div></div>;
}

function StatusBadge({ status }: { status: StatusFabricacaoCasinha }) {
  const css = status === 'instalada_real' ? 'bg-emerald-100 text-emerald-800' : status === 'em_montagem_demo' ? 'bg-amber-100 text-amber-800' : status === 'pronta_demo' ? 'bg-blue-100 text-blue-800' : 'bg-stone-200 text-stone-700';
  return <span className={`h-fit rounded-full px-2 py-1 text-[10px] font-bold ${css}`}>{statusLabel[status]}</span>;
}

function PointCard({ point, onReport }: { point: PontoDemo; onReport: () => void }) {
  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{point.nome}</h3><p className="text-xs text-slate-500">{point.bairro} • dado demonstrativo</p></div><MapPin className="text-emerald-700" size={20} aria-hidden="true" /></div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]"><div className="rounded-xl bg-orange-50 p-2"><Utensils size={15} className="mx-auto mb-1 text-orange-600" aria-hidden="true" />Comida {point.comida}</div><div className="rounded-xl bg-sky-50 p-2"><Droplets size={15} className="mx-auto mb-1 text-sky-600" aria-hidden="true" />Água {point.agua}</div><div className="rounded-xl bg-emerald-50 p-2"><Home size={15} className="mx-auto mb-1 text-emerald-700" aria-hidden="true" />Casinha planejada</div></div>
      <button onClick={onReport} className="mt-3 flex items-center gap-2 text-xs font-black text-red-700"><AlertTriangle size={15} aria-hidden="true" />Simular ocorrência</button>
    </article>
  );
}

function NavItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactElement; label: string; onClick: () => void }) {
  return <button aria-current={active ? 'page' : undefined} onClick={onClick} className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold ${active ? 'text-emerald-700' : 'text-slate-500'}`}>{React.cloneElement(icon, { size: 20 } as React.SVGProps<SVGSVGElement>)}<span>{label}</span></button>;
}

export default App;
