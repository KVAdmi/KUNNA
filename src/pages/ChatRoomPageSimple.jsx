import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Send, Loader2, AlertCircle, Paperclip, MessageCircle, Smile } from 'lucide-react';
import { format } from 'date-fns';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import '@/styles/android-fixes.css';

const ChatRoomPageSimple = () => {
  const { id: sala_id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [puedeEnviar, setPuedeEnviar] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [showInput, setShowInput] = useState(true);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const fetchRoom = useCallback(async () => {
    const { data, error } = await supabase
      .from('salas_comunidad')
      .select('*')
      .eq('id', sala_id)
      .single();
    if (error) setError('Sala no encontrada');
    else setRoom(data);
  }, [sala_id]);

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('mensajes_sala')
      .select('*, profile:profiles(id, username, foto_url)')
      .eq('sala_id', sala_id)
      .order('created_at', { ascending: true });
    if (error) setError('Error cargando mensajes');
    else {
      setMessages(data);
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [sala_id]);

  const verificarIngreso = useCallback(async () => {
    if (!user) return;
    
    // Simplemente registrar el ingreso sin validaciones complejas
    await supabase.from('usuarios_sala').upsert({
      sala_id,
      user_id: user.id,
      ingreso_en: new Date().toISOString(),
    });
    
    setPuedeEnviar(true);
  }, [sala_id, user]);

  useEffect(() => {
    fetchRoom();
    fetchMessages();
    verificarIngreso();
  }, [fetchRoom, fetchMessages, verificarIngreso]);

  useEffect(() => {
    const fetchVideoCallUrl = async () => {
      const { data, error } = await supabase
        .from('salas_comunidad')
        .select('url_videollamada')
        .eq('id', sala_id)
        .single();
      if (!error && data?.url_videollamada) setVideoCallUrl(data.url_videollamada);
    };
    if (sala_id) fetchVideoCallUrl();
  }, [sala_id]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat_sala_${sala_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes_sala',
        filter: `sala_id=eq.${sala_id}`,
      }, async (payload) => {
        // Evitar duplicados (si ya existe el mensaje con ese ID, no agregarlo)
        setMessages((prev) => {
          const existe = prev.some(m => m.id === payload.new.id);
          if (existe) return prev;
          
          // Si no existe, agregarlo con el perfil
          return [...prev, { 
            ...payload.new, 
            profile: null // El perfil se cargará después si es necesario
          }];
        });
        
        // Cargar perfil solo si el mensaje es de otro usuario
        if (payload.new.user_id !== user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, foto_url')
            .eq('id', payload.new.user_id)
            .single();
          
          if (profile) {
            setMessages((prev) => prev.map(m => 
              m.id === payload.new.id ? { ...m, profile } : m
            ));
          }
        }
        
        scrollToBottom();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [sala_id, user]);

  // Auto-hide input en scroll up, show en scroll down (Simplificado para móvil)
  useEffect(() => {
    const handleScroll = (e) => {
      const currentScrollTop = e.target.scrollTop;
      const scrollingDown = currentScrollTop > lastScrollTop;
      const scrollingUp = currentScrollTop < lastScrollTop;
      const nearBottom = (e.target.scrollHeight - currentScrollTop - e.target.clientHeight) < 100;
      
      // Solo auto-hide si está muy arriba y scrolleando hacia arriba
      if (scrollingUp && currentScrollTop > 400) {
        setShowInput(false);
      } else if (nearBottom && scrollingDown) {
        // Solo auto-show si está cerca del bottom
        setShowInput(true);
      }
      
      setLastScrollTop(currentScrollTop);
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollTop]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!puedeEnviar) {
      toast({
        variant: 'destructive',
        title: 'Debes salir de la sala anterior antes de enviar mensajes.',
      });
      return;
    }
    
    const nuevoMensaje = {
      id: crypto.randomUUID(),
      sala_id,
      user_id: user.id,
      contenido: newMessage,
      tipo: 'text',
      created_at: new Date().toISOString(),
      profile: {
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'Usuario',
        foto_url: user.user_metadata?.foto_url || user.user_metadata?.avatar_url
      }
    };
    
    // Agregar mensaje inmediatamente (optimistic update)
    setMessages((prev) => [...prev, nuevoMensaje]);
    setNewMessage('');
    setShowInput(true);
    setTimeout(scrollToBottom, 100);
    
    // Guardar en base de datos
    const { error } = await supabase.from('mensajes_sala').insert({
      id: nuevoMensaje.id,
      sala_id: nuevoMensaje.sala_id,
      user_id: nuevoMensaje.user_id,
      contenido: nuevoMensaje.contenido,
      tipo: nuevoMensaje.tipo,
      created_at: nuevoMensaje.created_at,
    });
    
    if (error) {
      // Si falla, remover el mensaje optimista
      setMessages((prev) => prev.filter(m => m.id !== nuevoMensaje.id));
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo enviar tu mensaje.' });
    }
  };

  const handleExitRoom = async () => {
    await supabase
      .from('usuarios_sala')
      .update({ salio_en: new Date().toISOString() })
      .eq('sala_id', sala_id)
      .is('salio_en', null);
    navigate('/comunidad/salas');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[100dvh]">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>{error}</p>
        <Button variant="link" className="mt-4" onClick={() => navigate('/comunidad/salas')}>
          Volver a las salas
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-br from-[#f5e6ff] via-[#e8d5ff] to-[#dcc4ff]">
      <Helmet>
        <title>{room?.nombre || 'Sala de Chat'} - Comunidad KUNNA</title>
      </Helmet>

      {/* Header cuadrado que tapa todo el fondo */}
      <header className="bg-gradient-to-r from-[#382a3c] via-[#4a3548] to-[#382a3c] shadow-lg p-4 relative overflow-hidden">
        {/* Efecto de brillo de fondo suave */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        
        <div className="flex items-center space-x-3 relative z-10">
          {/* Botón de salir redondo y hermoso */}
          <motion.button
            onClick={handleExitRoom}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c8a6a6] to-[#d4b5b5] text-[#382a3c] font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            ←
          </motion.button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate flex items-center gap-2">
              <div className="w-3 h-3 bg-[#c8a6a6] rounded-full animate-pulse"></div>
              {room?.nombre}
            </h1>
          </div>
        </div>
      </header>

      {/* Área de mensajes con degradado hermoso */}
      <main 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 transition-all duration-300 relative" 
        style={{ 
          paddingBottom: '200px',
          background: 'linear-gradient(135deg, #c8a6a6 0%, #d4b5b5 25%, #e0c4c4 50%, #d4b5b5 75%, #c8a6a6 100%)'
        }}
      >
        {/* Patrón de fondo sutil hermoso */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #382a3c 1px, transparent 1px), radial-gradient(circle at 75% 75%, #ffffff 0.5px, transparent 0.5px)`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Efecto de brillo sutil en el fondo */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-white/20 via-transparent to-[#382a3c]/10"></div>
        </div>

        <div className="space-y-4 relative z-10">
          {messages.length === 0 && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#382a3c] to-[#4a3548] flex items-center justify-center shadow-lg">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 max-w-sm mx-auto shadow-lg">
                <p className="text-[#382a3c] text-lg font-medium mb-2 text-center">¡Inicia la conversación!</p>
                <p className="text-[#382a3c]/70 text-sm text-center">Sé la primera en compartir algo hermoso</p>
              </div>
            </motion.div>
          )}
          
          {messages.map((msg, index) => {
            const isMe = msg.user_id === user.id;
            const isFirstInGroup = index === 0 || messages[index - 1].user_id !== msg.user_id;
            
            return (
              <motion.div 
                key={msg.id} 
                className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30,
                  delay: index * 0.05 
                }}
              >
                {/* Avatar con efectos */}
                {!isMe && isFirstInGroup && (
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#382a3c] to-[#4a3548] p-0.5">
                      <img 
                        src={msg.profile?.foto_url || 'https://via.placeholder.com/40'} 
                        alt="avatar" 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-[#382a3c] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#382a3c] rounded-full"></div>
                    </div>
                  </motion.div>
                )}
                
                {!isMe && !isFirstInGroup && <div className="w-10"></div>}

                {/* Burbuja de mensaje espectacular */}
                <motion.div 
                  className={`relative max-w-xs group ${isMe ? 'order-first' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {/* Contenido del mensaje estilo WhatsApp */}
                  <div className={`p-3 relative overflow-hidden ${
                    isMe 
                      ? 'bg-[#382a3c] text-white shadow-lg rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md' 
                      : 'bg-white text-[#382a3c] shadow-md rounded-tl-md rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
                  }`}>
                    
                    {/* Nombre del usuario con username real */}
                    {!isMe && isFirstInGroup && (
                      <div className="mb-1">
                        <p className="text-xs font-bold text-[#382a3c] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-[#382a3c] rounded-full"></span>
                          {msg.profile?.username || 'Anónima'}
                        </p>
                      </div>
                    )}
                    
                    {/* Contenido del mensaje */}
                    <p className="leading-relaxed text-sm">{msg.contenido}</p>
                    
                    {/* Timestamp pequeñito estilo WhatsApp */}
                    <div className={`flex justify-end mt-1 ${
                      isMe ? 'text-white/60' : 'text-[#382a3c]/50'
                    }`}>
                      <span className="text-xs">
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Área de input con degradado hermoso que tape todo */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl transition-all duration-200 ease-out ${
          showEmojiPicker 
            ? 'bg-gradient-to-t from-[#382a3c] via-[#4a3548] to-[#5a4558]' 
            : 'bg-gradient-to-t from-[#382a3c] via-[#4a3548] to-[#c8a6a6]/80'
        }`}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 20px)',
          transform: 'translateZ(0)',
          willChange: 'transform, height',
          height: showEmojiPicker ? '420px' : '140px',
          background: showEmojiPicker 
            ? 'linear-gradient(to top, #382a3c 0%, #4a3548 40%, #5a4558 70%, #6a5668 100%)'
            : 'linear-gradient(to top, #382a3c 0%, #4a3548 30%, #5a4558 60%, #c8a6a6 100%)',
          transition: 'height 0.2s ease-out, background 0.2s ease-out'
        }}
      >
        <div className="p-4 pb-8 pt-6">
          {/* Picker de emojis con fondo completo */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div 
                className="mb-4 rounded-3xl overflow-hidden shadow-xl border border-white/30 bg-white backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)',
                  backdropFilter: 'blur(20px)'
                }}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30,
                  duration: 0.15
                }}
              >
                {/* Fondo sólido para tapar el rosa */}
                <div className="absolute inset-0 bg-white rounded-3xl"></div>
                <div className="max-h-64 overflow-hidden relative z-10">
                  <Picker
                    onEmojiSelect={(emoji) => {
                      const char = emoji.native || '';
                      setNewMessage((prev) => prev + char);
                      setShowEmojiPicker(false);
                    }}
                    theme="light"
                    locale="es"
                    previewPosition="none"
                    skinTonePosition="none"
                  />
                </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Formulario de mensaje hermoso */}
              <form onSubmit={handleSendMessage}>
                <div className="relative">
                  <motion.div
                    className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden mx-2"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {/* Efecto de brillo animado hermoso */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: [-100, 400],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    
                    <div className="flex items-center gap-3 p-4 relative z-10">
                      {/* Botón de emojis hermoso */}
                      <motion.button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 rounded-full bg-gradient-to-r from-[#382a3c] to-[#4a3548] text-white shadow-lg hover:shadow-xl transition-all duration-300 shrink-0"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Smile className="w-5 h-5" />
                      </motion.button>
                      
                      {/* Input hermoso */}
                      <motion.input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe algo hermoso..."
                        className="flex-1 bg-transparent border-none outline-none text-[#382a3c] placeholder-[#382a3c]/60 text-base py-2"
                        style={{ 
                          fontSize: '16px',
                          WebkitAppearance: 'none',
                          appearance: 'none',
                          borderRadius: 0,
                          touchAction: 'manipulation'
                        }}
                        autoComplete="off"
                        onFocus={(e) => {
                          // Prevenir que el teclado cause scroll issues
                          if (window.innerHeight < 600) {
                            setTimeout(() => {
                              e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 300);
                          }
                        }}
                        whileFocus={{
                          scale: 1.01
                        }}
                      />
                      
                      {/* Botón de envío hermoso */}
                      <motion.button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`p-3 rounded-full transition-all duration-300 shrink-0 ${
                          newMessage.trim() 
                            ? 'bg-gradient-to-r from-[#382a3c] to-[#4a3548] text-white shadow-lg hover:shadow-xl' 
                            : 'bg-[#382a3c]/20 text-[#382a3c]/50'
                        }`}
                        whileHover={newMessage.trim() ? { 
                          scale: 1.1, 
                          rotate: 15,
                          boxShadow: "0 8px 25px rgba(56, 42, 60, 0.4)"
                        } : {}}
                        whileTap={newMessage.trim() ? { scale: 0.9 } : {}}
                      >
                        <Send className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    };

    export default ChatRoomPageSimple;
