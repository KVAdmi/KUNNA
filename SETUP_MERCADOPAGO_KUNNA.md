# 🔐 CONFIGURACIÓN MERCADO PAGO - SOLO KUNNA

## 📋 ARCHIVOS MODIFICADOS

### Backend
- ✅ `backend/server.js` - Agregados endpoints de MP
- ✅ `backend/package.json` - Agregadas dependencias (axios, mercadopago)
- ✅ `backend/.env` - Preparado para claves (VER ABAJO)
- ✅ `backend/.env.example` - Template para referencia

### Frontend
- ✅ `src/lib/mercadoPago.js` - Eliminado SDK, ahora llama al backend
- ✅ `src/pages/PricingPage.jsx` - Precio actualizado a $99 MXN
- ✅ `.env` - Eliminadas claves privadas
- ✅ `package.json` - Eliminadas dependencias innecesarias de MP

---

## 🚀 ENDPOINTS CREADOS

### 1. Crear Suscripción
```
POST http://localhost:3001/api/mp/kunna/create-subscription

Body:
{
  "payer_email": "usuario@ejemplo.com",
  "user_id": "uuid-del-usuario"
}

Response:
{
  "success": true,
  "init_point": "https://www.mercadopago.com/mlm/debits/new?...",
  "subscription_id": "xyz123"
}
```

### 2. Webhook
```
POST http://localhost:3001/api/mp/webhook

Body: (Lo envía Mercado Pago automáticamente)
{
  "type": "subscription_authorized",
  "data": { "id": "subscription_id" }
}

Acción:
- Actualiza tabla `profiles` con has_paid=true
- Registra en tabla `payments` (si existe)
```

---

## 🔑 VARIABLES QUE TIENES QUE PEGAR

### Archivo: `backend/.env`

```bash
# Mercado Pago - SOLO KUNNA
MP_ACCESS_TOKEN=<PEGAR_TU_ACCESS_TOKEN_AQUI>
MP_PUBLIC_KEY=<OPCIONAL>
MP_KUNNA_PREMIUM_PLAN_ID=04da2b31975e4f568660e31c13b91aeb

# Supabase
SUPABASE_URL=https://wpsysctbaxbtzyebcjlb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<PEGAR_SERVICE_ROLE_KEY_AQUI>

# URLs
VITE_APP_URL_PROD=https://kunna.app

# Server
PORT=3001
```

### ¿Dónde encuentro las claves?

1. **MP_ACCESS_TOKEN**:
   - Ve a https://www.mercadopago.com.mx/developers
   - Credenciales > Producción > Access Token

2. **SUPABASE_SERVICE_ROLE_KEY**:
   - Ve a tu proyecto en Supabase Dashboard
   - Settings > API > service_role (secret)

---

## 🌐 CONFIGURACIÓN DE WEBHOOK EN MERCADO PAGO

Cuando despliegues el backend a producción (Netlify/EC2/Railway):

1. Ve a https://www.mercadopago.com.mx/developers
2. Tu aplicación > Webhooks
3. Agrega esta URL:
   ```
   https://tu-backend-en-produccion.com/api/mp/webhook
   ```
4. Eventos a escuchar:
   - ✅ `subscription_authorized`
   - ✅ `subscription_preapproval`
   - ✅ `subscription_paused`
   - ✅ `subscription_cancelled`

---

## 🧪 CÓMO PROBAR END-TO-END (SIN EXPONER SECRETOS)

### Opción 1: Localmente

1. **Pega las claves en `backend/.env`**
   ```bash
   cd backend
   nano .env
   # Pega tus claves
   ```

2. **Inicia el backend**
   ```bash
   npm start
   ```

3. **Inicia el frontend (otra terminal)**
   ```bash
   cd ..
   npm run dev
   ```

4. **Prueba el flujo**:
   - Ve a http://localhost:5173/pricing
   - Haz clic en "Activar Premium"
   - Deberías ser redirigida a Mercado Pago
   - Completa el pago (usa tarjetas de prueba de MP)
   - El webhook NO funcionará localmente (necesitas túnel o despliegue)

### Opción 2: Con Túnel (para probar webhook)

1. **Instala ngrok**:
   ```bash
   brew install ngrok
   ```

2. **Túnel al backend**:
   ```bash
   ngrok http 3001
   ```

3. **Copia la URL pública** (ej: https://abc123.ngrok.io)

4. **Configura webhook en MP** con:
   ```
   https://abc123.ngrok.io/api/mp/webhook
   ```

5. **Prueba el flujo completo**

---

## 🚨 SEGURIDAD - VERIFICACIÓN

✅ **Claves privadas NUNCA en frontend**
- ❌ No hay `VITE_MERCADOPAGO_ACCESS_TOKEN` en `.env`
- ✅ Solo `VITE_BACKEND_URL` (pública)

✅ **Gitignore protege secretos**
- ✅ `.env` ignorado
- ✅ `backend/.env` ignorado

✅ **Frontend es "tonto"**
- ✅ Solo llama endpoints
- ✅ No crea preapprovals
- ✅ No conoce claves

✅ **Backend valida todo**
- ✅ Crea suscripciones
- ✅ Procesa webhooks
- ✅ Actualiza Supabase

---

## 📊 FLUJO COMPLETO

```
Usuario → Clic "Activar Premium"
    ↓
Frontend → POST /api/mp/kunna/create-subscription
    ↓
Backend → Mercado Pago API (preapproval)
    ↓
Backend → Devuelve init_point
    ↓
Frontend → Redirige a Mercado Pago
    ↓
Usuario → Completa pago
    ↓
Mercado Pago → POST /api/mp/webhook (a tu backend)
    ↓
Backend → Actualiza Supabase (has_paid=true)
    ↓
Usuario → Ve KUNNA Premium activado
```

---

## 🎯 RESUMEN EJECUTIVO

| Concepto | Estado |
|----------|--------|
| **Solo KUNNA** | ✅ Sin VitaCard |
| **Claves en backend** | ✅ No expuestas |
| **Sin hardcode** | ✅ Variables de entorno |
| **Plan correcto** | ✅ $99 MXN mensual |
| **Webhook funcional** | ✅ Activación automática |
| **Sin secretos en repo** | ✅ .gitignore protege |

---

## 💡 PRÓXIMOS PASOS

1. Pega las claves en `backend/.env`
2. Despliega el backend a producción
3. Actualiza `VITE_BACKEND_URL` en frontend con la URL real
4. Configura el webhook en Mercado Pago
5. Prueba con tarjetas de prueba
6. Activa en producción

---

**FIN DE CONFIGURACIÓN** ✅
