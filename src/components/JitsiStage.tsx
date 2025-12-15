import { useEffect, useRef } from 'react';
import { loadJitsi } from '@/lib/loadJitsi';
import { useNavigate } from 'react-router-dom';
import JitsiLogoOverlay from './JitsiLogoOverlay';

type Props = {
  room: string;
  displayName: string;
  isModerator: boolean;
};

export default function JitsiStage({ room, displayName, isModerator }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let disposed = false;

    (async () => {
      await loadJitsi((import.meta as any).env.VITE_JITSI_DOMAIN);

      if (!ref.current || disposed) return;

      const domain = (import.meta as any).env.VITE_JITSI_DOMAIN as string;
      const options = {
        roomName: room,
        parentNode: ref.current,
        userInfo: { displayName },
        lang: 'es',
        configOverwrite: {
          // ¡Muy importante!
          prejoinConfig: { enabled: false },
          enableWelcomePage: false,
          disableDeepLinking: true,
          // cámara/mic por defecto (ya pedimos permisos antes)
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          // Configuración de permisos para invitados
          disableEndMeeting: !isModerator, // invitados NO pueden terminar para todos
          enableUserRolesBasedOnToken: true, // usar roles del JWT
          // OCULTAR NOMBRE DE SALA Y CRONÓMETRO
          hideConferenceSubject: true,
          hideConferenceTimer: true
        },
        interfaceConfigOverwrite: {
          // CONFIGURACIÓN COMPLETA PARA QUITAR TODO BRANDING
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          SHOW_CHROME_EXTENSION_BANNER: false,
          DEFAULT_LOGO_URL: '',
          DEFAULT_WELCOME_PAGE_LOGO_URL: '',
          DISPLAY_WELCOME_PAGE_CONTENT: false,
          DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
          TOOLBAR_ALWAYS_VISIBLE: false,
          HIDE_DEEP_LINKING_LOGO: true,
          MOBILE_APP_PROMO: false,
          SHOW_POWERED_BY: false,
          // ESTAS SON LAS CLAVES QUE FALTABAN:
          DISPLAY_ROOM_NAME: false,
          SHOW_ROOM_TIMER: false,
          // Toolbar diferenciada según rol - SIN hangup para invitados (usamos botón personalizado)
          TOOLBAR_BUTTONS: isModerator ? [
            // MODERADOR: Todos los controles incluyendo terminar reunión
            "microphone", "camera", "closedcaptions", "desktop", "chat",
            "participants-pane", "tileview", "recording", "livestreaming", "hangup"
          ] : [
            // INVITADO: Solo controles básicos, SIN hangup (usamos botón personalizado)
            "microphone", "camera", "chat", "participants-pane", "tileview"
            // ❌ NO incluir "hangup" para invitados - usamos botón personalizado
          ]
        },
        // Evita abrir app nativa
        disableDeepLinking: true,
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      apiRef.current = api;

      api.on('videoConferenceJoined', () => {
        // Si queremos marcar a moderador con algún ajuste de UI:
        if (isModerator) {
          // Ejemplo: desactivar "everyone starts muted" (si lo hubiéramos activado server-side)
          // o mostrar un aviso local. La moderación real la da Jitsi al primer participante.
          console.log('Host: privilegios de moderación activos');
        }
      });

      api.on('readyToClose', () => {
        const ret = (import.meta as any).env?.VITE_JITSI_RETURN_PATH || '/perfil';
        navigate(ret, { replace: true });
      });

      api.on('videoConferenceLeft', () => {
        const ret = (import.meta as any).env?.VITE_JITSI_RETURN_PATH || '/perfil';
        navigate(ret, { replace: true });
      });
    })();

    return () => {
      disposed = true;
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [room, displayName, isModerator, navigate]);

  return (
    <div className="relative w-full h-[calc(100vh-84px)] bg-black">
      <div ref={ref} className="w-full h-full" />
      
      {/* BOTÓN PERSONALIZADO DE SALIDA DIFERENCIADO POR ROL */}
      {apiRef.current && (
        <button
          onClick={() => {
            if (isModerator) {
              // MODERADOR: Termina reunión para todos
              apiRef.current?.executeCommand('endConference');
            } else {
              // INVITADO: Solo se sale él mismo
              apiRef.current?.executeCommand('hangup');
            }
          }}
          className="absolute top-5 right-5 z-[999999] bg-red-500 text-white border-none rounded-lg px-4 py-3 font-bold cursor-pointer shadow-lg hover:bg-red-600 transition-colors"
        >
          {isModerator ? "Terminar reunión" : "Salir"}
        </button>
      )}
      
      {/* OVERLAY PARA TAPAR LOGO DE JITSI - DENTRO DEL CONTENEDOR */}
      {apiRef.current && <JitsiLogoOverlay visible={true} />}
    </div>
  );
}
