/**
 * KUNNA CORE ENGINE - CLIENTE DE EVENTOS (JS)
 * 
 * API simplificada para emitir eventos desde cualquier punto.
 */

import kunnaCoreEngine from './kunnaCoreEngine.js';
import kceExecutor from './kceExecutor.js';
import { createKCEEvent, EVENT_TYPES, RISK_LEVELS } from './kceTypes.js';

class KCEEventsClient {
  async emit(userId, eventType, options = {}) {
    const event = createKCEEvent(userId, eventType, {
      source: options.source || 'app',
      risk_level: options.riskLevel || RISK_LEVELS.NORMAL,
      context: options.context,
      extra: options.extra
    });

    console.log(`📤 KCE Events: Emitiendo ${eventType} para usuario ${userId}`);

    const decision = await kunnaCoreEngine.processEvent(event);

    if (options.autoExecute !== false && decision.actions.length > 0) {
      await kceExecutor.execute(decision);
    }

    return decision;
  }

  async checkInFailed(userId, context) {
    return await this.emit(userId, EVENT_TYPES.CHECKIN_FAILED, {
      source: 'agenda',
      riskLevel: RISK_LEVELS.ALERT,
      context: context || 'Check-in no completado en el tiempo esperado'
    });
  }

  async checkInCompleted(userId, context) {
    return await this.emit(userId, EVENT_TYPES.CHECKIN_COMPLETED, {
      source: 'agenda',
      riskLevel: RISK_LEVELS.NORMAL,
      context: context || 'Check-in completado exitosamente'
    });
  }

  async inactivityDetected(userId, inactiveMinutes) {
    return await this.emit(userId, EVENT_TYPES.INACTIVITY, {
      source: 'system',
      riskLevel: inactiveMinutes > 60 ? RISK_LEVELS.ALERT : RISK_LEVELS.NORMAL,
      context: `Usuario inactivo por ${inactiveMinutes} minutos`,
      extra: { inactive_minutes: inactiveMinutes }
    });
  }

  async diaryEntry(userId, content, mood) {
    return await this.emit(userId, EVENT_TYPES.DIARY_ENTRY, {
      source: 'diary',
      riskLevel: RISK_LEVELS.NORMAL,
      context: content,
      extra: { mood }
    });
  }

  async sosManual(userId, triggerMethod) {
    return await this.emit(userId, EVENT_TYPES.SOS_MANUAL, {
      source: 'app',
      riskLevel: RISK_LEVELS.CRITICAL,
      context: 'SOS activado manualmente por la usuaria',
      extra: { trigger_method: triggerMethod || 'button' }
    });
  }

  async confirmSafe(userId) {
    await kunnaCoreEngine.userConfirmedSafe(userId);
  }

  getUserState(userId) {
    return kunnaCoreEngine.getUserState(userId);
  }

  async getUserDecisions(userId, limit = 10) {
    return kunnaCoreEngine.getUserDecisions(userId, limit);
  }
}

const kceEvents = new KCEEventsClient();
export default kceEvents;
export { kceEvents };
