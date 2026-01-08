import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ALE_CORE_URL = process.env.ALE_CORE_URL!;
const ALE_APP_ID = process.env.ALE_APP_ID || 'kunna';
const ALE_WORKSPACE_ID = process.env.ALE_WORKSPACE_ID || 'demo';
const ALE_SERVICE_TOKEN = process.env.ALE_SERVICE_TOKEN!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface DecideRequest {
  user_id: string;
  event_id: string;
  context?: Record<string, any>;
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
    const payload: DecideRequest = JSON.parse(event.body || '{}');

    if (!payload.user_id || !payload.event_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing user_id or event_id' })
      };
    }

    // Llamar a AL-E Core /api/decide
    const coreResponse = await fetch(`${ALE_CORE_URL}/api/decide`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Id': ALE_APP_ID,
        'X-Workspace-Id': ALE_WORKSPACE_ID,
        'Authorization': `Bearer ${ALE_SERVICE_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!coreResponse.ok) {
      const errorText = await coreResponse.text();
      throw new Error(`Core responded with ${coreResponse.status}: ${errorText}`);
    }

    const decision = await coreResponse.json();

    // Guardar decisión en Supabase KUNNA
    const { data: decisionEntry, error: decisionError } = await supabase
      .from('kunna_ale_decisions')
      .insert({
        user_id: payload.user_id,
        core_event_id: payload.event_id,
        core_decision_id: decision.decision_id || decision.id,
        actions: decision.actions || []
      })
      .select()
      .single();

    if (decisionError) {
      console.error('Error saving decision:', decisionError);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ok: true,
        decision_id: decisionEntry?.id,
        core_decision_id: decision.decision_id || decision.id,
        actions: decision.actions || []
      })
    };

  } catch (error: any) {
    console.error('Error in ale-decide function:', error);
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
