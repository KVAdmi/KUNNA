import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Users, PenSquare, MessageSquare } from 'lucide-react';
import { Megaphone } from 'lucide-react';

const CommunityModule = () => {
    const navigate = useNavigate();
    
    return (
        <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-[#f8f6f4] via-[#f2f0ed] to-[#ebe8e4] relative overflow-hidden">
            {/* Efectos de fondo decorativos */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#c8a6a6]/30 to-[#8d7583]/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#c1d43a]/25 to-[#382a3c]/15 rounded-full blur-lg animate-pulse delay-700"></div>
                <div className="absolute bottom-32 left-20 w-28 h-28 bg-gradient-to-br from-[#263152]/40 to-[#c8a6a6]/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 right-10 w-20 h-20 bg-gradient-to-br from-[#382a3c]/20 to-[#8d7583]/30 rounded-full blur-lg animate-pulse delay-500"></div>
            </div>

            <Helmet>
                <title>Comunidad - KUNNA</title>
                <meta name="description" content="Conéctate en el Blog KUNNA, únete a salas de chat y participa en nuestra comunidad." />
            </Helmet>

            <div className="relative z-10 p-6 rounded-3xl m-4" style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
            >
                <h1 
                    className="text-4xl md:text-5xl font-bold font-serif tracking-wide mb-4"
                    style={{
                        background: 'linear-gradient(135deg, #263152 0%, #c8a6a6 25%, #8d7583 50%, #c1d43a 75%, #382a3c 100%)',
                        backgroundSize: '300% 300%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(2px 4px 8px rgba(200, 166, 166, 0.3))',
                    }}
                >
                    <motion.span
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            background: 'linear-gradient(135deg, #263152 0%, #c8a6a6 25%, #8d7583 50%, #c1d43a 75%, #382a3c 100%)',
                            backgroundSize: '300% 300%',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Bienvenida a la Tribu
                    </motion.span>
                </h1>
                <p className="text-lg text-brand-secondary max-w-2xl mx-auto">
                    Este es tu espacio para compartir, conectar y crecer. Elige cómo quieres participar hoy.
                </p>
            </motion.div>

            {/* Imagen de Comunidad - EXACTO como en Seguridad */}
            <motion.div 
                className="relative py-8 mb-8"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <div className="flex justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                        whileHover={{ scale: 1.05, y: -10 }}
                        className="relative group cursor-pointer"
                    >
                        <div className="relative max-w-xs">
                            <img 
                                src="/images/Comunidad.jpg" 
                                alt="Comunidad Zinha"
                                className="w-auto h-auto max-h-80 rounded-3xl shadow-xl group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">\
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    whileHover={{ scale: 1.02, y: -8 }}
                    className="group cursor-pointer"
                >
                    <Link to="/comunidad/blog" className="block">
                        <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 h-full"
                             style={{
                                 background: 'linear-gradient(135deg, rgba(200, 166, 166, 0.15), rgba(245, 230, 255, 0.25), rgba(141, 117, 131, 0.10))',
                             }}>
                            
                            {/* Efecto de brillo en hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </div>

                            <div className="relative z-10 text-center">
                                {/* Icono con efecto cristal mejorado */}
                                <div className="relative mb-6 flex justify-center">
                                    <div 
                                        className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-500 backdrop-blur-lg border border-white/20"
                                        style={{ 
                                            background: 'linear-gradient(135deg, #c8a6a6, #8d7583)',
                                            boxShadow: '0 8px 32px rgba(200, 166, 166, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        <PenSquare className="w-10 h-10 text-white drop-shadow-lg" />
                                        
                                        {/* Brillo superior */}
                                        <div className="absolute top-2 left-2 w-6 h-6 bg-white/30 rounded-full blur-md"></div>
                                    </div>
                                </div>

                                <h2 className="text-3xl font-bold font-serif text-[#382a3c] mb-4 group-hover:text-[#263152] transition-colors duration-300">
                                    Blog KUNNA
                                </h2>
                                <p className="text-[#8d7583] leading-relaxed text-lg">
                                    Comparte tu historia, lee las de otras y encuentra inspiración. Tu voz es parte de nuestra fuerza colectiva.
                                </p>

                                {/* Decoración inferior */}
                                <div className="mt-6 flex justify-center">
                                    <div className="w-16 h-1 bg-gradient-to-r from-[#c8a6a6] to-[#8d7583] rounded-full group-hover:w-24 transition-all duration-300"></div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    whileHover={{ scale: 1.02, y: -8 }}
                    className="group cursor-pointer"
                >
                    <Link to="/comunidad/salas" className="block">
                        <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 h-full"
                             style={{
                                 background: 'linear-gradient(135deg, rgba(38, 49, 82, 0.15), rgba(193, 212, 58, 0.15), rgba(56, 42, 60, 0.10))',
                             }}>
                            
                            {/* Efecto de brillo en hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </div>

                            <div className="relative z-10 text-center">
                                {/* Icono con efecto cristal mejorado */}
                                <div className="relative mb-6 flex justify-center">
                                    <div 
                                        className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-500 backdrop-blur-lg border border-white/20"
                                        style={{ 
                                            background: 'linear-gradient(135deg, #263152, #382a3c)',
                                            boxShadow: '0 8px 32px rgba(38, 49, 82, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        <MessageSquare className="w-10 h-10 text-white drop-shadow-lg" />
                                        
                                        {/* Brillo superior */}
                                        <div className="absolute top-2 left-2 w-6 h-6 bg-white/30 rounded-full blur-md"></div>
                                    </div>
                                </div>

                                <h2 className="text-3xl font-bold font-serif text-[#382a3c] mb-4 group-hover:text-[#263152] transition-colors duration-300">
                                    Salas de Chat
                                </h2>
                                <p className="text-[#8d7583] leading-relaxed text-lg">
                                    Únete a conversaciones en tiempo real en nuestros círculos de confianza. Aquí siempre hay alguien para escucharte.
                                </p>

                                {/* Decoración inferior */}
                                <div className="mt-6 flex justify-center">
                                    <div className="w-16 h-1 bg-gradient-to-r from-[#263152] to-[#382a3c] rounded-full group-hover:w-24 transition-all duration-300"></div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            </div>
            </div>
        </div>
    );
};

export default CommunityModule;