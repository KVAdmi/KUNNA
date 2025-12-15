import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar, User, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import supabase from '@/lib/customSupabaseClient';
import BackButton from '@/components/ui/BackButton';
import { generarYDescargarCert } from '@/lib/certificateGenerator';

export default function CertificadoVita365() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          toast({ 
            variant: 'destructive', 
            title: 'Error', 
            description: 'No se pudo cargar tu información.' 
          });
        } else {
          setProfile(data);
        }
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, toast]);

  const generatePDF = async () => {
    if (!profile) return;
    
    setGeneratingPDF(true);
    toast({
      title: "Generando certificado",
      description: "Personalizando tu certificado Vita365..."
    });

    try {
      await generarYDescargarCert();
      
      toast({
        title: "¡Certificado generado!",
        description: "Tu certificado Vita365 ha sido generado y descargado exitosamente"
      });

    } catch (error) {
      console.error('Error al generar certificado:', error);
      toast({
        variant: "destructive",
        title: "Error al generar certificado",
        description: error.message || "No se pudo generar el certificado. Inténtalo de nuevo."
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[100dvh]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!profile || !profile.profile_completed) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent p-4">
        <div className="container mx-auto max-w-md">
          <BackButton variant="minimal" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-3xl p-8 text-center text-white mt-20"
          >
            <Shield className="w-16 h-16 mx-auto mb-4 text-brand-accent" />
            <h2 className="text-2xl font-bold mb-4">Perfil Incompleto</h2>
            <p className="mb-6">
              Necesitas completar tu perfil para generar tu certificado Vita365
            </p>
            <Button 
              onClick={() => window.location.href = '/completar-perfil'}
              className="bg-brand-accent hover:bg-brand-secondary text-white"
            >
              Completar Perfil
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-brand-accent/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <BackButton variant="minimal" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <Award className="w-16 h-16 text-brand-accent" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Certificado Vita365
          </h1>
          <p className="text-brand-secondary text-lg">
            Tu cobertura personalizada está lista
          </p>
        </motion.div>

        {/* Vista previa del certificado */}
        <motion.div
          ref={certificateRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-2xl mb-8"
        >
          {/* Header del certificado */}
          <div className="text-center border-b-2 border-brand-primary pb-6 mb-6">
            <img 
              src="/images/logo-zinha.png" 
              alt="Zinha" 
              className="h-12 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-brand-primary mb-2">
              CERTIFICADO DE COBERTURA VITA365
            </h2>
            <p className="text-brand-secondary">Programa Zinha</p>
          </div>

          {/* Información del certificado */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Datos personales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-primary flex items-center">
                <User className="w-5 h-5 mr-2" />
                Datos Personales
              </h3>
              
              <div className="space-y-3 bg-brand-background p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium text-brand-secondary">Nombre completo:</span>
                  <span className="text-brand-primary">{profile.nombre_completo}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium text-brand-secondary">CURP:</span>
                  <span className="text-brand-primary font-mono text-sm">{profile.curp}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium text-brand-secondary">Fecha de nacimiento:</span>
                  <span className="text-brand-primary">
                    {new Date(profile.fecha_nacimiento).toLocaleDateString('es-MX')}
                  </span>
                </div>

                {profile.id_vita && (
                  <div className="flex justify-between">
                    <span className="font-medium text-brand-secondary">ID Vita365:</span>
                    <span className="text-brand-primary font-mono">{profile.id_vita}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Información de la cobertura */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-primary flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Información de Cobertura
              </h3>
              
              <div className="space-y-3 bg-brand-background p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium text-brand-secondary">ID de Cobertura:</span>
                  <span className="text-brand-primary font-mono">{profile.coverage_id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium text-brand-secondary">Fecha de emisión:</span>
                  <span className="text-brand-primary">
                    {new Date().toLocaleDateString('es-MX')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium text-brand-secondary">Válido hasta:</span>
                  <span className="text-brand-primary">
                    {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium text-brand-secondary">Plan:</span>
                  <span className="text-brand-primary capitalize">{profile.tipo_plan}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg">
            <h4 className="font-semibold mb-2">Beneficios incluidos:</h4>
            <ul className="text-sm space-y-1">
              <li>• Acceso a red de especialistas en bienestar femenino</li>
              <li>• Consultas psicológicas y terapéuticas</li>
              <li>• Recursos de prevención y autocuidado</li>
              <li>• Comunidad de apoyo entre mujeres</li>
              <li>• Herramientas de seguridad personal</li>
            </ul>
          </div>

          {/* Footer del certificado */}
          <div className="mt-6 pt-6 border-t border-brand-primary/20 text-center">
            <p className="text-sm text-brand-secondary">
              Este certificado es válido y verificable mediante el ID de cobertura
            </p>
            <p className="text-xs text-brand-secondary mt-2">
              Generado automáticamente por el sistema Zinha - {new Date().toLocaleDateString('es-MX')}
            </p>
          </div>
        </motion.div>

        {/* Botones para descargar PDF */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-4"
        >
          {/* Botón de prueba visual */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <h3 className="text-yellow-800 font-semibold mb-2">🧪 Modo Prueba Visual</h3>
            <p className="text-yellow-700 text-sm mb-3">
              Este botón genera el PDF con marcas de posición para ajustar dónde van los datos
            </p>
            <Button
              onClick={generatePDF}
              disabled={generatingPDF}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg mr-3"
            >
              {generatingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Generando prueba...
                </>
              ) : (
                <>
                  📍 Generar PDF de Prueba
                </>
              )}
            </Button>
          </div>

          {/* Botón principal */}
          <Button
            onClick={generatePDF}
            disabled={generatingPDF}
            className="bg-brand-accent hover:bg-brand-secondary text-white px-8 py-3 rounded-xl text-lg font-semibold disabled:opacity-50"
          >
            {generatingPDF ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Personalizando certificado...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Descargar Certificado Personalizado
              </>
            )}
          </Button>
          
          <p className="text-white/80 text-sm mt-4">
            Tu certificado oficial Vita365 con todos tus datos personalizados
          </p>
        </motion.div>
      </div>
      
      <Toaster />
    </div>
  );
}
