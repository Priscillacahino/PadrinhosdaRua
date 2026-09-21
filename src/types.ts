export type StatusFabricacaoCasinha = 'planejada' | 'em_montagem_demo' | 'pronta_demo' | 'instalada_real';
export type CategoriaMaterial = 'estrutura' | 'fixacao' | 'acabamento';

export interface MaterialEstoque {
  id: string;
  nome: string;
  categoria: CategoriaMaterial;
  quantidade_atual: number;
  unidade: string;
  consumo_por_casinha: number;
  descricao: string;
  natureza_dado: 'demonstrativo' | 'validado';
}

export interface PrevisaoCasinhaBairro {
  id: string;
  numero_casinha: number;
  bairro: string;
  local_referencia: string;
  status: StatusFabricacaoCasinha;
  previsao_instalacao: string;
  observacao: string;
  natureza_dado: 'planejamento' | 'demonstrativo' | 'validado';
}
