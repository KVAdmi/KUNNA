import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { FolderHeart as HomeIcon, Phone, Globe, MapPin, Plus, Edit, Loader2, Search, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient';

const SupportDirectoryPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAssociation, setEditingAssociation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [filters, setFilters] = useState({ state: '', city: '' });
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    telefono: '',
    url_web: '',
    ubicacion: '',
    estado: '',
    ciudad: '',
  });

  useEffect(() => {
    if (user) {
      setIsAdmin(user.email === 'asistia24@gmail.com');
    }
  }, [user]);

  const fetchAssociations = async () => {
    setLoading(true);
    let query = supabase.from('asociaciones_apoyo').select('*');
    
    if (!isAdmin) {
      query = query.eq('visible', true);
    }
    
    const { data, error } = await query.order('nombre', { ascending: true });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las asociaciones.' });
    } else {
      setAssociations(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssociations();
  }, [isAdmin, toast]);

  const handleOpenModal = (association = null) => {
    setEditingAssociation(association);
    if (association) {
      setFormData({
        nombre: association.nombre || '',
        descripcion: association.descripcion || '',
        telefono: association.telefono || '',
        url_web: association.url_web || '',
        ubicacion: association.ubicacion || '',
        estado: association.estado || '',
        ciudad: association.ciudad || '',
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        telefono: '',
        url_web: '',
        ubicacion: '',
        estado: '',
        ciudad: '',
      });
    }
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingAssociation(null);
    setFormData({
      nombre: '',
      descripcion: '',
      telefono: '',
      url_web: '',
      ubicacion: '',
      estado: '',
      ciudad: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        ubicacion: `${formData.ciudad}, ${formData.estado}`,
        visible: isAdmin ? true : false, // Los admins pueden hacer visible inmediatamente
      };

      let result;
      if (editingAssociation) {
        result = await supabase
          .from('asociaciones_apoyo')
          .update(dataToSubmit)
          .eq('id', editingAssociation.id);
      } else {
        result = await supabase
          .from('asociaciones_apoyo')
          .insert([dataToSubmit]);
      }

      if (result.error) {
        throw result.error;
      }

      if (isAdmin) {
        toast({
          title: "✅ Asociación guardada",
          description: editingAssociation ? "La asociación ha sido actualizada." : "La asociación ha sido agregada al directorio.",
        });
      } else {
        toast({
          title: "🙏 Gracias por inscribir a tu asociación",
          description: "Nuestro equipo de alianzas revisará tu solicitud y te confirmará en tu aplicación si tu inscripción fue aceptada.",
          duration: 6000,
        });
      }

      await fetchAssociations();
      handleCloseForm();
    } catch (error) {
      console.error('Error al guardar:', error);
      toast({
        variant: 'destructive',
        title: "Error",
        description: "No se pudo guardar la asociación. Intenta de nuevo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const { states, cities } = useMemo(() => {
    const uniqueStates = [...new Set(associations.map(a => a.ubicacion?.split(',')[1]?.trim()).filter(Boolean))].sort();
    const filteredCities = filters.state 
      ? [...new Set(associations.filter(a => a.ubicacion?.includes(filters.state)).map(a => a.ubicacion?.split(',')[0]?.trim()).filter(Boolean))].sort()
      : [];
    return { states: uniqueStates, cities: filteredCities };
  }, [associations, filters.state]);

  const filteredAssociations = useMemo(() => {
    return associations.filter(a => {
      const [city, state] = a.ubicacion?.split(',').map(s => s.trim()) || ['', ''];
      const stateMatch = !filters.state || state === filters.state;
      const cityMatch = !filters.city || city === filters.city;
      return stateMatch && cityMatch;
    });
  }, [associations, filters]);

  return (
    <div className="min-h-[100dvh] flex flex-col p-4 overflow-y-auto"
         style={{
           background: 'linear-gradient(135deg, #fafafa 0%, #f8f8f8 50%, #f5f5f5 100%)',
         }}>
      <Helmet>
        <title>Apoyo y Refugios - KUNNA</title>
        <meta name="description" content="Directorio de asociaciones y refugios para encontrar apoyo." />
      </Helmet>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-[#f5e6ff]/80 to-[#c8a6a6]/60 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
          <HomeIcon className="h-8 w-8 text-[#382a3c]" />
        </div>
        <h1 className="text-4xl font-bold font-serif text-[#382a3c] mt-2">Apoyo y Refugios</h1>
        <p className="text-lg text-[#8d7583] max-w-md mx-auto">Encuentra ayuda y un lugar seguro cuando más lo necesites.</p>
      </motion.div>

      {/* Botón para agregar asociación */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }} 
        className="mb-6">
        <div className="bg-gradient-to-br from-[#f5e6ff]/90 via-[#c8a6a6]/20 to-[#8d7583]/30 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-2xl"
             style={{
               background: 'linear-gradient(135deg, #f5e6ff 0%, rgba(200, 166, 166, 0.3) 50%, rgba(141, 117, 131, 0.4) 100%)',
               boxShadow: '0 20px 40px rgba(56, 42, 60, 0.1), 0 8px 16px rgba(141, 117, 131, 0.2)',
             }}>
          
          {/* Header del formulario */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full flex items-center justify-between group hover:bg-white/10 rounded-2xl p-4 transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#382a3c]/30 to-[#8d7583]/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6 text-[#382a3c]" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-[#382a3c] font-serif group-hover:text-[#8d7583] transition-colors duration-300">
                  Agregar Asociación
                </h2>
                <p className="text-[#8d7583] group-hover:text-[#382a3c] transition-colors duration-300">
                  Inscribe tu organización o proyecto social
                </p>
              </div>
            </div>
            
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
              {showAddForm ? (
                <ChevronUp className="w-4 h-4 text-[#382a3c]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#382a3c]" />
              )}
            </div>
          </button>

          {/* Formulario desplegable */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 overflow-hidden"
            >
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#382a3c] mb-2">
                        Nombre de la Asociación *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full p-3 border border-[#8d7583]/30 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-[#c1d43a] focus:border-transparent transition-all duration-200"
                        placeholder="Ej: Fundación Esperanza"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#382a3c] mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.telefono}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                        className="w-full p-3 border border-[#8d7583]/30 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-[#c1d43a] focus:border-transparent transition-all duration-200"
                        placeholder="Ej: 555-123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#382a3c] mb-2">
                      Descripción *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.descripcion}
                      onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                      className="w-full p-3 border border-[#8d7583]/30 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-[#c1d43a] focus:border-transparent transition-all duration-200"
                      placeholder="Describe los servicios y apoyo que brinda tu asociación..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#382a3c] mb-2">
                        Estado *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.estado}
                        onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                        className="w-full p-3 border border-[#8d7583]/30 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-[#c1d43a] focus:border-transparent transition-all duration-200"
                        placeholder="Ej: Jalisco"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#382a3c] mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.ciudad}
                        onChange={(e) => setFormData(prev => ({ ...prev, ciudad: e.target.value }))}
                        className="w-full p-3 border border-[#8d7583]/30 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-[#c1d43a] focus:border-transparent transition-all duration-200"
                        placeholder="Ej: Guadalajara"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#382a3c] mb-2">
                      Sitio Web
                    </label>
                    <input
                      type="url"
                      value={formData.url_web}
                      onChange={(e) => setFormData(prev => ({ ...prev, url_web: e.target.value }))}
                      className="w-full p-3 border border-[#8d7583]/30 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-[#c1d43a] focus:border-transparent transition-all duration-200"
                      placeholder="https://www.tuasociacion.org"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseForm}
                      className="px-6 py-2 border-[#8d7583] text-[#8d7583] hover:bg-[#8d7583]/10"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-gradient-to-r from-[#c1d43a] to-[#8d7583] hover:from-[#8d7583] hover:to-[#c1d43a] text-white"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      {editingAssociation ? 'Actualizar' : 'Inscribir Asociación'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }} 
        className="bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-xl rounded-2xl p-4 mb-6 space-y-4 md:space-y-0 md:flex md:space-x-4 border border-white/30 shadow-lg">
        <div className="flex-1">
          <label htmlFor="state-filter" className="block text-sm font-medium text-[#382a3c] mb-2">Estado</label>
          <select 
            id="state-filter" 
            value={filters.state} 
            onChange={e => setFilters({ state: e.target.value, city: '' })} 
            className="w-full p-3 border border-[#8d7583]/30 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-[#c1d43a] focus:border-transparent transition-all duration-200">
            <option value="">Todos los estados</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="city-filter" className="block text-sm font-medium text-[#382a3c] mb-2">Ciudad</label>
          <select 
            id="city-filter" 
            value={filters.city} 
            onChange={e => setFilters(f => ({ ...f, city: e.target.value }))} 
            disabled={!filters.state} 
            className="w-full p-3 border border-[#8d7583]/30 rounded-xl bg-white/80 backdrop-blur-sm disabled:bg-gray-100/50 focus:ring-2 focus:ring-[#c1d43a] focus:border-transparent transition-all duration-200">
            <option value="">Todas las ciudades</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center p-10">
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-8 border border-white/30">
            <Loader2 className="w-10 h-10 text-[#382a3c] animate-spin mx-auto" />
            <p className="text-[#8d7583] mt-4 text-center">Cargando asociaciones...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAssociations.length > 0 ? filteredAssociations.map((assoc, index) => (
            <motion.div
              key={assoc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              style={{
                boxShadow: '0 10px 30px rgba(56, 42, 60, 0.1), 0 4px 12px rgba(141, 117, 131, 0.15)',
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#f5e6ff] to-[#c8a6a6] rounded-xl flex items-center justify-center">
                    <HomeIcon className="w-6 h-6 text-[#382a3c]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-serif text-[#382a3c] mb-1">{assoc.nombre}</h2>
                    {isAdmin && (
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(assoc)}
                                className="text-[#8d7583] hover:text-[#382a3c] hover:bg-white/20">
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        {!assoc.visible && (
                          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                            OCULTO
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-[#8d7583] mb-4 leading-relaxed">{assoc.descripcion}</p>
              
              <div className="flex items-center text-[#8d7583] text-sm mb-6 bg-white/30 rounded-xl p-3">
                <MapPin className="w-4 h-4 mr-2 text-[#382a3c]" />
                <span>{assoc.ubicacion}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Button 
                  asChild 
                  className="flex-1 bg-gradient-to-r from-[#c1d43a] to-[#8d7583] hover:from-[#8d7583] hover:to-[#c1d43a] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                  <a href={`tel:${assoc.telefono}`} className="flex items-center text-white w-full h-full justify-center">
                    <Phone className="w-4 h-4 mr-2" /> Llamar Ahora
                  </a>
                </Button>

                {assoc.url_web && (
                  <Button 
                    asChild 
                    variant="outline" 
                    className="flex-1 border-[#8d7583] text-[#8d7583] hover:bg-[#8d7583]/10 backdrop-blur-sm rounded-2xl">
                    <a href={assoc.url_web} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" /> Sitio Web
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          )) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12">
              <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/30 max-w-md mx-auto">
                <Search className="mx-auto h-12 w-12 text-[#8d7583]/50 mb-4" />
                <h3 className="text-xl font-semibold text-[#382a3c] mb-2">No se encontraron asociaciones</h3>
                <p className="text-[#8d7583]">Intenta ajustar los filtros de búsqueda o contacta a nuestro equipo para agregar nuevas asociaciones.</p>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupportDirectoryPage;