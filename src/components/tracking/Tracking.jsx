import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { GoogleMap, LoadScript, Polyline, Marker } from '@react-google-maps/api';
import supabase from '@/lib/customSupabaseClient';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 20.6597, lng: -103.3496 }; // Guadalajara
const MAP_OPTIONS = {
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true
};

const Tracking = () => {
  const { token } = useParams();
  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [path, setPath] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);
  const [audios, setAudios] = useState([]);
  const [videos, setVideos] = useState([]);

  // Función para cargar los datos del tracking
  const loadTrackingData = useCallback(async () => {
    if (!token?.startsWith('track_')) {
      setError('Token de seguimiento no válido');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Consultando tracking con token:', token);
      const { data, error: supabaseError } = await supabase.rpc(
        'obtener_seguimiento_por_token_v2',
        { p_token: token }
      );

      if (supabaseError) {
        console.error('Error Supabase:', supabaseError);
        throw new Error(supabaseError.message);
      }

      console.log('📡 Respuesta del servidor:', data);

      if (!data) {
        throw new Error('Seguimiento no encontrado o caducado');
      }

      // Normalizar la respuesta según el formato
      const seguimiento = data.seguimiento || data;
      setTracking(seguimiento);
      
      // Procesar ubicaciones para el path
      const ubicaciones = data.ubicaciones || data.historial || [];
      if (ubicaciones.length > 0) {
        console.log('🗺️ Procesando ubicaciones:', ubicaciones.length);
        const coords = ubicaciones.map(u => ({
          lat: parseFloat(u.latitud),
          lng: parseFloat(u.longitud)
        })).reverse();
        setPath(coords);
      }

      // Establecer ubicación actual
      const ubicacionActual = seguimiento.ubicacion_actual || seguimiento.ultima_ubicacion;
      if (ubicacionActual) {
        console.log('📍 Ubicación actual encontrada:', ubicacionActual);
        let current;
        
        // Manejar diferentes formatos de ubicación
        if (ubicacionActual.coordinates) {
          // Formato GeoJSON
          current = {
            lat: ubicacionActual.coordinates[1],
            lng: ubicacionActual.coordinates[0]
          };
        } else if (ubicacionActual.latitud && ubicacionActual.longitud) {
          // Formato plano
          current = {
            lat: parseFloat(ubicacionActual.latitud),
            lng: parseFloat(ubicacionActual.longitud)
          };
        } else if (Array.isArray(ubicacionActual)) {
          // Formato array [lng, lat]
          current = {
            lat: parseFloat(ubicacionActual[1]),
            lng: parseFloat(ubicacionActual[0])
          };
        }

        if (current) {
          console.log('📍 Ubicación procesada:', current);
          setCurrentPosition(current);
          
          // Centrar mapa si existe
          if (mapInstance) {
            mapInstance.panTo(current);
          }
        }
      }

      // Cargar audios y videos (nueva lógica)
      const evidencias = data.evidencias || [];
      const audios = evidencias.filter(e => e.tipo === 'audio');
      const videos = evidencias.filter(e => e.tipo === 'video');
      setAudios(audios);
      setVideos(videos);

    } catch (error) {
      console.error('Error cargando tracking:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token, mapInstance]);

  // Efecto inicial para cargar datos
  useEffect(() => {
    loadTrackingData();
    // Actualizar cada 3 segundos si el tracking está activo
    const interval = setInterval(() => {
      if (tracking?.activo) {
        loadTrackingData();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [loadTrackingData, tracking?.activo]);

  // Renderizado condicional según el estado
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 border-4 border-t-lime-400 border-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mauve-600">Cargando seguimiento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-rose-50 text-mauve-800 p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold mb-2">Error al cargar seguimiento</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white p-4 text-center">
        <img src="/images/logo.png" alt="Zinha Logo" className="mx-auto mb-2" style={{ maxWidth: '150px' }} />
        <h1 className="text-2xl font-bold">Plataforma Seguridad KUNNA</h1>
      </header>

      <main className="flex-1 grid grid-cols-3 gap-4 p-4">
        <section className="col-span-1 bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold">Datos de arranque tracking - inicio</h2>
          <p>Ubicación: {path[0]?.lat}, {path[0]?.lng}</p>
          <p>Latitud: {path[0]?.lat}</p>
          <p>Longitud: {path[0]?.lng}</p>
          <p>Hora: {new Date(tracking?.inicio).toLocaleTimeString()}</p>
        </section>

        <section className="col-span-1 bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold">Datos actualizados en tiempo real</h2>
          <p>Ubicación: {currentPosition?.lat}, {currentPosition?.lng}</p>
          <p>Latitud: {currentPosition?.lat}</p>
          <p>Longitud: {currentPosition?.lng}</p>
          <p>Hora: {new Date().toLocaleTimeString()}</p>
        </section>

        <section className="col-span-3">
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '400px' }}
              center={currentPosition || DEFAULT_CENTER}
              zoom={15}
              options={MAP_OPTIONS}
              onLoad={map => setMapInstance(map)}
            >
              {/* Dibujar ruta */}
              {path.length > 0 && (
                <Polyline
                  path={path}
                  options={{ strokeColor: '#FF0000' }}
                />
              )}

              {/* Marcador de inicio si existe */}
              {path[0] && (
                <Marker
                  position={path[0]}
                  label="Inicio"
                />
              )}

              {/* Marcador de posición actual */}
              {currentPosition && (
                <Marker
                  position={currentPosition}
                  label="Actual"
                />
              )}
            </GoogleMap>
          </LoadScript>
        </section>

        <section className="col-span-3">
          <h2 className="text-lg font-semibold">Audios evidencia</h2>
          <ul>
            {audios.map((audio, index) => (
              <li key={index}><a href={audio.url} download>{audio.nombre}</a></li>
            ))}
          </ul>

          <h2 className="text-lg font-semibold">Videos evidencia</h2>
          <ul>
            {videos.map((video, index) => (
              <li key={index}><a href={video.url} target="_blank" rel="noopener noreferrer">{video.nombre}</a></li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="bg-gray-200 p-4 text-center">
        <p className="legal-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      </footer>
    </div>
  );
};

export default Tracking;
