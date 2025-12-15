import { useEffect, useRef, useState, CSSProperties } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadJitsiApiOnce } from '../utils/jitsi';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN as string || 'meet.jit.si';
const RETURN_PATH  = import.meta.env.VITE_JITSI_RETURN_PATH || '/perfil';

export default function ConferenciaSala() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const room = (params.get('room') || 'ZinhaSalaGeneral').trim();
  const displayName = (params.get('name') || 'Invitada Zinha').trim();
  const isModerator = params.get('isModerator') === 'true';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);

  const [phase, setPhase] = useState<'loading'|'ready'|'error'>('loading');
  useEffect(() => {
    let disposed = false;
    if (!containerRef.current) return;
    (async () => {
      try {
        await loadJitsiApiOnce(JITSI_DOMAIN);
        if (disposed) return;

        const guestButtons = [
          'camera', 'chat', 'microphone', 'raisehand',
          'select-background', 'settings', 'tileview', 'toggle-camera'
        ];
        const moderatorButtons = [
          ...guestButtons,
          'mute-everyone', 'security', 'participants-pane'
        ];

        const jitsiConfig = {
          roomName: room,
          parentNode: containerRef.current,
          userInfo: { displayName },
          lang: 'es',
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: true,
            startWithVideoMuted: true,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: isModerator ? moderatorButtons : guestButtons,
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            DISPLAY_ROOM_NAME: false,
            // --- INYECTAMOS LOS COLORES DE TU MARCA DIRECTAMENTE AQUÍ ---
            MAIN_BACKGROUND: '#f5e6ff', // Fondo principal lila claro
            BACKGROUND: '#f5e6ff',
            DEFAULT_BACKGROUND: '#f5e6ff',
            PRIMARY_COLOR: '#382a3c', // Color primario para texto y elementos
            TOOLBAR_BACKGROUND: 'rgba(255, 255, 255, 0.25)', // Fondo de la barra de herramientas con efecto cristal
          },
        };

        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, jitsiConfig);
        apiRef.current = api;

        setPhase('ready');

        api.addEventListener('readyToClose', () => {
          navigate(RETURN_PATH, { replace: true });
        });

      } catch (e: any) {
        setPhase('error');
      }
    })();

    return () => {
      disposed = true;
      if (apiRef.current) {
        try { apiRef.current.dispose(); } catch {}
        apiRef.current = null;
      }
    };
  }, [room, displayName, navigate, isModerator]);

  const handleExit = () => {
    if (apiRef.current) {
    if (isModerator) {
        apiRef.current.executeCommand('endConference');
    } else {
        apiRef.current.executeCommand('hangup');
    }
    }
  };

  // --- MANTENEMOS EL DISEÑO ELEGANTE QUE HABÍAMOS CREADO ---
  if (phase === 'loading') {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5e6ff 0%, #c8a6a6 100%)' }}>
        <div className="rounded-2xl p-4 text-lg font-medium" style={{
          background: 'rgba(255, 255, 255, 0.25)',
            color: '#382a3c',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        } as CSSProperties}>
          Iniciando sala de conferencias...
        </div>
      </div>
  );
}

  return (
    <div
      className="min-h-[100vh] w-full flex flex-col items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #f5e6ff 0%, #c8a6a6 100%)',
        fontFamily: 'Questrial, sans-serif',
      } as CSSProperties}
    >
      <header
        className="w-full max-w-7xl flex items-center justify-between p-4 mb-4 rounded-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(15px)',
        } as CSSProperties}
      >
        <img src="/images/logo-zinha.png" alt="Zinha Logo" className="h-10" />
        <span className="font-bold text-lg capitalize" style={{color: '#382a3c'}}>
          {room.replaceAll('-', ' ')}
        </span>
      </header>

      <main
        ref={containerRef}
        className="w-full max-w-7xl flex-1 rounded-2xl shadow-2xl overflow-hidden"
        style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      />

      <footer className="w-full max-w-7xl mt-4 flex justify-end">
        <button
          onClick={handleExit}
          className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
          style={{
            background: isModerator
              ? 'linear-gradient(135deg, #c1d43a 0%, #a8c030 100%)'
              : 'rgba(255, 255, 255, 0.25)',
            color: '#382a3c',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(15px)',
          } as CSSProperties}
        >
          {isModerator ? 'Terminar para todos' : 'Salir de la reunión'}
        </button>
      </footer>
    </div>
  );
}

