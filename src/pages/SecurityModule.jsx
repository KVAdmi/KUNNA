import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Shield, Phone, FileDown, FolderHeart as HomeIcon, ChevronDown, ChevronUp, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import useWindowSize from '@/hooks/useWindowSize';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient';
import { Link } from 'react-router-dom';

import SecurityFeaturesGrid from '@/components/security/SecurityFeaturesGrid';
import GhostPinSetup from '@/components/security/GhostPinSetup.jsx';

const SecurityModule = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [showPinSection, setShowPinSection] = useState(false);
  const [profile, setProfile] = useState(null);
  const { width } = useWindowSize();
  const isMobileView = width < 768;

  useEffect(() => {
    const savedLocationSharing = localStorage.getItem('locationSharing');
    if (savedLocationSharing) {
      setIsLocationSharing(JSON.parse(savedLocationSharing));
    }

    // Cargar perfil del usuario
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setProfile(data);
          // SIEMPRE cerrado por defecto
          setShowPinSection(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const toggleLocationSharing = () => {
    const newStatus = !isLocationSharing;
    setIsLocationSharing(newStatus);
    localStorage.setItem('locationSharing', JSON.stringify(newStatus));

    toast({
      title: newStatus ? "📍 Modo Acompañamiento Activado" : "🔒 Modo Acompañamiento Desactivado",
      description: newStatus
        ? "Tu ruta se comparte en tiempo real con tus contactos."
        : "Has dejado de compartir tu ruta.",
    });
  };

  const handleCallAssistance = () => {
    window.location.href = 'tel:911';
    toast({
      title: "📞 Llamando a Asistencia de Emergencia",
      description: "Conectando con la línea de ayuda inmediata."
    });
  };

  const showToast = () => toast({
    title: "🚧 Función en desarrollo",
    description: "Esta funcionalidad no está implementada aún—¡pero no te preocupes! ¡Puedes solicitarla en tu próximo prompt! 🚀"
  });

  const mainContainerClass = isMobileView ? "" : "pt-0";
  const pagePaddingClass = isMobileView ? "p-4" : "p-0";

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br from-[#fafafa] via-[#f8f8f8] to-[#f5f5f5] pb-24 ${mainContainerClass}`}>
      <Helmet>
        <title>Seguridad Personal - KUNNA</title>
        <meta name="description" content="Activa el botón de pánico, comparte tu ruta en tiempo real y gestiona tus contactos de confianza." />
      </Helmet>

      <div className={`w-full mx-auto ${pagePaddingClass}`}>
        <SecurityFeaturesGrid
          isLocationSharing={isLocationSharing}
          toggleLocationSharing={toggleLocationSharing}
        />

        {/* Sección de PIN de Seguridad - Con diseño uniforme */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/30 shadow-2xl cursor-pointer mt-8"
          style={{
            background: 'linear-gradient(135deg, #8d758315, #8d758325, #8d758310)',
            boxShadow: `
              0 8px 32px #8d758320,
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1)
            `,
          }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          {/* Header de la tarjeta */}
          <div className="p-6 flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: '#8d7583' }}
              >
                <Key className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-brand-primary mb-2">
                  PIN de Seguridad
                </h3>
                <p className="text-sm text-brand-secondary/80 leading-relaxed">
                  {profile?.ghost_pin ? 'PIN configurado correctamente' : 'Configura tu PIN de acceso de emergencia'}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: showPinSection ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 ml-2"
              onClick={() => setShowPinSection(!showPinSection)}
            >
              <ChevronDown className="w-5 h-5 text-brand-secondary" />
            </motion.div>
          </div>

          {/* Contenido expandible */}
          {showPinSection && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-white/20"
            >
              <div className="p-6 pt-4">
                {profile && (
                  <GhostPinSetup 
                    profile={profile} 
                    onProfileUpdate={(updatedProfile) => {
                      setProfile(updatedProfile);
                      if (updatedProfile.ghost_pin) {
                        setTimeout(() => setShowPinSection(false), 2000);
                      }
                    }} 
                  />
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/30 shadow-2xl cursor-pointer mt-8"
          style={{
            background: 'linear-gradient(135deg, #49000015, #49000025, #49000010)',
            boxShadow: `
              0 8px 32px #49000020,
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1)
            `,
          }}
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <Link to="/seguridad/apoyo-y-refugios" className="block">
            <div className="p-6 flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: '#490000' }}
                >
                  <HomeIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-brand-primary mb-2">
                    Asociaciones Civiles y Centros de Refugio
                  </h3>
                  <p className="text-sm text-brand-secondary/80 leading-relaxed">
                    Encuentra un lugar seguro cerca de ti donde puedas recibir ayuda especializada.
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default SecurityModule;

