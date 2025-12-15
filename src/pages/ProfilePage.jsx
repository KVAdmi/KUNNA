import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { User, Edit, Save, Camera, Heart, Briefcase, Meh, Smile, Frown, CreditCard, Bell, LogOut, Upload, Calendar, FileText, Loader2, Plus, Shield, Key, Users, ChevronDown, ChevronUp, Trash2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient';
import { generarYDescargarCert } from '@/lib/certificateGenerator';
import { FLAGS } from '../config/flags.ts';
import EmergencyContacts from '@/components/security/EmergencyContacts.jsx';
import AddContactModal from '@/components/security/AddContactModal.jsx';
import MercadoPagoPaymentModal from '@/components/payment/MercadoPagoPaymentModal.jsx';

// Componente de formulario inline para agregar contactos
const AddContactFormInline = ({ onAdd, onCancel }) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [relacion, setRelacion] = useState('');
  const [prioridad, setPrioridad] = useState(1);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !telefono || !relacion || !prioridad) return;
    
    setSaving(true);
    await onAdd({ nombre, telefono, relacion, prioridad });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white/60 backdrop-blur-sm rounded-2xl p-6">
      <h3 className="text-lg font-bold text-[#382a3c] mb-4">Nuevo Contacto de Emergencia</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-3 bg-white/80 border border-white/60 rounded-xl focus:outline-none focus:border-[#c1d43a] text-[#382a3c]"
          required
          style={{ fontFamily: 'Questrial, sans-serif' }}
        />
        
        <input
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="w-full px-4 py-3 bg-white/80 border border-white/60 rounded-xl focus:outline-none focus:border-[#c1d43a] text-[#382a3c]"
          required
          style={{ fontFamily: 'Questrial, sans-serif' }}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={relacion}
          onChange={(e) => setRelacion(e.target.value)}
          className="w-full px-4 py-3 bg-white/80 border border-white/60 rounded-xl focus:outline-none focus:border-[#c1d43a] text-[#382a3c]"
          required
          style={{ fontFamily: 'Questrial, sans-serif' }}
        >
          <option value="">Selecciona la relación</option>
          <option value="Familiar">Familiar</option>
          <option value="Amigo/a">Amigo/a</option>
          <option value="Pareja">Pareja</option>
          <option value="Compañero/a">Compañero/a</option>
          <option value="Vecino/a">Vecino/a</option>
          <option value="Otro">Otro</option>
        </select>
        
        <select
          value={prioridad}
          onChange={(e) => setPrioridad(parseInt(e.target.value))}
          className="w-full px-4 py-3 bg-white/80 border border-white/60 rounded-xl focus:outline-none focus:border-[#c1d43a] text-[#382a3c]"
          required
          style={{ fontFamily: 'Questrial, sans-serif' }}
        >
          <option value={1}>🚨 Prioridad 1 - URGENTE (Familia/Pareja)</option>
          <option value={2}>⚠️ Prioridad 2 - IMPORTANTE (Amigos cercanos)</option>
          <option value={3}>📞 Prioridad 3 - APOYO (Vecinos/Conocidos)</option>
        </select>
      </div>
      
      <div className="flex space-x-3 pt-2">
        <Button
          type="button"
          onClick={onCancel}
          className="bg-gray-400 hover:bg-gray-500 text-white rounded-xl px-6 py-2"
          style={{ fontFamily: 'Questrial, sans-serif' }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={saving || !nombre || !telefono || !relacion || !prioridad}
          className="bg-gradient-to-r from-[#c1d43a] to-[#a8c139] hover:from-[#a8c139] hover:to-[#c1d43a] text-[#382a3c] rounded-xl px-6 py-2 font-semibold disabled:opacity-50"
          style={{ fontFamily: 'Questrial, sans-serif' }}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Contacto'
          )}
        </Button>
      </div>
    </form>
  );
};

// Helper functions simplificadas para KUNNA (sin lógica Vita365)
const tieneAccesoGratuito = () => false; // Ya no hay códigos donativos
const tieneAccesoPorPago = (profile) => profile?.has_paid && profile?.plan_estado === 'activo';

const ProfilePage = () => {
  const { toast } = useToast();
  const { signOut: logout, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    momento_vida: 'emprendiendo',
    foto_url: '',
    tipo_plan: 'mensual',
    nombre_completo: '',
    fecha_nacimiento: '',
    curp: '',
    has_paid: false,
    plan_estado: 'inactivo', // 'inactivo', 'activo', 'vencido'
    fecha_inicio_plan: null,
    fecha_vencimiento_plan: null
  });
  const [editableProfile, setEditableProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showContactsSection, setShowContactsSection] = useState(false);
  const fileInputRef = useRef(null);

  // Variable calculada para el plan seleccionado
  const planSeleccionado = editableProfile.plan_pago || editableProfile.tipo_plan || profile.tipo_plan;

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('📋 Datos del perfil obtenidos:', { data, error });

        if (error && error.code !== 'PGRST116') {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar tu perfil.' });
        } else if (data) {
          console.log('✅ Perfil cargado:', data);
          setProfile(data);
          setEditableProfile(data);
        }
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, toast]);

  // Cargar contactos de emergencia
  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  // Mostrar tarjeta de bienvenida para nuevos usuarios
  const loadContacts = async () => {
    if (!user) return;
    
    setContactsLoading(true);
    const { data, error } = await supabase
      .from('contactos_emergencia')
      .select('*')
      .eq('user_id', user.id);

    if (!error) {
      setContacts(data || []);
    }
    setContactsLoading(false);
  };

  const handleAddContact = async (contactData) => {
    const { data, error } = await supabase
      .from('contactos_emergencia')
      .insert([{
        ...contactData,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo agregar el contacto'
      });
    } else {
      setContacts(prev => [...prev, data]);
      setShowContactModal(false);
      toast({
        title: 'Contacto agregado',
        description: 'El contacto de emergencia se agregó correctamente'
      });
    }
  };

  const handleDeleteContact = async (contactId) => {
    const { error } = await supabase
      .from('contactos_emergencia')
      .delete()
      .eq('id', contactId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el contacto'
      });
    } else {
      setContacts(prev => prev.filter(c => c.id !== contactId));
      toast({
        title: 'Contacto eliminado',
        description: 'El contacto de emergencia se eliminó correctamente'
      });
    }
  };

  // Función para calcular edad
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    return edad;
  };

  // Función para validar CURP (18 caracteres)
  const validarCURP = (curp) => {
    if (!curp) return false;
    // Eliminar espacios y convertir a mayúsculas
    const curpLimpio = curp.replace(/\s/g, '').toUpperCase();
    return curpLimpio.length === 18;
  };

  // Función para validar mayoría de edad
  const esMayorDeEdad = (fechaNacimiento) => {
    return calcularEdad(fechaNacimiento) >= 18;
  };

  // Manejar guardado de datos básicos del perfil
  const handleSaveProfileData = async () => {
    if (!user) {
      toast({ 
        variant: 'destructive', 
        title: 'Error de autenticación', 
        description: 'No hay usuario autenticado. Inicia sesión nuevamente.' 
      });
      return;
    }
    
    // Validaciones básicas solo de datos personales
    if (!editableProfile.nombre_completo || !editableProfile.fecha_nacimiento) {
      toast({ 
        variant: 'destructive', 
        title: 'Campos incompletos', 
        description: 'Por favor completa tu nombre y fecha de nacimiento.' 
      });
      return;
    }

    // Validación de mayoría de edad
    if (!esMayorDeEdad(editableProfile.fecha_nacimiento)) {
      const edad = calcularEdad(editableProfile.fecha_nacimiento);
      toast({ 
        variant: 'destructive', 
        title: 'Edad no válida', 
        description: `Debes ser mayor de edad. Tu edad actual: ${edad} años.` 
      });
      return;
    }

    setSaving(true);
    try {
      const dataToUpdate = {
        nombre_completo: editableProfile.nombre_completo,
        fecha_nacimiento: editableProfile.fecha_nacimiento,
        curp: editableProfile.curp?.toUpperCase() || null,
        profile_completed: true,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(dataToUpdate)
        .eq('id', user.id);

      if (error) {
        console.error('Error al guardar datos:', error);
        throw error;
      }

      const updatedProfile = { 
        ...profile, 
        ...editableProfile, 
        profile_completed: true
      };
      
      setProfile(updatedProfile);
      setEditableProfile(updatedProfile);
      
      toast({ 
        title: 'Perfil actualizado', 
        description: 'Tus datos han sido guardados exitosamente.' 
      });
    } catch (error) {
      console.error('Error completo:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error al guardar datos', 
        description: error.message || 'No se pudieron guardar los datos.' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Función para procesar pago con Mercado Pago
  const handlePayment = async () => {
    const planSeleccionado = editableProfile.plan_pago || editableProfile.tipo_plan || profile.tipo_plan;
    
    if (!planSeleccionado) {
      toast({
        variant: "destructive",
        title: "Selecciona un plan",
        description: "Por favor selecciona un plan de pago antes de continuar."
      });
      return;
    }

    // Validar que el perfil esté completo
    if (!profile.nombre_completo || !profile.fecha_nacimiento) {
      toast({
        variant: "destructive",
        title: "Completa tu perfil",
        description: "Debes completar tu nombre y fecha de nacimiento antes de proceder al pago."
      });
      return;
    }

    setProcessingPayment(true);
    setShowPaymentModal(true); // Abrir modal de Mercado Pago
    setProcessingPayment(false);
  };

  const handleLifeMomentChange = (moment) => {
    if (isEditing) {
      setEditableProfile(prev => ({ ...prev, momento_vida: moment }));
    }
  };

  const handleInputChange = (field, value) => {
    if (isEditing) {
      setEditableProfile(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editableProfile.username,
          momento_vida: editableProfile.momento_vida
        })
        .eq('id', user.id);

      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron guardar los cambios.' });
      } else {
        setProfile(editableProfile);
        toast({ title: 'Perfil actualizado', description: 'Tus cambios han sido guardados con éxito.' });
        setIsEditing(false);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron guardar los cambios.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen para subir.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          cacheControl: '3600',
          upsert: true 
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: publicUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Actualizar perfil con nueva URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ foto_url: publicUrl.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Actualizar estado local
      setProfile(prev => ({ ...prev, foto_url: publicUrl.publicUrl }));
      setEditableProfile(prev => ({ ...prev, foto_url: publicUrl.publicUrl }));
      
      toast({ title: 'Foto actualizada', description: 'Tu foto de perfil ha sido actualizada.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al subir foto', description: error.message });
    } finally {
      setUploading(false);
    }
  };

  // Función para ir a la página de pago
  const handleGoToPayment = async () => {
    // Verificar si ya tiene membresía activa
    if (tieneAccesoPorPago(profile)) {
      toast({
        title: "Membresía activa ✅",
        description: "Tu membresía ya está activa. Puedes gestionar tu plan desde configuración.",
      });
      return;
    }
    
    // Abrir modal de pago con Mercado Pago
    setShowPaymentModal(true);
  };

  // Función simplificada para confirmar pago exitoso
  const handlePaymentSuccess = async (tipoPlan = 'mensual') => {
    try {
      // Calcular fecha de vencimiento según el plan
      const fechaInicio = new Date();
      const fechaVencimiento = new Date(fechaInicio);
      
      switch (tipoPlan) {
        case 'mensual':
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
          break;
        case 'trimestral':
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 3);
          break;
        case 'semestral':
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 6);
          break;
        case 'anual':
          fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1);
          break;
        default:
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
      }

      // Actualizar perfil con plan activo
      const { error } = await supabase
        .from('profiles')
        .update({
          plan_estado: 'activo',
          tipo_plan: tipoPlan,
          fecha_inicio_plan: fechaInicio.toISOString(),
          fecha_vencimiento_plan: fechaVencimiento.toISOString(),
          has_paid: true
        })
        .eq('id', user.id);

      if (error) throw error;

      // Actualizar estado local
      const updatedProfile = {
        ...profile,
        plan_estado: 'activo',
        tipo_plan: tipoPlan,
        fecha_inicio_plan: fechaInicio.toISOString(),
        fecha_vencimiento_plan: fechaVencimiento.toISOString(),
        has_paid: true
      };
      
      setProfile(updatedProfile);
      setEditableProfile(updatedProfile);

      toast({
        title: '¡Pago procesado exitosamente! 🎉',
        description: 'Tu membresía KUNNA ha sido activada. ¡Disfruta de todos los beneficios!',
        className: 'bg-green-100 border-green-400 text-green-800'
      });
    } catch (error) {
      console.error('Error al confirmar pago:', error);
      toast({
        variant: "destructive",
        title: "Error al confirmar pago",
        description: "Tu pago fue procesado pero hubo un problema. Contáctanos."
      });
    }
  };

  const lifeMoments = {
    feliz: { icon: Smile, label: 'Feliz', color: 'bg-brand-highlight' },
    duelo: { icon: Frown, label: 'En Duelo', color: 'bg-brand-secondary' },
    emprendiendo: { icon: Briefcase, label: 'Emprendiendo', color: 'bg-brand-dark-blue' },
    soledad: { icon: Meh, label: 'En Soledad', color: 'bg-brand-primary' },
    maternando: { icon: Heart, label: 'Maternando', color: 'bg-pink-400' },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e6ff] via-[#e8d8f0] to-[#c8a6a6] p-4 overflow-hidden relative">
      {/* Elementos decorativos de fondo más alegres */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-[#c1d43a]/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-[#c8a6a6]/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#8d7583]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-20 w-24 h-24 bg-[#f5e6ff]/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-20 w-36 h-36 bg-[#c1d43a]/15 rounded-full blur-2xl"></div>
      </div>

      <Helmet>
        <title>Mi Perfil - KUNNA</title>
        <meta name="description" content="Gestiona tu perfil, comparte sobre ti y elige tu momento de vida." />
        <link href="https://fonts.googleapis.com/css2?family=Questrial&display=swap" rel="stylesheet" />
      </Helmet>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto relative z-10"
      >
        {/* Header del perfil - con más color y alegría */}
        <div className="relative bg-gradient-to-br from-white/40 via-[#f5e6ff]/30 to-white/35 backdrop-blur-xl rounded-[2rem] p-8 text-center mb-6 shadow-2xl border border-white/50" style={{ fontFamily: 'Questrial, sans-serif' }}>
          <div className="absolute top-6 right-6 flex space-x-3">
            <Button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
              size="icon" 
              disabled={saving}
              className="bg-gradient-to-r from-[#c1d43a] to-[#a8c139] hover:from-[#a8c139] hover:to-[#c1d43a] text-[#382a3c] rounded-full shadow-xl border-2 border-white/50 font-bold"
              style={{ boxShadow: '0 8px 25px rgba(193, 212, 58, 0.4)' }}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />)}
            </Button>
            <Button 
              onClick={logout} 
              size="icon" 
              className="bg-gradient-to-r from-[#c8a6a6] to-[#b89696] hover:from-[#b89696] hover:to-[#c8a6a6] text-white rounded-full shadow-xl border-2 border-white/50 font-bold"
              style={{ boxShadow: '0 8px 25px rgba(200, 166, 166, 0.4)' }}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Foto de perfil con colores más alegres */}
          <div className="relative w-40 h-40 mx-auto mb-8">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#c1d43a] via-[#c8a6a6] to-[#8d7583] p-2 shadow-2xl" style={{ boxShadow: '0 15px 35px rgba(193, 212, 58, 0.3)' }}>
              <div className="w-full h-full rounded-full bg-gradient-to-br from-white/90 to-[#f5e6ff]/80 p-1">
                <img 
                  src={profile.foto_url || '/images/logo_kunna.png'} 
                  alt="Foto de perfil" 
                  className="w-full h-full rounded-full object-cover shadow-inner" 
                />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              disabled={uploading}
              accept="image/*"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current.click()} 
              disabled={uploading} 
              className="absolute bottom-3 right-3 bg-gradient-to-r from-[#c1d43a] to-[#a8c139] text-[#382a3c] p-3 rounded-full hover:from-[#a8c139] hover:to-[#c1d43a] shadow-xl border-2 border-white font-bold"
              style={{ boxShadow: '0 8px 20px rgba(193, 212, 58, 0.4)' }}
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            </button>
          </div>

          {/* Información del usuario más elegante */}
          <div className="text-center mb-8">
            {isEditing ? (
              <input
                type="text"
                value={editableProfile.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="text-2xl font-bold text-[#382a3c] bg-white/60 backdrop-blur-sm border-2 border-[#c1d43a]/50 rounded-full px-6 py-3 text-center focus:outline-none focus:border-[#8d75838] focus:bg-white/80 transition-all duration-300 shadow-lg"
                placeholder="Tu nombre de usuario"
                style={{ fontFamily: 'Questrial, sans-serif' }}
              />
            ) : (
              <h1 className="text-3xl font-bold text-[#382a3c] mb-3 drop-shadow-sm" style={{ fontFamily: 'Questrial, sans-serif' }}>
                {profile.username || user.email}
              </h1>
            )}
            
            <div className="flex justify-center items-center space-x-2 mb-4">
              <span className="px-6 py-3 bg-gradient-to-r from-[#c1d43a] to-[#a8c139] text-[#382a3c] rounded-full text-sm font-bold border-2 border-white/50 backdrop-blur-sm shadow-xl">
                {profile.tipo_plan || 'básico'} Plan
              </span>
            </div>
          </div>
        </div>

        {/* Información Personal - Datos básicos KUNNA */}
        <div className="bg-gradient-to-br from-white/40 via-[#f5e6ff]/20 to-white/35 backdrop-blur-xl rounded-[2rem] p-8 mb-6 shadow-2xl border border-white/50" style={{ fontFamily: 'Questrial, sans-serif' }}>
          <h2 className="text-2xl font-bold text-[#382a3c] text-center mb-8" style={{ fontFamily: 'Questrial, sans-serif' }}>
            Información Personal
          </h2>
          
          <div className="space-y-4" style={{ fontFamily: 'Questrial, sans-serif' }}>
            {profile.nombre_completo ? (
              <>
                <div className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-[#382a3c]" />
                    <span className="text-[#382a3c] font-medium">Nombre completo</span>
                  </div>
                  <span className="text-sm text-[#382a3c]/70">{profile.nombre_completo}</span>
                </div>
                
                {profile.fecha_nacimiento && (
                  <div className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-[#382a3c]" />
                      <span className="text-[#382a3c] font-medium">Fecha de nacimiento</span>
                    </div>
                    <span className="text-sm text-[#382a3c]/70">{new Date(profile.fecha_nacimiento).toLocaleDateString('es-MX')}</span>
                  </div>
                )}
                
                {profile.curp && (
                  <div className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-[#382a3c]" />
                      <span className="text-[#382a3c] font-medium">CURP</span>
                    </div>
                    <span className="text-sm text-[#382a3c]/70 font-mono">{profile.curp}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#382a3c] mb-6 font-medium">
                  Completa tu perfil para disfrutar de KUNNA
                </p>
                <Button 
                  onClick={handleSaveProfileData}
                  className="bg-gradient-to-r from-[#c1d43a] to-[#a8c139] hover:from-[#a8c139] hover:to-[#c1d43a] text-[#382a3c] rounded-2xl font-bold shadow-xl border-2 border-white/50 px-8 py-4"
                  style={{ 
                    fontFamily: 'Questrial, sans-serif',
                    boxShadow: '0 8px 25px rgba(193, 212, 58, 0.4)'
                  }}
                >
                  <Save className="w-5 h-5 mr-2" />
                  Guardar Datos
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Suscripción y Pagos - con más color */}
        <div className="bg-gradient-to-br from-white/40 via-[#c8a6a6]/10 to-white/35 backdrop-blur-xl rounded-[2rem] p-8 mb-6 shadow-2xl border border-white/50" style={{ fontFamily: 'Questrial, sans-serif' }}>
          <h2 className="text-2xl font-bold text-[#382a3c] mb-8 text-center">Suscripción y Pagos</h2>
          <div className="space-y-6">
            <div 
              onClick={handleGoToPayment} 
              className="flex items-center justify-between p-6 bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-2xl cursor-pointer hover:from-white/80 hover:to-white/60 border-2 border-white/60 shadow-xl hover:shadow-2xl"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-[#c1d43a] to-[#a8c139] rounded-full shadow-lg">
                  <CreditCard className="w-6 h-6 text-[#382a3c]" />
                </div>
                <div>
                  <span className="text-[#382a3c] font-semibold text-lg block">
                    Gestionar plan y pagos
                  </span>
                  {!profile.has_paid && (
                    <p className="text-sm text-[#382a3c]/70">
                      Activar membresía KUNNA
                    </p>
                  )}
                </div>
              </div>
              <div className="text-2xl text-[#382a3c]/70">→</div>
            </div>
            <div className={`flex items-center justify-between p-6 rounded-2xl backdrop-blur-sm border shadow-lg ${
              profile.has_paid 
                ? 'bg-green-100/70 border-green-300/70' 
                : 'bg-white/50 border-white/60'
            }`}>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  profile.has_paid 
                    ? 'bg-green-200' 
                    : 'bg-orange-100'
                }`}>
                  <Bell className={`w-6 h-6 ${
                    profile.has_paid 
                      ? 'text-green-600' 
                      : 'text-orange-600'
                  }`} />
                </div>
                <span className={`font-semibold text-lg ${
                  profile.has_paid 
                    ? 'text-green-800' 
                    : 'text-[#382a3c]'
                }`}>Estado del plan</span>
              </div>
              <span className={`text-sm font-bold px-4 py-2 rounded-full ${
                profile.has_paid 
                  ? 'text-green-600 bg-green-200' 
                  : 'text-orange-600 bg-orange-100'
              }`}>
                {profile.has_paid ? 'Activo ✓' : 'Pendiente ⏳'}
              </span>
            </div>
          </div>
        </div>

        {/* Sección de Contactos de Emergencia - más colorida */}
        <div className="bg-gradient-to-br from-white/40 via-[#8d7583]/10 to-white/35 backdrop-blur-xl rounded-[2rem] p-8 mb-6 shadow-2xl border border-white/50" style={{ fontFamily: 'Questrial, sans-serif' }}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-[#8d7583] to-[#382a3c] rounded-full shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#382a3c]">Contactos de Emergencia</h2>
            </div>
            {contacts.length > 0 && (
              <Button 
                onClick={() => setShowContactsSection(!showContactsSection)}
                className="bg-gradient-to-r from-white/70 to-white/50 hover:from-white/90 hover:to-white/70 text-[#382a3c] rounded-2xl px-4 py-2 font-medium shadow-lg border-2 border-white/50 backdrop-blur-sm transition-all duration-300"
                style={{ fontFamily: 'Questrial, sans-serif' }}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-sm">{showContactsSection ? 'Ocultar' : 'Ver'} contactos</span>
                  {showContactsSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </Button>
            )}
          </div>
          
          <div className="text-sm text-[#382a3c]/90 mb-6 text-center bg-gradient-to-r from-white/60 to-white/40 rounded-2xl p-5 backdrop-blur-sm border-2 border-white/60 shadow-lg font-medium">
             Configura tus contactos de confianza para emergencias. Estos contactos recibirán alertas cuando uses el botón de auxilio.
          </div>

          {/* Botón Agregar - ahora debajo del texto explicativo */}
          {!showAddContactForm && (
            <div className="text-center mb-6">
              <Button 
                onClick={() => setShowAddContactForm(true)}
                className="bg-gradient-to-r from-[#c1d43a] to-[#a8c139] hover:from-[#a8c139] hover:to-[#c1d43a] text-[#382a3c] rounded-xl px-6 py-3 font-semibold shadow-lg border-2 border-white/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Contacto
              </Button>
            </div>
          )}

          {/* Formulario para agregar contacto - aparece aquí mismo */}
          {showAddContactForm && (
            <div className="mb-6">
              <AddContactFormInline 
                onAdd={(contactData) => {
                  handleAddContact(contactData);
                  setShowAddContactForm(false);
                }}
                onCancel={() => setShowAddContactForm(false)}
              />
            </div>
          )}

          {/* Lista de contactos existentes */}
          {showContactsSection && contacts.length > 0 && (
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <div key={contact.id} className="p-4 bg-white/50 rounded-2xl border border-white/50 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      contact.prioridad === 1 ? 'bg-gradient-to-r from-[#382a3c] to-[#8d7583]' :
                      contact.prioridad === 2 ? 'bg-gradient-to-r from-[#8d7583] to-[#c8a6a6]' :
                      'bg-gradient-to-r from-[#c1d43a] to-[#c8a6a6]'
                    }`}>
                      <span className="text-white font-bold text-lg">
                        {contact.prioridad || 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#382a3c]">{contact.nombre}</h4>
                      <p className="text-sm text-[#382a3c]/70">{contact.relacion}</p>
                      <p className="text-sm text-[#382a3c]/60 font-mono">{contact.telefono}</p>
                      <p className="text-xs text-[#382a3c]/50">
                        {contact.prioridad === 1 ? ' Prioridad URGENTE' :
                         contact.prioridad === 2 ? ' Prioridad IMPORTANTE' :
                         ' Prioridad APOYO'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteContact(contact.id)}
                    size="icon"
                    className="bg-gradient-to-r from-[#c8a6a6] to-[#8d7583] hover:from-[#8d7583] hover:to-[#c8a6a6] text-white rounded-full shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Mensaje cuando no hay contactos */}
          {!showAddContactForm && contacts.length === 0 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#8d7583]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#8d7583]" />
              </div>
              <p className="text-[#382a3c]/70">Usa el botón "Agregar Contacto" de arriba para configurar tus contactos de emergencia</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal para agregar contacto */}
      <AddContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onAdd={handleAddContact}
      />

      {/* Modal de pago integrado */}
      <MercadoPagoPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPlan={planSeleccionado}
      />
    </div>
  );
};

export default ProfilePage;