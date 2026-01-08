import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * StealthModeContext - Context global para Stealth Mode
 * 
 * Stealth Mode oculta términos sensibles y hace la UI neutra
 * Persiste en localStorage
 * 
 * Cuando está activo:
 * - "SOS" → "Acción rápida"
 * - "Evidencia" → "Registro"
 * - "Ayuda" → "Apoyo"
 * - Notificaciones neutras
 * - Quick Exit siempre disponible
 */

const StealthModeContext = createContext();

const STORAGE_KEY = 'kunna_stealth_mode';

export function StealthModeProvider({ children }) {
  // Inicializar desde localStorage
  const [isStealthMode, setIsStealthMode] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    } catch (error) {
      console.error('Error leyendo stealth mode desde localStorage:', error);
      return false;
    }
  });

  // Persistir cambios en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, isStealthMode.toString());
      
      // Log para auditoría (sin datos sensibles)
      console.log(`🔒 Stealth Mode ${isStealthMode ? 'ACTIVADO' : 'DESACTIVADO'}`);
    } catch (error) {
      console.error('Error guardando stealth mode en localStorage:', error);
    }
  }, [isStealthMode]);

  const enableStealthMode = () => {
    setIsStealthMode(true);
  };

  const disableStealthMode = () => {
    setIsStealthMode(false);
  };

  const toggleStealthMode = () => {
    setIsStealthMode(prev => !prev);
  };

  const value = {
    isStealthMode,
    enableStealthMode,
    disableStealthMode,
    toggleStealthMode
  };

  return (
    <StealthModeContext.Provider value={value}>
      {children}
    </StealthModeContext.Provider>
  );
}

/**
 * Hook para usar Stealth Mode en componentes
 * 
 * @returns {object} { isStealthMode, enableStealthMode, disableStealthMode, toggleStealthMode }
 */
export function useStealthMode() {
  const context = useContext(StealthModeContext);
  
  if (!context) {
    throw new Error('useStealthMode debe usarse dentro de StealthModeProvider');
  }
  
  return context;
}

/**
 * HOC para envolver componentes que necesitan stealth mode
 * 
 * @param {Component} Component - Componente a envolver
 * @returns {Component} Componente con stealth mode props
 */
export function withStealthMode(Component) {
  return function StealthModeComponent(props) {
    const stealthMode = useStealthMode();
    return <Component {...props} stealthMode={stealthMode} />;
  };
}

export default StealthModeContext;
