// src/services/numerologiaService.js
// Servicio completo para The Numerology API (100+ endpoints)

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'the-numerology-api.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

// Headers comunes para POST
const headers = {
  'Content-Type': 'application/json',
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': RAPIDAPI_HOST
};

/**
 * Parsea fecha de nacimiento a formato API
 * @param {string} fecha - Formato YYYY-MM-DD
 * @returns {string} - Formato YYYY-MM-DD
 */
function formatFecha(fecha) {
  return fecha; // Ya viene en formato correcto
}

/**
 * 1. Life Path Number (número de camino de vida)
 */
export async function getLifePath(fecha, nombre = '') {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/life_path`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Life Path error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Life Path:', error);
    return null;
  }
}

/**
 * 2. Soul Urge Number (número del alma)
 */
export async function getSoulUrge(fecha, nombre) {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/soul_urge`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Soul Urge error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Soul Urge:', error);
    return null;
  }
}

/**
 * 3. Expression/Destiny Number (número de expresión/destino)
 */
export async function getExpression(fecha, nombre) {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/expression`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Expression error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Expression:', error);
    return null;
  }
}

/**
 * 4. Personality Number (número de personalidad)
 */
export async function getPersonality(fecha, nombre) {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/personality`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Personality error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Personality:', error);
    return null;
  }
}

/**
 * 5. Birthday Number (número de cumpleaños)
 */
export async function getBirthday(fecha, nombre = '') {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/birthday`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Birthday error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Birthday:', error);
    return null;
  }
}

/**
 * 6. Attitude Number (número de actitud)
 */
export async function getAttitude(fecha, nombre = '') {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/attitude`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Attitude error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Attitude:', error);
    return null;
  }
}

/**
 * 7. Karmic Debt Numbers (números de deuda kármica)
 */
export async function getKarmicDebt(fecha, nombre) {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/karmic_debt`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Karmic Debt error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Karmic Debt:', error);
    return null;
  }
}

/**
 * 8. Karmic Lesson Numbers (lecciones kármicas)
 */
export async function getKarmicLessons(fecha, nombre) {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/karmic_lessons`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Karmic Lessons error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Karmic Lessons:', error);
    return null;
  }
}

/**
 * 9. Challenge Numbers (números de desafío)
 */
export async function getChallengeNumbers(fecha, nombre = '') {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/challenge`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Challenge error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Challenge:', error);
    return null;
  }
}

/**
 * 10. Lucky Numbers (números de la suerte)
 */
export async function getLuckyNumbers(fecha, nombre) {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/lucky_numbers`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Lucky Numbers error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Lucky Numbers:', error);
    return null;
  }
}

/**
 * 11. Personal Year Number (año personal)
 */
export async function getPersonalYear(fecha, nombre = '') {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/personal_year`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Personal Year error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Personal Year:', error);
    return null;
  }
}

/**
 * 12. Personal Month Number (mes personal)
 */
export async function getPersonalMonth(fecha, nombre = '') {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/personal_month`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Personal Month error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Personal Month:', error);
    return null;
  }
}

/**
 * 13. Personal Day Number (día personal)
 */
export async function getPersonalDay(fecha, nombre = '') {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/personal_day`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Personal Day error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Personal Day:', error);
    return null;
  }
}

/**
 * 14. Balance Number (número de equilibrio)
 */
export async function getBalance(fecha, nombre) {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/balance`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Balance error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Balance:', error);
    return null;
  }
}

/**
 * 15. Maturity Number (número de madurez)
 */
export async function getMaturity(fecha, nombre) {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/maturity`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Maturity error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Maturity:', error);
    return null;
  }
}

/**
 * 16. Rational Thought Number (pensamiento racional)
 */
export async function getRationalThought(fecha, nombre) {
  try {
    const body = JSON.stringify({
      birthdate: formatFecha(fecha),
      full_name: nombre
    });
    const res = await fetch(`${BASE_URL}/rational_thought`, {
      method: 'POST',
      headers,
      body
    });
    if (!res.ok) throw new Error(`Rational Thought error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[Numerología] Rational Thought:', error);
    return null;
  }
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
