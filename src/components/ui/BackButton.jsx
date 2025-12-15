import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ fallbackRoute = '/landing', className = '', variant = 'default' }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Primero intenta ir hacia atrás en el historial
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Si no hay historial, va a la ruta de fallback
      navigate(fallbackRoute);
    }
  };

  // Variantes de estilo
  const variants = {
    default: "absolute top-6 left-6 z-10 flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 hover:text-brand-accent transition-all duration-300 shadow-lg",
    minimal: "absolute top-4 left-4 z-10 text-white hover:text-brand-accent transition-colors duration-200",
    solid: "absolute top-6 left-6 z-10 flex items-center justify-center w-12 h-12 bg-brand-accent rounded-full text-white hover:bg-brand-secondary transition-all duration-300 shadow-lg",
    outlined: "absolute top-6 left-6 z-10 flex items-center justify-center w-12 h-12 border-2 border-white/30 rounded-full text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300"
  };

  const buttonClass = variants[variant] || variants.default;

  return (
    <button 
      onClick={handleGoBack}
      className={`${buttonClass} ${className}`}
      aria-label="Volver atrás"
    >
      <ArrowLeft className="w-6 h-6" />
    </button>
  );
};

export default BackButton;
