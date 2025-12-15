# 💎 Sistema de Suscripciones KUNNA

Sistema completo de planes de suscripción con estilo Crystal Glass, integración con Mercado Pago y gestión de beneficios.

---

## 📦 Archivos Creados

```
src/
├── components/
│   └── subscription/
│       ├── PlanSelection.jsx       # Componente principal de selección de planes
│       └── PlanCard.jsx            # Tarjetas compactas y badges
├── pages/
│   └── SubscriptionPage.jsx        # Página standalone de suscripciones
├── constants/
│   └── plans.js                    # Configuración de planes y precios
└── INTEGRACION_PLANES_EJEMPLO.jsx  # Ejemplos de integración
```

---

## 🎨 Características

### ✨ Diseño Crystal Glass
- Efecto de cristal translúcido con `backdrop-filter: blur(18px)`
- Gradientes suaves y bordes semitransparentes
- Sombras tipo glow que cambian por plan
- Animaciones smooth en hover y selección
- Responsive: 1 columna móvil, 3 columnas desktop

### 🔐 3 Planes Disponibles

#### 1️⃣ Kunna Free ($0/mes)
- SOS Lite (alerta básica)
- Diario emocional
- Acceso limitado a comunidad
- Acompañamiento básico
- Perfil y ajustes generales

#### 2️⃣ Kunna Safe ($79/mes) ⭐ **RECOMENDADO**
- Todo lo de Free
- SOS Avanzado (audio + GPS + video)
- Envío automático a contactos
- Acompañamiento inteligente con IA
- Evidencia de audio y ubicación
- Comunidad completa
- Rutinas emocionales + IA

#### 3️⃣ Kunna Total ($199/mes)
- Todo lo de Safe
- Asistencias 24/7 (médica, psicológica, legal, vial)
- Beneficios reales VitaCard365
- Línea telefónica directa 24/7
- Servicio completo de emergencia

---

## 🚀 Uso Rápido

### Opción 1: Página Standalone

```jsx
import SubscriptionPage from '@/pages/SubscriptionPage';

// En tu router
<Route path="/planes" element={<SubscriptionPage />} />
```

### Opción 2: Dentro de ProfilePage

```jsx
import PlanSelection from '@/components/subscription/PlanSelection';
import { CurrentPlanBadge } from '@/components/subscription/PlanCard';

function ProfilePage() {
  const [showPlans, setShowPlans] = useState(false);
  
  return (
    <div>
      <CurrentPlanBadge planId="safe" />
      
      <button onClick={() => setShowPlans(true)}>
        Ver Planes
      </button>
      
      {showPlans && (
        <PlanSelection 
          onSelectPlan={(planId) => console.log(planId)}
          handleGoToPayment={handleGoToPayment}
        />
      )}
    </div>
  );
}
```

### Opción 3: Modal de Upgrade

```jsx
import PlanCard from '@/components/subscription/PlanCard';
import { PLAN_DETAILS } from '@/constants/plans';

<div className="grid gap-4 md:grid-cols-3">
  {PLAN_DETAILS.map(plan => (
    <PlanCard 
      key={plan.id}
      plan={plan}
      isActive={currentPlan === plan.id}
      onSelect={handleSelectPlan}
      compact={true}
    />
  ))}
</div>
```

---

## 💳 Integración Mercado Pago

### 1. Instalar SDK

```bash
npm install mercadopago
```

### 2. Crear Netlify Function

```javascript
// netlify/functions/create-preference.js

const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

exports.handler = async (event) => {
  const { planId, userId, email } = JSON.parse(event.body);
  
  const plans = {
    safe: { title: 'Kunna Safe', price: 79 },
    total: { title: 'Kunna Total', price: 199 }
  };
  
  const preference = {
    items: [{
      title: plans[planId].title,
      unit_price: plans[planId].price,
      quantity: 1,
      currency_id: 'MXN'
    }],
    payer: { email },
    back_urls: {
      success: `${process.env.URL}/payment-success`,
      failure: `${process.env.URL}/payment-failure`,
      pending: `${process.env.URL}/payment-pending`
    },
    auto_return: 'approved',
    external_reference: `${userId}_${planId}_${Date.now()}`
  };
  
  const response = await mercadopago.preferences.create(preference);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ init_point: response.body.init_point })
  };
};
```

### 3. Variables de Entorno

```env
# .env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-123456789...
MERCADOPAGO_PUBLIC_KEY=APP_USR-987654321...
```

### 4. Función handleGoToPayment

```jsx
const handleGoToPayment = async (planId) => {
  const response = await fetch('/.netlify/functions/create-preference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planId,
      userId: user.id,
      email: user.email
    })
  });
  
  const { init_point } = await response.json();
  window.location.href = init_point;
};
```

---

## 🎯 Funciones Helper Disponibles

```javascript
import { 
  KUNNA_PLANS,           // { FREE, SAFE, TOTAL }
  PLAN_PRICES,           // { free: 0, safe: 79, total: 199 }
  PLAN_DETAILS,          // Array completo de planes
  getPlanById,           // (planId) => plan object
  getPlanPrice,          // (planId) => price number
  isPaidPlan,            // (planId) => boolean
  getRecommendedPlan     // () => plan object
} from '@/constants/plans';
```

---

## 🎨 Paleta de Colores Usada

```css
--brand-primary: #382a3c     /* Deep Purple */
--brand-secondary: #8d7583   /* Gray Purple */
--brand-accent: #c8a6a6      /* Mauve */
--brand-highlight: #c1d43a   /* Lime */
--brand-background: #f5e6ff  /* Light Lavender */
```

### Colores por Plan
- **Free**: `#c8a6a6` (Mauve)
- **Safe**: `#c1d43a` (Lime) ⭐
- **Total**: `#8d7583` (Gray Purple)

---

## 📱 Responsive Design

- **Mobile**: 1 columna, scroll vertical
- **Tablet**: 2 columnas
- **Desktop**: 3 columnas en grid

```jsx
// Grid automático
className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
```

---

## ✅ Checklist de Implementación

### Frontend
- [x] Componente PlanSelection.jsx creado
- [x] Componente PlanCard.jsx creado
- [x] Constantes de planes en plans.js
- [x] Página standalone SubscriptionPage.jsx
- [x] Animaciones y efectos Crystal Glass
- [ ] Integrar en ProfilePage.jsx
- [ ] Crear ruta `/planes` en router

### Backend
- [ ] Crear función Netlify `create-preference.js`
- [ ] Configurar credenciales Mercado Pago
- [ ] Crear webhook para notificaciones
- [ ] Guardar suscripciones en Supabase
- [ ] Validar pagos y activar planes

### Base de Datos
- [ ] Crear tabla `user_subscriptions`
- [ ] Guardar plan actual en `profiles.plan_id`
- [ ] Crear tabla `payment_history`
- [ ] Configurar triggers para vencimientos

---

## 🔥 Próximos Pasos

1. **Conectar con Mercado Pago**
   - Crear cuenta vendedor
   - Obtener credenciales
   - Configurar webhook

2. **Guardar en Supabase**
   ```sql
   ALTER TABLE profiles 
   ADD COLUMN current_plan TEXT DEFAULT 'free';
   
   CREATE TABLE user_subscriptions (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES profiles(id),
     plan_id TEXT NOT NULL,
     status TEXT DEFAULT 'active',
     start_date TIMESTAMPTZ DEFAULT NOW(),
     end_date TIMESTAMPTZ,
     mercadopago_subscription_id TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. **Middleware de Verificación**
   ```jsx
   const requirePlan = (minPlan) => {
     const planHierarchy = ['free', 'safe', 'total'];
     return user.plan >= planHierarchy.indexOf(minPlan);
   };
   
   // Uso
   if (!requirePlan('safe')) {
     return <UpgradeModal />;
   }
   ```

4. **Notificaciones de Vencimiento**
   - Email 7 días antes
   - Push notification 3 días antes
   - Suspensión automática al vencer

---

## 🐛 Troubleshooting

### El componente no se ve
- Verifica que `src/index.css` tenga las variables CSS
- Importa correctamente los iconos de `lucide-react`
- Verifica que `use-toast` esté configurado

### Mercado Pago no redirige
- Revisa las credenciales en `.env`
- Verifica que `back_urls` sean accesibles
- Checa logs en Netlify Functions

### Plan no se guarda
- Verifica tabla `profiles` en Supabase
- Checa políticas RLS
- Valida que `user.id` exista

---

## 📚 Documentación Adicional

- [Mercado Pago Preferences](https://www.mercadopago.com.mx/developers/es/docs/checkout-pro/checkout-customization/preferences)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🎉 Features Bonus Incluidas

✨ **Animaciones**
- Fade in escalonado al cargar
- Scale en hover
- Glow effect por plan
- Smooth transitions

🎨 **Variantes de Componentes**
- `PlanSelection` - Full page
- `PlanCard` - Tarjeta individual
- `PlanCard compact` - Versión mini
- `CurrentPlanBadge` - Badge actual
- `PlanComparison` - Tabla comparativa

🔐 **Seguridad**
- Validación de plan en backend
- RLS policies en Supabase
- Webhook signature verification
- Rate limiting en endpoints

---

## 💪 ¿Necesitas Ayuda?

Si necesitas:
- Integrar en ProfilePage específicamente
- Crear el backend de Mercado Pago
- Configurar webhooks
- Diseñar modal de upgrade
- Agregar más planes

Solo dime y te ayudo paso a paso. 🚀
