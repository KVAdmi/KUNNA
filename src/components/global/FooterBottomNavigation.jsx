// ✅ FooterBottomNavigation.jsx - SOS CON TRACKING REAL
import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, User, Home, Brain } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient';
import useEmergencyActionsExtended from '@/hooks/useEmergencyActionsExtended';

const FooterBottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // 🎯 USAR EL HOOK REAL CON TRACKING + AUDIO
  const { toggleCompanionship, isFollowing } = useEmergencyActionsExtended();

  // Función SOS REAL - Llama al hook que hace tracking + audio + evidencias
  const handleSOS = async () => {
    console.log('🚨 [FOOTER] SOS Button clicked - Calling toggleCompanionship()');
    await toggleCompanionship();
  };

  const botones = [
    {
      icono: <Home size={24} color="white" />,
      color: '#382a3c',
      titulo: 'Inicio',
      onClick: () => navigate('/'),
    },
    {
      icono: <AlertTriangle size={24} color="white" />,
      color: isFollowing ? '#10b981' : '#490000', // Verde si activo, rojo si no
      titulo: isFollowing ? 'Detener' : 'SOS',
      onClick: handleSOS,
      disabled: false
    },
    {
      icono: <Brain size={24} color="white" />,
      color: 'var(--brand-dark-blue)',
      titulo: 'AL-E',
      onClick: () => navigate('/ale-dashboard'),
    },
    {
      icono: <PhoneCall size={24} color="white" />,
      color: '#8d7583',
      titulo: 'Llamada',
      onClick: () => window.location.href = 'tel:911',
    },
    {
      icono: <User size={24} color="white" />,
      color: '#c8a6a6',
      titulo: 'Perfil',
      onClick: () => navigate('/perfil'),
    },
  ];

  return (
    <footer
      className="w-full z-50 flex-shrink-0"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(56, 42, 60, 0.25)', // Mucho más transparente
        backdropFilter: 'blur(30px) saturate(180%)', // Más blur y saturación
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)', // Borde cristalino
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.1)', // Sombra suave superior
        height: '80px',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-full w-full">
        {botones.map((boton, index) => (
          <button
            key={index}
            onClick={() => {
              console.log(`🔥 [DEBUG] Botón ${boton.titulo} clickeado`);
              try {
                boton.onClick();
                console.log(`✅ [DEBUG] Botón ${boton.titulo} ejecutado sin errores`);
              } catch (error) {
                console.error(`❌ [DEBUG] Error en botón ${boton.titulo}:`, error);
              }
            }}
            className="flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 group flex-1 h-full focus:outline-none focus:ring-0 active:outline-none"
            style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-1 transition-all duration-200 group-hover:scale-110"
              style={{
                backgroundColor: boton.color,
                boxShadow: `0 4px 20px ${boton.color}60`, // Sombra más pronunciada
              }}
            >
              {boton.icono}
            </div>
            <span
              className="text-xs font-medium text-white/95 group-hover:text-white transition-colors duration-200 text-center leading-tight drop-shadow-md"
              style={{ fontSize: '11px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {boton.titulo}
            </span>
          </button>
        ))}
      </div>
    </footer>
  );
};

export default FooterBottomNavigation;
