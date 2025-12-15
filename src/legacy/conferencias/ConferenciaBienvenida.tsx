import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// --- RUTA CORREGIDA ---
import usePinValidation from '../hooks/usePinValidation'; // Usamos la ruta relativa correcta

export default function ConferenciaBienvenida() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const sala = sp.get('room') ?? 'zinha-sala-general';

  const [nombre, setNombre] = useState('Invitada Zinha');
  const [isHost, setIsHost] = useState(false);
  const [pin, setPin] = useState('');

  // Usamos nuestro hook para la validación y el manejo de estados
  const { validatePin, isLoading, error, isSuccess, reset } = usePinValidation();

  // Cuando el PIN es validado con éxito, navegamos a la sala
  useEffect(() => {
    if (isSuccess) {
      // PIN válido, redirigimos como moderador
      nav(`/conferencia/sala?room=${encodeURIComponent(sala)}&name=${encodeURIComponent(nombre)}&isModerator=true`);
    }
  }, [isSuccess, nav, sala, nombre]);
  const handleEntrar = async () => {
    // Limpiamos errores previos al reintentar
    reset();
    try {
      // Pedir permisos de cámara/micrófono antes de continuar
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).catch(() => {});
      
      if (isHost) {
        // --- LÓGICA MODIFICADA ---
        // Si es moderador, validamos el PIN usando la RPC de Supabase
        await validatePin(pin, sala);
      } else {
        // Asistente normal, entra directamente
        nav(`/conferencia/sala?room=${encodeURIComponent(sala)}&name=${encodeURIComponent(nombre)}`);
      }
    } catch (e: any) {
      console.error("[Conference] Error al obtener permisos de medios:", e);
      // El error del hook `usePinValidation` ya se mostrará automáticamente
    }
  };

  return (
    <div
      className="min-h-[100dvh] p-4 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #f5e6ff 0%, #c8a6a6 50%, #8d7583 100%)',
        fontFamily: 'Questrial, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl p-8 backdrop-blur-md border"
        style={{
          background: 'rgba(255, 255, 255, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
        }}
      >
        <h1 
          className="text-2xl font-bold mb-2 text-center" 
          style={{ color: '#382a3c', letterSpacing: '-0.02em' }}
        >
          Bienvenida a la sala de conferencias
        </h1>
        
        <p 
          className="text-base mb-6 text-center font-medium" 
          style={{ color: '#8d7583', textTransform: 'capitalize' }}
        >
          {sala.replaceAll('-', ' ')}
        </p>

        <div 
          className="space-y-2 mb-6 p-4 rounded-xl text-sm"
          style={{ 
            background: 'rgba(255, 255, 255, 0.4)', 
            border: '1px solid rgba(255, 255, 255, 0.5)' 
          }}
        >
          <div style={{ color: '#382a3c' }}>• Respeta los tiempos del expositor.</div>
          <div style={{ color: '#382a3c' }}>• Mantén tu micrófono en mute cuando no hables.</div>
          <div style={{ color: '#382a3c' }}>• Evita compartir datos sensibles.</div>
        </div>

        <label className="block mb-2 text-sm font-medium" style={{ color: '#382a3c' }}>
          Tu nombre para la sala
        </label>
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className="w-full rounded-xl px-4 py-3 mb-4 outline-none border-0 text-base font-medium transition-all duration-200 focus:scale-[1.02]"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            color: '#382a3c',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          }}
          placeholder="Escribe tu nombre…"
        />

        {/* Toggle Moderador con diseño elegante */}
        <label className="flex items-center gap-3 mt-4 cursor-pointer">
          <input 
            type="checkbox" 
            checked={isHost} 
            onChange={e => setIsHost(e.target.checked)} 
            className="accent-[#c1d43a w-5 h-5"
          />
          <span className="text-[#382a3c font-medium">Soy moderador(a)</span>
        </label>
        
        {isHost && (
          <input
            type="password"
            placeholder="PIN de moderador"
            className="mt-3 w-full rounded-xl bg-white/70 backdrop-blur px-4 py-3 outline-none ring-2 ring-white/30 focus:ring-[#c1d43a] transition-all duration-200 font-medium"
            style={{ color: '#382a3c' }}
            value={pin} 
            onChange={e => setPin(e.target.value)}
          />
        )}

        {/* Error message elegante */}
        {error && (
          <div 
            className="mb-4 p-3 rounded-lg text-sm font-medium animate-in slide-in-from-top-2 duration-200" 
            style={{ 
              background: 'rgba(220, 38, 38, 0.1)', 
              color: '#dc2626', 
              border: '1px solid rgba(220, 38, 38, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleEntrar}
            disabled={isLoading}
            className="flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            style={{
              background: isLoading
                ? 'linear-gradient(135deg, #8d7583 0%, #c8a6a6 100%)' 
                : 'linear-gradient(135deg, #c1d43a 0%, #a8c030 100%)',
              color: '#382a3c',
              boxShadow: isLoading
                ? '0 4px 15px rgba(141, 117, 131, 0.3)' 
                : '0 8px 25px rgba(193, 212, 58, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {isLoading ? 'Validando...' : 'Entrar a la sala'}
          </button>

          <button
            onClick={() => nav(-1)}
            className="px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#382a3c',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(10px)',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

