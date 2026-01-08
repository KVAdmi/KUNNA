# 🧠 KUNNA CORE ENGINE (KCE)

## ¿QUÉ ES?

El **Kunna Core Engine** es el **cerebro de decisiones** de KUNNA. Es un sistema de reglas que:
- Recibe eventos de toda la app
- Aplica reglas determinísticas
- Decide qué acciones tomar
- Orquesta la escalera de protección 🟢🟡🔴

**Principio fundamental:** KCE DECIDE, no ejecuta.

---

## 🏗️ ARQUITECTURA

```
┌─────────────────────────────────────────────────────────┐
│                    EVENTOS (entrada)                     │
├─────────────────────────────────────────────────────────┤
│  • Check-in fallido                                      │
│  • Inactividad detectada                                 │
│  • Entrada de diario con palabras gatillo                │
│  • SOS manual                                            │
│  • Cambios de estado                                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   KUNNA CORE ENGINE   │
        │   (kunnaCoreEngine)   │
        └──────────┬────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   EVALUADOR DE       │
        │   REGLAS (kceRules)  │
        └──────────┬────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   DECISIÓN           │
        │   (KCEDecision)      │
        └──────────┬────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   EXECUTOR           │
        │   (kceExecutor)      │
        └──────────┬────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                    ACCIONES (salida)                     │
├─────────────────────────────────────────────────────────┤
│  • Verificación silenciosa                               │
│  • Alerta círculo de confianza                          │
│  • SOS completo + evidencia                             │
│  • Tracking GPS intensivo                               │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 COMPONENTES

### 1. **kceTypes.ts** - Contratos de datos
Define todos los tipos TypeScript:
- `KCEEvent` - Evento de entrada
- `KCEAction` - Acción a ejecutar
- `KCEDecision` - Decisión tomada
- `RiskLevel` - Niveles de riesgo (normal, alert, risk, critical)
- `UserSOSState` - Estados de la escalera (observing, verifying, circle_alerted, full_sos)

### 2. **kceRules.ts** - Reglas de decisión
Contiene las 3 reglas iniciales:

#### Regla 1: `checkin_failed_twice`
**Condición:** 2 check-ins fallidos en 120 minutos
**Acción:** Verificación silenciosa
**Nivel:** alert

#### Regla 2: `inactivity_plus_diary_risk`
**Condición:** Inactividad + entrada de diario con palabras gatillo (miedo, no puedo, ayuda, etc.)
**Acción:** Alerta al círculo de confianza
**Nivel:** risk

#### Regla 3: `critical_or_manual_sos`
**Condición:** SOS manual O evento con risk_level=critical
**Acciones:**
- Escalar a SOS completo
- Iniciar grabación de evidencia
- Alertar círculo con tracking link
**Nivel:** critical

### 3. **kceStateStore.ts** - Gestión de estados
- Mantiene el estado actual de cada usuario (observing → verifying → circle_alerted → full_sos)
- Almacena historial de eventos por usuario (ventana de 120 minutos)
- **Regla crítica:** No se pueden saltar niveles (excepto resetear a observing)

### 4. **kunnaCoreEngine.ts** - Motor principal
- Procesa eventos
- Aplica reglas en orden de prioridad
- Genera decisiones
- Actualiza estados de usuario
- Registra todo en auditoría

### 5. **kceLogger.ts** - Auditoría
- Persiste cada decisión en base de datos (tabla `ale_events` con type=`kce_decision`)
- Mantiene cache en memoria como fallback
- Permite consultar historial de decisiones por usuario

### 6. **kceExecutor.ts** - Ejecutor de acciones
Ejecuta las acciones decididas por el KCE:
- `send_silent_verification` - Envía notificación de verificación al usuario
- `alert_trust_circle` - Alerta al círculo con mensaje en chat
- `escalate_full_sos` - Crea sesión SOS con tracking
- `start_evidence_recording` - Activa grabación continua
- `stop_escalation` - Detiene todos los procesos

### 7. **kceEventsClient.ts** - Cliente simplificado
API amigable para emitir eventos desde cualquier parte de la app:

```typescript
import { kceEvents } from '@/core/kce';

// Helpers disponibles
await kceEvents.checkInFailed(userId, context);
await kceEvents.checkInCompleted(userId, context);
await kceEvents.inactivityDetected(userId, minutes);
await kceEvents.diaryEntry(userId, content, mood);
await kceEvents.sosManual(userId, triggerMethod);
await kceEvents.confirmSafe(userId);
```

---

## 🔌 INTEGRACIONES ACTUALES

### ✅ Diario Emocional (EmotionalJournal.jsx)
Cada vez que se guarda una entrada de diario, se emite evento `diary_entry` con el contenido.
El KCE analiza palabras gatillo y combina con eventos de inactividad.

### ✅ Monitor de Inactividad (useInactivityMonitor hook)
Hook activado en App.jsx que:
- Detecta inactividad después de 30 minutos
- Emite evento `inactivity` automáticamente
- Se resetea con cualquier interacción del usuario

### ✅ Check-ins Manager (checkInsManager service)
Servicio que:
- Carga salidas programadas al inicializar
- Configura temporizadores para cada check-in
- Emite `checkin_failed` si no se completa a tiempo
- Emite `checkin_completed` cuando se confirma

---

## 🚀 CÓMO USAR

### Emitir un evento desde cualquier componente:

```typescript
import { kceEvents } from '@/core/kce';

// En un componente
const handleSOS = async () => {
  await kceEvents.sosManual(user.id, 'button');
  // KCE automáticamente procesará y ejecutará acciones
};
```

### Obtener estado del usuario:

```typescript
import { kceEvents } from '@/core/kce';

const state = kceEvents.getUserState(userId);
console.log(state.current_state); // "observing", "verifying", etc.
```

### Confirmar que el usuario está bien:

```typescript
import { kceEvents } from '@/core/kce';

await kceEvents.confirmSafe(userId);
// Resetea estado a "observing"
```

---

## 📊 FLUJO DE EJEMPLO

### Escenario: Check-ins fallidos

1. Usuario programa una salida a las 8pm con check-ins a [30min, 60min, 120min]
2. A las 8:30pm: check-in de 30min no completado
   - `checkInsManager` emite `checkin_failed`
   - KCE procesa pero 1 fallo no es suficiente
   - Estado: `observing`
3. A las 9:00pm: check-in de 60min no completado
   - `checkInsManager` emite `checkin_failed`
   - KCE detecta **2 fallos en 120 minutos** → Regla 1
   - KCE genera decisión con acción `send_silent_verification`
   - Estado: `verifying`
   - Executor envía notificación: "¿Estás bien?"
4. Usuario responde "Sí, estoy bien":
   - App llama `kceEvents.confirmSafe(userId)`
   - Estado: `observing` (reseteo)
5. Si NO responde en 3 minutos:
   - Otro evento se emite (timeout)
   - KCE escala a `alert_trust_circle`
   - Estado: `circle_alerted`
   - Executor envía mensaje al círculo

---

## 🔐 PERSISTENCIA

Todas las decisiones se guardan en:
- **Tabla:** `ale_events`
- **Tipo:** `event_type = 'kce_decision'`
- **Datos:** `event_data` contiene toda la decisión (regla aplicada, acciones, nivel de riesgo)

Esto permite:
- Auditoría completa
- Análisis de patrones
- Compliance legal
- Debug de comportamiento

---

## 🎯 PRÓXIMOS PASOS (POST-RELEASE 1)

### Release 2:
- [ ] Agregar regla para detección de zonas peligrosas (geofencing)
- [ ] Regla para cambios bruscos de humor en diario
- [ ] Integración con notificaciones push reales
- [ ] SMS a círculo en casos críticos

### Release 3:
- [ ] Aprendizaje de patrones personales por usuario
- [ ] Ajuste automático de umbrales según comportamiento
- [ ] Integración con sensores del dispositivo (acelerómetro, etc.)

---

## ⚠️ REGLAS DE ORO

1. **KCE nunca ejecuta hardware** - Solo decide qué hacer
2. **Todas las reglas son determinísticas** - No hay ML en V1
3. **La escalera no se salta niveles** - Salvo reseteo a observing
4. **Todo queda auditado** - Sin excepciones
5. **El usuario siempre puede confirmar que está bien** - Resetea todo

---

## 🧪 TESTING

Para probar el KCE sin esperar eventos reales:

```typescript
import { kceEvents } from '@/core/kce';

// Simular check-in fallido
await kceEvents.checkInFailed('user-id-test', 'Test 1');
await kceEvents.checkInFailed('user-id-test', 'Test 2');
// Debería disparar verificación silenciosa

// Verificar estado
const state = kceEvents.getUserState('user-id-test');
console.log(state); // { current_state: "verifying", ... }

// Simular SOS manual
await kceEvents.sosManual('user-id-test', 'test');
// Debería escalar a full_sos
```

---

## 📝 LOGS Y DEBUG

El KCE genera logs claros en consola:

```
🚀 Kunna Core Engine iniciado
📥 KCE: Procesando evento checkin_failed de usuario abc-123
✅ KCE: Regla aplicada → checkin_failed_twice
📤 KCE: Decisión generada con 1 acción(es)
🔔 Executor: Verificación silenciosa → Usuario abc-123
💾 KCE: Decisión def-456 persistida
```

---

## 🎉 RESULTADO FINAL

Con el KCE implementado, KUNNA ahora:

✅ Detecta patrones de riesgo automáticamente
✅ Escala protección sin que la usuaria piense
✅ Deja evidencia auditable de cada decisión
✅ Respeta la escalera 🟢🟡🔴 sin saltar pasos
✅ Permite reseteo manual cuando todo está bien

**Kunna ya no es una app. Es un sistema.**
