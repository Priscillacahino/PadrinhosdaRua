import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Hammer,
  HeartHandshake,
  Home,
  Map,
  MapPin,
  PackagePlus,
  PawPrint,
  Search,
  User,
  Utensils,
  Wrench,
} from 'lucide-react';
import {
  INITIAL_MATERIAIS_ESTOQUE,
  INITIAL_PREVISOES_CASINHAS,
  META_CASINHAS_JOAO_PESSOA,
} from './data/oficinaData';

type Tab = 'inicio' | 'mapa' | 'oficina' | 'estoque' | 'perfil';
type Material = (typeof INITIAL_MATERIAIS_ESTOQUE)[number];

type Point = {
  id: number;
  nome: string;
  bairro: string;
  distancia: string;
  comida: 'ok' | 'atenÃ§Ã£o';
  agua: 'ok' | 'atenÃ§Ã£o';
  casinha: 'instalada' | 'planejada' | 'em montagem';
};

const POINTS: Point[] = [
  { id: 1, nome: 'Parque da Lagoa', bairro: 'Centro', distancia: '1,2 km', comida: 'ok', agua: 'ok', casinha: 'planejada' },
  { id: 2, nome: 'Orla de TambaÃº', bairro: 'TambaÃº', distancia: '3,8 km', comida: 'ok', agua: 'ok', casinha: 'instalada' },
  { id: 3, nome: 'Parque Parahyba I', bairro: 'Bessa', distancia: '6,4 km', comida: 'atenÃ§Ã£o', agua: 'ok', casinha: 'em montagem' },
  { id: 4, nome: 'Campus I - UFPB', bairro: 'Castelo Branco', distancia: '3,2 km', comida: 'ok', agua: 'atenÃ§Ã£o', casinha: 'planejada' },
  { id: 5, nome: 'PraÃ§a do Coqueiral', bairro: 'Mangabeira', distancia: '6,1 km', comida: 'ok', agua: 'ok', casinha: 'planejada' },
  { id: 6, nome: 'PraÃ§a Silvio Porto', bairro: 'ManaÃ­ra', distancia: '3,7 km', comida: 'ok', agua: 'ok', casinha: 'instalada' },
];

function App() {
  const [tab, setTab] = useState<Tab>('inicio');
  const [query, setQuery] = useState('');
  const [materiais, setMateriais] = useState(INITIAL_MATERIAIS_ESTOQUE);
  const [casinhas, setCasinhas] = useState(INITIAL_PREVISOES_CASINHAS);
  const [toast, setToast] = useState<string | null>(null);

  const stats = useMemo(() => {
    const instaladas = casinhas.filter(c => c.status === 'instalada').length;
    const prontas = casinhas.filter(c => c.status === 'pronta').length;
    const montagem = casinhas.filter(c => c.status === 'em_montagem').length;
    const faltando = materiais.filter(m => m.quantidade_atual < m.consumo_por_casinha * META_CASINHAS_JOAO_PESSOA).length;
    const capacidade = Math.max(0, Math.min(...materiais.map(m => Math.floor(m.quantidade_atual / m.consumo_por_casinha))));
    return { instaladas, prontas, montagem, faltando, capacidade };
  }, [casinhas, materiais]);

  const filteredPoints = POINTS.filter(p => `${p.nome} ${p.bairro}`.toLowerCase().includes(query.toLowerCase()));

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  };

  const registerDonation = (material: Material) => {
    setMateriais(prev => prev.map(m => m.id === material.id ? { ...m, quantidade_atual: m.quantidade_atual + 1, ultimo_doador: 'DoaÃ§Ã£o comunitÃ¡ria' } : m));
    notify(`DoaÃ§Ã£o registrada: +1 ${material.unidade} de ${material.nome}.`);
  };

  const startNextHouse = () => {
    const next = casinhas.find(c => c.status === 'planejada');
    if (!next) return notify('As 10 casinhas jÃ¡ estÃ£o em andamento ou concluÃ­das.');
    if (stats.capacidade < 1) return notify('Ainda faltam materiais para iniciar uma nova casinha.');
    setCasinhas(prev => prev.map(c => c.id === next.id ? { ...c, status: 'em_montagem', voluntario_responsavel: 'VoluntÃ¡rio(a) da comunidade' } : c));
    setMateriais(prev => prev.map(m => ({ ...m, quantidade_atual: Math.max(0, m.quantidade_atual - m.consumo_por_casinha) })));
    notify(`Casinha #${next.numero_casinha} iniciada. Materiais reservados no estoque.`);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 pb-24">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white"><PawPrint size={22}/></div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-black text-emerald-950">Padrinhos de Rua</h1>
            <p className="text-xs text-slate-500">Projeto-piloto â€¢ JoÃ£o Pessoa - PB</p>
          </div>
          <div className="rounded-xl bg-orange-50 px-2.5 py-1.5 text-right">
            <div className="text-[10px] font-bold uppercase tracking-wide text-orange-700">Meta inicial</div>
            <div className="text-sm font-black text-orange-800">10 casinhas</div>
          </div>
        </div>
      </header>

      {toast && <div className="fixed left-1/2 top-20 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-white shadow-xl">{toast}</div>}

      <main className="mx-auto max-w-md space-y-4 px-4 py-4">
        {tab === 'inicio' && (
          <>
            <section className="rounded-3xl bg-gradient-to-br from-emerald-800 to-teal-950 p-5 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Fase inicial</p>
              <h2 className="mt-1 text-3xl font-black">10 casinhas comunitÃ¡rias</h2>
              <p className="mt-2 text-sm leading-relaxed text-emerald-50">Ãgua e comida jÃ¡ possuem pontos ativos. Agora o foco Ã© construir abrigos simples com participaÃ§Ã£o da comunidade.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => setTab('mapa')} className="rounded-2xl bg-white px-3 py-3 text-left text-emerald-950"><MapPin className="mb-1" size={20}/><span className="text-sm font-black">Ver pontos</span></button>
                <button onClick={() => setTab('oficina')} className="rounded-2xl bg-orange-500 px-3 py-3 text-left text-white"><Hammer className="mb-1" size={20}/><span className="text-sm font-black">Fazer uma casinha</span></button>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <Kpi label="Instaladas" value={stats.instaladas} icon={<CheckCircle2/>}/>
              <Kpi label="Em montagem" value={stats.montagem} icon={<Hammer/>}/>
              <Kpi label="Prontas" value={stats.prontas} icon={<Home/>}/>
              <Kpi label="Itens faltando" value={stats.faltando} icon={<Boxes/>}/>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
              <h3 className="font-black text-slate-900">Como ajudar agora</h3>
              <div className="mt-3 space-y-2">
                <Action title="Abastecer Ã¡gua ou comida" subtitle="Atualize um ponto prÃ³ximo" icon={<HeartHandshake/>} onClick={() => setTab('mapa')}/>
                <Action title="Doar materiais" subtitle="Veja exatamente o que estÃ¡ faltando" icon={<PackagePlus/>} onClick={() => setTab('estoque')}/>
                <Action title="Participar da montagem" subtitle="Guia simples para voluntÃ¡rios" icon={<Wrench/>} onClick={() => setTab('oficina')}/>
              </div>
            </section>
          </>
        )}

        {tab === 'mapa' && (
          <>
            <section>
              <h2 className="text-2xl font-black text-emerald-950">Mapa de pontos</h2>
              <p className="text-sm text-slate-500">Pontos comunitÃ¡rios de Ã¡gua, comida e abrigo.</p>
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2.5 shadow-sm"><Search size={18} className="text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por bairro ou ponto" className="w-full bg-transparent text-sm outline-none"/></div>
            </section>
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 via-emerald-100 to-blue-100 text-center text-sm font-semibold text-slate-600"><Map className="mr-2"/> Ãrea do mapa interativo<br/>com geolocalizaÃ§Ã£o</div>
            </div>
            <section className="space-y-2">
              {filteredPoints.map(p => <PointCard key={p.id} point={p} onReport={() => notify(`Alerta do ponto â€œ${p.nome}â€ preparado para envio.`)}/>) }
            </section>
          </>
        )}

        {tab === 'oficina' && (
          <>
            <section className="rounded-3xl bg-emerald-950 p-5 text-white">
              <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-widest text-emerald-300">Oficina comunitÃ¡ria</p><h2 className="text-2xl font-black">Quero fazer uma casinha</h2></div><Hammer size={34} className="text-orange-400"/></div>
              <p className="mt-2 text-sm text-emerald-100">Modelo bÃ¡sico, fÃ¡cil de reproduzir e pensado para mutirÃµes comunitÃ¡rios.</p>
            </section>
            <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
              <h3 className="font-black">Passo a passo simples</h3>
              <div className="mt-3 space-y-3">
                <Step n="1" title="Planejar" text="Escolha uma das 10 casinhas previstas e confirme o local autorizado."/>
                <Step n="2" title="Separar materiais" text="Madeira/pallet, cobertura, parafusos, pÃ©s e piso lavÃ¡vel."/>
                <Step n="3" title="Montar" text="Base elevada, paredes, entrada ampla e telhado inclinado com beiral."/>
                <Step n="4" title="Registrar" text="Informe a conclusÃ£o para atualizar estoque e distribuiÃ§Ã£o."/>
              </div>
              <button onClick={startNextHouse} className="mt-4 w-full rounded-2xl bg-orange-500 px-4 py-3 font-black text-white">Quero iniciar uma montagem</button>
            </section>
            <section className="rounded-3xl border border-stone-200 bg-white p-4">
              <h3 className="font-black">As 10 casinhas</h3>
              <div className="mt-3 space-y-2">{casinhas.map(c => <div key={c.id} className="flex items-center justify-between rounded-2xl bg-stone-50 p-3"><div><div className="text-sm font-bold">#{c.numero_casinha} â€¢ {c.bairro}</div><div className="text-xs text-slate-500">{c.local_referencia}</div></div><StatusBadge status={c.status}/></div>)}</div>
            </section>
          </>
        )}

        {tab === 'estoque' && (
          <>
            <section><h2 className="text-2xl font-black text-emerald-950">Estoque de materiais</h2><p className="text-sm text-slate-500">Controle simples: temos, precisamos e o que ainda falta.</p></section>
            <section className="grid grid-cols-3 gap-2">
              <Mini label="Meta" value="10"/>
              <Mini label="MontÃ¡veis agora" value={String(stats.capacidade)}/>
              <Mini label="Itens faltando" value={String(stats.faltando)}/>
            </section>
            <section className="space-y-2">
              {materiais.map(m => {
                const necessario = m.consumo_por_casinha * META_CASINHAS_JOAO_PESSOA;
                const falta = Math.max(0, necessario - m.quantidade_atual);
                const pct = Math.min(100, Math.round((m.quantidade_atual / necessario) * 100));
                return <div key={m.id} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex justify-between gap-3"><div><h3 className="text-sm font-black">{m.nome}</h3><p className="text-xs text-slate-500">{m.quantidade_atual} {m.unidade} disponÃ­veis â€¢ meta: {necessario}</p></div><span className={`h-fit rounded-full px-2.5 py-1 text-xs font-bold ${falta ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{falta ? `Faltam ${falta}` : 'Completo'}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-emerald-600" style={{width: `${pct}%`}}/></div><button onClick={() => registerDonation(m)} className="mt-3 text-xs font-black text-emerald-700">+ Registrar 1 {m.unidade} doado</button></div>
              })}
            </section>
          </>
        )}

        {tab === 'perfil' && (
          <>
            <section className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-100 p-5">
              <div className="flex items-center gap-3"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-800"><User size={30}/></div><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Perfil</p><h2 className="text-xl font-black">VoluntÃ¡rio(a)</h2><p className="text-sm text-slate-600">JoÃ£o Pessoa - PB</p></div></div>
            </section>
            <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
              <h3 className="font-black">Minhas contribuiÃ§Ãµes</h3>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center"><Mini label="Pontos" value="2"/><Mini label="DoaÃ§Ãµes" value="1"/><Mini label="Montagens" value="1"/></div>
              <p className="mt-4 text-sm text-slate-500">Nesta fase piloto, o perfil Ã© propositalmente simples. O foco Ã© facilitar a participaÃ§Ã£o, nÃ£o criar uma rede social complexa.</p>
            </section>
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-5 px-2 py-2">
          <NavItem active={tab==='inicio'} icon={<Home/>} label="InÃ­cio" onClick={() => setTab('inicio')}/>
          <NavItem active={tab==='mapa'} icon={<Map/>} label="Mapa" onClick={() => setTab('mapa')}/>
          <NavItem active={tab==='oficina'} icon={<Hammer/>} label="Oficina" onClick={() => setTab('oficina')}/>
          <NavItem active={tab==='estoque'} icon={<Boxes/>} label="Estoque" onClick={() => setTab('estoque')}/>
          <NavItem active={tab==='perfil'} icon={<User/>} label="Perfil" onClick={() => setTab('perfil')}/>
        </div>
      </nav>
    </div>
  );
}

function Kpi({label, value, icon}:{label:string;value:number;icon:React.ReactElement}) { return <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><div className="mb-2 text-emerald-700">{icon}</div><div className="text-2xl font-black">{value}</div><div className="text-xs font-semibold text-slate-500">{label}</div></div> }
function Mini({label,value}:{label:string;value:string}) { return <div className="rounded-2xl bg-stone-50 p-3"><div className="text-xl font-black text-emerald-950">{value}</div><div className="text-[11px] font-semibold text-slate-500">{label}</div></div> }
function Action({title,subtitle,icon,onClick}:{title:string;subtitle:string;icon:React.ReactElement;onClick:()=>void}) { return <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl bg-stone-50 p-3 text-left"><div className="text-emerald-700">{icon}</div><div className="flex-1"><div className="text-sm font-black">{title}</div><div className="text-xs text-slate-500">{subtitle}</div></div><ChevronRight size={18}/></button> }
function Step({n,title,text}:{n:string;title:string;text:string}) { return <div className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-black text-white">{n}</div><div><div className="text-sm font-black">{title}</div><p className="text-xs leading-relaxed text-slate-500">{text}</p></div></div> }
function StatusBadge({status}:{status:string}) { const cls = status==='instalada'?'bg-emerald-100 text-emerald-800':status==='pronta'?'bg-blue-100 text-blue-800':status==='em_montagem'?'bg-amber-100 text-amber-800':'bg-stone-200 text-stone-700'; return <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${cls}`}>{status.replace('_',' ')}</span> }
function PointCard({point,onReport}:{point:Point;onReport:()=>void; key?: React.Key}) { return <article className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{point.nome}</h3><p className="text-xs text-slate-500">{point.bairro} â€¢ {point.distancia}</p></div><MapPin className="text-emerald-700" size={20}/></div><div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]"><div className="rounded-xl bg-orange-50 p-2"><Utensils size={15} className="mx-auto mb-1 text-orange-600"/>Comida {point.comida}</div><div className="rounded-xl bg-sky-50 p-2"><Droplets size={15} className="mx-auto mb-1 text-sky-600"/>Ãgua {point.agua}</div><div className="rounded-xl bg-emerald-50 p-2"><Home size={15} className="mx-auto mb-1 text-emerald-700"/>{point.casinha}</div></div><button onClick={onReport} className="mt-3 flex items-center gap-2 text-xs font-black text-red-700"><AlertTriangle size={15}/>Reportar problema</button></article> }
function NavItem({active,icon,label,onClick}:{active:boolean;icon:React.ReactElement;label:string;onClick:()=>void}) { return <button onClick={onClick} className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold ${active?'text-emerald-700':'text-slate-500'}`}>{React.cloneElement(icon,{size:20} as any)}<span>{label}</span></button> }

export default App;



