import React from 'react';
import { createVita365Checkout } from '../lib/stripePayments';
import { Button } from '../components/ui/button';

const StripeTest = () => {
  const testStripe = async () => {
    console.log('🧪 Probando integración de Stripe...');
    
    // Datos de prueba
    const testProfile = {
      id_vita: 'TEST123',
      coverage_id: 'COV456',
      nombre_completo: 'Usuario de Prueba',
      email: 'test@example.com'
    };

    try {
      await createVita365Checkout('mensual', testProfile);
    } catch (error) {
      console.error('❌ Error en prueba de Stripe:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🧪 Prueba de Stripe</h2>
      <p className="mb-4">Este botón probará la integración de Stripe.</p>
      <Button onClick={testStripe}>
        Probar Stripe Checkout
      </Button>
      <div className="mt-4 text-sm text-gray-600">
        <p>✅ Variables de entorno cargadas:</p>
        <p>VITE_STRIPE_PUBLISHABLE_KEY: {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? '✅ Cargada' : '❌ No encontrada'}</p>
      </div>
    </div>
  );
};

export default StripeTest;
