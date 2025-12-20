// src/services/holisticoApi.js
// Helper para consumir Zona Holística (Netlify Function)

/**
 * Obtiene lectura holística unificada (Tarot + Numerología + Astrología + AL-E)
 * @param {Object} payload
 * @param {string} payload.fecha_nacimiento - Formato YYYY-MM-DD
 * @param {string} [payload.pregunta] - Pregunta opcional del usuario
 * @param {string} [payload.name] - Nombre opcional para numerología
 * @returns {Promise<Object>} Lectura holística
 */
export async function getHolisticoReading({ fecha_nacimiento, pregunta, name }) {
  try {
    // Validación básica
    if (!fecha_nacimiento) {
      throw new Error('fecha_nacimiento es requerida');
    }

    // Determinar URL según entorno
    const isProduction = window.location.hostname === 'kunna.help';
    const baseURL = isProduction 
      ? 'https://kunna.help' 
      : 'http://localhost:8888'; // netlify dev usa puerto 8888

    const url = `${baseURL}/.netlify/functions/holistico-reading`;

    console.log('[holisticoApi] Consultando:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fecha_nacimiento,
        pregunta: pregunta || null,
        name: name || null
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    // Validar estructura de respuesta
    if (!data.ok) {
      throw new Error(data.error?.message || 'Lectura no disponible');
    }

    console.log('[holisticoApi] ✅ Lectura obtenida', {
      source: data.source,
      hasInterpretacion: !!data.interpretacion
    });

    return data;

  } catch (error) {
    console.error('[holisticoApi] Error:', error);
    throw error;
  }
}

/**
 * Formatea la lectura para mostrar en UI
 * @param {Object} reading - Respuesta de getHolisticoReading
 * @returns {Object} Lectura formateada
 */
export function formatHolisticoReading(reading) {
  if (!reading || !reading.ok) {
    return {
      titulo: 'Lectura no disponible',
      contenido: 'No se pudo generar la lectura en este momento.',
      warnings: []
    };
  }

  const { tarot, numerologia, astrologia, interpretacion, warnings, source } = reading;

  return {
    // Datos crudos
    tarot: {
      nombre: tarot.nombre,
      keywords: tarot.keywords,
      imagen: tarot.imagen
    },
    numerologia: {
      numero: numerologia.numero_vida || numerologia.life_path_number,
      source: source.numerologia
    },
    astrologia: {
      signo: astrologia.signo,
      elemento: astrologia.elemento
    },

    // Interpretación AL-E (o básica)
    interpretacion: {
      titulo: interpretacion.titulo,
      resumen: interpretacion.resumen,
      lectura: interpretacion.lectura,
      consejos: interpretacion.consejos || [],
      afirmacion: interpretacion.afirmacion,
      cierre: interpretacion.cierre
    },

    // Metadata
    usandoALE: source.ale,
    warnings: warnings || [],
    timestamp: reading.timestamp
  };
}

export default {
  getHolisticoReading,
  formatHolisticoReading
};
