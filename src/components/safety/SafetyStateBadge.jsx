import React from 'react';
import { SAFETY_STATES } from '../../safety/alePolicy';

/**
 * SafetyStateBadge - Badge con 4 estados de seguridad
 * 
 * Estados: NORMAL | ALERTA | RIESGO | CRÍTICO
 * UI sobria, discreta, sin colores chillones, sin emojis
 * 
 * Props:
 * - state: SAFETY_STATES (obligatorio)
 * - size: 'sm' | 'md' | 'lg' (opcional, default 'md')
 * - showLabel: boolean (opcional, default true)
 */
export default function SafetyStateBadge({ 
  state = SAFETY_STATES.NORMAL, 
  size = 'md',
  showLabel = true 
}) {
  // Configuración de estilos por estado (sobrios, discretos)
  const stateConfig = {
    [SAFETY_STATES.NORMAL]: {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300',
      dotColor: 'bg-gray-400',
      label: 'Normal'
    },
    [SAFETY_STATES.ALERTA]: {
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-300',
      dotColor: 'bg-amber-500',
      label: 'Alerta'
    },
    [SAFETY_STATES.RIESGO]: {
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-300',
      dotColor: 'bg-orange-500',
      label: 'Riesgo'
    },
    [SAFETY_STATES.CRÍTICO]: {
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      dotColor: 'bg-red-600',
      label: 'Crítico'
    }
  };

  // Tamaños
  const sizeConfig = {
    sm: {
      container: 'px-2 py-1 text-xs',
      dot: 'w-1.5 h-1.5',
      gap: 'gap-1'
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      dot: 'w-2 h-2',
      gap: 'gap-1.5'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      dot: 'w-2.5 h-2.5',
      gap: 'gap-2'
    }
  };

  const config = stateConfig[state] || stateConfig[SAFETY_STATES.NORMAL];
  const sizeStyle = sizeConfig[size] || sizeConfig.md;

  return (
    <div
      className={`
        inline-flex items-center rounded-full border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeStyle.container} ${sizeStyle.gap}
        font-medium transition-colors duration-200
      `}
      role="status"
      aria-label={`Estado de seguridad: ${config.label}`}
    >
      {/* Dot indicator */}
      <span
        className={`rounded-full ${config.dotColor} ${sizeStyle.dot} animate-pulse`}
        aria-hidden="true"
      />
      
      {/* Label */}
      {showLabel && (
        <span>{config.label}</span>
      )}
    </div>
  );
}

/**
 * SafetyStateBadgeMinimal - Versión ultra discreta (solo dot)
 * Para usar en navbar o lugares donde el espacio es limitado
 */
export function SafetyStateBadgeMinimal({ state = SAFETY_STATES.NORMAL }) {
  return (
    <SafetyStateBadge 
      state={state} 
      size="sm" 
      showLabel={false} 
    />
  );
}

/**
 * SafetyStateCard - Card expandido con estado + descripción
 * Para usar en SecurityModule o pantallas de detalle
 */
export function SafetyStateCard({ 
  state = SAFETY_STATES.NORMAL,
  description,
  timestamp,
  onClick 
}) {
  const stateConfig = {
    [SAFETY_STATES.NORMAL]: {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: '●'
    },
    [SAFETY_STATES.ALERTA]: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: '●'
    },
    [SAFETY_STATES.RIESGO]: {
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: '●'
    },
    [SAFETY_STATES.CRÍTICO]: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: '●'
    }
  };

  const config = stateConfig[state] || stateConfig[SAFETY_STATES.NORMAL];

  return (
    <div
      className={`
        p-4 rounded-lg border
        ${config.bgColor} ${config.borderColor}
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <SafetyStateBadge state={state} size="sm" />
            {timestamp && (
              <span className="text-xs text-gray-500">
                {new Date(timestamp).toLocaleString('es-MX', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
          
          {description && (
            <p className="text-sm text-gray-700 mt-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
