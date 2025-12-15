import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Calendar, FileText, Camera, Upload, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import supabase from '@/lib/customSupabaseClient';
import BackButton from '@/components/ui/BackButton';

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    nombre_completo: '',
    fecha_nacimiento: '',
    curp: '',
    username: ''
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Para manejar pasos del formulario

  // Función para generar ID único de cobertura
  const generateCoverageId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `VITA-${timestamp}-${randomStr}`.toUpperCase();
  };

  // Función para generar ID Vita365 automáticamente
  const generateVitaId = (nombreCompleto, fechaNacimiento, curp = '') => {
    if (!nombreCompleto || !fechaNacimiento) return '';
    
    // Obtener iniciales del nombre (primera letra de nombre y apellido)
    const palabras = nombreCompleto.trim().split(' ').filter(word => word.length > 0);
    let iniciales = '';
    
    if (palabras.length >= 2) {
      // Primera letra del nombre y primera letra del primer apellido
      iniciales = (palabras[0][0] + palabras[1][0]).toUpperCase();
    } else if (palabras.length === 1) {
      // Solo hay un nombre, usar las dos primeras letras
      iniciales = palabras[0].substring(0, 2).toUpperCase();
    }
    
    // Obtener año de nacimiento
    const año = new Date(fechaNacimiento).getFullYear();
    
    // Si hay CURP, usar los últimos 2 caracteres, si no, usar timestamp
    let sufijo = '';
    if (curp && curp.length >= 2) {
      sufijo = curp.slice(-2);
    } else {
      sufijo = (Date.now() % 100).toString().padStart(2, '0');
    }
    
    return `ZINHA-${iniciales}-${año}-${sufijo}`;
  };

  // Manejar cambios en los inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para generar vista previa del ID Vita365
  const getVitaIdPreview = () => {
    if (formData.nombre_completo && formData.fecha_nacimiento) {
      return generateVitaId(formData.nombre_completo, formData.fecha_nacimiento, formData.curp);
    }
    return '';
  };

  // Manejar selección de avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Validar CURP básico
  const validateCURP = (curp) => {
    const curpRegex = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/;
    return curpRegex.test(curp.toUpperCase());
  };

  // Validar formulario
  const validateForm = () => {
    if (!formData.nombre_completo.trim()) {
      toast({
        variant: "destructive",
        title: "Campo requerido",
        description: "Por favor ingresa tu nombre completo"
      });
      return false;
    }

    if (!formData.fecha_nacimiento) {
      toast({
        variant: "destructive", 
        title: "Campo requerido",
        description: "Por favor ingresa tu fecha de nacimiento"
      });
      return false;
    }

    if (!formData.curp.trim() || !validateCURP(formData.curp)) {
      toast({
        variant: "destructive",
        title: "CURP inválido",
        description: "Por favor ingresa un CURP válido"
      });
      return false;
    }

    if (!formData.username.trim()) {
      toast({
        variant: "destructive",
        title: "Campo requerido", 
        description: "Por favor ingresa un nombre de usuario"
      });
      return false;
    }

    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const userId = user?.id;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      let foto_url = '';

      // Subir avatar si existe
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${userId}/avatar.${fileExt}`;
        
        const { data: upload, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        foto_url = publicUrl.publicUrl;
      }

      // Generar ID único de cobertura
      const coverage_id = generateCoverageId();

      // Generar ID Vita365 automáticamente
      const vita_id = generateVitaId(formData.nombre_completo, formData.fecha_nacimiento, formData.curp);

      // Actualizar perfil con todos los datos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          nombre_completo: formData.nombre_completo,
          fecha_nacimiento: formData.fecha_nacimiento,
          curp: formData.curp.toUpperCase(),
          id_vita: vita_id,
          foto_url,
          coverage_id,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast({
        title: "¡Perfil completado!",
        description: `Tu ID Vita365: ${vita_id}`
      });

      // Navegar a la página del certificado
      setTimeout(() => {
        navigate('/certificado-vita365');
      }, 1500);

    } catch (error) {
      console.error('Error al guardar perfil:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar tu perfil. Inténtalo de nuevo."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-brand-accent/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <BackButton variant="minimal" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Completa tu perfil
          </h1>
          <p className="text-brand-secondary text-lg">
            Necesitamos algunos datos para activar tu cobertura Vita365
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-3xl p-8 space-y-6"
        >
          {/* Avatar Upload */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white/60" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-secondary transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-white/60 text-sm mt-2">Sube tu foto de perfil</p>
          </div>

          {/* Campos del formulario */}
          <div className="space-y-4">
            {/* Nombre completo */}
            <div className="space-y-2">
              <label className="text-white font-medium flex items-center">
                <User className="w-4 h-4 mr-2" />
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.nombre_completo}
                onChange={(e) => handleInputChange('nombre_completo', e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-brand-accent focus:bg-white/15 transition-all"
                required
              />
            </div>

            {/* Fecha de nacimiento */}
            <div className="space-y-2">
              <label className="text-white font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-brand-accent focus:bg-white/15 transition-all"
                required
              />
            </div>

            {/* CURP */}
            <div className="space-y-2">
              <label className="text-white font-medium flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                CURP
              </label>
              <input
                type="text"
                value={formData.curp}
                onChange={(e) => handleInputChange('curp', e.target.value.toUpperCase())}
                placeholder="AAAA000000HAAAA00"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-brand-accent focus:bg-white/15 transition-all font-mono"
                maxLength="18"
                required
              />
              <p className="text-white/60 text-xs">
                Clave Única de Registro de Población (18 caracteres)
              </p>
            </div>

            {/* Vista previa del ID Vita365 */}
            {getVitaIdPreview() && (
              <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Tu ID Vita365 será:
                </h4>
                <div className="font-mono text-lg text-brand-accent bg-white/5 px-3 py-2 rounded border border-white/20">
                  {getVitaIdPreview()}
                </div>
                <p className="text-white/60 text-xs mt-2">
                  Se generará automáticamente con tus datos
                </p>
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <label className="text-white font-medium flex items-center">
                <User className="w-4 h-4 mr-2" />
                Nombre de usuario
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Como quieres que te vean otras usuarias"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-brand-accent focus:bg-white/15 transition-all"
                required
              />
            </div>
          </div>

          {/* Botón de envío */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-accent hover:bg-brand-secondary text-white rounded-xl py-3 text-lg font-semibold transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                Guardando perfil...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Completar perfil
              </>
            )}
          </Button>

          <p className="text-white/60 text-sm text-center">
            Al completar tu perfil, activarás tu cobertura Vita365 con ID único
          </p>
        </motion.form>
      </div>
      
      <Toaster />
    </div>
  );
}