import React, { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const GeolocationTest = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const watchIdRef = useRef(null);

  const testBasicLocation = async () => {
    toast({
      title: '🚀 Probando ubicación básica...',
      description: 'Solicitando permisos y ubicación',
    });

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      });

      const result = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      };

      setLastPosition(result);

      toast({
        title: '✅ Ubicación obtenida',
        description: `Lat: ${result.latitude.toFixed(6)}, Lng: ${result.longitude.toFixed(6)}, Precisión: ${Math.round(result.accuracy)}m`,
      });

    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: '❌ Error de ubicación',
        description: `Código: ${error.code}, Mensaje: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const testDatabaseInsert = async () => {
    if (!lastPosition) {
      toast({
        title: '⚠️ No hay ubicación',
        description: 'Primero obtén una ubicación',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: '⚠️ No autenticado',
        description: 'Necesitas estar logueado',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Test inserción en acompanamientos_activos
      const { error: upsertError } = await supabase
        .from('acompanamientos_activos')
        .upsert({
          user_id: user.id,
          latitud_actual: lastPosition.latitude,
          longitud_actual: lastPosition.longitude,
          ubicacion_actual: {
            type: "Point",
            coordinates: [lastPosition.longitude, lastPosition.latitude]
          },
          activo: true,
          updated_at: new Date().toISOString(),
          precision_metros: Math.round(lastPosition.accuracy)
        });

      if (upsertError) {
        throw upsertError;
      }

      toast({
        title: '✅ Base de datos actualizada',
        description: 'Ubicación guardada en acompanamientos_activos',
      });

    } catch (error) {
      console.error('Error saving to database:', error);
      toast({
        title: '❌ Error de base de datos',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const startTracking = () => {
    if (watchIdRef.current) {
      toast({
        title: '⚠️ Ya está activo',
        description: 'El seguimiento ya está en curso',
      });
      return;
    }

    const onSuccess = (position) => {
      const result = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      };

      setLastPosition(result);
      setLocationHistory(prev => [...prev.slice(-9), result]); // Mantener últimas 10 ubicaciones

      console.log('📍 Tracking update:', result);
    };

    const onError = (error) => {
      console.error('Tracking error:', error);
      toast({
        title: '❌ Error de seguimiento',
        description: `${error.message}`,
        variant: 'destructive',
      });
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );

    setIsTracking(true);
    toast({
      title: '🔄 Seguimiento iniciado',
      description: 'Obteniendo ubicación continua...',
    });
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTracking(false);
      
      toast({
        title: '⏹️ Seguimiento detenido',
        description: `Total de ubicaciones: ${locationHistory.length}`,
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">🧪 Test de Geolocalización</h2>
      
      {/* Botones de control */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={testBasicLocation}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg font-medium"
        >
          📍 Test Básico
        </button>
        
        <button
          onClick={testDatabaseInsert}
          disabled={!lastPosition}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white p-3 rounded-lg font-medium"
        >
          💾 Test BD
        </button>
        
        <button
          onClick={startTracking}
          disabled={isTracking}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white p-3 rounded-lg font-medium"
        >
          ▶️ Iniciar
        </button>
        
        <button
          onClick={stopTracking}
          disabled={!isTracking}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-3 rounded-lg font-medium"
        >
          ⏹️ Detener
        </button>
      </div>

      {/* Estado actual */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h3 className="font-bold mb-2">📊 Estado Actual</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Seguimiento:</strong> {isTracking ? '🟢 Activo' : '🔴 Inactivo'}
          </div>
          <div>
            <strong>Usuario:</strong> {user ? '✅ Logueado' : '❌ No logueado'}
          </div>
          <div>
            <strong>Ubicaciones:</strong> {locationHistory.length}
          </div>
        </div>
      </div>

      {/* Última ubicación */}
      {lastPosition && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <h3 className="font-bold mb-2 text-green-800">📍 Última Ubicación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Latitud:</strong> {lastPosition.latitude.toFixed(8)}
            </div>
            <div>
              <strong>Longitud:</strong> {lastPosition.longitude.toFixed(8)}
            </div>
            <div>
              <strong>Precisión:</strong> {Math.round(lastPosition.accuracy)}m
            </div>
            <div>
              <strong>Timestamp:</strong> {new Date(lastPosition.timestamp).toLocaleTimeString()}
            </div>
          </div>
          <div className="mt-2">
            <a
              href={`https://www.google.com/maps?q=${lastPosition.latitude},${lastPosition.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              🗺️ Ver en Google Maps
            </a>
          </div>
        </div>
      )}

      {/* Historial de ubicaciones */}
      {locationHistory.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-bold mb-2 text-blue-800">📈 Historial de Ubicaciones</h3>
          <div className="max-h-60 overflow-y-auto">
            {locationHistory.slice().reverse().map((pos, index) => (
              <div key={index} className="text-xs border-b border-blue-100 py-2">
                <span className="font-mono">
                  {new Date(pos.timestamp).toLocaleTimeString()} - 
                  Lat: {pos.latitude.toFixed(6)}, 
                  Lng: {pos.longitude.toFixed(6)}, 
                  Precisión: {Math.round(pos.accuracy)}m
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeolocationTest;
