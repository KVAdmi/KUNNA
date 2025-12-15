import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient';

// Función utilitaria para hash SHA-256
const sha256Hex = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const GhostPinSetup = ({ profile, onProfileUpdate }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    current_pin: '',
    nuevo_pin: '',
    confirmar_pin: '',
    ghost_pin_hint: ''
  });

  const [errors, setErrors] = useState({});
  const hasExistingPin = Boolean(profile?.ghost_pin_hash);

  // Validaciones
  const validatePin = (pin) => {
    if (!pin) return 'El PIN es requerido';
    if (!/^\d{4,6}$/.test(pin)) return 'El PIN debe tener entre 4 y 6 dígitos';
    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    // Si ya tiene PIN, requiere el actual
    if (hasExistingPin && isEditing) {
      const currentError = validatePin(formData.current_pin);
      if (currentError) newErrors.current_pin = currentError;
    }

    // Validar nuevo PIN
    const newPinError = validatePin(formData.nuevo_pin);
    if (newPinError) newErrors.nuevo_pin = newPinError;

    // Validar confirmación
    if (formData.nuevo_pin !== formData.confirmar_pin) {
      newErrors.confirmar_pin = 'Los PINs no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    // Solo permitir números y limitar longitud
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, [field]: numericValue }));
    
    // Limpiar error específico
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSavePin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Si tiene PIN existente, verificar el actual
      if (hasExistingPin) {
        const currentHash = await sha256Hex(formData.current_pin);
        if (currentHash !== profile.ghost_pin_hash) {
          setErrors({ current_pin: 'PIN actual incorrecto' });
          setLoading(false);
          return;
        }
      }

      // Hashear el nuevo PIN
      const newPinHash = await sha256Hex(formData.nuevo_pin);

      // Guardar en base de datos
      const { error } = await supabase
        .from('profiles')
        .update({
          ghost_pin_hash: newPinHash,
          ghost_pin_hint: formData.ghost_pin_hint || null
        })
        .eq('id', user.id);

      if (error) throw error;

      // Actualizar perfil local
      if (onProfileUpdate) {
        onProfileUpdate({
          ...profile,
          ghost_pin_hash: newPinHash,
          ghost_pin_hint: formData.ghost_pin_hint || null
        });
      }

      toast({
        title: '🔒 PIN de seguridad configurado',
        description: 'Tu PIN señuelo ha sido guardado de forma segura.',
      });

      // Limpiar formulario
      setFormData({
        current_pin: '',
        nuevo_pin: '',
        confirmar_pin: '',
        ghost_pin_hint: formData.ghost_pin_hint
      });
      setIsEditing(false);

    } catch (error) {
      console.error('Error guardando PIN:', error);
      toast({
        variant: 'destructive',
        title: 'Error al guardar PIN',
        description: 'No se pudo guardar el PIN de seguridad. Inténtalo de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      current_pin: '',
      nuevo_pin: '',
      confirmar_pin: '',
      ghost_pin_hint: profile?.ghost_pin_hint || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 card-hover mt-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-brand-primary" />
          <h2 className="text-xl font-bold font-serif text-brand-primary">
            PIN de Seguridad (Señuelo)
          </h2>
        </div>
        
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-brand-accent hover:bg-brand-secondary text-white text-sm px-4 py-2"
          >
            {hasExistingPin ? 'Cambiar PIN' : 'Configurar PIN'}
          </Button>
        )}
      </div>

      {/* Información sobre el PIN señuelo */}
      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-800">
            <p className="font-medium mb-1">¿Qué es un PIN señuelo?</p>
            <p>Un PIN especial que puedes usar en situaciones de peligro. Al ingresarlo discretamente, se enviará una alerta silenciosa sin que el agresor lo note.</p>
          </div>
        </div>
      </div>

      {/* Estado actual */}
      {!isEditing && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-brand-secondary">Estado del PIN:</span>
            <span className={`font-medium ${hasExistingPin ? 'text-green-600' : 'text-gray-500'}`}>
              {hasExistingPin ? '🔒 Configurado' : '❌ No configurado'}
            </span>
          </div>
          
          {hasExistingPin && profile?.ghost_pin_hint && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Pista configurada:</strong> {profile.ghost_pin_hint}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Formulario de configuración */}
      {isEditing && (
        <div className="space-y-4">
          {/* PIN actual (solo si ya existe) */}
          {hasExistingPin && (
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-2">
                PIN actual *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPin ? "text" : "password"}
                  value={formData.current_pin}
                  onChange={(e) => handleInputChange('current_pin', e.target.value)}
                  placeholder="Ingresa tu PIN actual"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-mono text-center tracking-widest ${
                    errors.current_pin 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-brand-secondary/20 focus:border-brand-accent'
                  }`}
                  maxLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.current_pin && (
                <p className="text-xs text-red-600 mt-1">{errors.current_pin}</p>
              )}
            </div>
          )}

          {/* Nuevo PIN */}
          <div>
            <label className="block text-sm font-medium text-brand-primary mb-2">
              {hasExistingPin ? 'Nuevo PIN' : 'PIN de seguridad'} * (4-6 dígitos)
            </label>
            <div className="relative">
              <input
                type={showNewPin ? "text" : "password"}
                value={formData.nuevo_pin}
                onChange={(e) => handleInputChange('nuevo_pin', e.target.value)}
                placeholder="####"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-mono text-center tracking-widest ${
                  errors.nuevo_pin 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-brand-secondary/20 focus:border-brand-accent'
                }`}
                maxLength="6"
              />
              <button
                type="button"
                onClick={() => setShowNewPin(!showNewPin)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.nuevo_pin && (
              <p className="text-xs text-red-600 mt-1">{errors.nuevo_pin}</p>
            )}
          </div>

          {/* Confirmar PIN */}
          <div>
            <label className="block text-sm font-medium text-brand-primary mb-2">
              Confirmar PIN *
            </label>
            <div className="relative">
              <input
                type={showConfirmPin ? "text" : "password"}
                value={formData.confirmar_pin}
                onChange={(e) => handleInputChange('confirmar_pin', e.target.value)}
                placeholder="####"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none font-mono text-center tracking-widest ${
                  errors.confirmar_pin 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-brand-secondary/20 focus:border-brand-accent'
                }`}
                maxLength="6"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmar_pin && (
              <p className="text-xs text-red-600 mt-1">{errors.confirmar_pin}</p>
            )}
          </div>

          {/* Pista opcional */}
          <div>
            <label className="block text-sm font-medium text-brand-primary mb-2">
              Pista para recordar (opcional)
            </label>
            <input
              type="text"
              value={formData.ghost_pin_hint}
              onChange={(e) => setFormData(prev => ({ ...prev, ghost_pin_hint: e.target.value }))}
              placeholder="Ej: Año de nacimiento de mamá"
              className="w-full px-3 py-2 border border-brand-secondary/20 rounded-lg focus:outline-none focus:border-brand-accent"
              maxLength="100"
            />
            <p className="text-xs text-brand-secondary mt-1">
              Esta pista te ayudará a recordar tu PIN en situaciones de estrés
            </p>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleSavePin}
              disabled={loading}
              className="flex-1 bg-brand-primary hover:bg-brand-secondary text-white"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Guardar PIN
                </>
              )}
            </Button>
            
            <Button
              onClick={handleCancel}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GhostPinSetup;
