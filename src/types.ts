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
}

export interface GPSCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface CheckInRequest {
  ponto_id: number;
  tipo_acao: 'abastecimento' | 'limpeza' | 'vistoria_geral';
  user_latitude: number;
  user_longitude: number;
  observacao?: string;
  simulacao_hora?: string; // Para testes de TTL/data específica
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
