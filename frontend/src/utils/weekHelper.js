/**
 * Formatea una semana para mostrar en etiquetas
 */
export function formatWeekLabel(week) {
  if (typeof week === 'string') {
    return week;
  }
  return week.label || `Sem ${week.weekNumber} (${week.year})`;
}

/**
 * Obtiene el valor para usar en filtros
 */
export function getWeekValue(week) {
  if (typeof week === 'string') {
    return week;
  }
  return `${week.year}-${week.weekNumber}`;
}

/**
 * Tipos de estadísticas
 */
export const STAT_TYPES = [
  { value: 'SERVICIOS', label: 'Servicios' },
  { value: 'RESENAS', label: 'Reseñas' },
  { value: 'PAGINAS', label: 'Páginas' },
  { value: 'TARJETAS', label: 'Tarjetas' },
  { value: 'LLAVES', label: 'Llaves' }
];

/**
 * Subtipos de páginas
 */
export const PAGE_TYPES = [
  { value: 'DIRECTORIOS', label: 'Directorios' },
  { value: 'PAGINAS', label: 'Páginas' },
  { value: 'OTROS', label: 'Otros' }
];

/**
 * Obtiene el color para un tipo de estadística
 */
export function getStatTypeColor(type) {
  const colors = {
    SERVICIOS: '#2563eb',
    RESENAS: '#22c55e',
    PAGINAS: '#f59e0b',
    TARJETAS: '#8b5cf6',
    LLAVES: '#ef4444'
  };
  return colors[type] || '#64748b';
}

/**
 * Obtiene el icono/emoji para un tipo
 */
export function getStatTypeIcon(type) {
  const icons = {
    SERVICIOS: '🔧',
    RESENAS: '⭐',
    PAGINAS: '📄',
    TARJETAS: '💳',
    LLAVES: '🔑'
  };
  return icons[type] || '📊';
}
