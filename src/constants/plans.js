// Constantes de planes de suscripción KUNNA
export const KUNNA_PLANS = {
  FREE: 'free',
  SAFE: 'safe',
  TOTAL: 'total'
};

export const PLAN_PRICES = {
  [KUNNA_PLANS.FREE]: 0,
  [KUNNA_PLANS.SAFE]: 79,
  [KUNNA_PLANS.TOTAL]: 199
};

export const PLAN_DETAILS = [
  {
    id: KUNNA_PLANS.FREE,
    name: 'Kunna Free',
    price: 0,
    priceLabel: 'Gratis',
    description: 'Funciones básicas para comenzar tu viaje con KUNNA',
    features: [
      { name: 'SOS Lite', description: 'Alerta básica de emergencia', included: true },
      { name: 'Diario emocional', description: 'Registro de tu bienestar diario', included: true },
      { name: 'Comunidad limitada', description: 'Acceso a salas públicas', included: true },
      { name: 'Acompañamiento básico', description: 'Seguimiento simple', included: true },
      { name: 'Perfil básico', description: 'Configuración general', included: true },
      { name: 'SOS Avanzado', description: '', included: false },
      { name: 'IA Emocional', description: '', included: false },
      { name: 'Asistencias 24/7', description: '', included: false }
    ],
    recommended: false,
    popular: false
  },
  {
    id: KUNNA_PLANS.SAFE,
    name: 'Kunna Safe',
    price: 79,
    priceLabel: '$79',
    description: 'Protección completa y herramientas inteligentes',
    features: [
      { name: 'Todo lo de Free', description: 'Todas las funciones básicas', included: true },
      { name: 'SOS Avanzado', description: 'Audio, video y ubicación GPS', included: true },
      { name: 'Envío automático', description: 'Alertas a tus contactos', included: true },
      { name: 'Acompañamiento IA', description: 'Seguimiento inteligente 24/7', included: true },
      { name: 'Evidencia completa', description: 'Audio y ubicación guardada', included: true },
      { name: 'Comunidad completa', description: 'Acceso a todas las salas', included: true },
      { name: 'Rutinas + IA', description: 'Planes personalizados', included: true },
      { name: 'Asistencias 24/7', description: '', included: false }
    ],
    recommended: true,
    popular: true
  },
  {
    id: KUNNA_PLANS.TOTAL,
    name: 'Kunna Total',
    price: 199,
    priceLabel: '$199',
    description: 'Todo KUNNA + asistencias reales 24/7',
    features: [
      { name: 'Todo lo de Safe', description: 'Todas las funciones avanzadas', included: true },
      { name: 'Asistencia médica 24/7', description: 'Orientación médica telefónica', included: true },
      { name: 'Asistencia psicológica', description: 'Apoyo emocional profesional', included: true },
      { name: 'Asistencia legal', description: 'Orientación legal básica', included: true },
      { name: 'Asistencia vial', description: 'Auxilio en carretera', included: true },
      { name: 'VitaCard365 Benefits', description: 'Descuentos y beneficios reales', included: true },
      { name: 'Línea directa 24/7', description: 'Atención prioritaria', included: true },
      { name: 'Emergencia completa', description: 'Servicio integral', included: true }
    ],
    recommended: false,
    popular: false
  }
];

// Mercado Pago IDs (ejemplo - reemplazar con tus IDs reales)
export const MERCADOPAGO_PLAN_IDS = {
  [KUNNA_PLANS.SAFE]: 'MP_SAFE_PLAN_ID',
  [KUNNA_PLANS.TOTAL]: 'MP_TOTAL_PLAN_ID'
};

// Helpers
export const getPlanById = (planId) => {
  return PLAN_DETAILS.find(plan => plan.id === planId);
};

export const getPlanPrice = (planId) => {
  return PLAN_PRICES[planId] || 0;
};

export const isPaidPlan = (planId) => {
  return planId !== KUNNA_PLANS.FREE;
};

export const getRecommendedPlan = () => {
  return PLAN_DETAILS.find(plan => plan.recommended);
};

export default KUNNA_PLANS;
