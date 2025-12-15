// JWT Generator para Jitsi después de validar PIN
// Este código debe ejecutarse en el backend, no en el front-end

import jwt from 'jsonwebtoken';

const JITSI_APP_ID = 'zinha';
const JITSI_APP_SECRET = 'TU_SECRET_AQUI_DEBE_COINCIDIR_CON_PROSODY'; // Mismo que en Prosody

export function generateJitsiJWT(userId: string, userName: string, roomName: string, isModerator: boolean) {
  const payload = {
    iss: JITSI_APP_ID,
    aud: JITSI_APP_ID,
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hora
    sub: 'meet.zinha.app',
    room: roomName,
    context: {
      user: {
        id: userId,
        name: userName,
        avatar: '',
        email: '',
        moderator: isModerator ? 'true' : 'false'
      },
      features: {
        livestreaming: isModerator ? 'true' : 'false',
        recording: isModerator ? 'true' : 'false',
        transcription: isModerator ? 'true' : 'false',
        "outbound-call": isModerator ? 'true' : 'false'
      }
    }
  };

  return jwt.sign(payload, JITSI_APP_SECRET, { algorithm: 'HS256' });
}

// Ejemplo de uso en API endpoint:
// POST /api/conference/join
// Body: { pin: "ZINHA-123", room: "sala1", userName: "Ana" }
// Response: { jwt: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...", isModerator: true }
