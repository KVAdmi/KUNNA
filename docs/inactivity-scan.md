# Inactivity Scan - Netlify Scheduled Function

## Función

Detecta usuarias inactivas y emite eventos a AL-E Core para análisis y decisión.

## Ejecución

- **Frecuencia:** Cada 15 minutos (cron: `*/15 * * * *`)
- **Tipo:** Netlify Scheduled Function
- **Path:** `/.netlify/functions/inactivity-scan`

## Umbrales Configurables

```bash
INACTIVITY_T1_MIN=60      # 1 hora
INACTIVITY_T2_MIN=240     # 4 horas
INACTIVITY_T3_MIN=1440    # 24 horas
INACTIVITY_COOLDOWN_MIN=120  # No enviar más eventos en 2 horas
```

## Flujo

1. **Query:** Buscar usuarios con `last_activity_at < now() - threshold`
2. **Filtro:** Excluir usuarios con evento reciente (cooldown)
3. **Emit:** Enviar evento `inactivity` a AL-E Core
4. **Decide:** Solicitar decisión a Core
5. **Execute:** Ejecutar acciones localmente en KUNNA
6. **Log:** Registrar todo en Supabase KUNNA

## Fallback Crítico

Si AL-E Core no responde Y usuario está en `risk_level='critical'`:
- Ejecutar protocolo local: `alert_trust_circle`
- No esperar respuesta de Core
- Garantizar protección aunque Core esté caído

## Acciones Locales

Implementadas en `actionExecutor.ts`:
- `send_silent_verification` → Crear notificación discreta
- `alert_trust_circle` → Mensaje urgente al círculo
- `escalate_full_sos` → Activar SOS completo con tracking
- `start_evidence_recording` → Flag para iniciar grabación

## Pruebas Manuales

### Desarrollo Local

```bash
# Instalar deps
npm install @netlify/functions @supabase/supabase-js

# Correr Netlify Dev
netlify dev

# Invocar función
curl http://localhost:8888/.netlify/functions/inactivity-scan
```

### Producción

Netlify ejecuta automáticamente según schedule. Ver logs en:
- Netlify Dashboard → Functions → inactivity-scan → Logs

## Respuesta de la Función

```json
{
  "ok": true,
  "scanned": 150,
  "triggered": 3,
  "failed": 0,
  "details": [
    {
      "user_id": "uuid",
      "inactive_minutes": 180,
      "actions_count": 2
    }
  ]
}
```

## Monitoreo

Verificar en Supabase KUNNA:

```sql
-- Eventos recientes enviados
SELECT * FROM kunna_ale_outbox 
WHERE event_type = 'inactivity' 
ORDER BY created_at DESC LIMIT 10;

-- Decisiones recibidas
SELECT * FROM kunna_ale_decisions 
ORDER BY created_at DESC LIMIT 10;

-- Acciones ejecutadas
SELECT * FROM kunna_ale_action_logs 
ORDER BY created_at DESC LIMIT 10;
```

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Core responded with 401` | Token inválido/expirado | Actualizar `ALE_SERVICE_TOKEN` |
| `Failed to save event locally` | Problema con Supabase | Verificar `SUPABASE_SERVICE_ROLE_KEY` |
| `No se encontró círculo` | Usuario sin círculo configurado | Normal, acción skip |
| `Timeout` | Core lento/caído | Fallback automático activado |

## Métricas Recomendadas

- **Success Rate:** `triggered / (triggered + failed)`
- **Avg Response Time:** Tiempo promedio de Core
- **Fallback Rate:** Cuántas veces se ejecutó protocolo local

## Optimizaciones Futuras

- [ ] Batch processing (enviar múltiples eventos en un call)
- [ ] Retry con backoff exponencial para failures
- [ ] Cache de respuestas de Core (para eventos similares)
- [ ] Webhooks desde Core (push en lugar de poll)
