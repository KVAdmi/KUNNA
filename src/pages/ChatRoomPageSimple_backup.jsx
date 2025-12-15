import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Send, Loader2, AlertCircle, Video, Users, Paperclip, MessageCircle, Smile } from 'lucide-react';
import { format } from 'date-fns';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import '@/styles/android-fixes.css';
import SimpleVideoCall from '@/components/SimpleVideoCall';

const useSalaConectadas = (salaId) => {
  const [conectadas, setConectadas] = useState(0);
  useEffect(() => {
    const obtenerConectadas = async () => {
      const { data, error } = await supabase
        .from('salas_comunidad')
        .select('conectadas')
        .eq('id', salaId)
        .single();
      if (!error && data) setConectadas(data.conectadas);
    };
    obtenerConectadas();
  }, [salaId]);
  return conectadas;
};

const ChatRoomPageSimple = () => {
  const { id: sala_id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const conectadas = useSalaConectadas(sala_id);
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
  const [videoCallUrl, setVideoCallUrl] = useState(null);
  const [showEmbeddedVideo, setShowEmbeddedVideo] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  const iniciarVideollamada = async () => {
    try {
      const roomName = `zinha-${sala_id}-${Date.now()}`;
      const dailyUrl = `https://zinha.daily.co/${roomName}`;
      
      toast({
        title: '🎥 Iniciando videollamada',
        description: 'Conectando a la sala...',
      });

      setTimeout(() => {
        setVideoCallUrl(dailyUrl);
        setShowEmbeddedVideo(true);
      }, 1000);

    } catch (error) {
      toast({
        title: '❌ Error en videollamada',
        description: 'Intentando con sala alternativa...',
        variant: 'destructive',
      });
      
      const jitsiUrl = `https://meet.jit.si/ZinhaPrivada-${sala_id}-${Date.now()}`;
      setVideoCallUrl(jitsiUrl);
      setShowEmbeddedVideo(true);
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data: roomData, error: roomError } = await supabase
          .from('salas_comunidad')
          .select('*')
          .eq('id', sala_id)
          .single();

        if (roomError) throw roomError;
        
        setRoom(roomData);
        const { data: messagesData, error: messagesError } = await supabase
          .from('mensajes_comunidad')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('sala_id', sala_id)
          .order('creado_en', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messagesData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [sala_id]);

  useEffect(() => {
    if (!user) return;

    const marcarEntrada = async () => {
      await supabase
        .from('participantes_sala')
        .upsert({
          sala_id: parseInt(sala_id),
          user_id: user.id,
          entro_en: new Date().toISOString()
        }, {
          onConflict: 'sala_id,user_id'
        });
    };

    marcarEntrada();
  }, [sala_id, user]);

  useEffect(() => {
    const channel = supabase
      .channel(`sala_${sala_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes_comunidad',
        filter: `sala_id=eq.${sala_id}`
      }, async (payload) => {
        const { data: newMessageWithProfile } = await supabase
          .from('mensajes_comunidad')
          .select(`
            *,
            profile:profiles(*)
          `)
          .eq('id', payload.new.id)
          .single();

        if (newMessageWithProfile) {
          setMessages(prev => [...prev, newMessageWithProfile]);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [sala_id]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = (e) => {
      const scrollTop = e.target.scrollTop;
      const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
      setLastScrollTop(scrollTop);
    };

    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollTop]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase.from('mensajes_comunidad').insert({
        contenido: newMessage.trim(),
        sala_id: parseInt(sala_id),
        user_id: user.id
      });
      if (error) throw error;
      setNewMessage('');
      setShowEmojiPicker(false);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje',
        variant: 'destructive',
      });
    }
  };

  const handleExitRoom = async () => {
    await supabase
      .from('participantes_sala')
      .update({ salio_en: new Date().toISOString() })
      .eq('sala_id', sala_id)
      .is('salio_en', null);
    navigate('/comunidad/salas');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#f5e6ff] via-[#e8d5ff] to-[#dcc4ff]">
      <Helmet>
        <title>{room?.nombre || 'Sala de Chat'} - Comunidad Zinha</title>
      </Helmet>

      {/* Header */}
      <header className="bg-gradient-to-r from-[#382a3c] via-[#8d7583] to-[#382a3c] shadow-xl p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="flex items-center space-x-3 relative z-10">
          <motion.button
            onClick={handleExitRoom}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c1d43a] to-[#a8c234] text-[#382a3c] font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            ←
          </motion.button>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate flex items-center gap-2">
              <div className="w-3 h-3 bg-[#c1d43a] rounded-full animate-pulse"></div>
              {room?.nombre}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                <Users className="w-3 h-3 text-[#c1d43a]" />
                <span className="text-xs text-white font-medium">{conectadas}/50</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${room?.esta_activa ? 'bg-[#c1d43a]' : 'bg-[#c8a6a6]'} animate-pulse`} />
                <span className="text-xs text-white/90">{room?.esta_activa ? 'En vivo' : 'Pausada'}</span>
              </div>
            </div>
          </div>
          
          <motion.button
            onClick={iniciarVideollamada}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-[#c8a6a6] to-[#8d7583] text-white shadow-lg hover:shadow-xl flex items-center justify-center relative overflow-hidden"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full transform scale-0 hover:scale-100 transition-transform duration-300"></div>
            <Video className="w-5 h-5 relative z-10" />
          </motion.button>
        </div>
      </header>

      {/* Área de mensajes */}
      <main 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 transition-all duration-300 relative" 
        style={{ paddingBottom: '200px' }}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #382a3c 2px, transparent 2px), radial-gradient(circle at 75% 75%, #c8a6a6 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="space-y-4 relative z-10">
          {messages.length === 0 && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#c8a6a6] to-[#8d7583] flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <p className="text-[#382a3c] text-lg font-medium mb-2">¡Inicia la conversación!</p>
              <p className="text-[#8d7583] text-sm">Sé la primera en compartir algo hermoso</p>
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
                {!isMe && isFirstInGroup && (
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c8a6a6] to-[#8d7583] p-0.5">
                      <img 
                        src={msg.profile?.foto_url || 'https://via.placeholder.com/40'} 
                        alt="avatar" 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#c1d43a] rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#382a3c] rounded-full"></div>
                    </div>
                  </motion.div>
                )}
                
                {!isMe && !isFirstInGroup && <div className="w-10"></div>}

                <motion.div 
                  className={`relative max-w-xs group ${isMe ? 'order-first' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className={`p-4 rounded-2xl shadow-lg backdrop-blur-sm border relative z-10 ${
                    isMe 
                      ? 'bg-gradient-to-r from-[#382a3c] to-[#8d7583] text-white border-[#8d7583]/20' 
                      : 'bg-white/80 text-[#382a3c] border-[#c8a6a6]/20'
                  }`}>
                    {!isMe && isFirstInGroup && (
                      <div className="font-bold text-xs mb-1 text-[#8d7583]">
                        {msg.profile?.nombre || 'Usuario'}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed break-words">{msg.contenido}</p>
                    <div className={`text-xs mt-2 flex items-center gap-1 ${
                      isMe ? 'text-white/70 justify-end' : 'text-[#8d7583] justify-start'
                    }`}>
                      <span className="text-xs bg-black/10 backdrop-blur-sm rounded-full px-2 py-0.5">
                        {format(new Date(msg.creado_en), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                    isMe 
                      ? '-right-1 bg-gradient-to-r from-[#382a3c] to-[#8d7583]' 
                      : '-left-1 bg-white/80 border-l border-t border-[#c8a6a6]/20'
                  }`}></div>
                </motion.div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Área de input */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#f5e6ff] via-[#e8d5ff] to-transparent backdrop-blur-xl border-t border-[#c8a6a6]/30 chat-input-area">
        <div className="p-4 pb-6">
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div 
                className="mb-4 rounded-2xl overflow-hidden shadow-2xl border border-[#c8a6a6]/30 bg-white/95 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <div className="max-h-64 overflow-hidden">
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

          <form onSubmit={handleSendMessage}>
            <div className="relative">
              <motion.div
                className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-[#c8a6a6]/30 overflow-hidden"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c1d43a]/20 to-transparent"
                  animate={{
                    x: [-100, 400],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                <div className="flex items-center gap-3 p-3 relative z-10">
                  <motion.button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 rounded-full bg-gradient-to-r from-[#c8a6a6] to-[#8d7583] text-white shadow-lg hover:shadow-xl transition-all duration-300 shrink-0"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Smile className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe algo hermoso..."
                    className="flex-1 bg-transparent border-none outline-none text-[#382a3c] placeholder-[#8d7583]/60 text-base py-2"
                    style={{ fontSize: '16px' }}
                    autoComplete="off"
                    whileFocus={{
                      scale: 1.01
                    }}
                  />
                  
                  <motion.button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className={`p-2 rounded-full shadow-lg transition-all duration-300 shrink-0 ${
                      newMessage.trim() 
                        ? 'bg-gradient-to-r from-[#c1d43a] to-[#a8c234] text-[#382a3c] hover:shadow-xl' 
                        : 'bg-[#8d7583]/30 text-[#8d7583]/60 cursor-not-allowed'
                    }`}
                    animate={newMessage.trim() ? {
                      scale: [1, 1.1, 1],
                      rotate: 15,
                      boxShadow: "0 10px 30px rgba(193, 212, 58, 0.4)"
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

      <SimpleVideoCall
        roomUrl={videoCallUrl}
        onClose={() => {
          setShowEmbeddedVideo(false);
          setVideoCallUrl(null);
        }}
        isVisible={showEmbeddedVideo}
        roomName={room?.nombre || 'Sala Zinha'}
      />
    </div>
  );
};

export default ChatRoomPageSimple;
