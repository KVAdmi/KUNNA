/**
 * CÍRCULOS DE CONFIANZA
 * 
 * Red privada de apoyo - innovación clave de KUNNA
 * Permite ver estados de miembros y recibir alertas escalonadas
 */

import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Users, UserPlus, Shield, AlertCircle, CheckCircle, Clock, X, MessageSquare } from 'lucide-react';
import aleObserver from '../services/aleObserver';
import CirculoChat from '../components/circulo/CirculoChat';

export default function CirculoConfianza() {
  const { user } = useAuth();
  const [circulo, setCirculo] = useState(null);
  const [miembros, setMiembros] = useState([]);
  const [invitando, setInvitando] = useState(false);
  const [emailInvitar, setEmailInvitar] = useState('');
  const [cargando, setCargando] = useState(true);
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    if (user) {
      cargarCirculo();
      cargarNotificaciones();
      suscribirEstados();
    }
  }, [user]);

  /**
   * Cargar círculo y estados de miembros
   */
  const cargarCirculo = async () => {
    try {
      // Obtener o crear círculo
      let { data: circuloData, error } = await supabase
        .from('circulos_confianza')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No existe, crear uno
        const { data: nuevoCirculo, error: createError } = await supabase
          .from('circulos_confianza')
          .insert({
            user_id: user.id,
            nombre: 'Mi Círculo de Confianza',
            miembros: []
          })
          .select()
          .single();

        if (createError) throw createError;
        circuloData = nuevoCirculo;
      } else if (error) {
        throw error;
      }

      setCirculo(circuloData);

      // Cargar datos de miembros si existen
      if (circuloData.miembros && circuloData.miembros.length > 0) {
        await cargarMiembros(circuloData.miembros);
      }

      setCargando(false);
    } catch (error) {
      console.error('Error cargando círculo:', error);
      setCargando(false);
    }
  };

  /**
   * Cargar información de miembros
   */
  const cargarMiembros = async (miembroIds) => {
    try {
      const { data: perfiles, error: perfilError } = await supabase
        .from('profiles')
        .select('user_id, nombre_completo, telefono')
        .in('user_id', miembroIds);

      if (perfilError) throw perfilError;

      // Cargar estados de cada miembro
      const { data: estados, error: estadosError } = await supabase
        .from('estados_usuario')
        .select('*')
        .in('user_id', miembroIds);

      if (estadosError) throw estadosError;

      // Combinar datos
      const miembrosConEstado = perfiles.map(perfil => {
        const estado = estados?.find(e => e.user_id === perfil.user_id);
        return {
          ...perfil,
          estado: estado?.estado || 'activa',
          ultima_actividad: estado?.ultima_actividad,
          tracking_activo: estado?.tracking_activo || false
        };
      });

      setMiembros(miembrosConEstado);
    } catch (error) {
      console.error('Error cargando miembros:', error);
    }
  };

  /**
   * Suscribirse a cambios de estado en tiempo real
   */
  const suscribirEstados = () => {
    const subscription = supabase
      .channel('estados_circulo')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'estados_usuario'
        },
        (payload) => {
          console.log('🔄 Cambio de estado detectado:', payload);
          if (circulo?.miembros?.includes(payload.new.user_id)) {
            cargarCirculo();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  /**
   * Cargar notificaciones del círculo
   */
  const cargarNotificaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('notificaciones_circulo')
        .select('*')
        .eq('destinatario_id', user.id)
        .eq('leida', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotificaciones(data || []);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  /**
   * Invitar miembro al círculo
   */
  const invitarMiembro = async () => {
    if (!emailInvitar.trim()) return;

    try {
      setInvitando(true);

      // Buscar usuario por email
      const { data: perfil, error: searchError } = await supabase
        .from('profiles')
        .select('user_id, nombre_completo')
        .eq('email', emailInvitar.toLowerCase().trim())
        .single();

      if (searchError || !perfil) {
        alert('No se encontró un usuario con ese email');
        setInvitando(false);
        return;
      }

      // Verificar que no esté ya en el círculo
      if (circulo.miembros.includes(perfil.user_id)) {
        alert('Esta persona ya está en tu círculo');
        setInvitando(false);
        return;
      }

      // Agregar al círculo
      const nuevosMiembros = [...circulo.miembros, perfil.user_id];

      const { error: updateError } = await supabase
        .from('circulos_confianza')
        .update({ miembros: nuevosMiembros })
        .eq('id', circulo.id);

      if (updateError) throw updateError;

      // Notificar a AL-E
      aleObserver.trackCircleInteraction(circulo.id, 'member_added');

      // Recargar
      await cargarCirculo();
      setEmailInvitar('');
      alert(`✅ ${perfil.nombre_completo} ha sido añadida a tu círculo`);
    } catch (error) {
      console.error('Error invitando miembro:', error);
      alert('Error al invitar: ' + error.message);
    } finally {
      setInvitando(false);
    }
  };

  /**
   * Eliminar miembro del círculo
   */
  const eliminarMiembro = async (miembroId) => {
    if (!confirm('¿Estás segura de eliminar a esta persona de tu círculo?')) return;

    try {
      const nuevosMiembros = circulo.miembros.filter(id => id !== miembroId);

      const { error } = await supabase
        .from('circulos_confianza')
        .update({ miembros: nuevosMiembros })
        .eq('id', circulo.id);

      if (error) throw error;

      await cargarCirculo();
    } catch (error) {
      console.error('Error eliminando miembro:', error);
      alert('Error al eliminar miembro');
    }
  };

  /**
   * Marcar notificación como leída
   */
  const marcarLeida = async (notifId) => {
    try {
      await supabase
        .from('notificaciones_circulo')
        .update({ leida: true, leida_at: new Date().toISOString() })
        .eq('id', notifId);

      cargarNotificaciones();
    } catch (error) {
      console.error('Error marcando notificación:', error);
    }
  };

  /**
   * Obtener badge según estado
   */
  const getBadgeEstado = (estado) => {
    const estados = {
      activa: { color: 'bg-green-500', icon: CheckCircle, text: 'Activa' },
      en_silencio: { color: 'bg-yellow-500', icon: Clock, text: 'En Silencio' },
      en_riesgo: { color: 'bg-orange-500', icon: AlertCircle, text: 'En Riesgo' },
      emergencia: { color: 'bg-red-500', icon: Shield, text: 'EMERGENCIA' }
    };

    const info = estados[estado] || estados.activa;
    const Icon = info.icon;

    return (
      <Badge className={`${info.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {info.text}
      </Badge>
    );
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p>Cargando círculo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8" />
          Mi Círculo de Confianza
        </h1>
        <p className="text-gray-600 mt-2">
          Tu red privada de apoyo. Ellas verán tu estado y recibirán alertas si algo sucede.
        </p>
      </div>

      {/* Notificaciones activas */}
      {notificaciones.length > 0 && (
        <Card className="mb-6 border-orange-500 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-700">Alertas del Círculo</CardTitle>
          </CardHeader>
          <CardContent>
            {notificaciones.map(notif => (
              <div key={notif.id} className="mb-3 p-3 bg-white rounded-lg flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{notif.titulo}</p>
                  <p className="text-sm text-gray-600">{notif.mensaje}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => marcarLeida(notif.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Invitar miembro */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invitar a tu Círculo
          </CardTitle>
          <CardDescription>
            Invita a personas de confianza que puedan ayudarte en caso de emergencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@ejemplo.com"
              value={emailInvitar}
              onChange={(e) => setEmailInvitar(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && invitarMiembro()}
            />
            <Button onClick={invitarMiembro} disabled={invitando}>
              {invitando ? 'Invitando...' : 'Invitar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Miembros del círculo */}
      <Card>
        <CardHeader>
          <CardTitle>Miembros ({miembros.length})</CardTitle>
          <CardDescription>
            {miembros.length === 0 
              ? 'Aún no has invitado a nadie a tu círculo'
              : 'Estados actuales de tus contactos de confianza'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {miembros.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Tu círculo está vacío</p>
              <p className="text-sm">Invita a personas de confianza para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {miembros.map(miembro => (
                <div
                  key={miembro.user_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {miembro.nombre_completo?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold">{miembro.nombre_completo || 'Usuario'}</p>
                        <p className="text-sm text-gray-500">{miembro.telefono || 'Sin teléfono'}</p>
                        {miembro.ultima_actividad && (
                          <p className="text-xs text-gray-400">
                            Última actividad: {new Date(miembro.ultima_actividad).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getBadgeEstado(miembro.estado)}
                    {miembro.tracking_activo && (
                      <Badge variant="outline" className="text-blue-600">
                        📍 Tracking
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarMiembro(miembro.user_id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat del Círculo */}
      {circulo && miembros.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chat del Círculo
            </CardTitle>
            <CardDescription>
              Conversación privada con moderación automática de AL-E
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              <CirculoChat circuloId={circulo.id} userId={user.id} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
