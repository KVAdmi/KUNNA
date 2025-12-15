import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import JitsiLogoOverlay from './JitsiLogoOverlay';
import { loadJitsiApiOnce } from '../utils/jitsi';

const JITSI_DOMAIN = (import.meta as any).env.VITE_JITSI_DOMAIN!;
const RETURN_PATH = (import.meta as any).env.VITE_JITSI_RETURN_PATH || '/perfil';

// ---- Configura tu Supabase (o usa el que ya tengas centralizado)
const supabase = createClient(
  (import.meta as any).env.VITE_SUPABASE_URL!,
  (import.meta as any).env.VITE_SUPABASE_ANON_KEY!
);

type Props = {
  room: string;
  displayName: string;
  // Si NO pasas moderatorPin, es invitada. Si pasas PIN, valida contra Supabase
  moderatorPin?: string; 
};

export default function JitsiStage({ room, displayName, moderatorPin }: Props) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);
  const [state, setState] = useState<'idle' | 'validating' | 'ready' | 'error'>('idle');
  const [isModerator, setIsModerator] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1) Permisos cam/mic antes de montar
  useEffect(() => {
    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch {
        setState('error');
        setErrorMsg('Necesitas permitir micrófono y cámara para entrar.');
      }
    })();
  }, []);

  // 2) Validar PIN (si viene)
  useEffect(() => {
    (async () => {
      if (state === 'error') return;

      if (moderatorPin) {
        try {
          setState('validating');
          const { data, error } = await supabase.rpc('consume_moderator_pin', {
            p_pin: moderatorPin,
            p_room: room,
          });

          if (error) throw error;
          if (!data?.length) {
            setState('error');
            setErrorMsg('PIN inválido, ya usado o caducado.');
            return;
          }
          setIsModerator(true);
          setState('ready');
        } catch (e: any) {
          setState('error');
          setErrorMsg(e?.message || 'Error validando PIN.');
        }
      } else {
        // sin pin => invitada
        setIsModerator(false);
        setState('ready');
      }
    })();
  }, [moderatorPin, room, state]);

  // 3) Montar Jitsi cuando todo esté ready
  useEffect(() => {
    if (state !== 'ready' || !containerRef.current) return;

    let disposed = false;

    (async () => {
      try {
        await loadJitsiApiOnce(JITSI_DOMAIN);
        if (disposed) return;

        // @ts-ignore
        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: room,
          parentNode: containerRef.current,
          userInfo: { displayName },
          lang: 'es',
          configOverwrite: {
            prejoinConfig: { enabled: false },
            enableWelcomePage: false,
            disableDeepLinking: true,
            hideConferenceSubject: true,
            hideConferenceTimer: true,
          },
          interfaceConfigOverwrite: {
            // Quitamos "hangup" de la toolbar; lo controlamos nosotros
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'chat', 'participants-pane', 'tileview'
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            DEFAULT_LOGO_URL: '',
            DEFAULT_WELCOME_PAGE_LOGO_URL: '',
            HIDE_DEEP_LINKING_LOGO: true,
            MOBILE_APP_PROMO: false,
            SHOW_POWERED_BY: false,
            DISPLAY_ROOM_NAME: false,
            SHOW_ROOM_TIMER: false,
          },
        });

        apiRef.current = api;

        // Redirección al cerrar
        api.on('readyToClose', () => {
          navigate(RETURN_PATH, { replace: true });
        });

      } catch (e: any) {
        setState('error');
        setErrorMsg(e?.message || 'No se pudo iniciar la videollamada.');
      }
    })();

    return () => {
      disposed = true;
      if (apiRef.current) {
        try { apiRef.current.dispose(); } catch {}
        apiRef.current = null;
      }
    };
  }, [state, room, displayName, navigate]);

  // 4) Acciones por rol: salir vs terminar para todos
  const handleExit = () => {
    const api = apiRef.current;
    if (!api) return;
    if (isModerator) {
      api.executeCommand('endConference'); // terminar para todos
    } else {
      api.executeCommand('hangup');        // solo salir
    }
  };

  if (state === 'error') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black/95 text-white">
        <div className="max-w-sm rounded-2xl bg-[#1e1e1e] p-5 text-center shadow-lg">
          <p className="text-base leading-relaxed">{errorMsg}</p>
          <button
            onClick={() => navigate(RETURN_PATH, { replace: true })}
            className="mt-4 rounded-xl bg-[#252525] px-4 py-2 text-sm text-white transition hover:bg-[#333]"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (state === 'validating') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0F0E17] text-white">
        <div className="max-w-sm rounded-2xl bg-[#1e1e1e] p-5 text-center shadow-lg">
          <p className="text-base leading-relaxed">Validando PIN de moderadora...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black">
      {/* Contenedor de Jitsi */}
      <div ref={containerRef} className="h-full w-full" />

      {/* Overlay visual (no clickeable) */}
      <JitsiLogoOverlay />

      {/* Acción contextual (estilo Zinha) */}
      <div className="pointer-events-auto absolute bottom-4 right-4 z-[9999] flex gap-2">
        {isModerator ? (
          <button
            onClick={handleExit}
            className="rounded-2xl bg-[#FF66A6] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            Terminar reunión
          </button>
        ) : (
          <button
            onClick={handleExit}
            className="rounded-2xl bg-[#252525] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#333]"
          >
            Salir
          </button>
        )}
      </div>
    </div>
  );
}
