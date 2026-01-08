/**
 * HOOK DE CHAT CON MODERACIÓN AL-E
 * 
 * Chat en tiempo real con moderación automática
 */

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import moderationService from '../services/moderationService';
import aleObserver from '../services/aleObserver';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useModeratedChat(roomId) {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (roomId && user) {
      cargarMensajes();
      suscribirMensajes();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [roomId, user]);

  /**
   * Cargar mensajes históricos
   */
  const cargarMensajes = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:user_id (
            nombre_completo,
            avatar_url
          )
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMensajes(data || []);
      setCargando(false);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      setCargando(false);
    }
  };

  /**
   * Suscribirse a nuevos mensajes en tiempo real
   */
  const suscribirMensajes = () => {
    subscriptionRef.current = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          // Obtener datos completos del perfil
          const { data: perfilData } = await supabase
            .from('profiles')
            .select('nombre_completo, avatar_url')
            .eq('user_id', payload.new.user_id)
            .single();

          const nuevoMensaje = {
            ...payload.new,
            profiles: perfilData
          };

          setMensajes(prev => [...prev, nuevoMensaje]);

          // Auto-scroll al final
          setTimeout(() => {
            const chatContainer = document.getElementById('chat-container');
            if (chatContainer) {
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }
          }, 100);
        }
      )
      .subscribe();
  };

  /**
   * Enviar mensaje con moderación
   */
  const enviarMensaje = async (contenido) => {
    if (!contenido.trim()) return { success: false };

    setEnviando(true);

    try {
      // 1. MODERAR CON AL-E EN TIEMPO REAL
      const moderation = await moderationService.moderateChatMessage(
        contenido,
        user.id,
        roomId
      );

      if (!moderation.allowed) {
        toast.error(moderation.reason, {
          icon: '🛡️',
          duration: 4000
        });

        // Si es contenido grave, mostrar intervención
        if (moderation.intervention) {
          showIntervention(moderation.intervention);
        }

        // Registrar intento rechazado
        aleObserver.track('chat_message_rejected', {
          room_id: roomId,
          severity: moderation.severity,
          reason: moderation.reason
        });

        return { success: false, reason: moderation.reason };
      }

      // 2. INSERTAR MENSAJE
      const { data, error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          contenido,
          moderated: true,
          moderated_by: 'ale_auto'
        })
        .select()
        .single();

      if (error) throw error;

      // 3. NOTIFICAR A AL-E
      aleObserver.trackChatMessage(roomId, contenido.length);

      return { success: true, data };
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      toast.error('Error al enviar mensaje');
      return { success: false, error };
    } finally {
      setEnviando(false);
    }
  };

  /**
   * Mostrar intervención de AL-E
   */
  const showIntervention = (intervention) => {
    // Mostrar modal o notificación especial
    toast(
      (t) => (
        <div className="space-y-2">
          <p className="font-semibold">{intervention.title}</p>
          <p className="text-sm">{intervention.message}</p>
          <div className="flex gap-2 mt-3">
            {intervention.actions?.map((action, i) => (
              <button
                key={i}
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1 bg-purple-500 text-white rounded text-sm"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      ),
      {
        duration: 8000,
        icon: '💜'
      }
    );
  };

  /**
   * Reportar mensaje
   */
  const reportarMensaje = async (mensajeId, razon) => {
    try {
      await moderationService.reportContent(
        mensajeId,
        'message',
        razon,
        user.id
      );

      toast.success('Gracias por reportar. Revisaremos esto pronto.');
    } catch (error) {
      console.error('Error reportando mensaje:', error);
      toast.error('Error al reportar mensaje');
    }
  };

  return {
    mensajes,
    cargando,
    enviando,
    enviarMensaje,
    reportarMensaje,
    recargarMensajes: cargarMensajes
  };
}

export default useModeratedChat;
