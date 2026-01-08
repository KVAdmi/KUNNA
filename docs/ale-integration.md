# Integración KUNNA + AL-E Core

## Arquitectura

```
KUNNA App (Frontend)
      ↓
Netlify Functions (Backend)
      ↓ HTTP
AL-E Core (Multi-App)
```

**Seguridad:** Service tokens NUNCA en frontend. Solo en Netlify env vars.

## Variables de Entorno (Netlify)

```bash
ALE_CORE_URL=https://tu-core.com
ALE_APP_ID=kunna
ALE_WORKSPACE_ID=demo
ALE_SERVICE_TOKEN=<tu-token-servicio>
SUPABASE_URL=<tu-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-key>

# Umbrales inactividad (minutos)
INACTIVITY_T1_MIN=60
INACTIVITY_T2_MIN=240
INACTIVITY_T3_MIN=1440
INACTIVITY_COOLDOWN_MIN=120
```

## Uso desde Frontend

```typescript
import aleCoreClient from '@/lib/ale/aleCoreClient';
import actionExecutor from '@/lib/ale/actionExecutor';

// 1. Emitir evento
const { core_event_id } = await aleCoreClient.sosManual(userId, { lat, lng });

// 2. Pedir decisión
const { actions } = await aleCoreClient.decide({
  user_id: userId,
  event_id: core_event_id,
  context: { current_risk: 'critical' }
});

// 3. Ejecutar acciones
await actionExecutor.execute(userId, actions);
```

## Helpers Específicos

```typescript
// Check-in fallido
await aleCoreClient.checkInFailed(userId, 'Salida programada no confirmada');

// Inactividad
await aleCoreClient.inactivityDetected(userId, 120, 'alert');

// Diario emocional
await aleCoreClient.diaryEntry(userId, content, 'risk');

// SOS manual
await aleCoreClient.sosManual(userId, location);

// Cambio de estado
await aleCoreClient.stateChange(userId, 'risk');
```

## Scan Automático de Inactividad

Netlify ejecuta cada 15 minutos:
- Busca usuarios inactivos según umbrales
- Emite eventos a AL-E Core
- Ejecuta acciones devueltas localmente
- Fallback: Si Core falla + usuario crítico → ejecutar protocolo local

## Logs y Auditoría

Todas las operaciones se registran en Supabase KUNNA:
- `kunna_ale_outbox`: Eventos enviados
- `kunna_ale_decisions`: Decisiones recibidas
- `kunna_ale_action_logs`: Acciones ejecutadas

## Desarrollo Local

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Correr con functions
netlify dev

# Invocar manualmente inactivity-scan
curl http://localhost:8888/.netlify/functions/inactivity-scan
```

## Tablas SQL

Ejecutar `CREATE_ALE_INTEGRATION_TABLES.sql` en Supabase KUNNA SQL Editor.
