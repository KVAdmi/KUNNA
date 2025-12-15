// 🎯 SERVICIO DE GEOLOCALIZACIÓN DE ALTA PRECISIÓN - GOOGLE MAPS ONLY
// Solo Google Maps para máxima precisión y velocidad en emergencias

class PreciseLocationService {
  constructor() {
    this.apiKey = 'AIzaSyBWwOIBjClToEXMqtAEMohrZEvNCPuKDAw'; // Tu API key directo
    this.currentWatchId = null;
    this.lastKnownPosition = null;
    this.accuracyThreshold = 50; // metros
    this.callbacks = new Set();
  }

  // 🚀 MÉTODO PRINCIPAL: Solo Google Maps - Máxima precisión
  async getCurrentPosition(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // Reducido para emergencias
      maximumAge: 0,
      requireHighAccuracy: true,
      retries: 2
    };

    const config = { ...defaultOptions, ...options };
    
    console.log('🎯 [EMERGENCIA] Obteniendo ubicación con Google Maps...');

    // SOLO GOOGLE MAPS - SIN FALLBACKS QUE CONFUNDAN
    for (let attempt = 1; attempt <= config.retries; attempt++) {
      try {
        console.log(`🌐 [GOOGLE-${attempt}] Solicitando ubicación...`);
        const position = await this.getGoogleGeolocation();
        
        console.log(`✅ [GOOGLE-${attempt}] Precisión: ${position.accuracy}m`);
        this.lastKnownPosition = position;
        return position;
        
      } catch (error) {
        console.error(`❌ [GOOGLE-${attempt}] Error:`, error.message);
        
        if (attempt === config.retries) {
          // Solo si Google falla completamente, usar nativo como último recurso
          console.log('⚠️ Google falló, usando nativo como último recurso...');
          try {
            const fallbackPosition = await this.getNativeGeolocation(config);
            console.log(`✅ [FALLBACK] Precisión: ${fallbackPosition.accuracy}m`);
            return fallbackPosition;
          } catch (nativeError) {
            throw new Error(`No se pudo obtener ubicación: Google falló (${error.message}), Nativo falló (${nativeError.message})`);
          }
        }
        
        // Esperar antes del siguiente intento
        await this.delay(1000);
      }
    }
  }

  // 🌐 GOOGLE GEOLOCATION API - PRIORIDAD MÁXIMA
  async getGoogleGeolocation() {
    const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        considerIp: true,
        wifiAccessPoints: [],
        cellTowers: []
      })
    });

    if (!response.ok) {
      throw new Error(`Google Geolocation Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.location) {
      throw new Error('Google Geolocation: No location data received');
    }
    
    return {
      latitude: data.location.lat,
      longitude: data.location.lng,
      accuracy: data.accuracy || 30, // Google suele dar precisión muy alta
      timestamp: Date.now(),
      source: 'google-api'
    };
  }

  // 📱 GEOLOCALIZACIÓN NATIVA - SOLO COMO ÚLTIMO RECURSO
  getNativeGeolocation(options) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error(`Timeout después de ${options.timeout}ms`));
      }, options.timeout);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            source: 'browser-native'
          });
        },
        (error) => {
          clearTimeout(timeout);
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: options.enableHighAccuracy,
          timeout: options.timeout,
          maximumAge: options.maximumAge
        }
      );
    });
  }

  // 🔄 SEGUIMIENTO CONTINUO PARA ACOMPAÑAMIENTO
  startHighAccuracyWatch(callback, options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      interval: 3000, // Cada 3 segundos para emergencias
      minAccuracy: 100, // Aceptar hasta 100m para seguimiento
      timeout: 8000
    };

    const config = { ...defaultOptions, ...options };
    
    console.log('🔄 [SEGUIMIENTO] Iniciando watch con Google Maps...');
    
    // Detener cualquier watch previo
    this.stopWatch();
    
    // Función para obtener ubicación periódicamente
    const updateLocation = async () => {
      try {
        const position = await this.getCurrentPosition({
          timeout: config.timeout,
          enableHighAccuracy: config.enableHighAccuracy
        });
        
        // Solo notificar si la precisión es aceptable
        if (position.accuracy <= config.minAccuracy) {
          callback(position);
          this.notifyCallbacks(position);
        } else {
          console.warn(`⚠️ Precisión insuficiente: ${position.accuracy}m (requerido: ${config.minAccuracy}m)`);
        }
        
      } catch (error) {
        console.error('❌ Error en watch:', error);
        // Continuar intentando...
      }
    };
    
    // Obtener ubicación inicial inmediatamente
    updateLocation();
    
    // Configurar intervalo
    this.currentWatchId = setInterval(updateLocation, config.interval);
    
    console.log(`✅ Watch iniciado: cada ${config.interval}ms, precisión mín: ${config.minAccuracy}m`);
  }

  // ⏹️ DETENER SEGUIMIENTO
  stopWatch() {
    if (this.currentWatchId) {
      clearInterval(this.currentWatchId);
      this.currentWatchId = null;
      console.log('⏹️ Watch detenido');
    }
  }

  // ✅ VERIFICAR PRECISIÓN
  isHighAccuracy(position) {
    return position && position.accuracy && position.accuracy <= this.accuracyThreshold;
  }

  // 📢 NOTIFICAR CALLBACKS
  notifyCallbacks(position) {
    this.callbacks.forEach(callback => {
      try {
        callback(position);
      } catch (error) {
        console.error('Error en callback:', error);
      }
    });
  }

  // ⏰ DELAY PARA REINTENTOS
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ℹ️ INFORMACIÓN DEL SERVICIO
  getServiceInfo() {
    return {
      provider: 'Google Maps Geolocation API',
      accuracy: 'Alta (10-50m típicamente)',
      speed: 'Rápida (2-5 segundos)',
      fallback: 'Browser nativo solo como último recurso',
      lastPosition: this.lastKnownPosition
    };
  }
}

// Instancia única para toda la app
const preciseLocationService = new PreciseLocationService();

export default preciseLocationService;
