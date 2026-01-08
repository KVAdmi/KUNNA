/**
 * KUNNA CORE ENGINE - REGLAS V1 (JS)
 * 
 * Reglas determinísticas en JavaScript puro.
 */

import { EVENT_TYPES, ACTION_TYPES, RISK_LEVELS } from './kceTypes.js';
import kceStateStore from './kceStateStore.js';

/**
 * REGLA 1: Check-in fallido dos veces
 */
export const checkinFailedTwiceRule = {
  name: 'checkin_failed_twice',
  description: 'Dos check-ins fallidos en 120 minutos → verificación silenciosa',
  
  evaluate(event) {
    if (event.event_type !== EVENT_TYPES.CHECKIN_FAILED) {
      return { shouldTrigger: false, actions: [], riskLevel: RISK_LEVELS.NORMAL };
    }

    const failedCount = kceStateStore.countEventsInWindow(
      event.user_id,
      EVENT_TYPES.CHECKIN_FAILED,
      120 * 60 * 1000
    );

    if (failedCount + 1 >= 2) {
      const currentState = kceStateStore.getUserState(event.user_id);
      
      if (currentState.current_state === 'observing') {
        return {
          shouldTrigger: true,
          actions: [{
            action_type: ACTION_TYPES.SEND_SILENT_VERIFICATION,
            payload: {
              message: '¿Estás bien? Fallaste 2 check-ins recientes.',
              timeout_seconds: 180
            }
          }],
          riskLevel: RISK_LEVELS.ALERT
        };
      }
    }

    return { shouldTrigger: false, actions: [], riskLevel: RISK_LEVELS.NORMAL };
  }
};

/**
 * REGLA 2: Inactividad + diario con palabras gatillo
 */
export const inactivityPlusDiaryRiskRule = {
  name: 'inactivity_plus_diary_risk',
  description: 'Inactividad + diario con palabras gatillo → alerta círculo',
  
  evaluate(event) {
    if (event.event_type !== EVENT_TYPES.INACTIVITY) {
      return { shouldTrigger: false, actions: [], riskLevel: RISK_LEVELS.NORMAL };
    }

    const recentEvents = kceStateStore.getUserState(event.user_id).event_history;
    const now = new Date().getTime();
    
    const recentDiaryEntry = recentEvents.find(e => {
      const eventTime = new Date(e.timestamp).getTime();
      const withinWindow = now - eventTime < 60 * 60 * 1000;
      return e.event_type === EVENT_TYPES.DIARY_ENTRY && withinWindow;
    });

    if (recentDiaryEntry) {
      const context = (event.metadata.context || '').toLowerCase();
      const triggerWords = ['miedo', 'no puedo', 'me siento sola', 'ayuda', 'asustada', 'peligro', 'amenaza'];
      const hasTriggerWord = triggerWords.some(word => context.includes(word));

      if (hasTriggerWord) {
        const currentState = kceStateStore.getUserState(event.user_id);
        
        if (currentState.current_state === 'observing' || currentState.current_state === 'verifying') {
          return {
            shouldTrigger: true,
            actions: [{
              action_type: ACTION_TYPES.ALERT_TRUST_CIRCLE,
              payload: {
                reason: 'Inactividad detectada con contexto emocional de riesgo',
                include_last_location: true
              }
            }],
            riskLevel: RISK_LEVELS.RISK
          };
        }
      }
    }

    return { shouldTrigger: false, actions: [], riskLevel: RISK_LEVELS.NORMAL };
  }
};

/**
 * REGLA 3: SOS manual o nivel crítico
 */
export const criticalOrManualSOSRule = {
  name: 'critical_or_manual_sos',
  description: 'SOS manual o crítico → escalamiento completo',
  
  evaluate(event) {
    const isCritical = event.metadata.risk_level === RISK_LEVELS.CRITICAL;
    const isManualSOS = event.event_type === EVENT_TYPES.SOS_MANUAL;

    if (isCritical || isManualSOS) {
      return {
        shouldTrigger: true,
        actions: [
          {
            action_type: ACTION_TYPES.ESCALATE_FULL_SOS,
            payload: {
              trigger_type: isManualSOS ? 'manual' : 'automatic',
              timestamp: event.timestamp
            }
          },
          {
            action_type: ACTION_TYPES.START_EVIDENCE_RECORDING,
            payload: {
              record_audio: true,
              record_video: false,
              gps_interval_seconds: 10
            }
          },
          {
            action_type: ACTION_TYPES.ALERT_TRUST_CIRCLE,
            payload: {
              reason: 'SOS activado',
              urgency: 'critical',
              include_tracking_link: true
            }
          }
        ],
        riskLevel: RISK_LEVELS.CRITICAL
      };
    }

    return { shouldTrigger: false, actions: [], riskLevel: RISK_LEVELS.NORMAL };
  }
};

/**
 * Colección de todas las reglas (orden = prioridad)
 */
export const ALL_RULES = [
  criticalOrManualSOSRule,
  inactivityPlusDiaryRiskRule,
  checkinFailedTwiceRule
];
