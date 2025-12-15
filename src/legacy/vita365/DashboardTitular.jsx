import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/customSupabaseClient.js';
import FormularioBeneficiario from './FormularioBeneficiario';
import ReemplazarBeneficiario from './ReemplazarBeneficiario';

const DashboardTitular = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resumenTitular, setResumenTitular] = useState(null);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [beneficiariasApp, setBeneficiariasApp] = useState([]);
  const [recompensas, setRecompensas] = useState([]);
  const [showModal, setShowModal] = useState(null); // 'beneficiario', 'codigo', 'reemplazar'
  const [codigoGenerado, setCodigoGenerado] = useState('');
  const [beneficiarioAReemplazar, setBeneficiarioAReemplazar] = useState(null);

  useEffect(() => {
    if (user) {
      cargarDatosDashboard();
    }
  }, [user]);

  const cargarDatosDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarResumenTitular(),
        cargarBeneficiarios(),
        cargarBeneficiariasApp(),
        cargarRecompensas()
      ]);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      toast.error('Error al cargar información del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const cargarResumenTitular = async () => {
    const { data, error } = await supabase
      .from('vw_titular_resumen')
      .select('*')
      .eq('titular_id', user.id)
      .single();

    if (error) {
      console.error('Error resumen titular:', error);
      return;
    }

    setResumenTitular(data);
  };

  const cargarBeneficiarios = async () => {
    const { data, error } = await supabase
      .from('beneficiarios')
      .select('*')
      .eq('titular_profile_id', user.id)
      .eq('estado', 'activo')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error beneficiarios:', error);
      return;
    }

    setBeneficiarios(data || []);
  };

  const cargarBeneficiariasApp = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('titular_id', user.id)
      .eq('app_access', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error beneficiarias app:', error);
      return;
    }

    setBeneficiariasApp(data || []);
  };

  const cargarRecompensas = async () => {
    const { data, error } = await supabase
      .from('recompensas')
      .select('*')
      .eq('titular_profile_id', user.id)
      .eq('usado', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error recompensas:', error);
      return;
    }

    setRecompensas(data || []);
  };

  const generarCodigoAcceso = async () => {
    setLoading(true);
    try {
      const { data: codigo, error } = await supabase
        .rpc('generar_codigo_acceso', {
          p_titular_id: user.id
        });

      if (error) {
        console.error('Error generando código:', error);
        toast.error(`Error al generar código: ${error.message}`);
        return;
      }

      setCodigoGenerado(codigo);
      setShowModal('codigo');
      toast.success('¡Código generado exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado al generar código');
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoGenerado);
    toast.success('¡Código copiado al portapapeles!');
  };

  const handleBeneficiarioCreado = () => {
    cargarDatosDashboard();
    setShowModal(null);
  };

  const reemplazarBeneficiario = (beneficiario) => {
    setBeneficiarioAReemplazar(beneficiario);
    setShowModal('reemplazar');
  };

  const handleReemplazoCompleto = () => {
    cargarDatosDashboard();
    setShowModal(null);
    setBeneficiarioAReemplazar(null);
  };

  if (loading && !resumenTitular) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Titular
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenido, {resumenTitular?.nombre_completo || user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumen general */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Beneficiarios</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {resumenTitular?.total_beneficiarios || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Con App Zinha</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {resumenTitular?.beneficiarias_con_app || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Certificados</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {resumenTitular?.certificados_emitidos || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Puntos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {resumenTitular?.puntos_totales || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de suscripción */}
        {resumenTitular && (
          <div className="bg-white rounded-lg shadow mb-8 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Suscripción Activa</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="text-lg font-medium capitalize">{resumenTitular.plan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  resumenTitular.estado_suscripcion === 'activo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {resumenTitular.estado_suscripcion}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Próxima renovación</p>
                <p className="text-lg font-medium">
                  {new Date(resumenTitular.proxima_renovacion).toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Beneficiarios */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Beneficiarios</h2>
                <button
                  onClick={() => setShowModal('beneficiario')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Agregar
                </button>
              </div>
            </div>
            <div className="p-6">
              {beneficiarios.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No tienes beneficiarios registrados
                </p>
              ) : (
                <div className="space-y-4">
                  {beneficiarios.map((beneficiario) => (
                    <div key={beneficiario.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">{beneficiario.nombre}</p>
                        <p className="text-sm text-gray-500">
                          {beneficiario.edad} años • {beneficiario.sexo} • {beneficiario.parentesco}
                        </p>
                        <p className="text-xs text-gray-400">
                          {beneficiario.acceso_app ? 'Con app' : 'Sin app'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => reemplazarBeneficiario(beneficiario)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Reemplazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Beneficiarias con app */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Beneficiarias con App</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowModal('beneficiario')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    + Agregar
                  </button>
                  <button
                    onClick={generarCodigoAcceso}
                    className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Generar código
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {beneficiariasApp.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No tienes beneficiarias con app registradas
                </p>
              ) : (
                <div className="space-y-4">
                  {beneficiariasApp.map((beneficiaria) => (
                    <div key={beneficiaria.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium">{beneficiaria.nombre_completo}</p>
                        <p className="text-sm text-gray-500">{beneficiaria.email}</p>
                        <p className="text-xs text-green-600">✓ Con acceso a Zinha</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recompensas */}
        {recompensas.length > 0 && (
          <div className="bg-white rounded-lg shadow mt-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recompensas Disponibles</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recompensas.map((recompensa) => (
                  <div key={recompensa.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{recompensa.descripcion}</h3>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {recompensa.puntos > 0 && `${recompensa.puntos} puntos`}
                        {recompensa.descuento_porcentaje > 0 && `${recompensa.descuento_porcentaje}% descuento`}
                      </span>
                      <span className="text-xs text-green-600">Disponible</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {showModal === 'beneficiario' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <FormularioBeneficiario
              titularId={user.id}
              onBeneficiarioCreado={handleBeneficiarioCreado}
              onCerrar={() => setShowModal(null)}
            />
          </div>
        </div>
      )}

      {showModal === 'reemplazar' && beneficiarioAReemplazar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <ReemplazarBeneficiario
              beneficiario={beneficiarioAReemplazar}
              titularId={user.id}
              onReemplazoCompleto={handleReemplazoCompleto}
              onCerrar={() => setShowModal(null)}
            />
          </div>
        </div>
      )}

      {showModal === 'codigo' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full bg-white rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Código Generado
            </h2>
            <div className="text-center mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="font-mono text-2xl font-bold text-purple-600 tracking-wider">
                  {codigoGenerado}
                </div>
                <button
                  onClick={copiarCodigo}
                  className="mt-2 text-purple-600 hover:text-purple-800 text-sm"
                >
                  📋 Copiar código
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Comparte este código con la beneficiaria para que se registre en la app
            </p>
            <button
              onClick={() => setShowModal(null)}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTitular;
