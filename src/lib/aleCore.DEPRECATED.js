# ❌ ARCHIVO DEPRECADO - NO USAR
# 
# Este archivo hacía llamadas directas a AL-E Core desde el frontend.
# TODAS las llamadas deben pasar por Netlify Functions:
#   - /.netlify/functions/ale-events
#   - /.netlify/functions/ale-decide
#
# Usar en su lugar: src/services/eventsClient.js
#
# Este archivo se mantiene temporalmente para referencia pero NO debe importarse.
# Será eliminado en la siguiente limpieza.

/**
 * @deprecated Usar eventsClient.js en su lugar
 */

console.error(`
❌ ERROR: aleCore.js está deprecado.
NO debe usarse para llamadas a AL-E Core.

Usar en su lugar:
  import { sendEvent, requestDecision } from '@/services/eventsClient'

Todas las llamadas pasan por Netlify Functions (seguras).
`);

export default {
  error: 'aleCore.js deprecado - usar eventsClient.js'
};
