import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// --- Config Zinha ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// Dominio Jitsi personalizado de Zinha
const JITSI_DOMAIN = "meet.zinha.app";

// Toolbar minimal y limpia
const TOOLBAR = [
  "microphone","camera","desktop","participants-pane","chat","tileview","hangup",
];

export default function Conferencia() {
  // /conferencia/sala?room=...&name=...
  const params = new URLSearchParams(window.location.search);
  const initialRoom = params.get("room") || "zinha-sala";
  const initialName = decodeURIComponent(params.get("name") || "Invitada Zinha");

  const [room, setRoom] = useState(initialRoom);
  const [displayName, setDisplayName] = useState(initialName);
  const [pin, setPin] = useState("");
  const [isModerator, setIsModerator] = useState(false);
  const [step, setStep] = useState("prejoin"); // prejoin | joining | live | error
  const apiRef = useRef(null);
  const containerRef = useRef(null);

  // Tema Zinha (tu paleta). Asegúrate de tener estas CSS vars globales.
  const theme = useMemo(() => ({
    primary: "var(--zinha-primary)",
    secondary: "var(--zinha-secondary)",
    accent: "var(--zinha-accent)",
    dark: "#263152"
  }), []);

  // Valida PIN contra archivo JSON local
  async function validarPIN() {
    setStep("joining");
    try {
      const response = await fetch('/seeds/pins-2025-08-27.json');
      if (!response.ok) throw new Error('No se pudo cargar el archivo de PINes');
      
      const data = await response.json();
      
      // Busca el PIN y verifica si es válido para la sala (* significa cualquier sala)
      const pinData = data.pins.find(p => 
        p.pin === pin && 
        p.active && 
        (p.room === '*' || p.room === room)
      );

      const ok = !!pinData;
      setIsModerator(ok);
      iniciarJitsi(ok);
    } catch (e) {
      console.error(e);
      setStep("error");
    }
  }

  function iniciarJitsi(moderator) {
    // Limpia instancia anterior si recargas dentro de la misma vista
    if (apiRef.current) {
      try { apiRef.current.dispose(); } catch {}
      apiRef.current = null;
    }

    // Evita render dual
    containerRef.current.innerHTML = "";

    // Construye opciones del IFrame API
    const options = {
      roomName: room,
      parentNode: containerRef.current,
      width: "100%",
      height: "100%",
      userInfo: { displayName },
      interfaceConfigOverwrite: {
        APP_NAME: "Zinha Meet",
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: TOOLBAR,
        MOBILE_APP_PROMO: false
      },
      configOverwrite: {
        disableDeepLinking: true,
        prejoinConfig: { enabled: false },
        defaultLanguage: "es",
        startWithAudioMuted: !isModerator,
        startWithVideoMuted: !isModerator
      },
    };

    // Crea iframe
    const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, options);
    apiRef.current = api;

    // Si es "moderator" (vía tu PIN), aplicamos reglas de anfitrión EN TU CAPA
    // Nota: esto NO te da "role=moderator" dentro de meet.jit.si (se necesita JWT/secure domain),
    // pero sí te permite activar/desactivar cosas desde tu UI o avisos.
    if (moderator) {
      // Ejemplo: desactivar lobby si tu servidor propio lo respeta
      api.executeCommand("password", ""); // no-op en meet.jit.si, útil en self-host
    }

    setStep("live");
  }

  useEffect(() => {
    // Carga Jitsi IFrame API si no está
    if (!window.JitsiMeetExternalAPI) {
      const s = document.createElement("script");
      s.src = `https://${JITSI_DOMAIN}/external_api.js`;
      s.onload = () => console.log("Jitsi API cargada");
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div className="w-full h-[calc(100vh-88px)] flex">
      {/* Panel izquierdo (branding Zinha) */}
      <aside className="hidden md:flex w-64 flex-col gap-6 p-6" style={{background: "var(--zinha-secondary)"}}>
        <div className="flex items-center gap-3">
          <img src="/images/logo-zinha.png" width={32} height={32} alt="Zinha"/>
          <h2 className="text-xl font-semibold">Zinha Meet</h2>
        </div>
        <p className="opacity-80 text-sm">
          Espacio seguro. Sin ruido, sin drama. Solo resultados.
        </p>
        {isModerator ? (
          <span className="text-xs px-2 py-1 rounded-full bg-green-600 text-white w-fit">Moderadora</span>
        ) : (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-600 text-white w-fit">Invitada</span>
        )}
      </aside>

      {/* Contenido */}
      <main className="flex-1 relative">
        {step === "prejoin" && (
          <div className="w-full h-full grid place-items-center" style={{background: "var(--zinha-primary)"}}>
            <div className="w-full max-w-[540px] rounded-2xl p-6 shadow-xl" style={{background:"white"}}>
              <h1 className="text-2xl font-bold mb-4">Entrar a la reunión</h1>
              <div className="grid gap-3">
                <label className="text-sm">Nombre para mostrar</label>
                <input className="border rounded-lg px-3 py-2" value={displayName} onChange={e=>setDisplayName(e.target.value)} />

                <label className="text-sm mt-2">Sala</label>
                <input className="border rounded-lg px-3 py-2" value={room} onChange={e=>setRoom(e.target.value)} />

                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">Tengo PIN de moderadora</summary>
                  <input
                    className="border rounded-lg px-3 py-2 mt-2"
                    placeholder="PIN"
                    value={pin}
                    onChange={(e)=>setPin(e.target.value)}
                  />
                </details>

                <button
                  onClick={validarPIN}
                  className="mt-4 rounded-xl px-4 py-3 font-semibold"
                  style={{background: theme.secondary, color: "#fff"}}
                >
                  Entrar
                </button>
                <p className="text-xs opacity-70">* Si no tienes PIN, entrarás como invitada.</p>
              </div>
            </div>
          </div>
        )}

        {(step === "joining" || step === "live") && (
          <div id="jitsi-container" ref={containerRef} className="absolute inset-0" style={{background: theme.dark}} />
        )}

        {step === "error" && (
          <div className="w-full h-full grid place-items-center">
            <div className="p-4 bg-red-100 border border-red-300 rounded-xl">
              <p className="font-semibold">No pudimos validar tu PIN. Inténtalo de nuevo.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
