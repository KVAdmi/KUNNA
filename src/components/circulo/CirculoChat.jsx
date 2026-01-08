// src/components/circulo/CirculoChat.jsx
// Chat privado del círculo con moderación de AL-E

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabaseClient.js';
import aleObserver from '../../services/aleObserver.js';

export default function CirculoChat({ circuloId, userId }) {
  const [mensaje, setMensaje] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [interventionMessage, setInterventionMessage] = useState(null);
  const messagesEndRef = useRef(null);

  // Cargar mensajes iniciales
  useEffect(() => {
    if (circuloId) {
      cargarMensajes();
      suscribirMensajes();
    }
  }, [circuloId]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Registrar evento de chat en AL-E
  useEffect(() => {
    if (messages.length > 0) {
      aleObserver.trackChatActivity(userId, 'circulo', circuloId, messages.length);
    }
  }, [messages.length, userId, circuloId]);

  /**
   * Cargar mensajes del círculo
   */
  const cargarMensajes = async () => {
    try {
      const { data, error } = await supabase
        .from('circulo_messages')
        .select(`
          *,
          sender:sender_id (
            nombre_completo
          )
        `)
        .eq('circulo_id', circuloId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('[CirculoChat] Error cargando mensajes:', error);
    }
  };

  /**
   * Suscribirse a nuevos mensajes en tiempo real
   */
  const suscribirMensajes = () => {
    const channel = supabase
      .channel(`circulo_messages:${circuloId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'circulo_messages',
          filter: `circulo_id=eq.${circuloId}`
        },
        (payload) => {
          console.log('[CirculoChat] Nuevo mensaje:', payload.new);
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  /**
   * Enviar mensaje
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!mensaje.trim() || isLoading || isBlocked) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('circulo_messages')
        .insert({
          circulo_id: circuloId,
          sender_id: userId,
          mensaje: mensaje.trim(),
          tipo: 'texto'
        });

      if (error) throw error;
      
      setMensaje(''); // Limpiar input
      
    } catch (error) {
      console.error('[CirculoChat] Error enviando mensaje:', error);
      alert('Error al enviar mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Formatear fecha del mensaje
   */
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 1000 / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    
    return date.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      
      {/* Header del chat */}
      <div className="flex items-center justify-between p-4 border-b border-[#c8a6a6]/30 bg-[#f5e6ff]">
        <h3 className="font-semibold text-[#382a3c]">💬 Chat del Círculo</h3>
        <span className="text-xs text-[#8d7583]">
          {messages.length} mensajes
        </span>
      </div>

      {/* Intervención de AL-E si está bloqueado */}
      {interventionMessage && (
        <div className="p-3 m-3 bg-[#c1d43a]/10 border border-[#c1d43a]/30 rounded-lg">
          <p className="text-sm text-[#382a3c]">
            🤖 <strong>AL-E:</strong> {interventionMessage}
          </p>
        </div>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-[#8d7583]/60 py-8">
            <p>No hay mensajes aún</p>
            <p className="text-xs mt-2">Sé la primera en escribir 💜</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === userId;
            const isSystem = msg.tipo === 'alerta' || msg.tipo === 'check_in';
            
            // Mensajes del sistema (de salidas programadas, check-ins, SOS)
            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-3">
                  <div className="max-w-[85%] bg-[#c1d43a]/20 border border-[#c1d43a]/40 rounded-xl px-4 py-3 text-center">
                    <p className="text-sm text-[#382a3c] font-medium">
                      {msg.mensaje}
                    </p>
                    <p className="text-xs text-[#8d7583] mt-1">
                      {formatMessageTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            }
            
            // Mensajes normales de usuarios
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-[#382a3c] text-white rounded-br-md'
                      : 'bg-[#f5e6ff] text-[#382a3c] rounded-bl-md'
                  }`}
                >
                  {/* Nombre del usuario si no es propio */}
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1 text-[#8d7583]">
                      {msg.sender?.nombre_completo || 'Usuario'}
                    </p>
                  )}

                  {/* Contenido del mensaje */}
                  <p className="text-sm break-words">{msg.mensaje}</p>

                  {/* Timestamp */}
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-[#c8a6a6]' : 'text-[#8d7583]'
                    }`}
                  >
                    {formatMessageTime(msg.created_at)}
                  </p>

                  {/* Indicador si fue moderado */}
                  {msg.ale_moderation?.flagged && (
                    <p className="text-xs mt-1 text-[#c1d43a]">
                      ⚠️ Moderado por AL-E
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
        
        {/* Ref para auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-[#c8a6a6]/30 bg-[#f5e6ff]/50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder={
              isBlocked
                ? 'Temporalmente bloqueado'
                : 'Escribe un mensaje...'
            }
            disabled={isLoading || isBlocked}
            className="flex-1 px-4 py-2 border border-[#c8a6a6]/50 rounded-full focus:outline-none focus:ring-2 focus:ring-[#c1d43a] disabled:bg-[#8d7583]/10 disabled:cursor-not-allowed bg-white text-[#382a3c] placeholder-[#8d7583]/60"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!mensaje.trim() || isLoading || isBlocked}
            className="px-6 py-2 bg-[#382a3c] text-white rounded-full hover:bg-[#382a3c]/90 disabled:bg-[#8d7583]/30 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>

        {/* Contador de caracteres */}
        <p className="text-xs text-[#8d7583]/70 mt-2 text-right">
          {mensaje.length} / 500
        </p>
      </form>
    </div>
  );
}
