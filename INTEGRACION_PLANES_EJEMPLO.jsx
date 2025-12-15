// ============================================
// EJEMPLO DE INTEGRACIÓN EN ProfilePage.jsx
// ============================================

// 1. IMPORTS (agregar al inicio del archivo)
import PlanSelection from '@/components/subscription/PlanSelection';
import { CurrentPlanBadge } from '@/components/subscription/PlanCard';
import { KUNNA_PLANS, getPlanById } from '@/constants/plans';

// 2. ESTADO (agregar en el componente ProfilePage)
const [currentPlan, setCurrentPlan] = useState(KUNNA_PLANS.FREE); // Plan actual del usuario
const [showPlanSelection, setShowPlanSelection] = useState(false);

// 3. FUNCIÓN DE PAGO MERCADO PAGO (ya debe existir en tu ProfilePage)
const handleGoToPayment = async (planId) => {
  console.log('🚀 Iniciando pago para plan:', planId);
  
  try {
    // Crear preferencia de Mercado Pago
    const response = await fetch('/api/mercadopago/create-preference', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.access_token}`
      },
      body: JSON.stringify({
        planId,
        userId: user?.id,
        email: user?.email
      })
    });

    const { init_point } = await response.json();
    
    // Redirigir a Mercado Pago
    window.location.href = init_point;
    
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'No se pudo iniciar el pago. Intenta de nuevo.'
    });
  }
};

// 4. SECCIÓN EN EL RENDER (agregar donde quieras mostrar los planes)
return (
  <div className="profile-page">
    {/* ... Resto de tu ProfilePage ... */}

    {/* Mostrar plan actual */}
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--brand-primary)' }}>
            Tu Plan Actual
          </h2>
          <p className="text-sm opacity-70" style={{ color: 'var(--brand-secondary)' }}>
            {getPlanById(currentPlan)?.description}
          </p>
        </div>
        <CurrentPlanBadge planId={currentPlan} />
      </div>

      <button
        onClick={() => setShowPlanSelection(!showPlanSelection)}
        className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
        style={{
          background: 'var(--brand-highlight)',
          color: 'white',
          boxShadow: '0 4px 16px rgba(193, 212, 58, 0.3)'
        }}
      >
        {currentPlan === KUNNA_PLANS.FREE ? 'Mejorar Plan' : 'Cambiar Plan'}
      </button>
    </section>

    {/* Modal/Sección de selección de planes */}
    {showPlanSelection && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div 
          className="max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-3xl"
          style={{
            background: 'var(--brand-background)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/20">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--brand-primary)' }}>
              Selecciona tu plan
            </h2>
            <button
              onClick={() => setShowPlanSelection(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <PlanSelection 
            onSelectPlan={(planId) => {
              setCurrentPlan(planId);
              setShowPlanSelection(false);
            }}
            handleGoToPayment={handleGoToPayment}
          />
        </div>
      </div>
    )}

    {/* ... Resto de tu ProfilePage ... */}
  </div>
);

// ============================================
// EJEMPLO DE ENDPOINT BACKEND PARA MERCADO PAGO
// ============================================

/*
// Archivo: api/mercadopago/create-preference.js (Netlify Function)
// O backend/routes/mercadopago.js (Express)

const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { planId, userId, email } = JSON.parse(event.body);

  const planPrices = {
    safe: 79,
    total: 199
  };

  const planNames = {
    safe: 'Kunna Safe - Suscripción Mensual',
    total: 'Kunna Total - Suscripción Mensual'
  };

  try {
    const preference = {
      items: [
        {
          title: planNames[planId],
          unit_price: planPrices[planId],
          quantity: 1,
          currency_id: 'MXN'
        }
      ],
      payer: {
        email: email
      },
      back_urls: {
        success: `${process.env.SITE_URL}/payment-success?plan=${planId}`,
        failure: `${process.env.SITE_URL}/payment-failure`,
        pending: `${process.env.SITE_URL}/payment-pending`
      },
      auto_return: 'approved',
      external_reference: `${userId}_${planId}_${Date.now()}`,
      notification_url: `${process.env.SITE_URL}/api/mercadopago/webhook`
    };

    const response = await mercadopago.preferences.create(preference);

    return {
      statusCode: 200,
      body: JSON.stringify({
        init_point: response.body.init_point,
        preference_id: response.body.id
      })
    };

  } catch (error) {
    console.error('Error creando preferencia:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al crear preferencia de pago' })
    };
  }
}
*/

// ============================================
// VARIABLES DE ENTORNO NECESARIAS (.env)
// ============================================

/*
MERCADOPAGO_ACCESS_TOKEN=TU_ACCESS_TOKEN_AQUI
MERCADOPAGO_PUBLIC_KEY=TU_PUBLIC_KEY_AQUI
SITE_URL=https://tu-app.netlify.app
*/

// ============================================
// INSTALACIÓN MERCADO PAGO SDK
// ============================================

/*
npm install mercadopago
*/

export default {};
