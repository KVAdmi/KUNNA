/**
 * 🎯 CONFIGURACIÓN CENTRALIZADA DE TRACKING
 * 
 * ⚠️ NUNCA modificar manualmente las URLs de tracking en otros archivos.
 * ⚠️ SIEMPRE usar esta constante.
 */

/**
 * URL base para el sistema de tracking público
 * @constant {string}
 */
export const TRACKING_BASE_URL = 
  import.meta.env.VITE_TRACKING_BASE_URL || "https://tracking.kunna.help";

/**
 * Genera una URL pública de tracking a partir de un token
 * @param {string} token - Token de seguimiento
 * @returns {string} URL pública completa
 * 
 * @example
 * getTrackingUrl("track_abc123") // => "https://tracking.kunna.help/track_abc123"
 */
export function getTrackingUrl(token) {
  // Asegurar que el token no tenga slashes extras
  const cleanToken = token.replace(/^\/+/, '');
  return `${TRACKING_BASE_URL}/${cleanToken}`;
}

/**
 * Genera una URL de tracking con el formato correcto (añade track_ si no lo tiene)
 * @param {string} token - Token con o sin prefijo track_
 * @returns {string} URL pública completa
 * 
 * @example
 * getTrackingUrlNormalized("abc123") // => "https://tracking.kunna.help/track_abc123"
 * getTrackingUrlNormalized("track_abc123") // => "https://tracking.kunna.help/track_abc123"
 */
export function getTrackingUrlNormalized(token) {
  const cleanToken = token.replace(/^\/+/, '');
  const normalizedToken = cleanToken.startsWith('track_') ? cleanToken : `track_${cleanToken}`;
  return `${TRACKING_BASE_URL}/${normalizedToken}`;
}
