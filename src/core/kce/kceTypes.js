/**
 * KUNNA CORE ENGINE - TIPOS (JS)
 * 
 * Constantes y enums simulados para JavaScript puro.
 * Sin TypeScript, validación en runtime.
 */

// Niveles de riesgo
export const RISK_LEVELS = {
  NORMAL: 'normal',
  ALERT: 'alert',
  RISK: 'risk',
  CRITICAL: 'critical'
};

// Tipos de eventos
export const EVENT_TYPES = {
  CHECKIN_FAILED: 'checkin_failed',
  CHECKIN_COMPLETED: 'checkin_completed',
  INACTIVITY: 'inactivity',
  DIARY_ENTRY: 'diary_entry',
  STATE_CHANGE: 'state_change',
  SOS_MANUAL: 'sos_manual'
};

// Tipos de acciones
export const ACTION_TYPES = {
  SEND_SILENT_VERIFICATION: 'send_silent_verification',
  ALERT_TRUST_CIRCLE: 'alert_trust_circle',
  ESCALATE_FULL_SOS: 'escalate_full_sos',
  START_EVIDENCE_RECORDING: 'start_evidence_recording',
  STOP_ESCALATION: 'stop_escalation'
};

// Estados de usuario SOS
export const USER_SOS_STATES = {
  OBSERVING: 'observing',
  VERIFYING: 'verifying',
  CIRCLE_ALERTED: 'circle_alerted',
  FULL_SOS: 'full_sos'
};

/**
 * Crear un evento KCE
 */
export function createKCEEvent(userId, eventType, metadata = {}) {
  return {
    event_id: crypto.randomUUID(),
    user_id: userId,
    event_type: eventType,
    timestamp: new Date().toISOString(),
    metadata: {
      source: metadata.source || 'app',
      risk_level: metadata.risk_level || RISK_LEVELS.NORMAL,
      context: metadata.context,
      extra: metadata.extra || {}
    }
  };
}

/**
 * Crear una acción KCE
 */
export function createKCEAction(actionType, payload = {}) {
  return {
    action_type: actionType,
    payload
  };
}

/**
 * Crear una decisión KCE
 */
export function createKCEDecision(userId, triggeredByEventId, appliedRule, actions, computedRiskLevel) {
  return {
    decision_id: crypto.randomUUID(),
    user_id: userId,
    triggered_by_event_id: triggeredByEventId,
    applied_rule: appliedRule,
    actions: actions || [],
    computed_risk_level: computedRiskLevel,
    timestamp: new Date().toISOString()
  };
}
