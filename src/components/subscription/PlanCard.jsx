import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { PLAN_DETAILS, KUNNA_PLANS } from '@/constants/plans';

/**
 * Componente compacto de tarjeta de plan
 * Para usar dentro de ProfilePage o modales
 */
const PlanCard = ({ plan, isActive = false, onSelect, compact = false }) => {
  const isFreePlan = plan.id === KUNNA_PLANS.FREE;

  return (
    <div
      className={`relative ${compact ? 'p-4' : 'p-6'} rounded-2xl transition-all duration-300 ${
        isActive ? 'scale-105' : 'hover:scale-102'
      }`}
      style={{
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        background: isActive
          ? 'rgba(193, 212, 58, 0.2)'
          : 'rgba(255, 255, 255, 0.15)',
        border: isActive
          ? '2px solid var(--brand-highlight)'
          : '1px solid rgba(255, 255, 255, 0.35)',
        boxShadow: isActive
          ? '0 12px 32px rgba(193, 212, 58, 0.3)'
          : '0 8px 24px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Badge */}
      {plan.popular && (
        <div
          className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            background: 'var(--brand-highlight)',
            color: 'var(--brand-primary)',
            boxShadow: '0 4px 12px rgba(193, 212, 58, 0.4)'
          }}
        >
          ⭐ Popular
        </div>
      )}

      {/* Header */}
      <div className={`${compact ? 'mb-3' : 'mb-4'}`}>
        <h3
          className={`${compact ? 'text-lg' : 'text-xl'} font-bold mb-1`}
          style={{ color: 'var(--brand-primary)' }}
        >
          {plan.name}
        </h3>
        <p
          className={`${compact ? 'text-xs' : 'text-sm'} opacity-70`}
          style={{ color: 'var(--brand-secondary)' }}
        >
          {plan.description}
        </p>
      </div>

      {/* Price */}
      <div className={`${compact ? 'mb-3' : 'mb-4'}`}>
        <span
          className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold`}
          style={{ color: 'var(--brand-highlight)' }}
        >
          {plan.priceLabel}
        </span>
        {!isFreePlan && (
          <span
            className="text-sm ml-1"
            style={{ color: 'var(--brand-secondary)' }}
          >
            / mes
          </span>
        )}
      </div>

      {/* Features (compact version) */}
      {!compact && (
        <ul className="space-y-2 mb-4">
          {plan.features.slice(0, 5).map((feature, idx) => (
            feature.included && (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <Check size={14} color="var(--brand-highlight)" strokeWidth={3} />
                <span style={{ color: 'var(--brand-primary)', opacity: 0.9 }}>
                  {feature.name}
                </span>
              </li>
            )
          ))}
        </ul>
      )}

      {/* CTA Button */}
      <button
        onClick={() => onSelect(plan)}
        className={`w-full ${compact ? 'py-2' : 'py-3'} px-4 rounded-xl font-semibold ${
          compact ? 'text-sm' : 'text-base'
        } transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95`}
        style={{
          background: isActive ? 'var(--brand-primary)' : 'var(--brand-highlight)',
          color: '#ffffff',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
        }}
      >
        {isActive ? '✓ Plan actual' : isFreePlan ? 'Continuar gratis' : 'Mejorar plan'}
        {!isActive && <ArrowRight size={16} />}
      </button>
    </div>
  );
};

/**
 * Componente mini para mostrar plan actual en header/perfil
 */
export const CurrentPlanBadge = ({ planId }) => {
  const plan = PLAN_DETAILS.find(p => p.id === planId);
  if (!plan) return null;

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
      style={{
        backdropFilter: 'blur(12px)',
        background: 'rgba(193, 212, 58, 0.2)',
        border: '1px solid rgba(193, 212, 58, 0.4)',
        color: 'var(--brand-primary)'
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{ background: 'var(--brand-highlight)' }}
      />
      {plan.name}
    </div>
  );
};

/**
 * Comparación de planes (tabla)
 */
export const PlanComparison = ({ onSelectPlan, currentPlan }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-4" style={{ color: 'var(--brand-primary)' }}>
              Característica
            </th>
            {PLAN_DETAILS.map(plan => (
              <th
                key={plan.id}
                className="text-center p-4 font-bold"
                style={{ color: 'var(--brand-primary)' }}
              >
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PLAN_DETAILS[0].features.map((_, idx) => (
            <tr key={idx} className="border-t border-white/20">
              <td className="p-4" style={{ color: 'var(--brand-secondary)' }}>
                {PLAN_DETAILS[0].features[idx]?.name}
              </td>
              {PLAN_DETAILS.map(plan => (
                <td key={plan.id} className="text-center p-4">
                  {plan.features[idx]?.included ? (
                    <Check size={18} color="var(--brand-highlight)" strokeWidth={3} />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlanCard;
