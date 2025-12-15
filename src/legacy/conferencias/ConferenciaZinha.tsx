import { useEffect, useRef, useState } from "react";
import "/src/styles/jitsi-host.css";

const ZINHA = {
  primary: "#A6E36A",        // botón principal
  bg: "#17141D",             // fondo base
  bgCard: "#201C28",         // tarjeta
  text: "#FFFFFF",           // texto
  textMuted: "#CFC9DA",      // texto suave
};

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const ROOM_NAME = "zinha-sala-general";
const JITSI_DOMAIN = "meet.zinha.app";

export default function ConferenciaZinha() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [displayName, setDisplayName] = useState("Invitada Zinha");
  const jitsiRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<any>(null);

  // Limpia Jitsi al salir
  const disposeJitsi = () => {
    try {
      apiRef.current?.dispose?.();
    } catch {}
    apiRef.current = null;
  };

  useEffect(() => () => disposeJitsi(), []);

  const startJitsi = () => {
    if (!jitsiRef.current) return;

    // Asegura script de external_api.js
    const ensureScript = () =>
      new Promise<void>((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) return resolve();
        const s = document.createElement("script");
        s.src = `https://${JITSI_DOMAIN}/external_api.js`;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("No se pudo cargar external_api.js"));
        document.body.appendChild(s);
      });

    ensureScript()
      .then(() => {
        const opts = {
          roomName: ROOM_NAME,
          parentNode: jitsiRef.current!,
          userInfo: { displayName },
          configOverwrite: {
            disableDeepLinking: true,
            prejoinConfig: { enabled: false },
            defaultLanguage: "es",
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableThirdPartyRequests: true,
            enableClosePage: false,
            hideConferenceSubject: true,
            hideConferenceTimer: true,
            disableEndMeeting: true,
            p2p: { enabled: false },
            backgroundAlpha: 1.0,
            // Si notas bloqueos de permisos en algunos Android:
            // startWithAudioMuted: true,
            // startWithVideoMuted: true,
            // Preferir websocket (ya tienes /xmpp-websocket OK)
            deploymentInfo: {},
            // Opcionalmente, fuerza BOSH si algún WebView falla:
            // bosh: `https://${JITSI_DOMAIN}/http-bind`,
          },
          interfaceConfigOverwrite: {
            APP_NAME: "Zinha",
            NATIVE_APP_NAME: "Zinha",
            PROVIDER_NAME: "Zinha",
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: "",
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "desktop",
              "participants-pane",
              "chat",
              "tileview",
              "hangup",
              "raisehand",
              "settings",
              "videoquality",
              "toggle-camera"
            ],
            SETTINGS_SECTIONS: ["devices","language","profile"],
            MOBILE_APP_PROMO: false,
            DISABLE_VIDEO_BACKGROUND: true
          },
        };

        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, opts);
        apiRef.current = api;

        // Logs útiles para soporte
        api.on("videoConferenceJoined", () =>
          console.log("[JITSI] JOINED")
        );
        api.on("readyToClose", () => {
          console.log("[JITSI] readyToClose");
          handleLeave();
        });
        api.on("audioAvailabilityChanged", (e: any) =>
          console.log("[JITSI] audioAvailabilityChanged", e)
        );
        api.on("videoAvailabilityChanged", (e: any) =>
          console.log("[JITSI] videoAvailabilityChanged", e)
        );
        api.on("errorOccurred", (e: any) =>
          console.error("[JITSI ERROR]", e)
        );
      })
      .catch((err) => {
        console.error("[JITSI] Error cargando:", err);
        alert("No pudimos iniciar la videollamada. Intenta de nuevo.");
      });
  };

  const handleEnter = () => {
    setShowWelcome(false);
    setTimeout(startJitsi, 50);
  };

  const handleLeave = () => {
    disposeJitsi();
    setShowWelcome(true);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--zinha-bg)] text-[var(--zinha-text)]">
      {/* Header + salir cuando Jitsi está visible */}
      {!showWelcome && (
        <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
          <div className="text-sm opacity-80">Zinha Sala General</div>
          <button
            onClick={handleLeave}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20 transition"
          >
            Salir
          </button>
        </div>
      )}

      {/* Bienvenida */}
      {showWelcome ? (
        <div className="flex min-h-screen items-center justify-center p-5">
          <div className="w-full max-w-md rounded-2xl bg-[var(--zinha-bgCard)] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
            <h1 className="mb-2 text-2xl font-semibold">
              Bienvenida a la sala de conferencias
            </h1>
            <p className="mb-6 text-sm text-[var(--zinha-textMuted)]">
              Zinha Sala General
            </p>

            <ul className="mb-6 space-y-3 text-[15px] leading-relaxed text-[var(--zinha-textMuted)]">
              <li>• Respeta los tiempos del expositor.</li>
              <li>• Mantén tu micrófono en mute cuando no hables.</li>
              <li>• Evita compartir datos sensibles.</li>
            </ul>

            <label className="mb-3 block text-sm text-[var(--zinha-textMuted)]">
              Tu nombre para la sala
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mb-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--zinha-primary)]"
              placeholder="Tu nombre"
            />

            <div className="flex gap-3">
              <button
                onClick={handleEnter}
                className="flex-1 rounded-xl bg-[var(--zinha-primary)] px-4 py-3 font-medium text-[#10210C] hover:brightness-105 transition"
              >
                Entrar a la sala
              </button>
              <button
                onClick={() => history.back()}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white/90 hover:bg-white/10 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Host donde se monta Jitsi
        <div className="relative w-full h-[calc(100vh-88px)] bg-[#141826]">
          <div className="pointer-events-none absolute inset-0
                        bg-[radial-gradient(650px_320px_at_20%_0%,rgba(233,214,255,.18),transparent_60%)]
                        opacity-90" />
          <div ref={jitsiRef} className="absolute inset-0 rounded-2xl overflow-hidden
                        shadow-[0_18px_45px_rgba(0,0,0,.35)]" />
        </div>
      )}
    </div>
  );
}
