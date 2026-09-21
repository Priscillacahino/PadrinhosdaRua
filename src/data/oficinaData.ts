import type { MaterialEstoque, PrevisaoCasinhaBairro } from '../types';

/**
 * Fase piloto acadêmica.
 * Nenhuma casinha possui instalação física confirmada no momento.
 * Os valores de estoque abaixo existem somente para demonstrar o funcionamento da interface.
 */
export const META_CASINHAS_JOAO_PESSOA = 10;
export const CASINHAS_INSTALADAS_REAIS = 0;

export const INITIAL_MATERIAIS_ESTOQUE: MaterialEstoque[] = [
  {
    id: 'madeira_pallet',
    nome: 'Madeira reaproveitada / pallet',
    categoria: 'estrutura',
    quantidade_atual: 6,
    unidade: 'kit',
    consumo_por_casinha: 1,
    descricao: 'Exemplo de material para base, paredes e estrutura. Quantidade demonstrativa.',
    natureza_dado: 'demonstrativo',
  },
  {
    id: 'cobertura',
    nome: 'Cobertura resistente / telha adequada',
    categoria: 'estrutura',
    quantidade_atual: 5,
    unidade: 'un',
    consumo_por_casinha: 1,
    descricao: 'Exemplo de cobertura para proteção contra chuva e sol. Quantidade demonstrativa.',
    natureza_dado: 'demonstrativo',
  },
  {
    id: 'kit_parafusos',
    nome: 'Kit de parafusos para madeira',
    categoria: 'fixacao',
    quantidade_atual: 4,
    unidade: 'kit',
    consumo_por_casinha: 1,
    descricao: 'Exemplo de material de fixação. Quantidade demonstrativa.',
    natureza_dado: 'demonstrativo',
  },
  {
    id: 'pes_elevacao',
    nome: 'Pés para elevação da base',
    categoria: 'estrutura',
    quantidade_atual: 20,
    unidade: 'un',
    consumo_por_casinha: 4,
    descricao: 'Exemplo para manter a base afastada da umidade. Quantidade demonstrativa.',
    natureza_dado: 'demonstrativo',
  },
  {
    id: 'piso_lavavel',
    nome: 'Piso ou placa lavável',
    categoria: 'acabamento',
    quantidade_atual: 5,
    unidade: 'un',
    consumo_por_casinha: 1,
    descricao: 'Exemplo de superfície interna de fácil higienização. Quantidade demonstrativa.',
    natureza_dado: 'demonstrativo',
  },
];

const BAIRROS_PILOTO = [
  ['Centro', 'Local a validar com responsável pelo espaço'],
  ['Tambaú', 'Local a validar com responsável pelo espaço'],
  ['Bessa', 'Local a validar com responsável pelo espaço'],
  ['Castelo Branco', 'Local a validar com responsável pelo espaço'],
  ['Mangabeira', 'Local a validar com responsável pelo espaço'],
  ['Manaíra', 'Local a validar com responsável pelo espaço'],
  ['Cabo Branco', 'Local a validar com responsável pelo espaço'],
  ['Bancários', 'Local a validar com responsável pelo espaço'],
  ['Torre', 'Local a validar com responsável pelo espaço'],
  ['Altiplano', 'Local a validar com responsável pelo espaço'],
] as const;

export const INITIAL_PREVISOES_CASINHAS: PrevisaoCasinhaBairro[] = BAIRROS_PILOTO.map(
  ([bairro, local], index) => ({
    id: `casinha_jp_${String(index + 1).padStart(2, '0')}`,
    numero_casinha: index + 1,
    bairro,
    local_referencia: local,
    status: 'planejada',
    previsao_instalacao: 'Sem data definida - depende de validação, materiais e autorização',
    observacao: 'Planejamento acadêmico. Não representa instalação, autorização ou compromisso de terceiros.',
    natureza_dado: 'planejamento',
  }),
);
