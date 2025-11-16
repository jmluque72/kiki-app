import {
  formatDate,
  formatTime,
  formatDateTime,
  isValidDate,
  getRelativeTime,
  parseDate,
  compareDates,
  addDays,
  subtractDays,
  getStartOfDay,
  getEndOfDay,
  isSameDay,
  isToday,
  isFutureDate,
  isPastDate,
  getDaysDifference,
  getMonthsDifference,
  formatDuration,
  parseDuration,
} from '../../src/utils/dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('debe formatear fecha correctamente', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('15/01/2024');
    });

    it('debe formatear fecha con mes de un dígito', () => {
      const date = new Date('2024-01-05');
      expect(formatDate(date)).toBe('05/01/2024');
    });

    it('debe formatear fecha con día de un dígito', () => {
      const date = new Date('2024-12-09');
      expect(formatDate(date)).toBe('09/12/2024');
    });

    it('debe manejar string de fecha', () => {
      expect(formatDate('2024-01-15')).toBe('15/01/2024');
    });

    it('debe manejar timestamp', () => {
      const timestamp = new Date('2024-01-15').getTime();
      expect(formatDate(timestamp)).toBe('15/01/2024');
    });

    it('debe lanzar error para fecha inválida', () => {
      expect(() => formatDate('fecha-invalida')).toThrow('Fecha inválida');
    });
  });

  describe('formatTime', () => {
    it('debe formatear tiempo correctamente', () => {
      const date = new Date('2024-01-15T14:30:00');
      expect(formatTime(date)).toBe('14:30');
    });

    it('debe formatear tiempo con minutos de un dígito', () => {
      const date = new Date('2024-01-15T09:05:00');
      expect(formatTime(date)).toBe('09:05');
    });

    it('debe formatear tiempo con segundos', () => {
      const date = new Date('2024-01-15T14:30:45');
      expect(formatTime(date, true)).toBe('14:30:45');
    });

    it('debe manejar formato de 12 horas', () => {
      const date = new Date('2024-01-15T14:30:00');
      expect(formatTime(date, false, true)).toBe('02:30 PM');
    });

    it('debe manejar medianoche', () => {
      const date = new Date('2024-01-15T00:00:00');
      expect(formatTime(date, false, true)).toBe('12:00 AM');
    });
  });

  describe('formatDateTime', () => {
    it('debe formatear fecha y tiempo correctamente', () => {
      const date = new Date('2024-01-15T14:30:00');
      expect(formatDateTime(date)).toBe('15/01/2024 14:30');
    });

    it('debe usar formato personalizado', () => {
      const date = new Date('2024-01-15T14:30:00');
      expect(formatDateTime(date, 'DD-MM-YYYY HH:mm')).toBe('15-01-2024 14:30');
    });

    it('debe incluir segundos cuando se especifica', () => {
      const date = new Date('2024-01-15T14:30:45');
      expect(formatDateTime(date, 'DD/MM/YYYY HH:mm:ss')).toBe('15/01/2024 14:30:45');
    });
  });

  describe('isValidDate', () => {
    it('debe validar fecha válida', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate(new Date('2024-01-15'))).toBe(true);
    });

    it('debe invalidar fecha inválida', () => {
      expect(isValidDate('fecha-invalida')).toBe(false);
      expect(isValidDate('2024-13-45')).toBe(false);
      expect(isValidDate(new Date('invalid'))).toBe(false);
    });

    it('debe invalidar valores no fecha', () => {
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate(123)).toBe(false);
      expect(isValidDate({})).toBe(false);
      expect(isValidDate([])).toBe(false);
    });
  });

  describe('getRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debe mostrar "ahora mismo" para tiempo actual', () => {
      const now = new Date('2024-01-15T12:00:00');
      expect(getRelativeTime(now)).toBe('ahora mismo');
    });

    it('debe mostrar "hace X minutos" para tiempo pasado', () => {
      const fiveMinutesAgo = new Date('2024-01-15T11:55:00');
      expect(getRelativeTime(fiveMinutesAgo)).toBe('hace 5 minutos');
    });

    it('debe mostrar "en X minutos" para tiempo futuro', () => {
      const tenMinutesLater = new Date('2024-01-15T12:10:00');
      expect(getRelativeTime(tenMinutesLater)).toBe('en 10 minutos');
    });

    it('debe mostrar "hace X horas" para horas pasadas', () => {
      const twoHoursAgo = new Date('2024-01-15T10:00:00');
      expect(getRelativeTime(twoHoursAgo)).toBe('hace 2 horas');
    });

    it('debe mostrar "ayer" para ayer', () => {
      const yesterday = new Date('2024-01-14T12:00:00');
      expect(getRelativeTime(yesterday)).toBe('ayer');
    });

    it('debe mostrar fecha para tiempos lejanos', () => {
      const lastWeek = new Date('2024-01-08T12:00:00');
      expect(getRelativeTime(lastWeek)).toBe('08/01/2024');
    });
  });

  describe('parseDate', () => {
    it('debe parsear string de fecha', () => {
      const parsed = parseDate('2024-01-15');
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.getFullYear()).toBe(2024);
      expect(parsed.getMonth()).toBe(0); // Enero es 0
      expect(parsed.getDate()).toBe(15);
    });

    it('debe parsear timestamp', () => {
      const timestamp = new Date('2024-01-15').getTime();
      const parsed = parseDate(timestamp);
      expect(parsed).toBeInstanceOf(Date);
    });

    it('debe devolver fecha si ya es Date', () => {
      const date = new Date('2024-01-15');
      const parsed = parseDate(date);
      expect(parsed).toBe(date);
    });

    it('debe manejar formato DD/MM/YYYY', () => {
      const parsed = parseDate('15/01/2024', 'DD/MM/YYYY');
      expect(parsed.getFullYear()).toBe(2024);
      expect(parsed.getMonth()).toBe(0);
      expect(parsed.getDate()).toBe(15);
    });
  });

  describe('compareDates', () => {
    it('debe comparar fechas iguales', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-15');
      expect(compareDates(date1, date2)).toBe(0);
    });

    it('debe comparar fecha anterior', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');
      expect(compareDates(date1, date2)).toBe(-1);
    });

    it('debe comparar fecha posterior', () => {
      const date1 = new Date('2024-01-16');
      const date2 = new Date('2024-01-15');
      expect(compareDates(date1, date2)).toBe(1);
    });

    it('debe comparar solo fechas sin tiempo', () => {
      const date1 = new Date('2024-01-15T10:00:00');
      const date2 = new Date('2024-01-15T20:00:00');
      expect(compareDates(date1, date2, true)).toBe(0);
    });
  });

  describe('addDays', () => {
    it('debe agregar días a fecha', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, 5);
      expect(formatDate(result)).toBe('20/01/2024');
    });

    it('debe agregar días negativos', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, -3);
      expect(formatDate(result)).toBe('12/01/2024');
    });

    it('debe manejar cambio de mes', () => {
      const date = new Date('2024-01-30');
      const result = addDays(date, 5);
      expect(formatDate(result)).toBe('04/02/2024');
    });

    it('debe manejar cambio de año', () => {
      const date = new Date('2024-12-28');
      const result = addDays(date, 5);
      expect(formatDate(result)).toBe('02/01/2025');
    });
  });

  describe('subtractDays', () => {
    it('debe restar días a fecha', () => {
      const date = new Date('2024-01-15');
      const result = subtractDays(date, 5);
      expect(formatDate(result)).toBe('10/01/2024');
    });

    it('debe manejar cambio de mes', () => {
      const date = new Date('2024-02-03');
      const result = subtractDays(date, 5);
      expect(formatDate(result)).toBe('29/01/2024');
    });
  });

  describe('getStartOfDay', () => {
    it('debe obtener inicio del día', () => {
      const date = new Date('2024-01-15T14:30:45');
      const result = getStartOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('getEndOfDay', () => {
    it('debe obtener fin del día', () => {
      const date = new Date('2024-01-15T14:30:45');
      const result = getEndOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('isSameDay', () => {
    it('debe identificar mismo día', () => {
      const date1 = new Date('2024-01-15T10:00:00');
      const date2 = new Date('2024-01-15T20:00:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('debe identificar días diferentes', () => {
      const date1 = new Date('2024-01-15T10:00:00');
      const date2 = new Date('2024-01-16T10:00:00');
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('isToday', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debe identificar hoy', () => {
      const today = new Date('2024-01-15T10:00:00');
      expect(isToday(today)).toBe(true);
    });

    it('debe identificar que no es hoy', () => {
      const yesterday = new Date('2024-01-14T10:00:00');
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('isFutureDate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debe identificar fecha futura', () => {
      const futureDate = new Date('2024-01-16T12:00:00');
      expect(isFutureDate(futureDate)).toBe(true);
    });

    it('debe identificar que no es fecha futura', () => {
      const pastDate = new Date('2024-01-14T12:00:00');
      expect(isFutureDate(pastDate)).toBe(false);
    });

    it('debe identificar fecha actual como no futura', () => {
      const currentDate = new Date('2024-01-15T12:00:00');
      expect(isFutureDate(currentDate)).toBe(false);
    });
  });

  describe('isPastDate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debe identificar fecha pasada', () => {
      const pastDate = new Date('2024-01-14T12:00:00');
      expect(isPastDate(pastDate)).toBe(true);
    });

    it('debe identificar que no es fecha pasada', () => {
      const futureDate = new Date('2024-01-16T12:00:00');
      expect(isPastDate(futureDate)).toBe(false);
    });
  });

  describe('getDaysDifference', () => {
    it('debe calcular diferencia de días', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-20');
      expect(getDaysDifference(date1, date2)).toBe(5);
    });

    it('debe calcular diferencia negativa', () => {
      const date1 = new Date('2024-01-20');
      const date2 = new Date('2024-01-15');
      expect(getDaysDifference(date1, date2)).toBe(-5);
    });

    it('debe calcular diferencia cero', () => {
      const date1 = new Date('2024-01-15T10:00:00');
      const date2 = new Date('2024-01-15T20:00:00');
      expect(getDaysDifference(date1, date2)).toBe(0);
    });
  });

  describe('getMonthsDifference', () => {
    it('debe calcular diferencia de meses', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-03-15');
      expect(getMonthsDifference(date1, date2)).toBe(2);
    });

    it('debe calcular diferencia con años diferentes', () => {
      const date1 = new Date('2023-01-15');
      const date2 = new Date('2024-01-15');
      expect(getMonthsDifference(date1, date2)).toBe(12);
    });

    it('debe calcular diferencia parcial de meses', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-02-10');
      expect(getMonthsDifference(date1, date2)).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('debe formatear duración en horas y minutos', () => {
      expect(formatDuration(90)).toBe('1h 30m');
    });

    it('debe formatear duración solo en minutos', () => {
      expect(formatDuration(45)).toBe('45m');
    });

    it('debe formatear duración en días', () => {
      expect(formatDuration(1500)).toBe('1d 1h 0m');
    });

    it('debe manejar duración cero', () => {
      expect(formatDuration(0)).toBe('0m');
    });

    it('debe formatear con formato personalizado', () => {
      expect(formatDuration(90, '{hours} horas {minutes} minutos')).toBe('1 horas 30 minutos');
    });
  });

  describe('parseDuration', () => {
    it('debe parsear duración de string', () => {
      expect(parseDuration('1h 30m')).toBe(90);
    });

    it('debe parsear duración solo con horas', () => {
      expect(parseDuration('2h')).toBe(120);
    });

    it('debe parsear duración solo con minutos', () => {
      expect(parseDuration('45m')).toBe(45);
    });

    it('debe parsear duración con días', () => {
      expect(parseDuration('1d 2h 30m')).toBe(1590);
    });

    it('debe manejar formato con espacios variables', () => {
      expect(parseDuration('1h30m')).toBe(90);
      expect(parseDuration('2h  15m')).toBe(135);
    });

    it('debe lanzar error para formato inválido', () => {
      expect(() => parseDuration('invalid')).toThrow('Formato de duración inválido');
    });
  });

  describe('Casos límite y errores', () => {
    it('debe manejar fechas en diferentes zonas horarias', () => {
      const date1 = new Date('2024-01-15T00:00:00Z');
      const date2 = new Date('2024-01-15T03:00:00+03:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('debe manejar años bisiestos', () => {
      const leapYearDate = new Date('2024-02-29');
      expect(isValidDate(leapYearDate)).toBe(true);
      expect(formatDate(leapYearDate)).toBe('29/02/2024');
    });

    it('debe manejar cambio de horario de verano', () => {
      // Esta prueba puede requerir configuración específica de zona horaria
      const date = new Date('2024-03-10T02:30:00');
      expect(isValidDate(date)).toBe(true);
    });

    it('debe manejar valores extremos', () => {
      const minDate = new Date(-8640000000000000); // Mínima fecha posible
      const maxDate = new Date(8640000000000000);  // Máxima fecha posible
      expect(isValidDate(minDate)).toBe(true);
      expect(isValidDate(maxDate)).toBe(true);
    });
  });
});