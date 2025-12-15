import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/customSupabaseClient'
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Send, Loader2, AlertCircle, Users, Paperclip, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';


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

const ChatRoomPage = () => {
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
  const [headerMinimized, setHeaderMinimized] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

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
    else setMessages(data);
    setLoading(false);
  }, [sala_id]);

  const verificarIngreso = useCallback(async () => {
    if (!user?.id) return;
    const { data: sesionesActivas, error } = await supabase
      .from('usuarios_sala')
      .select('*')
      .eq('user_id', user.id)
      .is('salio_en', null);
    if (error) return;
    if (sesionesActivas.length > 0 && sesionesActivas[0].sala_id !== sala_id) {
      toast({
        variant: 'destructive',
        title: 'Despídete antes de salir 🫆',
        description: 'Solo puedes estar en una sala a la vez.',
      });
      navigate('/comunidad/salas');
    } else if (sesionesActivas.length === 0) {
      setPuedeEnviar(true);
    }
  }, [sala_id, user, toast, navigate]);

  useEffect(() => {
    fetchRoom();
    fetchMessages();
    verificarIngreso();
  }, [fetchRoom, fetchMessages, verificarIngreso]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat_sala_${sala_id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes_sala',
        filter: `sala_id=eq.${sala_id}`,
      }, async (payload) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, foto_url')
          .eq('id', payload.new.user_id)
          .single();
        setMessages((prev) => [...prev, { ...payload.new, profile }]);
        scrollToBottom();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [sala_id]);

  // Manejo mejorado del teclado virtual para Android (versión estable)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let resizeTimer = null;
    let isResizing = false;
    const initialViewportHeight = window.innerHeight;
    const threshold = 150; // Umbral mínimo para considerar que el teclado está abierto
    
    const handleKeyboardChange = (currentHeight) => {
      const heightDifference = initialViewportHeight - currentHeight;
      const keyboardIsOpen = heightDifference > threshold;
      
      // Solo actualizar si hay un cambio real de estado
      if (keyboardIsOpen !== isKeyboardOpen) {
        setIsKeyboardOpen(keyboardIsOpen);
        setKeyboardHeight(keyboardIsOpen ? heightDifference : 0);
        setHeaderMinimized(keyboardIsOpen);
        
        if (keyboardIsOpen) {
          // Pequeño delay para el scroll cuando se abre el teclado
          setTimeout(() => {
            scrollToBottom();
          }, 150);
        }
      }
    };

    const debouncedResize = () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      
      resizeTimer = setTimeout(() => {
        if (!isResizing) {
          isResizing = true;
          handleKeyboardChange(window.innerHeight);
          
          // Reset flag después de un breve delay
          setTimeout(() => {
            isResizing = false;
          }, 100);
        }
      }, 50); // Debounce de 50ms
    };

    // Usar solo resize estándar con debouncing
    window.addEventListener('resize', debouncedResize, { passive: true });

    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
    };
  }, [isKeyboardOpen]); // Dependencia importante para evitar loops

  // Manejo de scroll para minimizar header
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current && !isKeyboardOpen) {
        const scrollTop = chatContainerRef.current.scrollTop;
        setHeaderMinimized(scrollTop > 50);
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [isKeyboardOpen]);

  // useEffect para enfocar el input programáticamente (simplificado para Android)
  useEffect(() => {
    if (!inputRef.current || loading || !room) return;

    const focusInput = () => {
      try {
        // Enfocar sin scroll automático
        inputRef.current.focus({ preventScroll: true });
      } catch (error) {
        // Fallback para navegadores que no soportan preventScroll
        inputRef.current.focus();
      }
    };

    // Retraso único sin múltiples intentos
    const focusTimeout = setTimeout(focusInput, 200);

    return () => {
      clearTimeout(focusTimeout);
    };
  }, [loading, room]); // Solo depende de loading y room
  // Este código fue eliminado para evitar el "teclado tembloroso" en Android.
  // Si necesitas manejar el layout con el teclado virtual, considera:
  // 1. La Virtual Keyboard API (si es compatible con tus navegadores objetivo).
  // 2. Ajustes CSS con `env(keyboard-inset-height)` si tu entorno lo soporta.
  // 3. La meta tag `interactive-widget=resizes-content` en tu `index.html`.
  /*
  useEffect(() => {
    if (window.visualViewport) {
      const handleViewportResize = () => {
        const viewportHeight = window.visualViewport.height; // Altura del viewport visible
        const documentHeight = document.documentElement.clientHeight; // Altura total del documento
        const keyboardHeight = documentHeight - viewportHeight; // Altura del teclado

        // Solo aplica el padding si el teclado está visible y es significativo
        if (keyboardHeight > 0 && keyboardHeight > 50) { // Umbral para evitar pequeños temblores
          document.documentElement.style.setProperty('--keyboard-inset-height', `${keyboardHeight}px`);
        } else {
          document.documentElement.style.removeProperty('--keyboard-inset-height');
        }

        // Ajustar el scroll para mantener el input visible
        if (inputRef.current) {
          inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      };

      window.visualViewport.addEventListener("resize", handleViewportResize);

      return () => {
        window.visualViewport.removeEventListener("resize", handleViewportResize);
        document.documentElement.style.removeProperty('--keyboard-inset-height');
      };
    }
  }, []);
  */

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user?.id || !sala_id || !newMessage.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Faltan datos obligatorios para enviar el mensaje.',
      });
      return;
    }
    if (!puedeEnviar) {
      toast({
        variant: 'destructive',
        title: 'Debes salir de la sala anterior antes de enviar mensajes.',
      });
      return;
    }
    const { error } = await supabase.from('mensajes_sala').insert({
      id: crypto.randomUUID(),
      sala_id,
      user_id: user.id,
      contenido: newMessage,
      tipo: 'text',
      created_at: new Date().toISOString(),
    });
    if (!error) setNewMessage('');
    else toast({ variant: 'destructive', title: 'Error', description: 'No se pudo enviar tu mensaje.' });
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
    <div 
      className={`chat-container flex flex-col bg-gray-50 android-fix ${isKeyboardOpen ? 'keyboard-open' : ''}`}
      style={{
        paddingBottom: isKeyboardOpen ? `${keyboardHeight}px` : '0px',
        transition: 'padding-bottom 0.2s ease-in-out'
      }}
    >
      <Helmet>
        <title>{room?.nombre || 'Sala de Chat'} - Comunidad KUNNA</title>
      </Helmet>

      {/* Header dinámico que se minimiza */}
      <motion.header 
        className="dynamic-header mobile-header bg-white shadow-md flex items-center justify-between"
        initial={false}
        animate={{
          height: headerMinimized ? '60px' : '80px',
          paddingTop: headerMinimized ? '8px' : '12px',
          paddingBottom: headerMinimized ? '8px' : '12px'
        }}
        transition={{ duration: 0.2 }}
        style={{
          paddingLeft: '8px',
          paddingRight: '8px'
        }}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExitRoom} 
            className="text-white bg-green-600 hover:bg-green-700 shrink-0"
          >
            Salir
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className={`font-bold text-gray-800 truncate transition-all duration-200 ${headerMinimized ? 'text-sm' : 'text-lg'}`}>
              {room?.nombre}
            </h1>
            {!headerMinimized && (
              <motion.div
                initial={{ opacity: 1, height: 'auto' }}
                animate={{ opacity: headerMinimized ? 0 : 1, height: headerMinimized ? 0 : 'auto' }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm text-gray-500 truncate max-w-[200px]">{room?.descripcion}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">{conectadas}/50</span>
                  <span className={`w-2 h-2 rounded-full ${room?.esta_activa ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-gray-600">{room?.esta_activa ? 'Activa' : 'Sin llamada'}</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Indicador de minimización */}
        {headerMinimized && (
          <motion.button
            className="ml-2 text-gray-400"
            onClick={() => setHeaderMinimized(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </motion.header>

      {/* Contenedor principal de mensajes con scroll mejorado */}
      <main 
        ref={chatContainerRef}
        className="flex-1 chat-messages-container p-4 min-h-0 no-bounce"
        style={{
          paddingTop: headerMinimized ? '68px' : '88px',
          paddingBottom: isKeyboardOpen ? '100px' : '120px',
          transition: 'padding 0.2s ease-in-out'
        }}
      >
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.p 
              className="text-center text-gray-400 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No hay mensajes aún.
            </motion.p>
          )}
          {messages.map((msg) => {
            const isMe = msg.user_id === user.id;
            return (
              <motion.div 
                key={msg.id} 
                layout 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`flex gap-2 my-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <img 
                    src={msg.profile?.foto_url || 'https://via.placeholder.com/40'} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full object-cover self-start" 
                  />
                )}
                <div className={`p-3 rounded-2xl max-w-xs ${isMe ? 'bg-pink-500 text-white' : 'bg-white text-gray-800 shadow-sm'}`}>
                  {!isMe && <p className="text-sm font-bold text-pink-600">{msg.profile?.username || 'Anónima'}</p>}
                  <p>{msg.contenido}</p>
                  <p className="text-xs mt-1 text-right">{format(new Date(msg.created_at), 'HH:mm')}</p>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </main>

      {/* Área de entrada mejorada para Android */}
      <motion.div 
        className="chat-input-fixed keyboard-aware bg-white px-4 pt-2 pb-6 border-t border-gray-200"
        initial={false}
        animate={{
          y: isKeyboardOpen ? 0 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            onTouchStart={(e) => {
              // Prevenir el blur del input en Android
              e.preventDefault();
            }}
            onMouseDown={(e) => {
              // Prevenir el blur del input
              e.preventDefault();
            }}
            className="shrink-0"
          >
            <Paperclip />
          </Button>

          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe algo..."
            className="flex-1 p-3 border rounded-full focus:outline-none bg-white text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="sentences"
            autoCorrect="on"
            spellCheck="true"
            onFocus={() => {
              // Scroll simple sin múltiples llamadas
              setTimeout(scrollToBottom, 300);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            style={{
              fontSize: '16px',
              WebkitAppearance: 'none',
              touchAction: 'manipulation'
            }}
          />

          <Button 
            type="submit" 
            className="rounded-full bg-pink-600 text-white w-12 h-12 shrink-0"
            onTouchStart={(e) => {
              // Feedback visual mejorado para Android
              e.currentTarget.style.transform = 'scale(0.9)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseDown={(e) => {
              // Prevenir blur del input al hacer click en enviar
              e.preventDefault();
            }}
            disabled={!newMessage.trim()}
          >
            <Send />
          </Button>
        </form>

        {/* Picker de emojis mejorado */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div 
              className="mt-2 max-h-64 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Picker
                onEmojiSelect={(emoji) => {
                  const char = emoji.native || '';
                  setNewMessage((prev) => prev + char);
                  setShowEmojiPicker(false);
                  // Mantener foco en el input
                  setTimeout(() => {
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }, 100);
                }}
                theme="light"
                locale="es"
                previewPosition="none"
                skinTonePosition="none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {videoCallUrl && (
        <button
          onClick={() => navigate(`/videollamada?sala=${encodeURIComponent(videoCallUrl)}`)}
          className="fixed bottom-4 right-4 p-3 bg-green-600 text-white rounded-full shadow-xl z-50 hover:bg-green-700"
        >
          Unirme a videollamada
        </button>
      )}
    </div>
  );
};

export default ChatRoomPage;

