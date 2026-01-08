/**
 * AL-E GUARDIAN - Sistema de Decisiones de Seguridad
 * 
 * Toma decisiones críticas sobre escalamiento de emergencias
 * Gestiona las 3 fases de protección progresiva
 */

import { requestDecision } from './eventsClient';
import aleAnalyzer from './aleAnalyzer';
import aleObserver from './aleObserver';
import callService from './callService';
import pushNotificationService from './pushNotificationService';
import { supabase } from '../lib/supabaseClient';

class ALEGuardian {
  constructor() {
    this.activeEmergencies = new Map();
    this.checkInTimers = new Map();
  }

  /**
   * SISTEMA DE ESCALAMIENTO PROGRESIVO
   */

  /**
   * FASE 1: Alerta Suave al Círculo
   */
  async executarFase1(emergencyData) {
    console.log('🔵 AL-E Guardian: Iniciando Fase 1 - Alerta Suave');

    try {
      const { userId, location, situation } = emergencyData;

      // Obtener círculo de confianza
      const circulo = await this.getCirculoConfianza(userId);

      if (!circulo || circulo.length === 0) {
        console.log('⚠️ No hay círculo de confianza, escalando directo a Fase 2');
        return this.executarFase2(emergencyData);
      }

      // Notificación suave al círculo
      const mensaje = this.generarMensajeFase1(emergencyData);

      // Enviar notificación a cada miembro
      for (const miembro of circulo) {
        await this.enviarNotificacionCirculo(miembro.user_id, mensaje, 'fase1');
      }

      // Actualizar estado de emergencia
      await this.actualizarEstadoEmergencia(userId, 'fase1', {
        started_at: new Date().toISOString(),
        circle_notified: true,
        escalation_timer: 5 // minutos antes de Fase 2
      });

      // Programar escalamiento automático si no hay respuesta
      this.programarEscalamientoAutomatico(userId, emergencyData, 5 * 60 * 1000); // 5 min

      // Reflejar en chat del círculo
      await this.enviarMensajeSistemaCirculo(
        userId,
        '⚠️ No has confirmado que estás bien. Tu círculo fue notificado (Fase 1).'
      );

      return { success: true, fase: 1, circle_size: circulo.length };
    } catch (error) {
      console.error('Error en Fase 1:', error);
      return { success: false, error };
    }
  }

  /**
   * FASE 2: Llamadas Automáticas + Seguimiento GPS Activo
   */
  async executarFase2(emergencyData) {
    console.log('🟡 AL-E Guardian: Iniciando Fase 2 - Llamadas Automáticas');

    try {
      const { userId, location, situation } = emergencyData;

      // Activar tracking GPS continuo
      await this.activarTrackingContinuo(userId);

      // Obtener contactos de emergencia
      const contactos = await this.getContactosEmergencia(userId);

      // Hacer llamadas automáticas con servicio real
      if (callService.isConfigured()) {
        try {
          const resultadoLlamadas = await callService.makeEmergencyCalls(userId, emergencyData.id);
          console.log('[Guardian] Llamadas completadas:', resultadoLlamadas);
          
          // Notificar usuario que se hicieron llamadas
          await pushNotificationService.notifyEscalationTriggered('fase2');
          
        } catch (error) {
          console.error('[Guardian] Error en llamadas, usando SMS como fallback:', error);
          // Fallback a SMS si las llamadas fallan
          await callService.sendEmergencySMS(userId, emergencyData.id);
        }
      } else {
        // Si Twilio no está configurado, solo notificar
        console.warn('[Guardian] Llamadas no configuradas, solo notificaciones');
        await pushNotificationService.notifyEscalationTriggered('fase2');
      }

      // Notificar al círculo con más urgencia
      const circulo = await this.getCirculoConfianza(userId);
      const mensajeFase2 = this.generarMensajeFase2(emergencyData);

      for (const miembro of circulo) {
        await this.enviarNotificacionCirculo(miembro.user_id, mensajeFase2, 'fase2');
      }

      // Actualizar estado
      await this.actualizarEstadoEmergencia(userId, 'fase2', {
        started_at: new Date().toISOString(),
        calls_initiated: true,
        tracking_active: true,
        escalation_timer: 10 // minutos antes de Fase 3
      });

      // Programar Fase 3 si no hay respuesta
      this.programarEscalamientoAutomatico(userId, emergencyData, 10 * 60 * 1000); // 10 min

      // Reflejar en chat del círculo
      await this.enviarMensajeSistemaCirculo(
        userId,
        '⚠️ Escalamiento Fase 2: se iniciaron llamadas automáticas a tus contactos de emergencia.'
      );

      return { success: true, fase: 2, contactos: contactos.length };
    } catch (error) {
      console.error('Error en Fase 2:', error);
      return { success: false, error };
    }
  }

  /**
   * FASE 3: Activación Total (Tracking Público + Evidencia + Contactos Externos)
   */
  async executarFase3(emergencyData) {
    console.log('🔴 AL-E Guardian: Iniciando Fase 3 - ACTIVACIÓN TOTAL');

    try {
      const { userId, location, situation } = emergencyData;

      // Activar tracking público
      const trackingUrl = await this.activarTrackingPublico(userId);

      // Iniciar grabación de evidencia continua
      await this.iniciarEvidenciaContinua(userId);

      // Notificar a TODOS los contactos + autoridades si es necesario
      await this.notificarActivacionTotal(userId, trackingUrl);

      // Enviar alertas a contactos externos (si configurados)
      await this.notificarContactosExternos(userId, emergencyData);

      // Actualizar estado
      await this.actualizarEstadoEmergencia(userId, 'fase3', {
        started_at: new Date().toISOString(),
        public_tracking: true,
        tracking_url: trackingUrl,
        evidence_recording: true,
        all_contacts_notified: true
      });

      // Reflejar en chat del círculo
      await this.enviarMensajeSistemaCirculo(
        userId,
        `🚨 SOS ACTIVADO. Tracking público activo: ${trackingUrl}`
      );

      return { 
        success: true, 
        fase: 3, 
        tracking_url: trackingUrl,
        public: true 
      };
    } catch (error) {
      console.error('Error en Fase 3:', error);
      return { success: false, error };
    }
  }

  /**
   * DECISIÓN INTELIGENTE DE ESCALAMIENTO
   */
  async decidirEscalamiento(situation) {
    try {
      // Obtener análisis de riesgo de AL-E
      const riskAssessment = await requestDecision({
        context: { situation },
        prompt: 'Evaluar si la situación requiere escalamiento de emergencia'
      });

      // Factores que influyen en la decisión
      const factors = {
        time_elapsed: situation.timeElapsed || 0,
        user_response: situation.userResponse || false,
        location_risk: situation.locationRisk || 'unknown',
        historical_patterns: situation.historicalPatterns || {},
        circle_response: situation.circleResponse || false
      };

      // AL-E decide la fase apropiada
      if (riskAssessment.level === 'critical') {
        return { nextFase: 3, immediate: true, reason: riskAssessment.reason };
      } else if (riskAssessment.level === 'high') {
        return { nextFase: 2, immediate: true, reason: riskAssessment.reason };
      } else if (riskAssessment.level === 'medium') {
        return { nextFase: 1, immediate: false, reason: riskAssessment.reason };
      }

      return { nextFase: 1, immediate: false, reason: 'precautionary' };
    } catch (error) {
      console.error('Error decidiendo escalamiento:', error);
      // En caso de error, ser conservador y escalar
      return { nextFase: 2, immediate: true, reason: 'error_safeguard' };
    }
  }

  /**
   * VERIFICACIÓN DE CHECK-INS
   */
  async verificarCheckIn(exitId, checkInData) {
    try {
      // Obtener datos de salida programada
      const { data: exit } = await supabase
        .from('salidas_programadas')
        .select('*')
        .eq('id', exitId)
        .single();

      if (!exit) {
        return { valid: false, reason: 'exit_not_found' };
      }

      // Enviar a AL-E para verificación
      const verification = await requestDecision({
        context: { exit, checkInData },
        prompt: 'Verificar si el check-in de salida programada es legítimo'
      });

      if (verification.status === 'ok' || verification.decision === 'valid') {
        // Check-in exitoso
        await this.marcarCheckInCompleto(exitId);
        aleObserver.trackCheckInCompleted(exitId);
        
        return { valid: true, status: 'completed' };
      } else if (verification.status === 'delayed') {
        // Retrasado pero no crítico
        return { valid: true, status: 'delayed', warning: true };
      } else {
        // Check-in fallido - iniciar protocolo
        aleObserver.trackCheckInMissed(exitId, verification.time_elapsed);
        await this.iniciarProtocoloCheckInFallido(exit);
        
        return { valid: false, status: 'missed', action: 'protocol_initiated' };
      }
    } catch (error) {
      console.error('Error verificando check-in:', error);
      return { valid: false, error: true };
    }
  }

  /**
   * Helpers
   */
  async getCirculoConfianza(userId) {
    const { data } = await supabase
      .from('circulos_confianza')
      .select('miembros')
      .eq('user_id', userId)
      .single();

    if (!data || !data.miembros) return [];

    // Obtener datos de los miembros
    const { data: miembros } = await supabase
      .from('profiles')
      .select('user_id, nombre_completo, telefono')
      .in('user_id', data.miembros);

    return miembros || [];
  }

  async getContactosEmergencia(userId) {
    const { data } = await supabase
      .from('contactos_emergencia')
      .select('*')
      .eq('user_id', userId)
      .order('prioridad', { ascending: true });

    return data || [];
  }

  generarMensajeFase1(emergencyData) {
    return {
      tipo: 'alerta_suave',
      titulo: '🔔 Atención en tu círculo',
      mensaje: `${emergencyData.userName} podría necesitar apoyo. Te mantendremos informada.`,
      ubicacion: emergencyData.location,
      timestamp: new Date().toISOString()
    };
  }

  generarMensajeFase2(emergencyData) {
    return {
      tipo: 'alerta_urgente',
      titulo: '⚠️ Situación que requiere atención',
      mensaje: `${emergencyData.userName} no ha respondido. Por favor, intenta contactarla.`,
      ubicacion: emergencyData.location,
      tracking_url: emergencyData.trackingUrl,
      timestamp: new Date().toISOString()
    };
  }

  async enviarNotificacionCirculo(userId, mensaje, fase) {
    // Implementar envío de notificación
    // Puede ser push notification, SMS, email, etc.
    console.log(`📱 Enviando notificación ${fase} a:`, userId);
  }

  /**
   * Mensaje de sistema en el chat del círculo
   * (Comunidad Segura como visor de estado)
   */
  async enviarMensajeSistemaCirculo(userId, content) {
    try {
      const { data: circulo, error } = await supabase
        .from('circulos_confianza')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error || !circulo) {
        console.warn('[ALEGuardian] No se encontró círculo para usuaria', userId);
        return;
      }

      await supabase
        .from('circulo_messages')
        .insert({
          circulo_id: circulo.id,
          sender_id: userId,
          mensaje: content,
          tipo: 'alerta',
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('[ALEGuardian] Error enviando mensaje de sistema al chat:', error);
    }
  }

  async activarTrackingContinuo(userId) {
    await supabase
      .from('estados_usuario')
      .upsert({
        user_id: userId,
        tracking_activo: true,
        updated_at: new Date().toISOString()
      });
  }

  async activarTrackingPublico(userId) {
    // Generar token único para tracking público
    const token = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await supabase
      .from('acompanamientos')
      .insert({
        user_id: userId,
        token,
        publico: true,
        created_at: new Date().toISOString()
      });

    return `https://kunna.app/tracking/${token}`;
  }

  async iniciarEvidenciaContinua(userId) {
    // Activar grabación continua de evidencia
    console.log('🎥 Iniciando evidencia continua para:', userId);
  }

  async notificarActivacionTotal(userId, trackingUrl) {
    // Notificar a TODOS
    console.log('📢 ACTIVACIÓN TOTAL - Notificando a todos los contactos');
  }

  async notificarContactosExternos(userId, emergencyData) {
    // Contactos externos (servicios de emergencia, etc.)
    console.log('🚨 Notificando contactos externos');
  }

  async actualizarEstadoEmergencia(userId, fase, datos) {
    await supabase
      .from('emergencias_activas')
      .upsert({
        user_id: userId,
        fase_actual: fase,
        datos,
        updated_at: new Date().toISOString()
      });
  }

  programarEscalamientoAutomatico(userId, emergencyData, timeout) {
    const timer = setTimeout(async () => {
      console.log('⏰ Timeout alcanzado - Escalando automáticamente');
      
      const faseActual = emergencyData.fase || 1;
      const siguienteFase = faseActual + 1;

      if (siguienteFase === 2) {
        await this.executarFase2({ ...emergencyData, fase: 2 });
      } else if (siguienteFase === 3) {
        await this.executarFase3({ ...emergencyData, fase: 3 });
      }
    }, timeout);

    this.activeEmergencies.set(userId, timer);
  }

  cancelarEscalamientoAutomatico(userId) {
    const timer = this.activeEmergencies.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.activeEmergencies.delete(userId);
      console.log('✅ Escalamiento automático cancelado para:', userId);
    }
  }

  async iniciarProtocoloCheckInFallido(exit) {
    console.log('🚨 Check-in fallido - Iniciando protocolo de emergencia');
    
    await this.executarFase1({
      userId: exit.user_id,
      location: exit.lugar,
      situation: 'missed_checkin',
      exitData: exit
    });
  }

  async marcarCheckInCompleto(exitId) {
    await supabase
      .from('salidas_programadas')
      .update({ 
        estado: 'completada',
        completed_at: new Date().toISOString()
      })
      .eq('id', exitId);
  }

  async iniciarLlamadaAutomatica(contacto, emergencyData) {
    // Implementar integración con servicio de llamadas
    // Por ahora, registrar la intención
    console.log('📞 Iniciando llamada automática a:', contacto.telefono);
  }
}

// Instancia singleton
const aleGuardian = new ALEGuardian();

export default aleGuardian;
