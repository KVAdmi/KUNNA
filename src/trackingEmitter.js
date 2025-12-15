
import { supabase } from './lib/supabaseClient.js';

function getToken() {
  const url = new URL(window.location.href);
  const pathToken = url.pathname.split('/').find(p => p.startsWith('track_'));
  return url.searchParams.get('token') || pathToken || '';
}
const token = getToken();

let lastSent = 0;
let lastCoords = null;
let geoWatchId = null;

async function pushPosition(coords) {
  const now = Date.now();
  if (now - lastSent < 3000) return; // throttle 3s
  
  const { latitude, longitude, accuracy, speed, heading } = coords;
  
  // Validar precisión (accuracy en metros)
  if (accuracy > 50) {
    console.warn(`Precisión insuficiente: ${accuracy}m > 50m, esperando mejor señal...`);
    return;
  }

  lastSent = now;
  lastCoords = coords;

  const { error } = await window.supabase.rpc('update_tracking_position', {
    p_token: token,
    p_lat: latitude,
    p_lng: longitude,
    p_accuracy: accuracy ?? null,
    p_speed: speed ?? null,
    p_heading: heading ?? null
  });
  if (error) console.error('RPC error:', error);
}

// Keep-alive por si el SO "duerme" el watcher
setInterval(() => {
  if (lastCoords) pushPosition(lastCoords);
}, 10000);

if ('geolocation' in navigator) {
  geoWatchId = navigator.geolocation.watchPosition(
    (pos) => pushPosition(pos.coords),
    (err) => console.error('Geo error:', err),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
  );
} else {
  console.error('Geolocation no disponible');
}

// Función global para detener el tracking
window.stopTracking = function() {
  if (geoWatchId !== null) {
    navigator.geolocation.clearWatch(geoWatchId);
    geoWatchId = null;
    lastCoords = null;
    lastSent = 0;
    console.log('Tracking detenido');
  }
};
