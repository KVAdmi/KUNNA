import React from 'react';
import PlanSelection from '@/components/subscription/PlanSelection';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Función para manejar el pago (conectar con Mercado Pago)
  const handleGoToPayment = async (planId) => {
    console.log('🔥 Iniciando pago para plan:', planId);
    
    toast({
      title: '🚀 Procesando pago...',
      description: 'Redirigiendo a Mercado Pago',
    });

    // Aquí va tu lógica de Mercado Pago
    // Por ahora simulo el proceso
    
    try {
      // TODO: Integrar con tu endpoint de Mercado Pago
      // const response = await fetch('/api/create-preference', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ planId })
      // });
      // const { init_point } = await response.json();
      // window.location.href = init_point;
      
      // Simulación temporal
      setTimeout(() => {
        toast({
          title: '✅ Pago iniciado',
          description: 'Redirigiendo a pasarela de pago...',
        });
        // navigate('/payment-gateway', { state: { planId } });
      }, 1500);
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '❌ Error',
        description: 'No se pudo iniciar el pago',
      });
    }
  };

  // Callback cuando se selecciona un plan
  const handleSelectPlan = (planId) => {
    console.log('Plan seleccionado:', planId);
    
    // Guardar en localStorage o estado global
    localStorage.setItem('selectedPlan', planId);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--brand-background)' }}>
      <PlanSelection 
        onSelectPlan={handleSelectPlan}
        handleGoToPayment={handleGoToPayment}
      />
    </div>
  );
};

export default SubscriptionPage;
