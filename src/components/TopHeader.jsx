import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, Heart, Users, BookOpen, Activity, Sparkles, Library, BookMarked, User, LifeBuoy, MessageSquare, Podcast, FolderHeart as HomeIcon, ChevronUp, ChevronDown } from 'lucide-react';
import useWindowSize from '@/hooks/useWindowSize';

const TopHeader = () => {
  // TOPHEADER COMPLETAMENTE DESHABILITADO
  return null;

  // Auto-hide header en scroll down, show en scroll up
  useEffect(() => {
    if (!isMobileView) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setIsMinimized(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsMinimized(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobileView]);

  const pageDetails = {
    '/': { title: 'KUNNA', icon: null },
    '/seguridad': { title: 'Seguridad', icon: Shield },
    '/seguridad/apoyo-y-refugios': { title: 'Apoyo y Refugios', icon: HomeIcon },
    '/comunidad': { title: 'Comunidad', icon: Users },
    '/comunidad/blog': { title: 'Blog KUNNA', icon: Users },
    '/comunidad/salas': { title: 'Salas de Chat', icon: MessageSquare },
    '/bienestar': { title: 'Tu Bienestar', icon: Heart },
    '/prevencion': { title: 'Prevención', icon: Activity },
    '/holistica': { title: 'Zona Holística', icon: Sparkles },
    '/biblioteca': { title: 'Biblioteca KUNNA', icon: Library },
    '/podcast': { title: 'Escucha a KUNNA', icon: Podcast },
    '/diario-emocional': { title: 'Diario Emocional', icon: BookMarked },
    '/perfil': { title: 'Mi Perfil', icon: User },
  };

  const currentDetails = pageDetails[location.pathname] || { title: 'KUNNA' };
  const Icon = currentDetails.icon;

  // No mostrar header en las salas de chat (tienen su propio header)
  if (location.pathname.includes('/comunidad/sala/')) {
    return null;
  }

  if (isMobileView) {
    return (
      <header 
        className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-white/95 backdrop-blur-lg border-b border-brand-accent/20 transition-all duration-300 ${
          isMinimized ? '-translate-y-full' : 'translate-y-0'
        }`}
        style={{
          height: '64px',
          transform: `translateX(-50%) translateY(${isMinimized ? '-100%' : '0'})`,
          willChange: 'transform',
        }}
      >
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center space-x-3 min-w-0">
            <Link to="/" className="flex-shrink-0">
              <img 
                src="/images/logo_kunna.png" 
                alt="KUNNA Logo" 
                className="h-8 w-8 object-contain" 
              />
            </Link>
          </div>
          <h1 className="text-lg font-bold text-brand-primary truncate flex-1 text-center px-2">
            {currentDetails.title}
          </h1>
          <div className="w-8 flex justify-center flex-shrink-0">
            {Icon && <Icon className="w-5 h-5 text-brand-accent" />}
          </div>
        </div>
        
        {/* Botón para mostrar header cuando está oculto */}
        {isMinimized && (
          <button
            onClick={() => setIsMinimized(false)}
            className="absolute top-full left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-lg border border-brand-accent/20 rounded-b-lg px-3 py-1 shadow-sm z-50"
            aria-label="Mostrar header"
          >
            <ChevronDown className="w-4 h-4 text-brand-accent" />
          </button>
        )}
      </header>
    );
  }
  
  // Desktop header is simpler, just the logo in the sidebar area
  return (
    <div className="flex items-center space-x-3 p-4">
      <Link to="/">
        <img src="/images/logo_kunna.png" alt="KUNNA Logo" className="h-12" />
      </Link>
      <h1 className="text-2xl font-bold text-brand-primary font-serif">KUNNA</h1>
    </div>
  );
};

export default TopHeader;