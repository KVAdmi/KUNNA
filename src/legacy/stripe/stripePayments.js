import { loadStripe } from '@stripe/stripe-js';
import { getPlanDetails } from './stripeConfig';
import supabase from './customSupabaseClient';

// Cargar Stripe con tu clave pública - FORZAR RECARGA
let stripePromise = null;

export async function createVita365Checkout(planType, userProfile) {
  try {
    console.log('🚀 INICIO - Proceso de pago para plan:', planType);
    
    // Verificar variables de entorno
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    console.log('🔑 Stripe Key disponible:', !!stripeKey);
    
    if (!stripeKey) {
      throw new Error('Clave de Stripe no configurada');
    }
    
    // Cargar Stripe
    console.log('📡 Cargando Stripe...');
    const stripe = await loadStripe(stripeKey);
    
    if (!stripe) {
      throw new Error('Error al cargar Stripe');
    }

    console.log('✅ Stripe cargado');

    // Obtener usuario actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error('Usuario no autenticado');
    }

    console.log('👤 Usuario:', session.user.email);

    const planDetails = getPlanDetails(planType);
    console.log('📦 Plan:', planDetails);

    // URLs simples
    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/payment-success?plan=${planType}`;
    const cancelUrl = `${baseUrl}/perfil`;

    console.log('🔗 URLs:', { successUrl, cancelUrl });

    // Configuración mínima para Stripe Checkout
    const checkoutOptions = {
      lineItems: [{
        price: planDetails.priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      customerEmail: session.user.email
    };

    console.log('⚙️ Configuración:', checkoutOptions);
    console.log('🎯 Iniciando redirectToCheckout...');

    // Ejecutar redirect
    const { error } = await stripe.redirectToCheckout(checkoutOptions);

    if (error) {
      console.error('❌ Error de Stripe:', error);
      throw new Error(error.message);
    }

    console.log('✅ Redirect exitoso');

  } catch (error) {
    console.error('💥 Error completo:', error);
    throw error;
  }
}

// Exportar también getPlanDetails para uso en ProfilePage
export { getPlanDetails } from './stripeConfig';

// Función para crear Price IDs en Stripe Dashboard
export function getStripeSetupInstructions() {
  return `
🔧 CONFIGURACIÓN DE STRIPE REQUERIDA:

1. Ve a tu Dashboard de Stripe (https://dashboard.stripe.com)
2. Ve a Productos > Agregar producto
3. Crea estos productos con sus respectivos precios:

📦 Producto: "Cobertura Vita365"
   - Plan Mensual: $299 MXN/mes (recurrente mensual)
   - Plan Trimestral: $849 MXN cada 3 meses (recurrente cada 3 meses)
   - Plan Semestral: $1,599 MXN cada 6 meses (recurrente cada 6 meses) 
   - Plan Anual: $2,999 MXN/año (recurrente anual)

4. Copia los Price IDs y actualiza stripeConfig.js:
   - price_mensual_vita365 → tu_price_id_mensual
   - price_trimestral_vita365 → tu_price_id_trimestral
   - price_semestral_vita365 → tu_price_id_semestral
   - price_anual_vita365 → tu_price_id_anual

5. Agrega VITE_STRIPE_PUBLISHABLE_KEY a tu .env

6. Configura webhook para manejar eventos de pago
  `;
}
