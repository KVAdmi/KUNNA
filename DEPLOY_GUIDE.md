# 🚀 GUÍA DE DEPLOY - KUNNA AL-E
**Fecha:** 7 de enero 2026  
**Versión:** 2.0.0 con AL-E

---

## 📋 PRE-DEPLOY CHECKLIST

### 1. Variables de Entorno ✅
Verificar que `.env.production` tenga:

```env
# AL-E Core
VITE_ALE_CORE_BASE=https://api.al-eon.com
VITE_WORKSPACE_ID=core
VITE_DEFAULT_MODE=universal

# Supabase
VITE_SUPABASE_URL=https://wpsysctbaxbtzyebcjlb.supabase.co
VITE_SUPABASE_ANON_KEY=[producción]

# APIs
VITE_RAPIDAPI_KEY=[producción]
VITE_GOOGLE_MAPS_API_KEY=[producción]
VITE_GOOGLE_CLIENT_ID=[producción]

# Twilio (opcional)
VITE_TWILIO_ACCOUNT_SID=[opcional]
VITE_TWILIO_AUTH_TOKEN=[opcional]
VITE_TWILIO_PHONE_NUMBER=[opcional]

# Backend URL
VITE_BACKEND_URL=https://kunna.com
```

### 2. Supabase Edge Functions 🔧
Desplegar funciones:

```bash
# Login a Supabase
supabase login

# Desplegar emergency-call
supabase functions deploy emergency-call

# Desplegar emergency-sms
supabase functions deploy emergency-sms

# Configurar secrets
supabase secrets set TWILIO_ACCOUNT_SID=your_sid
supabase secrets set TWILIO_AUTH_TOKEN=your_token
supabase secrets set TWILIO_PHONE_NUMBER=your_number
```

### 3. Base de Datos ✅
Verificar que todas las tablas existan:

```sql
-- Verificar tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'ale_events',
  'ale_user_patterns',
  'circulos_confianza',
  'estados_usuario',
  'salidas_programadas',
  'check_ins',
  'emergencias_activas',
  'notificaciones_circulo',
  'evidencias_sos',
  'circulo_messages'
);

-- Deberían ser 10 tablas
```

### 4. Storage Buckets ✅
Verificar buckets:
- `videos-sos` (privado con RLS)
- `audios-panico` (privado con RLS)

---

## 🏗️ BUILD DE PRODUCCIÓN

### Paso 1: Optimizar código
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install --production=false

# Audit de seguridad
npm audit fix

# Actualizar dependencias críticas
npm update
```

### Paso 2: Build
```bash
# Build optimizado
npm run build

# El output estará en /dist
```

### Paso 3: Verificar build
```bash
# Preview local del build
npm run preview

# Verificar en http://localhost:4173
# Probar funcionalidades críticas
```

---

## 📦 DEPLOY A NETLIFY

### Opción A: Deploy Manual
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy a producción
netlify deploy --prod --dir=dist
```

### Opción B: Deploy Automático (GitHub)
1. Conectar repo a Netlify
2. Configurar build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Agregar variables de entorno en Netlify dashboard
4. Push a `main` branch para deploy automático

### Configuración netlify.toml
Verificar que exista:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## 📱 BUILD MÓVIL

### Android
```bash
# Sync con Capacitor
npx cap sync android

# Abrir Android Studio
npx cap open android

# En Android Studio:
# 1. Build > Generate Signed Bundle/APK
# 2. Seleccionar APK
# 3. Configurar signing key
# 4. Build Release
```

### iOS
```bash
# Sync con Capacitor
npx cap sync ios

# Abrir Xcode
npx cap open ios

# En Xcode:
# 1. Product > Archive
# 2. Distribute App
# 3. App Store Connect
# 4. Upload
```

---

## ✅ POST-DEPLOY VERIFICATION

### 1. Smoke Tests (5 min)
- [ ] App carga sin errores
- [ ] Login funciona
- [ ] SOS se activa
- [ ] Video graba y sube
- [ ] Círculo muestra miembros
- [ ] Salidas se crean
- [ ] Chat funciona
- [ ] Moderación bloquea
- [ ] Dashboard muestra eventos

### 2. Performance Tests
```bash
# Lighthouse audit
npx lighthouse https://kunna.com --view

# Objetivos:
# - Performance: > 90
# - Accessibility: > 95
# - Best Practices: > 90
# - SEO: > 90
```

### 3. Monitoring
Configurar:
- Sentry para errores
- Google Analytics para uso
- Supabase Dashboard para queries lentas

---

## 🔒 SEGURIDAD

### Verificar:
- [ ] SERVICE_ROLE_KEY no está en frontend
- [ ] Todas las APIs requieren autenticación
- [ ] RLS activo en todas las tablas
- [ ] Storage buckets son privados
- [ ] CORS configurado correctamente
- [ ] Rate limiting habilitado

---

## 📊 MÉTRICAS DE ÉXITO

### Performance
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

### Funcionalidad
- Video upload: < 15s
- Moderación response: < 2s
- Realtime latency: < 1s
- SOS activation: < 3s

---

## 🐛 ROLLBACK PLAN

Si algo falla:

```bash
# Netlify - Rollback a deploy anterior
netlify rollback

# O desde dashboard:
# 1. Ir a Deploys
# 2. Seleccionar deploy anterior
# 3. Click "Publish deploy"
```

---

## 📞 SOPORTE POST-DEPLOY

### Monitoreo
- Supabase Dashboard: Queries lentas, errores
- Netlify Analytics: Tráfico, errores 404
- Sentry: Errores de JavaScript
- Console logs del navegador de usuarios

### Hotfix Process
1. Identificar problema
2. Fix en branch `hotfix/nombre`
3. Testing rápido
4. Merge a `main`
5. Deploy automático
6. Verificar fix en producción

---

## 🎯 OPTIMIZACIONES FUTURAS

### Semana 2:
- [ ] Service Worker para offline
- [ ] Push Notifications web
- [ ] Precaching de assets críticos
- [ ] Code splitting más granular

### Mes 1:
- [ ] CDN para assets estáticos
- [ ] Image optimization automática
- [ ] Lazy loading de rutas
- [ ] Bundle analyzer y optimización

---

**Última actualización:** 7 de enero 2026  
**Próxima revisión:** Post-deploy + 24 horas
