// Netlify Function - Zona Holística KUNNA P0 FIX
// Backend-only: RapidAPI REAL + Tarot traducido + AL-E interpretación

const fetch = require('node-fetch');

// Headers CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Diccionario Tarot básico (español) - usado si AL-E está OFF
const TAROT_ES = {
  'The Fool': { nombre: 'El Loco', keywords: ['nuevos comienzos', 'espontaneidad', 'fe'] },
  'The Magician': { nombre: 'El Mago', keywords: ['manifestación', 'poder', 'acción'] },
  'The High Priestess': { nombre: 'La Sacerdotisa', keywords: ['intuición', 'misterio', 'sabiduría'] },
  'The Empress': { nombre: 'La Emperatriz', keywords: ['abundancia', 'fertilidad', 'naturaleza'] },
  'The Emperor': { nombre: 'El Emperador', keywords: ['autoridad', 'estructura', 'control'] },
  'The Hierophant': { nombre: 'El Sumo Sacerdote', keywords: ['tradición', 'conformidad', 'moral'] },
  'The Lovers': { nombre: 'Los Enamorados', keywords: ['amor', 'armonía', 'relaciones'] },
  'The Chariot': { nombre: 'El Carro', keywords: ['voluntad', 'determinación', 'victoria'] },
  'Strength': { nombre: 'La Fuerza', keywords: ['coraje', 'paciencia', 'compasión'] },
  'The Hermit': { nombre: 'El Ermitaño', keywords: ['introspección', 'búsqueda', 'soledad'] },
  'Wheel of Fortune': { nombre: 'La Rueda de la Fortuna', keywords: ['ciclos', 'destino', 'cambio'] },
  'Justice': { nombre: 'La Justicia', keywords: ['verdad', 'equidad', 'ley'] },
  'The Hanged Man': { nombre: 'El Colgado', keywords: ['sacrificio', 'perspectiva', 'pausa'] },
  'Death': { nombre: 'La Muerte', keywords: ['transformación', 'final', 'renacimiento'] },
  'Temperance': { nombre: 'La Templanza', keywords: ['balance', 'moderación', 'paciencia'] },
  'The Devil': { nombre: 'El Diablo', keywords: ['adicción', 'apego', 'limitación'] },
  'The Tower': { nombre: 'La Torre', keywords: ['revelación', 'cambio súbito', 'liberación'] },
  'The Star': { nombre: 'La Estrella', keywords: ['esperanza', 'inspiración', 'serenidad'] },
  'The Moon': { nombre: 'La Luna', keywords: ['ilusión', 'intuición', 'subconsciente'] },
  'The Sun': { nombre: 'El Sol', keywords: ['alegría', 'éxito', 'vitalidad'] },
  'Judgement': { nombre: 'El Juicio', keywords: ['evaluación', 'renacimiento', 'perdón'] },
  'The World': { nombre: 'El Mundo', keywords: ['completitud', 'logro', 'viaje'] }
};

// Traducir carta de tarot
function traducirTarot(cartaEN) {
  const nombre = cartaEN.name || '';
  const traduccion = TAROT_ES[nombre] || { nombre, keywords: ['cambio', 'reflexión'] };
  
  return {
    nombre_original: nombre,
    nombre: traduccion.nombre,
    keywords: traduccion.keywords,
    significado_original: cartaEN.meaning_up || '',
    imagen: cartaEN.img || null
  };
}

// Cálculo numerología local (fallback)
function calcularNumerologiaLocal(fecha) {
  const [year, month, day] = fecha.split('-');
  const suma = Array.from(year + month + day).reduce((acc, d) => acc + parseInt(d), 0);
  let numeroVida = suma;
  
  while (numeroVida > 9 && numeroVida !== 11 && numeroVida !== 22 && numeroVida !== 33) {
    numeroVida = Array.from(numeroVida.toString()).reduce((acc, d) => acc + parseInt(d), 0);
  }
  
  return { numero_vida: numeroVida, metodo: 'local' };
}

// Calcular signo zodiacal
function calcularSigno(fecha) {
  const [year, month, day] = fecha.split('-');
  const m = parseInt(month);
  const d = parseInt(day);
  
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return { signo: 'Aries', elemento: 'Fuego' };
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return { signo: 'Tauro', elemento: 'Tierra' };
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return { signo: 'Géminis', elemento: 'Aire' };
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return { signo: 'Cáncer', elemento: 'Agua' };
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return { signo: 'Leo', elemento: 'Fuego' };
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return { signo: 'Virgo', elemento: 'Tierra' };
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return { signo: 'Libra', elemento: 'Aire' };
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return { signo: 'Escorpio', elemento: 'Agua' };
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return { signo: 'Sagitario', elemento: 'Fuego' };
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return { signo: 'Capricornio', elemento: 'Tierra' };
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return { signo: 'Acuario', elemento: 'Aire' };
  return { signo: 'Piscis', elemento: 'Agua' };
}

// Interpretación con AL-E (Backend KUNNA)
async function interpretarConALE(tarot, numerologia, astrologia, pregunta) {
  const ALE_CORE_URL = process.env.ALE_CORE_URL || 'https://api.al-entity.com/api/ai/chat';
  const ALE_ENABLED = process.env.ALE_HOLISTICO_ENABLED === '1';
  
  if (!ALE_ENABLED) {
    console.log('[holistico] AL-E deshabilitado, usando interpretación básica');
    return generarInterpretacionBasica(tarot, numerologia, astrologia, pregunta);
  }
  
  try {
    const prompt = `Eres AL-E, asistente holístico de KUNNA. Genera una lectura contenedora (nunca fatalista) integrando:

TAROT: ${tarot.nombre} (${tarot.keywords.join(', ')})
NUMEROLOGÍA: Número de vida ${numerologia.numero_vida || numerologia.life_path_number || 'N/A'}
ASTROLOGÍA: ${astrologia.signo} (${astrologia.elemento})
PREGUNTA: ${pregunta || 'Guía general'}

Devuelve SOLO el JSON sin markdown ni explicaciones adicionales:
{
  "titulo": "Título de 4-6 palabras",
  "resumen": "1 línea síntesis",
  "lectura": "3-5 párrafos profundos, tono cálido",
  "consejos": ["consejo 1", "consejo 2", "consejo 3"],
  "afirmacion": "Afirmación positiva 1 línea",
  "cierre": "Cierre KUNNA contenedor"
}`;

    console.log('[holistico] Consultando AL-E Core...');
    const response = await fetch(ALE_CORE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: prompt,
        stream: false
      }),
      timeout: 15000
    });
    
    if (!response.ok) {
      throw new Error(`AL-E Core status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extraer respuesta según formato de tu backend
    const content = data.response || data.message || data.content;
    
    if (!content) throw new Error('Respuesta vacía de AL-E');
    
    // Extraer JSON del contenido
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No se encontró JSON en respuesta AL-E');
    
    const interpretacion = JSON.parse(jsonMatch[0]);
    console.log('[holistico] ✅ Interpretación AL-E generada');
    
    return interpretacion;
    
  } catch (error) {
    console.error('[holistico] Error en AL-E:', error.message);
    return generarInterpretacionBasica(tarot, numerologia, astrologia, pregunta);
  }
}

// Interpretación básica (fallback sin AL-E)
function generarInterpretacionBasica(tarot, numerologia, astrologia, pregunta) {
  return {
    titulo: `${tarot.nombre} te acompaña hoy`,
    resumen: `Las energías de ${tarot.keywords[0]} se activan en tu camino.`,
    lectura: `La carta ${tarot.nombre} habla de ${tarot.keywords.join(', ')}. Tu número de vida ${numerologia.numero_vida || numerologia.life_path_number || ''} refuerza tu propósito único. Como ${astrologia.signo}, tu elemento ${astrologia.elemento} te invita a fluir con estas energías. ${pregunta ? `Sobre tu pregunta, las señales te invitan a confiar en el proceso.` : 'Confía en las señales que recibes.'}`,
    consejos: [
      'Mantén tu atención en el presente',
      'Confía en tu intuición',
      'Permítete ser guiada'
    ],
    afirmacion: 'Estoy en el lugar correcto, en el momento perfecto',
    cierre: 'Estás acompañada en cada paso. KUNNA 💚'
  };
}

// HANDLER PRINCIPAL
exports.handler = async (event, context) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  // Solo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  try {
    const body = JSON.parse(event.body || '{}');
    const { fecha_nacimiento, pregunta, name } = body;
    
    // Validación
    if (!fecha_nacimiento) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          ok: false,
          error: { code: 'INVALID_INPUT', message: 'fecha_nacimiento requerida (formato: YYYY-MM-DD)' }
        })
      };
    }
    
    console.log('[holistico] Nueva lectura para:', fecha_nacimiento);
    
    const warnings = [];
    
    // ENV VARS
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
    const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'the-numerology-api.p.rapidapi.com';
    const TAROT_API_URL = process.env.TAROT_API_URL || 'https://tarotapi.dev/api/v1';
    const ALLOW_FALLBACK = process.env.ALLOW_FALLBACK_LOCAL === '1';
    
    // ========== 1. TAROT ==========
    let tarotData = null;
    try {
      console.log('[holistico] Consultando Tarot API...');
      const tarotRes = await fetch(`${TAROT_API_URL}/cards/random?n=1`, {
        headers: { 'Accept': 'application/json' },
        timeout: 5000
      });
      
      if (!tarotRes.ok) {
        throw new Error(`Tarot API status ${tarotRes.status}`);
      }
      
      const tarotJson = await tarotRes.json();
      const carta = tarotJson.cards?.[0];
      
      if (!carta) throw new Error('Sin carta en respuesta');
      
      tarotData = traducirTarot(carta);
      console.log('[holistico] ✅ Tarot:', tarotData.nombre);
      
    } catch (error) {
      console.error('[holistico] ❌ Tarot API falló:', error.message);
      warnings.push({ service: 'tarot', message: 'API no disponible, usando carta de respaldo' });
      tarotData = traducirTarot({ name: 'The Star', meaning_up: 'Hope and inspiration' });
    }
    
    // ========== 2. NUMEROLOGÍA (RapidAPI) ==========
    let numerologiaData = null;
    let numerologiaSource = 'none';
    
    if (RAPIDAPI_KEY) {
      try {
        console.log('[holistico] Consultando RapidAPI (numerología)...');
        
        // Parsear fecha para query params (formato: birth_year, birth_month, birth_day)
        const [year, month, day] = fecha_nacimiento.split('-');
        const queryParams = new URLSearchParams({
          birth_year: year,
          birth_month: month,
          birth_day: day
        });
        
        // GET request (NO POST!) según documentación oficial
        const numeroRes = await fetch(`https://${RAPIDAPI_HOST}/life_path?${queryParams}`, {
          method: 'GET',
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
          },
          timeout: 5000
        });
        
        console.log('[holistico] rapidapi status', numeroRes.status);
        
        if (numeroRes.status === 401 || numeroRes.status === 403) {
          throw new Error('RAPIDAPI_AUTH_FAILED');
        }
        
        if (!numeroRes.ok) {
          const errorText = await numeroRes.text().catch(() => 'No details');
          console.error('[holistico] RapidAPI error body:', errorText);
          throw new Error(`RapidAPI status ${numeroRes.status}`);
        }
        
        const numeroJson = await numeroRes.json();
        console.log('[holistico] RapidAPI response OK:', numeroJson.life_path_number);
        
        numerologiaData = {
          life_path_number: numeroJson.life_path_number,
          summary: numeroJson.summary,
          detailed_meaning: numeroJson.detailed_meaning
        };
        numerologiaSource = 'rapidapi';
        console.log('[holistico] ✅ Numerología RapidAPI');
        
      } catch (error) {
        console.error('[holistico] ❌ RapidAPI falló:', error.message);
        
        if (error.message === 'RAPIDAPI_AUTH_FAILED') {
          warnings.push({ 
            service: 'numerologia', 
            message: 'RapidAPI autenticación falló - verifica RAPIDAPI_KEY',
            code: 'RAPIDAPI_DOWN'
          });
        } else {
          warnings.push({ service: 'numerologia', message: `RapidAPI error: ${error.message}` });
        }
        
        if (ALLOW_FALLBACK) {
          numerologiaData = calcularNumerologiaLocal(fecha_nacimiento);
          numerologiaSource = 'local';
          console.log('[holistico] ⚠️ Usando numerología local (fallback)');
        } else {
          numerologiaData = { numero_vida: null };
          numerologiaSource = 'none';
        }
      }
    } else {
      console.log('[holistico] ⚠️ RAPIDAPI_KEY no configurada');
      warnings.push({ service: 'numerologia', message: 'RapidAPI no configurado' });
      
      if (ALLOW_FALLBACK) {
        numerologiaData = calcularNumerologiaLocal(fecha_nacimiento);
        numerologiaSource = 'local';
      } else {
        numerologiaData = { numero_vida: null };
        numerologiaSource = 'none';
      }
    }
    
    // ========== 3. ASTROLOGÍA (local) ==========
    const astrologiaData = calcularSigno(fecha_nacimiento);
    console.log('[holistico] ✅ Astrología:', astrologiaData.signo);
    
    // ========== 4. INTERPRETACIÓN AL-E ==========
    const interpretacion = await interpretarConALE(tarotData, numerologiaData, astrologiaData, pregunta);
    
    // ========== RESPUESTA FINAL ==========
    const response = {
      ok: true,
      source: {
        tarot: 'tarotapi.dev',
        numerologia: numerologiaSource,
        astrologia: 'local',
        ale: interpretacion.titulo !== `${tarotData.nombre} te acompaña hoy` // detecta si es AL-E o básico
      },
      tarot: tarotData,
      numerologia: numerologiaData,
      astrologia: astrologiaData,
      interpretacion,
      warnings: warnings.length > 0 ? warnings : undefined,
      timestamp: new Date().toISOString()
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('[holistico] ❌ Error crítico:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error generando lectura holística'
        }
      })
    };
  }
};
