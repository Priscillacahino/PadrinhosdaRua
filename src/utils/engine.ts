import {
  PontoCasinha,
  CheckInRequest,
  ApiResponse,
  UrgenciaReportRequest,
  LogAcao,
  StatusCasinha
} from '../types';
import {
  calculateDistanceMeters,
  formatDateTime,
  getDiffInHours
} from './geo';

export const RAIO_MAXIMO_CHECKIN_METROS = 50.0;
export const TTL_MAXIMO_HORAS = 48.0;

/**
 * Validação de Proximidade (Anti-Fraude GPS) e processamento de Check-in
 */
export function processCheckIn(
  casinha: PontoCasinha,
  request: CheckInRequest,
  currentSimulatedTime?: Date
): {
  success: boolean;
  response: ApiResponse<PontoCasinha>;
  updatedCasinha?: PontoCasinha;
  log?: LogAcao;
} {
  const currentTime = currentSimulatedTime || new Date();
  const timestampStr = formatDateTime(currentTime);

  // 1. Validação de Proximidade GPS (Haversine)
  const distanceMeters = calculateDistanceMeters(
    request.user_latitude,
    request.user_longitude,
    casinha.latitude,
    casinha.longitude
  );

  if (distanceMeters > RAIO_MAXIMO_CHECKIN_METROS) {
    const errorResponse: ApiResponse<PontoCasinha> = {
      sucesso: false,
      codigo_status: 403,
      timestamp: timestampStr,
      mensagem: `Operação rejeitada: Anti-Fraude GPS. O usuário está a ${distanceMeters} metros do ponto, excedendo o raio máximo permitido de ${RAIO_MAXIMO_CHECKIN_METROS}m.`,
      erro: {
        codigo: 'GPS_OUT_OF_RANGE',
        detalhes: 'O check-in presencial exige que o voluntário esteja a menos de 50 metros da casinha.',
        distancia_calculada_metros: distanceMeters,
        limite_permitido_metros: RAIO_MAXIMO_CHECKIN_METROS,
      },
    };

    return { success: false, response: errorResponse };
  }

  // 2. Operação Válida: Atualiza status para 🟢 Verde e define novo ultimo_check_in
  const statusAnterior = casinha.status;
  const updatedCasinha: PontoCasinha = {
    ...casinha,
    status: '🟢 Verde',
    ultimo_check_in: timestampStr,
    // Limpa estado de urgência se houver
    foto_urgencia: undefined,
    motivo_urgencia: undefined,
  };

  const actionName =
    request.tipo_acao === 'abastecimento'
      ? 'Abastecimento de comida e água'
      : request.tipo_acao === 'limpeza'
      ? 'Limpeza e higienização do ponto'
      : 'Vistoria geral preventiva';

  const log: LogAcao = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ponto_id: casinha.id,
    nome_ponto: casinha.nome_ponto,
    acao: actionName,
    timestamp: timestampStr,
    distancia_metros: distanceMeters,
    status_anterior: statusAnterior,
    status_novo: '🟢 Verde',
  };

  const successResponse: ApiResponse<PontoCasinha> = {
    sucesso: true,
    codigo_status: 200,
    timestamp: timestampStr,
    mensagem: `Check-in realizado com sucesso! Ponto '${casinha.nome_ponto}' validado a ${distanceMeters}m de distância. Status atualizado para 🟢 Verde.`,
    dados: updatedCasinha,
  };

  return {
    success: true,
    response: successResponse,
    updatedCasinha,
    log,
  };
}

/**
 * Lógica de TTL (Time-To-Live de 48h):
 * Se a diferença entre a data atual e ultimo_check_in for > 48h,
 * força alteração automática de 🟢 Verde para 🟡 Amarelo.
 */
export function applyTTLLogic(
  pontos: PontoCasinha[],
  currentSimulatedTime: Date = new Date()
): {
  pontosAtualizados: PontoCasinha[];
  alteracoes: Array<{ id: number; nome_ponto: string; horasDecorridas: number }>;
} {
  const alteracoes: Array<{ id: number; nome_ponto: string; horasDecorridas: number }> = [];

  const pontosAtualizados = pontos.map((ponto) => {
    // Se já estiver vermelho (urgência), mantém vermelho
    if (ponto.status === '🔴 Vermelho') {
      return ponto;
    }

    const horasDecorridas = getDiffInHours(ponto.ultimo_check_in, currentSimulatedTime);

    if (horasDecorridas > TTL_MAXIMO_HORAS && ponto.status === '🟢 Verde') {
      alteracoes.push({
        id: ponto.id,
        nome_ponto: ponto.nome_ponto,
        horasDecorridas: Math.round(horasDecorridas * 10) / 10,
      });

      return {
        ...ponto,
        status: '🟡 Amarelo' as StatusCasinha,
      };
    }

    return ponto;
  });

  return { pontosAtualizados, alteracoes };
}

/**
 * Validação de Fotos e Reporte de Urgência (🔴 Vermelho)
 * Requisito estrito: Obrigatório o envio de registro visual (foto).
 */
export function processUrgenciaReport(
  casinha: PontoCasinha,
  request: UrgenciaReportRequest,
  currentSimulatedTime?: Date
): {
  success: boolean;
  response: ApiResponse<PontoCasinha>;
  updatedCasinha?: PontoCasinha;
  whatsappLink?: string;
  log?: LogAcao;
} {
  const currentTime = currentSimulatedTime || new Date();
  const timestampStr = formatDateTime(currentTime);

  // 1. Validação estrita de Evidência Fotográfica
  if (!request.foto_evidencia_url || request.foto_evidencia_url.trim() === '') {
    const errorResponse: ApiResponse<PontoCasinha> = {
      sucesso: false,
      codigo_status: 422,
      timestamp: timestampStr,
      mensagem: `Operação rejeitada: Validação de Fotos. Alertas para o status 🔴 Vermelho (Urgência) exigem obrigatoriamente um registro visual comprovatório.`,
      erro: {
        codigo: 'PHOTO_EVIDENCE_REQUIRED',
        detalhes: 'Nenhum arquivo ou URL de foto foi fornecido na requisição.',
      },
    };

    return { success: false, response: errorResponse };
  }

  // 2. Operação Válida: Transita para 🔴 Vermelho
  const statusAnterior = casinha.status;
  const updatedCasinha: PontoCasinha = {
    ...casinha,
    status: '🔴 Vermelho',
    foto_urgencia: request.foto_evidencia_url,
    motivo_urgencia: request.motivo,
  };

  const log: LogAcao = {
    id: `log_urgencia_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ponto_id: casinha.id,
    nome_ponto: casinha.nome_ponto,
    acao: `Alerta de Urgência: ${request.motivo}`,
    timestamp: timestampStr,
    status_anterior: statusAnterior,
    status_novo: '🔴 Vermelho',
    foto_anexada: true,
  };

  // 3. Geração do Link de WhatsApp para o SOS Comunitário
  const whatsappLink = generateWhatsAppUrgencyLink(updatedCasinha, request.motivo, request.detalhes);

  const successResponse: ApiResponse<PontoCasinha> = {
    sucesso: true,
    codigo_status: 200,
    timestamp: timestampStr,
    mensagem: `Alerta de Urgência aceito e publicado! O ponto '${casinha.nome_ponto}' agora está em 🔴 Vermelho. Evidência fotográfica validada e link do WhatsApp gerado para os voluntários.`,
    dados: updatedCasinha,
  };

  return {
    success: true,
    response: successResponse,
    updatedCasinha,
    whatsappLink,
    log,
  };
}

/**
 * Gera o link pré-formatado do WhatsApp para o alerta de emergência
 */
export function generateWhatsAppUrgencyLink(
  casinha: PontoCasinha,
  motivo?: string,
  detalhes?: string
): string {
  const mapLink = `https://maps.google.com/?q=${casinha.latitude},${casinha.longitude}`;
  
  const text = 
`🚨 *ALERTA URGENTE - PADRINHOS DE RUA* 🐾

📍 *Ponto:* ${casinha.nome_ponto} (ID #${casinha.id})
⚠️ *Motivo da Urgência:* ${motivo || casinha.motivo_urgencia || 'Necessita intervenção imediata'}
${detalhes ? `📝 *Observações:* ${detalhes}\n` : ''}
📍 *Localização GPS:* ${mapLink}
⏰ *Último Registro:* ${casinha.ultimo_check_in}
🏢 *Apoiador Local:* ${casinha.apoiador_logotipo}

🆘 *Ação Necessária:* Padrinhos e voluntários próximos, por favor prestem apoio com urgência!
Verifique as informações completas no sistema Padrinhos de Rua.`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Exporta os registros exatamente na estrutura estrita do Banco de Dados (Pontos_Casinhas)
 */
export function exportToStrictDatabase(pontos: PontoCasinha[]) {
  return pontos.map(({ id, latitude, longitude, nome_ponto, status, apoiador_logotipo, ultimo_check_in }) => ({
    id,
    latitude,
    longitude,
    nome_ponto,
    status,
    apoiador_logotipo,
    ultimo_check_in,
  }));
}
