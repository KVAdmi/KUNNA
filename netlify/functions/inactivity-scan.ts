import { Handler, schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ALE_CORE_URL = process.env.ALE_CORE_URL!;
const ALE_APP_ID = process.env.ALE_APP_ID || 'kunna';
const ALE_WORKSPACE_ID = process.env.ALE_WORKSPACE_ID || 'demo';
const ALE_SERVICE_TOKEN = process.env.ALE_SERVICE_TOKEN!;

// Umbrales de inactividad (en minutos)
const T1_MIN = parseInt(process.env.INACTIVITY_T1_MIN || '60');
const T2_MIN = parseInt(process.env.INACTIVITY_T2_MIN || '240');
const T3_MIN = parseInt(process.env.INACTIVITY_T3_MIN || '1440');
const COOLDOWN_MIN = parseInt(process.env.INACTIVITY_COOLDOWN_MIN || '120');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface InactiveUser {
  user_id: string;
  last_activity_at: string;
  risk_level: 'normal' | 'alert' | 'risk' | 'critical';
  email?: string;
  nombre_completo?: string;
}

async function sendEventToCore(payload: any) {
  const response = await fetch(`${ALE_CORE_URL}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Id': ALE_APP_ID,
      'X-Workspace-Id': ALE_WORKSPACE_ID,
      'Authorization': `Bearer ${ALE_SERVICE_TOKEN}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Core /api/events failed: ${response.status}`);
  }

  return response.json();
}

async function decideWithCore(userId: string, eventId: string, context: any) {
  const response = await fetch(`${ALE_CORE_URL}/api/decide`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Id': ALE_APP_ID,
      'X-Workspace-Id': ALE_WORKSPACE_ID,
      'Authorization': `Bearer ${ALE_SERVICE_TOKEN}`
    },
    body: JSON.stringify({
      user_id: userId,
      event_id: eventId,
      context
    })
  });

  if (!response.ok) {
    throw new Error(`Core /api/decide failed: ${response.status}`);
  }

  return response.json();
}

async function executeActionLocally(userId: string, action: any, decisionId: string) {
  const { action_type, payload } = action;
  let status = 'ok';
  let result: any = {};
  let errorMessage: string | null = null;

  try {
    switch (action_type) {
      case 'send_silent_verification':
        // Crear notificación pendiente para que la app la muestre
        await supabase.from('notifications').insert({
          user_id: userId,
          tipo: 'verificacion_silenciosa',
          mensaje: payload?.message || '¿Estás bien?',
          leida: false
        });
        result = { notification_created: true };
        break;

      case 'alert_trust_circle':
        // Notificar al círculo de confianza
        const { data: circulo } = await supabase
          .from('circulos_confianza')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (circulo) {
          await supabase.from('circulo_messages').insert({
            circulo_id: circulo.id,
            sender_id: userId,
            mensaje: payload?.reason || 'Alerta automática: requiere atención',
            tipo: 'alerta',
            metadata: { automated: true, from_ale_core: true }
          });
          result = { circle_alerted: true };
        }
        break;

      case 'escalate_full_sos':
        // Activar SOS completo
        const token = generateToken();
        await supabase.from('acompanamientos_activos').insert({
          user_id: userId,
          token,
          activo: true,
          tipo: 'sos_auto_ale',
          inicio: new Date().toISOString()
        });
        result = { sos_activated: true, token };
        break;

      case 'start_evidence_recording':
        // Crear flag para que la app inicie grabación
        await supabase.from('ale_events').insert({
          user_id: userId,
          event_type: 'evidence_requested',
          event_data: payload,
          priority: 'critical',
          processed: false
        });
        result = { evidence_flag_created: true };
        break;

      default:
        status = 'pending';
        result = { action_type, payload, note: 'No local executor implemented' };
    }
  } catch (error: any) {
    status = 'fail';
    errorMessage = error.message;
    result = { error: error.message };
  }

  // Registrar en action_logs
  await supabase.from('kunna_ale_action_logs').insert({
    user_id: userId,
    decision_id: decisionId,
    action_type,
    action_payload: payload,
    result,
    status,
    error_message: errorMessage
  });

  return { status, result };
}

function generateToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export const handler: Handler = async (event, context) => {
  console.log('🔍 Inactivity scan started');

  const results = {
    scanned: 0,
    triggered: 0,
    failed: 0,
    details: [] as any[]
  };

  try {
    // 1. Buscar usuarios inactivos
    const thresholds = [T1_MIN, T2_MIN, T3_MIN];
    const cooldownTime = new Date(Date.now() - COOLDOWN_MIN * 60 * 1000).toISOString();

    for (const threshold of thresholds) {
      const inactivityTime = new Date(Date.now() - threshold * 60 * 1000).toISOString();

      const { data: inactiveUsers, error: queryError } = await supabase
        .from('profiles')
        .select('id, last_activity_at, risk_level, email, nombre_completo')
        .lt('last_activity_at', inactivityTime)
        .not('risk_level', 'is', null);

      if (queryError) {
        console.error('Query error:', queryError);
        continue;
      }

      if (!inactiveUsers || inactiveUsers.length === 0) continue;

      results.scanned += inactiveUsers.length;

      for (const user of inactiveUsers) {
        try {
          // Verificar cooldown: no enviar si ya hay evento reciente
          const { data: recentEvents } = await supabase
            .from('kunna_ale_outbox')
            .select('id')
            .eq('user_id', user.id)
            .eq('event_type', 'inactivity')
            .gte('created_at', cooldownTime)
            .limit(1);

          if (recentEvents && recentEvents.length > 0) {
            console.log(`Skipping user ${user.id}: in cooldown`);
            continue;
          }

          const inactiveMinutes = Math.floor(
            (Date.now() - new Date(user.last_activity_at).getTime()) / (60 * 1000)
          );

          // 2. Crear evento
          const eventPayload = {
            user_id: user.id,
            event_type: 'inactivity',
            timestamp: new Date().toISOString(),
            metadata: {
              source: 'system',
              risk_level: user.risk_level || 'normal',
              duration_minutes: inactiveMinutes
            }
          };

          // Guardar en outbox
          const { data: outboxEntry } = await supabase
            .from('kunna_ale_outbox')
            .insert({
              user_id: user.id,
              event_type: 'inactivity',
              payload: eventPayload,
              status: 'sent'
            })
            .select()
            .single();

          // 3. Enviar a Core
          let coreEventId: string | null = null;
          let coreError: string | null = null;

          try {
            const coreEventData = await sendEventToCore(eventPayload);
            coreEventId = coreEventData.event_id || coreEventData.id;

            await supabase
              .from('kunna_ale_outbox')
              .update({ core_event_id: coreEventId, status: 'sent' })
              .eq('id', outboxEntry!.id);

            // 4. Pedir decisión
            const decision = await decideWithCore(user.id, coreEventId, {
              current_risk_level: user.risk_level,
              inactivity_minutes: inactiveMinutes
            });

            // 5. Guardar decisión
            const { data: decisionEntry } = await supabase
              .from('kunna_ale_decisions')
              .insert({
                user_id: user.id,
                core_event_id: coreEventId,
                core_decision_id: decision.decision_id || decision.id,
                actions: decision.actions || []
              })
              .select()
              .single();

            // 6. Ejecutar acciones localmente
            if (decision.actions && decision.actions.length > 0) {
              for (const action of decision.actions) {
                await executeActionLocally(user.id, action, decisionEntry!.id);
              }
            }

            results.triggered++;
            results.details.push({
              user_id: user.id,
              inactive_minutes: inactiveMinutes,
              actions_count: decision.actions?.length || 0
            });

          } catch (coreErr: any) {
            coreError = coreErr.message;
            results.failed++;

            await supabase
              .from('kunna_ale_outbox')
              .update({ status: 'failed', error_message: coreError })
              .eq('id', outboxEntry!.id);

            // FALLBACK: Si es crítico, ejecutar protocolo local
            if (user.risk_level === 'critical' && inactiveMinutes >= T3_MIN) {
              console.log(`FALLBACK: Executing local protocol for critical user ${user.id}`);
              const fallbackAction = {
                action_type: 'alert_trust_circle',
                payload: {
                  reason: `Usuario crítico inactivo por ${inactiveMinutes} minutos (Core offline)`,
                  urgency: 'critical'
                }
              };
              await executeActionLocally(user.id, fallbackAction, 'fallback');
            }
          }

        } catch (userError: any) {
          console.error(`Error processing user ${user.id}:`, userError);
          results.failed++;
        }
      }
    }

    console.log('✅ Inactivity scan completed:', results);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        ...results
      })
    };

  } catch (error: any) {
    console.error('❌ Inactivity scan failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error.message
      })
    };
  }
};

// Scheduled handler (Netlify)
export const scheduledHandler = schedule('*/15 * * * *', handler);
