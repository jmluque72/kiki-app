// Mock básico de dateUtils para los tests
// Si este archivo no existe en producción, deberías crearlo con las funciones reales

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error('Fecha inválida');
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatTime(date: Date | string | number, includeSeconds = false, use12Hour = false): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error('Fecha inválida');
  }
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  if (use12Hour) {
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return includeSeconds 
      ? `${String(hour12).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`
      : `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`;
  }
  
  return includeSeconds 
    ? `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`
    : `${String(hours).padStart(2, '0')}:${minutes}`;
}

export function formatDateTime(date: Date | string | number, format?: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error('Fecha inválida');
  }
  if (format) {
    // Implementación básica de formato personalizado
    return format
      .replace('DD', String(d.getDate()).padStart(2, '0'))
      .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
      .replace('YYYY', String(d.getFullYear()))
      .replace('HH', String(d.getHours()).padStart(2, '0'))
      .replace('mm', String(d.getMinutes()).padStart(2, '0'))
      .replace('ss', String(d.getSeconds()).padStart(2, '0'));
  }
  return `${formatDate(d)} ${formatTime(d)}`;
}

export function isValidDate(date: any): boolean {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
}

export function getRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} minutos`;
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return formatDate(d);
}

export function parseDate(dateString: string): Date {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) {
    throw new Error('Fecha inválida');
  }
  return d;
}

export function compareDates(date1: Date | string | number, date2: Date | string | number): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getTime() - d2.getTime();
}

export function addDays(date: Date | string | number, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function subtractDays(date: Date | string | number, days: number): Date {
  return addDays(date, -days);
}

export function getStartOfDay(date: Date | string | number): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date | string | number): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isSameDay(date1: Date | string | number, date2: Date | string | number): boolean {
  const d1 = getStartOfDay(date1);
  const d2 = getStartOfDay(date2);
  return d1.getTime() === d2.getTime();
}

export function isToday(date: Date | string | number): boolean {
  return isSameDay(date, new Date());
}

export function isFutureDate(date: Date | string | number): boolean {
  return new Date(date).getTime() > new Date().getTime();
}

export function isPastDate(date: Date | string | number): boolean {
  return new Date(date).getTime() < new Date().getTime();
}

export function getDaysDifference(date1: Date | string | number, date2: Date | string | number): number {
  const d1 = getStartOfDay(date1);
  const d2 = getStartOfDay(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function getMonthsDifference(date1: Date | string | number, date2: Date | string | number): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const years = d2.getFullYear() - d1.getFullYear();
  const months = d2.getMonth() - d1.getMonth();
  return years * 12 + months;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

export function parseDuration(durationString: string): number {
  const parts = durationString.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  throw new Error('Formato de duración inválido');
}

