// Netlify Function - Zona Holística KUNNA
// Backend-only: Consume APIs externas REALES (Tarot + RapidAPI)

const fetch = require('node-fetch');

// Plantillas de mensajes Kunna SOLO como fallback
const MENSAJES_FALLBACK = {
  tarot: 'Las cartas te invitan a confiar en tu proceso.',
  numerologia: 'Tu número te recuerda tu propósito único.',
  astrologia: 'Las estrellas te acompañan en tu camino.'
};

// Headers CORS para permitir requests desde localhost y producción
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Función principal de la Netlify Function
exports.handler = async (event, context) => {
  // Manejar preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Solo permitir POST
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

    // Validar entrada
    if (!fecha_nacimiento) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'fecha_nacimiento es requerida',
          ejemplo: '1990-05-15'
        })
      };
    }

    console.log('🔮 Generando lectura holística REAL para:', fecha_nacimiento);

    // Leer variables de entorno (backend-only)
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
    const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'the-numerology-api.p.rapidapi.com';

    let hasRapidAPI = !!RAPIDAPI_KEY;
    console.log('🔑 RapidAPI disponible:', hasRapidAPI);

    // 1. TAROT - API pública directa
    let tarotData = null;
    let tarotError = null;
    try {
      console.log('🔮 Consultando tarotapi.dev...');
      const tarotResponse = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1', {
        headers: { 'Accept': 'application/json' },
        timeout: 5000
      });
      
      if (!tarotResponse.ok) {
        throw new Error(`Tarot API status: ${tarotResponse.status}`);
      }
      
      const tarotJson = await tarotResponse.json();
      tarotData = tarotJson.cards?.[0] || null;
      console.log('✅ Carta obtenida:', tarotData?.name);
    } catch (error) {
      console.error('⚠️ Error en Tarot API:', error.message);
      tarotError = error.message;
      tarotData = { 
        name: 'The Fool', 
        meaning_up: 'Nuevo comienzo', 
        desc: 'Inicio de un viaje',
        name_short: 'ar00'
      };
    }

    // 2. NUMEROLOGÍA - RapidAPI REAL
    let numerologiaData = null;
    let numeroError = null;
    try {
      if (hasRapidAPI) {
        console.log('🔢 Consultando RapidAPI (numerología)...');
        const numeroResponse = await fetch('https://the-numerology-api.p.rapidapi.com/lucky_numbers/post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
          },
          body: JSON.stringify({
            date: fecha_nacimiento,
            name: name || 'Usuario'
          }),
          timeout: 5000
        });

        if (!numeroResponse.ok) {
          throw new Error(`RapidAPI Numerología status: ${numeroResponse.status}`);
        }

        const numeroJson = await numeroResponse.json();
        numerologiaData = {
          lucky_numbers: numeroJson.lucky_numbers || [],
          life_path_number: numeroJson.life_path_number || null,
          significado: `Tus números de la suerte son: ${numeroJson.lucky_numbers?.join(', ') || 'N/A'}`
        };
        console.log('✅ Numerología obtenida:', numerologiaData);
      } else {
        throw new Error('RAPIDAPI_KEY no configurada');
      }
    } catch (error) {
      console.error('⚠️ Error en RapidAPI Numerología:', error.message);
      numeroError = error.message;
      // Fallback local
      const [year, month, day] = fecha_nacimiento.split('-');
      const suma = Array.from(year + month + day).reduce((acc, digit) => acc + parseInt(digit), 0);
      const numeroVida = suma > 9 ? Array.from(suma.toString()).reduce((acc, digit) => acc + parseInt(digit), 0) : suma;
      
      numerologiaData = {
        numero_vida: numeroVida,
        significado: `Número de vida ${numeroVida} (fallback local)`,
        _fallback: true
      };
    }

    // 3. ASTROLOGÍA - Local como fallback (RapidAPI puede no tener astro)
    let astrologiaData = null;
    let astroError = null;
    try {
      const [year, month, day] = fecha_nacimiento.split('-');
      const monthNum = parseInt(month);
      const dayNum = parseInt(day);
      
      let signo = 'Aries';
      if ((monthNum === 3 && dayNum >= 21) || (monthNum === 4 && dayNum <= 19)) signo = 'Aries';
      else if ((monthNum === 4 && dayNum >= 20) || (monthNum === 5 && dayNum <= 20)) signo = 'Tauro';
      else if ((monthNum === 5 && dayNum >= 21) || (monthNum === 6 && dayNum <= 20)) signo = 'Géminis';
      else if ((monthNum === 6 && dayNum >= 21) || (monthNum === 7 && dayNum <= 22)) signo = 'Cáncer';
      else if ((monthNum === 7 && dayNum >= 23) || (monthNum === 8 && dayNum <= 22)) signo = 'Leo';
      else if ((monthNum === 8 && dayNum >= 23) || (monthNum === 9 && dayNum <= 22)) signo = 'Virgo';
      else if ((monthNum === 9 && dayNum >= 23) || (monthNum === 10 && dayNum <= 22)) signo = 'Libra';
      else if ((monthNum === 10 && dayNum >= 23) || (monthNum === 11 && dayNum <= 21)) signo = 'Escorpio';
      else if ((monthNum === 11 && dayNum >= 22) || (monthNum === 12 && dayNum <= 21)) signo = 'Sagitario';
      else if ((monthNum === 12 && dayNum >= 22) || (monthNum === 1 && dayNum <= 19)) signo = 'Capricornio';
      else if ((monthNum === 1 && dayNum >= 20) || (monthNum === 2 && dayNum <= 18)) signo = 'Acuario';
      else signo = 'Piscis';
      
      astrologiaData = {
        signo: signo,
        elemento: ['Aries', 'Leo', 'Sagitario'].includes(signo) ? 'Fuego' :
                  ['Tauro', 'Virgo', 'Capricornio'].includes(signo) ? 'Tierra' :
                  ['Géminis', 'Libra', 'Acuario'].includes(signo) ? 'Aire' : 'Agua',
        _fallback: true
      };
      console.log('✅ Astrología (local):', astrologiaData.signo);
    } catch (error) {
      console.error('⚠️ Error en Astrología:', error.message);
      astroError = error.message;
      astrologiaData = { signo: 'Desconocido', elemento: 'Desconocido' };
    }

    // 4. MENSAJE KUNNA - Unificado sin emojis obligatorios
    const mensajeKunna = `
Lectura Holística KUNNA

Tarot: ${tarotData?.name || 'Carta no disponible'}
${tarotData?.meaning_up || MENSAJES_FALLBACK.tarot}

Numerología: ${numerologiaData?._fallback ? 'Número de vida ' + numerologiaData.numero_vida : 'Números de la suerte: ' + (numerologiaData?.lucky_numbers?.join(', ') || 'N/A')}
${numerologiaData?.significado || MENSAJES_FALLBACK.numerologia}

Astrología: ${astrologiaData?.signo} (${astrologiaData?.elemento})
Tu energía ${astrologiaData?.elemento === 'Fuego' ? 'es pasión y acción' : 
              astrologiaData?.elemento === 'Tierra' ? 'es estabilidad y materialización' :
              astrologiaData?.elemento === 'Aire' ? 'es comunicación y pensamiento' :
              'es emoción e intuición'}.

${pregunta ? `En relación a tu pregunta: "${pregunta}", ` : ''}Las energías de hoy te invitan a integrar estos mensajes. Confía en tu proceso y en las señales que recibes.

Estás acompañada.
    `.trim();

    // Respuesta unificada
    const response = {
      success: true,
      fecha_consulta: new Date().toISOString(),
      tarot: {
        carta: tarotData?.name || 'N/A',
        significado: tarotData?.meaning_up || MENSAJES_FALLBACK.tarot,
        descripcion: tarotData?.desc || '',
        imagen: tarotData?.img || null,
        _error: tarotError || null
      },
      numerologia: {
        ...numerologiaData,
        _error: numeroError || null
      },
      astrologia: {
        ...astrologiaData,
        _error: astroError || null
      },
      mensaje_kunna: mensajeKunna,
      _warnings: {
        rapidapi_used: hasRapidAPI,
        tarot_failed: !!tarotError,
        numerologia_fallback: numerologiaData?._fallback || false,
        astrologia_fallback: astrologiaData?._fallback || false
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('❌ Error crítico en lectura holística:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        reason: 'Error generando lectura',
        details: error.message 
      })
    };
  }
};
