/**
 * Outbox - Queue offline-first con reintentos (backoff exponencial)
 * 
 * Usa localStorage (fallback si IndexedDB no está disponible)
 * Para SOS manual: ejecuta protocolo local inmediato, luego encola evento
 * Para otros eventos: encola y envía cuando haya conexión
 * 
 * Estructura evento:
 * {
 *   id: string,
 *   type: string, // 'checkin_failed', 'inactivity', 'diary_entry', 'sos_manual', 'state_change'
 *   payload: object,
 *   status: 'pending' | 'sending' | 'sent' | 'failed',
 *   attempts: number,
 *   nextRetry: timestamp,
 *   createdAt: timestamp,
 *   error: string?
 * }
 */

const STORAGE_KEY = 'kunna_outbox';
const MAX_ATTEMPTS = 5;
const INITIAL_BACKOFF = 1000; // 1 segundo
const MAX_BACKOFF = 60000; // 60 segundos

class Outbox {
  constructor() {
    this.events = this._loadEvents();
    this.isProcessing = false;
    
    // Auto-procesar cada 30 segundos si hay eventos pendientes
    setInterval(() => this._processQueue(), 30000);
    
    // Procesar cuando vuelve la conexión
    window.addEventListener('online', () => {
      console.log('📡 Conexión restaurada, procesando outbox...');
      this._processQueue();
    });
  }

  /**
   * Cargar eventos desde localStorage
   */
  _loadEvents() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error cargando outbox:', error);
      return [];
    }
  }

  /**
   * Guardar eventos en localStorage
   */
  _saveEvents() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.error('Error guardando outbox:', error);
    }
  }

  /**
   * Generar ID único para evento
   */
  _generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calcular tiempo de backoff exponencial
   */
  _calculateBackoff(attempts) {
    const backoff = Math.min(
      INITIAL_BACKOFF * Math.pow(2, attempts),
      MAX_BACKOFF
    );
    
    // Agregar jitter (± 20%)
    const jitter = backoff * 0.2 * (Math.random() - 0.5);
    
    return backoff + jitter;
  }

  /**
   * Agregar evento al outbox
   */
  async add(type, payload) {
    const event = {
      id: this._generateId(),
      type,
      payload,
      status: 'pending',
      attempts: 0,
      nextRetry: Date.now(),
      createdAt: Date.now(),
      error: null
    };

    this.events.push(event);
    this._saveEvents();

    console.log(`📤 Evento añadido al outbox: ${type}`, event.id);

    // Intentar enviar inmediatamente si hay conexión
    if (navigator.onLine) {
      this._processQueue();
    }

    return event.id;
  }

  /**
   * Procesar cola de eventos
   */
  async _processQueue() {
    if (this.isProcessing) return;
    if (!navigator.onLine) {
      console.log('📵 Sin conexión, esperando...');
      return;
    }

    this.isProcessing = true;

    const now = Date.now();
    const pendingEvents = this.events.filter(
      e => (e.status === 'pending' || e.status === 'failed') && 
           e.nextRetry <= now &&
           e.attempts < MAX_ATTEMPTS
    );

    console.log(`⚙️ Procesando ${pendingEvents.length} eventos pendientes...`);

    for (const event of pendingEvents) {
      try {
        await this._sendEvent(event);
      } catch (error) {
        console.error(`❌ Error enviando evento ${event.id}:`, error);
      }
    }

    // Limpiar eventos antiguos que ya fueron enviados (>24h)
    const cutoff = now - (24 * 60 * 60 * 1000);
    this.events = this.events.filter(
      e => e.status !== 'sent' || e.createdAt > cutoff
    );
    this._saveEvents();

    this.isProcessing = false;
  }

  /**
   * Enviar un evento individual
   */
  async _sendEvent(event) {
    event.status = 'sending';
    event.attempts++;
    this._saveEvents();

    try {
      // Importar dinámicamente el cliente (evitar circular deps)
      const { sendEvent } = await import('./eventsClient.js');
      
      const result = await sendEvent(event.type, event.payload);

      if (result.success) {
        event.status = 'sent';
        event.error = null;
        console.log(`✅ Evento enviado: ${event.type}`, event.id);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      event.status = 'failed';
      event.error = error.message;
      event.nextRetry = Date.now() + this._calculateBackoff(event.attempts);

      console.error(
        `❌ Intento ${event.attempts}/${MAX_ATTEMPTS} falló para ${event.id}:`,
        error.message
      );

      // Si alcanzó max attempts, marcar como definitivamente fallido
      if (event.attempts >= MAX_ATTEMPTS) {
        console.error(`🚫 Evento ${event.id} descartado (max attempts)`);
      }
    }

    this._saveEvents();
  }

  /**
   * Obtener estado del outbox
   */
  getStats() {
    return {
      total: this.events.length,
      pending: this.events.filter(e => e.status === 'pending').length,
      sending: this.events.filter(e => e.status === 'sending').length,
      sent: this.events.filter(e => e.status === 'sent').length,
      failed: this.events.filter(e => e.status === 'failed').length,
      retrying: this.events.filter(e => 
        e.status === 'failed' && 
        e.attempts < MAX_ATTEMPTS
      ).length
    };
  }

  /**
   * Obtener eventos por estado
   */
  getEvents(status = null) {
    if (status) {
      return this.events.filter(e => e.status === status);
    }
    return [...this.events];
  }

  /**
   * Limpiar eventos enviados exitosamente
   */
  clearSent() {
    this.events = this.events.filter(e => e.status !== 'sent');
    this._saveEvents();
    console.log('🗑️ Eventos enviados limpiados del outbox');
  }

  /**
   * Forzar reintento manual de un evento fallido
   */
  async retryEvent(eventId) {
    const event = this.events.find(e => e.id === eventId);
    
    if (!event) {
      throw new Error(`Evento ${eventId} no encontrado`);
    }

    if (event.status === 'sent') {
      throw new Error('Evento ya fue enviado');
    }

    // Resetear nextRetry para que se procese inmediatamente
    event.nextRetry = Date.now();
    event.status = 'pending';
    this._saveEvents();

    await this._processQueue();
  }

  /**
   * Eliminar evento específico
   */
  removeEvent(eventId) {
    this.events = this.events.filter(e => e.id !== eventId);
    this._saveEvents();
    console.log(`🗑️ Evento ${eventId} eliminado del outbox`);
  }
}

// Singleton
const outbox = new Outbox();

export default outbox;

/**
 * Helper: Agregar evento con validación de tipo
 */
export async function addToOutbox(type, payload) {
  const validTypes = [
    'checkin_failed',
    'inactivity',
    'diary_entry',
    'sos_manual',
    'state_change'
  ];

  if (!validTypes.includes(type)) {
    throw new Error(`Tipo de evento inválido: ${type}`);
  }

  return await outbox.add(type, payload);
}

/**
 * Helper: Obtener stats del outbox
 */
export function getOutboxStats() {
  return outbox.getStats();
}
