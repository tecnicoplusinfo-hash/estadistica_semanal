/**
 * Utilidades para cálculo de semanas laborales
 * Zona horaria: Europe/Madrid
 * Semana: Viernes 15:00 hasta Viernes siguiente 15:00
 */

/**
 * Obtiene la semana actual basándose en la fecha y hora actual
 * @returns {Object} { weekNumber, year, friday, start, end }
 */
export function getCurrentWeek() {
  const now = new Date();

  // Convertir a hora de Europe/Madrid
  const madridTime = convertToMadridTime(now);

  // Restar 15 horas para que el "corte" sea a las 15:00 del viernes
  const adjusted = new Date(madridTime);
  adjusted.setHours(adjusted.getHours() - 15);

  // Encontrar el viernes de esa semana
  const day = adjusted.getDay();
  const diff = adjusted.getDate() - day + (day <= 5 ? 5 : -2);
  const friday = new Date(adjusted);
  friday.setDate(diff);

  const year = friday.getFullYear();
  const weekNumber = getISOWeek(friday);

  const { start, end } = getWeekRange(weekNumber, year);

  return {
    weekNumber,
    year,
    friday: formatDateOnly(friday),
    start,
    end
  };
}

/**
 * Obtiene el rango de fechas para una semana específica
 * @param {number} weekNumber - Número de semana (1-53)
 * @param {number} year - Año
 * @returns {Object} { start, end } - Fechas de inicio y fin
 */
export function getWeekRange(weekNumber, year) {
  // Encontrar el primer jueves del año (para determinar semana ISO)
  const jan1 = new Date(year, 0, 1);
  const firstThursday = new Date(jan1);
  firstThursday.setDate(jan1.getDate() + (4 - jan1.getDay() + 7) % 7);

  // Calcular el viernes de la semana solicitada
  const friday = new Date(firstThursday);
  friday.setDate(firstThursday.getDate() + (weekNumber - 1) * 7 + 1);

  const start = new Date(friday);
  start.setHours(15, 0, 0, 0);

  const end = new Date(friday);
  end.setDate(end.getDate() + 7);
  end.setHours(14, 59, 59, 999);

  return { start, end };
}

/**
 * Obtiene el número de semana ISO 8601
 * @param {Date} date - Fecha
 * @returns {number} Número de semana (1-53)
 */
function getISOWeek(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;

  target.setDate(target.getDate() - dayNr + 3);
  const jan4 = new Date(target.getFullYear(), 0, 4);
  const dayDiff = (target - jan4) / 86400000;

  return 1 + Math.ceil(dayDiff / 7);
}

/**
 * Convierte una fecha a hora de Europe/Madrid
 * @param {Date} date - Fecha en UTC
 * @returns {Date} Fecha convertida a zona horaria de Madrid
 */
function convertToMadridTime(date) {
  const str = date.toLocaleString('en-US', { timeZone: 'Europe/Madrid' });
  return new Date(str);
}

/**
 * Formatea una fecha a YYYY-MM-DD
 * @param {Date} date - Fecha
 * @returns {string} Fecha formateada
 */
function formatDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una semana para mostrar
 * @param {number} weekNumber - Número de semana
 * @param {number} year - Año
 * @returns {string} Texto formateado ej: "Semana 5 (2024) - 31 Ene"
 */
export function formatWeekLabel(weekNumber, year) {
  const { friday } = getWeekRange(weekNumber, year);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const month = months[friday.getMonth()];
  const day = friday.getDate();

  return `Sem ${weekNumber} (${year}) - ${day} ${month}`;
}

/**
 * Lista de últimas N semanas para filtros
 * @param {number} count - Número de semanas a devolver
 * @returns {Array} Lista de { weekNumber, year, label }
 */
export function getRecentWeeks(count = 12) {
  const weeks = [];
  const current = getCurrentWeek();

  for (let i = 0; i < count; i++) {
    const weekNum = current.weekNumber - i;
    let year = current.year;
    let adjustedWeek = weekNum;

    if (adjustedWeek < 1) {
      const weeksInPrevYear = getISOWeek(new Date(year - 1, 11, 28));
      year = year - 1;
      adjustedWeek = weeksInPrevYear + adjustedWeek;
    }

    weeks.push({
      weekNumber: adjustedWeek,
      year,
      label: formatWeekLabel(adjustedWeek, year),
      isCurrent: i === 0
    });
  }

  return weeks;
}
