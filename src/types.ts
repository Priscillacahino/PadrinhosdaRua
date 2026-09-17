export type StatusCasinha = '🟢 Verde' | '🟡 Amarelo' | '🔴 Vermelho';

/**
 * Estrutura estrita do Banco de Dados: Pontos_Casinhas
 */
export interface PontoCasinha {
  id: number;
  latitude: number;
  longitude: number;
  nome_ponto: string;
  status: StatusCasinha;
  apoiador_logotipo: string;
  ultimo_check_in: string; // Formato estrito: AAAA-MM-DD HH:MM:SS
  // Metadados adicionais úteis para UI e histórico
  foto_urgencia?: string;
  motivo_urgencia?: string;
  contato_emergencia?: string;
  descricao_local?: string;
  ultima_foto_comprovante?: string; // Comprovante em tempo real da câmera
  ultima_foto_timestamp?: string;
  ultimo_atendimento_tipo?: string;
}

export interface GPSCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface CheckInRequest {
  ponto_id: number;
  tipo_acao: 'abastecimento' | 'limpeza' | 'vistoria_geral' | 'reparo_vandalismo';
  user_latitude: number;
  user_longitude: number;
  observacao?: string;
  simulacao_hora?: string; // Para testes de TTL/data específica
  foto_comprovante_camera?: string; // Obrigatória: Foto da câmera do celular em tempo real (não aceita galeria)
  foto_timestamp?: string;
}

export interface ApiResponse<T = unknown> {
  sucesso: boolean;
  codigo_status: number;
  timestamp: string;
  mensagem: string;
  dados?: T;
  erro?: {
    codigo: 'GPS_OUT_OF_RANGE' | 'PHOTO_EVIDENCE_REQUIRED' | 'POINT_NOT_FOUND' | 'INVALID_DATA';
    detalhes: string;
    distancia_calculada_metros?: number;
    limite_permitido_metros?: number;
  };
}

export interface UrgenciaReportRequest {
  ponto_id: number;
  motivo: string;
  detalhes?: string;
  foto_evidencia_url: string; // Obrigatória
  user_latitude?: number;
  user_longitude?: number;
}

export interface LogAcao {
  id: string;
  ponto_id: number;
  nome_ponto: string;
  acao: string;
  timestamp: string;
  distancia_metros?: number;
  status_anterior: StatusCasinha;
  status_novo: StatusCasinha;
  foto_anexada?: boolean;
}

/**
 * Tipos para Oficina de Fabricação de Casinhas & Estoque de Materiais (João Pessoa - PB)
 */
export type CategoriaMaterial = 'estrutura' | 'alimentacao' | 'fixacao' | 'acabamento';

export interface MaterialEstoque {
  id: string;
  nome: string;
  categoria: CategoriaMaterial;
  quantidade_atual: number;
  unidade: string;
  consumo_por_casinha: number; // Qtd necessária para fabricar 1 casinha completa
  descricao: string;
  ultimo_doador?: string;
  alerta_estoque_minimo?: number;
}

export type StatusFabricacaoCasinha = 'planejada' | 'em_montagem' | 'pronta' | 'instalada';

export interface PrevisaoCasinhaBairro {
  id: string;
  numero_casinha: number;
  bairro: string;
  local_referencia: string;
  ponto_id?: number; // Vínculo com ponto existente de comida/água
  status: StatusFabricacaoCasinha;
  voluntario_responsavel?: string;
  previsao_instalacao: string;
  data_fabricacao?: string;
  observacao?: string;
}

export interface DoacaoMaterialPayload {
  material_id: string;
  quantidade: number;
  doador_nome: string;
  observacao?: string;
}
