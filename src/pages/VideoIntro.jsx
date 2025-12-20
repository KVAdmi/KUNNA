import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const VideoIntro = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isVideoEnded, setIsVideoEnded] = useState(false);

  useEffect(() => {
    // Auto-play el video cuando carga
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Error auto-playing video:', err);
      });
    }
  }, []);

  const handleVideoEnd = () => {
    setIsVideoEnded(true);
    // Auto-navegar al login después de 1 segundo
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const handleSkip = () => {
    navigate('/login');
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Video de fondo */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        onEnded={handleVideoEnd}
        playsInline
        muted
        autoPlay
      >
        <source src="/assets/videos/introKunna.mp4" type="video/mp4" />
        Tu navegador no soporta el video.
      </video>

      {/* Overlay oscuro sutil para mejorar legibilidad del botón */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Botón Omitir - Solo visible si el video NO ha terminado */}
      <AnimatePresence>
        {!isVideoEnded && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onClick={handleSkip}
            className="absolute top-8 right-8 z-50 flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(193, 212, 58, 0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
            }}
            whileHover={{
              background: 'rgba(193, 212, 58, 1)',
              boxShadow: '0 12px 30px rgba(193, 212, 58, 0.4)',
            }}
          >
            <X className="w-5 h-5" />
            Omitir
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mensaje de carga (si el video no está listo) */}
      <AnimatePresence>
        {!videoRef.current?.readyState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-40"
          >
            <div className="text-white text-xl font-semibold animate-pulse">
              Cargando...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoIntro;
