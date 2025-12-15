// Este script se ejecuta después del build para limpiar service workers antiguos
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurarse de que el archivo sw.js existe y tiene el contenido correcto
const swPath = path.join(__dirname, '..', 'public', 'sw.js');
const swContent = `
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
`;

fs.writeFileSync(swPath, swContent, 'utf8');
console.log('✅ Service worker de limpieza generado');
