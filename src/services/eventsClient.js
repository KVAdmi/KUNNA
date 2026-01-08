/**
 * Events Client - Cliente para comunicarse con Netlify Functions de AL-E
 * 
 * SEGURIDAD: Nunca expone tokens en frontend
 * Todas las llamadas pasan por Netlify Functions que tienen los service tokens
 * 
 * Endpoints:
 * - POST /.netlify/functions/ale-events → Emitir evento a AL-E Core
 * - POST /.netlify/functions/ale-decide → Solicitar decisión de AL-E Core
 */

// Detectar base URL (dev vs production)
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:8888'; // Netlify Dev local
  }
  return import.meta.env.VITE_KUNNA_PUBLIC_URL || window.location.origin;
};

const BASE_URL = getBaseURL();

/**
 * Enviar evento a AL-E Core via Netlify Function
 * 
 * @param {string} eventType - Tipo de evento
 * @param {object} payload - Datos del evento
 * @returns {Promise<object>} { success, coreEventId, error }
 */
export async function sendEvent(eventType, payload) {
  try {
    const response = await fetch(`${BASE_URL}/.netlify/functions/ale-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventType,
        payload
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      coreEventId: result.coreEventId,
      outboxId: result.outboxId
    };
  } catch (error) {
    console.error('❌ Error enviando evento:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Solicitar decisión a AL-E Core via Netlify Function
 * 
 * @param {string} userId - ID del usuario
 * @param {string} coreEventId - ID del evento (opcional)
 * @param {object} context - Contexto adicional
 * @returns {Promise<object>} { success, decisionId, actions, error }
 */
export async function requestDecision(userId, coreEventId = null, context = {}) {
  try {
    const response = await fetch(`${BASE_URL}/.netlify/functions/ale-decide`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        coreEventId,
        context
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      decisionId: result.decisionId,
      actions: result.actions || []
    };
  } catch (error) {
    console.error('❌ Error solicitando decisión:', error);
    return {
      success: false,
      error: error.message,
      actions: []
    };
  }
}

/**
 * Helpers específicos por tipo de evento (con validación)
 */

/**
 * Check-in fallido
 */
export async function emitCheckInFailed(userId, checkInId, missedCount = 1) {
  return await sendEvent('checkin_failed', {
    user_id: userId,
    check_in_id: checkInId,
    missed_count: missedCount,
    timestamp: new Date().toISOString()
  });
}

/**
 * Inactividad detectada
 */
export async function emitInactivity(userId, hoursInactive, lastActivity) {
  return await sendEvent('inactivity', {
    user_id: userId,
    hours_inactive: hoursInactive,
    last_activity: lastActivity,
    timestamp: new Date().toISOString()
  });
}

/**
 * Entrada de diario (solo metadatos, no contenido completo)
 */
export async function emitDiaryEntry(userId, entryId, metadata = {}) {
  return await sendEvent('diary_entry', {
    user_id: userId,
    entry_id: entryId,
    // Solo enviar metadatos seguros (no contenido sensible)
    word_count: metadata.wordCount || 0,
    has_media: metadata.hasMedia || false,
    duration_seconds: metadata.durationSeconds || 0,
    timestamp: new Date().toISOString()
  });
}

/**
 * SOS manual activado
 * IMPORTANTE: Ejecutar protocolo local ANTES de llamar esto
 */
export async function emitSOSManual(userId, location = null, trigger = 'manual') {
  return await sendEvent('sos_manual', {
    user_id: userId,
    trigger,
    location: location ? {
      lat: location.latitude,
      lng: location.longitude,
      accuracy: location.accuracy
    } : null,
    timestamp: new Date().toISOString()
  });
}

/**
 * Cambio de estado
 */
export async function emitStateChange(userId, fromState, toState, reason = null) {
  return await sendEvent('state_change', {
    user_id: userId,
    from_state: fromState,
    to_state: toState,
    reason,
    timestamp: new Date().toISOString()
  });
}

/**
 * Actualización de actividad (heartbeat)
 */
export async function updateActivity(userId) {
  try {
    // No enviar a Core, solo actualizar en Supabase KUNNA
    // Esto se hace directamente en el backend con RPC
    const { supabase } = await import('../lib/supabaseClient');
    
    const { error } = await supabase.rpc('update_last_activity', {
      p_user_id: userId
    });

    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error actualizando actividad:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verificar conectividad con backend (health check)
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BASE_URL}/.netlify/functions/ale-events`, {
      method: 'OPTIONS'
    });
    return response.ok;
  } catch (error) {
    console.error('Backend no disponible:', error);
    return false;
  }
}

// Export default para conveniencia
export default {
  sendEvent,
  requestDecision,
  emitCheckInFailed,
  emitInactivity,
  emitDiaryEntry,
  emitSOSManual,
  emitStateChange,
  updateActivity,
  checkBackendHealth
};
