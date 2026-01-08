/**
 * Renderizador de Copys Seguros para AL-E en KUNNA
 * 
 * Reglas:
 * - Máximo 2 frases
 * - Siempre sugiere 1 acción (botón)
 * - Respeta stealth mode
 * - Sin copys prohibidos
 * - Solo estados permitidos (NORMAL/ALERTA/RIESGO/CRÍTICO)
 */

import {
  SAFETY_STATES,
  STATE_TEMPLATES,
  DEFAULT_SAFE_MESSAGE,
  hasForbiddenContent,
  hasCutTrigger,
  isValidState,
  sanitizeForStealth
} from './alePolicy';

/**
 * Renderiza copy seguro basado en estado y stealth mode
 * 
 * @param {string} safetyState - Estado: NORMAL | ALERTA | RIESGO | CRÍTICO
 * @param {boolean} stealthMode - Si está activo el modo discreto
 * @param {object} options - Opciones adicionales (customMessage, customAction)
 * @returns {object} { message, action, shouldEscalate }
 */
export function renderSafeCopy(safetyState, stealthMode = false, options = {}) {
  // Validar estado
  if (!isValidState(safetyState)) {
    console.warn(`⚠️ Estado inválido: ${safetyState}. Usando NORMAL.`);
    safetyState = SAFETY_STATES.NORMAL;
  }

  // Obtener template base
  let template = STATE_TEMPLATES[safetyState] || DEFAULT_SAFE_MESSAGE;

  // Si hay custom message/action, validar que sean seguros
  if (options.customMessage) {
    if (hasForbiddenContent(options.customMessage)) {
      console.error('❌ Custom message contiene copys prohibidos. Usando template base.');
      template = STATE_TEMPLATES[safetyState] || DEFAULT_SAFE_MESSAGE;
    } else {
      template = {
        message: options.customMessage,
        action: options.customAction || template.action
      };
    }
  }

  // Aplicar stealth mode si está activo
  let { message, action } = template;
  
  if (stealthMode) {
    message = sanitizeForStealth(message);
    action = sanitizeForStealth(action);
  }

  // Determinar si debe escalar (CRÍTICO siempre escala)
  const shouldEscalate = safetyState === SAFETY_STATES.CRÍTICO;

  return {
    message,
    action,
    shouldEscalate,
    state: safetyState
  };
}

/**
 * Renderiza copy para gatillo de corte (autolesión, violencia explícita)
 * En estos casos: mínimo texto, máxima acción, escalar inmediato
 * 
 * @param {boolean} stealthMode - Si está activo el modo discreto
 * @returns {object} { message, action, shouldEscalate }
 */
export function renderCutTriggerCopy(stealthMode = false) {
  let message = 'Voy a activar el protocolo. Mantente a salvo si puedes.';
  let action = 'Activar protocolo';

  if (stealthMode) {
    message = 'Voy a activar el seguimiento. Mantente a salvo si puedes.';
    action = 'Activar seguimiento';
  }

  return {
    message,
    action,
    shouldEscalate: true,
    state: SAFETY_STATES.CRÍTICO,
    cutTrigger: true
  };
}

/**
 * Analiza input del usuario y determina si contiene gatillos de corte
 * 
 * @param {string} userInput - Texto del usuario
 * @returns {boolean} True si contiene gatillos
 */
export function analyzeUserInput(userInput) {
  return hasCutTrigger(userInput);
}

/**
 * Genera notificación push segura (respeta stealth mode)
 * 
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo de la notificación
 * @param {boolean} stealthMode - Si está activo el modo discreto
 * @returns {object} { title, body }
 */
export function renderSafeNotification(title, body, stealthMode = false) {
  if (stealthMode) {
    // Notificaciones neutras en stealth mode
    return {
      title: 'Tienes una actualización',
      body: 'Abre la app para ver más detalles'
    };
  }

  // Sanitizar por si acaso
  return {
    title: hasForbiddenContent(title) ? 'Actualización' : title,
    body: hasForbiddenContent(body) ? 'Tienes una nueva actualización' : body
  };
}

/**
 * Valida que un copy cumple con el policy antes de mostrarlo
 * 
 * @param {string} text - Texto a validar
 * @returns {object} { isValid, error }
 */
export function validateCopy(text) {
  if (!text) {
    return { isValid: false, error: 'Texto vacío' };
  }

  if (hasForbiddenContent(text)) {
    return { 
      isValid: false, 
      error: 'Contiene copys prohibidos (diagnósticos, asunciones, consejos médicos/legales)' 
    };
  }

  // Validar longitud (máximo ~200 caracteres = ~2 frases)
  if (text.length > 200) {
    return { 
      isValid: false, 
      error: 'Copy demasiado largo. Máximo 2 frases.' 
    };
  }

  return { isValid: true };
}

/**
 * Obtiene el copy apropiado para un check-in fallido
 * 
 * @param {number} missedCount - Número de check-ins perdidos
 * @param {boolean} stealthMode - Si está activo el modo discreto
 * @returns {object} { message, action, state }
 */
export function getCheckInFailedCopy(missedCount, stealthMode = false) {
  let state;
  
  if (missedCount === 1) {
    state = SAFETY_STATES.NORMAL;
  } else if (missedCount === 2) {
    state = SAFETY_STATES.ALERTA;
  } else if (missedCount >= 3) {
    state = SAFETY_STATES.RIESGO;
  }

  return renderSafeCopy(state, stealthMode);
}

/**
 * Obtiene el copy apropiado para inactividad detectada
 * 
 * @param {number} hoursInactive - Horas de inactividad
 * @param {boolean} stealthMode - Si está activo el modo discreto
 * @returns {object} { message, action, state }
 */
export function getInactivityCopy(hoursInactive, stealthMode = false) {
  let state;
  
  if (hoursInactive < 4) {
    state = SAFETY_STATES.NORMAL;
  } else if (hoursInactive < 12) {
    state = SAFETY_STATES.ALERTA;
  } else {
    state = SAFETY_STATES.RIESGO;
  }

  return renderSafeCopy(state, stealthMode);
}

// Export default para conveniencia
export default {
  renderSafeCopy,
  renderCutTriggerCopy,
  analyzeUserInput,
  renderSafeNotification,
  validateCopy,
  getCheckInFailedCopy,
  getInactivityCopy
};
