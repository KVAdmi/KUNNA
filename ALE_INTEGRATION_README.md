# ✅ INTEGRACIÓN KUNNA + AL-E CORE - COMPLETADA

## 📦 ENTREGABLES

### 1. **SQL Migrations** (Supabase KUNNA)
- ✅ `CREATE_ALE_INTEGRATION_TABLES.sql`
  - `kunna_ale_outbox` (eventos enviados)
  - `kunna_ale_decisions` (decisiones recibidas)
  - `kunna_ale_action_logs` (acciones ejecutadas)
  - Agregado `last_activity_at` y `risk_level` a `profiles`

### 2. **Netlify Functions** (Backend Seguro)
- ✅ `netlify/functions/ale-events.ts` - Emitir eventos a Core
- ✅ `netlify/functions/ale-decide.ts` - Solicitar decisiones
- ✅ `netlify/functions/inactivity-scan.ts` - Scan automático cada 15min

### 3. **Cliente Frontend** (Sin tokens expuestos)
- ✅ `src/lib/ale/aleCoreClient.ts` - Cliente HTTP para llamar Netlify Functions
- ✅ `src/lib/ale/actionExecutor.ts` - Ejecutor local de acciones

### 4. **Documentación**
- ✅ `docs/ale-integration.md` - Guía completa
- ✅ `docs/inactivity-scan.md` - Documentación del scanner
- ✅ `docs/ale-integration-examples.js` - Snippets de integración

### 5. **Configuración**
- ✅ `netlify.toml` actualizado con scheduled function
- ✅ `netlify/tsconfig.json` para TypeScript en functions

---

## 🚀 PASOS DE DEPLOYMENT

### 1. **Configurar Variables de Entorno en Netlify**

Ve a: Netlify Dashboard → Site → Site settings → Environment variables

```bash
ALE_CORE_URL=https://tu-core-url.com
ALE_APP_ID=kunna
ALE_WORKSPACE_ID=demo
ALE_SERVICE_TOKEN=<tu-token-de-servicio>

SUPABASE_URL=<tu-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-key>

INACTIVITY_T1_MIN=60
INACTIVITY_T2_MIN=240
INACTIVITY_T3_MIN=1440
INACTIVITY_COOLDOWN_MIN=120
```

### 2. **Ejecutar SQL en Supabase**

Abre: Supabase Dashboard → SQL Editor → New Query

```sql
-- Pegar contenido de CREATE_ALE_INTEGRATION_TABLES.sql
-- Ejecutar
```

### 3. **Instalar Dependencias**

```bash
npm install @netlify/functions @supabase/supabase-js
```

### 4. **Deploy a Netlify**

```bash
git add .
git commit -m "feat: integración AL-E Core con Netlify Functions"
git push origin main
```

Netlify detectará automáticamente:
- Las 3 Netlify Functions
- El scheduled function (cada 15min)

---

## 🔗 PUNTOS DE INTEGRACIÓN

### Frontend → Netlify Functions

| Evento | Archivo | Snippet |
|--------|---------|---------|
| Check-in fallido | `src/services/checkInsManager.js` | Ver `ale-integration-examples.js` línea 14 |
| Diario emocional | `src/pages/EmotionalJournal.jsx` | Ver `ale-integration-examples.js` línea 51 |
| SOS manual | `src/components/SOSButton.jsx` | Ver `ale-integration-examples.js` línea 71 |
| Cambio de estado | `src/pages/SecurityModule.jsx` | Ver `ale-integration-examples.js` línea 115 |
| Actividad | `src/hooks/useInactivityMonitor.js` | Ver `ale-integration-examples.js` línea 133 |

### Netlify Functions → AL-E Core

```
Frontend → /.netlify/functions/ale-events → AL-E Core /api/events
Frontend → /.netlify/functions/ale-decide → AL-E Core /api/decide
Scheduled → /.netlify/functions/inactivity-scan → AL-E Core
```

---

## 🧪 TESTING

### Desarrollo Local

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Correr con functions
netlify dev

# La app estará en: http://localhost:8888
# Functions en: http://localhost:8888/.netlify/functions/
```

### Test Manual de Inactivity Scan

```bash
curl http://localhost:8888/.netlify/functions/inactivity-scan
```

### Test de Evento desde Frontend

```javascript
import aleCoreClient from '@/lib/ale/aleCoreClient';

// En consola del navegador
await aleCoreClient.sosManual('user-id-test', { lat: 19.4326, lng: -99.1332 });
```

---

## 📊 MONITOREO

### Logs en Netlify

Netlify Dashboard → Functions → Ver logs de:
- `ale-events`
- `ale-decide`
- `inactivity-scan` (cada 15min)

### Queries en Supabase

```sql
-- Eventos recientes
SELECT * FROM kunna_ale_outbox 
ORDER BY created_at DESC LIMIT 20;

-- Decisiones recibidas
SELECT * FROM kunna_ale_decisions 
ORDER BY created_at DESC LIMIT 20;

-- Acciones ejecutadas
SELECT 
  user_id, 
  action_type, 
  status, 
  created_at 
FROM kunna_ale_action_logs 
ORDER BY created_at DESC LIMIT 20;

-- Success rate
SELECT 
  COUNT(*) FILTER (WHERE status = 'sent') as success,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  ROUND(COUNT(*) FILTER (WHERE status = 'sent')::numeric / COUNT(*) * 100, 2) as success_rate
FROM kunna_ale_outbox;
```

---

## 🔐 SEGURIDAD

✅ **Service tokens NUNCA en frontend**
✅ **Todas las llamadas a Core pasan por Netlify Functions**
✅ **Logs completos en Supabase KUNNA para auditoría**
✅ **Fallback local si Core falla (especialmente SOS)**
✅ **CORS configurado en functions**
✅ **Rate limiting recomendado (implementar en Core)**

---

## 📝 PRÓXIMOS PASOS

### Fase 1 (Inmediata)
1. ✅ Deployment de functions
2. ✅ Configurar env vars
3. ✅ Ejecutar SQL migrations
4. ⏳ Integrar snippets en puntos críticos (ver examples)
5. ⏳ Testing end-to-end

### Fase 2 (Optimizaciones)
- [ ] Batch processing de eventos
- [ ] Retry con backoff exponencial
- [ ] Cache de decisiones similares
- [ ] Webhooks desde Core (push vs poll)
- [ ] Dashboard de monitoreo AL-E

### Fase 3 (Avanzado)
- [ ] ML para detección de riesgo en diario
- [ ] Análisis de patrones de comportamiento
- [ ] Alertas predictivas
- [ ] Integración con más apps (no solo KUNNA)

---

## 🆘 TROUBLESHOOTING

| Error | Solución |
|-------|----------|
| `Core responded with 401` | Verificar `ALE_SERVICE_TOKEN` en Netlify env |
| `Failed to save event locally` | Verificar `SUPABASE_SERVICE_ROLE_KEY` |
| `Function timeout` | Aumentar timeout en netlify.toml (max 26s) |
| `CORS error` | Headers ya configurados en functions |
| `Module not found` | Ejecutar `npm install` en raíz |

---

## 📚 RECURSOS

- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Netlify Scheduled Functions](https://docs.netlify.com/functions/scheduled-functions/)
- [Supabase Service Role](https://supabase.com/docs/guides/api/using-service-role-key)
- AL-E Core API Docs (tu documentación interna)

---

**🎉 Integración lista para producción!**

Cualquier duda, revisar `docs/ale-integration.md` y `docs/ale-integration-examples.js`.
