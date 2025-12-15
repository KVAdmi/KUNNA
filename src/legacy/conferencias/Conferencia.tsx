import { useEffect, useRef, useState } from "react";
import JitsiLogoOverlay from "../components/JitsiLogoOverlay";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const JITSI_DOMAIN = "meet.zinha.app";
const ROOM_NAME = "zinha-sala-general"; // usa la misma sala que ya definieron

export default function Conferencia() {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [ready, setReady] = useState(false);        // para mostrar modal primero
  const [loading, setLoading] = useState(false);    // spinner mientras monta

  // Carga del script external_api.js una sola vez
  useEffect(() => {
    let script = document.querySelector<HTMLScriptElement>("#jitsi-ext");
    if (!script) {
      script = document.createElement("script");
      script.id = "jitsi-ext";
      script.src = "https://meet.zinha.app/external_api.js";
      script.async = true;
      script.onload = () => setReady(true);
      document.body.appendChild(script);
    } else {
      setReady(true);
    }
    return () => {};
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

    // **CONFIG COMPLETA PARA QUITAR TODO BRANDING + JWT PARA PERMISOS**
    const options = {
      roomName: ROOM_NAME,
      parentNode: containerRef.current,
      width: "100%",
      height: "100%",
      // ⚠️ SIN JWT = INVITADO SIN PERMISOS DE TERMINACIÓN
      jwt: undefined, // Invitados no tienen JWT
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
        // TOOLBAR PARA INVITADOS (SIN botón hangup - usamos el nuestro)
        TOOLBAR_BUTTONS: [
          "microphone", "camera", "chat", "participants-pane", "tileview"
          // ❌ NO incluir "hangup" - usamos botón personalizado
        ]
      },
      configOverwrite: {
        disableDeepLinking: true,
        mobileDeepLinking: false,
        prejoinConfig: {
          enabled: true,           // usa tu modal + prejoin si quieres
        },
        // OCULTAR NOMBRE DE SALA Y CRONÓMETRO
        hideConferenceSubject: true,
        hideConferenceTimer: true,
        // ⚠️ IMPORTANTE: Invitados NO pueden terminar para todos
        disableEndMeeting: true,
        // Fuerza WebSocket/BOSH contra tu dominio (belt & suspenders)
        websocket: "wss://meet.zinha.app/xmpp-websocket",
        bosh: "https://meet.zinha.app/http-bind",
        // Desactiva P2P (reduce edge-casos en WebView/TWA)
        p2p: { enabled: false },
        // Opcional: sube la compatibilidad en móviles WebView
        disable1On1Mode: false,
      },
      userInfo: {
        displayName: "Invitada Zinha",
      },
    };

    const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, options);
    apiRef.current = api;

    // FUNCIÓN PERSONALIZADA PARA SALIR (solo el invitado, no termina para todos)
    const handleCustomHangup = () => {
      // Como es página de invitado, solo ejecuta hangup (no endConference)
      api.executeCommand('hangup');
    };

    // Logs útiles para depurar si queda negro
    api.on("readyToClose", () => {
      api.dispose();
      apiRef.current = null;
    });
    api.on("videoConferenceJoined", () => {
      setLoading(false);
      console.log("JOINED");
    });
    api.on("errorOccurred", (e: any) => {
      setLoading(false);
      console.error("JITSI ERROR", e);
      alert("Ocurrió un error al iniciar la videollamada.");
    });

    // Pide permisos explícitos (en web moderna basta con el gesto del botón)
    // La API interna ya pedirá, pero podemos adelantarnos si hace falta:
    try {
      navigator.mediaDevices?.getUserMedia?.({ audio: true, video: true }).catch(() => {});
    } catch {}
  };

  return (
    <div style={{ height: "100vh", width: "100%", background: "#0e0e12" }}>
      {/* Modal de bienvenida (simple) */}
      {!apiRef.current && (
        <div style={{
          position: "absolute", inset: 0, display: "grid",
          placeItems: "center", padding: 16, zIndex: 10
        }}>
          <div style={{
            maxWidth: 520, width: "92%", background: "#191a20", color: "#fff",
            borderRadius: 16, padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,.35)"
          }}>
            <h2 style={{ marginTop: 0 }}>Bienvenida a la sala de conferencias</h2>
            <p style={{ opacity: .85, lineHeight: 1.6 }}>
              Respeta los tiempos del expositor. Mantén tu micrófono en mute cuando no hables.
              Evita compartir datos sensibles.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button
                onClick={startMeeting}
                disabled={!ready}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: 12, border: "none",
                  background: ready ? "#77DD77" : "#556", color: "#000", fontWeight: 700
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
        
        {/* BOTÓN PERSONALIZADO DE SALIDA (SOLO PARA INVITADO) */}
        {apiRef.current && (
          <button
            onClick={() => apiRef.current?.executeCommand('hangup')}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              zIndex: 9999,
              background: "#ff4757",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 16px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(255, 71, 87, 0.3)"
            }}
          >
            Salir
          </button>
        )}
        
        {/* OVERLAY PARA TAPAR LOGO DE JITSI - DENTRO DEL MISMO CONTENEDOR */}
        {apiRef.current && <JitsiLogoOverlay visible={true} />}
      </div>
    </div>
  );
}
