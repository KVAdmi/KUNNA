// trackingEmitter.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

function getToken() {
  const url = new URL(window.location.href);
  const pathToken = url.pathname.split('/').find(p => p.startsWith('track_'));
  return url.searchParams.get('token') || pathToken || '';
}
const token = getToken();

if (!token) {
  console.error('😬 No se encontró token en la URL');
}

let lastSent = 0;
let lastCoords = null;

async function pushPosition(coords) {
  const now = Date.now();
  if (now - lastSent < 3000) return; // throttle 3s
  lastSent = now;
  lastCoords = coords;

  const { latitude, longitude, accuracy, speed, heading } = coords;

  const { error } = await supabase.rpc('update_tracking_position', {
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
  navigator.geolocation.watchPosition(
    (pos) => pushPosition(pos.coords),
    (err) => console.error('Geo error:', err),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
  );
} else {
  console.error('Geolocation no disponible');
}
