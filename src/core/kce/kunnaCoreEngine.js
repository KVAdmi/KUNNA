/**
 * KUNNA CORE ENGINE - MOTOR PRINCIPAL (JS)
 * 
 * Orquestador central en JavaScript puro.
 */

import { createKCEDecision, USER_SOS_STATES, ACTION_TYPES } from './kceTypes.js';
import { ALL_RULES } from './kceRules.js';
import kceStateStore from './kceStateStore.js';
import kceLogger from './kceLogger.js';

class KunnaCoreEngine {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized) {
      console.warn('⚠️ KCE ya está inicializado');
      return;
    }
    console.log('🚀 Kunna Core Engine iniciado');
    this.initialized = true;
  }

  async processEvent(event) {
    if (!this.initialized) {
      this.init();
    }

    console.log(`📥 KCE: Procesando evento ${event.event_type} de usuario ${event.user_id}`);

    // 1. Registrar evento
    kceStateStore.recordEvent(event);

    // 2. Evaluar reglas
    let appliedRule = undefined;
    let actions = [];
    let computedRiskLevel = event.metadata.risk_level || 'normal';

    for (const rule of ALL_RULES) {
      const result = rule.evaluate(event);
      
      if (result.shouldTrigger) {
        console.log(`✅ KCE: Regla aplicada → ${rule.name}`);
        appliedRule = rule.name;
        actions = result.actions;
        computedRiskLevel = result.riskLevel;
        
        // 3. Actualizar estado
        this.updateUserStateBasedOnRisk(event.user_id, computedRiskLevel, actions);
        
        break;
      }
    }

    // 4. Crear decisión
    const decision = createKCEDecision(
      event.user_id,
      event.event_id,
      appliedRule,
      actions,
      computedRiskLevel
    );

    // 5. Auditar
    await kceLogger.logDecision(decision);

    console.log(`📤 KCE: Decisión generada con ${actions.length} acción(es)`);
    
    return decision;
  }

  updateUserStateBasedOnRisk(userId, riskLevel, actions) {
    const currentState = kceStateStore.getUserState(userId);
    
    if (actions.some(a => a.action_type === ACTION_TYPES.ESCALATE_FULL_SOS)) {
      kceStateStore.updateUserState(userId, USER_SOS_STATES.FULL_SOS);
    } else if (actions.some(a => a.action_type === ACTION_TYPES.ALERT_TRUST_CIRCLE)) {
      if (currentState.current_state !== USER_SOS_STATES.FULL_SOS) {
        kceStateStore.updateUserState(userId, USER_SOS_STATES.CIRCLE_ALERTED);
      }
    } else if (actions.some(a => a.action_type === ACTION_TYPES.SEND_SILENT_VERIFICATION)) {
      if (currentState.current_state === USER_SOS_STATES.OBSERVING) {
        kceStateStore.updateUserState(userId, USER_SOS_STATES.VERIFYING);
      }
    } else if (actions.some(a => a.action_type === ACTION_TYPES.STOP_ESCALATION)) {
      kceStateStore.resetUserState(userId);
    }
  }

  async userConfirmedSafe(userId) {
    console.log(`✅ KCE: Usuario ${userId} confirmó que está bien`);
    kceStateStore.resetUserState(userId);
    
    const confirmEvent = {
      event_id: crypto.randomUUID(),
      user_id: userId,
      event_type: 'state_change',
      timestamp: new Date().toISOString(),
      metadata: {
        source: 'system',
        risk_level: 'normal',
        context: 'user_confirmed_safe'
      }
    };
    
    await this.processEvent(confirmEvent);
  }

  getUserState(userId) {
    return kceStateStore.getUserState(userId);
  }

  async getUserDecisions(userId, limit = 10) {
    return kceLogger.getDecisionsByUser(userId, limit);
  }
}

const kunnaCoreEngine = new KunnaCoreEngine();
export default kunnaCoreEngine;
