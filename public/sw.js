
// Service Worker de limpieza
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Limpiar todas las caches
      caches.keys().then(keys => 
        Promise.all(keys.map(key => caches.delete(key)))
      ),
      // Desregistrar este service worker
      self.registration.unregister()
    ])
  );
});
