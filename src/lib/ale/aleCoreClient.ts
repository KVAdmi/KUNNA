/**
 * AL-E Core Client (KUNNA)
 * 
 * Cliente para interactuar con AL-E Core desde KUNNA
 * Llama a Netlify Functions intermediarias (no expone tokens)
 */

interface ALEEvent {
  user_id: string;
  event_type: 'checkin_failed' | 'inactivity' | 'diary_entry' | 'state_change' | 'sos_manual';
  timestamp?: string;
  metadata: {
    source: string;
    risk_level: 'normal' | 'alert' | 'risk' | 'critical';
    text?: string;
    duration_minutes?: number;
    location?: { lat: number; lng: number };
  };
}

interface ALEDecideRequest {
  user_id: string;
  event_id: string;
  context?: Record<string, any>;
}

class ALECoreClient {
  private baseUrl: string;

  constructor() {
    // En producción: tu dominio Netlify
    // En desarrollo: http://localhost:8888
    this.baseUrl = import.meta.env.DEV 
      ? 'http://localhost:8888'
      : window.location.origin;
  }

  /**
   * Emitir evento a AL-E Core
   */
  async emitEvent(event: ALEEvent) {
    try {
      const response = await fetch(`${this.baseUrl}/.netlify/functions/ale-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...event,
          timestamp: event.timestamp || new Date().toISOString()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to emit event');
      }

      return await response.json();
    } catch (error) {
      console.error('Error emitting event to AL-E Core:', error);
      throw error;
    }
  }

  /**
   * Solicitar decisión a AL-E Core
   */
  async decide(request: ALEDecideRequest) {
    try {
      const response = await fetch(`${this.baseUrl}/.netlify/functions/ale-decide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get decision');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting decision from AL-E Core:', error);
      throw error;
    }
  }

  /**
   * Helpers específicos de eventos
   */
  async checkInFailed(userId: string, context?: string) {
    return await this.emitEvent({
      user_id: userId,
      event_type: 'checkin_failed',
      metadata: {
        source: 'agenda',
        risk_level: 'alert',
        text: context
      }
    });
  }

  async inactivityDetected(userId: string, minutes: number, riskLevel: 'normal' | 'alert' | 'risk' | 'critical') {
    return await this.emitEvent({
      user_id: userId,
      event_type: 'inactivity',
      metadata: {
        source: 'system',
        risk_level: riskLevel,
        duration_minutes: minutes
      }
    });
  }

  async diaryEntry(userId: string, content: string, riskLevel: 'normal' | 'alert' | 'risk' | 'critical') {
    return await this.emitEvent({
      user_id: userId,
      event_type: 'diary_entry',
      metadata: {
        source: 'diary',
        risk_level: riskLevel,
        text: content.substring(0, 200) // Primeros 200 chars
      }
    });
  }

  async sosManual(userId: string, location?: { lat: number; lng: number }) {
    return await this.emitEvent({
      user_id: userId,
      event_type: 'sos_manual',
      metadata: {
        source: 'app',
        risk_level: 'critical',
        location
      }
    });
  }

  async stateChange(userId: string, newState: 'normal' | 'alert' | 'risk' | 'critical') {
    return await this.emitEvent({
      user_id: userId,
      event_type: 'state_change',
      metadata: {
        source: 'system',
        risk_level: newState
      }
    });
  }
}

export const aleCoreClient = new ALECoreClient();
export default aleCoreClient;
