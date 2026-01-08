/**
 * MIS SECRETOS - ESPACIO SEGURO
 * 
 * Aquí puedes contar todo a KUNNA.
 * Tú decides si en caso de que no respondas que estás bien, notificaremos.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Lock, Plus, Eye, EyeOff, Trash2, Copy, Check, 
  Bell, BellOff, UserPlus, Shield
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient';

const CATEGORIAS = [
  { id: 'cita', label: '💬 Cita/Encuentro', emoji: '💬', gradient: 'from-pink-400 to-rose-400' },
  { id: 'contacto', label: '👤 Contacto', emoji: '👤', gradient: 'from-purple-400 to-pink-400' },
  { id: 'lugar', label: '📍 Lugar', emoji: '📍', gradient: 'from-blue-400 to-cyan-400' },
  { id: 'evidencia', label: '📸 Evidencia', emoji: '📸', gradient: 'from-orange-400 to-red-400' },
  { id: 'otro', label: '🔒 Otro', emoji: '🔒', gradient: 'from-gray-400 to-gray-500' }
];

export default function MisSecretos() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Estados principales
  const [secretos, setSecretos] = useState([]);
  const [contactosEmergencia, setContactosEmergencia] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('cita');
  const [loading, setLoading] = useState(true);
  
  // Configuración de notificaciones
  const [notificacionesActivas, setNotificacionesActivas] = useState(false);
  const [contactosSeleccionados, setContactosSeleccionados] = useState([]);
  
  // Modal de nuevo secreto
  const [modalAbierto, setModalAbierto] = useState(false);
  const [secretoActual, setSecretoActual] = useState({
    categoria: 'cita',
    titulo: '',
    contenido: ''
  });

  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar secretos
      const { data: secretosData, error: secretosError } = await supabase
        .from('secretos_seguros')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (secretosError) throw secretosError;
      setSecretos(secretosData || []);

      // Cargar contactos de emergencia
      const { data: contactosData, error: contactosError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id);

      if (contactosError) throw contactosError;
      setContactosEmergencia(contactosData || []);

      // Cargar configuración de notificaciones
      const { data: configData, error: configError } = await supabase
        .from('user_settings')
        .select('auto_notify, selected_contacts')
        .eq('user_id', user.id)
        .single();

      if (!configError && configData) {
        setNotificacionesActivas(configData.auto_notify || false);
        setContactosSeleccionados(configData.selected_contacts || []);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudieron cargar tus secretos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const guardarSecreto = async () => {
    if (!secretoActual.titulo || !secretoActual.contenido) {
      toast({
        title: '⚠️ Completa los campos',
        description: 'Escribe un título y contenido',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('secretos_seguros')
        .insert([
          {
            user_id: user.id,
            categoria: secretoActual.categoria,
            titulo: secretoActual.titulo,
            contenido: secretoActual.contenido,
            encriptado: true
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setSecretos([data, ...secretos]);
      setModalAbierto(false);
      setSecretoActual({ categoria: 'cita', titulo: '', contenido: '' });

      toast({
        title: '✅ Secreto guardado',
        description: 'Tu información está segura',
        variant: 'default'
      });

    } catch (error) {
      console.error('Error al guardar secreto:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo guardar el secreto',
        variant: 'destructive'
      });
    }
  };

  const eliminarSecreto = async (id) => {
    try {
      const { error } = await supabase
        .from('secretos_seguros')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSecretos(secretos.filter(s => s.id !== id));
      
      toast({
        title: '🗑️ Secreto eliminado',
        description: 'La información fue borrada de forma segura',
        variant: 'default'
      });

    } catch (error) {
      console.error('Error al eliminar:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo eliminar',
        variant: 'destructive'
      });
    }
  };

  const toggleNotificaciones = async (activar) => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          auto_notify: activar,
          selected_contacts: contactosSeleccionados
        });

      if (error) throw error;

      setNotificacionesActivas(activar);
      
      toast({
        title: activar ? '✅ Notificaciones activadas' : '❌ Notificaciones desactivadas',
        description: activar 
          ? 'KUNNA notificará si no respondes' 
          : 'No se enviará ninguna alerta automática',
        variant: 'default'
      });

    } catch (error) {
      console.error('Error al actualizar configuración:', error);
    }
  };

  const toggleContacto = async (contactoId) => {
    const nuevosContactos = contactosSeleccionados.includes(contactoId)
      ? contactosSeleccionados.filter(id => id !== contactoId)
      : [...contactosSeleccionados, contactoId];

    setContactosSeleccionados(nuevosContactos);

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          auto_notify: notificacionesActivas,
          selected_contacts: nuevosContactos
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error al actualizar contactos:', error);
    }
  };

  const secretosFiltrados = secretos.filter(s => s.categoria === categoriaActiva);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando espacio seguro...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Mis Secretos - KUNNA</title>
        <meta name="description" content="Espacio privado y seguro para información sensible" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header con explicación */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8 mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 shadow-xl">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Mis Secretos
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  Aquí puedes contar <span className="font-bold text-purple-600">TODO</span> a KUNNA. 
                  Ella monitoreará tu seguridad y <span className="font-bold">tú decides</span> si en caso de que no respondas que estás bien, 
                  notificaremos a tus contactos de emergencia.
                </p>

                {/* Toggle de notificaciones */}
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {notificacionesActivas ? (
                        <Bell className="w-6 h-6 text-purple-600" />
                      ) : (
                        <BellOff className="w-6 h-6 text-gray-400" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">
                          Notificación Automática
                        </p>
                        <p className="text-sm text-gray-600">
                          {notificacionesActivas 
                            ? '✅ KUNNA notificará si no respondes' 
                            : '❌ Notificaciones desactivadas'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleNotificaciones(!notificacionesActivas)}
                      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                        notificacionesActivas ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          notificacionesActivas ? 'translate-x-9' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Selector de contactos */}
                  {notificacionesActivas && contactosEmergencia.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        ¿A quién notificar?
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {contactosEmergencia.map(contacto => (
                          <button
                            key={contacto.id}
                            onClick={() => toggleContacto(contacto.id)}
                            className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                              contactosSeleccionados.includes(contacto.id)
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-purple-50'
                            }`}
                          >
                            <UserPlus className="w-4 h-4" />
                            <span className="font-medium">{contacto.nombre}</span>
                            {contactosSeleccionados.includes(contacto.id) && (
                              <Check className="w-4 h-4 ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {notificacionesActivas && contactosEmergencia.length === 0 && (
                    <p className="text-sm text-orange-600">
                      ⚠️ No tienes contactos de emergencia. Agrégalos en tu perfil.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Botones de categoría - REDISEÑADOS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
          >
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaActiva(cat.id)}
                className={`relative rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 ${
                  categoriaActiva === cat.id
                    ? 'shadow-2xl ring-4 ring-purple-300'
                    : 'shadow-lg hover:shadow-xl'
                }`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.gradient} opacity-90`}></div>
                <div className="relative z-10 text-center">
                  <div className="text-4xl mb-2">{cat.emoji}</div>
                  <p className="text-white font-semibold text-sm">
                    {cat.label}
                  </p>
                  {secretos.filter(s => s.categoria === cat.id).length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-white text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                      {secretos.filter(s => s.categoria === cat.id).length}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </motion.div>

          {/* Botón agregar nuevo */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setModalAbierto(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl py-4 px-6 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] mb-6"
          >
            <Plus className="w-6 h-6" />
            <span className="font-bold text-lg">Agregar Secreto</span>
          </motion.button>

          {/* Lista de secretos */}
          <AnimatePresence mode="wait">
            {secretosFiltrados.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl shadow-lg p-12 text-center"
              >
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No hay secretos en esta categoría
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {secretosFiltrados.map((secreto, index) => (
                  <SecretoCard
                    key={secreto.id}
                    secreto={secreto}
                    index={index}
                    onEliminar={eliminarSecreto}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Modal crear/editar secreto */}
      <AnimatePresence>
        {modalAbierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModalAbierto(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Nuevo Secreto
              </h2>

              {/* Selector de categoría */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Categoría
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIAS.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSecretoActual({ ...secretoActual, categoria: cat.id })}
                      className={`rounded-xl p-4 transition-all ${
                        secretoActual.categoria === cat.id
                          ? 'ring-4 ring-purple-300 shadow-lg'
                          : 'ring-2 ring-gray-200 hover:ring-purple-200'
                      }`}
                    >
                      <div className={`bg-gradient-to-br ${cat.gradient} rounded-lg p-3 text-3xl text-center mb-2`}>
                        {cat.emoji}
                      </div>
                      <p className="text-xs font-medium text-gray-700 text-center">
                        {cat.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Título */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={secretoActual.titulo}
                  onChange={(e) => setSecretoActual({ ...secretoActual, titulo: e.target.value })}
                  placeholder="Ej: Cita con Juan - 15/Dic"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                />
              </div>

              {/* Contenido */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Información
                </label>
                <textarea
                  value={secretoActual.contenido}
                  onChange={(e) => setSecretoActual({ ...secretoActual, contenido: e.target.value })}
                  placeholder="Escribe aquí toda la información: nombre, lugar, hora, teléfono, perfil, etc."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all resize-none"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setModalAbierto(false)}
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarSecreto}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  Guardar Secreto
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Componente para cada tarjeta de secreto
function SecretoCard({ secreto, index, onEliminar }) {
  const [visible, setVisible] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const copiarContenido = () => {
    navigator.clipboard.writeText(secreto.contenido);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const categoria = CATEGORIAS.find(c => c.id === secreto.categoria) || CATEGORIAS[4];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`bg-gradient-to-br ${categoria.gradient} rounded-xl p-3 text-2xl`}>
            {categoria.emoji}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {secreto.titulo}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(secreto.created_at).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setVisible(!visible)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all"
          >
            {visible ? (
              <EyeOff className="w-5 h-5 text-gray-600" />
            ) : (
              <Eye className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={copiarContenido}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all"
          >
            {copiado ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => onEliminar(secreto.id)}
            className="p-2 rounded-lg hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>

      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4"
        >
          <p className="text-gray-700 whitespace-pre-wrap">
            {secreto.contenido}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
