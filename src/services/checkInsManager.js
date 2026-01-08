/**
 * CHECK-INS MANAGER (JS)
 * 
 * Monitor de check-ins programados en JavaScript puro.
 */

import supabase from '../lib/customSupabaseClient.js';
import { kceEvents } from '../core/kce/index.js';

class CheckInsManager {
  constructor() {
    this.checkInterval = null;
    this.INTERVAL_MS = 5 * 60 * 1000; // Revisar cada 5 minutos
    this.userId = null;
  }

  async initialize(userId) {
    if (!userId) {
      console.warn('⚠️ CheckInsManager: No se proporcionó userId');
      return;
    }

    this.userId = userId;
    console.log('✅ CheckInsManager iniciado para usuario:', userId);

    // Revisar inmediatamente
    await this.checkScheduledCheckIns();

    // Iniciar polling
    this.checkInterval = setInterval(() => {
      this.checkScheduledCheckIns();
    }, this.INTERVAL_MS);
  }

  async checkScheduledCheckIns() {
    if (!this.userId) return;

    try {
      const now = new Date().toISOString();

      // Buscar check-ins que deberían haber ocurrido hace más de 30 minutos
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

      const { data: pendingCheckIns, error } = await supabase
        .from('salidas_programadas')
        .select('*')
        .eq('user_id', this.userId)
        .eq('check_in_completado', false)
        .lt('fecha_hora_programada', thirtyMinutesAgo);

      if (error) {
        console.error('❌ Error consultando check-ins:', error);
        return;
      }

      if (pendingCheckIns && pendingCheckIns.length > 0) {
        console.log(`⚠️ CheckInsManager: ${pendingCheckIns.length} check-in(s) fallido(s)`);

        for (const checkIn of pendingCheckIns) {
          await kceEvents.checkInFailed(
            this.userId,
            `Check-in no completado: ${checkIn.nombre_lugar || 'Destino'}`
          );

          // Marcar como revisado para no emitir múltiples alertas
          await supabase
            .from('salidas_programadas')
            .update({ metadata: { ...checkIn.metadata, alert_sent: true } })
            .eq('id', checkIn.id);
        }
      }
    } catch (error) {
      console.error('❌ Error en checkScheduledCheckIns:', error);
    }
  }

  async markCheckInCompleted(checkInId, userId) {
    try {
      const { error } = await supabase
        .from('salidas_programadas')
        .update({ 
          check_in_completado: true,
          check_in_timestamp: new Date().toISOString()
        })
        .eq('id', checkInId);

      if (error) {
        console.error('❌ Error marcando check-in:', error);
        return;
      }

      console.log('✅ Check-in completado:', checkInId);
      
      await kceEvents.checkInCompleted(userId, 'Check-in completado exitosamente');
    } catch (error) {
      console.error('❌ Error en markCheckInCompleted:', error);
    }
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('🛑 CheckInsManager detenido');
    }
  }
}

const checkInsManager = new CheckInsManager();
export default checkInsManager;
