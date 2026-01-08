import React from 'react';
import { useStealthMode } from '../../context/StealthModeContext';

/**
 * StealthToggle - Toggle para activar/desactivar Stealth Mode
 * 
 * UI discreta, sobria
 * Indica claramente el estado actual
 * Persiste en localStorage
 */
export default function StealthToggle({ className = '' }) {
  const { isStealthMode, toggleStealthMode } = useStealthMode();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex-1">
        <label 
          htmlFor="stealth-toggle" 
          className="text-sm font-medium text-gray-700 cursor-pointer"
        >
          Modo Discreto
        </label>
        <p className="text-xs text-gray-500 mt-0.5">
          {isStealthMode 
            ? 'La interfaz usa términos neutros' 
            : 'Los términos de seguridad son visibles'}
        </p>
      </div>

      <button
        id="stealth-toggle"
        type="button"
        role="switch"
        aria-checked={isStealthMode}
        onClick={toggleStealthMode}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer 
          rounded-full border-2 border-transparent transition-colors 
          duration-200 ease-in-out focus:outline-none focus:ring-2 
          focus:ring-gray-500 focus:ring-offset-2
          ${isStealthMode ? 'bg-gray-600' : 'bg-gray-200'}
        `}
      >
        <span className="sr-only">Activar modo discreto</span>
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full 
            bg-white shadow ring-0 transition duration-200 ease-in-out
            ${isStealthMode ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

/**
 * StealthToggleCard - Versión expandida con explicación
 * Para usar en Settings o SecurityModule
 */
export function StealthToggleCard() {
  const { isStealthMode } = useStealthMode();

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div 
          className={`
            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
            ${isStealthMode ? 'bg-gray-100' : 'bg-gray-50'}
          `}
        >
          <svg 
            className="w-5 h-5 text-gray-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {isStealthMode ? (
              // Eye-off icon (stealth ON)
              <>
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" 
                />
              </>
            ) : (
              // Eye icon (stealth OFF)
              <>
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                />
              </>
            )}
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Modo Discreto
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {isStealthMode 
              ? 'Activo: los términos sensibles están ocultos y las notificaciones son neutras.' 
              : 'Inactivo: la interfaz muestra todos los términos de seguridad normalmente.'}
          </p>
        </div>
      </div>

      <StealthToggle className="mt-2 pt-3 border-t border-gray-100" />

      {/* Ayuda adicional */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          <strong>¿Qué hace?</strong> Reemplaza términos como "SOS", "Evidencia" y "Ayuda" 
          por palabras neutras. Útil si necesitas privacidad adicional.
        </p>
      </div>
    </div>
  );
}

/**
 * StealthToggleCompact - Versión inline ultra compacta
 * Para usar en navbar o lugares con espacio limitado
 */
export function StealthToggleCompact() {
  const { isStealthMode, toggleStealthMode } = useStealthMode();

  return (
    <button
      onClick={toggleStealthMode}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      title={isStealthMode ? 'Desactivar modo discreto' : 'Activar modo discreto'}
      aria-label={isStealthMode ? 'Desactivar modo discreto' : 'Activar modo discreto'}
    >
      <svg 
        className={`w-5 h-5 ${isStealthMode ? 'text-gray-700' : 'text-gray-400'}`}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        {isStealthMode ? (
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" 
          />
        ) : (
          <>
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
            />
          </>
        )}
      </svg>
    </button>
  );
}
