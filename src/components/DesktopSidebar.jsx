import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Shield, Sparkles, Briefcase, Users, BookMarked, Library, Heart, User, GraduationCap, Calendar } from 'lucide-react';
import TopHeader from '@/components/TopHeader.jsx';

const navItems = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/seguridad', icon: Shield, label: 'Seguridad' },
  { path: '/comunidad', icon: Users, label: 'Comunidad' },
  { path: '/holistica', icon: Sparkles, label: 'Holística' },
  { path: '/emprende', icon: Briefcase, label: 'Emprende en Casa' },
  { path: '/biblioteca', icon: Library, label: 'Biblioteca' },
  { path: '/diario-emocional', icon: BookMarked, label: 'Diario' },
  { path: '/bienestar', icon: Heart, label: 'Bienestar' },
  { path: '/agenda', icon: Calendar, label: 'Agenda' },
  { path: '/perfil', icon: User, label: 'Perfil' },
];

const NavItem = ({ item }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;

  return (
    <NavLink to={item.path}>
      <motion.div
        className={`relative flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
          isActive 
            ? 'bg-brand-accent/20 shadow-sm' 
            : 'hover:bg-brand-accent/10'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center w-full">
          <div className={`p-2 rounded-lg mr-3 transition-colors ${
            isActive 
              ? 'bg-brand-accent text-white' 
              : 'bg-brand-accent/10 text-brand-secondary'
          }`}>
            <item.icon className="w-5 h-5" />
          </div>
          <span className={`font-medium transition-colors ${
            isActive ? 'text-brand-primary' : 'text-brand-secondary'
          }`}>
            {item.label}
          </span>
        </div>
        {isActive && (
          <motion.div
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-brand-accent rounded-l-full"
            layoutId="active-indicator"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </motion.div>
    </NavLink>
  );
};

const DesktopSidebar = () => {
  return (
    <aside className="w-72 bg-white/95 backdrop-blur-sm p-6 border-r border-brand-accent/20 flex flex-col shadow-lg">
      {/* Logo/Header */}
      <div className="mb-8">
        <img
          src="/images/logo_kunna.png"
          alt="KUNNA Logo"
          className="h-12 mx-auto mb-2"
        />
        <h2 className="text-center text-brand-primary font-serif text-lg">Bienestar + seguridad + acompañamiento</h2>
      </div>
      
      {/* Navegación */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>
      
      {/* Footer del sidebar */}
      <div className="mt-8 pt-4 border-t border-brand-accent/20">
        <p className="text-xs text-brand-secondary text-center">
          © 2025 KUNNA - MÉXICO
        </p>
      </div>
    </aside>
  );
};

export default DesktopSidebar;