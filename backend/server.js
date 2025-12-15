const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend ejecutándose en http://localhost:${PORT}`);
  console.log(`📍 Endpoint PIN: http://localhost:${PORT}/api/conference/validate-pin`);
});
