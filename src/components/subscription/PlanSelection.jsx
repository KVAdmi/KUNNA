import React, { useState } from 'react';
import { Check, Sparkles, Shield, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const PlanSelection = ({ onSelectPlan, handleGoToPayment }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Kunna Free',
      price: 0,
      priceLabel: 'Gratis',
      icon: Sparkles,
      iconColor: '#c8a6a6',
      gradient: 'linear-gradient(135deg, rgba(200, 166, 166, 0.2) 0%, rgba(141, 117, 131, 0.15) 100%)',
      glowColor: 'rgba(200, 166, 166, 0.4)',
      benefits: [
        'SOS Lite (alerta básica)',
        'Diario emocional',
        'Acceso limitado a la comunidad',
        'Acompañamiento básico',
        'Perfil y ajustes generales'
      ],
      recommended: false
    },
    {
      id: 'safe',
      name: 'Kunna Safe',
      price: 79,
      priceLabel: '$79',
      icon: Shield,
      iconColor: '#c1d43a',
      gradient: 'linear-gradient(135deg, rgba(193, 212, 58, 0.25) 0%, rgba(141, 117, 131, 0.2) 100%)',
      glowColor: 'rgba(193, 212, 58, 0.5)',
      benefits: [
        'SOS Avanzado',
        'Envío automático a contactos',
        'Acompañamiento inteligente',
        'Evidencia de audio y ubicación',
        'Comunidad completa',
        'Rutinas emocionales + IA'
      ],
      recommended: true
    },
    {
      id: 'total',
      name: 'Kunna Total',
      price: 199,
      priceLabel: '$199',
      icon: Crown,
      iconColor: '#8d7583',
      gradient: 'linear-gradient(135deg, rgba(141, 117, 131, 0.3) 0%, rgba(56, 42, 60, 0.25) 100%)',
      glowColor: 'rgba(141, 117, 131, 0.6)',
      benefits: [
        'Todo lo de Kunna Safe',
        'Asistencias 24/7 (médica, psicológica, legal, vial)',
        'Beneficios reales powered by VitaCard365',
        'Línea telefónica directa 24/7',
        'Servicio completo de emergencia'
      ],
      recommended: false
    }
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan.id);

    // Si es plan Free, solo guardar localmente
    if (plan.id === 'free') {
      toast({
        title: '✅ Plan seleccionado',
        description: 'Disfruta de Kunna Free',
      });
      
      // Llamar callback si existe
      if (onSelectPlan) {
        onSelectPlan(plan.id);
      }
      
      return;
    }

    // Para planes pagados, ir a Mercado Pago
    if (handleGoToPayment) {
      handleGoToPayment(plan.id);
    } else {
      toast({
        title: '🚀 Procesando...',
        description: `Redirigiendo a pago de ${plan.name}`,
      });
      
      // Fallback: navegar a página de pago
      setTimeout(() => {
        navigate('/payment', { state: { plan: plan.id, price: plan.price } });
      }, 1000);
    }
  };

  return (
    <div className="w-full min-h-screen py-12 px-4" style={{ background: 'var(--brand-background)' }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ 
            color: 'var(--brand-primary)',
            fontFamily: 'var(--font-sans)'
          }}
        >
          Elige tu plan KUNNA
        </h1>
        <p 
          className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto"
          style={{ color: 'var(--brand-secondary)' }}
        >
          Protección y bienestar diseñados para ti. Cambia o cancela cuando quieras.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          
          return (
            <div
              key={plan.id}
              className="relative group transition-all duration-300 hover:scale-105"
              style={{
                animation: 'fadeIn 0.6s ease-out',
                animationDelay: `${plans.indexOf(plan) * 0.1}s`,
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              {/* Recommended Badge */}
              {plan.recommended && (
                <div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold z-10"
                  style={{
                    background: plan.gradient,
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    color: 'var(--brand-primary)',
                    boxShadow: `0 4px 12px ${plan.glowColor}`
                  }}
                >
                  ⭐ Recomendado
                </div>
              )}

              {/* Card Container */}
              <div
                className="relative h-full p-8 rounded-3xl overflow-hidden transition-all duration-300"
                style={{
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  background: isSelected 
                    ? plan.gradient 
                    : 'rgba(255, 255, 255, 0.15)',
                  border: isSelected
                    ? `2px solid ${plan.iconColor}`
                    : '1px solid rgba(255, 255, 255, 0.35)',
                  boxShadow: isSelected
                    ? `0 12px 32px ${plan.glowColor}, 0 0 0 4px rgba(255, 255, 255, 0.1)`
                    : '0 8px 24px rgba(0, 0, 0, 0.15)',
                }}
              >
                {/* Glow Effect on Hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${plan.glowColor} 0%, transparent 70%)`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${plan.iconColor}40, ${plan.iconColor}20)`,
                      border: `1px solid ${plan.iconColor}60`,
                      boxShadow: `0 4px 16px ${plan.iconColor}30`
                    }}
                  >
                    <Icon size={32} color={plan.iconColor} strokeWidth={2} />
                  </div>

                  {/* Plan Name */}
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ 
                      color: 'var(--brand-primary)',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    <span
                      className="text-4xl font-bold"
                      style={{ color: plan.iconColor }}
                    >
                      {plan.priceLabel}
                    </span>
                    {plan.price > 0 && (
                      <span
                        className="text-sm ml-2"
                        style={{ color: 'var(--brand-secondary)' }}
                      >
                        / mes
                      </span>
                    )}
                  </div>

                  {/* Benefits List */}
                  <ul className="space-y-3 mb-8">
                    {plan.benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm"
                        style={{ 
                          color: 'var(--brand-primary)',
                          opacity: 0.9
                        }}
                      >
                        <div
                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                          style={{
                            background: `${plan.iconColor}30`,
                            border: `1px solid ${plan.iconColor}60`
                          }}
                        >
                          <Check size={12} color={plan.iconColor} strokeWidth={3} />
                        </div>
                        <span className="flex-1 leading-tight">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className="w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all duration-300 transform hover:scale-105 active:scale-95"
                    style={{
                      background: isSelected
                        ? 'var(--brand-primary)'
                        : plan.iconColor,
                      color: '#ffffff',
                      border: 'none',
                      boxShadow: isSelected
                        ? `0 8px 24px rgba(56, 42, 60, 0.4)`
                        : `0 6px 20px ${plan.glowColor}`,
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    {isSelected ? '✓ Plan seleccionado' : 'Elegir plan'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <p
          className="text-sm opacity-70"
          style={{ color: 'var(--brand-secondary)' }}
        >
          🔒 Pagos seguros con Mercado Pago • Cancela cuando quieras • Sin compromisos
        </p>
      </div>

      {/* Fade In Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PlanSelection;
