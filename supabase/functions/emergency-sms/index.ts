/// <reference lib="deno.ns" />
// supabase/functions/emergency-sms/index.ts
// Edge Function para enviar SMS de emergencia con Twilio

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

serve(async (req: Request) => {
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { contacts, message, userId, emergencyId } = await req.json();

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return new Response(JSON.stringify({ error: 'No hay contactos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      return new Response(JSON.stringify({ error: 'Servicio no configurado' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const results = [];
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    for (const contacto of contacts) {
      if (!contacto.telefono) continue;

      try {
        let formattedPhone = contacto.telefono.replace(/\D/g, '');
        if (formattedPhone.length === 10) {
          formattedPhone = '+52' + formattedPhone;
        } else if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+' + formattedPhone;
        }

        const formData = new URLSearchParams();
        formData.append('To', formattedPhone);
        formData.append('From', TWILIO_PHONE_NUMBER);
        formData.append('Body', message);

        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        if (twilioResponse.ok) {
          const data = await twilioResponse.json();
          results.push({
            contacto: contacto.nombre,
            phone: formattedPhone,
            success: true,
            sid: data.sid
          });
        } else {
          const error = await twilioResponse.text();
          results.push({
            contacto: contacto.nombre,
            phone: formattedPhone,
            success: false,
            error
          });
        }

        // Pequeña pausa entre SMS
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        results.push({
          contacto: contacto.nombre,
          phone: contacto.telefono,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    console.log(`SMS enviados: ${successCount}/${results.length}`);

    return new Response(JSON.stringify({
      success: true,
      results,
      totalSent: successCount,
      totalFailed: results.length - successCount
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error en emergency-sms:', error);
    
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
