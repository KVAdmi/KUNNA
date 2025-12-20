import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Sparkles, Moon, Wand2, Star, Download, PlayCircle, BookOpen, Droplets, Wind, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TarotReading from '@/components/holistic-zone/TarotReading';
import { getHolisticoReading, formatHolisticoReading } from '@/services/holisticoApi';


const SectionItem = ({ title, onAction, actionType = 'download' }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
        }}
        className="relative overflow-hidden rounded-2xl p-4 flex items-center justify-between group cursor-pointer transition-all duration-300 hover:scale-102"
        style={{
            background: 'linear-gradient(135deg, rgba(245, 230, 255, 0.10), rgba(200, 166, 166, 0.05))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(245, 230, 255, 0.2)'
        }}
        whileHover={{ 
            background: 'linear-gradient(135deg, rgba(245, 230, 255, 0.15), rgba(193, 212, 58, 0.08))',
            scale: 1.02
        }}
    >
        {/* Efecto de brillo en hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </div>

        <p className="relative z-10 font-semibold text-[#f5e6ff] group-hover:text-[#c1d43a] transition-colors duration-300">
            {title}
        </p>
        
        <motion.button 
            onClick={onAction} 
            className="relative z-10 p-3 rounded-xl transition-all duration-300 group-hover:scale-110"
            style={{
                background: 'linear-gradient(135deg, rgba(193, 212, 58, 0.2), rgba(245, 230, 255, 0.2))',
                border: '1px solid rgba(193, 212, 58, 0.3)'
            }}
            whileHover={{ 
                background: 'linear-gradient(135deg, rgba(193, 212, 58, 0.4), rgba(245, 230, 255, 0.3))',
                boxShadow: '0 5px 15px rgba(193, 212, 58, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
        >
            {actionType === 'download' ? 
                <Download className="w-5 h-5 text-[#c1d43a]" /> : 
                <PlayCircle className="w-5 h-5 text-[#c1d43a]" />
            }
        </motion.button>
    </motion.div>
);

const Accordion = ({ icon: Icon, title, content }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <motion.div 
            layout 
            className="relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20"
            style={{
                background: 'linear-gradient(135deg, rgba(245, 230, 255, 0.15), rgba(193, 212, 58, 0.10), rgba(200, 166, 166, 0.05))',
            }}
        >
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
            </div>

            <motion.header
                initial={false}
                onClick={() => setIsOpen(!isOpen)}
                className="relative z-10 p-6 flex justify-between items-center cursor-pointer group transition-all duration-300"
                whileHover={{ scale: 1.02 }}
            >
                <div className="flex items-center space-x-4">
                    <motion.div 
                        className="relative p-4 rounded-2xl shadow-xl transition-all duration-500"
                        style={{ 
                            background: 'linear-gradient(135deg, #c1d43a, #f5e6ff)',
                            boxShadow: '0 8px 25px rgba(193, 212, 58, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}
                        whileHover={{ 
                            rotate: 360,
                            scale: 1.1,
                            boxShadow: '0 12px 35px rgba(193, 212, 58, 0.5)'
                        }}
                        transition={{ duration: 0.6 }}
                    >
                        <Icon className="w-7 h-7 text-[#263152] drop-shadow-lg" />
                        
                        {/* Brillo superior místico */}
                        <div className="absolute top-1 left-1 w-4 h-4 bg-white/40 rounded-full blur-sm"></div>
                    </motion.div>
                    
                    <div>
                        <h3 
                            className="font-bold text-2xl font-serif group-hover:text-[#c1d43a] transition-colors duration-300"
                            style={{ color: '#f5e6ff' }}
                        >
                            {title}
                        </h3>
                        <div className="w-16 h-0.5 bg-gradient-to-r from-[#c1d43a] to-[#c8a6a6] rounded-full mt-1 group-hover:w-24 transition-all duration-300"></div>
                    </div>
                </div>
                
                <motion.div 
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="p-2 rounded-full"
                    style={{ background: 'linear-gradient(135deg, rgba(193, 212, 58, 0.2), rgba(245, 230, 255, 0.2))' }}
                >
                    <Zap className="w-6 h-6 text-[#c1d43a]" />
                </motion.div>
            </motion.header>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.section
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: 'auto', padding: '0 24px 24px 24px' },
                            collapsed: { opacity: 0, height: 0, padding: '0 24px' },
                        }}
                        transition={{ duration: 0.6, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="relative z-10"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(193, 212, 58, 0.05))',
                            borderTop: '1px solid rgba(193, 212, 58, 0.2)'
                        }}
                    >
                        {content}
                    </motion.section>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const HolisticZone = () => {
    // Estado para lectura holística
    const [loading, setLoading] = useState(false);
    const [lecturaResult, setLecturaResult] = useState(null);
    const [error, setError] = useState(null);
  
    const handleAgendaClick = () => {
        const phoneNumber = "523310797565";
        const message = "Hola Mau, vengo de KUNNA y me gustaría agendar una lectura de carta astral y numerología. ✨";
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleLecturaHolistica = async () => {
        setLoading(true);
        setError(null);
        setLecturaResult(null);

        try {
            // Usar helper nuevo (P0)
            const reading = await getHolisticoReading({
                fecha_nacimiento: '1990-05-15', // TODO: input del usuario
                name: 'Usuario KUNNA',
                pregunta: '¿Qué mensaje tiene el universo para mí hoy?'
            });

            // Formatear para UI
            const formatted = formatHolisticoReading(reading);
            
            // Guardar lectura formateada
            setLecturaResult(formatted);

            // Log de warnings si existen
            if (formatted.warnings.length > 0) {
                console.warn('[Holística] Warnings:', formatted.warnings);
            }

            console.log('[Holística] ✅ Lectura generada:', {
                usandoALE: formatted.usandoALE,
                source: reading.source
            });

        } catch (err) {
            console.error('[Holística] Error:', err);
            setError(err.message || 'No se pudo generar la lectura');
        } finally {
            setLoading(false);
        }
    };

    const rituals = [
  {
    title: "Ritual de Abundancia y Prosperidad",
    url: "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/Rituales/Ritual-de-Abundancia-y-Prosperidad.pdf"
  },
  {
    title: "Ritual de Amor Propio y Autoaceptación",
    url: "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/Rituales/Ritual-de-Amor-Propio-y-Autoaceptacion.pdf"
  },
  {
    title: "Ritual de Manifestación de Sueños",
    url: "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/Rituales/Ritual-de-Manifestacion-de-Suenos.pdf"
  },
  {
    title: "Ritual de Protección Energética",
    url: "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/Rituales/Ritual-de-Proteccion-Energetica.pdf"
  },
  {
    title: "Ritual de Sanación Emocional",
    url: "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/Rituales/Ritual-de-Sanacion-Emocional.pdf"
  }
];
    
    const energeticBaths = [
  {
    title: "Limpieza de Belleza Natural",
    url: "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/Rituales/Limpia-Energetico-Belleza-Natural.pdf"
  },
  {
    title: "Limpieza para Cultivar Gratitud",
    url: "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/Rituales/Limpia-Energetico-Cultivar-Gratitud.pdf"
  },
  {
    title: "Limpieza de Limpieza y Purificación",
    url: "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/Rituales/Limpia-Energetico-Limpieza-y-Purificacion.pdf"
  },
  {
    title: "Limpieza de Renovación y Vitalidad",
    url: "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/Rituales/Limpia-Energetico-Renovacion-y-Vitalidad.pdf"
  },
  {
    title: "Limpieza de Sexualidad y Sensualidad",
    url: "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/Rituales/Limpia-Energetico-Sexualidad-y-Sensualidad.pdf"
  }
];

    const meditations = [
        { title: "Encuentro con tu Niña Interior" },
        { title: "Meditación para Soltar el Miedo" },
        { title: "Meditación de Aceptación y Perdón" },
        { title: "Meditación para Cultivar Gratitud" },
        { title: "Meditación para Conectar con tu Poder Interior" },
    ];

    const contentVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#263152] via-[#382a3c] to-[#8d7583] relative overflow-hidden">
            {/* Efectos de fondo astrológicos */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#c1d43a]/20 to-[#f5e6ff]/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#c8a6a6]/25 to-[#263152]/15 rounded-full blur-lg animate-pulse delay-700"></div>
                <div className="absolute bottom-32 left-20 w-28 h-28 bg-gradient-to-br from-[#f5e6ff]/30 to-[#8d7583]/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 right-10 w-20 h-20 bg-gradient-to-br from-[#c1d43a]/20 to-[#382a3c]/30 rounded-full blur-lg animate-pulse delay-500"></div>
                
                {/* Estrellas flotantes sutiles */}
                <motion.div
                    className="absolute top-32 left-1/4 text-[#f5e6ff]/30"
                    animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                        duration: 20, 
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    ✦
                </motion.div>
                <motion.div
                    className="absolute top-1/2 right-1/4 text-[#c1d43a]/25"
                    animate={{ 
                        rotate: -360,
                        scale: [1, 1.3, 1]
                    }}
                    transition={{ 
                        duration: 25, 
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    ✧
                </motion.div>
                <motion.div
                    className="absolute bottom-1/3 left-1/3 text-[#c8a6a6]/20"
                    animate={{ 
                        rotate: 360,
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                        duration: 30, 
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    ✦
                </motion.div>
            </div>

            <Helmet>
                <title>Zona Holística - KUNNA</title>
                <meta name="description" content="Conecta con tu espiritualidad a través de rituales, limpiezas energéticas y meditaciones guiadas." />
            </Helmet>

            {/* Contenedor cristal principal */}
            <div className="relative z-10 p-6 rounded-3xl m-4" style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>

                {/* Imagen de Holística */}
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
                                    src="/images/Holistica.jpg" 
                                    alt="Zona Holística Zinha"
                                    className="w-auto h-auto max-h-80 rounded-3xl shadow-xl group-hover:scale-110 transition-transform duration-700 ease-out"
                                />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    {/* Título con degradado místico */}
                    <motion.h1 
                        className="text-5xl font-bold font-serif mt-2 mb-6"
                        style={{
                            background: 'linear-gradient(135deg, #f5e6ff, #c1d43a, #c8a6a6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: '0 0 30px rgba(245, 230, 255, 0.5)'
                        }}
                        animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        Descubre tu mapa interior
                    </motion.h1>
                    
                    <p className="text-lg text-[#f5e6ff]/90 max-w-lg mx-auto mt-4 leading-relaxed">
                        Tu carta astral y tu numerología guardan las claves de tu propósito, dones y ciclos de vida. En esta lectura, conocerás:
                    </p>
                    
                    <div className="text-left max-w-md mx-auto mt-6 space-y-3 text-[#f5e6ff]/80">
                        <motion.p 
                            className="flex items-start"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Moon className="w-5 h-5 mr-3 mt-1 text-[#c1d43a] flex-shrink-0" /> 
                            Tus fortalezas y desafíos ocultos.
                        </motion.p>
                        <motion.p 
                            className="flex items-start"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Wand2 className="w-5 h-5 mr-3 mt-1 text-[#c8a6a6] flex-shrink-0" /> 
                            Tus ciclos personales y cómo aprovecharlos.
                        </motion.p>
                        <motion.p 
                            className="flex items-start"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Sparkles className="w-5 h-5 mr-3 mt-1 text-[#f5e6ff] flex-shrink-0" /> 
                            Los patrones energéticos que guían tus relaciones y decisiones.
                        </motion.p>
                        <motion.p 
                            className="flex items-start"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <Star className="w-5 h-5 mr-3 mt-1 text-[#8d7583] flex-shrink-0" /> 
                            Consejos para alinearte con tu esencia en este momento.
                        </motion.p>
                    </div>
                    
                    <p className="text-lg text-[#f5e6ff]/90 max-w-lg mx-auto mt-6 leading-relaxed">
                        Permite que las estrellas y los números te hablen, para comprender quién eres y hacia dónde caminas.
                    </p>
                    
                    <motion.button
                        onClick={handleAgendaClick}
                        className="mt-8 px-8 py-4 font-bold rounded-full text-lg shadow-2xl transform transition-all duration-300 hover:scale-105"
                        style={{
                            background: 'linear-gradient(135deg, #382a3c, #263152, #8d7583)',
                            color: '#f5e6ff',
                            boxShadow: '0 8px 25px rgba(56, 42, 60, 0.5)'
                        }}
                        whileHover={{ 
                            boxShadow: '0 12px 35px rgba(56, 42, 60, 0.7)',
                            y: -3,
                            background: 'linear-gradient(135deg, #263152, #382a3c, #c8a6a6)'
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Agenda tu lectura hoy
                    </motion.button>
                </motion.div>

                <div className="space-y-6">
                    <Accordion
                        icon={BookOpen}
                        title="Rituales"
                        content={
                            <motion.div variants={contentVariants} initial="hidden" animate="visible" className="space-y-3">
                                {rituals.map((item, index) => (
                                    <SectionItem
                                        key={index}
                                        title={item.title}
                                        onAction={() => window.open(item.url, "_blank")}
                                    />
                                ))}
                            </motion.div>
                        }
                    />
                    <Accordion
                        icon={Droplets}
                        title="Limpiezas Energéticas"
                        content={
                            <motion.div variants={contentVariants} initial="hidden" animate="visible" className="space-y-3">
                                {energeticBaths.map((item, index) => (
                                    <SectionItem
                                        key={index}
                                        title={item.title}
                                        onAction={() => window.open(item.url, "_blank")}
                                    />
                                ))}
                            </motion.div>
                        }
                    />
                    <Accordion
                        icon={Wind}
                        title="Meditaciones"
                        content={(
                            <motion.div variants={contentVariants} initial="hidden" animate="visible" className="space-y-3">
                                {meditations.map((item, index) => <SectionItem key={index} title={item.title} onAction={() => window.open(item.url, "_blank")} actionType="play" />)}
                            </motion.div>
                        )}
                    />
                    <Accordion
                        icon={Wand2}
                        title="Tarot"
                        content={<TarotReading />}
                    />
                    <Accordion
                        icon={Sparkles}
                        title="Lectura Holística (Beta)"
                        content={
                            <div className="space-y-4">
                                <p className="text-[#f5e6ff]/80 text-sm">
                                    Obtén una lectura unificada de Tarot, Numerología y Astrología.
                                </p>
                                
                                <motion.button
                                    onClick={handleLecturaHolistica}
                                    disabled={loading}
                                    className="w-full px-6 py-3 font-bold rounded-xl text-lg shadow-xl transform transition-all duration-300"
                                    style={{
                                        background: loading 
                                            ? 'linear-gradient(135deg, rgba(193, 212, 58, 0.3), rgba(245, 230, 255, 0.3))'
                                            : 'linear-gradient(135deg, #c1d43a, #f5e6ff)',
                                        color: '#263152',
                                        opacity: loading ? 0.6 : 1
                                    }}
                                    whileHover={!loading ? { scale: 1.02 } : {}}
                                    whileTap={!loading ? { scale: 0.98 } : {}}
                                >
                                    {loading ? '🔮 Consultando el cosmos...' : '✨ Obtener lectura'}
                                </motion.button>

                                {error && (
                                    <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/40">
                                        <p className="text-red-200 text-sm">⚠️ {error}</p>
                                    </div>
                                )}

                                {lecturaResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-6 rounded-2xl space-y-6"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(245, 230, 255, 0.1), rgba(193, 212, 58, 0.1))',
                                            border: '1px solid rgba(193, 212, 58, 0.3)'
                                        }}
                                    >
                                        {/* Título de la lectura */}
                                        <div>
                                            <h4 className="font-bold text-2xl text-[#c1d43a] mb-2">
                                                {lecturaResult.interpretacion?.titulo || 'Tu Lectura Holística'}
                                            </h4>
                                            <p className="text-[#f5e6ff]/70 text-sm italic">
                                                {lecturaResult.interpretacion?.resumen}
                                            </p>
                                        </div>

                                        {/* Datos crudos (Tarot, Numerología, Astrología) */}
                                        <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#263152]/30">
                                            <div className="text-center">
                                                <p className="text-xs text-[#c1d43a] mb-1">Tarot</p>
                                                <p className="text-sm font-semibold text-[#f5e6ff]">
                                                    {lecturaResult.tarot?.nombre || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-[#c1d43a] mb-1">Numerología</p>
                                                <p className="text-sm font-semibold text-[#f5e6ff]">
                                                    {lecturaResult.numerologia?.numero || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-[#c1d43a] mb-1">Signo</p>
                                                <p className="text-sm font-semibold text-[#f5e6ff]">
                                                    {lecturaResult.astrologia?.signo || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Lectura profunda */}
                                        <div className="space-y-3 text-[#f5e6ff]/90 text-sm leading-relaxed">
                                            {lecturaResult.interpretacion?.lectura}
                                        </div>

                                        {/* Consejos */}
                                        {lecturaResult.interpretacion?.consejos?.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold text-[#c1d43a] uppercase tracking-wider">
                                                    Consejos Prácticos
                                                </p>
                                                <ul className="space-y-2">
                                                    {lecturaResult.interpretacion.consejos.map((consejo, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-[#f5e6ff]/80">
                                                            <span className="text-[#c1d43a]">•</span>
                                                            <span>{consejo}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Afirmación */}
                                        {lecturaResult.interpretacion?.afirmacion && (
                                            <div className="p-4 rounded-xl bg-gradient-to-r from-[#c1d43a]/20 to-[#f5e6ff]/10 border border-[#c1d43a]/30">
                                                <p className="text-center text-[#f5e6ff] font-serif italic">
                                                    "{lecturaResult.interpretacion.afirmacion}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Cierre KUNNA */}
                                        {lecturaResult.interpretacion?.cierre && (
                                            <p className="text-center text-sm text-[#f5e6ff]/60">
                                                {lecturaResult.interpretacion.cierre}
                                            </p>
                                        )}

                                        {/* Warnings */}
                                        {lecturaResult.warnings?.length > 0 && (
                                            <div className="text-xs text-yellow-300/60 space-y-1">
                                                {lecturaResult.warnings.map((w, idx) => (
                                                    <p key={idx}>⚠️ {w.service}: {w.message}</p>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default HolisticZone;