/**
 * AL-E Action Executor (Cliente KUNNA)
 * 
 * Ejecuta acciones devueltas por AL-E Core localmente en KUNNA
 */

import supabase from '../customSupabaseClient';

interface ALEAction {
  action_type: 'send_silent_verification' | 'alert_trust_circle' | 'escalate_full_sos' | 'start_evidence_recording' | 'stop_escalation';
  payload: Record<string, any>;
}

class ActionExecutor {
  async execute(userId: string, actions: ALEAction[], decisionId?: string) {
    const results = [];

    for (const action of actions) {
      try {
        const result = await this.executeAction(userId, action);
        results.push({ action: action.action_type, status: 'ok', result });

        // Loguear en Supabase
        if (decisionId) {
          await supabase.from('kunna_ale_action_logs').insert({
            user_id: userId,
            decision_id: decisionId,
            action_type: action.action_type,
            action_payload: action.payload,
            result,
            status: 'ok'
          });
        }
      } catch (error: any) {
        console.error(`Error executing action ${action.action_type}:`, error);
        results.push({ action: action.action_type, status: 'fail', error: error.message });

        if (decisionId) {
          await supabase.from('kunna_ale_action_logs').insert({
            user_id: userId,
            decision_id: decisionId,
            action_type: action.action_type,
            action_payload: action.payload,
            result: { error: error.message },
            status: 'fail',
            error_message: error.message
          });
        }
      }
    }

    return results;
  }

  private async executeAction(userId: string, action: ALEAction) {
    switch (action.action_type) {
      case 'send_silent_verification':
        return await this.sendSilentVerification(userId, action.payload);
      
      case 'alert_trust_circle':
        return await this.alertTrustCircle(userId, action.payload);
      
      case 'escalate_full_sos':
        return await this.escalateFullSOS(userId, action.payload);
      
      case 'start_evidence_recording':
        return await this.startEvidenceRecording(userId, action.payload);
      
      case 'stop_escalation':
        return await this.stopEscalation(userId);
      
      default:
        throw new Error(`Unknown action type: ${action.action_type}`);
    }
  }

  private async sendSilentVerification(userId: string, payload: any) {
    console.log('🔔 Enviando verificación silenciosa...');

    // Crear notificación en KUNNA
    const { data, error } = await supabase
      .from('ale_events')
      .insert({
        user_id: userId,
        event_type: 'verification_sent',
        event_data: {
          message: payload?.message || '¿Estás bien?',
          timeout_seconds: payload?.timeout_seconds || 180,
          sent_at: new Date().toISOString()
        },
        priority: 'medium',
        processed: false
      })
      .select()
      .single();

    if (error) throw error;

    return { notification_id: data.id, message_sent: true };
  }

  private async alertTrustCircle(userId: string, payload: any) {
    console.log('🚨 Alertando círculo de confianza...');

    // Buscar círculo del usuario
    const { data: circulo, error: circuloError } = await supabase
      .from('circulos_confianza')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (circuloError || !circulo) {
      console.warn('No se encontró círculo de confianza');
      return { circle_found: false };
    }

    // Enviar mensaje al círculo
    const { data: message, error: messageError } = await supabase
      .from('circulo_messages')
      .insert({
        circulo_id: circulo.id,
        sender_id: userId,
        mensaje: payload?.reason || 'Alerta automática: se requiere atención',
        tipo: 'alerta',
        metadata: {
          urgency: payload?.urgency || 'medium',
          automated: true,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (messageError) throw messageError;

    return { message_id: message.id, circle_alerted: true };
  }

  private async escalateFullSOS(userId: string, payload: any) {
    console.log('🔴 Escalando a SOS COMPLETO...');

    const token = this.generateToken();

    // Crear acompañamiento activo
    const { data: sos, error } = await supabase
      .from('acompanamientos_activos')
      .insert({
        user_id: userId,
        token,
        activo: true,
        tipo: 'sos_ale_auto',
        inicio: new Date().toISOString(),
        metadata: {
          trigger: payload?.trigger_type || 'automatic',
          from_ale_core: true
        }
      })
      .select()
      .single();

    if (error) throw error;

    // También alertar al círculo
    await this.alertTrustCircle(userId, {
      reason: 'SOS ACTIVADO - Emergencia detectada por sistema',
      urgency: 'critical',
      tracking_link: `${window.location.origin}/track/${token}`
    });

    return { sos_id: sos.id, token, sos_activated: true };
  }

  private async startEvidenceRecording(userId: string, payload: any) {
    console.log('🎥 Solicitando inicio de evidencia...');

    // Crear evento para que la app inicie grabación
    const { data, error } = await supabase
      .from('ale_events')
      .insert({
        user_id: userId,
        event_type: 'evidence_recording_started',
        event_data: {
          record_audio: payload?.record_audio !== false,
          record_video: payload?.record_video || false,
          gps_interval_seconds: payload?.gps_interval_seconds || 10,
          started_at: new Date().toISOString()
        },
        priority: 'critical',
        processed: false
      })
      .select()
      .single();

    if (error) throw error;

    return { event_id: data.id, recording_requested: true };
  }

  private async stopEscalation(userId: string) {
    console.log('✅ Deteniendo escalamiento...');

    // Desactivar acompañamientos activos
    const { error } = await supabase
      .from('acompanamientos_activos')
      .update({
        activo: false,
        fin: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('activo', true);

    if (error) throw error;

    return { escalation_stopped: true };
  }

  private generateToken() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let token = '';
    for (let i = 0; i < 8; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}

export const actionExecutor = new ActionExecutor();
export default actionExecutor;
