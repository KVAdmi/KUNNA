import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Shield, Sparkles, Users, BookOpen, Heart, Calendar, Library, Mic, ArrowRight, Home, MessageCircle, Lock } from "lucide-react";
import { Link } from "react-router-dom";

// Este componente NO modifica el layout existente.
// Es overlay fijo. Cuando está cerrado, no intercepta clics ni scroll.
export default function MenuLateralGalaxy({
  open = false,
  onClose,
  items = [
    { 
      label: "Seguridad", 
      href: "/seguridad", 
      subtitle: "Tu espacio de protección...",
      icon: Shield,
      color: "#382a3c" // Morado oscuro de tu paleta
    },
    { 
      label: "Zona Holística", 
      href: "/holistica", 
      subtitle: "Conecta con tu lado...",
      icon: Sparkles,
      color: "#8d75838" // Morado medio de tu paleta
    },
    { 
      label: "Comunidad", 
      href: "/comunidad", 
      subtitle: "Encuentra tu tribu y...",
      icon: Users,
      color: "#382a3c" // Azul marino de tu paleta
    },
    { 
      label: "Mi Círculo", 
      href: "/circulo", 
      subtitle: "Tu red privada de apoyo...",
      icon: MessageCircle,
      color: "#c8a6a6" // Rosa de tu paleta
    },
    { 
      label: "Mis Secretos", 
      href: "/mis-secretos", 
      subtitle: "Tu bóveda segura encriptada...",
      icon: Lock,
      color: "#382a3c" // Morado oscuro
    },
    { 
      label: "Diario Emocional", 
      href: "/diario-emocional", 
      subtitle: "Tu refugio personal para...",
      icon: BookOpen,
      color: "#c8a6a6" // Rosa de tu paleta
    },
    { 
      label: "Bienestar", 
      href: "/bienestar", 
      subtitle: "Cuidado integral para tu...",
      icon: Heart,
      color: "#c1d43a" // Verde lima de tu paleta
    },
    { 
      label: "Agenda Personal", 
      href: "/agenda", 
      subtitle: "Organiza tus citas y...",
      icon: Calendar,
      color: "#8d75838" // Morado medio de tu paleta
    },
    { 
      label: "Biblioteca KUNNA", 
      href: "/biblioteca", 
      subtitle: "Recursos y lecturas para t...",
      icon: Library,
      color: "#382a3c" // Azul marino de tu paleta
    },
    { 
      label: "Escucha a KUNNA", 
      href: "/podcast", 
      subtitle: "Podcast para abrazarte el...",
      icon: Mic,
      color: "#c8a6a6" // Rosa de tu paleta
    },
  ],
}) {

  // Bloquear scroll del body solo cuando el panel está abierto
  useEffect(() => {
    const original = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = original);
  }, [open]);

  return (
    <>
      {/* --- Overlay suave (no bloquea la UI cuando está cerrado) --- */}
      <AnimatePresence>
        {open && (
          <>
            {/* Clic fuera para cerrar */}
            <motion.button
              aria-label="Cerrar menú"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />

            {/* Panel que se abre hacia la IZQUIERDA */}
            <motion.aside
              role="dialog"
              aria-modal="true"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
              className="fixed right-0 top-0 z-50 h-screen w-[82vw] max-w-[420px]
                         bg-white/60 backdrop-blur-2xl shadow-2xl border-l border-white/40
                         flex flex-col overflow-hidden"
              // Glass + degradé suave al fondo para que combine con tu UI
              style={{
                backgroundImage:
                  "radial-gradient(1200px 600px at 30% -10%, rgba(255,255,255,0.9), rgba(255,255,255,0.55) 60%, rgba(255,255,255,0.45))",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/30">
                <div className="flex items-center gap-3">
                  <span 
                    className="font-bold text-xl bg-gradient-to-r from-[#382a3c] via-[#8d7583] to-[#c1d43a] bg-clip-text text-transparent drop-shadow-sm"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #382a3c 0%, #8d7583 30%, #c8a6a6 60%, #c1d43a 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Explora KUNNA
                  </span>
                  
                  {/* Icono de casita elegante para ir a home */}
                  <Link
                    to="/"
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/60 transition-all duration-300 
                               hover:scale-110 active:scale-95 group"
                    title="Ir a Inicio"
                  >
                    <Home 
                      size={22} 
                      className="text-[#382a3c] group-hover:text-[#c1d43a] transition-colors duration-300 drop-shadow-sm" 
                    />
                  </Link>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/60 transition-colors"
                >
                  <X size={24} className="text-[#382a3c]" />
                </button>
              </div>

              {/* Lista de opciones: SCROLL ARREGLADO + degradados únicos y colores diferentes */}
              <nav className="flex-1 px-4 py-4 overflow-y-auto overscroll-contain">
                <div className="space-y-3 pb-20">
                  {items.map((item, index) => {
                    const IconComponent = item.icon;
                    
                    // Colores únicos para cada cuadrito usando TU PALETA
                    const iconColors = [
                      '#8d7583', // Seguridad - malva
                      '#c1d43a', // Zona Holística - lima
                      '#382a3c', // Comunidad - morado oscuro
                      '#c8a6a6', // Diario - rosa
                      '#c1d43a', // Bienestar - lima
                      '#8d7583', // Agenda - malva
                      '#382a3c', // Biblioteca - morado oscuro
                      '#c8a6a6'  // Podcast - rosa
                    ];
                    
                    // Degradados únicos para cada tarjeta
                    const cardGradients = [
                      'linear-gradient(135deg, rgba(141,117,131,0.3) 0%, rgba(200,166,166,0.2) 100%)', // Seguridad
                      'linear-gradient(135deg, rgba(193,212,58,0.3) 0%, rgba(245,230,255,0.2) 100%)',   // Zona Holística
                      'linear-gradient(135deg, rgba(56,42,60,0.3) 0%, rgba(141,117,131,0.2) 100%)',     // Comunidad
                      'linear-gradient(135deg, rgba(200,166,166,0.3) 0%, rgba(245,230,255,0.2) 100%)',  // Diario
                      'linear-gradient(135deg, rgba(193,212,58,0.3) 0%, rgba(200,166,166,0.2) 100%)',   // Bienestar
                      'linear-gradient(135deg, rgba(141,117,131,0.3) 0%, rgba(245,230,255,0.2) 100%)',  // Agenda
                      'linear-gradient(135deg, rgba(56,42,60,0.3) 0%, rgba(245,230,255,0.2) 100%)',     // Biblioteca
                      'linear-gradient(135deg, rgba(200,166,166,0.3) 0%, rgba(193,212,58,0.2) 100%)'    // Podcast
                    ];
                    
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={onClose}
                        className="flex items-center p-4 rounded-2xl shadow-lg
                                   border border-white/50 backdrop-blur-sm 
                                   transition-all duration-300 ease-out
                                   hover:scale-[1.02] hover:shadow-xl
                                   text-[#382a3c] no-underline group active:scale-[0.98]"
                        style={{
                          background: cardGradients[index % cardGradients.length],
                        }}
                      >
                        {/* Icono con color único de TU PALETA + SOMBRA */}
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shrink-0 shadow-md"
                          style={{ 
                            backgroundColor: iconColors[index % iconColors.length],
                            boxShadow: `0 4px 12px ${iconColors[index % iconColors.length]}40`
                          }}
                        >
                          <IconComponent size={22} className="text-white drop-shadow-sm" />
                        </div>
                        
                        {/* Contenido de texto */}
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-semibold text-gray-800 leading-tight">
                            {item.label}
                          </div>
                          <div className="text-sm text-gray-500 leading-relaxed mt-0.5">
                            {item.subtitle}
                          </div>
                        </div>
                        
                        {/* Flechita */}
                        <ArrowRight 
                          size={18} 
                          className="text-gray-400 group-hover:text-[#382a3c] group-hover:translate-x-1 transition-all duration-200 ml-2 shrink-0" 
                        />
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
