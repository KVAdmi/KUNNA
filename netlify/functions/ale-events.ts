import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ALE_CORE_URL = process.env.ALE_CORE_URL!;
const ALE_APP_ID = process.env.ALE_APP_ID || 'kunna';
const ALE_WORKSPACE_ID = process.env.ALE_WORKSPACE_ID || 'demo';
const ALE_SERVICE_TOKEN = process.env.ALE_SERVICE_TOKEN!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface EventPayload {
  user_id: string;
  event_type: 'checkin_failed' | 'inactivity' | 'diary_entry' | 'state_change' | 'sos_manual';
  timestamp: string;
  metadata: {
    source: string;
    risk_level: 'normal' | 'alert' | 'risk' | 'critical';
    text?: string;
    duration_minutes?: number;
    location?: { lat: number; lng: number };
  };
}

export const handler: Handler = async (event) => {
  // CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const payload: EventPayload = JSON.parse(event.body || '{}');

    // Validación básica
    if (!payload.user_id || !payload.event_type) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing user_id or event_type' })
      };
    }

    // 1. Guardar en outbox local (KUNNA Supabase)
    const { data: outboxEntry, error: outboxError } = await supabase
      .from('kunna_ale_outbox')
      .insert({
        user_id: payload.user_id,
        event_type: payload.event_type,
        payload: payload,
        status: 'sent'
      })
      .select()
      .single();

    if (outboxError) {
      console.error('Error saving to outbox:', outboxError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to save event locally' })
      };
    }

    // 2. Llamar a AL-E Core
    let coreEventId: string | null = null;
    let coreError: string | null = null;

    try {
      const coreResponse = await fetch(`${ALE_CORE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': ALE_APP_ID,
          'X-Workspace-Id': ALE_WORKSPACE_ID,
          'Authorization': `Bearer ${ALE_SERVICE_TOKEN}`
        },
        body: JSON.stringify(payload)
      });

      if (coreResponse.ok) {
        const coreData = await coreResponse.json();
        coreEventId = coreData.event_id || coreData.id;
        
        // Actualizar outbox con event_id de Core
        await supabase
          .from('kunna_ale_outbox')
          .update({ 
            core_event_id: coreEventId,
            status: 'sent',
            updated_at: new Date().toISOString()
          })
          .eq('id', outboxEntry.id);
      } else {
        const errorText = await coreResponse.text();
        coreError = `Core responded with ${coreResponse.status}: ${errorText}`;
        
        // Marcar como failed
        await supabase
          .from('kunna_ale_outbox')
          .update({ 
            status: 'failed',
            error_message: coreError,
            updated_at: new Date().toISOString()
          })
          .eq('id', outboxEntry.id);
      }
    } catch (fetchError: any) {
      coreError = fetchError.message;
      
      // Marcar como retry para intentos posteriores
      await supabase
        .from('kunna_ale_outbox')
        .update({ 
          status: 'retry',
          error_message: coreError,
          updated_at: new Date().toISOString()
        })
        .eq('id', outboxEntry.id);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ok: true,
        outbox_id: outboxEntry.id,
        core_event_id: coreEventId,
        core_error: coreError
      })
    };

  } catch (error: any) {
    console.error('Error in ale-events function:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
