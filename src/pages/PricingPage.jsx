import React, { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, Star, Heart, Shield, Loader2, Gift } from 'lucide-react';
import supabase from '@/lib/customSupabaseClient.js';
import { Toaster } from '@/components/ui/toaster';
import MercadoPagoPaymentModal from '@/components/payment/MercadoPagoPaymentModal.jsx';
import { KUNNA_PLANS } from '@/lib/mercadoPago.js';

const PricingPage = () => {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [loading, setLoading] = useState(false);
  const [donationCode, setDonationCode] = useState('');
  const [showDonationCode, setShowDonationCode] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);

  // Planes de KUNNA con precios en pesos mexicanos
  const plans = {
    mensual: {
      name: 'Mensual',
      price: 199,
      period: 'mes',
      features: [
        'Acceso completo a KUNNA',
        'Módulo de seguridad y SOS',
        'Comunidad y chat rooms',
        'Diario emocional personal',
        'Biblioteca de recursos',
        'Directorio de terapeutas',
        'Agenda personal'
      ],
      popular: false
    },
    trimestral: {
      name: 'Trimestral',
      price: 497,
      period: '3 meses',
      savings: '17% descuento',
      features: [
        'Todo lo del plan mensual',
        'Ahorro de $100 MXN',
        'Acceso por 3 meses',
        'Sin compromisos largos',
      ],
      popular: true
    },
    semestral: {
      name: 'Semestral', 
      price: 897,
      period: '6 meses',
      savings: '25% descuento',
      features: [
        'Todo lo del plan mensual',
        'Ahorro de $297 MXN',
        'Acceso por 6 meses',
        'Mejor relación precio-valor',
      ],
      popular: false
    },
    anual: {
      name: 'Anual',
      price: 1497,
      period: '12 meses',
      savings: '37% descuento',
      features: [
        'Todo lo del plan mensual',
        'Ahorro de $891 MXN',
        'Acceso por 12 meses',
        'Máximo ahorro posible',
      ],
      popular: false
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setSelectedPlanForPayment(plan);
    setShowPaymentModal(true);
  };
  
  const handleDonationCode = async () => {
    if (!donationCode.trim()) {
      toast({
        variant: 'destructive',
        title: 'Campo requerido',
        description: 'Por favor, ingresa tu código de donativo.',
      });
      return;
    }

    setLoading(true);

    try {
      // Verificar código en Supabase
      const { data, error } = await supabase
        .from('codigos_donativo')
        .select('*')
        .eq('codigo', donationCode.trim().toUpperCase())
        .eq('activo', true)
        .single();

      if (error || !data) {
        toast({
          variant: 'destructive',
          title: 'Código inválido',
          description: 'El código de donativo no es válido o ya ha sido usado.',
        });
        setLoading(false);
        return;
      }

      // Marcar código como usado
      await supabase
        .from('codigos_donativo')
        .update({ 
          activo: false, 
          usado_por: user.id,
          fecha_uso: new Date().toISOString()
        })
        .eq('codigo', donationCode.trim().toUpperCase());

      // Actualizar perfil del usuario con nuevo schema de base de datos
      await supabase
        .from('profiles')
        .update({ 
          plan_activo: 'premium',
          plan_tipo: 'donativo',
          fecha_suscripcion: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      toast({
        title: '¡Código aplicado!',
        description: 'Tu membresía premium ha sido activada. Completa tu perfil para acceder a todos los beneficios.',
      });

      // Redirigir a completar perfil
      navigate('/completar-perfil');

    } catch (error) {
      console.error('Error verificando código:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Hubo un problema al verificar el código. Inténtalo de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePaymentSuccess = async (paymentData) => {
    try {
      const { payment_id, status, payment_type } = paymentData;
      
      if (status === 'approved') {
        // Actualizar suscripción del usuario usando la función de la base de datos
        const { data, error } = await supabase.rpc('update_user_subscription', {
          user_id: user.id,
          plan_tipo: selectedPlanForPayment,
          payment_id: payment_id
        });
        
        if (error) throw error;
        
        toast({
          title: '¡Pago exitoso!',
          description: 'Tu suscripción ha sido activada correctamente.',
        });
        
        // Redirigir a completar perfil o dashboard
        navigate('/completar-perfil');
      } else {
        throw new Error('El pago no fue aprobado');
      }
    } catch (error) {
      console.error('Error procesando pago:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Hubo un problema al procesar tu pago. Contacta al soporte.',
      });
    } finally {
      setShowPaymentModal(false);
      setSelectedPlanForPayment(null);
    }
  };

  const handleKunnaSupport = () => {
    toast({
      title: '� Soporte KUNNA',
      description: 'Estamos aquí para ti. Contáctanos en soporte@kunna.mx o a través del chat en la app.',
    });
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-brand-primary p-4">
      <BackButton fallbackRoute="/home" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto text-center"
      >
        <img src="/images/logo_kunna.png" alt="KUNNA Logo" className="h-20 mx-auto mb-4" />
        <h1 className="text-4xl font-serif text-white mb-2">Elige tu Plan KUNNA</h1>
        <p className="text-lg text-brand-secondary mb-10">Bienestar + seguridad + acompañamiento para mujeres</p>

        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(plans).map(([key, plan]) => (
            <motion.div
              key={key}
              onClick={() => handleSelectPlan(key)}
              whileHover={{ y: -5 }}
              className={`glass-effect rounded-3xl p-8 cursor-pointer transition-all duration-300 flex flex-col relative overflow-hidden ${
                selectedPlan === key ? 'border-2 border-brand-accent scale-105' : 'border-2 border-transparent'
              }`}
            >
              {key === 'trimestral' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-accent text-white px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-1 z-10">
                  <Star className="w-4 h-4" />
                  <span>Más Popular</span>
                </div>
              )}
              <h2 className="text-3xl font-serif text-white mb-2">{plan.name}</h2>
              <div className="mb-4">
                <p className="text-5xl font-bold text-white">
                  ${plan.price}
                  <span className="text-lg font-normal text-brand-secondary">/{plan.period}</span>
                </p>
                {plan.savings && (
                  <p className="text-brand-accent text-sm font-semibold">{plan.savings}</p>
                )}
              </div>
              <ul className="space-y-3 text-left text-brand-background/80 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-brand-highlight flex-shrink-0 mt-1" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {key === 'trimestral' && (
                 <Button onClick={handleKunnaSupport} variant="secondary" className="w-full bg-brand-highlight hover:bg-yellow-400 text-brand-primary rounded-full text-md py-4 mt-4 flex items-center space-x-2">
                    <Heart className="w-5 h-5"/>
                    <span>Soporte KUNNA 💜</span>
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Sección de código de donativo */}
        <div className="mt-10 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="border-t border-white/30 flex-1"></div>
            <span className="px-4 text-white/70 text-sm">o</span>
            <div className="border-t border-white/30 flex-1"></div>
          </div>
          
          <motion.div 
            className="glass-effect rounded-2xl p-6 max-w-md mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center mb-4">
              <Gift className="w-6 h-6 text-brand-accent mr-2" />
              <h3 className="text-xl font-semibold text-white">¿Tienes un código de donativo?</h3>
            </div>
            <p className="text-brand-secondary text-sm mb-4 text-center">
              Si tienes un código especial, ingrésalo aquí para activar tu membresía
            </p>
            
            {!showDonationCode ? (
              <Button
                onClick={() => setShowDonationCode(true)}
                variant="outline"
                className="w-full border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white"
              >
                Tengo un código de donativo
              </Button>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Ingresa tu código"
                  value={donationCode}
                  onChange={(e) => setDonationCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-full text-center font-mono text-lg uppercase tracking-widest"
                  maxLength="10"
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={handleDonationCode}
                    disabled={loading || !donationCode.trim()}
                    className="flex-1 bg-brand-accent hover:bg-brand-secondary text-white rounded-full"
                  >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Aplicar código'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDonationCode(false);
                      setDonationCode('');
                    }}
                    variant="outline"
                    className="px-6 border-white/30 text-white hover:bg-white/10"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm mb-4">
            💳 Pagos seguros con Mercado Pago • Acepta tarjetas de crédito y débito
          </p>
          <p className="text-white/50 text-xs">
            Haz clic en cualquier plan para comenzar el proceso de suscripción
          </p>
        </div>
      </motion.div>
      
      {/* Modal de Mercado Pago */}
      {showPaymentModal && selectedPlanForPayment && (
        <MercadoPagoPaymentModal
          plan={plans[selectedPlanForPayment]}
          planId={selectedPlanForPayment}
          user={user}
          onSuccess={handlePaymentSuccess}
          onCancel={() => {
            setShowPaymentModal(false);
            setSelectedPlanForPayment(null);
          }}
        />
      )}
      
      <Toaster />
    </div>
  );
};

export default PricingPage;