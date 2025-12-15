// Endpoint alternativo que usa Supabase para validar PINs
// Renombra a host-token.js cuando quieras usarlo
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Necesita service role para llamar funciones
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { room, name, pin } = req.body ?? {};
  
  if (!room || !name || !pin) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    // Verificar PIN usando la función de Supabase
    const { data: isValid, error } = await supabase
      .rpc('verify_jitsi_pin', { 
        room_name: room, 
        pin_value: pin 
      });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!isValid) {
      return res.status(403).json({ error: 'PIN inválido o sala no encontrada' });
    }

    // PIN válido, generar JWT
    const payload = {
      aud: 'jitsi',
      iss: process.env.JITSI_APP_ID,
      sub: 'meet.zinha.app',
      room,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1h
      context: { 
        user: { 
          name, 
          moderator: true 
        } 
      }
    };

    const token = jwt.sign(payload, process.env.JITSI_APP_SECRET);
    return res.json({ jwt: token });
    
  } catch (error) {
    console.error('Error validating PIN:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
