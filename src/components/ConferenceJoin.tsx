import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Props = {
  room: string;
  onContinue: (args: { displayName: string; isModerator: boolean }) => void;
};

export default function ConferenceJoin({ room, onContinue }: Props) {
  const [displayName, setDisplayName] = useState('Invitada Zinha');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleEnter() {
    setErr(null);
    setLoading(true);

    try {
      // Pide permisos ANTES de montar Jitsi (mejor UX en WebView)
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .catch(() => { throw new Error('Permisos de micrófono/cámara denegados'); });

      let isModerator = false;

      if (pin.trim()) {
        // Llamar RPC: consume_moderator_pin(pin, room)
        const { data, error } = await supabase.rpc('consume_moderator_pin', {
          p_pin: pin.trim(),
          p_room: room,
        });

        if (error) throw error;
        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error('El PIN es inválido, ya usado o caducado.');
        }
        isModerator = true;
      }

      onContinue({ displayName: displayName.trim() || 'Invitada Zinha', isModerator });
    } catch (e: any) {
      setErr(e.message || 'No se pudo continuar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-84px)] bg-gradient-to-b from-[#f6e7f6] to-[#f3ecff] px-5 py-8">
      <div className="max-w-xl mx-auto bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#3b2a40]">Bienvenida a la sala de conferencias</h1>
        <p className="mt-2 text-[#6d5e74]">{room.replaceAll('-', ' ')}</p>

        <ul className="mt-6 space-y-3 text-[#3b2a40]">
          <li>• Respeta los tiempos del expositor.</li>
          <li>• Mantén tu micrófono en mute cuando no hables.</li>
          <li>• Evita compartir datos sensibles.</li>
        </ul>

        <label className="block mt-8 text-sm text-[#6d5e74]">Tu nombre para la sala</label>
        <input
          className="mt-2 w-full rounded-xl border border-[#e7dff1] bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9bd265]"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          inputMode="text"
        />

        <label className="block mt-6 text-sm text-[#6d5e74]">PIN de moderador (opcional)</label>
        <input
          className="mt-2 w-full rounded-xl border border-[#e7dff1] bg-white/80 px-4 py-3 tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[#9bd265]"
          value={pin}
          onChange={e => setPin(e.target.value.toUpperCase())}
          placeholder="ZINHA-XXXX-YYYY"
          inputMode="text"
        />

        {err && <div className="mt-4 text-[#b23b3b]">{err}</div>}

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleEnter}
            disabled={loading}
            className="flex-1 rounded-2xl bg-[#9BD265] text-[#1c2b23] font-semibold py-3 shadow-md active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar a la sala'}
          </button>
          <a
            href={import.meta.env.VITE_JITSI_RETURN_PATH || '/perfil'}
            className="flex-1 rounded-2xl border border-[#e7dff1] bg-white/60 text-[#6d5e74] font-semibold py-3 text-center hover:bg-white"
          >
            Cancelar
          </a>
        </div>
      </div>
    </div>
  );
}
