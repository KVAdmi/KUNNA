import React, { useState } from 'react';
import AltaBeneficiarioSinApp from './AltaBeneficiarioSinApp';
import AltaBeneficiariaConApp from './AltaBeneficiariaConApp';

const FormularioBeneficiario = ({ titularId, onBeneficiarioCreado, onCerrar }) => {
  const [step, setStep] = useState(1); // 1: tipo, 2: datos básicos, 3: decisión app
  const [tipoFlujo, setTipoFlujo] = useState(null); // 'sin_app', 'con_app'
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    sexo: '',
    parentesco: ''
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

  const validarDatosBasicos = () => {
    if (!formData.nombre.trim()) {
      return 'El nombre es requerido';
    }
    if (!formData.edad || formData.edad < 0 || formData.edad > 120) {
      return 'La edad debe estar entre 0 y 120 años';
    }
    if (!formData.sexo) {
      return 'El sexo es requerido';
    }
    if (!formData.parentesco) {
      return 'El parentesco es requerido';
    }
    return null;
  };

  const handleContinuarDatos = () => {
    const error = validarDatosBasicos();
    if (error) {
      alert(error);
      return;
    }

    // Guardar lógica de negocio: verificar si puede tener app
    const puedeApp = formData.sexo === 'mujer' || formData.sexo === 'trans_mujer';
    
    if (puedeApp) {
      setStep(3); // Ir a decisión de app
    } else {
      // Hombres van directo al flujo sin app
      setTipoFlujo('sin_app');
      setStep(4);
    }
  };

  const handleDecisionApp = (decision) => {
    setTipoFlujo(decision ? 'con_app' : 'sin_app');
    setStep(4);
  };

  const verificarElegibilidadFuneraria = (certificado) => {
    if (!certificado) return false;
    
    const fechaEmision = new Date(certificado.fecha_emision);
    const tresMesesDespues = new Date(fechaEmision);
    tresMesesDespues.setMonth(tresMesesDespues.getMonth() + 3);
    
    return new Date() >= tresMesesDespues;
  };

  // Step 1: Tipo de beneficiario
  if (step === 1) {
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

        <div className="space-y-4">
          <button
            onClick={() => setStep(2)}
            className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                📋 Agregar Beneficiario
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Para cualquier persona (hombre, mujer, etc.). 
                El sistema determinará automáticamente las opciones disponibles.
              </p>
            </div>
          </button>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              ℹ️ ¿Cómo funciona?
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Hombres: Solo certificado Vita365</li>
              <li>• Mujeres: Opción de certificado + app Zinha</li>
              <li>• Sistema inteligente de recompensas</li>
              <li>• Elegibilidad funeraria después de 3 meses</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Datos básicos
  if (step === 2) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Datos del Beneficiario
          </h2>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleContinuarDatos(); }} className="space-y-6">
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
              required
            >
              <option value="">Selecciona una opción</option>
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
              required
            >
              <option value="">Selecciona una opción</option>
              {opcionesParentesco.map(opcion => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          {/* Botones */}
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
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continuar
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Step 3: Decisión de app (solo para mujeres)
  if (step === 3) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Acceso a la App Zinha
          </h2>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¿{formData.nombre} desea acceso a la app Zinha?
          </h3>
          <p className="text-gray-600">
            Como es {formData.sexo === 'mujer' ? 'mujer' : 'mujer trans'}, puede acceder al contenido exclusivo de la app
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Opción CON app */}
          <div className="border-2 border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">
              ✨ CON app Zinha
            </h4>
            <ul className="text-sm text-purple-700 space-y-1 mb-4">
              <li>• Certificado Vita365 + Zinha</li>
              <li>• Acceso completo a la app</li>
              <li>• Contenido exclusivo para mujeres</li>
              <li>• Recompensas adicionales para ti</li>
            </ul>
            <button
              onClick={() => handleDecisionApp(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Sí, con app Zinha
            </button>
          </div>

          {/* Opción SIN app */}
          <div className="border-2 border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              📋 Solo certificado
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 mb-4">
              <li>• Certificado Vita365 únicamente</li>
              <li>• Protección completa</li>
              <li>• Sin acceso a la app</li>
              <li>• Proceso más rápido</li>
            </ul>
            <button
              onClick={() => handleDecisionApp(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Solo certificado
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(2)}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Atrás
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Mostrar el componente correspondiente
  if (step === 4) {
    if (tipoFlujo === 'con_app') {
      return (
        <AltaBeneficiariaConApp
          titularId={titularId}
          onBeneficiariaCreada={onBeneficiarioCreado}
          onCerrar={onCerrar}
          formDataInicial={formData}
        />
      );
    } else {
      return (
        <AltaBeneficiarioSinApp
          titularId={titularId}
          onBeneficiarioCreado={onBeneficiarioCreado}
          onCerrar={onCerrar}
          formDataInicial={formData}
        />
      );
    }
  }

  return null;
};

export default FormularioBeneficiario;
