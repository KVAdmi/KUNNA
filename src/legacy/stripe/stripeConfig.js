// Configuración de precios de Stripe para Vita365 - PRODUCCIÓN
export const VITA365_PLANS = {
  mensual: {
    priceId: 'price_1RuO6ZGr10a3liepqBksETjg',
    amount: 149,
    currency: 'MXN',
    interval: 'month',
    name: 'Plan Mensual Vita365',
    description: 'Cobertura Vita365 - $149 MXN/mes'
  },
  trimestral: {
    priceId: 'price_1RuO9mGr10a3liepfCwJPAX3',
    amount: 402,
    currency: 'MXN',
    interval: 'quarter',
    name: 'Plan Trimestral Vita365',
    description: 'Cobertura Vita365 - $402 MXN cada 3 meses ($134/mes)'
  },
  semestral: {
    priceId: 'price_1RuOB5Gr10a3liep0INqoajr', // Mantengo este por si acaso
    amount: 804, // 6 meses aprox
    currency: 'MXN',
    interval: 'semi_annual',
    name: 'Plan Semestral Vita365',
    description: 'Cobertura Vita365 - $804 MXN cada 6 meses ($134/mes)'
  },
  anual: {
    priceId: 'price_1RuOByGr10a3liepb7ODT31h',
    amount: 1296,
    currency: 'MXN',
    interval: 'year',
    name: 'Plan Anual Vita365',
    description: 'Cobertura Vita365 - $1,296 MXN/año ($108/mes)'
  }
};

export function getPlanDetails(planType) {
  return VITA365_PLANS[planType] || VITA365_PLANS.mensual;
}

export function formatPrice(amount, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency
  }).format(amount);
}
