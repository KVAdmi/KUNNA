# 🔐 Setup: Zona Holística con Supabase Edge Function

## 📋 Resumen
La lectura holística (Numerología + Tarot + Astrología) **NO puede llamar APIs externas desde el frontend** porque:
- ❌ CORS bloqueado
- ❌ API keys quedarían expuestas en el código del cliente
- ❌ Riesgo de drenaje de cuota y costos

**Solución:** Usar **Supabase Edge Function** como proxy seguro.

---

## 🏗️ Arquitectura

```
App Nativa (Capacitor)
    ↓ POST /functions/v1/holistico-reading
Supabase Edge Function (proxy seguro)
    ↓ API keys en secretos
RapidAPI (Numerología) + TarotAPI (gratis)
```

---

## ⚙️ Paso 1: Configurar Variables de Entorno en Supabase

### 1.1. Ir al Dashboard de Supabase
1. Abre [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto **KUNNA**
3. Ve a **Settings** → **Edge Functions** → **Secrets**

### 1.2. Agregar RAPIDAPI_KEY
Crea una nueva variable de entorno:

- **Name:** `RAPIDAPI_KEY`
- **Value:** Tu API key de RapidAPI (obtenerla en [rapidapi.com](https://rapidapi.com/hub))

**⚠️ IMPORTANTE:** Esta key NO debe estar en `.env` del frontend, SOLO en Supabase.

---

## 📦 Paso 2: Deploy de la Edge Function

### 2.1. Instalar Supabase CLI (si no la tienes)
```bash
brew install supabase/tap/supabase
```

### 2.2. Login en Supabase
```bash
supabase login
```

### 2.3. Linkear tu proyecto
```bash
cd /Users/pg/Documents/KUNNA
supabase link --project-ref TU_PROJECT_REF
```

**Tip:** El `project-ref` lo encuentras en la URL de tu dashboard:
```
https://supabase.com/dashboard/project/TU_PROJECT_REF
```

### 2.4. Deploy de la función
```bash
supabase functions deploy holistico-reading
```

### 2.5. Verificar que esté online
```bash
curl -X POST \
  https://TU_PROJECT_REF.supabase.co/functions/v1/holistico-reading \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -d '{
    "birthdate": "1990-05-15",
    "full_name": "María González",
    "includeNumerology": true,
    "includeTarot": true
  }'
```

Deberías ver una respuesta JSON con numerología y tarot.

---

## 🧪 Paso 3: Probar desde la App

### 3.1. Verificar que el frontend esté actualizado
El archivo `src/services/holisticoApi.js` debe tener:

```javascript
const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/holistico-reading`;

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    birthdate: fecha_nacimiento,
    full_name: name,
    includeNumerology: true,
    includeTarot: true
  })
});
```

### 3.2. Verificar variables en `.env`
```env
VITE_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 3.3. Reiniciar el servidor de desarrollo
```bash
npm run dev
```

### 3.4. Ir a la Zona Holística en la app
1. Ingresa tu fecha de nacimiento
2. Ingresa tu nombre completo
3. Presiona "Obtener lectura"

**✅ Debería funcionar** sin errores 404 ni CORS.

---

## 🐛 Troubleshooting

### ❌ Error: "Function not found (404)"
**Causa:** La Edge Function no se deployó correctamente.

**Solución:**
```bash
# Ver lista de funciones deployadas
supabase functions list

# Re-deploy
supabase functions deploy holistico-reading
```

### ❌ Error: "RAPIDAPI_KEY no configurada"
**Causa:** La variable de entorno no está en Supabase.

**Solución:**
1. Ve a **Supabase Dashboard** → **Settings** → **Edge Functions** → **Secrets**
2. Agrega `RAPIDAPI_KEY` con tu clave
3. Re-deploy la función:
```bash
supabase functions deploy holistico-reading
```

### ❌ Error: "RapidAPI status 401/403"
**Causa:** La API key es inválida o no tiene permisos.

**Solución:**
1. Ve a [rapidapi.com/dashboard](https://rapidapi.com/dashboard)
2. Verifica que tu API key esté activa
3. Suscríbete al plan correcto de "The Numerology API"
4. Actualiza la variable `RAPIDAPI_KEY` en Supabase

### ❌ Error: "Missing Authorization header"
**Causa:** El frontend no está enviando el header correcto.

**Solución:**
Verifica que `holisticoApi.js` incluya:
```javascript
'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
```

---

## 📊 Endpoints Disponibles

### POST /functions/v1/holistico-reading

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

**Body:**
```json
{
  "birthdate": "1990-05-15",
  "full_name": "María González",
  "includeNumerology": true,
  "includeTarot": true,
  "includeAstrology": false
}
```

**Response (200 OK):**
```json
{
  "ok": true,
  "data": {
    "timestamp": "2025-12-21T...",
    "user": {
      "birthdate": "1990-05-15",
      "full_name": "María González"
    },
    "numerology": {
      "lifePath": { "number": 2, "meaning": "..." },
      "destiny": { "number": 7, "meaning": "..." },
      ...
    },
    "tarot": {
      "name": "The Fool",
      "meaning": "...",
      "image": "https://..."
    }
  }
}
```

---

## 🎯 Ventajas de esta Arquitectura

✅ **Seguridad:** API keys NUNCA se exponen en el frontend  
✅ **CORS:** Sin problemas porque la llamada es server-to-server  
✅ **Control:** Puedes agregar rate limiting, logs, caché, etc.  
✅ **Nativa:** Funciona igual en web, iOS y Android  
✅ **Escalable:** Si cambias de API, solo tocas el backend  

---

## 📝 Próximos Pasos

- [ ] Agregar caché de lecturas en Supabase DB (evitar llamadas repetidas)
- [ ] Implementar rate limiting (max 10 lecturas/día por usuario)
- [ ] Agregar API de astrología cuando esté disponible
- [ ] Logs estructurados para debugging

---

## 🚨 NUNCA HAGAS ESTO

❌ Llamar RapidAPI directo desde el frontend  
❌ Meter API keys en `.env` del cliente  
❌ Usar CORS proxies públicos (inseguros)  
❌ Hardcodear secretos en el código  

---

**✅ Con esto, tu Zona Holística está lista para producción de forma segura.**
