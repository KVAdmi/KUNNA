#!/usr/bin/env node

// Script para actualizar el tracking.html con el servicio de Google Maps
// Se ejecuta automáticamente en el build para Netlify

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TRACKING_HTML_PATH = path.join(__dirname, '../tracking.html');
const DIST_TRACKING_PATH = path.join(__dirname, '../dist/tracking.html');

console.log('🔧 Actualizando tracking.html para Netlify...');

// Leer el archivo actual
let trackingContent = fs.readFileSync(TRACKING_HTML_PATH, 'utf8');

console.log(`📁 Leyendo desde: ${TRACKING_HTML_PATH}`);
console.log(`📝 Tamaño del archivo: ${trackingContent.length} caracteres`);

// Verificar si ya existe la clase PreciseLocationServiceTracking
const classMatches = trackingContent.match(/class PreciseLocationServiceTracking/g);
console.log(`🔍 Declaraciones encontradas: ${classMatches ? classMatches.length : 0}`);

if (classMatches && classMatches.length === 1) {
    console.log('✅ tracking.html tiene exactamente UNA declaración de PreciseLocationServiceTracking');
    
    // Crear directorio dist si no existe
    const distDir = path.dirname(DIST_TRACKING_PATH);
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
        console.log(`📁 Creado directorio: ${distDir}`);
    }
    
    // Copiar el archivo a dist/
    fs.writeFileSync(DIST_TRACKING_PATH, trackingContent);
    console.log(`✅ tracking.html copiado a: ${DIST_TRACKING_PATH}`);
    
    // Verificar el archivo copiado
    const distContent = fs.readFileSync(DIST_TRACKING_PATH, 'utf8');
    const distMatches = distContent.match(/class PreciseLocationServiceTracking/g);
    console.log(`🔍 Verificación dist - Declaraciones: ${distMatches ? distMatches.length : 0}`);
    
    console.log('🚀 Tracking.html listo para producción');
} else if (classMatches && classMatches.length > 1) {
    console.error(`❌ ERROR: Se encontraron ${classMatches.length} declaraciones duplicadas de PreciseLocationServiceTracking`);
    console.error('El archivo fuente necesita ser limpiado antes del build');
    process.exit(1);
} else {
    console.error('❌ ERROR: No se encontró la clase PreciseLocationServiceTracking en el archivo fuente');
    process.exit(1);
}
