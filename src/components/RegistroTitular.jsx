import React, { useState } from 'react';
import { supabase } from '../../lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const RegistroTitular = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'mensual',
    metodo_pago: 'mock' // Por ahora usamos mock, luego se integra Stripe
  });

  const precios = {
    mensual: 299.00,
    anual: 2999.00,
    vitalicio: 9999.00
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
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

  const calcularProximaRenovacion = (plan) => {
    const now = new Date();
    switch (plan) {
      case 'mensual':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'anual':
        now.setFullYear(now.getFullYear() + 1);
        break;
      case 'vitalicio':
        now.setFullYear(now.getFullYear() + 100); // 100 años para vitalicio
        break;
      default:
        now.setMonth(now.getMonth() + 1);
    }
    return now.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    
    setLoading(true);
    
    try {
      // 1. Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre_completo: formData.nombre_completo
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

      // 2. Crear perfil en public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          nombre_completo: formData.nombre_completo,
          rol: 'titular',
          has_paid: true,
          profile_completed: true
        });

      if (profileError) {
        console.error('Error profile:', profileError);
        toast.error(`Error al crear perfil: ${profileError.message}`);
        setLoading(false);
        return;
      }

      // 3. Crear suscripción
      const proximaRenovacion = calcularProximaRenovacion(formData.plan);
      const { data: suscripcionData, error: suscripcionError } = await supabase
        .from('suscripciones')
        .insert({
          titular_profile_id: authData.user.id,
          plan: formData.plan,
          proxima_renovacion: proximaRenovacion,
          precio: precios[formData.plan]
        })
        .select()
        .single();

      if (suscripcionError) {
        console.error('Error suscripción:', suscripcionError);
        toast.error(`Error al crear suscripción: ${suscripcionError.message}`);
        setLoading(false);
        return;
      }

      // 4. Registrar pago inicial
      const { error: pagoError } = await supabase
        .from('pagos')
        .insert({
          titular_profile_id: authData.user.id,
          suscripcion_id: suscripcionData.id,
          monto: precios[formData.plan],
          metodo_pago: formData.metodo_pago,
          estado: 'completado',
          concepto: `Suscripción ${formData.plan} - Pago inicial`
        });

      if (pagoError) {
        console.error('Error pago:', pagoError);
        toast.error(`Error al registrar pago: ${pagoError.message}`);
        // No retornamos aquí porque el usuario ya está creado
      }

      toast.success('¡Registro exitoso! Bienvenido a Vita365');
      
      // 5. Redirigir a dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error general:', error);
      toast.error('Error inesperado durante el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registro Vita365
          </h1>
          <p className="text-gray-600">
            Comienza tu protección integral hoy
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Tu nombre completo"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="tu@email.com"
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Confirma tu contraseña"
              required
            />
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan de suscripción *
            </label>
            <select
              name="plan"
              value={formData.plan}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="mensual">Mensual - $299 MXN</option>
              <option value="anual">Anual - $2,999 MXN (ahorra 17%)</option>
              <option value="vitalicio">Vitalicio - $9,999 MXN</option>
            </select>
          </div>

          {/* Método de pago (mock por ahora) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de pago
            </label>
            <select
              name="metodo_pago"
              value={formData.metodo_pago}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="mock">Pago simulado (demo)</option>
              <option value="stripe" disabled>Tarjeta (próximamente)</option>
              <option value="paypal" disabled>PayPal (próximamente)</option>
            </select>
          </div>

          {/* Resumen del plan */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">
              Resumen de tu plan {formData.plan}
            </h3>
            <div className="text-sm text-purple-700">
              <p>• Protección integral Vita365</p>
              <p>• Certificados para beneficiarios</p>
              <p>• Acceso completo a la plataforma</p>
              {formData.plan === 'anual' && <p>• ¡Ahorra 17% vs. plan mensual!</p>}
              {formData.plan === 'vitalicio' && <p>• ¡Pago único de por vida!</p>}
            </div>
            <div className="mt-3 text-lg font-bold text-purple-900">
              Total: ${precios[formData.plan].toLocaleString('es-MX')} MXN
            </div>
          </div>

          {/* Botón submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Procesando registro...
              </div>
            ) : (
              `Registrarme y pagar $${precios[formData.plan].toLocaleString('es-MX')}`
            )}
          </button>
        </form>

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

export default RegistroTitular;
