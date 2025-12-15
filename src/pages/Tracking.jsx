import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

let mapsLoaded = false;
async function loadMaps() {
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

function toNumber(v) { 
  const n = Number(v); 
  return Number.isFinite(n) ? n : null; 
}

function pickLatLng(src) {
  const lat = toNumber(src?.lat ?? src?.latitud ?? src?.latitud_actual);
  const lng = toNumber(src?.lng ?? src?.longitud ?? src?.longitud_actual);
  return (lat != null && lng != null) ? { lat, lng } : null;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false }, realtime: { timeout: 60000 } }
);

function getRawTokenFromUrl() {
  const href = window.location.href;
  const m1 = href.match(/\/track_([A-Za-z0-9_-]+)/);     if (m1?.[1]) return m1[1];
  const m2 = href.match(/\/tracking\/([A-Za-z0-9_-]+)/); if (m2?.[1]) return m2[1];
  const q  = new URLSearchParams(window.location.search).get('t');
  return q || '';
}

export default function Tracking() {
  // Estado
  const [tracking, setTracking] = useState({
    id: null,
    user_id: null,
    token: '',
    inicio: null,
    fin: null,
    activo: true,
    ubicacion_actual: null,
    destino: '',
    contacto_emergencia: '',
    url_seguimiento: null,
    created_at: null,
    updated_at: null,
    latitud_actual: null,
    longitud_actual: null,
    precision_metros: null,
    ultima_actualizacion_ubicacion: null,
    ruta_seguimiento: [],
    latitud_final: null,
    longitud_final: null,
    ruta_final: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const polyRef = useRef(null);
  const subscriptionsRef = useRef([]);

  // Helpers

  const prettyError = (msg) => {
    if (!msg) return null;
    if (msg.includes('JSON object requested')) {
      return 'No hay un seguimiento único para este enlace (0 o más de 1). Verifica el token.';
    }
    return msg;
  };

  const formatDate = (isoString) => {
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
  };

  // Render del mapa
  const renderTracking = useCallback(async (row) => {
    if (mapRef.current) return; // Evitar re-renders si ya existe el mapa
    
    try {
      await loadMaps();
      
      const pos = pickLatLng(row);
      if (!pos) {
        console.warn('Coordenadas inválidas en row:', row);
        const mapEl = document.getElementById('map');
        if (mapEl) mapEl.innerHTML = '<div style="color:#b00;padding:12px">Sin coordenadas válidas.</div>';
        return;
      }

      const mapEl = document.getElementById('map');
      mapRef.current = new google.maps.Map(mapEl, {
        center: pos,
        zoom: 15,
        mapId: 'KUNNA_TRACKING',
        disableDefaultUI: true,
        styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
      });

      // Crear marcador
      markerRef.current = new google.maps.Marker({
        map: mapRef.current,
        position: pos,
        title: 'Ubicación actual',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#c8a6a6',
          fillOpacity: 1,
          strokeColor: '#382a3c',
          strokeWeight: 2
        }
      });

      // Crear polyline si hay ruta
      const path = Array.isArray(row?.ruta_seguimiento) ? row.ruta_seguimiento : [];
      const polyPath = path
        .map(pickLatLng)
        .filter(Boolean);

      if (polyPath.length) {
        polyRef.current = new google.maps.Polyline({
          map: mapRef.current,
          path: polyPath,
          geodesic: true,
          strokeColor: '#7B61FF',
          strokeOpacity: 0.95,
          strokeWeight: 4
        });
      }
    } catch (error) {
      console.error('Error al renderizar el mapa:', error);
    }
  }, []);  // Obtener datos
  const fetchTrackingData = async () => {
    try {
      const raw = getRawTokenFromUrl();
      if (!raw) throw new Error('Token inválido en el URL');

      const candidates = raw.startsWith('track_')
        ? [raw, raw.replace(/^track_/, '')]
        : [raw, `track_${raw}`];

      // Logs de diagnóstico (déjalos por ahora)
      console.log('[TRACK] raw:', raw);
      console.log('[TRACK] candidates:', candidates);
      console.log('[TRACK] VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);

      const { data, error } = await supabase
        .from('acompanamientos_activos')
        .select('*')
        .in('token', candidates)
        .order('ultima_actualizacion_ubicacion', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('No hay seguimiento activo para este link');

      setTracking(data);

      setTracking(data);
      await renderTracking(data);

      // Actualizar marcador si hay coordenadas válidas
      const pos = pickLatLng(data);
      if (pos && markerRef.current) {
        markerRef.current.setPosition(pos);
        mapRef.current?.panTo(pos);

        // Actualizar polyline
        const path = Array.isArray(data.ruta_seguimiento) ? data.ruta_seguimiento : [];
        const polyPath = path
          .map(pickLatLng)
          .filter(Boolean);

        if (polyPath.length && polyRef.current) {
          polyRef.current.setPath([...polyPath, pos]);
        }
      }

      startRealtimeSubscription(data.token); // usa el token EXACTO devuelto por la DB

    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function startRealtimeSubscription(dbToken) {
    if (!dbToken) return;

    const ch = supabase
      .channel('tracking_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'acompanamientos_activos', filter: `token=eq.${dbToken}` },
        (payload) => {
          if (!payload?.new) return;
          setTracking(payload.new);

          setTracking(payload.new);
          
          const pos = pickLatLng(payload.new);
          if (pos && mapRef.current && markerRef.current) {
            markerRef.current.setPosition(pos);
            mapRef.current.panTo(pos);
            
            // Actualizar polyline
            const path = Array.isArray(payload.new.ruta_seguimiento) ? payload.new.ruta_seguimiento : [];
            const polyPath = path
              .map(pickLatLng)
              .filter(Boolean);

            if (polyPath.length && polyRef.current) {
              polyRef.current.setPath([...polyPath, pos]);
            }
          }
        }
      )
      .subscribe();

    subscriptionsRef.current?.push(ch);
  };

  // Suscripción realtime
  useEffect(() => {
    initializeMap();
    fetchTrackingData();

    return () => {
      subscriptionsRef.current?.forEach(ch => ch?.unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [initializeMap]);

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5e6ff',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src="/images/logo_kunna.png"
            alt="Logo KUNNA"
            style={{ height: '48px', marginBottom: '16px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
          />
          <div>Cargando seguimiento...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5e6ff',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src="/images/logo_kunna.png"
            alt="Logo KUNNA"
            style={{ height: '48px', marginBottom: '16px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
          />
          <div style={{ color: '#dc2626' }}>Error: {prettyError(error)}</div>
        </div>
      </div>
    );
  }

  // ✅ ÚNICO return + header dentro del wrapper
  return (
    <div className="tracking-page" style={{ minHeight: '100vh', background: '#f5e6ff', padding: '24px' }}>
      <header style={{ maxWidth: '1200px', margin: '0 auto 32px auto', textAlign: 'center' }}>
        <img
          src="/images/logo_kunna.png"
          alt="Logo KUNNA"
          style={{ height: '48px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        />
      </header>

      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '24px',
        }}
      >
        {/* Panel izquierdo */}
        <aside>
          <section
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
              }}
            >
              Seguimiento en Tiempo Real
            </h2>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Estado */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#382a3c', margin: '0 0 8px 0' }}>Estado</h3>
                <div style={{ fontSize: '14px', color: '#4b5563', display: 'grid', gap: '4px' }}>
                  <div>Inicio: {formatDate(tracking.inicio)}</div>
                  <div>Actualización: {formatDate(tracking.ultima_actualizacion_ubicacion)}</div>
                  <div>Destino: {tracking.destino || 'Seguimiento de emergencia'}</div>
                </div>
              </div>

              {/* Contacto */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#382a3c', margin: '0 0 8px 0' }}>
                  Contacto de Emergencia
                </h3>
                <div style={{ fontSize: '14px', color: '#4b5563' }}>Tel: {tracking.contacto_emergencia || '--'}</div>
              </div>

              {/* Coordenadas */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#382a3c', margin: '0 0 8px 0' }}>
                  Coordenadas
                </h3>
                <div style={{ fontSize: '14px', color: '#4b5563', display: 'grid', gap: '4px' }}>
                  <div>Lat. Actual: {tracking.latitud_actual || '--'}</div>
                  <div>Long. Actual: {tracking.longitud_actual || '--'}</div>
                  {tracking.latitud_final && (
                    <>
                      <div>Lat. Final: {tracking.latitud_final}</div>
                      <div>Long. Final: {tracking.longitud_final}</div>
                    </>
                  )}
                  {tracking.precision_metros && <div>Precisión: ±{tracking.precision_metros}m</div>}
                </div>
              </div>
            </div>
          </section>
        </aside>

        {/* Panel derecho */}
        <div style={{ display: 'grid', gap: '24px' }}>
          <section
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>Ubicación en Tiempo Real</h2>
            <div id="map" style={{ height: '400px', borderRadius: '8px', background: '#f0f0f0' }} />
          </section>

          {/* Texto legal */}
          <section
            className="card legal-notice"
            style={{
              padding: '24px',
              marginTop: '32px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '16px',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: '#333',
              boxShadow: '0 8px 32px rgba(56, 42, 60, 0.08)',
            }}
          >
            <p className="legal-text" style={{ margin: '0' }}>
              El servicio de seguimiento en tiempo real de KUNNA implementa tecnología de cifrado de grado militar (AES-256) para garantizar la seguridad y privacidad de nuestros usuarios.
              <br /><br />
              <strong>Cooperación con Autoridades:</strong> En cumplimiento de la legislación vigente, KUNNA colabora con autoridades competentes cuando así se requiera mediante procesos seguros y justificados.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
