// /api/jitsi/host-token
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { room, name, pin } = req.body;

    // Validar PIN de moderador
    const validPin = process.env.JITSI_HOST_PIN || 'zinha2024';
    if (pin !== validPin) {
      return res.status(403).json({ message: 'PIN incorrecto' });
    }

    // Validar campos requeridos
    if (!room || !name) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    // Configuración JWT para Jitsi
    const appId = process.env.JITSI_APP_ID || 'appzinha';
    const appSecret = process.env.JITSI_APP_SECRET || 'your-secret-key';

    const payload = {
      aud: 'jitsi',
      iss: appId,
      sub: 'meet.zinha.app',
      room: room,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hora
      context: {
        user: {
          name: name,
          moderator: true,
          avatar: '', // opcional
          email: '', // opcional
        },
        features: {
          livestreaming: true,
          recording: true,
          transcription: false,
        },
      },
    };

    const token = jwt.sign(payload, appSecret, { algorithm: 'HS256' });

    return res.status(200).json({ jwt: token });
  } catch (error) {
    console.error('[JITSI] Error generando token:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
