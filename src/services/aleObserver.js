/**
 * AL-E OBSERVER - Observador de Eventos
 * 
 * Captura y registra todos los eventos importantes de la app
 * para que AL-E pueda aprender y detectar patrones
 */

import { requestDecision } from './eventsClient';
import { supabase } from '../lib/supabaseClient';

class ALEObserver {
  constructor() {
    this.eventBuffer = [];
    this.bufferLimit = 50;
    this.flushInterval = 30000; // 30 segundos
    this.userId = null;
    
    // Auto-flush periódico
    setInterval(() => this.flush(), this.flushInterval);
  }

  /**
   * Inicializar observador con usuario actual
   */
  init(userId) {
    this.userId = userId;
    console.log('🔍 AL-E Observer iniciado para usuario:', userId);
  }

  /**
   * Registrar evento genérico
   */
  track(eventType, data = {}) {
    if (!this.userId) return;

    const event = {
      user_id: this.userId,
      event_type: eventType,
      timestamp: new Date().toISOString(),
      data,
      session_id: this.getSessionId()
    };

    this.eventBuffer.push(event);

    // Guardar en Supabase
    this.saveToDatabase(event);

    // Flush si el buffer está lleno
    if (this.eventBuffer.length >= this.bufferLimit) {
      this.flush();
    }
  }

  /**
   * EVENTOS DE SEGURIDAD
   */
  trackSOSActivation(location, trigger = 'manual') {
    this.track('sos_activated', {
      location,
      trigger, // manual, automatic, voice
      priority: 'critical'
    });
  }

  trackSOSDeactivation(duration) {
    this.track('sos_deactivated', {
      duration,
      priority: 'high'
    });
  }

  trackLocationUpdate(location) {
    this.track('location_update', {
      location,
      priority: 'low'
    });
  }

  trackRouteDeviation(expectedRoute, actualLocation) {
    this.track('route_deviation', {
      expected: expectedRoute,
      actual: actualLocation,
      priority: 'high'
    });
  }

  /**
   * EVENTOS DE ACTIVIDAD
   */
  trackAppOpen() {
    this.track('app_opened', {
      time_of_day: new Date().getHours()
    });
  }

  trackAppClose() {
    this.track('app_closed', {
      session_duration: this.getSessionDuration()
    });
  }

  trackInactivity(duration) {
    this.track('user_inactive', {
      duration,
      last_activity: new Date().toISOString()
    });
  }

  trackPageView(pageName) {
    this.track('page_view', {
      page: pageName,
      time_spent: this.getTimeOnPage()
    });
  }

  /**
   * EVENTOS EMOCIONALES
   */
  trackJournalEntry(mood, content) {
    this.track('journal_entry', {
      mood,
      content_length: content.length,
      time_of_day: new Date().getHours()
    });
  }

  trackMoodChange(previousMood, newMood) {
    this.track('mood_change', {
      from: previousMood,
      to: newMood,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * EVENTOS SOCIALES
   */
  trackChatMessage(roomId, messageLength) {
    this.track('chat_message', {
      room_id: roomId,
      message_length: messageLength
    });
  }

  trackCommentPosted(bookId, chapterId) {
    this.track('comment_posted', {
      book_id: bookId,
      chapter_id: chapterId
    });
  }

  trackCircleInteraction(circleId, actionType) {
    this.track('circle_interaction', {
      circle_id: circleId,
      action: actionType
    });
  }

  /**
   * EVENTOS DE CITAS PROGRAMADAS
   */
  trackScheduledExitCreated(exitData) {
    this.track('scheduled_exit_created', {
      date: exitData.date,
      location: exitData.location,
      has_contact: !!exitData.contact
    });
  }

  trackCheckInMissed(exitId, timeElapsed) {
    this.track('check_in_missed', {
      exit_id: exitId,
      time_elapsed: timeElapsed,
      priority: 'high'
    });
  }

  trackCheckInCompleted(exitId) {
    this.track('check_in_completed', {
      exit_id: exitId
    });
  }

  /**
   * EVENTOS DE ZONA HOLÍSTICA
   */
  trackHolisticReading(readingType) {
    this.track('holistic_reading', {
      type: readingType, // tarot, numerology, astrology
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Guardar evento en base de datos
   */
  async saveToDatabase(event) {
    try {
      const { error } = await supabase
        .from('ale_events')
        .insert({
          user_id: event.user_id,
          event_type: event.event_type,
          event_data: event.data,
          timestamp: event.timestamp,
          session_id: event.session_id
        });

      if (error) {
        console.error('Error guardando evento AL-E:', error);
      }
    } catch (error) {
      console.error('Error en saveToDatabase:', error);
    }
  }

  /**
   * Enviar buffer de eventos a AL-E para análisis
   */
  async flush() {
    if (this.eventBuffer.length === 0) return;

    try {
      // Enviar eventos a AL-E para análisis
      await requestDecision({
        context: {
          userId: this.userId,
          events: this.eventBuffer,
          timeframe: '24h'
        },
        prompt: 'Analizar contexto de usuario y eventos recientes'
      });

      // Limpiar buffer
      this.eventBuffer = [];
    } catch (error) {
      console.error('Error al enviar eventos a AL-E:', error);
    }
  }

  /**
   * Helpers
   */
  getSessionId() {
    if (!this._sessionId) {
      this._sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this._sessionId;
  }

  getSessionDuration() {
    // Implementar lógica de duración de sesión
    return Date.now() - (this._sessionStart || Date.now());
  }

  getTimeOnPage() {
    // Implementar lógica de tiempo en página
    return Date.now() - (this._pageStart || Date.now());
  }
}

// Instancia singleton
const aleObserver = new ALEObserver();

export default aleObserver;
