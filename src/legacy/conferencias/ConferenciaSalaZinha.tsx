import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JitsiLogoOverlay from '../components/JitsiLogoOverlay';
import { loadJitsiApiOnce } from '../utils/jitsi';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function ConferenciaSalaZinha() {
  const nodeRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const navigate = useNavigate();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const room = sp.get("room") ?? "zinha-sala-general";
    const name = sp.get("name") ?? "Invitada Zinha";
    const jwt = sp.get("jwt") ?? undefined; // si viene, será moderadora
    const isModerator = !!jwt;

    if (!nodeRef.current) return;

    let disposed = false;

    (async () => {
      try {
        // Limpia instancias previas
        if (apiRef.current) {
          try { 
            apiRef.current.dispose(); 
          } catch {}
          apiRef.current = null;
        }

        // Carga external_api.js una sola vez
        await loadJitsiApiOnce('meet.zinha.app');
        
        if (disposed) return;

        // @ts-ignore
        const api = new window.JitsiMeetExternalAPI("meet.zinha.app", {
          roomName: room,
          parentNode: nodeRef.current!,
          jwt,
          userInfo: { displayName: name },
          lang: 'es',
          configOverwrite: {
            disableDeepLinking: true,
            enableClosePage: false,
            prejoinConfig: { enabled: false },
            startWithAudioMuted: !jwt,
            startWithVideoMuted: !jwt,
            disableThirdPartyRequests: true,
            hideConferenceSubject: true,
            hideConferenceTimer: true,
            disableEndMeeting: !jwt,
            enableUserRolesBasedOnToken: true,
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
          disableDeepLinking: true,
        });

        apiRef.current = api;
        setState('ready');

        // Redirección al cerrar
        api.on('readyToClose', () => {
          navigate('/perfil', { replace: true });
        });

      } catch (e: any) {
        setState('error');
        setErrorMsg(e?.message || 'No se pudo iniciar la videollamada.');
      }
    })();

    return () => { 
      disposed = true;
      try { 
        if (apiRef.current) apiRef.current.dispose(); 
      } catch {}
    };
  }, [navigate]);

  // Acciones por rol: salir vs terminar para todos
  const handleExit = () => {
    const api = apiRef.current;
    if (!api) return;
    
    const sp = new URLSearchParams(location.search);
    const jwt = sp.get("jwt");
    
    if (jwt) {
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
            onClick={() => navigate('/perfil', { replace: true })}
            className="mt-4 rounded-xl bg-[#252525] px-4 py-2 text-sm text-white transition hover:bg-[#333]"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", width: "100vw", background: "#0F0E17" }}>
      <div ref={nodeRef} style={{ height: "100%", width: "100%", position: "relative" }}>
        
        {/* Overlay visual (no clickeable) */}
        {state === 'ready' && <JitsiLogoOverlay />}
        
        {/* Acción contextual (estilo Zinha) */}
        {state === 'ready' && (
          <div className="pointer-events-auto absolute bottom-4 right-4 z-[9999] flex gap-2">
            {(() => {
              const sp = new URLSearchParams(location.search);
              const jwt = sp.get("jwt");
              return jwt ? (
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
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
