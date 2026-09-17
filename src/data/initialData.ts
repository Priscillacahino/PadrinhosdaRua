import { PontoCasinha } from '../types';
import { formatDateTime } from '../utils/geo';
import rescueKittenImg from '../assets/images/rescue_kitten_1789603606974.jpg';

// Data base relativa para os exemplos
const now = new Date();

// 3 horas atrás (Verde OK)
const h3Ago = new Date(now.getTime() - 3.5 * 3600 * 1000);
// 22 horas atrás (Verde OK)
const h22Ago = new Date(now.getTime() - 22 * 3600 * 1000);
// 50 horas atrás (Excedeu TTL de 48h -> Amarelo)
const h50Ago = new Date(now.getTime() - 50.2 * 3600 * 1000);
// 8 horas atrás com urgência física (Vermelho com Foto)
const h8Ago = new Date(now.getTime() - 8 * 3600 * 1000);
// 74 horas atrás (Amarelo)
const h74Ago = new Date(now.getTime() - 74 * 3600 * 1000);
// 15 horas atrás (Verde)
const h15Ago = new Date(now.getTime() - 15 * 3600 * 1000);

/**
 * Catálogo de Referência de Bairros e Coordenadas Oficiais de João Pessoa - PB
 */
export const JOAO_PESSOA_LOCAIS_REFERENCIA: Record<string, { lat: number; lon: number; bairro: string; descricao: string }> = {
  'Centro': {
    lat: -7.1153,
    lon: -34.8611,
    bairro: 'Centro',
    descricao: 'Coordenada Central de Referência (Parque Solon de Lucena / Lagoa)',
  },
  'Tambaú': {
    lat: -7.1195,
    lon: -34.8253,
    bairro: 'Tambaú',
    descricao: 'Busto de Tamandaré / Orla de Tambaú',
  },
  'Manaíra': {
    lat: -7.0984,
    lon: -34.8322,
    bairro: 'Manaíra',
    descricao: 'Praça Silvio Porto / Shopping Manaíra',
  },
  'Mangabeira': {
    lat: -7.1650,
    lon: -34.8378,
    bairro: 'Mangabeira',
    descricao: 'Praça do Coqueiral / Mercado de Mangabeira',
  },
  'Praia do Bessa': {
    lat: -7.0650,
    lon: -34.8320,
    bairro: 'Bessa',
    descricao: 'Parque Parahyba / Orla do Bessa',
  },
  'UFPB': {
    lat: -7.1396,
    lon: -34.8454,
    bairro: 'Castelo Branco',
    descricao: 'Campus I UFPB / Centro de Vivência',
  },
  'Cabo Branco': {
    lat: -7.1438,
    lon: -34.8220,
    bairro: 'Cabo Branco',
    descricao: 'Orla do Cabo Branco / Largo da Gameleira',
  },
  'Bancários': {
    lat: -7.1520,
    lon: -34.8510,
    bairro: 'Bancários',
    descricao: 'Praça da Paz / Três Ruas',
  },
  'Torre': {
    lat: -7.1210,
    lon: -34.8520,
    bairro: 'Torre',
    descricao: 'Praça da Torre / Av. Beira Rio',
  },
  'Altiplano': {
    lat: -7.1310,
    lon: -34.8290,
    bairro: 'Altiplano Cabo Branco',
    descricao: 'Mirante do Altiplano',
  },
};

/**
 * Coordenada Central Padrão de Buscas e Operações (Centro de João Pessoa - PB)
 * Latitude: -7.1153 | Longitude: -34.8611
 */
export const DEFAULT_USER_LOCATION = {
  latitude: -7.1153,
  longitude: -34.8611,
  nome: 'Centro de João Pessoa - PB (Coordenada Central Padrão)',
};

/**
 * Base de Dados Inicial em João Pessoa - PB (Pontos_Casinhas)
 */
export const INITIAL_PONTOS_CASINHAS: PontoCasinha[] = [
  {
    id: 1,
    latitude: -7.1190,
    longitude: -34.8630,
    nome_ponto: 'Casinha do Parque da Lagoa (Centro)',
    status: '🟢 Verde',
    apoiador_logotipo: 'Insumos doados por: Paraíba Pet Center (Centro)',
    ultimo_check_in: formatDateTime(h3Ago),
    descricao_local: 'Próximo ao anel interno da Lagoa, sob as palmeiras.',
  },
  {
    id: 2,
    latitude: -7.1195,
    longitude: -34.8253,
    nome_ponto: 'Comedouro Orla de Tambaú (Busto de Tamandaré)',
    status: '🟢 Verde',
    apoiador_logotipo: 'Insumos doados por: Quiosque Sol & Mar Tambaú',
    ultimo_check_in: formatDateTime(h22Ago),
    descricao_local: 'Calçadão de Tambaú, ao lado do posto de atendimento ao turista.',
  },
  {
    id: 3,
    latitude: -7.0650,
    longitude: -34.8320,
    nome_ponto: 'Ponto de Apoio Parque Parahyba (Praia do Bessa)',
    status: '🟡 Amarelo',
    apoiador_logotipo: 'Insumos doados por: Clínica Veterinária Bessa Pet',
    ultimo_check_in: formatDateTime(h50Ago),
    descricao_local: 'Parque Parahyba I, próximo à ciclovia e área canina.',
  },
  {
    id: 4,
    latitude: -7.1396,
    longitude: -34.8454,
    nome_ponto: 'Casinha do Campus I - UFPB',
    status: '🔴 Vermelho',
    apoiador_logotipo: 'Insumos doados por: Coletivo Protetores Universitários UFPB',
    ultimo_check_in: formatDateTime(h8Ago),
    motivo_urgencia: 'Estrutura avariada e gatinho com pata ferida necessitando resgate',
    foto_urgencia: rescueKittenImg,
    descricao_local: 'Atrás do Centro de Vivência / Diretório Central dos Estudantes (DCE).',
  },
  {
    id: 5,
    latitude: -7.1650,
    longitude: -34.8378,
    nome_ponto: 'Comedouro Comunitário Mangabeira (Praça do Coqueiral)',
    status: '🟡 Amarelo',
    apoiador_logotipo: 'Insumos doados por: Agropecuária Mangabeira Rações',
    ultimo_check_in: formatDateTime(h74Ago),
    descricao_local: 'Praça do Coqueiral, ao lado da quadra poliesportiva.',
  },
  {
    id: 6,
    latitude: -7.0984,
    longitude: -34.8322,
    nome_ponto: 'Ponto de Apoio Praça Silvio Porto (Manaíra)',
    status: '🟢 Verde',
    apoiador_logotipo: 'Insumos doados por: Pet Boutique Manaíra',
    ultimo_check_in: formatDateTime(h15Ago),
    descricao_local: 'Praça Silvio Porto, próximo à Av. Edson Ramalho.',
  },
];
