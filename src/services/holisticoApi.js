// src/services/holisticoApi.js
// Helper para consumir Zona Holística (Supabase Edge Function)

import { supabase } from '../lib/supabaseClient';

/**
 * Obtiene lectura holística unificada (Tarot + Numerología + Astrología)
 * @param {Object} payload
 * @param {string} payload.fecha_nacimiento - Formato YYYY-MM-DD
 * @param {string} [payload.pregunta] - Pregunta opcional del usuario (no usado actualmente)
 * @param {string} [payload.name] - Nombre completo para numerología
 * @returns {Promise<Object>} Lectura holística
 */
export async function getHolisticoReading({ fecha_nacimiento, pregunta, name }) {
  try {
    // Validación básica
    if (!fecha_nacimiento) {
      throw new Error('fecha_nacimiento es requerida');
    }

    if (!name) {
      throw new Error('name es requerido para numerología');
    }

    // Usar Supabase Edge Function (backend proxy seguro)
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/holistico-reading`;

    console.log('[holisticoApi] Consultando Edge Function:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        birthdate: fecha_nacimiento,
        full_name: name,
        includeNumerology: true,
        includeTarot: true,
        includeAstrology: false // Agregar cuando tengas API
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    // Validar estructura de respuesta
    if (!data.ok) {
      throw new Error(data.error || 'Lectura no disponible');
    }

    console.log('[holisticoApi] ✅ Lectura obtenida desde Edge Function', {
      hasNumerology: !!data.data.numerology,
      hasTarot: !!data.data.tarot
    });

    return data.data; // La Edge Function envuelve en { ok: true, data: {...} }

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
  if (!reading) {
    return {
      titulo: 'Lectura no disponible',
      contenido: 'No se pudo generar la lectura en este momento.',
      warnings: []
    };
  }

  const { numerology, tarot, astrology } = reading;

  return {
    // Datos crudos
    tarot: tarot ? {
      nombre: tarot.name,
      keywords: tarot.keywords || [],
      imagen: tarot.image || null,
      significado: tarot.meaning || '',
      descripcion: tarot.desc || ''
    } : null,

    numerologia: numerology ? {
      lifePath: numerology.lifePath,
      destiny: numerology.destiny,
      soulUrge: numerology.soulUrge,
      personality: numerology.personality,
      maturity: numerology.maturity,
      birthDay: numerology.birthDay,
      personalYear: numerology.personalYear,
      universalYear: numerology.universalYear
    } : null,

    astrologia: astrology || null,

    // Metadata
    timestamp: reading.timestamp,
    user: reading.user
  };
}

export default {
  getHolisticoReading,
  formatHolisticoReading
};
