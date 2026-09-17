/**
 * Utilitários de Geolocalização e Cálculo de Distâncias (Anti-Fraude GPS)
 */

/**
 * Calcula a distância geodésica em metros entre duas coordenadas usando a fórmula de Haversine.
 * Raio médio da Terra: 6.371.000 metros.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Raio da Terra em metros
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // 1 casa decimal
}

/**
 * Formata distância em metros ou quilômetros para leitura humana
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters.toFixed(1)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
}

/**
 * Retorna a data e hora no formato estrito AAAA-MM-DD HH:MM:SS
 */
export function formatDateTime(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Converte string AAAA-MM-DD HH:MM:SS para objeto Date
 */
export function parseDateTime(dateStr: string): Date {
  const [datePart, timePart] = dateStr.trim().split(' ');
  if (!datePart || !timePart) return new Date();

  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, seconds || 0);
}

/**
 * Calcula a diferença em horas entre o momento atual (ou data base) e a data do check-in
 */
export function getDiffInHours(dateStr: string, baseDate: Date = new Date()): number {
  const targetDate = parseDateTime(dateStr);
  const diffMs = baseDate.getTime() - targetDate.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Formata o tempo restante ou excedido do TTL (48h)
 */
export function getTTLStatus(dateStr: string, baseDate: Date = new Date()) {
  const hoursSince = getDiffInHours(dateStr, baseDate);
  const hoursRemaining = 48 - hoursSince;

  if (hoursRemaining <= 0) {
    const expiredHours = Math.abs(hoursRemaining);
    return {
      expired: true,
      hoursSince: Math.round(hoursSince * 10) / 10,
      text: `Expirado há ${Math.floor(expiredHours)}h ${Math.round((expiredHours % 1) * 60)}m`,
      urgentCheck: true,
    };
  }

  return {
    expired: false,
    hoursSince: Math.round(hoursSince * 10) / 10,
    text: `Expira em ${Math.floor(hoursRemaining)}h ${Math.round((hoursRemaining % 1) * 60)}m`,
    urgentCheck: hoursRemaining < 6, // Menos de 6h para expirar
  };
}
