// src/services/astrologiaService.js
// Servicio de Astrología (LOCAL - no requiere API)

/**
 * Calcula el signo zodiacal basado en fecha de nacimiento
 * @param {string} fecha - Formato YYYY-MM-DD
 * @returns {Object} { signo, elemento, fechaInicio, fechaFin }
 */
export function calcularSigno(fecha) {
  const [year, month, day] = fecha.split('-');
  const m = parseInt(month);
  const d = parseInt(day);
  
  const signos = [
    { nombre: 'Capricornio', elemento: 'Tierra', inicio: [12, 22], fin: [1, 19] },
    { nombre: 'Acuario', elemento: 'Aire', inicio: [1, 20], fin: [2, 18] },
    { nombre: 'Piscis', elemento: 'Agua', inicio: [2, 19], fin: [3, 20] },
    { nombre: 'Aries', elemento: 'Fuego', inicio: [3, 21], fin: [4, 19] },
    { nombre: 'Tauro', elemento: 'Tierra', inicio: [4, 20], fin: [5, 20] },
    { nombre: 'Géminis', elemento: 'Aire', inicio: [5, 21], fin: [6, 20] },
    { nombre: 'Cáncer', elemento: 'Agua', inicio: [6, 21], fin: [7, 22] },
    { nombre: 'Leo', elemento: 'Fuego', inicio: [7, 23], fin: [8, 22] },
    { nombre: 'Virgo', elemento: 'Tierra', inicio: [8, 23], fin: [9, 22] },
    { nombre: 'Libra', elemento: 'Aire', inicio: [9, 23], fin: [10, 22] },
    { nombre: 'Escorpio', elemento: 'Agua', inicio: [10, 23], fin: [11, 21] },
    { nombre: 'Sagitario', elemento: 'Fuego', inicio: [11, 22], fin: [12, 21] }
  ];
  
  for (const signo of signos) {
    const [mesInicio, diaInicio] = signo.inicio;
    const [mesFin, diaFin] = signo.fin;
    
    // Caso especial: Capricornio cruza el año
    if (signo.nombre === 'Capricornio') {
      if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) {
        return {
          signo: signo.nombre,
          elemento: signo.elemento,
          fechaInicio: '22/12',
          fechaFin: '19/01'
        };
      }
    } else {
      if ((m === mesInicio && d >= diaInicio) || (m === mesFin && d <= diaFin)) {
        return {
          signo: signo.nombre,
          elemento: signo.elemento,
          fechaInicio: `${diaInicio}/${mesInicio}`,
          fechaFin: `${diaFin}/${mesFin}`
        };
      }
    }
  }
  
  return { signo: 'Desconocido', elemento: 'Desconocido' };
}

/**
 * Obtiene el elemento del signo
 * @param {string} signo 
 * @returns {string}
 */
export function getElemento(signo) {
  const elementos = {
    'Aries': 'Fuego',
    'Tauro': 'Tierra',
    'Géminis': 'Aire',
    'Cáncer': 'Agua',
    'Leo': 'Fuego',
    'Virgo': 'Tierra',
    'Libra': 'Aire',
    'Escorpio': 'Agua',
    'Sagitario': 'Fuego',
    'Capricornio': 'Tierra',
    'Acuario': 'Aire',
    'Piscis': 'Agua'
  };
  
  return elementos[signo] || 'Desconocido';
}

/**
 * Genera horóscopo del día (simulado - en el futuro conectar a API real)
 * @param {string} signo 
 * @returns {Object}
 */
export async function getHoroscopoDiario(signo) {
  // Por ahora retornamos un mensaje genérico
  // TODO: Conectar a una API de horóscopos real
  
  const mensajes = {
    'Aries': 'Tu energía está en su punto más alto. Aprovecha para iniciar proyectos.',
    'Tauro': 'La estabilidad que buscas está cerca. Confía en tu proceso.',
    'Géminis': 'Tu comunicación brilla hoy. Expresa tus ideas con claridad.',
    'Cáncer': 'Tus emociones son tu guía. Honra lo que sientes.',
    'Leo': 'Tu luz interior ilumina a quienes te rodean. Brilla con autenticidad.',
    'Virgo': 'El detalle hace la diferencia. Tu precisión es tu superpoder.',
    'Libra': 'Encuentra el balance entre dar y recibir. El equilibrio es tuyo.',
    'Escorpio': 'La transformación toca a tu puerta. Permítete renacer.',
    'Sagitario': 'Tu búsqueda de verdad te expande. Sigue explorando.',
    'Capricornio': 'Tu disciplina construye tu legado. Sigue firme en tu camino.',
    'Acuario': 'Tu visión única es necesaria. Comparte tu perspectiva.',
    'Piscis': 'Fluye con las mareas de la vida. Tu intuición te guía.'
  };
  
  return {
    signo,
    fecha: new Date().toLocaleDateString('es-ES'),
    mensaje: mensajes[signo] || 'Las estrellas te sonríen hoy.',
    consejo: 'Mantén tu corazón abierto a las señales del universo.'
  };
}

/**
 * Genera horóscopo semanal
 * @param {string} signo 
 * @returns {Object}
 */
export async function getHoroscopoSemanal(signo) {
  return {
    signo,
    semana: 'Semana actual',
    mensaje: `Esta semana trae oportunidades de crecimiento para ${signo}. Mantén tu enfoque en lo que realmente importa.`,
    areas: {
      amor: 'Las relaciones se fortalecen con comunicación honesta.',
      trabajo: 'Tu esfuerzo será reconocido. Sigue adelante.',
      salud: 'Prioriza tu autocuidado. Tu cuerpo es tu templo.'
    }
  };
}

/**
 * Genera horóscopo mensual
 * @param {string} signo 
 * @returns {Object}
 */
export async function getHoroscopoMensual(signo) {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const mesActual = meses[new Date().getMonth()];
  
  return {
    signo,
    mes: mesActual,
    mensaje: `${mesActual} trae transformaciones significativas para ${signo}. Confía en el proceso.`,
    prediccion: `Este mes te invita a expandir tus horizontes y conectar con tu propósito más profundo.`
  };
}

/**
 * FUNCIÓN MAESTRA: Obtiene astrología completa
 * @param {string} fecha - Formato YYYY-MM-DD
 * @returns {Promise<Object>}
 */
export async function getAstrologiaCompleta(fecha) {
  const signoData = calcularSigno(fecha);
  
  const [diario, semanal, mensual] = await Promise.all([
    getHoroscopoDiario(signoData.signo),
    getHoroscopoSemanal(signoData.signo),
    getHoroscopoMensual(signoData.signo)
  ]);
  
  return {
    ...signoData,
    horoscopo: {
      diario,
      semanal,
      mensual
    }
  };
}

export default {
  calcularSigno,
  getElemento,
  getHoroscopoDiario,
  getHoroscopoSemanal,
  getHoroscopoMensual,
  getAstrologiaCompleta
};
