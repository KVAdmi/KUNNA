// ✅ FooterBottomNavigation.jsx - SOS Simplificado
import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, User, Home } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient';

const FooterBottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [grabando, setGrabando] = useState(false);

  // Función SOS SIMPLIFICADA - Envía ubicación inmediatamente
  const handleSOS = async () => {
    if (grabando) return;
    setGrabando(true);

    try {
      console.log('🚨 SOS INICIADO');
      toast({ title: '🚨 SOS ACTIVADO', description: 'Obteniendo ubicación...' });

      // 1. Verificar usuario
      if (!user) {
        toast({ variant: 'destructive', title: '❌ Error', description: 'No hay sesión activa' });
        setGrabando(false);
        return;
      }

      // 2. Buscar contacto de emergencia
      console.log('📞 Buscando contactos de emergencia...');
      const { data: contactos, error: errContactos } = await supabase
        .from('contactos_emergencia')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('prioridad', { ascending: true });

      console.log('Contactos encontrados:', contactos);

      if (errContactos || !contactos || contactos.length === 0) {
        toast({ 
          variant: 'destructive', 
          title: '❌ Sin contactos', 
          description: 'Debes agregar contactos de emergencia en tu perfil primero' 
        });
        setGrabando(false);
        return;
      }

      const contacto = contactos[0];
      const numero = (contacto.telefono || '').replace(/\D/g, '');

      if (!numero || numero.length < 10) {
        toast({ variant: 'destructive', title: '❌ Error', description: 'Teléfono de contacto inválido' });
        setGrabando(false);
        return;
      }

      // 3. Obtener ubicación (simplificado)
      console.log('📍 Obteniendo ubicación GPS...');
      let lat = 0, lon = 0, precision = 0;
      
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        precision = position.coords.accuracy;
        console.log(`✅ Ubicación obtenida: ${lat}, ${lon}`);
      } catch (error) {
        console.warn('⚠️ No se pudo obtener ubicación precisa:', error);
        toast({ 
          title: '⚠️ Sin GPS', 
          description: 'Enviando SOS sin ubicación precisa'
        });
      }

      // 4. Crear mensaje de WhatsApp
      const mensajeWA = `🚨 EMERGENCIA KUNNA 🚨

Esta persona necesita ayuda URGENTE.

${lat !== 0 ? `📍 Ubicación: https://maps.google.com/?q=${lat},${lon}
Precisión: ${Math.round(precision)}m` : '⚠️ Sin ubicación GPS disponible'}

⏰ ${new Date().toLocaleString('es-MX')}

Enviado desde KUNNA - App de Seguridad para Mujeres`;

      console.log('💬 Mensaje WhatsApp creado');

      // 5. Abrir WhatsApp INMEDIATAMENTE
      const waUrl = `https://wa.me/${numero}?text=${encodeURIComponent(mensajeWA)}`;
      console.log('📱 Abriendo WhatsApp:', waUrl);
      window.location.href = waUrl; // Usar location.href en vez de window.open

      // 6. Guardar evento en background
      try {
        await supabase.from('eventos_peligro').insert({
          user_id: user.id,
          latitud: lat,
          longitud: lon,
          mensaje: mensajeWA,
          enviado: true,
          created_at: new Date().toISOString()
        });
        console.log('✅ Evento guardado en DB');
      } catch (dbError) {
        console.error('Error guardando en DB:', dbError);
      }

      toast({ 
        title: '✅ SOS ENVIADO', 
        description: `Enviando a ${contacto.nombre || contacto.telefono}`
      });

    } catch (error) {
      console.error('❌ Error SOS:', error);
      toast({ 
        variant: 'destructive', 
        title: '❌ Error', 
        description: error.message || 'Error al enviar SOS'
      });
    } finally {
      setGrabando(false);
    }
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
      color: '#490000',
      titulo: 'SOS',
      onClick: handleSOS,
      disabled: grabando
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
