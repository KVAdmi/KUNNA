// 🚨 SERVICIO DE SOLICITUD DE PERMISOS NATIVOS PARA SOS
// Solicita TODOS los permisos necesarios: Ubicación, Micrófono, Cámara, Notificaciones

import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';

class PermissionsService {
  constructor() {
    this.permissionsGranted = {
      location: false,
      backgroundLocation: false,
      microphone: false,
      camera: false,
      notifications: false
    };
  }

  /**
   * Solicita TODOS los permisos necesarios para el modo SOS
   * @returns {Promise<boolean>} true si todos los permisos fueron concedidos
   */
  async requestAllSOSPermissions() {
    console.log('[PERMISOS] 🔐 Solicitando TODOS los permisos para SOS...');

    try {
      // 1️⃣ UBICACIÓN (GPS + Background)
      const locationGranted = await this.requestLocationPermissions();
      
      // 2️⃣ MICRÓFONO (para grabación de audio)
      const microphoneGranted = await this.requestMicrophonePermission();
      
      // 3️⃣ CÁMARA (para fotos de evidencia)
      const cameraGranted = await this.requestCameraPermission();
      
      // 4️⃣ NOTIFICACIONES (para alertas persistentes)
      const notificationsGranted = await this.requestNotificationsPermission();

      const allGranted = locationGranted && microphoneGranted && cameraGranted && notificationsGranted;

      if (allGranted) {
        console.log('[PERMISOS] ✅ TODOS los permisos concedidos');
      } else {
        console.warn('[PERMISOS] ⚠️ Algunos permisos NO fueron concedidos:', {
          location: locationGranted,
          microphone: microphoneGranted,
          camera: cameraGranted,
          notifications: notificationsGranted
        });
      }

      return allGranted;

    } catch (error) {
      console.error('[PERMISOS] ❌ Error solicitando permisos:', error);
      return false;
    }
  }

  /**
   * Solicita permisos de UBICACIÓN (GPS + Background)
   */
  async requestLocationPermissions() {
    try {
      console.log('[PERMISOS-GPS] 📍 Solicitando ubicación...');

      // Solicitar ubicación precisa
      const locationStatus = await Geolocation.requestPermissions({
        permissions: ['location', 'coarseLocation']
      });

      console.log('[PERMISOS-GPS] Resultado ubicación:', locationStatus);

      this.permissionsGranted.location = 
        locationStatus.location === 'granted' || 
        locationStatus.coarseLocation === 'granted';

      // En Android, solicitar permiso de background location
      if (Capacitor.getPlatform() === 'android') {
        try {
          // Intentar solicitar background location (API 29+)
          const bgStatus = await Geolocation.requestPermissions({
            permissions: ['location']
          });
          
          this.permissionsGranted.backgroundLocation = bgStatus.location === 'granted';
          console.log('[PERMISOS-GPS] Background location:', this.permissionsGranted.backgroundLocation);
        } catch (bgError) {
          console.warn('[PERMISOS-GPS] No se pudo solicitar background location:', bgError);
        }
      }

      return this.permissionsGranted.location;

    } catch (error) {
      console.error('[PERMISOS-GPS] ❌ Error:', error);
      return false;
    }
  }

  /**
   * Solicita permiso de MICRÓFONO
   */
  async requestMicrophonePermission() {
    try {
      console.log('[PERMISOS-MIC] 🎤 Solicitando micrófono...');

      if (!Capacitor.isNativePlatform()) {
        // En web, navigator.mediaDevices.getUserMedia lo solicita automáticamente
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop()); // Cerrar stream de prueba
          this.permissionsGranted.microphone = true;
          console.log('[PERMISOS-MIC] ✅ Concedido (web)');
          return true;
        } catch (err) {
          console.error('[PERMISOS-MIC] ❌ Denegado (web)');
          return false;
        }
      }

      // En nativo, usar plugin de Media o verificar con navigator
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        this.permissionsGranted.microphone = true;
        console.log('[PERMISOS-MIC] ✅ Concedido (nativo)');
        return true;
      } catch (err) {
        console.error('[PERMISOS-MIC] ❌ Denegado:', err);
        return false;
      }

    } catch (error) {
      console.error('[PERMISOS-MIC] ❌ Error:', error);
      return false;
    }
  }

  /**
   * Solicita permiso de CÁMARA
   */
  async requestCameraPermission() {
    try {
      console.log('[PERMISOS-CAM] 📷 Solicitando cámara...');

      if (!Capacitor.isNativePlatform()) {
        // En web, getUserMedia lo solicita automáticamente
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          this.permissionsGranted.camera = true;
          console.log('[PERMISOS-CAM] ✅ Concedido (web)');
          return true;
        } catch (err) {
          console.warn('[PERMISOS-CAM] ⚠️ Denegado (web), continuando...');
          return true; // No bloqueante
        }
      }

      // En nativo, verificar con navigator
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        this.permissionsGranted.camera = true;
        console.log('[PERMISOS-CAM] ✅ Concedido (nativo)');
        return true;
      } catch (err) {
        console.warn('[PERMISOS-CAM] ⚠️ Denegado:', err);
        return true; // No bloqueante para SOS
      }

    } catch (error) {
      console.error('[PERMISOS-CAM] ❌ Error:', error);
      return true; // No bloqueante
    }
  }

  /**
   * Solicita permiso de NOTIFICACIONES
   */
  async requestNotificationsPermission() {
    try {
      console.log('[PERMISOS-NOTIF] 🔔 Solicitando notificaciones...');

      const result = await LocalNotifications.requestPermissions();
      
      this.permissionsGranted.notifications = result.display === 'granted';
      
      console.log('[PERMISOS-NOTIF] Resultado:', result.display);
      
      return this.permissionsGranted.notifications;

    } catch (error) {
      console.error('[PERMISOS-NOTIF] ❌ Error:', error);
      return false;
    }
  }

  /**
   * Verifica si TODOS los permisos ya fueron concedidos
   */
  async checkAllPermissions() {
    try {
      const locationStatus = await Geolocation.checkPermissions();
      this.permissionsGranted.location = 
        locationStatus.location === 'granted' || 
        locationStatus.coarseLocation === 'granted';

      const notificationsStatus = await LocalNotifications.checkPermissions();
      this.permissionsGranted.notifications = notificationsStatus.display === 'granted';

      return this.permissionsGranted.location && this.permissionsGranted.notifications;

    } catch (error) {
      console.error('[PERMISOS] Error verificando permisos:', error);
      return false;
    }
  }

  /**
   * Obtiene el estado de todos los permisos
   */
  getPermissionsStatus() {
    return { ...this.permissionsGranted };
  }
}

// Exportar instancia única (singleton)
const permissionsService = new PermissionsService();
export default permissionsService;
