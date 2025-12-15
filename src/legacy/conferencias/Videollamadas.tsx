import { useEffect, useRef, useState } from "react";

declare global { interface Window { JitsiMeetExternalAPI: any } }

export default function Videollamadas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Evita doble montaje en dev (StrictMode)
    if ((containerRef.current as any)?.__mounted) return;
    (containerRef.current as any).__mounted = true;

    const ensurePermissions = async () => {
      // Forzamos prompt de cámara/mic ANTES de arrancar Jitsi
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch {
        // Si la usuaria niega permisos, igual iniciamos Jitsi pero en mute
      }
    };

    const startJitsi = async () => {
      await ensurePermissions();

      if (apiRef.current || !window.JitsiMeetExternalAPI) return;

      apiRef.current = new window.JitsiMeetExternalAPI("meet.zinha.app", {
        roomName: "zinha-sala-general",
        parentNode: containerRef.current!,
        width: "100%",
        height: "100%",
        configOverwrite: {
          // Nada de deeplinking ni prejoin
          disableDeepLinking: true,
          prejoinPageEnabled: false,
          // Si no hay permisos, entra muteado y la usuaria los activa luego
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          MOBILE_APP_PROMO: false,
          SHOW_JITSI_WATERMARK: false, // oculta el logo/link
        },
      });

      // Seguridad extra: bloquear cualquier <a> que intente abrir fuera
      const blockExternalLinks = (e: any) => {
        const a = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
        if (!a) return;
        const href = a.getAttribute("href") || "";
        if (/jitsi\.org|8x8\.com|appstore|google|play\.google/i.test(href)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      containerRef.current?.addEventListener("click", blockExternalLinks, true);
      (containerRef.current as any).__cleanup = () =>
        containerRef.current?.removeEventListener("click", blockExternalLinks, true);

      // Opcional: logs de estado
      apiRef.current.addEventListener("videoConferenceJoined", () => console.log("Jitsi: joined"));
      apiRef.current.addEventListener("readyToClose", () => console.log("Jitsi: readyToClose"));

      setReady(true);
    };

    // Cargar external_api.js solo una vez
    let s = document.getElementById("jitsi-external-api") as HTMLScriptElement | null;
    if (!s) {
      s = document.createElement("script");
      s.id = "jitsi-external-api";
      s.src = "https://meet.zinha.app/external_api.js";
      s.async = true;
      s.onload = startJitsi;
      document.body.appendChild(s);
    } else {
      if (window.JitsiMeetExternalAPI) startJitsi();
      else s.addEventListener("load", startJitsi, { once: true });
    }

    return () => {
      try { apiRef.current?.dispose(); } catch {}
      (containerRef.current as any)?.__cleanup?.();
      apiRef.current = null;
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      {!ready && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff", opacity: .7 }}>
          Cargando sala…
        </div>
      )}
      <div ref={containerRef} style={{ height: "100dvh", width: "100%" }} />
    </div>
  );
}
