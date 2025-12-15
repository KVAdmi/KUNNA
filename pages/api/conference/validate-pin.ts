// pages/api/conference/validate-pin.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { JitsiTokenPayload, ValidatePinRequest, ValidatePinResponse } from '../../../src/types/jitsi';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

const JITSI_APP_ID = 'zinha';
const JITSI_APP_SECRET = process.env.JITSI_APP_SECRET; // Agregar al .env

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidatePinResponse>
) {
  console.log('🔥 API validate-pin llamada:', { method: req.method, body: req.body });
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { room, name, pin } = req.body as ValidatePinRequest;
  
  if (!room || !name || !pin) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    // Validar PIN en Supabase
    const { data: rooms, error: dbError } = await supabase
      .from('jitsi_rooms')
      .select('*')
      .eq('room_id', room)
      .eq('pin', pin)
      .single();

    if (dbError || !rooms) {
      console.error('❌ Error validando PIN:', dbError);
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    // Generar JWT para Jitsi
    const payload: JitsiTokenPayload = {
      iss: JITSI_APP_ID,
      aud: JITSI_APP_ID,
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hora
      sub: 'meet.zinha.app',
      room: room,
      context: {
        user: {
          id: name,
          name: name,
          avatar: '',
          moderator: true
        }
      }
    };

    const token = jwt.sign(payload, JITSI_APP_SECRET || 'your-default-secret');

    return res.status(200).json({ token });

  } catch (error) {
    console.error('❌ Error interno:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
