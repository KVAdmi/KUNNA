import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * QuickExitButton - Botón de salida rápida (1 tap)
 * 
 * Al presionar:
 * 1. Navega inmediatamente a SafeScreen (pantalla neutra)
 * 2. Reemplaza historial para no dejar rastro
 * 3. (Opcional) Limpia datos sensibles de sessionStorage
 * 
 * Accesible desde pantallas críticas
 */
export default function QuickExitButton({ 
  variant = 'default', // 'default' | 'minimal' | 'floating'
  className = '' 
}) {
  const navigate = useNavigate();

  const handleQuickExit = () => {
    // 1. Opcional: limpiar sessionStorage sensible (no tocar localStorage)
    try {
      // Solo limpiamos datos de sesión temporal, no configuración del usuario
      sessionStorage.removeItem('temp_diary_draft');
      sessionStorage.removeItem('temp_check_in');
    } catch (error) {
      console.error('Error limpiando sessionStorage:', error);
    }

    // 2. Navegar a pantalla neutra y reemplazar historial
    navigate('/safe-screen', { replace: true });

    // 3. Log para auditoría (sin datos sensibles)
    console.log('🚪 Quick Exit activado');
  };

  // Variantes de estilo
  const variants = {
    default: 'px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium',
    minimal: 'p-2 hover:bg-gray-100 rounded-full text-gray-600',
    floating: 'fixed bottom-6 right-6 w-12 h-12 bg-gray-800 hover:bg-gray-900 text-white rounded-full shadow-lg z-50 flex items-center justify-center'
  };

  return (
    <button
      onClick={handleQuickExit}
      className={`${variants[variant]} transition-colors ${className}`}
      title="Salida rápida"
      aria-label="Salida rápida a pantalla neutra"
    >
      {variant === 'default' && (
        <span className="flex items-center gap-2">
          <svg 
            className="w-4 h-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          Salir
        </span>
      )}
      
      {(variant === 'minimal' || variant === 'floating') && (
        <svg 
          className="w-5 h-5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
      )}
    </button>
  );
}

/**
 * QuickExitWithKeyboard - Versión con soporte de atajo de teclado
 * Presionar ESC 2 veces rápido = quick exit
 */
export function QuickExitWithKeyboard({ children }) {
  const navigate = useNavigate();
  const [escapeCount, setEscapeCount] = useState(0);

  useEffect(() => {
    let timeout;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEscapeCount(prev => {
          const newCount = prev + 1;
          
          // Si es el segundo ESC en menos de 1 segundo
          if (newCount === 2) {
            navigate('/safe-screen', { replace: true });
            console.log('🚪 Quick Exit activado (ESC x2)');
            return 0;
          }
          
          return newCount;
        });

        // Reset después de 1 segundo
        clearTimeout(timeout);
        timeout = setTimeout(() => setEscapeCount(0), 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return children;
}
