/// <reference lib="deno.ns" />
// supabase/functions/emergency-call/index.ts
// Edge Function para hacer llamadas de emergencia con Twilio

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');
const TWILIO_TWIML_URL = Deno.env.get('TWILIO_TWIML_URL');

serve(async (req: Request) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Obtener datos del request
    const { phoneNumber, message, userId, emergencyId } = await req.json();

    if (!phoneNumber || !message) {
      return new Response(JSON.stringify({ error: 'Faltan parámetros' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validar configuración de Twilio
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Twilio no configurado correctamente');
      return new Response(JSON.stringify({ error: 'Servicio no configurado' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Formatear número de teléfono (agregar +52 si es México y no tiene código)
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = '+52' + formattedPhone;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    console.log(`Haciendo llamada a ${formattedPhone}`);

    // Crear URL de TwiML con el mensaje
    const twimlUrl = TWILIO_TWIML_URL || 'https://kunna.com/twiml/emergency';

    // Hacer llamada con Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', formattedPhone);
    formData.append('From', TWILIO_PHONE_NUMBER);
    formData.append('Url', `${twimlUrl}?message=${encodeURIComponent(message)}`);
    formData.append('StatusCallback', `https://kunna.com/api/call-status`);
    formData.append('StatusCallbackMethod', 'POST');

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!twilioResponse.ok) {
      const errorText = await twilioResponse.text();
      console.error('Error de Twilio:', errorText);
      throw new Error(`Twilio error: ${twilioResponse.status}`);
    }

    const twilioData = await twilioResponse.json();

    console.log('Llamada iniciada:', twilioData.sid);

    // Registrar en Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase
      .from('emergency_calls_log')
      .insert([{
        user_id: userId,
        emergency_id: emergencyId,
        phone_number: formattedPhone,
        call_sid: twilioData.sid,
        status: 'initiated',
        twilio_response: twilioData
      }]);

    return new Response(JSON.stringify({
      success: true,
      callSid: twilioData.sid,
      status: twilioData.status,
      message: 'Llamada iniciada correctamente'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error en emergency-call:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
