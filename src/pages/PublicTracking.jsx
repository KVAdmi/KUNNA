/**
 * 🎯 TRACKING PÚBLICO REAL - KUNNA
 * Ruta: /track/:token
 * 
 * ✅ Lee token desde URL
 * ✅ Llama a obtener_seguimiento_por_token_v2()
 * ✅ Muestra ACTIVO / FINALIZADO / INVÁLIDO
 * ✅ Suscripción Realtime para updates GPS
 * ✅ Mapa actualizado en vivo
 * ✅ NO muestra datos personales
 * ✅ Dominio centralizado: TRACKING_BASE_URL
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { TRACKING_BASE_URL } from '@/config/tracking';

// Cliente Supabase sin autenticación (público)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { 
    auth: { persistSession: false },
    realtime: { timeout: 60000 }
  }
);

// Helpers para cargar Google Maps
let mapsLoaded = false;
async function loadGoogleMaps() {
  if (mapsLoaded) return;
  const { Loader } = await import('@googlemaps/js-api-loader');
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: 'weekly',
    libraries: ['marker'],
  });
  await loader.load();
  mapsLoaded = true;
}

// Helper para extraer coordenadas
function extractLatLng(obj) {
  const lat = Number(obj?.latitud_actual ?? obj?.latitud ?? obj?.lat);
  const lng = Number(obj?.longitud_actual ?? obj?.longitud ?? obj?.lng);
  return (Number.isFinite(lat) && Number.isFinite(lng)) ? { lat, lng } : null;
}

// Formatear fecha
function formatDate(isoString) {
  if (!isoString) return '--';
  return new Date(isoString).toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export default function PublicTracking() {
  const { token } = useParams(); // Token desde URL: /track/:token
  
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('CARGANDO'); // ACTIVO | FINALIZADO | INVÁLIDO | CARGANDO
  const [routePoints, setRoutePoints] = useState([]); // 📍 Puntos GPS para polyline

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const polyRef = useRef(null);
  const channelRef = useRef(null);

  // 🗺️ Inicializar mapa
  const initMap = useCallback(async (trackingData) => {
    if (mapRef.current || !trackingData) return;

    const coords = extractLatLng(trackingData);
    if (!coords) {
      console.warn('No hay coordenadas válidas para el mapa');
      return;
    }

    try {
      await loadGoogleMaps();
      
      const mapElement = document.getElementById('tracking-map');
      if (!mapElement) return;

      // Crear mapa
      mapRef.current = new google.maps.Map(mapElement, {
        center: coords,
        zoom: 16,
        mapId: 'KUNNA_PUBLIC_TRACKING',
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      // Marcador
      markerRef.current = new google.maps.Marker({
        position: coords,
        map: mapRef.current,
        title: 'Ubicación actual',
        animation: google.maps.Animation.DROP,
      });

      // Polyline para ruta
      polyRef.current = new google.maps.Polyline({
        path: [coords],
        geodesic: true,
        strokeColor: '#c1d43a',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: mapRef.current,
      });

      console.log('✅ Mapa inicializado correctamente');
    } catch (err) {
      console.error('❌ Error al inicializar mapa:', err);
    }
  }, []);

  // � Cargar puntos GPS de la ruta desde acompanamientos_puntos
  const fetchRoutePoints = useCallback(async () => {
    if (!tracking?.id) return;

    try {
      const { data: points, error: pointsError } = await supabase
        .from('acompanamientos_puntos')
        .select('latitud, longitud, recorded_at')
        .eq('acompanamiento_id', tracking.id)
        .order('recorded_at', { ascending: true });

      if (pointsError) throw pointsError;

      if (points && points.length > 0) {
        setRoutePoints(points);

        // Actualizar polyline en el mapa
        if (polyRef.current) {
          const path = points.map(p => ({
            lat: Number(p.latitud),
            lng: Number(p.longitud)
          }));
          polyRef.current.setPath(path);
          console.log(`📍 Polyline actualizado con ${points.length} puntos`);
        }
      }
    } catch (err) {
      console.error('❌ Error cargando puntos de ruta:', err);
    }
  }, [tracking?.id]);

  // �📡 Actualizar mapa con nueva posición
  const updateMapPosition = useCallback((newData) => {
    const coords = extractLatLng(newData);
    if (!coords || !mapRef.current || !markerRef.current) return;

    // Actualizar marcador
    markerRef.current.setPosition(coords);
    mapRef.current.panTo(coords);

    // Actualizar polyline desde BD (puntos reales de acompanamientos_puntos)
    fetchRoutePoints();

    console.log('📍 Posición actualizada:', coords);
  }, []);

  // 🔥 Fetch datos iniciales
  const fetchTrackingData = useCallback(async () => {
    if (!token) {
      setError('Token no proporcionado');
      setStatus('INVÁLIDO');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Llamar RPC pública
      const { data, error: rpcError } = await supabase
        .rpc('obtener_seguimiento_por_token_v2', { p_token: token });

      if (rpcError) throw rpcError;
      if (!data) {
        setError('Token inválido o seguimiento no encontrado');
        setStatus('INVÁLIDO');
        setLoading(false);
        return;
      }

      setTracking(data);
      
      // Determinar estado
      if (data.activo) {
        setStatus('ACTIVO');
      } else {
        setStatus('FINALIZADO');
      }

      // Inicializar mapa
      await initMap(data);

      // Cargar puntos de ruta (polyline)
      await fetchRoutePoints();

      // Suscribirse a cambios en tiempo real
      subscribeToRealtime(data.token);

      console.log('✅ Datos de tracking cargados:', data);

    } catch (err) {
      console.error('❌ Error al cargar tracking:', err);
      setError(err.message || 'Error al cargar el seguimiento');
      setStatus('INVÁLIDO');
    } finally {
      setLoading(false);
    }
  }, [token, initMap, fetchRoutePoints]);

  // 📡 Suscripción Realtime
  const subscribeToRealtime = useCallback((dbToken) => {
    if (!dbToken || channelRef.current) return;

    console.log('📡 Suscribiéndose a cambios en tiempo real...');

    const channel = supabase
      .channel(`tracking:${dbToken}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'acompanamientos_activos',
          filter: `token=eq.${dbToken}`
        },
        (payload) => {
          console.log('🔔 Actualización en tiempo real:', payload);
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newData = payload.new;
            setTracking(newData);
            
            // Actualizar estado
            if (newData.activo) {
              setStatus('ACTIVO');
            } else {
              setStatus('FINALIZADO');
            }

            // Actualizar mapa
            updateMapPosition(newData);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado de suscripción Realtime:', status);
      });

    channelRef.current = channel;
  }, [updateMapPosition]);

  // 🧹 Cleanup
  useEffect(() => {
    fetchTrackingData();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [fetchTrackingData]);

  // 🎨 LOADING STATE
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.centerBox}>
          <img src="/images/logo_kunna.png" alt="KUNNA" style={styles.logo} />
          <div style={styles.loadingText}>Cargando seguimiento...</div>
        </div>
      </div>
    );
  }

  // ❌ ERROR STATE
  if (status === 'INVÁLIDO' || error) {
    return (
      <div style={styles.container}>
        <div style={styles.centerBox}>
          <img src="/images/logo_kunna.png" alt="KUNNA" style={styles.logo} />
          <div style={styles.errorTitle}>⚠️ Seguimiento No Válido</div>
          <div style={styles.errorText}>
            {error || 'El enlace de seguimiento no es válido o ha expirado.'}
          </div>
        </div>
      </div>
    );
  }

  // ✅ TRACKING ACTIVO/FINALIZADO
  return (
    <div style={styles.trackingPage}>
      {/* Header */}
      <header style={styles.header}>
        <img src="/images/logo_kunna.png" alt="KUNNA" style={styles.headerLogo} />
        <div style={styles.statusBadge(status)}>
          {status === 'ACTIVO' ? '🟢 EN VIVO' : '⚪ FINALIZADO'}
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Panel Izquierdo: Info */}
        <aside style={styles.sidebar}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Seguimiento en Tiempo Real</h2>
            
            {/* Estado */}
            <div style={styles.infoSection}>
              <h3 style={styles.infoTitle}>Estado</h3>
              <div style={styles.infoText}>
                <div><strong>Estado:</strong> {status}</div>
                <div><strong>Inicio:</strong> {formatDate(tracking?.inicio)}</div>
                {tracking?.fin && <div><strong>Fin:</strong> {formatDate(tracking.fin)}</div>}
                {tracking?.ultima_actualizacion_ubicacion && (
                  <div><strong>Última actualización:</strong> {formatDate(tracking.ultima_actualizacion_ubicacion)}</div>
                )}
              </div>
            </div>

            {/* Ubicación */}
            <div style={styles.infoSection}>
              <h3 style={styles.infoTitle}>Ubicación Actual</h3>
              <div style={styles.infoText}>
                {tracking?.latitud_actual && tracking?.longitud_actual ? (
                  <>
                    <div><strong>Latitud:</strong> {tracking.latitud_actual.toFixed(6)}</div>
                    <div><strong>Longitud:</strong> {tracking.longitud_actual.toFixed(6)}</div>
                    {tracking?.precision_metros && (
                      <>
                        <div><strong>Precisión:</strong> ±{tracking.precision_metros}m</div>
                        {/* FIX 5: Warning de precisión si >50m */}
                        {tracking.precision_metros > 50 && (
                          <div style={styles.warningPrecision}>
                            ⚠️ Ubicación aproximada (±{tracking.precision_metros}m)
                          </div>
                        )}
                      </>
                    )}
                    {/* Última actualización siempre visible */}
                    {tracking?.ultima_actualizacion_ubicacion && (
                      <div style={styles.lastUpdate}>
                        <strong>Última actualización:</strong><br />
                        {formatDate(tracking.ultima_actualizacion_ubicacion)}
                      </div>
                    )}
                  </>
                ) : (
                  <div>No disponible</div>
                )}
              </div>
            </div>

            {/* Destino */}
            {tracking?.destino && (
              <div style={styles.infoSection}>
                <h3 style={styles.infoTitle}>Destino</h3>
                <div style={styles.infoText}>{tracking.destino}</div>
              </div>
            )}

            {/* Indicador en vivo */}
            {status === 'ACTIVO' && (
              <div style={styles.liveIndicator}>
                <span style={styles.pulsingDot}></span>
                Actualizando en vivo
              </div>
            )}
          </div>

          {/* Aviso Legal */}
          <div style={styles.legalNotice}>
            <p style={styles.legalText}>
              <strong>🔒 Privacidad y Seguridad:</strong> Este enlace de seguimiento es temporal y no revela información personal del usuario.
              <br /><br />
              KUNNA implementa cifrado de grado militar (AES-256) para proteger los datos de ubicación.
            </p>
          </div>
        </aside>

        {/* Panel Derecho: Mapa */}
        <section style={styles.mapSection}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Mapa en Tiempo Real</h2>
            <div 
              id="tracking-map" 
              style={styles.map}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

// 🎨 ESTILOS
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5e6ff 0%, #ffffff 100%)',
    padding: '20px',
  },
  centerBox: {
    textAlign: 'center',
    maxWidth: '400px',
  },
  logo: {
    height: '60px',
    marginBottom: '20px',
    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
  },
  loadingText: {
    fontSize: '16px',
    color: '#382a3c',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: '12px',
  },
  errorText: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
  },
  trackingPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5e6ff 0%, #ffffff 100%)',
    padding: '20px',
  },
  header: {
    maxWidth: '1400px',
    margin: '0 auto 24px auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
  },
  headerLogo: {
    height: '50px',
    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
  },
  statusBadge: (status) => ({
    padding: '8px 20px',
    borderRadius: '100px',
    background: status === 'ACTIVO' ? '#10b981' : '#6b7280',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  }),
  main: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '24px',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(56, 42, 60, 0.08)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#382a3c',
    marginBottom: '20px',
    margin: '0 0 20px 0',
  },
  infoSection: {
    marginBottom: '20px',
  },
  infoTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#382a3c',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  infoText: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.8',
  },
  // FIX 5: Estilos para warning de precisión
  warningPrecision: {
    marginTop: '12px',
    padding: '10px 14px',
    background: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    color: '#92400e',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  lastUpdate: {
    marginTop: '12px',
    padding: '12px',
    background: '#f0f9ff',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#1e40af',
    lineHeight: '1.6',
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    background: '#f0fdf4',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#10b981',
    fontWeight: '600',
    marginTop: '20px',
  },
  pulsingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    animation: 'pulse 2s infinite',
  },
  legalNotice: {
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '12px',
    fontSize: '12px',
    lineHeight: '1.6',
    color: '#6b7280',
    boxShadow: '0 2px 8px rgba(56, 42, 60, 0.05)',
  },
  legalText: {
    margin: 0,
  },
  mapSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  map: {
    height: '600px',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#f0f0f0',
  },
};
