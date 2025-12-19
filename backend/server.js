const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuración de Mercado Pago
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const MP_KUNNA_PREMIUM_PLAN_ID = process.env.MP_KUNNA_PREMIUM_PLAN_ID;

if (!MP_ACCESS_TOKEN) {
  console.warn('⚠️ Warning: MP_ACCESS_TOKEN no configurado. Endpoints de Mercado Pago no funcionarán.');
}

if (!MP_KUNNA_PREMIUM_PLAN_ID) {
  console.warn('⚠️ Warning: MP_KUNNA_PREMIUM_PLAN_ID no configurado. Suscripciones no funcionarán.');
}

// Configuración JWT
const JITSI_APP_ID = process.env.JITSI_APP_ID || 'zinhaapp';
const JITSI_APP_SECRET = process.env.JITSI_APP_SECRET;

if (!JITSI_APP_SECRET) {
  console.error('❌ Error: Variable de entorno JITSI_APP_SECRET es requerida');
  process.exit(1);
}

// Endpoint para validar PIN y generar JWT
app.post('/api/conference/validate-pin', async (req, res) => {
  try {
    console.log('🔍 Validando PIN - Request:', req.body);
    
    const { pin, room, userName } = req.body;

    if (!room || !userName) {
      return res.status(400).json({
        success: false,
        error: 'room y userName son requeridos'
      });
    }

    let isModerator = false;
    let userEmail = null;

    // Validar PIN si se proporcionó
    if (pin && pin.trim() !== '') {
      console.log('🔑 Validando PIN:', pin);
      
      const { data, error } = await supabase.rpc('consume_moderator_pin', {
        input_pin: pin.trim()
      });

      if (error) {
        console.error('❌ Error en Supabase RPC:', error);
        return res.status(500).json({
          success: false,
          error: 'Error en validación de PIN',
          details: error.message
        });
      }

      console.log('📊 Resultado RPC:', data);

      if (data && data.success) {
        isModerator = true;
        userEmail = data.email || `${userName}@zinha.app`;
        console.log('✅ PIN válido - Usuario es moderador');
      } else {
        console.log('❌ PIN inválido');
        return res.status(401).json({
          success: false,
          error: 'PIN inválido o expirado'
        });
      }
    } else {
      console.log('👤 Sin PIN - Usuario es invitado');
      userEmail = `guest_${Date.now()}@zinha.app`;
    }

    // Generar JWT token
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: JITSI_APP_ID,
      aud: JITSI_APP_ID,
      sub: 'meet.zinha.app',
      room: room,
      iat: now,
      exp: now + (24 * 60 * 60), // 24 horas
      context: {
        user: {
          id: userEmail,
          name: userName,
          email: userEmail,
          moderator: isModerator
        },
        features: {
          livestreaming: isModerator,
          recording: isModerator,
          transcription: false,
          'outbound-call': false
        }
      }
    };

    const token = jwt.sign(payload, JITSI_APP_SECRET);

    console.log('🎟️ JWT generado exitosamente');

    res.json({
      success: true,
      token: token,
      isModerator: isModerator,
      userEmail: userEmail,
      message: isModerator ? 'Acceso como moderador' : 'Acceso como invitado'
    });

  } catch (error) {
    console.error('💥 Error inesperado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ========================================
// MERCADO PAGO ENDPOINTS - SOLO KUNNA
// ========================================

// Crear suscripción KUNNA Premium
app.post('/api/mp/kunna/create-subscription', async (req, res) => {
  try {
    const { payer_email, user_id } = req.body;

    if (!payer_email || !user_id) {
      return res.status(400).json({
        success: false,
        error: 'payer_email y user_id son requeridos'
      });
    }

    if (!MP_ACCESS_TOKEN || !MP_KUNNA_PREMIUM_PLAN_ID) {
      return res.status(500).json({
        success: false,
        error: 'Mercado Pago no configurado en servidor'
      });
    }

    console.log('🔵 Creando suscripción KUNNA para:', payer_email);

    // Crear preapproval (suscripción) con Mercado Pago
    const response = await axios.post(
      'https://api.mercadopago.com/preapproval',
      {
        preapproval_plan_id: MP_KUNNA_PREMIUM_PLAN_ID,
        reason: 'KUNNA Premium - Suscripción Mensual',
        payer_email: payer_email,
        back_url: `${process.env.VITE_APP_URL_PROD || 'https://kunna.app'}/payment-success`,
        external_reference: user_id,
        status: 'pending'
      },
      {
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Suscripción creada:', response.data.id);

    res.json({
      success: true,
      init_point: response.data.init_point,
      subscription_id: response.data.id
    });

  } catch (error) {
    console.error('❌ Error creando suscripción MP:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Error creando suscripción',
      details: error.response?.data || error.message
    });
  }
});

// Webhook de Mercado Pago
app.post('/api/mp/webhook', async (req, res) => {
  try {
    console.log('🔔 Webhook MP recibido:', req.body);

    const { type, data } = req.body;

    // Solo procesar eventos de suscripción
    if (type === 'subscription_preapproval' || type === 'subscription_authorized') {
      const subscriptionId = data.id;

      // Obtener detalles de la suscripción
      const response = await axios.get(
        `https://api.mercadopago.com/preapproval/${subscriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
          }
        }
      );

      const subscription = response.data;
      const userId = subscription.external_reference;
      const payerEmail = subscription.payer_email;
      const status = subscription.status;

      console.log('📊 Suscripción:', {
        id: subscriptionId,
        user_id: userId,
        status: status
      });

      // Solo activar si está autorizada
      if (status === 'authorized' || status === 'approved') {
        // Activar KUNNA Premium en Supabase
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            has_paid: true,
            subscription_status: 'active',
            subscription_id: subscriptionId,
            subscription_type: 'kunna_premium'
          })
          .eq('id', userId);

        if (updateError) {
          console.error('❌ Error actualizando perfil:', updateError);
        } else {
          console.log('✅ Usuario activado:', userId);
        }

        // Registrar pago (si existe tabla payments)
        try {
          await supabase
            .from('payments')
            .insert({
              user_id: userId,
              subscription_id: subscriptionId,
              product_type: 'kunna',
              amount: 99,
              currency: 'MXN',
              status: 'approved',
              payer_email: payerEmail,
              payment_method: 'mercadopago'
            });
        } catch (paymentError) {
          console.log('⚠️ Tabla payments no existe o error:', paymentError.message);
        }
      }
    }

    // Responder 200 siempre para que MP no reintente
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('❌ Error en webhook MP:', error.message);
    res.status(200).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend ejecutándose en http://localhost:${PORT}`);
  console.log(`📍 Endpoint PIN: http://localhost:${PORT}/api/conference/validate-pin`);
  console.log(`💳 Endpoint MP Crear Suscripción: http://localhost:${PORT}/api/mp/kunna/create-subscription`);
  console.log(`🔔 Endpoint MP Webhook: http://localhost:${PORT}/api/mp/webhook`);
  console.log(`⚙️  MP Access Token configurado: ${MP_ACCESS_TOKEN ? '✅' : '❌'}`);
  console.log(`📦 MP Plan ID configurado: ${MP_KUNNA_PREMIUM_PLAN_ID ? '✅' : '❌'}`);
});
