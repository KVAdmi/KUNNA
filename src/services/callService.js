// src/services/callService.js
// Servicio para llamadas automáticas en emergencias (Twilio integration)

import { supabase } from '../config/supabaseClient';

class CallService {
  constructor() {
    this.twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = import.meta.env.VITE_TWILIO_PHONE_NUMBER;
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  }

  /**
   * Hacer llamada automática a un contacto
   * NOTA: Esta función debe ejecutarse desde el BACKEND por seguridad
   * Este es solo un wrapper que llama al endpoint del backend
   */
  async makeEmergencyCall(phoneNumber, message, userId, emergencyId) {
    try {
      console.log(`[CallService] Iniciando llamada a ${phoneNumber}`);

      // Llamar Edge Function de Supabase (emergency-call)
      const { data, error } = await supabase.functions.invoke('emergency-call', {
        body: {
          phoneNumber,
          message,
          userId,
          emergencyId
        }
      });

      if (error) {
        throw new Error(error.message || 'Error en emergency-call');
      }

      console.log('[CallService] Llamada iniciada:', data);

      // El Edge Function ya registra en emergency_calls_log.
      // Solo devolvemos la respuesta al caller.
      return data;

    } catch (error) {
      console.error('[CallService] Error haciendo llamada:', error);
      
      // Registrar error
      await this.logCall(userId, emergencyId, phoneNumber, null, 'failed', error.message);
      
      throw error;
    }
  }

  /**
   * Hacer llamadas a todos los contactos de emergencia
   */
  async makeEmergencyCalls(userId, emergencyId, customMessage = null) {
    try {
      // Obtener contactos de emergencia
      const { data: profile } = await supabase
        .from('usuarios')
        .select('contactos_emergencia, nombre_completo')
        .eq('id', userId)
        .single();

      if (!profile || !profile.contactos_emergencia || profile.contactos_emergencia.length === 0) {
        console.warn('[CallService] No hay contactos de emergencia');
        return { success: false, message: 'No hay contactos configurados' };
      }

      const mensaje = customMessage || 
        `Emergencia de ${profile.nombre_completo}. Necesita ayuda inmediata. Esta es una llamada automatizada de KUNNA.`;

      const results = [];

      // Hacer llamadas a todos los contactos
      for (const contacto of profile.contactos_emergencia) {
        if (!contacto.telefono) continue;

        try {
          const result = await this.makeEmergencyCall(
            contacto.telefono,
            mensaje,
            userId,
            emergencyId
          );

          results.push({
            contacto: contacto.nombre,
            phone: contacto.telefono,
            success: true,
            callSid: result.callSid
          });

          // Esperar 2 segundos entre llamadas para no saturar
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          results.push({
            contacto: contacto.nombre,
            phone: contacto.telefono,
            success: false,
            error: error.message
          });
        }
      }

      console.log('[CallService] Llamadas completadas:', results);

      return {
        success: true,
        results,
        totalCalls: results.length,
        successfulCalls: results.filter(r => r.success).length
      };

    } catch (error) {
      console.error('[CallService] Error en llamadas grupales:', error);
      throw error;
    }
  }

  /**
   * Enviar SMS a contactos (alternativa más barata que llamadas)
   */
  async sendEmergencySMS(userId, emergencyId, customMessage = null) {
    try {
      const { data: profile } = await supabase
        .from('usuarios')
        .select('contactos_emergencia, nombre_completo')
        .eq('id', userId)
        .single();

      if (!profile || !profile.contactos_emergencia || profile.contactos_emergencia.length === 0) {
        console.warn('[CallService] No hay contactos de emergencia');
        return { success: false, message: 'No hay contactos configurados' };
      }

      const mensaje = customMessage || 
        `🚨 EMERGENCIA KUNNA: ${profile.nombre_completo} necesita ayuda inmediata. Contacta ya.`;

      // Usar Edge Function de Supabase (emergency-sms)
      const { data, error } = await supabase.functions.invoke('emergency-sms', {
        body: {
          contacts: profile.contactos_emergencia,
          message: mensaje,
          userId,
          emergencyId
        }
      });

      if (error) {
        throw new Error(error.message || 'Error en emergency-sms');
      }

      console.log('[CallService] SMS enviados:', data);

      return data;

    } catch (error) {
      console.error('[CallService] Error enviando SMS:', error);
      throw error;
    }
  }

  /**
   * Registrar llamada en base de datos
   */
  async logCall(userId, emergencyId, phoneNumber, callSid, status, errorMessage = null) {
    try {
      await supabase
        .from('emergency_calls_log')
        .insert([{
          user_id: userId,
          emergency_id: emergencyId,
          phone_number: phoneNumber,
          call_sid: callSid,
          status,
          error_message: errorMessage,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('[CallService] Error logging call:', error);
    }
  }

  /**
   * Verificar estado de una llamada
   */
  async getCallStatus(callSid) {
    try {
      const response = await fetch(`${this.backendUrl}/api/call-status/${callSid}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('[CallService] Error obteniendo estado:', error);
      throw error;
    }
  }

  /**
   * Verificar configuración de Twilio
   */
  isConfigured() {
    return !!(this.twilioAccountSid && this.twilioAuthToken && this.twilioPhoneNumber);
  }
}

// Singleton
const callService = new CallService();

export default callService;
