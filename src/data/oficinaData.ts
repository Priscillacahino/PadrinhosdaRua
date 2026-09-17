import { MaterialEstoque, PrevisaoCasinhaBairro } from '../types';

/**
 * Projeto-piloto Padrinhos de Rua.
 * Meta deliberadamente limitada a 10 casinhas nesta primeira fase.
 */
export const META_CASINHAS_JOAO_PESSOA = 10;

export const INITIAL_MATERIAIS_ESTOQUE: MaterialEstoque[] = [
  {
    id: 'madeira_pallet', nome: 'Madeira reaproveitada / pallet', categoria: 'estrutura',
    quantidade_atual: 6, unidade: 'kit', consumo_por_casinha: 1,
    descricao: 'Madeira em bom estado para base, paredes e estrutura do abrigo.', alerta_estoque_minimo: 3,
  },
  {
    id: 'telha_ecologica', nome: 'Lona resistente / telha ecológica', categoria: 'estrutura',
    quantidade_atual: 5, unidade: 'un', consumo_por_casinha: 1,
    descricao: 'Cobertura inclinada para proteger o abrigo contra chuva e sol.', alerta_estoque_minimo: 3,
  },
  {
    id: 'kit_parafusos', nome: 'Kit de parafusos para madeira', categoria: 'fixacao',
    quantidade_atual: 4, unidade: 'kit', consumo_por_casinha: 1,
    descricao: 'Fixação simples e desmontável, preferível a pregos expostos.', alerta_estoque_minimo: 3,
  },
  {
    id: 'pes_elevacao', nome: 'Pés para elevação da base', categoria: 'estrutura',
    quantidade_atual: 20, unidade: 'un', consumo_por_casinha: 4,
    descricao: 'Mantém o piso afastado da umidade do solo.', alerta_estoque_minimo: 8,
  },
  {
    id: 'piso_lavavel', nome: 'Piso plástico / placa lavável', categoria: 'acabamento',
    quantidade_atual: 5, unidade: 'un', consumo_por_casinha: 1,
    descricao: 'Superfície simples de limpar no interior da casinha.', alerta_estoque_minimo: 3,
  },
];

export const INITIAL_PREVISOES_CASINHAS: PrevisaoCasinhaBairro[] = [
  { id:'casinha_jp_01', numero_casinha:1, bairro:'Centro', local_referencia:'Parque Solon de Lucena (Lagoa)', ponto_id:1, status:'em_montagem', voluntario_responsavel:'Grupo piloto', previsao_instalacao:'Fase inicial', observacao:'Ponto com alimentação ativa.' },
  { id:'casinha_jp_02', numero_casinha:2, bairro:'Tambaú', local_referencia:'Orla de Tambaú', ponto_id:2, status:'instalada', voluntario_responsavel:'Voluntários locais', previsao_instalacao:'Concluída', data_fabricacao:'2026-09-14' },
  { id:'casinha_jp_03', numero_casinha:3, bairro:'Bessa', local_referencia:'Parque Parahyba I', ponto_id:3, status:'em_montagem', previsao_instalacao:'Após completar materiais' },
  { id:'casinha_jp_04', numero_casinha:4, bairro:'Castelo Branco / UFPB', local_referencia:'Campus I - UFPB', ponto_id:4, status:'planejada', previsao_instalacao:'Fase inicial' },
  { id:'casinha_jp_05', numero_casinha:5, bairro:'Mangabeira', local_referencia:'Praça do Coqueiral', ponto_id:5, status:'planejada', previsao_instalacao:'Fase inicial' },
  { id:'casinha_jp_06', numero_casinha:6, bairro:'Manaíra', local_referencia:'Praça Silvio Porto', ponto_id:6, status:'instalada', voluntario_responsavel:'Voluntários locais', previsao_instalacao:'Concluída', data_fabricacao:'2026-09-15' },
  { id:'casinha_jp_07', numero_casinha:7, bairro:'Cabo Branco', local_referencia:'Local parceiro a definir', status:'planejada', previsao_instalacao:'Após validação do ponto' },
  { id:'casinha_jp_08', numero_casinha:8, bairro:'Bancários', local_referencia:'Local parceiro a definir', status:'planejada', previsao_instalacao:'Após validação do ponto' },
  { id:'casinha_jp_09', numero_casinha:9, bairro:'Torre', local_referencia:'Local parceiro a definir', status:'planejada', previsao_instalacao:'Após validação do ponto' },
  { id:'casinha_jp_10', numero_casinha:10, bairro:'Altiplano', local_referencia:'Local parceiro a definir', status:'planejada', previsao_instalacao:'Após validação do ponto' },
];
