// Configuración de Mercado Pago para KUNNA
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuración del cliente MP
const client = new MercadoPagoConfig({
  accessToken: import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

const preference = new Preference(client);

// Planes disponibles para KUNNA
export const KUNNA_PLANS = {
  mensual: {
    id: 'kunna_mensual',
    title: 'KUNNA Premium - Plan Mensual',
    price: 199,
    description: 'Acceso completo a KUNNA por 1 mes'
  },
  trimestral: {
    id: 'kunna_trimestral', 
    title: 'KUNNA Premium - Plan Trimestral',
    price: 497,
    description: 'Acceso completo a KUNNA por 3 meses (17% descuento)'
  },
  semestral: {
    id: 'kunna_semestral',
    title: 'KUNNA Premium - Plan Semestral', 
    price: 897,
    description: 'Acceso completo a KUNNA por 6 meses (25% descuento)'
  },
  anual: {
    id: 'kunna_anual',
    title: 'KUNNA Premium - Plan Anual',
    price: 1497,
    description: 'Acceso completo a KUNNA por 12 meses (37% descuento)'
  }
};

// Crear preferencia de pago
export const createPaymentPreference = async (planId, userProfile) => {
  try {
    const plan = KUNNA_PLANS[planId];
    if (!plan) {
      throw new Error('Plan no válido');
    }

    const preferenceData = {
      items: [
        {
          id: plan.id,
          title: plan.title,
          description: plan.description,
          unit_price: plan.price,
          quantity: 1,
        }
      ],
      payer: {
        name: userProfile?.full_name || 'Usuario',
        email: userProfile?.email || 'usuario@kunna.app',
      },
      back_urls: {
        success: `${window.location.origin}/payment-success`,
        failure: `${window.location.origin}/pricing`,
        pending: `${window.location.origin}/pricing`
      },
      auto_return: 'approved',
      external_reference: userProfile?.id || 'unknown',
      notification_url: `${import.meta.env.VITE_BACKEND_URL}/webhooks/mercadopago`,
      metadata: {
        plan_id: planId,
        user_id: userProfile?.id,
        app: 'kunna'
      }
    };

    const response = await preference.create({ body: preferenceData });
    return response;
    
  } catch (error) {
    console.error('Error creando preferencia MP:', error);
    throw error;
  }
};

// Procesar pago exitoso
export const handlePaymentSuccess = async (paymentId, userId) => {
  try {
    // Aquí iría la lógica para actualizar el estado del usuario
    console.log('🎉 Pago exitoso MP:', { paymentId, userId });
    
    // Actualizar perfil del usuario como pagado
    // Esta lógica se conectaría con Supabase
    return { success: true };
    
  } catch (error) {
    console.error('Error procesando pago exitoso:', error);
    throw error;
  }
};

export default {
  createPaymentPreference,
  handlePaymentSuccess,
  KUNNA_PLANS
};