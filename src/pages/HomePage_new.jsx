import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { FLAGS } from '../config/flags.ts';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const HomePage = () => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.rol === 'super_admin';

  return (
    <div className="w-full bg-gradient-to-br from-[#f5e6ff] via-[#ffffff] to-[#f5e6ff] relative overflow-hidden">
      <Helmet>
        <title>KUNNA - Tu fuerza, tu espacio, tu mundo</title>
        <meta name="description" content="Eres creadora de vida, de amor, de cambio. KUNNA está aquí para protegerte, acompañarte y celebrar tu poder." />
      </Helmet>

      {/* Partículas flotantes de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 4 === 0 ? '#c8a6a6' : 
                         i % 4 === 1 ? '#8d7583' : 
                         i % 4 === 2 ? '#c1d43a' : '#382a3c'
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <section className="relative z-10 flex-1 min-h-0 flex items-center justify-center px-6 text-center py-8">
        
        
        {/* Logo Zinha animado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="relative">
            {/* Logo principal - LOGO REAL DE ZINHA */}
            <motion.div
              animate={{ 
                rotate: [0, 1, -1, 0],
                scale: [1, 1.02, 1]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="relative group"
            >
              {/* Sombra suave del logo */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#382a3c]/20 to-[#8d7583]/30 rounded-full blur-2xl transform translate-x-2 translate-y-2 scale-110"></div>
              
              {/* Contenedor con efecto cristal */}
              <div className="relative w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-xl border border-white/40 shadow-2xl p-4">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5 rounded-full"></div>
                
                {/* LOGO REAL DE KUNNA */}
                <img 
                  src="/images/logo_kunna.png" 
                  alt="KUNNA Logo" 
                  className="w-full h-full object-contain relative z-10 drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500" 
                />
                
                {/* Brillo cristalino superior */}
                <div className="absolute top-3 left-6 w-8 h-8 bg-white/40 rounded-full blur-md"></div>
                <div className="absolute top-6 right-8 w-4 h-4 bg-white/30 rounded-full blur-sm"></div>
              </div>
            </motion.div>

            {/* Efectos de brillo orbital alrededor del logo */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 -m-6"
            >
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-[#c1d43a] rounded-full blur-sm opacity-70"></div>
              <div className="absolute bottom-0 right-1/4 w-1.5 h-1.5 bg-[#c8a6a6] rounded-full blur-sm opacity-60"></div>
              <div className="absolute top-1/3 right-0 w-1.5 h-1.5 bg-[#8d7583] rounded-full blur-sm opacity-50"></div>
              <div className="absolute bottom-1/3 left-0 w-1 h-1 bg-[#382a3c] rounded-full blur-sm opacity-40"></div>
            </motion.div>

            {/* Segundo anillo de efectos */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 -m-8"
            >
              <div className="absolute top-1/4 left-0 w-1 h-1 bg-[#c1d43a] rounded-full blur-sm opacity-30"></div>
              <div className="absolute bottom-1/4 right-0 w-1.5 h-1.5 bg-[#c8a6a6] rounded-full blur-sm opacity-40"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Mensaje principal emotivo */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Título principal */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-[#382a3c] font-['Questrial'] leading-tight"
          >
            Eres{' '}
            <motion.span
              animate={{ 
                backgroundPosition: ['0%', '100%', '0%'] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity 
              }}
              className="bg-gradient-to-r from-[#c8a6a6] via-[#8d7583] to-[#c1d43a] bg-[length:200%_auto] bg-clip-text text-transparent"
            >
              creadora
            </motion.span>
            {' '}de vida
          </motion.h1>

          {/* Subtítulos con animación secuencial */}
          <div className="space-y-4">
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-xl md:text-2xl text-[#8d7583] font-['Questrial'] text-center"
            >
              de amor, de cambio
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="text-xl md:text-2xl text-[#8d7583] font-['Questrial'] text-center"
            >
              Tu fuerza mueve al mundo
            </motion.p>
          </div>

          {/* Mensaje de propósito */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.8 }}
            className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-lg"
          >
            <p className="text-lg md:text-xl text-[#382a3c] font-['Questrial'] leading-relaxed text-center">
              <strong className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#382a3c] via-[#8d7583] to-[#c8a6a6] bg-clip-text text-transparent">
                KUNNA
              </strong>
              {' '}está aquí para{' '}
              <strong className="text-[#8d7583]">protegerte</strong>,{' '}
              <strong className="text-[#c8a6a6]">acompañarte</strong> y{' '}
              <strong className="text-[#c1d43a]">celebrar tu poder</strong>.
            </p>
          </motion.div>

          {/* Call to action sutil */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 2.2 }}
            className="pt-8"
          >
            <p className="text-sm md:text-base text-[#8d7583] font-['Questrial'] opacity-80">
              Toca el menú y explora lo que KUNNA tiene para ti
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Admin panel si es necesario */}
      {isAdmin && FLAGS.SISTEMA_VITA365 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-lg">
            <p className="text-xs text-[#382a3c] font-['Questrial'] opacity-70">
              Panel Admin disponible
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HomePage;
