import React, { useState } from 'react';
import { supabase } from '../../lib/customSupabaseClient';
import { toast } from 'react-hot-toast';
import FormularioBeneficiario from './FormularioBeneficiario';

const ReemplazarBeneficiario = ({ beneficiario, titularId, onReemplazoCompleto, onCerrar }) => {
  const [step, setStep] = useState(1); // 1: confirmar, 2: nuevo beneficiario
  const [loading, setLoading] = useState(false);

  const confirmarReemplazo = async () => {
    setLoading(true);
    try {
      // 1. Marcar beneficiario anterior como inactivo
      const { error: updateError } = await supabase
        .from('beneficiarios')
        .update({
          estado: 'reemplazado',
          fecha_baja: new Date().toISOString(),
          motivo_baja: 'Reemplazado por titular'
        })
        .eq('id', beneficiario.id);

      if (updateError) {
        console.error('Error marcando beneficiario como reemplazado:', updateError);
        toast.error('Error al procesar reemplazo');
        setLoading(false);
        return;
      }

      // 2. Si tenía certificados, marcarlos como cancelados
      const { error: certificadosError } = await supabase
        .from('certificados')
        .update({
          estado: 'cancelado'
        })
        .eq('beneficiario_id', beneficiario.id);

      if (certificadosError) {
        console.error('Error cancelando certificados:', certificadosError);
        // No detenemos el proceso por esto
      }

      toast.success(`${beneficiario.nombre} ha sido marcado como reemplazado`);
      setStep(2);
      
    } catch (error) {
      console.error('Error en reemplazo:', error);
      toast.error('Error inesperado durante el reemplazo');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoBeneficiario = async (nuevoBeneficiario) => {
    try {
      // Recalcular recompensas después del reemplazo
      const { error: recompensasError } = await supabase
        .rpc('otorga_recompensas', {
          p_titular_id: titularId
        });

      if (recompensasError) {
        console.error('Error recalculando recompensas:', recompensasError);
        // No mostramos error al usuario
      }

      toast.success('¡Reemplazo completado exitosamente!');
      
      if (onReemplazoCompleto) {
        onReemplazoCompleto(beneficiario, nuevoBeneficiario);
      }
      
      if (onCerrar) {
        onCerrar();
      }
    } catch (error) {
      console.error('Error finalizando reemplazo:', error);
      toast.error('Error al finalizar reemplazo');
    }
  };

  if (step === 1) {
    return (
      <div className="bg-white rounded-lg p-6 max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reemplazar Beneficiario
          </h2>
          <p className="text-gray-600">
            ¿Estás seguro de que quieres reemplazar a este beneficiario?
          </p>
        </div>

        {/* Información del beneficiario actual */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Beneficiario actual:</h3>
          <div className="text-sm text-gray-700">
            <p><strong>Nombre:</strong> {beneficiario.nombre}</p>
            <p><strong>Edad:</strong> {beneficiario.edad} años</p>
            <p><strong>Sexo:</strong> {beneficiario.sexo}</p>
            <p><strong>Parentesco:</strong> {beneficiario.parentesco}</p>
            <p><strong>Acceso app:</strong> {beneficiario.acceso_app ? 'Sí' : 'No'}</p>
            <p><strong>Registrado:</strong> {new Date(beneficiario.created_at).toLocaleDateString('es-MX')}</p>
          </div>
        </div>

        {/* Advertencias */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Importante:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• El beneficiario actual será marcado como inactivo</li>
            <li>• Sus certificados serán cancelados</li>
            <li>• Deberás agregar un nuevo beneficiario</li>
            <li>• Las recompensas se recalcularán automáticamente</li>
            <li>• Esta acción no se puede deshacer</li>
          </ul>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onCerrar}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={confirmarReemplazo}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Procesando...
              </div>
            ) : (
              'Confirmar reemplazo'
            )}
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-md">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-green-800 mb-1">
            ✅ Beneficiario reemplazado
          </h3>
          <p className="text-sm text-green-700">
            {beneficiario.nombre} ha sido marcado como inactivo. 
            Ahora agrega el nuevo beneficiario.
          </p>
        </div>
        
        <FormularioBeneficiario
          titularId={titularId}
          onBeneficiarioCreado={handleNuevoBeneficiario}
          onCerrar={onCerrar}
        />
      </div>
    );
  }

  return null;
};

export default ReemplazarBeneficiario;
