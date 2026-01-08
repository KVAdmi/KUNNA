// src/pages/ALEDashboard.jsx
// Dashboard para ver la actividad de AL-E

import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Brain, 
  Activity, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  Video
} from 'lucide-react';

export default function ALEDashboard() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [patrones, setPatrones] = useState(null);
  const [stats, setStats] = useState({
    total_eventos: 0,
    eventos_hoy: 0,
    anomalias_detectadas: 0,
    protecciones_activadas: 0
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user]);

  const cargarDatos = async () => {
    try {
      await Promise.all([
        cargarEventos(),
        cargarPatrones(),
        cargarEstadisticas()
      ]);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setCargando(false);
    }
  };

  /**
   * Cargar últimos 50 eventos
   */
  const cargarEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('ale_events')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEventos(data || []);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
  };

  /**
   * Cargar patrones del usuario
   */
  const cargarPatrones = async () => {
    try {
      const { data, error } = await supabase
        .from('ale_user_patterns')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setPatrones(data);
    } catch (error) {
      console.error('Error cargando patrones:', error);
    }
  };

  /**
   * Calcular estadísticas
   */
  const cargarEstadisticas = async () => {
    try {
      // Total de eventos
      const { count: total } = await supabase
        .from('ale_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Eventos hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const { count: hoyCount } = await supabase
        .from('ale_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('timestamp', hoy.toISOString());

      // Anomalías (eventos de alta prioridad)
      const { count: anomalias } = await supabase
        .from('ale_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('priority', ['high', 'critical']);

      // Protecciones (moderaciones + escalamientos)
      const { count: protecciones } = await supabase
        .from('ale_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('event_type', ['content_moderated', 'escalation_triggered', 'sos_activated']);

      setStats({
        total_eventos: total || 0,
        eventos_hoy: hoyCount || 0,
        anomalias_detectadas: anomalias || 0,
        protecciones_activadas: protecciones || 0
      });
    } catch (error) {
      console.error('Error calculando estadísticas:', error);
    }
  };

  /**
   * Obtener icono por tipo de evento
   */
  const getEventIcon = (eventType) => {
    const icons = {
      app_opened: Activity,
      sos_activated: Shield,
      check_in_completed: CheckCircle,
      check_in_missed: AlertTriangle,
      location_tracked: MapPin,
      chat_activity: MessageSquare,
      video_recorded: Video,
      content_moderated: Shield,
      escalation_triggered: AlertTriangle,
      default: Clock
    };

    return icons[eventType] || icons.default;
  };

  /**
   * Obtener color por prioridad
   */
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-500',
      medium: 'bg-blue-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500'
    };

    return colors[priority] || colors.low;
  };

  /**
   * Formatear nombre de evento
   */
  const formatEventName = (eventType) => {
    const names = {
      app_opened: 'App abierta',
      sos_activated: 'SOS activado',
      check_in_completed: 'Check-in completado',
      check_in_missed: 'Check-in perdido',
      location_tracked: 'Ubicación registrada',
      chat_activity: 'Actividad en chat',
      video_recorded: 'Video grabado',
      content_moderated: 'Contenido moderado',
      escalation_triggered: 'Escalamiento activado',
      circle_interaction: 'Interacción con círculo',
      scheduled_exit_created: 'Salida programada',
      holistic_reading: 'Lectura holística'
    };

    return names[eventType] || eventType;
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="w-12 h-12 animate-pulse mx-auto mb-4 text-brand-secondary" />
          <p>Analizando actividad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-brand-primary">
          <Brain className="w-8 h-8 text-brand-secondary" />
          AL-E Dashboard
        </h1>
        <p className="text-brand-secondary mt-2">
          Tu asistente inteligente trabajando en segundo plano para mantenerte segura
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Eventos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-primary">
              {stats.total_eventos}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Actividades registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-dark-blue">
              {stats.eventos_hoy}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Eventos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Anomalías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {stats.anomalias_detectadas}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Comportamientos inusuales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Protecciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.protecciones_activadas}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Veces que te protegió
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patrones aprendidos */}
      {patrones && patrones.baseline_established && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Patrones Aprendidos
            </CardTitle>
            <CardDescription>
              AL-E ha aprendido tus rutinas normales para detectar anomalías
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patrones.typical_activity_hours && patrones.typical_activity_hours.length > 0 && (
                <div>
                  <p className="font-semibold text-sm mb-2">⏰ Horarios típicos de actividad</p>
                  <div className="flex flex-wrap gap-1">
                    {patrones.typical_activity_hours.map(hour => (
                      <Badge key={hour} variant="outline">
                        {hour}:00h
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {patrones.typical_inactivity_hours && (
                <div>
                  <p className="font-semibold text-sm mb-2">💤 Horas típicas de descanso</p>
                  <Badge variant="outline">
                    ~{patrones.typical_inactivity_hours} horas
                  </Badge>
                </div>
              )}
            </div>

            {patrones.frequent_locations && patrones.frequent_locations.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-sm mb-2">📍 Ubicaciones frecuentes</p>
                <p className="text-sm text-gray-600">
                  {patrones.frequent_locations.length} lugares conocidos
                </p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500">
                Última actualización: {new Date(patrones.last_analysis).toLocaleString('es-MX')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eventos recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Últimos 50 eventos registrados por AL-E
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventos.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Aún no hay eventos registrados</p>
              <p className="text-sm">AL-E comenzará a aprender tus patrones pronto</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {eventos.map(evento => {
                const Icon = getEventIcon(evento.event_type);
                
                return (
                  <div
                    key={evento.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className={`p-2 rounded-full ${getPriorityColor(evento.priority)} bg-opacity-10`}>
                      <Icon className={`w-4 h-4 ${getPriorityColor(evento.priority).replace('bg-', 'text-')}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">
                          {formatEventName(evento.event_type)}
                        </p>
                        {evento.priority && evento.priority !== 'low' && (
                          <Badge className={`${getPriorityColor(evento.priority)} text-white text-xs`}>
                            {evento.priority}
                          </Badge>
                        )}
                      </div>
                      
                      {evento.event_data && Object.keys(evento.event_data).length > 0 && (
                        <p className="text-xs text-gray-600 truncate">
                          {JSON.stringify(evento.event_data).substring(0, 100)}...
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(evento.timestamp).toLocaleString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {evento.processed && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info adicional */}
      <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-start gap-3">
          <Brain className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-purple-900 mb-1">
              ¿Cómo funciona AL-E?
            </p>
            <p className="text-sm text-purple-800">
              AL-E observa tu actividad normal (cuándo usas la app, tus rutinas, ubicaciones frecuentes) 
              para aprender tus patrones. Cuando detecta algo inusual, puede alertar a tu círculo o 
              activar protecciones automáticamente. Todo esto sucede en segundo plano, sin interrumpirte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
