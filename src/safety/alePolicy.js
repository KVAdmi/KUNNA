/**
 * AL-E Policy para KUNNA
 * Fuente de verdad para estados, copys y reglas de seguridad
 * 
 * Basado en: /docs/ale/AL-E_KUNNA_POLICY.md
 */

// ============================================
// ESTADOS PERMITIDOS (4 únicos)
// ============================================
export const SAFETY_STATES = {
  NORMAL: 'NORMAL',
  ALERTA: 'ALERTA',
  RIESGO: 'RIESGO',
  CRÍTICO: 'CRÍTICO'
};

// ============================================
// PLANTILLAS BASE POR ESTADO
// ============================================
export const STATE_TEMPLATES = {
  [SAFETY_STATES.NORMAL]: {
    message: 'Todo en orden. Si quieres, activa modo discreto.',
    action: 'Activar modo discreto'
  },
  [SAFETY_STATES.ALERTA]: {
    message: '¿Estás bien? Si quieres, puedo avisar a tu círculo.',
    action: 'Avisar a mi círculo'
  },
  [SAFETY_STATES.RIESGO]: {
    message: 'Estoy contigo. Podemos avisar a tu círculo ahora.',
    action: 'Avisar ahora'
  },
  [SAFETY_STATES.CRÍTICO]: {
    message: 'Voy a activar el protocolo. Mantente a salvo si puedes.',
    action: 'Activar protocolo'
  }
};

// ============================================
// COPYS PROHIBIDOS (Bloqueador Legal/Ético)
// ============================================
export const FORBIDDEN_PHRASES = [
  // Diagnósticos
  'depresión',
  'ansiedad clínica',
  'trastorno',
  'diagnóstico',
  
  // Asunciones de violencia
  'estás siendo agredida',
  'tu pareja',
  'abusador',
  'maltrato',
  
  // Consejos médicos/legales
  'deberías denunciar',
  'deberías medicarte',
  'toma medicación',
  'consulta a un abogado',
  
  // Asunciones de intención
  'sabemos que',
  'detectamos que',
  'creemos que',
  'parece que estás'
];

// ============================================
// TÉRMINOS SENSIBLES (Ocultar en Stealth Mode)
// ============================================
export const STEALTH_SENSITIVE_TERMS = [
  'SOS',
  'Evidencia',
  'Ayuda',
  'Pánico',
  'Emergencia',
  'Alerta',
  'Círculo de confianza',
  'Acompañamiento',
  'Riesgo'
];

// ============================================
// REEMPLAZOS NEUTROS (Stealth Mode ON)
// ============================================
export const STEALTH_REPLACEMENTS = {
  'SOS': 'Acción rápida',
  'Evidencia': 'Registro',
  'Ayuda': 'Apoyo',
  'Pánico': 'Urgente',
  'Emergencia': 'Situación',
  'Alerta': 'Aviso',
  'Círculo de confianza': 'Contactos',
  'Acompañamiento': 'Seguimiento',
  'Riesgo': 'Estado'
};

// ============================================
// GATILLOS DE CORTE (Escalar y Callar)
// ============================================
export const CUT_TRIGGERS = [
  'suicidio',
  'matarme',
  'acabar con mi vida',
  'autolesión',
  'cortarme',
  'violencia',
  'amenaza',
  'me van a matar',
  'me quiero morir'
];

// ============================================
// MENSAJE POR DEFECTO (Regla Final)
// ============================================
export const DEFAULT_SAFE_MESSAGE = {
  message: 'No puedo asumir eso. Puedo ayudarte a activar una acción segura.',
  action: 'Ver opciones'
};

// ============================================
// VALIDACIONES
// ============================================

/**
 * Verifica si un texto contiene copys prohibidos
 */
export function hasForbiddenContent(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return FORBIDDEN_PHRASES.some(phrase => lowerText.includes(phrase.toLowerCase()));
}

/**
 * Verifica si un texto contiene gatillos de corte
 */
export function hasCutTrigger(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return CUT_TRIGGERS.some(trigger => lowerText.includes(trigger.toLowerCase()));
}

/**
 * Verifica si un estado es válido
 */
export function isValidState(state) {
  return Object.values(SAFETY_STATES).includes(state);
}

/**
 * Sanitiza texto para stealth mode
 */
export function sanitizeForStealth(text) {
  if (!text) return text;
  
  let sanitized = text;
  Object.entries(STEALTH_REPLACEMENTS).forEach(([sensitive, neutral]) => {
    const regex = new RegExp(sensitive, 'gi');
    sanitized = sanitized.replace(regex, neutral);
  });
  
  return sanitized;
}
