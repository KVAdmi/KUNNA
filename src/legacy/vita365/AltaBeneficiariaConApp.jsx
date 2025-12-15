import React, { useState } from 'react';
import { supabase } from '../../lib/customSupabaseClient.js';

const AltaBeneficiariaConApp = ({ titularId, onBeneficiariaCreada, onCerrar, formDataInicial }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: datos, 2: código generado
  const [codigoGenerado, setCodigoGenerado] = useState('');
  const [formData, setFormData] = useState(formDataInicial || {
    nombre: '',
    edad: '',
    sexo: 'mujer',
    parentesco: 'hija'
  });

  const opcionesSexo = [
    { value: 'mujer', label: 'Mujer' },
    { value: 'trans_mujer', label: 'Mujer Trans' }
  ];

  const opcionesParentesco = [
    { value: 'hija', label: 'Hija' },
    { value: 'esposa', label: 'Esposa' },
    { value: 'madre', label: 'Madre' },
    { value: 'hermana', label: 'Hermana' },
    { value: 'otro', label: 'Otro' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }
    if (!formData.edad || formData.edad < 0 || formData.edad > 120) {
      toast.error('La edad debe estar entre 0 y 120 años');
      return false;
    }
    return true;
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoGenerado);
    toast.success('¡Código copiado al portapapeles!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    
    setLoading(true);
    
    try {
      // Paso 1: Generar código de acceso
      const { data: codigo, error: codigoError } = await supabase
        .rpc('generar_codigo_acceso', {
          p_titular_id: titularId
        });

      if (codigoError) {
        console.error('Error código:', codigoError);
        toast.error(`Error al generar código: ${codigoError.message}`);
        setLoading(false);
        return;
      }

      // Paso 2: Crear beneficiario (pendiente de que se registre)
      const { data: beneficiarioData, error: beneficiarioError } = await supabase
        .from('beneficiarios')
        .insert({
          titular_profile_id: titularId,
          nombre: formData.nombre.trim(),
          edad: parseInt(formData.edad),
          sexo: formData.sexo,
          parentesco: formData.parentesco,
          acceso_app: true, // CON app para este flujo
          beneficiario_profile_id: null // Se asignará cuando se registre
        })
        .select()
        .single();

      if (beneficiarioError) {
        console.error('Error beneficiario:', beneficiarioError);
        toast.error(`Error al crear beneficiario: ${beneficiarioError.message}`);
        setLoading(false);
        return;
      }

      setCodigoGenerado(codigo);
      setStep(2);
      
      toast.success(`¡Código generado para ${formData.nombre}!`);
      
      // Notificar al componente padre
      if (onBeneficiariaCreada) {
        onBeneficiariaCreada(beneficiarioData, codigo);
      }
      
    } catch (error) {
      console.error('Error general:', error);
      toast.error('Error inesperado al crear beneficiaria');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaBeneficiaria = () => {
    setStep(1);
    setCodigoGenerado('');
    setFormData({
      nombre: '',
      edad: '',
      sexo: 'mujer',
      parentesco: 'hija'
    });
  };

  if (step === 2) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Código generado exitosamente!
          </h2>
          <p className="text-gray-600">
            Comparte este código con <strong>{formData.nombre}</strong> para que se registre en la app
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg mb-6">
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de acceso
            </label>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white px-6 py-4 rounded-lg border-2 border-purple-200 font-mono text-2xl font-bold text-purple-600 tracking-wider">
                {codigoGenerado}
              </div>
              <button
                onClick={copiarCodigo}
                className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors"
                title="Copiar código"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            📱 Instrucciones para {formData.nombre}:
          </h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Descargar la app Zinha</li>
            <li>2. Crear cuenta nueva con su email</li>
            <li>3. Ingresar este código cuando se lo pida</li>
            <li>4. ¡Listo! Tendrá acceso completo a Vita365 + Zinha</li>
          </ol>
        </div>

        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-green-900 mb-2">
            🎁 Al completar el registro recibirá:
          </h3>
          <div className="text-sm text-green-700">
            <p>• Certificado Vita365 + Zinha</p>
            <p>• Acceso completo a la app Zinha</p>
            <p>• Contenido exclusivo para mujeres</p>
            <p>• Beneficios y recompensas adicionales</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleNuevaBeneficiaria}
            className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Agregar otra beneficiaria
          </button>
          {onCerrar && (
            <button
              onClick={onCerrar}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Agregar Beneficiaria con App
        </h2>
        {onCerrar && (
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="bg-purple-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-purple-900 mb-2">
          📱 Beneficiaria CON acceso a la app Zinha
        </h3>
        <p className="text-sm text-purple-700">
          Esta beneficiaria recibirá un código para registrarse en la app y obtener 
          acceso completo a Vita365 + contenido exclusivo de Zinha.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre completo *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Nombre de la beneficiaria"
            required
          />
        </div>

        {/* Edad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Edad *
          </label>
          <input
            type="number"
            name="edad"
            value={formData.edad}
            onChange={handleInputChange}
            min="0"
            max="120"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Edad en años"
            required
          />
        </div>

        {/* Sexo (solo mujer/trans_mujer) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sexo *
          </label>
          <select
            name="sexo"
            value={formData.sexo}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {opcionesSexo.map(opcion => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </div>

        {/* Parentesco */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parentesco *
          </label>
          <select
            name="parentesco"
            value={formData.parentesco}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {opcionesParentesco.map(opcion => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </div>

        {/* Información del proceso */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">
            🎯 Proceso después de generar código:
          </h3>
          <div className="text-sm text-purple-700 space-y-1">
            <p>1. Se generará un código único para {formData.nombre || 'la beneficiaria'}</p>
            <p>2. Ella se registrará en la app con ese código</p>
            <p>3. Recibirá certificado Vita365 + Zinha automáticamente</p>
            <p>4. Tendrás acceso a recompensas adicionales</p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          {onCerrar && (
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generando código...
              </div>
            ) : (
              'Generar código de acceso'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AltaBeneficiariaConApp;
