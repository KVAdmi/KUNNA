import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createPaymentPreference, KUNNA_PLANS } from '@/lib/mercadoPago';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, CreditCard, Shield } from 'lucide-react';

const MercadoPagoPaymentModal = ({ isOpen, onClose, selectedPlan }) => {
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!selectedPlan || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Selecciona un plan válido'
      });
      return;
    }

    setLoading(true);

    try {
      const preference = await createPaymentPreference(selectedPlan, {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.email
      });

      // Redirigir a Mercado Pago
      window.location.href = preference.init_point;
      
    } catch (error) {
      console.error('Error iniciando pago:', error);
      toast({
        variant: 'destructive',
        title: 'Error en el pago',
        description: 'No pudimos procesar tu solicitud. Inténtalo nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlan = () => KUNNA_PLANS[selectedPlan];
  const plan = getPlan();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#c1d43a] to-[#8d7583] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-[#382a3c] mb-2">
            Activar KUNNA Premium
          </h3>
          <p className="text-[#8d7583]">
            Pago seguro con Mercado Pago
          </p>
        </div>

        {/* Plan seleccionado */}
        {plan && (
          <div className="bg-gradient-to-r from-[#f5e6ff] to-[#f0f8ff] rounded-2xl p-4 mb-6">
            <h4 className="font-bold text-[#382a3c] mb-2">{plan.title}</h4>
            <p className="text-sm text-[#8d7583] mb-3">{plan.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-[#c1d43a]">
                ${plan.price}
              </span>
              <span className="text-sm text-[#8d7583]">MXN</span>
            </div>
          </div>
        )}

        {/* Métodos de pago */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-[#8d7583] mb-4">
            <Shield className="w-4 h-4 mr-2" />
            Pago 100% seguro con Mercado Pago
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-600">Tarjetas</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-600">OXXO</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-600">Transferencia</div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="space-y-3">
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#c1d43a] to-[#a8c139] hover:from-[#a8c139] hover:to-[#c1d43a] text-[#382a3c] font-bold py-3 rounded-2xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              'Continuar con Mercado Pago'
            )}
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-[#c1d43a] text-[#382a3c] hover:bg-[#c1d43a]/10"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MercadoPagoPaymentModal;