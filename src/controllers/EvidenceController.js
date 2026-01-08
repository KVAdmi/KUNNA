/**
 * EvidenceController - Controlador de permisos y captura de evidencia
 * 
 * Responsabilidades:
 * 1. Verificar permisos (mic, camera, GPS)
 * 2. Solicitar permisos con UX discreta y segura
 * 3. Escuchar flag evidence_requested de backend
 * 4. Preparar captura en siguiente apertura (NO auto-grabar sin permiso)
 * 5. Manejar upload a storage
 * 
 * IMPORTANTE: Nunca grabar sin consentimiento explícito
 */

import { supabase } from '../lib/supabase';

class EvidenceController {
  constructor() {
    this.permissions = {
      microphone: null,
      camera: null,
      geolocation: null
    };
    
    this.evidenceRequested = false;
    this.userId = null;
  }

  /**
   * Inicializar controller con userId
   */
  async init(userId) {
    this.userId = userId;
    
    // Verificar permisos actuales
    await this.checkAllPermissions();
    
    // Escuchar flag evidence_requested desde backend
    this.listenForEvidenceRequests();
    
    return this.permissions;
  }

  /**
   * Verificar estado actual de todos los permisos
   */
  async checkAllPermissions() {
    // Verificar mic
    this.permissions.microphone = await this.checkPermission('microphone');
    
    // Verificar camera
    this.permissions.camera = await this.checkPermission('camera');
    
    // Verificar GPS
    this.permissions.geolocation = await this.checkPermission('geolocation');
    
    console.log('📋 Permisos actuales:', this.permissions);
    
    return this.permissions;
  }

  /**
   * Verificar un permiso específico
   */
  async checkPermission(type) {
    try {
      if (!navigator.permissions) {
        console.warn('Permissions API no disponible');
        return 'unknown';
      }

      const result = await navigator.permissions.query({ name: type });
      return result.state; // 'granted', 'denied', 'prompt'
    } catch (error) {
      console.warn(`No se pudo verificar permiso ${type}:`, error);
      return 'unknown';
    }
  }

  /**
   * Solicitar permiso de micrófono con UX discreta
   */
  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });
      
      // Detener inmediatamente (solo queríamos el permiso)
      stream.getTracks().forEach(track => track.stop());
      
      this.permissions.microphone = 'granted';
      console.log('✅ Permiso de micrófono concedido');
      
      return { success: true, state: 'granted' };
    } catch (error) {
      this.permissions.microphone = 'denied';
      console.error('❌ Permiso de micrófono denegado:', error);
      
      return { 
        success: false, 
        state: 'denied',
        error: error.message 
      };
    }
  }

  /**
   * Solicitar permiso de cámara con UX discreta
   */
  async requestCameraPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      
      // Detener inmediatamente
      stream.getTracks().forEach(track => track.stop());
      
      this.permissions.camera = 'granted';
      console.log('✅ Permiso de cámara concedido');
      
      return { success: true, state: 'granted' };
    } catch (error) {
      this.permissions.camera = 'denied';
      console.error('❌ Permiso de cámara denegado:', error);
      
      return { 
        success: false, 
        state: 'denied',
        error: error.message 
      };
    }
  }

  /**
   * Solicitar permiso de GPS con UX discreta
   */
  async requestGeolocationPermission() {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.permissions.geolocation = 'granted';
          console.log('✅ Permiso de GPS concedido');
          
          resolve({ 
            success: true, 
            state: 'granted',
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
          });
        },
        (error) => {
          this.permissions.geolocation = 'denied';
          console.error('❌ Permiso de GPS denegado:', error);
          
          resolve({ 
            success: false, 
            state: 'denied',
            error: error.message 
          });
        },
        {
          timeout: 10000,
          maximumAge: 60000 // Cache por 1 minuto
        }
      );
    });
  }

  /**
   * Solicitar TODOS los permisos necesarios
   * Mostrar UX con copy seguro y neutro
   */
  async requestAllPermissions() {
    const results = {
      microphone: await this.requestMicrophonePermission(),
      camera: await this.requestCameraPermission(),
      geolocation: await this.requestGeolocationPermission()
    };

    // Log para auditoría (sin datos sensibles)
    console.log('📋 Resultados de permisos:', {
      microphone: results.microphone.state,
      camera: results.camera.state,
      geolocation: results.geolocation.state
    });

    return results;
  }

  /**
   * Escuchar flag evidence_requested desde backend
   * (Viene de kunna_ale_decisions.actions o de tabla separada)
   */
  listenForEvidenceRequests() {
    if (!this.userId) {
      console.warn('userId no configurado, no se puede escuchar evidence_requested');
      return;
    }

    // Polling cada 30 segundos (o usar realtime si está disponible)
    this.evidenceCheckInterval = setInterval(async () => {
      await this.checkEvidenceRequested();
    }, 30000);

    // Check inmediato
    this.checkEvidenceRequested();
  }

  /**
   * Verificar si backend solicitó evidencia
   */
  async checkEvidenceRequested() {
    try {
      // Query a kunna_ale_decisions buscando acciones de tipo 'start_evidence_recording'
      const { data, error } = await supabase
        .from('kunna_ale_decisions')
        .select('id, actions, created_at')
        .eq('user_id', this.userId)
        .contains('actions', [{ type: 'start_evidence_recording' }])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      if (data) {
        // Evidencia solicitada
        const requestAge = Date.now() - new Date(data.created_at).getTime();
        
        // Solo actuar si la solicitud es reciente (< 5 minutos)
        if (requestAge < 5 * 60 * 1000) {
          console.log('🎥 Evidencia solicitada por backend');
          this.evidenceRequested = true;
          
          // Notificar a la UI (via event)
          window.dispatchEvent(new CustomEvent('evidence-requested', {
            detail: { decisionId: data.id }
          }));
        }
      }
    } catch (error) {
      console.error('Error verificando evidence_requested:', error);
    }
  }

  /**
   * Iniciar captura de audio (mic)
   */
  async startAudioRecording(durationSeconds = 30) {
    if (this.permissions.microphone !== 'granted') {
      throw new Error('Permiso de micrófono no concedido');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });

      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());
          
          const blob = new Blob(chunks, { type: 'audio/webm' });
          resolve(blob);
        };

        mediaRecorder.onerror = (error) => {
          stream.getTracks().forEach(track => track.stop());
          reject(error);
        };

        mediaRecorder.start();

        // Auto-stop después de durationSeconds
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, durationSeconds * 1000);
      });
    } catch (error) {
      console.error('Error grabando audio:', error);
      throw error;
    }
  }

  /**
   * Obtener ubicación actual
   */
  async getCurrentLocation() {
    if (this.permissions.geolocation !== 'granted') {
      // Intentar solicitar permiso automáticamente
      const result = await this.requestGeolocationPermission();
      if (!result.success) {
        throw new Error('Permiso de GPS no concedido');
      }
      return result.location;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          reject(error);
        },
        {
          timeout: 10000,
          maximumAge: 30000,
          enableHighAccuracy: true
        }
      );
    });
  }

  /**
   * Upload de evidencia a Supabase Storage
   */
  async uploadEvidence(blob, type = 'audio', metadata = {}) {
    if (!this.userId) {
      throw new Error('userId no configurado');
    }

    try {
      const timestamp = Date.now();
      const filename = `${this.userId}/${type}_${timestamp}.webm`;
      
      const { data, error } = await supabase.storage
        .from('evidencias_sos')
        .upload(filename, blob, {
          contentType: type === 'audio' ? 'audio/webm' : 'video/webm',
          metadata: {
            user_id: this.userId,
            type,
            ...metadata
          }
        });

      if (error) throw error;

      console.log('✅ Evidencia subida:', data.path);

      return {
        success: true,
        path: data.path,
        url: supabase.storage.from('evidencias_sos').getPublicUrl(data.path).data.publicUrl
      };
    } catch (error) {
      console.error('❌ Error subiendo evidencia:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.evidenceCheckInterval) {
      clearInterval(this.evidenceCheckInterval);
    }
  }
}

// Singleton
const evidenceController = new EvidenceController();

export default evidenceController;

/**
 * Hook para React
 */
export function useEvidenceController() {
  return evidenceController;
}
