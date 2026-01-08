import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Shield, Sparkles, Users, User, Podcast, BookMarked, Library, Heart, Brain, MessageCircle, Lock } from 'lucide-react';
import useWindowSize from '@/hooks/useWindowSize';

const BottomNavigation = () => {
  const location = useLocation();
  const { width } = useWindowSize();
  const isMobileView = width < 768;

  const mainNavItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/seguridad', icon: Shield, label: 'Seguridad' },
    { path: '/comunidad', icon: Users, label: 'Comunidad' },
    { path: '/holistica', icon: Sparkles, label: 'Holística' },
    { path: '/mis-secretos', icon: Lock, label: 'Secretos' },
    { path: '/perfil', icon: User, label: 'Perfil' },
  ];
  
  const allNavItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/seguridad', icon: Shield, label: 'Seguridad' },
    { path: '/holistica', icon: Sparkles, label: 'Holística' },
    { path: '/comunidad', icon: Users, label: 'Comunidad' },
    { path: '/circulo', icon: MessageCircle, label: 'Mi Círculo' },
    { path: '/mis-secretos', icon: Lock, label: 'Mis Secretos' },
    { path: '/ale-dashboard', icon: Brain, label: 'AL-E Dashboard' },
    { path: '/salidas', icon: BookMarked, label: 'Mis Salidas' },
    { path: '/diario-emocional', icon: BookMarked, label: 'Diario' },
    { path: '/biblioteca', icon: Library, label: 'Biblioteca' },
    { path: '/podcast', icon: Podcast, label: 'Escucha' },
    { path: '/coberturas', icon: Heart, label: 'Coberturas' },
    { path: '/perfil', icon: User, label: 'Perfil' },
  ];

  // En móvil, no renderizar nada (eliminar bottom nav)
  if (isMobileView) {
    return null;
  }

  // Desktop view (sidebar)
  return (
    <div className="space-y-1">
      {allNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path) && (item.path !== '/' || location.pathname === '/');
        
        const isEmoji = typeof Icon === 'string';

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              isActive 
                ? 'bg-brand-accent/20 text-brand-primary font-bold' 
                : 'text-brand-secondary hover:bg-brand-background hover:text-brand-primary'
            }`}
          >
            {isEmoji ? <span className="text-lg">{Icon}</span> : <Icon className="w-5 h-5" />}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavigation;