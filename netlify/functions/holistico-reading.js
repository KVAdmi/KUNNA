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

// Diccionario Tarot COMPLETO (78 cartas) - español
const TAROT_ES = {
  // ARCANOS MAYORES (22)
  'The Fool': { nombre: 'El Loco', keywords: ['nuevos comienzos', 'espontaneidad', 'fe', 'libertad'] },
  'The Magician': { nombre: 'El Mago', keywords: ['manifestación', 'poder', 'acción', 'habilidad'] },
  'The High Priestess': { nombre: 'La Sacerdotisa', keywords: ['intuición', 'misterio', 'sabiduría', 'secretos'] },
  'The Empress': { nombre: 'La Emperatriz', keywords: ['abundancia', 'fertilidad', 'naturaleza', 'crianza'] },
  'The Emperor': { nombre: 'El Emperador', keywords: ['autoridad', 'estructura', 'control', 'liderazgo'] },
  'The Hierophant': { nombre: 'El Sumo Sacerdote', keywords: ['tradición', 'conformidad', 'moral', 'educación'] },
  'The Lovers': { nombre: 'Los Enamorados', keywords: ['amor', 'armonía', 'relaciones', 'elecciones'] },
  'The Chariot': { nombre: 'El Carro', keywords: ['voluntad', 'determinación', 'victoria', 'control'] },
  'Strength': { nombre: 'La Fuerza', keywords: ['coraje', 'paciencia', 'compasión', 'control interior'] },
  'The Hermit': { nombre: 'El Ermitaño', keywords: ['introspección', 'búsqueda', 'soledad', 'guía interior'] },
  'Wheel of Fortune': { nombre: 'La Rueda de la Fortuna', keywords: ['ciclos', 'destino', 'cambio', 'karma'] },
  'Justice': { nombre: 'La Justicia', keywords: ['verdad', 'equidad', 'ley', 'karma'] },
  'The Hanged Man': { nombre: 'El Colgado', keywords: ['sacrificio', 'perspectiva', 'pausa', 'rendición'] },
  'Death': { nombre: 'La Muerte', keywords: ['transformación', 'final', 'renacimiento', 'transición'] },
  'Temperance': { nombre: 'La Templanza', keywords: ['balance', 'moderación', 'paciencia', 'armonía'] },
  'The Devil': { nombre: 'El Diablo', keywords: ['adicción', 'apego', 'limitación', 'materialismo'] },
  'The Tower': { nombre: 'La Torre', keywords: ['revelación', 'cambio súbito', 'liberación', 'caos'] },
  'The Star': { nombre: 'La Estrella', keywords: ['esperanza', 'inspiración', 'serenidad', 'renovación'] },
  'The Moon': { nombre: 'La Luna', keywords: ['ilusión', 'intuición', 'subconsciente', 'miedos'] },
  'The Sun': { nombre: 'El Sol', keywords: ['alegría', 'éxito', 'vitalidad', 'claridad'] },
  'Judgement': { nombre: 'El Juicio', keywords: ['evaluación', 'renacimiento', 'perdón', 'llamado'] },
  'The World': { nombre: 'El Mundo', keywords: ['completitud', 'logro', 'viaje', 'culminación'] },
  
  // COPAS (14 cartas)
  'Ace of Cups': { nombre: 'As de Copas', keywords: ['nuevo amor', 'emociones', 'intuición', 'creatividad'] },
  'Two of Cups': { nombre: 'Dos de Copas', keywords: ['asociación', 'unión', 'atracción', 'conexión'] },
  'Three of Cups': { nombre: 'Tres de Copas', keywords: ['celebración', 'amistad', 'comunidad', 'abundancia'] },
  'Four of Cups': { nombre: 'Cuatro de Copas', keywords: ['apatía', 'contemplación', 'reevaluación', 'meditación'] },
  'Five of Cups': { nombre: 'Cinco de Copas', keywords: ['pérdida', 'duelo', 'arrepentimiento', 'decepción'] },
  'Six of Cups': { nombre: 'Seis de Copas', keywords: ['nostalgia', 'recuerdos', 'inocencia', 'infancia'] },
  'Seven of Cups': { nombre: 'Siete de Copas', keywords: ['opciones', 'ilusión', 'imaginación', 'fantasía'] },
  'Eight of Cups': { nombre: 'Ocho de Copas', keywords: ['abandono', 'búsqueda', 'desilusión', 'retiro'] },
  'Nine of Cups': { nombre: 'Nueve de Copas', keywords: ['satisfacción', 'deseo cumplido', 'felicidad', 'logro'] },
  'Ten of Cups': { nombre: 'Diez de Copas', keywords: ['felicidad familiar', 'armonía', 'amor', 'plenitud'] },
  'Page of Cups': { nombre: 'Sota de Copas', keywords: ['mensajero', 'creatividad', 'intuición', 'sensibilidad'] },
  'Knight of Cups': { nombre: 'Caballero de Copas', keywords: ['romance', 'encanto', 'imaginación', 'idealismo'] },
  'Queen of Cups': { nombre: 'Reina de Copas', keywords: ['compasión', 'calma', 'intuición', 'cuidado'] },
  'King of Cups': { nombre: 'Rey de Copas', keywords: ['equilibrio emocional', 'diplomacia', 'control', 'compasión'] },
  
  // ESPADAS (14 cartas)
  'Ace of Swords': { nombre: 'As de Espadas', keywords: ['claridad mental', 'verdad', 'justicia', 'triunfo'] },
  'Two of Swords': { nombre: 'Dos de Espadas', keywords: ['indecisión', 'estancamiento', 'evitación', 'dilema'] },
  'Three of Swords': { nombre: 'Tres de Espadas', keywords: ['dolor', 'traición', 'sufrimiento', 'pena'] },
  'Four of Swords': { nombre: 'Cuatro de Espadas', keywords: ['descanso', 'contemplación', 'recuperación', 'paz'] },
  'Five of Swords': { nombre: 'Cinco de Espadas', keywords: ['conflicto', 'derrota', 'pérdida', 'traición'] },
  'Six of Swords': { nombre: 'Seis de Espadas', keywords: ['transición', 'cambio', 'viaje', 'recuperación'] },
  'Seven of Swords': { nombre: 'Siete de Espadas', keywords: ['engaño', 'estrategia', 'astucia', 'traición'] },
  'Eight of Swords': { nombre: 'Ocho de Espadas', keywords: ['restricción', 'confusión', 'trampa', 'victimización'] },
  'Nine of Swords': { nombre: 'Nueve de Espadas', keywords: ['ansiedad', 'preocupación', 'miedo', 'pesadillas'] },
  'Ten of Swords': { nombre: 'Diez de Espadas', keywords: ['final doloroso', 'traición', 'colapso', 'victimización'] },
  'Page of Swords': { nombre: 'Sota de Espadas', keywords: ['curiosidad', 'vigilancia', 'comunicación', 'ideas nuevas'] },
  'Knight of Swords': { nombre: 'Caballero de Espadas', keywords: ['acción rápida', 'ambición', 'impulsividad', 'determinación'] },
  'Queen of Swords': { nombre: 'Reina de Espadas', keywords: ['claridad', 'percepción', 'independencia', 'objetividad'] },
  'King of Swords': { nombre: 'Rey de Espadas', keywords: ['autoridad intelectual', 'verdad', 'poder mental', 'ética'] },
  
  // BASTOS (14 cartas)
  'Ace of Wands': { nombre: 'As de Bastos', keywords: ['inspiración', 'nuevos proyectos', 'crecimiento', 'potencial'] },
  'Two of Wands': { nombre: 'Dos de Bastos', keywords: ['planificación', 'decisiones', 'descubrimiento', 'progreso'] },
  'Three of Wands': { nombre: 'Tres de Bastos', keywords: ['expansión', 'previsión', 'exploración', 'oportunidades'] },
  'Four of Wands': { nombre: 'Cuatro de Bastos', keywords: ['celebración', 'armonía', 'hogar', 'reunión'] },
  'Five of Wands': { nombre: 'Cinco de Bastos', keywords: ['conflicto', 'competencia', 'desacuerdo', 'tensión'] },
  'Six of Wands': { nombre: 'Seis de Bastos', keywords: ['victoria', 'reconocimiento', 'éxito', 'progreso'] },
  'Seven of Wands': { nombre: 'Siete de Bastos', keywords: ['desafío', 'perseverancia', 'defensa', 'determinación'] },
  'Eight of Wands': { nombre: 'Ocho de Bastos', keywords: ['movimiento rápido', 'progreso', 'acción', 'noticias'] },
  'Nine of Wands': { nombre: 'Nueve de Bastos', keywords: ['resistencia', 'persistencia', 'prueba', 'coraje'] },
  'Ten of Wands': { nombre: 'Diez de Bastos', keywords: ['carga', 'responsabilidad', 'estrés', 'obligación'] },
  'Page of Wands': { nombre: 'Sota de Bastos', keywords: ['entusiasmo', 'exploración', 'descubrimiento', 'energía'] },
  'Knight of Wands': { nombre: 'Caballero de Bastos', keywords: ['aventura', 'pasión', 'energía', 'impulsividad'] },
  'Queen of Wands': { nombre: 'Reina de Bastos', keywords: ['confianza', 'determinación', 'independencia', 'vibrante'] },
  'King of Wands': { nombre: 'Rey de Bastos', keywords: ['liderazgo', 'visión', 'emprendimiento', 'honra'] },
  
  // OROS/PENTÁCULOS (14 cartas)
  'Ace of Pentacles': { nombre: 'As de Oros', keywords: ['nueva oportunidad financiera', 'prosperidad', 'manifestación', 'abundancia'] },
  'Two of Pentacles': { nombre: 'Dos de Oros', keywords: ['equilibrio', 'adaptabilidad', 'prioridades', 'tiempo'] },
  'Three of Pentacles': { nombre: 'Tres de Oros', keywords: ['trabajo en equipo', 'colaboración', 'aprendizaje', 'implementación'] },
  'Four of Pentacles': { nombre: 'Cuatro de Oros', keywords: ['control', 'seguridad', 'conservación', 'posesión'] },
  'Five of Pentacles': { nombre: 'Cinco de Oros', keywords: ['dificultad financiera', 'pobreza', 'aislamiento', 'preocupación'] },
  'Six of Pentacles': { nombre: 'Seis de Oros', keywords: ['generosidad', 'caridad', 'compartir', 'prosperidad'] },
  'Seven of Pentacles': { nombre: 'Siete de Oros', keywords: ['evaluación', 'recompensa', 'inversión', 'visión a largo plazo'] },
  'Eight of Pentacles': { nombre: 'Ocho de Oros', keywords: ['aprendizaje', 'habilidad', 'dedicación', 'detalle'] },
  'Nine of Pentacles': { nombre: 'Nueve de Oros', keywords: ['independencia', 'lujo', 'autosuficiencia', 'logro'] },
  'Ten of Pentacles': { nombre: 'Diez de Oros', keywords: ['riqueza', 'herencia', 'familia', 'tradición'] },
  'Page of Pentacles': { nombre: 'Sota de Oros', keywords: ['ambición', 'deseo', 'diligencia', 'nuevas metas'] },
  'Knight of Pentacles': { nombre: 'Caballero de Oros', keywords: ['eficiencia', 'rutina', 'conservadurismo', 'trabajo duro'] },
  'Queen of Pentacles': { nombre: 'Reina de Oros', keywords: ['practicidad', 'crianza', 'seguridad', 'abundancia'] },
  'King of Pentacles': { nombre: 'Rey de Oros', keywords: ['riqueza', 'negocios', 'liderazgo', 'seguridad'] }
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

// Interpretación básica DINÁMICA (fallback sin AL-E)
function generarInterpretacionBasica(tarot, numerologia, astrologia, pregunta) {
  // Datos reales
  const numeroVida = numerologia.life_path_number || numerologia.numero_vida || 'desconocido';
  const signo = astrologia.signo;
  const elemento = astrologia.elemento;
  const cartaNombre = tarot.nombre;
  const keywords = tarot.keywords;
  
  // Generar título dinámico
  const titulo = `${cartaNombre}: Tu Guía del ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`;
  
  // Generar resumen dinámico basado en keywords
  const resumen = `Las energías de ${keywords[0]} y ${keywords[1]} se activan hoy en tu camino como ${signo}.`;
  
  // Generar lectura personalizada
  const lectura = `
La carta ${cartaNombre} emerge de las profundidades para guiarte. Sus energías hablan de ${keywords.join(', ')}. 

Como portador del número de camino de vida ${numeroVida}, estas vibraciones resuenan profundamente con tu propósito. Tu naturaleza ${signo} (elemento ${elemento}) te invita a integrar estas enseñanzas de manera ${elemento === 'Fuego' ? 'apasionada y valiente' : elemento === 'Agua' ? 'emocional e intuitiva' : elemento === 'Tierra' ? 'práctica y sólida' : 'mental y comunicativa'}.

${pregunta ? `Sobre tu pregunta, ${cartaNombre} te señala hacia ${keywords[keywords.length - 1]}. Las señales están ahí, invitándote a ${keywords[2] || keywords[0]}.` : `El universo te invita hoy a enfocarte en ${keywords[2] || keywords[0]}.`}

Recuerda: cada carta es un espejo de tu interior. ${cartaNombre} no predice, sino que revela lo que ya habita en ti.
  `.trim();
  
  // Consejos dinámicos basados en la carta
  const consejosBase = {
    'abundancia': 'Reconoce la riqueza que ya existe en tu vida',
    'acción': 'Es momento de pasar del pensamiento a la manifestación',
    'amor': 'Abre tu corazón a dar y recibir sin condiciones',
    'cambio': 'Suelta el control y fluye con las transformaciones',
    'claridad': 'Busca momentos de silencio para escuchar tu verdad interior',
    'compasión': 'Sé gentil contigo mientras navegas este proceso',
    'intuición': 'Confía en esas señales sutiles que recibes',
    'liberación': 'Identifica qué necesitas soltar para avanzar',
    'transformación': 'Permítete renacer, el cambio es tu aliado',
    'verdad': 'Habla tu verdad con claridad y amor'
  };
  
  const consejos = [];
  
  // Agregar consejo basado en las keywords de la carta
  keywords.forEach(kw => {
    const match = Object.keys(consejosBase).find(key => kw.includes(key));
    if (match && consejos.length < 3) {
      consejos.push(consejosBase[match]);
    }
  });
  
  // Completar con consejos universales si faltan
  if (consejos.length < 3) {
    consejos.push('Mantén tu atención en el presente, ahí está tu poder');
    consejos.push('Honra tus emociones sin juzgarlas');
    consejos.push('Confía en el proceso, incluso cuando no veas el camino completo');
  }
  
  // Afirmación dinámica basada en el signo
  const afirmaciones = {
    'Aries': 'Tengo el coraje para comenzar lo que mi alma desea',
    'Tauro': 'Estoy arraigado en mi valor y confío en mi estabilidad',
    'Géminis': 'Mi mente es clara y mi comunicación es auténtica',
    'Cáncer': 'Mis emociones son mi guía hacia la sabiduría',
    'Leo': 'Brillo con mi luz única y auténtica',
    'Virgo': 'Sirvo con propósito y me permito la imperfección',
    'Libra': 'Encuentro balance entre dar y recibir',
    'Escorpio': 'Me transformo y renazco con cada ciclo',
    'Sagitario': 'Mi búsqueda de verdad me expande infinitamente',
    'Capricornio': 'Construyo mi legado con paciencia y disciplina',
    'Acuario': 'Mi visión única contribuye a la evolución colectiva',
    'Piscis': 'Fluyo con las mareas de la vida y confío en lo invisible'
  };
  
  const afirmacion = afirmaciones[signo] || 'Estoy exactamente donde necesito estar en este momento';
  
  return {
    titulo,
    resumen,
    lectura,
    consejos,
    afirmacion,
    cierre: `Que ${cartaNombre} ilumine tu camino hoy. Con amor, KUNNA 💚`
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
    
    console.log('[holistico] Nueva lectura para:', fecha_nacimiento, 'nombre:', name);
    
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
        
        // Preparar body JSON (formato: birthdate, full_name)
        const requestBody = {
          birthdate: fecha_nacimiento,
          full_name: name || 'Unknown'
        };
        
        console.log('[holistico] RapidAPI request body:', requestBody);
        
        // POST request con JSON body según documentación oficial
        const numeroRes = await fetch(`https://${RAPIDAPI_HOST}/life_path`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
          },
          body: JSON.stringify(requestBody),
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
