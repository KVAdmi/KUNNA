/**
 * SALIDAS PROGRAMADAS - Citas Seguras
 * 
 * INNOVACIÓN CLAVE: "Voy a una cita/reunión y quiero estar segura"
 * Check-ins automáticos con escalamiento si no confirma
 */

import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Calendar, MapPin, User, Clock, Plus, CheckCircle, AlertTriangle, X } from 'lucide-react';
import aleGuardian from '../services/aleGuardian';
import aleObserver from '../services/aleObserver';

export default function SalidasProgramadas() {
  const { user } = useAuth();
  const [salidas, setSalidas] = useState([]);
  const [creando, setCreando] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    fecha_hora: '',
    lugar: '',
    persona_contacto: '',
    telefono_contacto: '',
    notas: ''
  });

  useEffect(() => {
    if (user) {
      cargarSalidas();
      iniciarMonitoreo();
    }
  }, [user]);

  /**
   * Cargar salidas programadas
   */
  const cargarSalidas = async () => {
    try {
      const { data, error } = await supabase
        .from('salidas_programadas')
        .select('*')
        .eq('user_id', user.id)
        .in('estado', ['programada', 'activa'])
        .order('fecha_hora', { ascending: true });

      if (error) throw error;
      setSalidas(data || []);
      setCargando(false);
    } catch (error) {
      console.error('Error cargando salidas:', error);
      setCargando(false);
    }
  };

  /**
   * Crear nueva salida programada
   */
  const crearSalida = async (e) => {
    e.preventDefault();

    if (!formData.titulo || !formData.fecha_hora) {
      alert('Por favor completa título y fecha/hora');
      return;
    }

    try {
      setCreando(true);

      const { data, error } = await supabase
        .from('salidas_programadas')
        .insert({
          user_id: user.id,
          titulo: formData.titulo,
          fecha_hora: formData.fecha_hora,
          lugar: formData.lugar,
          persona_contacto: formData.persona_contacto,
          telefono_contacto: formData.telefono_contacto,
          notas: formData.notas,
          check_ins_requeridos: [30, 60, 120], // 30min, 1h, 2h
          estado: 'programada',
          ale_monitoring: true
        })
        .select()
        .single();

      if (error) throw error;

      // Notificar a AL-E
      aleObserver.trackScheduledExitCreated({
        id: data.id,
        date: formData.fecha_hora,
        location: formData.lugar,
        contact: formData.persona_contacto
      });

      // Reflejar en chat del círculo: salida creada
      await aleGuardian.enviarMensajeSistemaCirculo(
        user.id,
        `📍 Nueva salida programada: "${formData.titulo}" el ${new Date(formData.fecha_hora).toLocaleString('es-MX')} en ${formData.lugar || 'lugar por confirmar'}.`
      );

      // Reset form
      setFormData({
        titulo: '',
        fecha_hora: '',
        lugar: '',
        persona_contacto: '',
        telefono_contacto: '',
        notas: ''
      });

      await cargarSalidas();
      alert('✅ Salida programada exitosamente. AL-E estará monitoreando.');
    } catch (error) {
      console.error('Error creando salida:', error);
      alert('Error al crear salida: ' + error.message);
    } finally {
      setCreando(false);
    }
  };

  /**
   * Confirmar check-in
   */
  const confirmarCheckIn = async (salidaId, minutos) => {
    try {
      // Obtener ubicación actual
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });

      const ubicacion = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      // Registrar check-in
      const { error: checkInError } = await supabase
        .from('check_ins')
        .insert({
          salida_id: salidaId,
          programado_minutos: minutos,
          completado: true,
          ubicacion,
          completed_at: new Date().toISOString()
        });

      if (checkInError) throw checkInError;

      // Actualizar check_ins_completados
      const salida = salidas.find(s => s.id === salidaId);
      const completados = [...(salida.check_ins_completados || []), minutos];

      const { error: updateError } = await supabase
        .from('salidas_programadas')
        .update({ check_ins_completados: completados })
        .eq('id', salidaId);

      if (updateError) throw updateError;

      // Notificar a AL-E
      aleObserver.trackCheckInCompleted(salidaId);

      // Verificar con AL-E Guardian
      await aleGuardian.verificarCheckIn(salidaId, {
        ubicacion,
        timestamp: new Date().toISOString(),
        manual: true
      });

      // Reflejar en chat del círculo: check-in confirmado
      await aleGuardian.enviarMensajeSistemaCirculo(
        user.id,
        `✅ Check-in confirmado para "${salida.titulo}" (${minutos < 60 ? `${minutos}min` : `${minutos/60}h`}). Estoy bien.`
      );

      await cargarSalidas();
      alert('✅ Check-in confirmado. Tu círculo ha sido notificado.');
    } catch (error) {
      console.error('Error confirmando check-in:', error);
      alert('Error al confirmar check-in: ' + error.message);
    }
  };

  /**
   * Marcar salida como completada
   */
  const completarSalida = async (salidaId) => {
    try {
      const { error } = await supabase
        .from('salidas_programadas')
        .update({
          estado: 'completada',
          completed_at: new Date().toISOString()
        })
        .eq('id', salidaId);

      if (error) throw error;

      await cargarSalidas();
      alert('✅ Salida marcada como completada');
    } catch (error) {
      console.error('Error completando salida:', error);
    }
  };

  /**
   * Cancelar salida
   */
  const cancelarSalida = async (salidaId) => {
    if (!confirm('¿Estás segura de cancelar esta salida?')) return;

    try {
      const { error } = await supabase
        .from('salidas_programadas')
        .update({ estado: 'cancelada' })
        .eq('id', salidaId);

      if (error) throw error;
      await cargarSalidas();
    } catch (error) {
      console.error('Error cancelando salida:', error);
    }
  };

  /**
   * Iniciar monitoreo automático (simulado)
   */
  const iniciarMonitoreo = () => {
    // En producción, esto sería manejado por AL-E Guardian
    console.log('🤖 AL-E Guardian monitoreando salidas programadas...');
  };

  /**
   * Obtener badge de estado
   */
  const getBadgeEstado = (salida) => {
    const now = new Date();
    const fechaSalida = new Date(salida.fecha_hora);
    const diffMinutos = (fechaSalida - now) / (1000 * 60);

    if (salida.estado === 'alerta') {
      return <span className="px-2 py-1 bg-red-500 text-white rounded text-xs">🚨 ALERTA</span>;
    }

    if (diffMinutos < 0) {
      return <span className="px-2 py-1 bg-orange-500 text-white rounded text-xs">⏰ En curso</span>;
    }

    if (diffMinutos < 60) {
      return <span className="px-2 py-1 bg-yellow-500 text-white rounded text-xs">🔜 Próxima</span>;
    }

    return <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">📅 Programada</span>;
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Calendar className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Cargando salidas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="w-8 h-8" />
          Salidas Programadas
        </h1>
        <p className="text-gray-600 mt-2">
          Programa tu cita, reunión o salida. AL-E verificará que estés bien con check-ins automáticos.
        </p>
      </div>

      {/* Formulario nueva salida */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nueva Salida Programada
          </CardTitle>
          <CardDescription>
            AL-E te pedirá confirmaciones durante tu salida. Si no respondes, tu círculo será alertado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={crearSalida} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <Input
                placeholder="Ej: Cita médica, Reunión con cliente..."
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha y Hora *</label>
                <Input
                  type="datetime-local"
                  value={formData.fecha_hora}
                  onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lugar</label>
                <Input
                  placeholder="Dirección o nombre del lugar"
                  value={formData.lugar}
                  onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Persona de Contacto</label>
                <Input
                  placeholder="Con quién te vas a reunir"
                  value={formData.persona_contacto}
                  onChange={(e) => setFormData({ ...formData, persona_contacto: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teléfono de Contacto</label>
                <Input
                  type="tel"
                  placeholder="+52 123 456 7890"
                  value={formData.telefono_contacto}
                  onChange={(e) => setFormData({ ...formData, telefono_contacto: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notas</label>
              <textarea
                className="w-full border rounded p-2"
                rows="2"
                placeholder="Detalles adicionales..."
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={creando} className="w-full">
              {creando ? 'Programando...' : '📅 Programar Salida'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de salidas */}
      <Card>
        <CardHeader>
          <CardTitle>Salidas Activas ({salidas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {salidas.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No tienes salidas programadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {salidas.map(salida => (
                <div
                  key={salida.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{salida.titulo}</h3>
                      <div className="text-sm text-gray-600 space-y-1 mt-2">
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(salida.fecha_hora).toLocaleString()}
                        </p>
                        {salida.lugar && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {salida.lugar}
                          </p>
                        )}
                        {salida.persona_contacto && (
                          <p className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {salida.persona_contacto}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      {getBadgeEstado(salida)}
                    </div>
                  </div>

                  {/* Check-ins */}
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-2">Check-ins programados:</p>
                    <div className="flex gap-2">
                      {salida.check_ins_requeridos.map(minutos => {
                        const completado = salida.check_ins_completados?.includes(minutos);
                        return (
                          <Button
                            key={minutos}
                            size="sm"
                            variant={completado ? "default" : "outline"}
                            onClick={() => !completado && confirmarCheckIn(salida.id, minutos)}
                            disabled={completado}
                          >
                            {completado ? <CheckCircle className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}
                            {minutos < 60 ? `${minutos}min` : `${minutos/60}h`}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => completarSalida(salida.id)}
                    >
                      ✅ Completar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelarSalida(salida.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
