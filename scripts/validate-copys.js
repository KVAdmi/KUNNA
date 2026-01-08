#!/usr/bin/env node
/**
 * Script de validación de copys para KUNNA
 * 
 * Verifica que NO existan:
 * 1. Copys prohibidos (diagnósticos, asunciones, consejos médicos/legales)
 * 2. Términos sensibles en stealth mode sin sanitización
 * 3. Tokens expuestos en frontend
 * 
 * Uso:
 * node scripts/validate-copys.js
 * npm run validate-copys
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURACIÓN
// ============================================

const FORBIDDEN_PHRASES = [
  // Diagnósticos
  'depresión',
  'ansiedad clínica',
  'trastorno',
  'diagnóstico',
  
  // Asunciones de violencia
  'estás siendo agredida',
  'tu pareja',
  'abusador',
  'maltrato',
  
  // Consejos médicos/legales
  'deberías denunciar',
  'deberías medicarte',
  'toma medicación',
  'consulta a un abogado',
  
  // Asunciones de intención
  'sabemos que',
  'detectamos que',
  'creemos que',
  'parece que estás'
];

const SENSITIVE_TERMS = [
  'SOS',
  'Evidencia',
  'Ayuda',
  'Pánico',
  'Emergencia'
];

const FORBIDDEN_TOKENS = [
  'service_role',
  'SUPABASE_SERVICE',
  'ALE_SERVICE_TOKEN',
  'VITE_ALE_SERVICE'
];

const SRC_DIRS = ['src', 'netlify/functions'];
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// ============================================
// HELPERS
// ============================================

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .git, dist, build
      if (!['node_modules', '.git', 'dist', 'build', '.netlify'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

function checkForbiddenPhrases(content, filePath) {
  const errors = [];
  const lines = content.split('\n');
  
  FORBIDDEN_PHRASES.forEach(phrase => {
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes(phrase.toLowerCase())) {
        // Ignorar comentarios y documentación
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
          return;
        }
        
        errors.push({
          type: 'FORBIDDEN_PHRASE',
          phrase,
          file: filePath,
          line: index + 1,
          content: line.trim()
        });
      }
    });
  });
  
  return errors;
}

function checkExposedTokens(content, filePath) {
  const errors = [];
  const lines = content.split('\n');
  
  FORBIDDEN_TOKENS.forEach(token => {
    lines.forEach((line, index) => {
      if (line.includes(token)) {
        // Ignorar imports de alePolicy y documentación
        if (filePath.includes('alePolicy.js') || 
            filePath.includes('validate-copys') ||
            line.trim().startsWith('//') || 
            line.trim().startsWith('*')) {
          return;
        }
        
        errors.push({
          type: 'EXPOSED_TOKEN',
          token,
          file: filePath,
          line: index + 1,
          content: line.trim()
        });
      }
    });
  });
  
  return errors;
}

function checkUnsanitizedSensitiveTerms(content, filePath) {
  const errors = [];
  const lines = content.split('\n');
  
  // Solo verificar en componentes que no usen sanitizeForStealth
  const usesSanitization = content.includes('sanitizeForStealth') || 
                           content.includes('renderSafeCopy') ||
                           content.includes('alePolicy');
  
  if (usesSanitization || filePath.includes('alePolicy.js') || filePath.includes('renderSafeCopy')) {
    return errors; // Skip, ya está sanitizado
  }
  
  SENSITIVE_TERMS.forEach(term => {
    lines.forEach((line, index) => {
      // Buscar strings literales con términos sensibles
      const regex = new RegExp(`['"\`].*${term}.*['"\`]`, 'i');
      if (regex.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        errors.push({
          type: 'UNSANITIZED_TERM',
          term,
          file: filePath,
          line: index + 1,
          content: line.trim(),
          suggestion: 'Usar renderSafeCopy() o sanitizeForStealth()'
        });
      }
    });
  });
  
  return errors;
}

// ============================================
// MAIN
// ============================================

function main() {
  console.log('🔍 Iniciando validación de copys...\n');
  
  const rootDir = path.resolve(__dirname, '..');
  let allErrors = [];
  let filesChecked = 0;
  
  SRC_DIRS.forEach(srcDir => {
    const dirPath = path.join(rootDir, srcDir);
    const files = getAllFiles(dirPath);
    
    files.forEach(filePath => {
      filesChecked++;
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(rootDir, filePath);
      
      // Check 1: Forbidden phrases
      const forbiddenErrors = checkForbiddenPhrases(content, relativePath);
      allErrors = allErrors.concat(forbiddenErrors);
      
      // Check 2: Exposed tokens
      const tokenErrors = checkExposedTokens(content, relativePath);
      allErrors = allErrors.concat(tokenErrors);
      
      // Check 3: Unsanitized sensitive terms
      const sanitizationErrors = checkUnsanitizedSensitiveTerms(content, relativePath);
      allErrors = allErrors.concat(sanitizationErrors);
    });
  });
  
  // ============================================
  // RESULTADOS
  // ============================================
  
  console.log(`📊 Archivos revisados: ${filesChecked}\n`);
  
  if (allErrors.length === 0) {
    console.log('✅ VALIDACIÓN EXITOSA');
    console.log('   No se encontraron copys prohibidos ni tokens expuestos.\n');
    process.exit(0);
  } else {
    console.log(`❌ ERRORES ENCONTRADOS: ${allErrors.length}\n`);
    
    // Agrupar por tipo
    const byType = {
      FORBIDDEN_PHRASE: [],
      EXPOSED_TOKEN: [],
      UNSANITIZED_TERM: []
    };
    
    allErrors.forEach(error => {
      byType[error.type].push(error);
    });
    
    // Mostrar errores
    if (byType.FORBIDDEN_PHRASE.length > 0) {
      console.log('🚫 COPYS PROHIBIDOS (Bloqueador Legal/Ético):');
      byType.FORBIDDEN_PHRASE.forEach(error => {
        console.log(`   ${error.file}:${error.line}`);
        console.log(`   Frase: "${error.phrase}"`);
        console.log(`   Línea: ${error.content}`);
        console.log('');
      });
    }
    
    if (byType.EXPOSED_TOKEN.length > 0) {
      console.log('🔐 TOKENS EXPUESTOS (Bloqueador de Seguridad):');
      byType.EXPOSED_TOKEN.forEach(error => {
        console.log(`   ${error.file}:${error.line}`);
        console.log(`   Token: "${error.token}"`);
        console.log(`   Línea: ${error.content}`);
        console.log('');
      });
    }
    
    if (byType.UNSANITIZED_TERM.length > 0) {
      console.log('⚠️  TÉRMINOS SENSIBLES SIN SANITIZAR:');
      byType.UNSANITIZED_TERM.forEach(error => {
        console.log(`   ${error.file}:${error.line}`);
        console.log(`   Término: "${error.term}"`);
        console.log(`   Línea: ${error.content}`);
        console.log(`   Sugerencia: ${error.suggestion}`);
        console.log('');
      });
    }
    
    console.log('❌ VALIDACIÓN FALLIDA\n');
    process.exit(1);
  }
}

main();
