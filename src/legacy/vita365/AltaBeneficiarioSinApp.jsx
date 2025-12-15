import React, { useState } from 'react';
import { supabase } from '../../lib/customSupabaseClient.js';

const AltaBeneficiarioSinApp = ({ titularId, onBeneficiarioCreado, onCerrar, formDataInicial }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(formDataInicial || {
    nombre: '',
    edad: '',
    sexo: 'hombre',
    parentesco: 'hijo'
  });

  const opcionesSexo = [
    { value: 'hombre', label: 'Hombre' },
    { value: 'mujer', label: 'Mujer' },
    { value: 'trans_mujer', label: 'Mujer Trans' },
    { value: 'trans_hombre', label: 'Hombre Trans' },
    { value: 'no_binario', label: 'No binario' }
  ];

  const opcionesParentesco = [
    { value: 'hijo', label: 'Hijo' },
    { value: 'hija', label: 'Hija' },
    { value: 'esposo', label: 'Esposo' },
    { value: 'esposa', label: 'Esposa' },
    { value: 'padre', label: 'Padre' },
    { value: 'madre', label: 'Madre' },
    { value: 'hermano', label: 'Hermano' },
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

  const generarPDFCertificado = async (beneficiarioData) => {
    try {
      // Aquí llamaremos a la Edge Function para generar el PDF
      // Por ahora simulamos la URL del PDF
      const mockPdfUrl = `https://storage.supabase.co/certificados/solo_vita_${beneficiarioData.id}.pdf`;
      
      // TODO: Implementar llamada real a Edge Function
      /*
      const { data, error } = await supabase.functions.invoke('generar-certificado', {
        body: {
          tipo: 'solo_vita',
          beneficiario: beneficiarioData,
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
    
    if (!validarFormulario()) return;
    
    setLoading(true);
    
    try {
      // 1. Crear beneficiario
      const { data: beneficiarioData, error: beneficiarioError } = await supabase
        .from('beneficiarios')
        .insert({
          titular_profile_id: titularId,
          nombre: formData.nombre.trim(),
          edad: parseInt(formData.edad),
          sexo: formData.sexo,
          parentesco: formData.parentesco,
          acceso_app: false // SIN app para este flujo
        })
        .select()
        .single();

      if (beneficiarioError) {
        console.error('Error beneficiario:', beneficiarioError);
        toast.error(`Error al crear beneficiario: ${beneficiarioError.message}`);
        setLoading(false);
        return;
      }

      // 2. Generar PDF del certificado
      let pdfUrl = '';
      try {
        pdfUrl = await generarPDFCertificado(beneficiarioData);
      } catch (pdfError) {
        console.error('Error PDF:', pdfError);
        // Continuamos sin PDF por ahora
        pdfUrl = 'pending_generation';
      }

      // 3. Emitir certificado usando la función de base de datos
      const { data: certificadoData, error: certificadoError } = await supabase
        .rpc('emitir_certificado', {
          p_beneficiario_id: beneficiarioData.id,
          p_beneficiario_profile_id: null, // No tiene profile porque no usa app
          p_tipo: 'solo_vita',
          p_pdf_url: pdfUrl
        });

      if (certificadoError) {
        console.error('Error certificado:', certificadoError);
        toast.error(`Error al emitir certificado: ${certificadoError.message}`);
        // No retornamos porque el beneficiario ya fue creado
      }

      // 4. Otorgar recompensas al titular
      const { error: recompensasError } = await supabase
        .rpc('otorga_recompensas', {
          p_titular_id: titularId
        });

      if (recompensasError) {
        console.error('Error recompensas:', recompensasError);
        // No mostramos error al usuario, es secundario
      }

      toast.success(`¡Beneficiario ${formData.nombre} agregado correctamente!`);
      
      // Notificar al componente padre
      if (onBeneficiarioCreado) {
        onBeneficiarioCreado(beneficiarioData);
      }
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        edad: '',
        sexo: 'hombre',
        parentesco: 'hijo'
      });
      
      // Cerrar modal si existe
      if (onCerrar) {
        onCerrar();
      }
      
    } catch (error) {
      console.error('Error general:', error);
      toast.error('Error inesperado al crear beneficiario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Agregar Beneficiario
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

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          📋 Beneficiario SIN acceso a la app
        </h3>
        <p className="text-sm text-blue-700">
          Este beneficiario recibirá solo el certificado Vita365. 
          No tendrá acceso a la aplicación Zinha.
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nombre del beneficiario"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Edad en años"
            required
          />
        </div>

        {/* Sexo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sexo *
          </label>
          <select
            name="sexo"
            value={formData.sexo}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {opcionesParentesco.map(opcion => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </div>

        {/* Información del certificado */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">
            🎯 Certificado que recibirá:
          </h3>
          <div className="text-sm text-green-700">
            <p>• Certificado Vita365 (solo protección)</p>
            <p>• Válido por 1 año</p>
            <p>• Elegible para servicios funerarios después de 3 meses</p>
            <p>• PDF descargable e imprimible</p>
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
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creando beneficiario...
              </div>
            ) : (
              'Agregar beneficiario'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AltaBeneficiarioSinApp;
