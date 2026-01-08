/**
 * KUNNA CORE ENGINE - STATE STORE (JS)
 * 
 * Gestión de estados de usuario en JavaScript puro.
 */

import { USER_SOS_STATES, EVENT_TYPES } from './kceTypes.js';

class KCEStateStore {
  constructor() {
    this.userStates = new Map();
    this.EVENT_WINDOW_MS = 2 * 60 * 60 * 1000; // 120 minutos
  }

  getUserState(userId) {
    if (!this.userStates.has(userId)) {
      this.userStates.set(userId, {
        user_id: userId,
        current_state: USER_SOS_STATES.OBSERVING,
        last_updated: new Date().toISOString(),
        event_history: []
      });
    }
    return this.userStates.get(userId);
  }

  updateUserState(userId, newState) {
    const current = this.getUserState(userId);
    const stateOrder = [
      USER_SOS_STATES.OBSERVING,
      USER_SOS_STATES.VERIFYING,
      USER_SOS_STATES.CIRCLE_ALERTED,
      USER_SOS_STATES.FULL_SOS
    ];
    
    const currentIndex = stateOrder.indexOf(current.current_state);
    const newIndex = stateOrder.indexOf(newState);

    // No saltar niveles (excepto resetear a observing)
    if (newState !== USER_SOS_STATES.OBSERVING && newIndex > currentIndex + 1) {
      console.warn(`⚠️ KCE: Intento de saltar niveles bloqueado. De ${current.current_state} a ${newState}`);
      return;
    }

    current.current_state = newState;
    current.last_updated = new Date().toISOString();
    
    console.log(`🔄 KCE State: Usuario ${userId} → ${newState}`);
  }

  recordEvent(event) {
    const state = this.getUserState(event.user_id);
    state.event_history.push({
      event_id: event.event_id,
      event_type: event.event_type,
      timestamp: event.timestamp
    });

    // Limpiar eventos antiguos
    const now = new Date().getTime();
    state.event_history = state.event_history.filter(e => {
      const eventTime = new Date(e.timestamp).getTime();
      return now - eventTime < this.EVENT_WINDOW_MS;
    });
  }

  getRecentEvents(userId, eventType, windowMs) {
    const state = this.getUserState(userId);
    const now = new Date().getTime();
    const window = windowMs || this.EVENT_WINDOW_MS;

    return state.event_history
      .filter(e => {
        const eventTime = new Date(e.timestamp).getTime();
        const inWindow = now - eventTime < window;
        const typeMatches = !eventType || e.event_type === eventType;
        return inWindow && typeMatches;
      })
      .map(e => e.event_type);
  }

  countEventsInWindow(userId, eventType, windowMs) {
    return this.getRecentEvents(userId, eventType, windowMs).length;
  }

  resetUserState(userId) {
    this.updateUserState(userId, USER_SOS_STATES.OBSERVING);
  }

  clearUserState(userId) {
    this.userStates.delete(userId);
  }
}

const kceStateStore = new KCEStateStore();
export default kceStateStore;
