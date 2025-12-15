import { useEffect, useRef, useState } from "react";
import JitsiLogoOverlay from "../components/JitsiLogoOverlay";
import { loadJitsiApiOnce } from "../utils/jitsi";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const JITSI_DOMAIN = "meet.zinha.app";
const ROOM_NAME = "zinha-sala-general";

export default function ConferenciaClean() {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Carga del script external_api.js una sola vez
  useEffect(() => {
    (async () => {
      try {
        await loadJitsiApiOnce(JITSI_DOMAIN);
        setReady(true);
      } catch (error) {
        console.error('Error cargando Jitsi:', error);
      }
    })();
  }, []);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      try {
        apiRef.current?.dispose?.();
      } catch { /* no-op */ }
    };
  }, []);

  const startMeeting = () => {
    if (!window.JitsiMeetExternalAPI || !containerRef.current) return;
    setLoading(true);

    // CONFIG COMPLETA ZINHA
    const options = {
      roomName: ROOM_NAME,
      parentNode: containerRef.current,
      width: "100%",
      height: "100%",
      // SIN JWT = INVITADA
      jwt: undefined,
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
      configOverwrite: {
        disableDeepLinking: true,
        mobileDeepLinking: false,
        prejoinConfig: { enabled: true },
        hideConferenceSubject: true,
        hideConferenceTimer: true,
        disableEndMeeting: true, // Invitadas NO pueden terminar para todos
        websocket: "wss://meet.zinha.app/xmpp-websocket",
        bosh: "https://meet.zinha.app/http-bind",
        p2p: { enabled: false },
        disable1On1Mode: false,
      },
      userInfo: {
        displayName: "Invitada Zinha",
      },
    };

    const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, options);
    apiRef.current = api;

    api.on("readyToClose", () => {
      api.dispose();
      apiRef.current = null;
    });
    
    api.on("videoConferenceJoined", () => {
      setLoading(false);
      setMounted(true);
      console.log("JOINED");
    });
    
    api.on("errorOccurred", (e: any) => {
      setLoading(false);
      console.error("JITSI ERROR", e);
      alert("Ocurrió un error al iniciar la videollamada.");
    });

    // Pedir permisos
    try {
      navigator.mediaDevices?.getUserMedia?.({ audio: true, video: true }).catch(() => {});
    } catch {}
  };

  // Acción de salir (solo para invitada)
  const handleExit = () => {
    const api = apiRef.current;
    if (!api) return;
    api.executeCommand('hangup'); // Solo salir, no terminar para todos
  };

  return (
    <div style={{ height: "100vh", width: "100%", background: "#0F0E17" }}>
      {/* Modal de bienvenida */}
      {!apiRef.current && (
        <div style={{
          position: "absolute", inset: 0, display: "grid",
          placeItems: "center", padding: 16, zIndex: 10
        }}>
          <div style={{
            maxWidth: 520, width: "92%", background: "#1e1e1e", color: "#fff",
            borderRadius: 16, padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,.35)"
          }}>
            <h2 style={{ marginTop: 0, color: "#FF66A6" }}>Bienvenida a la sala de conferencias</h2>
            <p style={{ opacity: .85, lineHeight: 1.6, color: "#B8B8B8" }}>
              Respeta los tiempos del expositor. Mantén tu micrófono en mute cuando no hables.
              Evita compartir datos sensibles.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button
                onClick={startMeeting}
                disabled={!ready}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: 12, border: "none",
                  background: ready ? "#C3FF57" : "#556", color: "#000", fontWeight: 700
                }}>
                {loading ? "Entrando..." : "Entrar a la sala"}
              </button>
              <button
                onClick={() => history.back()}
                style={{
                  padding: "14px 16px", borderRadius: 12, border: "1px solid #444",
                  background: "transparent", color: "#fff"
                }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor donde Jitsi monta el IFrame */}
      <div ref={containerRef} style={{ height: "100%", width: "100%", position: "relative" }}>
        
        {/* Overlay visual (no clickeable) */}
        {mounted && <JitsiLogoOverlay />}
        
        {/* Botón de salir estilo Zinha (solo para invitada) */}
        {mounted && (
          <div className="pointer-events-auto absolute bottom-4 right-4 z-[9999] flex gap-2">
            <button
              onClick={handleExit}
              className="rounded-2xl bg-[#252525] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#333]"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
