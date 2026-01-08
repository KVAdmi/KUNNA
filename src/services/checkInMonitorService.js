// src/services/checkInMonitorService.js
// Servicio que monitorea check-ins pendientes y activa AL-E Guardian cuando no se confirman

import { supabase } from '../config/supabaseClient.js';
import aleGuardian from './aleGuardian.js';
import aleObserver from './aleObserver.js';
import pushNotificationService from './pushNotificationService.js';

class CheckInMonitorService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.checkInterval = 60000; // 1 minuto
  }

  /**
   * Iniciar monitoreo de check-ins
   */
  async iniciar() {
    if (this.isRunning) {
      console.log('[CheckInMonitor] Ya está activo');
      return;
    }

    console.log('[CheckInMonitor] Iniciando...');
    this.isRunning = true;

    // Verificar inmediatamente
    await this.verificarCheckInsPendientes();

    // Verificar cada minuto
    this.intervalId = setInterval(() => {
      this.verificarCheckInsPendientes().catch(err => {
        console.error('[CheckInMonitor] Error en verificación:', err);
      });
    }, this.checkInterval);

    console.log('[CheckInMonitor] Activo');
  }

  /**
   * Detener monitoreo
   */
  detener() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[CheckInMonitor] Detenido');
  }

  /**
   * Verificar check-ins pendientes
   */
  async verificarCheckInsPendientes() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Si no hay usuaria autenticada, no hacemos nada
      if (!user) return;

      const now = new Date();

      // Obtener salidas del usuario que están programadas o activas
      const { data: salidas, error } = await supabase
        .from('salidas_programadas')
        .select('*')
        .eq('user_id', user.id)
        .in('estado', ['programada', 'activa']);

      if (error) throw error;

      if (!salidas || salidas.length === 0) {
        return; // No hay salidas a monitorear
      }

      // Procesar cada salida para ver si tiene check-ins vencidos
      for (const salida of salidas) {
        await this.procesarSalidaPendiente(salida, now);
      }

    } catch (error) {
      console.error('[CheckInMonitor] Error verificando check-ins:', error);
    }
  }

  /**
   * Procesar una salida pendiente
   */
  async procesarSalidaPendiente(salida, nowParam) {
    try {
      const now = nowParam || new Date();

      const fechaSalida = new Date(salida.fecha_hora);
      const requeridos = (salida.check_ins_requeridos || []).slice().sort((a, b) => a - b);
      const completados = salida.check_ins_completados || [];

      // Encontrar el primer check-in requerido que ya debería haberse confirmado y no está completado
      let pendiente = null;

      for (const minutos of requeridos) {
        if (completados.includes(minutos)) continue;

        const horaCheckIn = new Date(fechaSalida.getTime() + minutos * 60000);

        if (horaCheckIn <= now) {
          const minutosRetraso = Math.floor((now - horaCheckIn) / 1000 / 60);
          pendiente = { minutos, horaCheckIn, minutosRetraso };
        } else {
          // El resto de check-ins son a futuro
          break;
        }
      }

      if (!pendiente) {
        return; // Nada pendiente aún
      }

      const { minutos, horaCheckIn, minutosRetraso } = pendiente;

      console.log(`[CheckInMonitor] Salida ${salida.id} - Check-in de ${minutos} min, retraso: ${minutosRetraso} min`);

      // 1) Justo cuando toca el check-in: pedir confirmación amable
      if (minutosRetraso === 0) {
        await pushNotificationService.notifyCheckInPending(salida.titulo, minutosRetraso);
        await aleGuardian.enviarMensajeSistemaCirculo(
          salida.user_id,
          `⏰ Esperando confirmación de tu salida "${salida.titulo}" (check-in ${minutos} min).`
        );
        return;
      }

      // 2) Si la usuaria sigue sin responder después de un margen (ej. 10 min), iniciar protocolo
      if (minutosRetraso >= 10 && salida.estado !== 'alerta') {
        aleObserver.trackCheckInMissed(salida.id, minutosRetraso);

        // Iniciar Fase 1 del protocolo de emergencia por check-in fallido
        await aleGuardian.iniciarProtocoloCheckInFallido(salida);

        // Marcar salida en estado de alerta para no duplicar el protocolo
        await supabase
          .from('salidas_programadas')
          .update({ estado: 'alerta' })
          .eq('id', salida.id);
      }

    } catch (error) {
      console.error(`[CheckInMonitor] Error procesando salida ${salida.id}:`, error);
    }
  }

  /**
   * Verificar una salida específica (llamado desde UI)
   */
  async verificarSalidaEspecifica(salidaId) {
    try {
      const { data: salida, error } = await supabase
        .from('salidas_programadas')
        .select('*')
        .eq('id', salidaId)
        .single();

      if (error) throw error;

      if (salida.estado === 'activa' || salida.estado === 'programada') {
        await this.procesarSalidaPendiente(salida);
      }

    } catch (error) {
      console.error(`[CheckInMonitor] Error verificando salida ${salidaId}:`, error);
    }
  }
}

// Singleton
const checkInMonitorService = new CheckInMonitorService();

export default checkInMonitorService;
