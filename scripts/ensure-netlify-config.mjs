// Script para asegurar que la configuración de Netlify esté presente en dist
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const srcFile = path.join(projectRoot, 'netlify.toml');
const destFile = path.join(projectRoot, 'dist', 'netlify.toml');

console.log('🔍 Verificando configuración de Netlify...');
console.log(`📂 Origen: ${srcFile}`);
console.log(`📂 Destino: ${destFile}`);

// Asegurarse de que el directorio dist existe
if (!fs.existsSync('dist')) {
    console.error('❌ El directorio dist no existe. Asegúrate de ejecutar el build primero.');
    process.exit(1);
}

try {
    // Leer el contenido original
    const content = fs.readFileSync(srcFile, 'utf8');
    
    // Actualizar el timestamp del build
    const now = new Date();
    const timestamp = now.getFullYear().toString().slice(-2) +
                     (now.getMonth() + 1).toString().padStart(2, '0') +
                     now.getDate().toString().padStart(2, '0') +
                     now.getHours().toString().padStart(2, '0') +
                     now.getMinutes().toString().padStart(2, '0');
    
    const updatedContent = content.replace(
        /# BUILD:.*/,
        `# BUILD:${timestamp}`
    );
    
    // Escribir el archivo actualizado en dist
    fs.writeFileSync(destFile, updatedContent);
    console.log(`✅ netlify.toml actualizado y copiado a dist/ (BUILD:${timestamp})`);

    // Verificar que el archivo se copió correctamente
    const finalContent = fs.readFileSync(destFile, 'utf8');
    if (finalContent.includes(timestamp)) {
        console.log('✅ Verificación exitosa: el archivo contiene el nuevo timestamp');
    } else {
        throw new Error('El archivo no contiene el nuevo timestamp');
    }
} catch (error) {
    console.error('❌ Error actualizando netlify.toml:', error);
    process.exit(1);
}
