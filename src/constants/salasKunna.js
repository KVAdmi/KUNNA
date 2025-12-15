// =============================================
// SALAS OFICIALES DE LA COMUNIDAD KUNNA
// Referencia de las 5 salas temáticas
// =============================================

/**
 * Catálogo de las 5 salas emocionales de KUNNA
 * Estas salas se cargan dinámicamente desde la DB (salas_comunidad)
 * pero este archivo sirve como referencia de diseño y validación
 */

export const SALAS_KUNNA_OFICIAL = [
  {
    slug: 'gritos-ahogados',
    nombre: 'Gritos Ahogados',
    descripcion: 'Un espacio íntimo para desahogo profundo. Aquí las mujeres pueden soltar lo que han guardado por años, sin juicio y sin máscaras.',
    icono: '🌫️',
    color: '#8d7583', // Rosa grisáceo profundo
    categoria: 'catarsis',
    tema: 'Desahogo y liberación emocional',
    keywords: ['desahogo', 'catarsis', 'dolor', 'expresión', 'liberación']
  },
  {
    slug: 'solas-pero-no',
    nombre: 'Solas Pero No',
    descripcion: 'Para quienes sienten vacío, distancia emocional, noches pesadas o soledad acompañada. Aquí se acompañan entre ellas.',
    icono: '🌙',
    color: '#382a3c', // Púrpura oscuro nocturno
    categoria: 'conexion',
    tema: 'Soledad y acompañamiento',
    keywords: ['soledad', 'vacío', 'conexión', 'acompañamiento', 'noche']
  },
  {
    slug: 'autoduda',
    nombre: 'Autoduda',
    descripcion: 'El lugar para hablar de inseguridades, comparación, miedo al fracaso, sentirse "insuficiente" o "rota". Aquí se reconstruye la voz interna.',
    icono: '🪞',
    color: '#c8a6a6', // Rosa empolvado suave
    categoria: 'autoestima',
    tema: 'Autoconcepto y reconstrucción',
    keywords: ['inseguridad', 'comparación', 'miedo', 'autoestima', 'voz interna']
  },
  {
    slug: 'cicatrices-suaves',
    nombre: 'Cicatrices Suaves',
    descripcion: 'Espacio para sanar heridas antiguas, relaciones que dolieron, trauma emocional, vínculos rotos. El objetivo es procesar, no revivir.',
    icono: '🕊️',
    color: '#b8a8c8', // Lavanda sanadora
    categoria: 'sanacion',
    tema: 'Sanación de heridas emocionales',
    keywords: ['trauma', 'sanación', 'heridas', 'relaciones', 'vínculos']
  },
  {
    slug: 'renacer',
    nombre: 'Renacer',
    descripcion: 'Para quienes están listas para levantarse, crear nuevos hábitos, celebrar avances, y compartir micro-victorias. Un espacio luminoso.',
    icono: '✨',
    color: '#c1d43a', // Verde lima brillante
    categoria: 'crecimiento',
    tema: 'Crecimiento y transformación',
    keywords: ['crecimiento', 'victorias', 'hábitos', 'transformación', 'avances']
  }
];

/**
 * Configuración de categorías de las salas
 */
export const CATEGORIAS_SALAS = {
  catarsis: {
    nombre: 'Catarsis',
    descripcion: 'Espacios de desahogo y liberación emocional',
    color: '#8d7583'
  },
  conexion: {
    nombre: 'Conexión',
    descripcion: 'Para acompañarnos en momentos de soledad',
    color: '#382a3c'
  },
  autoestima: {
    nombre: 'Autoestima',
    descripcion: 'Reconstrucción del autoconcepto',
    color: '#c8a6a6'
  },
  sanacion: {
    nombre: 'Sanación',
    descripcion: 'Procesar heridas y trauma emocional',
    color: '#b8a8c8'
  },
  crecimiento: {
    nombre: 'Crecimiento',
    descripcion: 'Transformación y nuevos comienzos',
    color: '#c1d43a'
  }
};

/**
 * Obtener sala por nombre o slug
 */
export const getSalaBySlug = (slug) => {
  return SALAS_KUNNA_OFICIAL.find(sala => sala.slug === slug);
};

/**
 * Obtener salas por categoría
 */
export const getSalasByCategoria = (categoria) => {
  return SALAS_KUNNA_OFICIAL.filter(sala => sala.categoria === categoria);
};

/**
 * Validar si un nombre de sala es oficial
 */
export const isSalaOficial = (nombre) => {
  return SALAS_KUNNA_OFICIAL.some(sala => 
    sala.nombre.toLowerCase() === nombre.toLowerCase()
  );
};

export default SALAS_KUNNA_OFICIAL;
