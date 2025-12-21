// src/services/numerologiaService.js
// Servicio completo para Numerología via Netlify Function

const NETLIFY_FUNCTION_URL = 'https://kunna.help/.netlify/functions/numerologia';

/**
 * Helper para llamar al Netlify Function de numerología
 * @param {string} endpoint - Nombre del endpoint de RapidAPI
 * @param {string} birthdate - Formato YYYY-MM-DD
 * @param {string} full_name - Nombre completo
 */
async function callNumerologia(endpoint, birthdate, full_name = 'Unknown') {
  try {
    const response = await fetch(NETLIFY_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint,
        birthdate,
        full_name
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.ok) {
      throw new Error(result.error || 'Error en numerología');
    }
    
    return result.data;
    
  } catch (error) {
    console.error(`[Numerología] ${endpoint} error:`, error);
    return null;
  }
}

/**
 * 1. Life Path Number (número de camino de vida)
 */
export async function getLifePath(fecha, nombre = '') {
  return await callNumerologia('life_path', fecha, nombre);
}

/**
 * 2. Soul Urge Number (número del alma)
 */
export async function getSoulUrge(fecha, nombre) {
  return await callNumerologia('soul_urge', fecha, nombre);
}

/**
 * 3. Expression/Destiny Number (número de expresión/destino)
 */
export async function getExpression(fecha, nombre) {
  return await callNumerologia('expression', fecha, nombre);
}

/**
 * 4. Personality Number (número de personalidad)
 */
export async function getPersonality(fecha, nombre) {
  return await callNumerologia('personality', fecha, nombre);
}

/**
 * 5. Birthday Number (número de cumpleaños)
 */
export async function getBirthday(fecha, nombre = '') {
  return await callNumerologia('birthday', fecha, nombre);
}

/**
 * 6. Attitude Number (número de actitud)
 */
export async function getAttitude(fecha, nombre = '') {
  return await callNumerologia('attitude', fecha, nombre);
}

/**
 * 7. Karmic Debt Numbers (números de deuda kármica)
 */
export async function getKarmicDebt(fecha, nombre) {
  return await callNumerologia('karmic_debt', fecha, nombre);
}

/**
 * 8. Karmic Lesson Numbers (lecciones kármicas)
 */
export async function getKarmicLessons(fecha, nombre) {
  return await callNumerologia('karmic_lessons', fecha, nombre);
}

/**
 * 9. Challenge Numbers (números de desafío)
 */
export async function getChallengeNumbers(fecha, nombre = '') {
  return await callNumerologia('challenge', fecha, nombre);
}

/**
 * 10. Lucky Numbers (números de la suerte)
 */
export async function getLuckyNumbers(fecha, nombre) {
  return await callNumerologia('lucky_numbers', fecha, nombre);
}

/**
 * 11. Personal Year Number (año personal)
 */
export async function getPersonalYear(fecha, nombre = '') {
  return await callNumerologia('personal_year', fecha, nombre);
}

/**
 * 12. Personal Month Number (mes personal)
 */
export async function getPersonalMonth(fecha, nombre = '') {
  return await callNumerologia('personal_month', fecha, nombre);
}

/**
 * 13. Personal Day Number (día personal)
 */
export async function getPersonalDay(fecha, nombre = '') {
  return await callNumerologia('personal_day', fecha, nombre);
}

/**
 * 14. Balance Number (número de equilibrio)
 */
export async function getBalance(fecha, nombre) {
  return await callNumerologia('balance', fecha, nombre);
}

/**
 * 15. Maturity Number (número de madurez)
 */
export async function getMaturity(fecha, nombre) {
  return await callNumerologia('maturity', fecha, nombre);
}

/**
 * 16. Rational Thought Number (pensamiento racional)
 */
export async function getRationalThought(fecha, nombre) {
  return await callNumerologia('rational_thought', fecha, nombre);
}

/**
 * FUNCIÓN MAESTRA: Obtener lectura numerológica completa
 * @param {Object} data - { fecha: 'YYYY-MM-DD', nombre: 'string' }
 * @returns {Promise<Object>} Todos los números calculados
 */
export async function getNumerologiaCompleta(data) {
  const { fecha, nombre } = data;
  
  console.log('[Numerología] Obteniendo lectura completa...');
  
  // Ejecutar todas las consultas en paralelo
  const [
    lifePath,
    soulUrge,
    expression,
    personality,
    birthday,
    attitude,
    karmicDebt,
    karmicLessons,
    challenge,
    luckyNumbers,
    personalYear,
    personalMonth,
    personalDay,
    balance,
    maturity,
    rationalThought
  ] = await Promise.all([
    getLifePath(fecha, nombre),
    getSoulUrge(fecha, nombre),
    getExpression(fecha, nombre),
    getPersonality(fecha, nombre),
    getBirthday(fecha, nombre),
    getAttitude(fecha, nombre),
    getKarmicDebt(fecha, nombre),
    getKarmicLessons(fecha, nombre),
    getChallengeNumbers(fecha, nombre),
    getLuckyNumbers(fecha, nombre),
    getPersonalYear(fecha, nombre),
    getPersonalMonth(fecha, nombre),
    getPersonalDay(fecha, nombre),
    getBalance(fecha, nombre),
    getMaturity(fecha, nombre),
    getRationalThought(fecha, nombre)
  ]);
  
  return {
    lifePath,
    soulUrge,
    expression,
    personality,
    birthday,
    attitude,
    karmicDebt,
    karmicLessons,
    challenge,
    luckyNumbers,
    personalYear,
    personalMonth,
    personalDay,
    balance,
    maturity,
    rationalThought,
    timestamp: new Date().toISOString()
  };
}

export default {
  getLifePath,
  getSoulUrge,
  getExpression,
  getPersonality,
  getBirthday,
  getAttitude,
  getKarmicDebt,
  getKarmicLessons,
  getChallengeNumbers,
  getLuckyNumbers,
  getPersonalYear,
  getPersonalMonth,
  getPersonalDay,
  getBalance,
  getMaturity,
  getRationalThought,
  getNumerologiaCompleta
};
