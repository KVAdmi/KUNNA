// src/services/astrologiaService.js
// Servicio completo para Astrología y Horóscopos (RapidAPI)

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'the-numerology-api.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

const headers = {
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': RAPIDAPI_HOST
};

// Mapa de signos zodiacales
const SIGNOS_ZODIACALES = {
  aries: 'aries',
  tauro: 'taurus',
  geminis: 'gemini',
  cancer: 'cancer',
  leo: 'leo',
  virgo: 'virgo',
  libra: 'libra',
  escorpio: 'scorpio',
  sagitario: 'sagittarius',
  capricornio: 'capricorn',
  acuario: 'aquarius',
  piscis: 'pisces'
};

/**
 * Calcular signo zodiacal desde fecha de nacimiento
 */
export function calcularSigno(fecha) {
  const [year, month, day] = fecha.split('-').map(Number);
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  return 'pisces';
}

/**
 * Obtener elemento del signo
 */
export function getElemento(signo) {
  const fuego = ['aries', 'leo', 'sagittarius'];
  const tierra = ['taurus', 'virgo', 'capricorn'];
  const aire = ['gemini', 'libra', 'aquarius'];
  const agua = ['cancer', 'scorpio', 'pisces'];
  
  if (fuego.includes(signo)) return 'fuego';
  if (tierra.includes(signo)) return 'tierra';
  if (aire.includes(signo)) return 'aire';
  if (agua.includes(signo)) return 'agua';
  return 'desconocido';
}

/**
 * 1. Horóscopo Diario
 */
export async function getHoroscopoDiario(signo) {
  try {
    const params = new URLSearchParams({ sign: signo });
    const res = await fetch(`${BASE_URL}/daily_horoscope?${params}`, { headers });
    if (!res.ok) throw new Error(`Daily Horoscope error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Astrología] Horóscopo Diario:', error);
    return null;
  }
}

/**
 * 2. Horóscopo Semanal
 */
export async function getHoroscopoSemanal(signo) {
  try {
    const params = new URLSearchParams({ sign: signo });
    const res = await fetch(`${BASE_URL}/weekly_horoscope?${params}`, { headers });
    if (!res.ok) throw new Error(`Weekly Horoscope error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Astrología] Horóscopo Semanal:', error);
    return null;
  }
}

/**
 * 3. Horóscopo Mensual
 */
export async function getHoroscopoMensual(signo) {
  try {
    const params = new URLSearchParams({ sign: signo });
    const res = await fetch(`${BASE_URL}/monthly_horoscope?${params}`, { headers });
    if (!res.ok) throw new Error(`Monthly Horoscope error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Astrología] Horóscopo Mensual:', error);
    return null;
  }
}

/**
 * 4. Zodiac Birth Chart Data (datos básicos de carta natal)
 */
export async function getBirthChart(fecha) {
  try {
    const [year, month, day] = fecha.split('-');
    const params = new URLSearchParams({
      birth_year: year,
      birth_month: month,
      birth_day: day
    });
    const res = await fetch(`${BASE_URL}/zodiac?${params}`, { headers });
    if (!res.ok) throw new Error(`Birth Chart error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Astrología] Birth Chart:', error);
    return null;
  }
}

/**
 * 5. Compatibilidad Zodiacal
 */
export async function getCompatibilidad(signo1, signo2) {
  try {
    const params = new URLSearchParams({
      sign1: signo1,
      sign2: signo2
    });
    const res = await fetch(`${BASE_URL}/compatibility?${params}`, { headers });
    if (!res.ok) throw new Error(`Compatibility error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Astrología] Compatibilidad:', error);
    return null;
  }
}

/**
 * FUNCIÓN MAESTRA: Lectura astrológica completa
 */
export async function getAstrologiaCompleta(fecha) {
  console.log('[Astrología] Obteniendo lectura completa...');
  
  const signo = calcularSigno(fecha);
  const elemento = getElemento(signo);
  
  const [diario, semanal, mensual, birthChart] = await Promise.all([
    getHoroscopoDiario(signo),
    getHoroscopoSemanal(signo),
    getHoroscopoMensual(signo),
    getBirthChart(fecha)
  ]);
  
  return {
    signo,
    elemento,
    horoscopo: {
      diario,
      semanal,
      mensual
    },
    birthChart,
    timestamp: new Date().toISOString()
  };
}

export default {
  calcularSigno,
  getElemento,
  getHoroscopoDiario,
  getHoroscopoSemanal,
  getHoroscopoMensual,
  getBirthChart,
  getCompatibilidad,
  getAstrologiaCompleta
};
