// SISTEMA DE GEOLOCALIZACIÓN PROFESIONAL PARA ZINHA
// Sistema híbrido con Google Geolocation API como respaldo

const GOOGLE_API_KEY = 'AIzaSyBWwOIBjClToEXMqtAEMohrZEvNCPuKDAw';

export class GeolocationService {
  constructor() {
    this.lastKnownPosition = null;
    this.isHighAccuracyAvailable = true;
  }

  /**
   * Obtener ubicación con máxima precisión
   * Usa GPS nativo primero, Google API como respaldo
   */
  async getCurrentPosition() {
    console.log('🎯 ZINHA: Iniciando geolocalización de alta precisión...');

    try {
      // MÉTODO 1: GPS Nativo (más preciso)
      const nativePosition = await this.getNativePosition();
      
      if (nativePosition && nativePosition.coords.accuracy < 50) {
        console.log('✅ GPS nativo exitoso - precisión:', nativePosition.coords.accuracy, 'metros');
        this.lastKnownPosition = nativePosition;
        return {
          latitude: nativePosition.coords.latitude,
          longitude: nativePosition.coords.longitude,
          accuracy: nativePosition.coords.accuracy,
          source: 'GPS_NATIVO',
          timestamp: Date.now()
        };
      }

      console.log('⚠️ GPS nativo impreciso, probando Google API...');
      
      // MÉTODO 2: Google Geolocation API (respaldo)
      const googlePosition = await this.getGooglePosition();
      
      if (googlePosition) {
        console.log('✅ Google API exitoso - precisión:', googlePosition.accuracy, 'metros');
        return googlePosition;
      }

      // MÉTODO 3: Última ubicación conocida
      if (this.lastKnownPosition) {
        console.log('⚠️ Usando última ubicación conocida');
        return {
          latitude: this.lastKnownPosition.coords.latitude,
          longitude: this.lastKnownPosition.coords.longitude,
          accuracy: this.lastKnownPosition.coords.accuracy + 100, // Penalizar precisión
          source: 'CACHE',
          timestamp: Date.now()
        };
      }

      throw new Error('No se pudo obtener ubicación por ningún método');

    } catch (error) {
      console.error('❌ Error completo en geolocalización:', error);
      throw error;
    }
  }

  /**
   * GPS Nativo del navegador
   */
  async getNativePosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Timeout GPS nativo'));
      }, 15000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeout);
          resolve(position);
        },
        (error) => {
          clearTimeout(timeout);
          console.log('⚠️ Error GPS nativo:', error.message);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000
        }
      );
    });
  }

  /**
   * Google Geolocation API
   */
  async getGooglePosition() {
    try {
      console.log('🔄 Llamando Google Geolocation API...');
      
      const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`, {
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
        throw new Error(`Google API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.location) {
        return {
          latitude: data.location.lat,
          longitude: data.location.lng,
          accuracy: data.accuracy || 1000,
          source: 'GOOGLE_API',
          timestamp: Date.now()
        };
      }

      throw new Error('No location in Google response');

    } catch (error) {
      console.error('❌ Error Google API:', error);
      return null;
    }
  }

  /**
   * Monitoreo continuo para seguimiento
   */
  startWatching(callback, options = {}) {
    const watchOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3000,
      ...options
    };

    let watchId = null;
    let lastUpdate = 0;
    const MIN_UPDATE_INTERVAL = 3000; // Mínimo 3 segundos entre updates

    const handlePosition = async (position) => {
      const now = Date.now();
      
      // Evitar updates demasiado frecuentes
      if (now - lastUpdate < MIN_UPDATE_INTERVAL) {
        return;
      }

      try {
        // Validar precisión
        if (position.coords.accuracy > 100) {
          console.log('⚠️ Precisión insuficiente:', position.coords.accuracy, 'metros');
          
          // Intentar Google API si GPS es impreciso
          const googlePos = await this.getGooglePosition();
          if (googlePos && googlePos.accuracy < position.coords.accuracy) {
            callback(googlePos);
            lastUpdate = now;
            return;
          }
        }

        // Usar GPS nativo si es suficientemente preciso
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: 'GPS_WATCH',
          timestamp: now
        };

        this.lastKnownPosition = position;
        callback(locationData);
        lastUpdate = now;

      } catch (error) {
        console.error('❌ Error en handlePosition:', error);
      }
    };

    const handleError = (error) => {
      console.error('❌ Error en watchPosition:', error);
      
      // Intentar obtener ubicación con Google API
      this.getGooglePosition().then(googlePos => {
        if (googlePos) {
          callback(googlePos);
        }
      });
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        watchOptions
      );
    }

    return {
      id: watchId,
      stop: () => {
        if (watchId) {
          navigator.geolocation.clearWatch(watchId);
        }
      }
    };
  }

  /**
   * Validar que una ubicación es confiable
   */
  isLocationReliable(location) {
    if (!location) return false;
    
    // Verificar que esté en un rango geográfico válido
    if (Math.abs(location.latitude) > 90 || Math.abs(location.longitude) > 180) {
      return false;
    }

    // Verificar precisión aceptable
    if (location.accuracy > 500) {
      return false;
    }

    return true;
  }

  /**
   * Obtener dirección desde coordenadas (opcional)
   */
  async getAddressFromCoords(lat, lng) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      
      return 'Ubicación desconocida';
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      return 'Ubicación desconocida';
    }
  }
}

// Instancia global
export const geolocationService = new GeolocationService();
