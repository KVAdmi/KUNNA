#!/usr/bin/env node

// Script para actualizar el tracking.html con el servicio de Google Maps
// Se ejecuta automáticamente en el build para Netlify

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_API_KEY = 'AIzaSyBWwOIBjClToEXMqtAEMohrZEvNCPuKDAw';
const TRACKING_HTML_PATH = path.join(__dirname, '../tracking.html');
const DIST_TRACKING_PATH = path.join(__dirname, '../dist/tracking.html');

console.log('🔧 Actualizando tracking.html para Netlify...');

// Leer el archivo actual
let trackingContent = fs.readFileSync(TRACKING_HTML_PATH, 'utf8');

// Verificar si ya existe la clase PreciseLocationServiceTracking
if (trackingContent.includes('class PreciseLocationServiceTracking')) {
    console.log('✅ tracking.html ya contiene PreciseLocationServiceTracking - No se necesitan cambios');
    
    // Solo copiar el archivo a dist/ si existe la carpeta
    if (fs.existsSync(path.dirname(DIST_TRACKING_PATH))) {
        fs.writeFileSync(DIST_TRACKING_PATH, trackingContent);
        console.log('✅ tracking.html copiado a dist/ para Netlify');
    }
    
    console.log('🚀 Tracking.html listo para producción');
    process.exit(0);
}

// Crear el servicio de precisión para el tracking.html
const preciseLocationServiceForTracking = `
// 🎯 SERVICIO DE GEOLOCALIZACIÓN DE ALTA PRECISIÓN PARA TRACKING
class PreciseLocationServiceTracking {
    constructor() {
        this.apiKey = '${GOOGLE_API_KEY}';
        this.accuracyThreshold = 50;
        this.lastKnownPosition = null;
    }

    async getCurrentPosition(options = {}) {
        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
            retries: 3
        };

        const config = { ...defaultOptions, ...options };
        
        console.log('🎯 [TRACKING] Obteniendo ubicación de alta precisión...');

        // 1. Intentar Google Geolocation API
        try {
            if (this.apiKey) {
                console.log('🌐 [TRACKING] Usando Google Geolocation API...');
                const position = await this.getGoogleGeolocation();
                if (this.isHighAccuracy(position)) {
                    console.log(\`✅ [TRACKING-GOOGLE] Precisión: \${position.accuracy}m\`);
                    this.lastKnownPosition = position;
                    return position;
                }
            }
        } catch (error) {
            console.warn('⚠️ [TRACKING] Google API no disponible:', error.message);
        }

        // 2. Fallback a navegador nativo
        console.log('📱 [TRACKING] Usando geolocalización nativa...');
        for (let attempt = 1; attempt <= config.retries; attempt++) {
            try {
                const position = await this.getNativeGeolocation(config);
                
                if (this.isHighAccuracy(position)) {
                    console.log(\`✅ [TRACKING-NATIVO-\${attempt}] Precisión: \${position.accuracy}m\`);
                    this.lastKnownPosition = position;
                    return position;
                } else {
                    console.warn(\`⚠️ [TRACKING-INTENTO \${attempt}] Precisión insuficiente: \${position.accuracy}m\`);
                    if (attempt < config.retries) {
                        await this.delay(2000);
                    }
                }
            } catch (error) {
                console.error(\`❌ [TRACKING-INTENTO \${attempt}] Error:\`, error.message);
                if (attempt === config.retries) {
                    throw new Error(\`Error crítico de geolocalización después de \${config.retries} intentos\`);
                }
            }
        }

        throw new Error('No se pudo obtener ubicación con precisión suficiente');
    }

    async getGoogleGeolocation() {
        const response = await fetch(\`https://www.googleapis.com/geolocation/v1/geolocate?key=\${this.apiKey}\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                considerIp: false,
                wifiAccessPoints: [],
                radioType: 'gsm'
            })
        });

        if (!response.ok) {
            throw new Error(\`Google Geolocation Error: \${response.status}\`);
        }

        const data = await response.json();
        
        return {
            latitude: data.location.lat,
            longitude: data.location.lng,
            accuracy: data.accuracy || 100,
            timestamp: Date.now(),
            source: 'google-api'
        };
    }

    getNativeGeolocation(options) {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalización no soportada'));
                return;
            }

            const timeoutId = setTimeout(() => {
                reject(new Error('Timeout de geolocalización'));
            }, options.timeout);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeoutId);
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        timestamp: position.timestamp,
                        source: 'native'
                    });
                },
                (error) => {
                    clearTimeout(timeoutId);
                    reject(new Error(\`Error nativo: \${error.message}\`));
                },
                {
                    enableHighAccuracy: options.enableHighAccuracy,
                    timeout: options.timeout,
                    maximumAge: options.maximumAge
                }
            );
        });
    }

    isHighAccuracy(position) {
        return position && position.accuracy && position.accuracy <= this.accuracyThreshold;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Instancia global para tracking
window.preciseLocationServiceTracking = new PreciseLocationServiceTracking();
`;

// Insertar el servicio antes del TrackingViewer
const insertPosition = trackingContent.indexOf('<script>');
if (insertPosition === -1) {
    console.error('❌ No se pudo encontrar la etiqueta <script> en tracking.html');
    process.exit(1);
}

const beforeScript = trackingContent.substring(0, insertPosition);
const afterScript = trackingContent.substring(insertPosition);

const updatedContent = beforeScript + 
    `<script>\n${preciseLocationServiceForTracking}\n` + 
    afterScript.substring(8); // Remover el <script> original

// Escribir el archivo actualizado
fs.writeFileSync(TRACKING_HTML_PATH, updatedContent);

console.log('✅ tracking.html actualizado con servicio de Google Maps');

// Si existe la carpeta dist, también actualizar allí
if (fs.existsSync(path.dirname(DIST_TRACKING_PATH))) {
    fs.writeFileSync(DIST_TRACKING_PATH, updatedContent);
    console.log('✅ tracking.html actualizado en dist/ para Netlify');
}

console.log('🚀 Tracking.html listo para producción con Google Maps integrado');
