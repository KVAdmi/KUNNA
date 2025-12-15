// Stripe Debug Test - Función simplificada para debugging
import { loadStripe } from '@stripe/stripe-js';

export async function testStripeSimple() {
  console.log('🧪 TEST: Iniciando prueba simple de Stripe');
  
  try {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    console.log('🔑 Clave de Stripe completa:', stripeKey);
    
    if (!stripeKey) {
      throw new Error('❌ No hay clave de Stripe en variables de entorno');
    }
    
    console.log('📡 Cargando Stripe con clave:', stripeKey.substring(0, 20) + '...');
    const stripe = await loadStripe(stripeKey);
    
    if (!stripe) {
      throw new Error('❌ No se pudo cargar Stripe - puede ser problema de red o clave inválida');
    }
    
    console.log('✅ Stripe cargado correctamente');
    console.log('📋 Objeto Stripe:', stripe);
    
    // Test directo a checkout con configuración mínima
    console.log('🎯 Iniciando checkout directo...');
    const result = await stripe.redirectToCheckout({
      lineItems: [{
        price: 'price_1RuMmFGgXxCywgPRsqseqDDt', // Price ID del plan mensual
        quantity: 1,
      }],
      mode: 'subscription',
      successUrl: `${window.location.origin}/payment-success`,
      cancelUrl: `${window.location.origin}/perfil`,
    });
    
    console.log('📋 Resultado de redirectToCheckout:', result);
    
    if (result.error) {
      console.error('❌ Error en redirectToCheckout:', result.error);
      throw new Error(`Error en redirección: ${result.error.message}`);
    }
    
    console.log('✅ Redirección exitosa iniciada');
    
  } catch (error) {
    console.error('💥 Error en test simple:', error);
    console.error('💥 Tipo de error:', typeof error);
    console.error('💥 Stack completo:', error.stack);
    alert('❌ Error en test de Stripe: ' + error.message);
    throw error;
  }
}
