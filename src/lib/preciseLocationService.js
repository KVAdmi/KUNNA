// 🚀 SERVICIO DE GEOLOCALIZACIÓN HÍBRIDO ULTRA-RÁPIDO Y RESISTENTE
// GPS Nativo + Tareas en Segundo Plano para máxima fiabilidad.

import supabase from './customSupabaseClient';
import { Capacitor } from '@capacitor/core';

class PreciseLocationService {
  constructor() {
    this.currentWatchId = null;
    this.backgroundTaskId = null;
    this.currentTrackingInfo = null;
  }

  // 🚀 MÉTODO PRINCIPAL: GPS NATIVO
  async getCurrentPosition(options = {}) {
  console.log('[GEO] getCurrentPosition llamado con opciones:', options);
  console.log('[GEO] getCurrentPosition llamado con opciones:', options);
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0
    };

    const config = { ...defaultOptions, ...options };
    
    try {
      console.log('📱 [GPS-NATIVO] Intentando GPS del dispositivo...');
      const position = await this._getNativeGeolocation(config);
      console.log(`✅ [GPS-NATIVO] ¡Éxito! Precisión: ${position.accuracy}m`);
      this.lastKnownPosition = position;
      return position;
    } catch (error) {
      console.error('⚠️ [GPS-ERROR] Error al obtener ubicación:', error);
      throw error;
    }
  }

  // Obtener ubicación del GPS nativo
  async _getNativeGeolocation(options) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout al obtener ubicación'));
      }, options.timeout);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(new Error(`Error nativo: ${error.message}`));
        },
        {
          enableHighAccuracy: options.enableHighAccuracy,
          timeout: options.timeout,
          maximumAge: options.maximumAge
        }
      );
    });
  }

  // Método para verificar y solicitar permisos de ubicación
  async requestLocationPermission() {
    if (!('permissions' in navigator)) {
      console.warn('[GEO] API de permisos no disponible en este navegador.');
      return true; // Asumir que los permisos están habilitados
    }

    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

      if (permissionStatus.state === 'granted') {
        console.log('[GEO] Permiso de ubicación concedido.');
        return true;
      } else if (permissionStatus.state === 'prompt') {
        console.log('[GEO] Permiso de ubicación requiere interacción del usuario.');
        return true; // El navegador pedirá permiso al usuario
      } else {
        console.error('[GEO] Permiso de ubicación denegado.');
        return false;
      }
    } catch (error) {
      console.error('[GEO] Error al verificar permisos de ubicación:', error);
      return false;
    }
  }

  // Función para obtener ubicación precisa
  async getPreciseLocation(options = {}) {
    const hasPermission = await this.requestLocationPermission();

    if (!hasPermission) {
      throw new Error('Permiso de ubicación denegado. No se puede obtener la ubicación.');
    }

    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        return reject(new Error('Geolocation API no disponible'));
      }

      const geolocOpts = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
        ...options,
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          resolve({
            latitude: Number(latitude),
            longitude: Number(longitude),
            accuracy: Number(accuracy),
            timestamp: pos.timestamp,
          });
        },
        (err) => reject(err),
        geolocOpts
      );
    });
  }

  // 🔄 INICIAR SEGUIMIENTO EN SEGUNDO PLANO
  async startBackgroundTaskWatch({ token }) {
    console.log('🚀 [BG-TASK] Iniciando seguimiento en segundo plano...');

    if (!token) {
      console.error('❌ [BG-TASK-ERROR] Se intentó iniciar el seguimiento sin un token.');
      throw new Error('Se requiere un token válido para el seguimiento');
    }

    this.currentTrackingInfo = { token };

    const updateLocation = async () => {
      try {
        const position = await this.getPreciseLocation({
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        });

        console.log('📍 [BG-TASK] Nueva ubicación:', position);

        const payload = {
          latitud_actual: Number(position.latitude),
          longitud_actual: Number(position.longitude),
          precision_metros: Math.round(Number(position.accuracy) || 0),
          ubicacion_actual: {
            lat: position.latitude,
            lng: position.longitude,
            accuracy: position.accuracy,
            at: new Date().toISOString(),
          },
          ruta_seguimiento: [...(this.currentTrackingInfo.ruta_seguimiento || []), {
            lat: position.latitude,
            lng: position.longitude,
            at: new Date().toISOString(),
          }],
          ultima_actualizacion_ubicacion: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from('acompanamientos_activos')
          .update(payload)
          .eq('token', token);

        if (updateError) {
          console.error('[SUPABASE] Error al actualizar ubicación:', updateError);
          return;
        }

        // 📍 INSERTAR PUNTO EN acompanamientos_puntos para polyline
        if (window.__currentAcompId) {
          try {
            await supabase.from('acompanamientos_puntos').insert({
              acompanamiento_id: window.__currentAcompId,
              latitud: Number(position.latitude),
              longitud: Number(position.longitude),
              precision_metros: Math.round(Number(position.accuracy) || 0),
              velocidad_mps: position.speed || null,
              rumbo_grados: position.heading || null,
              proveedor: 'gps',
              en_movimiento: true,
              recorded_at: new Date().toISOString()
            });
            console.log('[POLYLINE] ✅ Punto GPS guardado');
          } catch (pointErr) {
            console.error('[POLYLINE] Error guardando punto:', pointErr);
          }
        }

        console.info('[SUPABASE] Ubicación actualizada', {
          token,
          lat: payload.latitud_actual,
          lng: payload.longitud_actual,
        });
      } catch (error) {
        console.error('[BG-TASK] Error en actualización:', error);
      }
    };

  this.currentWatchId = setInterval(updateLocation, 3000);
    await updateLocation();
  }

  // ⏹️ DETENER SEGUIMIENTO
  async stopWatch() {
    console.log('⏹️ [BG-TASK] Deteniendo seguimiento...');
    
    if (this.currentWatchId) {
      clearInterval(this.currentWatchId);
      this.currentWatchId = null;
    }

    if (this.backgroundTaskId && Capacitor.isNativePlatform()) {
      try {
        const { BackgroundTask } = await import('@capawesome/capacitor-background-task');
        await BackgroundTask.finish({ taskId: this.backgroundTaskId });
      } catch (error) {
        console.error('⚠️ [BG-TASK] Error al detener tarea nativa:', error);
      }
      this.backgroundTaskId = null;
    }

    this.currentTrackingInfo = null;
    console.log('✅ [BG-TASK] Seguimiento detenido');
  }
}

// Instancia única para toda la app
const preciseLocationService = new PreciseLocationService();
export default preciseLocationService;
