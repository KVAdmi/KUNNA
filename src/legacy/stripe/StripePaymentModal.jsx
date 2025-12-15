import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Lock, Check, Loader2, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createVita365Checkout } from '@/lib/stripePayments';
import supabase from '@/lib/customSupabaseClient';

const StripePaymentModal = ({ isOpen, onClose, profile, onPaymentSuccess }) => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState(profile?.tipo_plan || 'mensual');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('plan'); // 'plan', 'processing', 'success'
  const [showDonationCode, setShowDonationCode] = useState(false);
  const [donationCode, setDonationCode] = useState('');
  const [processingCode, setProcessingCode] = useState(false);

  // Reiniciar estado cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setShowDonationCode(false); // Siempre empezar en pago
      setPaymentStep('plan');
      setProcessingPayment(false);
      setProcessingCode(false);
      setDonationCode('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'mensual',
      name: 'Plan Mensual',
      price: '$149',
      period: '/mes',
      description: 'Perfecto para empezar',
      features: ['Acceso completo a Zinha', 'Cobertura Vita365', 'Soporte 24/7'],
      color: 'from-[#c1d43a] to-[#a8c139]',
      popular: false
    },
    {
      id: 'trimestral',
      name: 'Plan 3 Meses',
      price: '$402',
      period: '/3 meses',
      originalPrice: '$447',
      description: 'Ahorra $45',
      features: ['Todo del mensual', 'Ahorro del 10%', '3 meses sin preocupaciones'],
      color: 'from-[#8d75838] to-[#382a3c]',
      popular: true
    },
    {
      id: 'anual',
      name: 'Plan Anual',
      price: '$1,296',
      period: '/año',
      originalPrice: '$1,788',
      description: 'Máximo ahorro $492',
      features: ['Todo incluido', 'Ahorro del 28%', 'Un año completo protegida'],
      color: 'from-[#382a3c] to-[#8d75838]',
      popular: false
    }
  ];

  const handlePlanSelection = (planId) => {
    setSelectedPlan(planId);
  };

  const handleDonationCode = async () => {
    if (!donationCode.trim()) {
      toast({
        variant: "destructive",
        title: "Código requerido",
        description: "Por favor ingresa un código de donativo válido."
      });
      return;
    }

    try {
      setProcessingCode(true);
      
      // Llamar al RPC existente en Supabase
      const { data, error } = await supabase.rpc('redeem_codigo_donativo', {
        p_user_id: profile.id,
        p_codigo_donativo: donationCode.trim()
      });

      if (error) {
        console.error('❌ Error al canjear código donativo:', error);
        toast({
          variant: "destructive",
          title: "Código inválido",
          description: "El código ingresado no es válido o ya fue utilizado."
        });
        return;
      }

      // Éxito - el código fue canjeado
      toast({
        title: "¡Código canjeado exitosamente! 🎉",
        description: "¡Felicidades! Ahora tienes acceso vitalicio a Zinha.",
        className: 'bg-green-100 border-green-400 text-green-800'
      });

      // Cerrar modal y llamar callback de éxito
      onClose();
      if (onPaymentSuccess) {
        onPaymentSuccess('donativo');
      }

    } catch (error) {
      console.error('❌ Error general:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al procesar tu código. Inténtalo de nuevo."
      });
    } finally {
      setProcessingCode(false);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessingPayment(true);
      setPaymentStep('processing');
      
      console.log('� INICIO PAGO - Plan:', selectedPlan);
      
      // Esperar un poco para mostrar la animación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ejecutar pago
      await createVita365Checkout(selectedPlan, profile);
      
      // Si llegamos aquí sin redirect, hay un problema
      console.log('⚠️ No hubo redirect - posible error');
      
    } catch (error) {
      console.error('❌ Error en pago:', error);
      
      setProcessingPayment(false);
      setPaymentStep('plan');
      
      toast({
        variant: "destructive",
        title: "Error en el pago",
        description: error.message || "Error procesando el pago"
      });
    }
  };

  const renderPlanSelection = () => (
    <div className="space-y-6 flex flex-col h-full">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-[#382a3c] mb-3">
          {showDonationCode ? ' Código de Donativo' : ' Elige tu Plan Zinha'}
        </h3>
        <p className="text-[#382a3c]/70 text-lg mb-6">
          {showDonationCode ? 'Ingresa tu código para acceso vitalicio' : 'Selecciona el plan perfecto para ti'}
        </p>
        
        {/* Botones de alternancia */}
        <div className="flex space-x-2 bg-white/50 p-2 rounded-2xl mb-6">
          <button
            onClick={() => setShowDonationCode(false)}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              !showDonationCode 
                ? 'bg-gradient-to-r from-[#c1d43a] to-[#a8c139] text-[#382a3c] shadow-lg' 
                : 'text-[#382a3c]/70 hover:text-[#382a3c]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pagar Suscripción</span>
          </button>
          <button
            onClick={() => setShowDonationCode(true)}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              showDonationCode 
                ? 'bg-gradient-to-r from-[#c1d43a] to-[#a8c139] text-[#382a3c] shadow-lg' 
                : 'text-[#382a3c]/70 hover:text-[#382a3c]'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Código Donativo</span>
          </button>
        </div>
      </div>

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Sección de código donativo */}
        {showDonationCode && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#c1d43a]/10 to-[#a8c139]/10 border-2 border-[#c1d43a]/30 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#c1d43a] to-[#a8c139] rounded-full flex items-center justify-center">
                  <Gift className="w-8 h-8 text-[#382a3c]" />
                </div>
                <h4 className="text-xl font-bold text-[#382a3c] mb-2">¡Acceso Vitalicio!</h4>
                <p className="text-[#382a3c]/70 text-sm">
                  Los códigos de donativo te dan acceso completo y permanente a Zinha sin costo mensual.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#382a3c] mb-2">
                    Código de Donativo
                  </label>
                  <input
                    type="text"
                    value={donationCode}
                    onChange={(e) => setDonationCode(e.target.value.toUpperCase())}
                    placeholder="Ingresa tu código aquí"
                    className="w-full p-4 bg-white/70 border-2 border-white/60 rounded-xl text-[#382a3c] placeholder-[#382a3c]/50 focus:border-[#c1d43a] focus:outline-none transition-colors text-center font-mono text-lg tracking-wider"
                    disabled={processingCode}
                  />
                </div>
                
                <div className="bg-white/50 rounded-xl p-4">
                  <h5 className="font-semibold text-[#382a3c] mb-2 flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    Beneficios del código donativo:
                  </h5>
                  <ul className="space-y-1 text-sm text-[#382a3c]/80">
                    <li>• Acceso vitalicio a todas las funciones</li>
                    <li>• Sin pagos mensuales nunca más</li>
                    <li>• Cobertura Vita365 incluida</li>
                    <li>• Soporte prioritario</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección de planes de pago */}
        {!showDonationCode && (
          <div className="space-y-4">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                selectedPlan === plan.id
                  ? 'border-[#c1d43a] bg-gradient-to-r from-[#c1d43a]/10 to-[#a8c139]/10 shadow-lg'
                  : 'border-white/60 bg-white/40 hover:border-[#c1d43a]/50'
              }`}
              onClick={() => handlePlanSelection(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#c1d43a] to-[#a8c139] text-[#382a3c] px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                     Más Popular
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-[#382a3c]">{plan.name}</h4>
                  <p className="text-sm text-[#382a3c]/70">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-[#382a3c]">{plan.price}</span>
                    <span className="text-sm text-[#382a3c]/70 ml-1">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <span className="text-sm text-red-500 line-through">{plan.originalPrice}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-[#382a3c]">{feature}</span>
                  </div>
                ))}
              </div>

              {selectedPlan === plan.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-[#c1d43a] rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#382a3c]" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-white/30">
        <Button
          onClick={onClose}
          className="bg-white/70 hover:bg-white/90 text-[#382a3c] border-2 border-white/60 rounded-2xl px-8 py-3 font-semibold"
        >
          Cancelar
        </Button>
        
        {showDonationCode ? (
          <Button
            onClick={handleDonationCode}
            disabled={!donationCode.trim() || processingCode}
            className="bg-gradient-to-r from-[#c1d43a] to-[#a8c139] hover:from-[#a8c139] hover:to-[#c1d43a] text-[#382a3c] rounded-2xl px-8 py-3 font-semibold shadow-xl border border-white/30 disabled:opacity-50"
          >
            {processingCode ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Gift className="w-5 h-5 mr-2" />
                Canjear Código
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handlePayment}
            disabled={!selectedPlan || processingPayment}
            className="bg-gradient-to-r from-[#c1d43a] to-[#a8c139] hover:from-[#a8c139] hover:to-[#c1d43a] text-[#382a3c] rounded-2xl px-8 py-3 font-semibold shadow-xl border border-white/30 disabled:opacity-50"
            style={{ minHeight: '48px', fontSize: '16px' }}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Continuar al Pago
          </Button>
        )}
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto mb-6"
      >
        <Loader2 className="w-16 h-16 text-[#c1d43a]" />
      </motion.div>
      <h3 className="text-2xl font-bold text-[#382a3c] mb-3">
        🔒 Preparando tu pago
      </h3>
      <p className="text-[#382a3c]/70 mb-4">
        Te redirigiremos a Stripe para completar tu pago de forma segura...
      </p>
      <div className="flex items-center justify-center space-x-2 text-sm text-[#382a3c]/60 mb-4">
        <Lock className="w-4 h-4" />
        <span>Conexión segura SSL</span>
      </div>
      <p className="text-xs text-[#382a3c]/50 mb-6">
        Después del pago regresarás automáticamente a Zinha
      </p>
      
      {/* Botón de cancelar en caso de problemas */}
      <Button
        onClick={() => {
          setProcessingPayment(false);
          setPaymentStep('plan');
        }}
        className="bg-white/70 hover:bg-white/90 text-[#382a3c] border-2 border-white/60 rounded-2xl px-6 py-2 text-sm"
      >
        Cancelar proceso
      </Button>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
      >
        <Check className="w-8 h-8 text-green-600" />
      </motion.div>
      <h3 className="text-2xl font-bold text-[#382a3c] mb-3">
        🎉 ¡Pago exitoso!
      </h3>
      <p className="text-[#382a3c]/70">
        Tu suscripción ha sido activada correctamente
      </p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && paymentStep === 'plan') {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-white/50"
        style={{ fontFamily: 'Questrial, sans-serif' }}
      >
        {paymentStep === 'plan' && (
          <div className="absolute top-6 right-6">
            <Button
              onClick={onClose}
              size="icon"
              className="bg-white/70 hover:bg-white/90 text-[#382a3c] rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {paymentStep === 'plan' && renderPlanSelection()}
        {paymentStep === 'processing' && renderProcessing()}
        {paymentStep === 'success' && renderSuccess()}
      </motion.div>
    </motion.div>
  );
};

export default StripePaymentModal;
