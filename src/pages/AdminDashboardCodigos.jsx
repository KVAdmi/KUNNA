import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Key, 
  Plus, 
  Calendar, 
  Users, 
  BarChart3, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Trash2,
  Shield,
  Gift
} from 'lucide-react';

const AdminDashboardCodigos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [codigos, setCodigos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    tipo: 'temporal',
    descripcion: '',
    duracionHoras: 24,
    usosMaximos: 1,
    motivo: ''
  });

  // Verificar si es admin
  useEffect(() => {
    const verificarAdmin = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', user.email)
          .eq('activo', true)
          .single();

        if (data && !error) {
          setIsAdmin(true);
          await cargarDatos();
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error verificando admin:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    verificarAdmin();
  }, [user]);

  // Cargar códigos y estadísticas
  const cargarDatos = async () => {
    try {
      // Cargar códigos
      const { data: codigosData, error: codigosError } = await supabase
        .from('codigos_donativos')
        .select(`
          *,
          codigos_donativos_uso(count)
        `)
        .order('created_at', { ascending: false });

      if (codigosError) throw codigosError;
      setCodigos(codigosData || []);

      // Cargar estadísticas
      const ahora = new Date();
      const stats = {
        total: codigosData?.length || 0,
        activos: codigosData?.filter(c => c.activo && new Date(c.fecha_expiracion) > ahora).length || 0,
        expirados: codigosData?.filter(c => new Date(c.fecha_expiracion) <= ahora).length || 0,
        usados: codigosData?.filter(c => c.usos_actuales > 0).length || 0
      };

      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los datos'
      });
    }
  };

  // Generar nuevo código
  const generarCodigo = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('generar_codigo_donativo', {
        p_tipo: formulario.tipo,
        p_descripcion: formulario.descripcion,
        p_duracion_horas: formulario.duracionHoras,
        p_usos_maximos: formulario.usosMaximos,
        p_motivo: formulario.motivo,
        p_usuario_creador: user.id
      });

      if (error) throw error;

      toast({
        title: '¡Código generado! 🎉',
        description: `Código: ${data.codigo}`,
        className: 'bg-green-100 border-green-400 text-green-800'
      });

      setMostrarFormulario(false);
      setFormulario({
        tipo: 'temporal',
        descripcion: '',
        duracionHoras: 24,
        usosMaximos: 1,
        motivo: ''
      });

      await cargarDatos();
    } catch (error) {
      console.error('Error generando código:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo generar el código'
      });
    } finally {
      setLoading(false);
    }
  };

  // Desactivar código
  const desactivarCodigo = async (id) => {
    try {
      const { error } = await supabase
        .from('codigos_donativos')
        .update({ activo: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Código desactivado',
        description: 'El código ha sido desactivado correctamente'
      });

      await cargarDatos();
    } catch (error) {
      console.error('Error desactivando código:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo desactivar el código'
      });
    }
  };

  // Filtrar códigos
  const codigosFiltrados = codigos.filter(codigo => {
    if (filtroTipo === 'todos') return true;
    if (filtroTipo === 'activos') return codigo.activo && new Date(codigo.fecha_expiracion) > new Date();
    if (filtroTipo === 'expirados') return new Date(codigo.fecha_expiracion) <= new Date();
    return codigo.tipo === filtroTipo;
  });

  // UI de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // UI de acceso denegado
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-brand-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <Shield className="w-16 h-16 mx-auto mb-6 text-red-500" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Acceso Denegado
            </h1>
            <p className="text-gray-600 mb-6">
              No tienes permisos de administrador para acceder a esta sección.
            </p>
            <Button onClick={() => window.history.back()}>
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-primary flex items-center gap-3">
                <Key className="w-8 h-8" />
                Dashboard de Códigos Donativos
              </h1>
              <p className="text-brand-secondary mt-2">
                Gestiona códigos de acceso gratuito para la plataforma
              </p>
            </div>
            <Button
              onClick={() => setMostrarFormulario(true)}
              className="bg-brand-accent hover:bg-brand-secondary text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generar Código
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-secondary text-sm">Total Códigos</p>
                <p className="text-2xl font-bold text-brand-primary">{estadisticas.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-brand-accent" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-secondary text-sm">Activos</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.activos}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-secondary text-sm">Expirados</p>
                <p className="text-2xl font-bold text-red-600">{estadisticas.expirados}</p>
              </div>
              <Clock className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-secondary text-sm">Usados</p>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.usados}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'todos', label: 'Todos' },
              { key: 'activos', label: 'Activos' },
              { key: 'expirados', label: 'Expirados' },
              { key: 'emergencia', label: 'Emergencia' },
              { key: 'campana', label: 'Campaña' },
              { key: 'temporal', label: 'Temporal' },
              { key: 'vip', label: 'VIP' }
            ].map(filtro => (
              <Button
                key={filtro.key}
                variant={filtroTipo === filtro.key ? 'default' : 'outline'}
                onClick={() => setFiltroTipo(filtro.key)}
                className="text-sm"
              >
                {filtro.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Lista de códigos */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-brand-primary mb-6">
            Códigos Generados ({codigosFiltrados.length})
          </h2>

          <div className="space-y-4">
            {codigosFiltrados.map(codigo => {
              const esActivo = codigo.activo && new Date(codigo.fecha_expiracion) > new Date();
              const estaExpirado = new Date(codigo.fecha_expiracion) <= new Date();

              return (
                <motion.div
                  key={codigo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-2 ${
                    esActivo 
                      ? 'border-green-200 bg-green-50' 
                      : estaExpirado 
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="bg-white px-3 py-1 rounded-lg font-mono text-lg font-bold">
                          {codigo.codigo}
                        </code>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          codigo.tipo === 'emergencia' ? 'bg-red-100 text-red-700' :
                          codigo.tipo === 'campana' ? 'bg-blue-100 text-blue-700' :
                          codigo.tipo === 'temporal' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {codigo.tipo.toUpperCase()}
                        </span>
                        {esActivo && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {estaExpirado && <XCircle className="w-5 h-5 text-red-500" />}
                      </div>
                      
                      <p className="text-brand-secondary mb-2">{codigo.descripcion}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-brand-secondary">
                        <span>📅 Expira: {new Date(codigo.fecha_expiracion).toLocaleString('es-MX')}</span>
                        <span>🔢 Usos: {codigo.usos_actuales}/{codigo.usos_maximos}</span>
                        <span>📝 Creado: {new Date(codigo.created_at).toLocaleDateString('es-MX')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {esActivo && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => desactivarCodigo(codigo.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Modal de generar código */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-brand-primary mb-6">
                Generar Nuevo Código
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-primary mb-2">
                    Tipo de Código
                  </label>
                  <select
                    value={formulario.tipo}
                    onChange={(e) => setFormulario(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full px-3 py-2 border border-brand-secondary/20 rounded-lg focus:outline-none focus:border-brand-accent"
                  >
                    <option value="temporal">Temporal (24h)</option>
                    <option value="emergencia">Emergencia (48h)</option>
                    <option value="campana">Campaña (7-30 días)</option>
                    <option value="vip">VIP (90 días)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-primary mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={formulario.descripcion}
                    onChange={(e) => setFormulario(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="w-full px-3 py-2 border border-brand-secondary/20 rounded-lg focus:outline-none focus:border-brand-accent"
                    placeholder="Describe el propósito del código"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-primary mb-2">
                    Duración (horas)
                  </label>
                  <input
                    type="number"
                    value={formulario.duracionHoras}
                    onChange={(e) => setFormulario(prev => ({ ...prev, duracionHoras: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-brand-secondary/20 rounded-lg focus:outline-none focus:border-brand-accent"
                    min="1"
                    max="2160"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-primary mb-2">
                    Usos Máximos
                  </label>
                  <input
                    type="number"
                    value={formulario.usosMaximos}
                    onChange={(e) => setFormulario(prev => ({ ...prev, usosMaximos: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-brand-secondary/20 rounded-lg focus:outline-none focus:border-brand-accent"
                    min="1"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-primary mb-2">
                    Motivo/Justificación *
                  </label>
                  <textarea
                    value={formulario.motivo}
                    onChange={(e) => setFormulario(prev => ({ ...prev, motivo: e.target.value }))}
                    className="w-full px-3 py-2 border border-brand-secondary/20 rounded-lg focus:outline-none focus:border-brand-accent"
                    rows="3"
                    placeholder="Justifica por qué necesitas este código..."
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setMostrarFormulario(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={generarCodigo}
                  disabled={!formulario.motivo || loading}
                  className="flex-1 bg-brand-accent hover:bg-brand-secondary text-white"
                >
                  {loading ? 'Generando...' : 'Generar'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardCodigos;
