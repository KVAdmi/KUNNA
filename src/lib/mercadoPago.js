// Configuración de Mercado Pago para KUNNA
// CLAVES PRIVADAS EN BACKEND - Frontend solo llama endpoints

// Planes disponibles para KUNNA (solo para UI)
export const KUNNA_PLANS = {
  mensual: {
    id: 'kunna_mensual',
    title: 'KUNNA Premium - Plan Mensual',
    price: 99,
    description: 'Acceso completo a KUNNA por 1 mes'
  }
};

// Crear suscripción KUNNA Premium (llamada a backend)
export const createPaymentPreference = async (planId, userProfile) => {
  try {
    if (!userProfile?.id || !userProfile?.email) {
      throw new Error('Perfil de usuario incompleto');
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

    console.log('🔵 Llamando backend para crear suscripción...');

    const response = await fetch(`${backendUrl}/api/mp/kunna/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payer_email: userProfile.email,
        user_id: userProfile.id
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Error creando suscripción');
    }

    console.log('✅ Suscripción creada:', data.subscription_id);

    return {
      init_point: data.init_point,
      id: data.subscription_id
    };
    
  } catch (error) {
    console.error('❌ Error creando suscripción:', error);
    throw error;
  }
};

// Procesar pago exitoso
export const handlePaymentSuccess = async (paymentId, userId) => {
  try {
    console.log('🎉 Pago procesado por webhook');
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