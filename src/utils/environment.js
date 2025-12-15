// Utilidades para detectar el entorno y generar URLs de redirección

/**
 * Detecta si la aplicación se está ejecutando como una app nativa
 * @returns {boolean} true si es una app nativa (Capacitor/Cordova)
 */
export const isNativeApp = () => {
  // Detectar Capacitor
  if (window.Capacitor && window.Capacitor.isNative) {
    return true;
  }
  
  // Detectar Cordova
  if (window.cordova) {
    return true;
  }
  
  // Detectar user agents de apps nativas
  const userAgent = navigator.userAgent || '';
  if (userAgent.includes('ZinhaApp') || userAgent.includes('wv')) {
    return true;
  }
  
  return false;
};

/**
 * Detecta si estamos en modo desarrollo
 * @returns {boolean} true si está en desarrollo
 */
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

/**
 * Obtiene la URL base de la aplicación según el entorno
 * @returns {string} URL base
 */
export const getBaseURL = () => {
  if (isDevelopment()) {
    return import.meta.env.VITE_APP_URL_DEV || 'http://localhost:5173';
  }
  return import.meta.env.VITE_APP_URL_PROD || 'https://kunna.help';
};

/**
 * Genera la URL de redirección para reset de contraseña
 * @returns {string} URL completa para redirección
 */
export const getResetPasswordRedirectURL = () => {
  const isNative = isNativeApp();
  const deepLinkScheme = import.meta.env.VITE_DEEP_LINK_SCHEME || 'zinha';
  
  if (isNative) {
    return `${deepLinkScheme}://reset-password`;
  }
  
  const baseURL = getBaseURL();
  return `${baseURL}/reset-password`;
};

/**
 * Genera la URL de redirección para OAuth (Google, etc.)
 * @returns {string} URL completa para redirección OAuth
 */
export const getOAuthRedirectURL = () => {
  const isNative = isNativeApp();
  
  if (isNative) {
    const deepLinkScheme = import.meta.env.VITE_DEEP_LINK_SCHEME || 'zinha';
    return `${deepLinkScheme}://auth/callback`;
  }
  
  return 'https://zinha.app/callback';
};

/**
 * Obtiene información del entorno actual
 * @returns {object} Información del entorno
 */
export const getEnvironmentInfo = () => {
  return {
    isDevelopment: isDevelopment(),
    isNative: isNativeApp(),
    baseURL: getBaseURL(),
    resetPasswordURL: getResetPasswordRedirectURL(),
    oauthURL: getOAuthRedirectURL(),
    userAgent: navigator.userAgent,
    platform: navigator.platform
  };
};

// Log de información del entorno (solo en desarrollo)
if (isDevelopment()) {
  console.log('🔧 Environment Info:', getEnvironmentInfo());
}
