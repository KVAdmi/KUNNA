import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Video, VideoOff, Phone, Users, Settings } from 'lucide-react';

const EmbeddedVideoCall = ({ 
  roomUrl, 
  onClose, 
  isVisible, 
  roomName = "Sala Zinha",
  participantName = "Usuario" 
}) => {
  const callFrameRef = useRef(null);
  const containerRef = useRef(null);
  const [callFrame, setCallFrame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState(null);

  console.log('🎬 EmbeddedVideoCall props:', { isVisible, roomUrl, roomName });

  useEffect(() => {
    console.log('🔄 EmbeddedVideoCall useEffect triggered:', { isVisible, roomUrl });
    if (!isVisible || !roomUrl) return;

    const initializeCall = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Verificar que Daily.co esté disponible
        if (!window.DailyIframe) {
          console.warn('Daily.co SDK no está disponible, usando iframe simple');
          setError('SDK no disponible');
          setIsLoading(false);
          return;
        }
        
        // Crear iframe de Daily.co embebido
        const frame = window.DailyIframe.createFrame(containerRef.current, {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '16px',
            overflow: 'hidden'
          },
          showLeaveButton: false,
          showFullscreenButton: false,
          showLocalVideo: true,
          showParticipantsBar: true,
          layout: 'grid',
          theme: {
            colors: {
              accent: '#c1d43a',
              accentText: '#382a3c',
              background: '#f5e6ff',
              baseText: '#382a3c',
              border: '#c8a6a6',
              mainAreaBg: '#f5e6ff',
              mainAreaText: '#382a3c',
              supportiveText: '#8d7583'
            }
          }
        });

        // Event listeners para estado de la llamada
        frame
          .on('loading', () => setIsLoading(true))
          .on('loaded', () => setIsLoading(false))
          .on('joined-meeting', () => {
            setIsLoading(false);
            console.log('✅ Unido a la videollamada');
          })
          .on('participant-joined', (event) => {
            setParticipants(prev => prev + 1);
          })
          .on('participant-left', (event) => {
            setParticipants(prev => Math.max(0, prev - 1));
          })
          .on('error', (error) => {
            console.error('❌ Error en videollamada:', error);
            setError('Error de conexión');
            setIsLoading(false);
          });

        // Unirse a la llamada
        await frame.join({ 
          url: roomUrl,
          userName: participantName
        });

        setCallFrame(frame);
        
      } catch (error) {
        console.error('❌ Error inicializando videollamada:', error);
        setError('No se pudo conectar');
        setIsLoading(false);
      }
    };

    initializeCall();

    // Cleanup al desmontar
    return () => {
      if (callFrame) {
        try {
          callFrame.destroy();
        } catch (err) {
          console.warn('Error cleaning up call frame:', err);
        }
      }
    };
  }, [isVisible, roomUrl, participantName]);

  const toggleMute = async () => {
    if (!callFrame) return;
    try {
      await callFrame.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  };

  const toggleVideo = async () => {
    if (!callFrame) return;
    try {
      await callFrame.setLocalVideo(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  const leaveCall = async () => {
    if (callFrame) {
      try {
        await callFrame.leave();
        callFrame.destroy();
      } catch (error) {
        console.error('Error leaving call:', error);
      }
    }
    onClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="absolute inset-4 bg-gradient-to-br from-[#f5e6ff] via-[#e8d5ff] to-[#dcc4ff] rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header hermoso con gradiente Zinha */}
          <div className="bg-gradient-to-r from-[#382a3c] via-[#8d7583] to-[#382a3c] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#c1d43a] rounded-full animate-pulse"></div>
              <h2 className="text-white font-semibold text-lg">{roomName}</h2>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Users className="w-4 h-4 text-[#c1d43a]" />
                <span className="text-white text-sm font-medium">{participants}</span>
              </div>
            </div>
            
            <motion.button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#d4243a] to-[#c1243a] text-white flex items-center justify-center hover:shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Área de video */}
          <div className="relative flex-1 h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f5e6ff] to-[#e8d5ff]">
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 border-4 border-[#c1d43a] border-t-transparent rounded-full mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-[#382a3c] font-medium">Conectando a la videollamada...</p>
                  <p className="text-[#8d7583] text-sm mt-1">¡Ya casi estamos listas!</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f5e6ff] to-[#e8d5ff]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#d4243a] rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-[#382a3c] font-medium">Error de conexión</p>
                  <p className="text-[#8d7583] text-sm mt-1">{error}</p>
                  <motion.button
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-[#c1d43a] text-[#382a3c] rounded-full font-medium hover:bg-[#a8c234] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cerrar
                  </motion.button>
                </div>
              </div>
            )}
            
            {/* Contenedor del iframe de Daily.co o fallback */}
            <div ref={containerRef} className="w-full h-full">
              {/* Fallback iframe si Daily.co no está disponible */}
              {error === 'SDK no disponible' && roomUrl && (
                <iframe
                  src={roomUrl}
                  className="w-full h-full rounded-2xl"
                  allow="camera; microphone; fullscreen; speaker; display-capture"
                  allowFullScreen
                  title="Videollamada Zinha"
                />
              )}
            </div>
          </div>

          {/* Controles inferiores hermosos */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#382a3c] via-[#382a3c]/90 to-transparent p-6">
            <div className="flex items-center justify-center gap-4">
              <motion.button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isMuted 
                    ? 'bg-gradient-to-r from-[#d4243a] to-[#c1243a] text-white' 
                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>

              <motion.button
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isVideoOff 
                    ? 'bg-gradient-to-r from-[#d4243a] to-[#c1243a] text-white' 
                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </motion.button>

              <motion.button
                onClick={leaveCall}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-[#d4243a] to-[#c1243a] text-white flex items-center justify-center hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Phone className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmbeddedVideoCall;
