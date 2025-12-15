import React, { useState } from 'react';
import { supabase } from '../../lib/customSupabaseClient.js';
import { useNavigate } from 'react-router-dom';

const RegistroBeneficiaria = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: datos básicos, 2: código
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    password: '',
    confirmPassword: '',
    codigo_acceso: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.toUpperCase() // Los códigos siempre en mayúsculas
    }));
  };

  const handleBasicInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarDatosBasicos = () => {
    if (!formData.nombre_completo.trim()) {
      toast.error('El nombre completo es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('El email es requerido');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const validarCodigo = () => {
    if (!formData.codigo_acceso.trim()) {
      toast.error('El código de acceso es requerido');
      return false;
    }
    if (formData.codigo_acceso.length < 6) {
      toast.error('El código debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleContinuar = () => {
    if (validarDatosBasicos()) {
      setStep(2);
    }
  };

  const generarPDFCertificado = async (profileData, titularId) => {
    try {
      // Simulamos la URL del PDF por ahora
      const mockPdfUrl = `https://storage.supabase.co/certificados/vita_zinha_${profileData.id}.pdf`;
      
      // TODO: Implementar llamada real a Edge Function
      /*
      const { data, error } = await supabase.functions.invoke('generar-certificado', {
        body: {
          tipo: 'vita_zinha',
          beneficiario: profileData,
          titular_id: titularId
        }
      });
      
      if (error) throw error;
      return data.pdf_url;
      */
      
      return mockPdfUrl;
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarCodigo()) return;
    
    setLoading(true);
    
    try {
      // 1. Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre_completo: formData.nombre_completo,
            tipo_registro: 'beneficiaria'
          }
        }
      });

      if (authError) {
        console.error('Error auth:', authError);
        toast.error(`Error en registro: ${authError.message}`);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error('Error: No se pudo crear el usuario');
        setLoading(false);
        return;
      }

      // 2. Usar el código de acceso y obtener información del titular
      const { data: codigoUsado, error: codigoError } = await supabase
        .rpc('usar_codigo', {
          p_codigo: formData.codigo_acceso,
          p_profile_id: authData.user.id
        });

      if (codigoError) {
        console.error('Error código:', codigoError);
        toast.error(`Código inválido: ${codigoError.message}`);
        
        // Eliminar usuario creado si el código falló
        await supabase.auth.admin.deleteUser(authData.user.id);
        setLoading(false);
        return;
      }

      // 3. Obtener datos del código para saber el titular_id
      const { data: codigoData, error: codigoDataError } = await supabase
        .from('codigos_acceso')
        .select('titular_profile_id')
        .eq('codigo', formData.codigo_acceso)
        .single();

      if (codigoDataError) {
        console.error('Error obteniendo datos del código:', codigoDataError);
        toast.error('Error al obtener información del código');
        setLoading(false);
        return;
      }

      const titularId = codigoData.titular_profile_id;

      // 4. Crear perfil en public.profiles (la función usar_codigo ya actualiza algunos campos)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: formData.email,
          nombre_completo: formData.nombre_completo,
          rol: 'beneficiario',
          titular_id: titularId,
          app_access: true,
          has_paid: true, // Heredan el acceso del titular
          profile_completed: true
        });

      if (profileError) {
        console.error('Error profile:', profileError);
        toast.error(`Error al crear perfil: ${profileError.message}`);
        setLoading(false);
        return;
      }

      // 5. Actualizar el beneficiario correspondiente con el profile_id
      const { error: updateBeneficiarioError } = await supabase
        .from('beneficiarios')
        .update({
          beneficiario_profile_id: authData.user.id
        })
        .eq('titular_profile_id', titularId)
        .eq('acceso_app', true)
        .is('beneficiario_profile_id', null)
        .limit(1);

      if (updateBeneficiarioError) {
        console.error('Error actualizando beneficiario:', updateBeneficiarioError);
        // No detenemos el proceso por esto
      }

      // 6. Generar PDF del certificado
      let pdfUrl = '';
      try {
        pdfUrl = await generarPDFCertificado(authData.user, titularId);
      } catch (pdfError) {
        console.error('Error PDF:', pdfError);
        pdfUrl = 'pending_generation';
      }

      // 7. Emitir certificado Vita + Zinha
      const { error: certificadoError } = await supabase
        .rpc('emitir_certificado', {
          p_beneficiario_id: null, // No tenemos beneficiario_id específico
          p_beneficiario_profile_id: authData.user.id,
          p_tipo: 'vita_zinha',
          p_pdf_url: pdfUrl
        });

      if (certificadoError) {
        console.error('Error certificado:', certificadoError);
        toast.error(`Error al emitir certificado: ${certificadoError.message}`);
        // No retornamos porque la usuaria ya está creada
      }

      // 8. Otorgar recompensas al titular
      const { error: recompensasError } = await supabase
        .rpc('otorga_recompensas', {
          p_titular_id: titularId
        });

      if (recompensasError) {
        console.error('Error recompensas:', recompensasError);
        // No mostramos error al usuario
      }

      toast.success('¡Registro exitoso! Bienvenida a Zinha');
      
      // 9. Redirigir al dashboard de beneficiaria
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error general:', error);
      toast.error('Error inesperado durante el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registro Zinha
          </h1>
          <p className="text-gray-600">
            {step === 1 ? 'Crea tu cuenta' : 'Ingresa tu código de acceso'}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center mb-8">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
            2
          </div>
        </div>

        {step === 1 ? (
          // Paso 1: Datos básicos
          <form onSubmit={(e) => { e.preventDefault(); handleContinuar(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleBasicInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleBasicInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleBasicInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleBasicInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirma tu contraseña"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              Continuar
            </button>
          </form>
        ) : (
          // Paso 2: Código de acceso
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-purple-900 mb-2">
                🎯 Código de acceso
              </h3>
              <p className="text-sm text-purple-700">
                Ingresa el código que te proporcionó tu titular para acceder a Vita365 + Zinha
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de acceso *
              </label>
              <input
                type="text"
                name="codigo_acceso"
                value={formData.codigo_acceso}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-lg tracking-wider text-center"
                placeholder="ZINHA123456"
                style={{ textTransform: 'uppercase' }}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                El código comienza con "ZINHA" seguido de números
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">
                🎁 Al registrarte recibirás:
              </h3>
              <div className="text-sm text-purple-700 space-y-1">
                <p>• Certificado Vita365 + Zinha</p>
                <p>• Acceso completo a contenido exclusivo</p>
                <p>• Herramientas de bienestar integral</p>
                <p>• Comunidad de mujeres empoderadas</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </div>
                ) : (
                  'Completar registro'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistroBeneficiaria;
