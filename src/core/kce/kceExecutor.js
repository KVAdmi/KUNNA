/**
 * KUNNA CORE ENGINE - EXECUTOR (JS)
 * 
 * Ejecutor de acciones en JavaScript puro.
 */

import supabase from '../../lib/customSupabaseClient.js';
import { ACTION_TYPES } from './kceTypes.js';

class KCEExecutor {
  async execute(decision) {
    console.log(`⚡ Executor: Ejecutando ${decision.actions.length} acción(es) de decisión ${decision.decision_id}`);

    for (const action of decision.actions) {
      try {
        await this.executeAction(decision.user_id, action);
      } catch (error) {
        console.error(`❌ Error ejecutando acción ${action.action_type}:`, error);
      }
    }
  }

  async executeAction(userId, action) {
    switch (action.action_type) {
      case ACTION_TYPES.SEND_SILENT_VERIFICATION:
        await this.sendSilentVerification(userId, action.payload);
        break;
      
      case ACTION_TYPES.ALERT_TRUST_CIRCLE:
        await this.alertTrustCircle(userId, action.payload);
        break;
      
      case ACTION_TYPES.ESCALATE_FULL_SOS:
        await this.escalateFullSOS(userId, action.payload);
        break;
      
      case ACTION_TYPES.START_EVIDENCE_RECORDING:
        await this.startEvidenceRecording(userId, action.payload);
        break;
      
      case ACTION_TYPES.STOP_ESCALATION:
        await this.stopEscalation(userId);
        break;
      
      default:
        console.warn(`⚠️ Acción desconocida: ${action.action_type}`);
    }
  }

  async sendSilentVerification(userId, payload) {
    console.log(`🔔 Executor: Verificación silenciosa → Usuario ${userId}`);
    
    const { error } = await supabase
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
      });

    if (error) {
      console.error('❌ Error enviando verificación:', error);
    }
  }

  async alertTrustCircle(userId, payload) {
    console.log(`🚨 Executor: Alerta círculo de confianza → Usuario ${userId}`);
    
    try {
      const { data: circulo, error: circuloError } = await supabase
        .from('circulos_confianza')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (circuloError || !circulo) {
        console.warn('⚠️ No se encontró círculo de confianza');
        return;
      }

      const { error: messageError } = await supabase
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
        });

      if (messageError) {
        console.error('❌ Error enviando mensaje al círculo:', messageError);
      }
    } catch (error) {
      console.error('❌ Error en alertTrustCircle:', error);
    }
  }

  async escalateFullSOS(userId, payload) {
    console.log(`🔴 Executor: SOS COMPLETO → Usuario ${userId}`);
    
    try {
      const token = this.generateToken();
      
      const { data: sos, error } = await supabase
        .from('acompanamientos_activos')
        .insert({
          user_id: userId,
          token: token,
          activo: true,
          tipo: 'sos_full',
          inicio: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando SOS:', error);
        return;
      }

      console.log(`✅ SOS creado con token: ${token}`);
      
      await this.alertTrustCircle(userId, {
        reason: 'SOS ACTIVADO - Emergencia',
        urgency: 'critical',
        tracking_link: `${window.location.origin}/track/${token}`,
        include_tracking_link: true
      });
    } catch (error) {
      console.error('❌ Error en escalateFullSOS:', error);
    }
  }

  async startEvidenceRecording(userId, payload) {
    console.log(`🎥 Executor: Iniciando evidencia → Usuario ${userId}`);
    
    const { error } = await supabase
      .from('ale_events')
      .insert({
        user_id: userId,
        event_type: 'evidence_recording_started',
        event_data: {
          record_audio: payload?.record_audio || true,
          record_video: payload?.record_video || false,
          gps_interval_seconds: payload?.gps_interval_seconds || 10,
          started_at: new Date().toISOString()
        },
        priority: 'critical',
        processed: false
      });

    if (error) {
      console.error('❌ Error registrando inicio de evidencia:', error);
    }
  }

  async stopEscalation(userId) {
    console.log(`✅ Executor: Deteniendo escalamiento → Usuario ${userId}`);
    
    try {
      const { error } = await supabase
        .from('acompanamientos_activos')
        .update({ 
          activo: false,
          fin: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('activo', true);

      if (error) {
        console.error('❌ Error deteniendo SOS:', error);
      }
    } catch (error) {
      console.error('❌ Error en stopEscalation:', error);
    }
  }

  generateToken() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let token = '';
    for (let i = 0; i < 8; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}

const kceExecutor = new KCEExecutor();
export default kceExecutor;
