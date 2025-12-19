// Netlify Function - Zona Holística KUNNA
// Backend-only: Consume APIs externas REALES (Tarot + RapidAPI)

const fetch = require('node-fetch');

// Plantillas de mensajes Kunna SOLO como fallback
const MENSAJES_FALLBACK = {
  tarot: 'Las cartas te invitan a confiar en tu proceso.',
  numerologia: 'Tu número te recuerda tu propósito único.',
  astrologia: 'Las estrellas te acompañan en tu camino.'
};

// Función principal de la Netlify Function
exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('❌ Error crítico en lectura holística:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        reason: 'Error generando lectura',
        details: error.message 
      })
    };
  }
};


// Plantillas de mensajes Kunna por arcano mayor del tarot
const MENSAJES_TAROT = {
  'the fool': 'Un nuevo comienzo te espera. Confía en tu intuición y da ese paso con valentía.',
  'the magician': 'Tienes todas las herramientas que necesitas. Es momento de manifestar tus deseos.',
  'the high priestess': 'Escucha tu voz interior. La respuesta está en tu sabiduría profunda.',
  'the empress': 'Momento de crear y nutrir. Tu energía femenina está en su máximo esplendor.',
  'the emperor': 'Establece estructura y límites. Tu liderazgo es necesario ahora.',
  'the hierophant': 'Busca guía en la tradición. Las enseñanzas ancestrales te apoyan.',
  'the lovers': 'Una decisión importante se acerca. Escucha a tu corazón.',
  'the chariot': 'Avanza con determinación. El control y la dirección están de tu lado.',
  'strength': 'Tu fortaleza interior es tu mayor poder. La compasión vence a la fuerza.',
  'the hermit': 'Tiempo de introspección. Las respuestas están en tu interior.',
  'wheel of fortune': 'Los ciclos cambian. Confía en el fluir de la vida.',
  'justice': 'Busca el equilibrio. La verdad y la equidad prevalecerán.',
  'the hanged man': 'Cambia tu perspectiva. La pausa tiene un propósito.',
  'death': 'Una transformación profunda está ocurriendo. Deja ir lo que ya no sirve.',
  'temperance': 'Busca la armonía. El balance entre opuestos es tu camino.',
  'the devil': 'Libérate de las ataduras. Tienes más poder del que crees.',
  'the tower': 'Estructuras obsoletas caen. Confía en la reconstrucción.',
  'the star': 'La esperanza renace. Tus sueños están más cerca de lo que crees.',
  'the moon': 'Navega las aguas del inconsciente. No todo es lo que parece.',
  'the sun': 'La claridad llega. Celebra tu luz y tu alegría.',
  'judgement': 'Momento de evaluar y renacer. Tu despertar es inminente.',
  'the world': 'Ciclo cumplido. Celebra tus logros y prepárate para lo nuevo.',
  'default': 'Las cartas te invitan a confiar en tu proceso. Estás exactamente donde necesitas estar.'
};

// Plantillas simples por número (Numerología)
const MENSAJES_NUMEROLOGIA = {
  1: 'Eres líder por naturaleza. Tu independencia es tu fortaleza.',
  2: 'La cooperación y la diplomacia son tus dones. Construyes puentes.',
  3: 'Tu creatividad y expresión son tu verdad. Comunica con autenticidad.',
  4: 'La estabilidad y el orden son tu base. Construyes para durar.',
  5: 'El cambio y la libertad son tu esencia. Abraza la aventura.',
  6: 'El amor y el servicio guían tu camino. Nutres a quienes te rodean.',
  7: 'La búsqueda espiritual define tu viaje. Tu sabiduría es profunda.',
  8: 'El poder y la abundancia son tuyos. Manifiestas con maestría.',
  9: 'Eres sanadora universal. Tu compasión transforma.',
  'default': 'Tu número te recuerda tu propósito único en este mundo.'
};

// Función principal de la Netlify Function
exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { fecha_nacimiento, pregunta } = body;

    // Validar entrada
    if (!fecha_nacimiento) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'fecha_nacimiento es requerida',
          ejemplo: '1990-05-15'
        })
      };
    }

    console.log('🔮 Generando lectura holística para:', fecha_nacimiento);

    // Leer variables de entorno (backend-only)
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
    const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'the-numerology-api.p.rapidapi.com';

    // 1. TAROT - API pública directa (tarotapi.dev)
    let tarotData = null;
    try {
      console.log('🔮 Consultando tarotapi.dev...');
      const tarotResponse = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1', {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!tarotResponse.ok) {
        throw new Error(`Tarot API error: ${tarotResponse.status}`);
      }
      
      const tarotJson = await tarotResponse.json();
      tarotData = tarotJson.cards?.[0] || null;
      console.log('✅ Carta obtenida:', tarotData?.name);
    } catch (error) {
      console.error('⚠️ Error obteniendo tarot:', error.message);
      // Fallback simple
      tarotData = { 
        name: 'The Fool', 
        meaning_up: 'Nuevo comienzo', 
        desc: 'Inicio de un viaje',
        name_short: 'ar00'
      };
    }

    // 2. NUMEROLOGÍA - Calcular número de vida
    let numeroVida = null;
    let numerologiaData = null;
    try {
      const [year, month, day] = fecha_nacimiento.split('-');
      const suma = Array.from(year + month + day).reduce((acc, digit) => acc + parseInt(digit), 0);
      numeroVida = suma > 9 ? Array.from(suma.toString()).reduce((acc, digit) => acc + parseInt(digit), 0) : suma;
      
      numerologiaData = {
        numero_vida: numeroVida,
        significado: MENSAJES_NUMEROLOGIA[numeroVida] || MENSAJES_NUMEROLOGIA['default']
      };
    } catch (error) {
      console.error('Error calculando numerología:', error.message);
      numerologiaData = { numero_vida: 1, significado: 'Error en cálculo' };
    }

    // 3. ASTROLOGÍA - Por ahora solo signo zodiacal simple
    let astrologiaData = null;
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
                  ['Géminis', 'Libra', 'Acuario'].includes(signo) ? 'Aire' : 'Agua'
      };
    } catch (error) {
      console.error('Error calculando astrología:', error.message);
      astrologiaData = { signo: 'Desconocido', elemento: 'Desconocido' };
    }

    // 4. MENSAJE KUNNA - Unificar todo con tono acompañante
    const tarotName = (tarotData?.name || 'The Fool').toLowerCase();
    const mensajeTarot = MENSAJES_TAROT[tarotName] || MENSAJES_TAROT['default'];
    const mensajeNumero = MENSAJES_NUMEROLOGIA[numeroVida] || MENSAJES_NUMEROLOGIA['default'];

    const mensajeKunna = `
💫 Lectura Holística KUNNA

🔮 **Tarot:** ${tarotData?.name || 'The Fool'}
${mensajeTarot}

🔢 **Numerología:** Número de Vida ${numeroVida}
${mensajeNumero}

⭐ **Astrología:** ${astrologiaData.signo} (${astrologiaData.elemento})
Tu energía ${astrologiaData.elemento === 'Fuego' ? 'es pasión y acción' : 
              astrologiaData.elemento === 'Tierra' ? 'es estabilidad y materialización' :
              astrologiaData.elemento === 'Aire' ? 'es comunicación y pensamiento' :
              'es emoción e intuición'}.

🌟 **Mensaje KUNNA:**
Las energías de hoy te invitan a integrar tu carta del tarot con tu número de vida. ${pregunta ? `En relación a tu pregunta: "${pregunta}", ` : ''}recuerda que estás en el camino correcto. Confía en tu proceso y en las señales que el universo te envía.

Estás acompañada. 💜
    `.trim();

    // Respuesta unificada
    const response = {
      success: true,
      fecha_consulta: new Date().toISOString(),
      tarot: {
        carta: tarotData?.name || 'The Fool',
        significado: tarotData?.meaning_up || 'Nuevo comienzo',
        descripcion: tarotData?.desc || 'Inicio de un viaje',
        imagen: tarotData?.img || null
      },
      numerologia: {
        numero_vida: numeroVida,
        significado: numerologiaData.significado
      },
      astrologia: {
        signo: astrologiaData.signo,
        elemento: astrologiaData.elemento
      },
      mensaje_kunna: mensajeKunna
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('❌ Error en lectura holística:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error generando lectura',
        details: error.message 
      })
    };
  }
};
