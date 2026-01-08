// src/pages/BibliotecaPublica.jsx
// Feed público donde todas leen libros publicados por otras usuarias

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Book, BookOpen, Heart, Star, Eye, Clock, 
  Filter, Search, Loader2, Sparkles, Users, PenTool
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getReacciones, getPromedioCalificacion } from '@/lib/booksService';

const CATEGORIAS = [
  'Todas',
  'Mi vida para contar',
  'Superación',
  'Duelo',
  'Violencia',
  'Autoestima',
  'Otro'
];

const BibliotecaPublica = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarLibrosPublicos();
  }, [categoriaFiltro]);

  const cargarLibrosPublicos = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('books')
        .select(`
          *,
          book_publications(slug, views_count)
        `)
        .eq('estado', 'published')
        .order('published_at', { ascending: false });

      if (categoriaFiltro !== 'Todas') {
        query = query.eq('categoria', categoriaFiltro);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Cargar reacciones y calificaciones para cada libro
      const librosConEstadisticas = await Promise.all(
        data.map(async (libro) => {
          const calificacion = await getPromedioCalificacion(libro.id);
          return {
            ...libro,
            promedio_estrellas: calificacion.promedio,
            total_calificaciones: calificacion.total
          };
        })
      );

      setLibros(librosConEstadisticas);
    } catch (error) {
      console.error('Error cargando libros:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudieron cargar los libros',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const librosFiltrados = libros.filter(libro => {
    if (!busqueda) return true;
    const searchLower = busqueda.toLowerCase();
    return (
      libro.titulo.toLowerCase().includes(searchLower) ||
      libro.descripcion?.toLowerCase().includes(searchLower) ||
      libro.alias_nombre?.toLowerCase().includes(searchLower)
    );
  });

  const getNombreAutor = (libro) => {
    switch (libro.anon_mode) {
      case 'anonimo':
        return '👤 Anónimo';
      case 'alias':
        return `✨ ${libro.alias_nombre}`;
      case 'publico':
        return '📝 Autor verificado';
      default:
        return '👤 Anónimo';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#263152] via-[#382a3c] to-[#8d7583] relative overflow-hidden">
      <Helmet>
        <title>Biblioteca - KUNNA</title>
        <meta name="description" content="Lee historias reales de superación y sanación" />
      </Helmet>

      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#c1d43a]/20 to-[#f5e6ff]/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-28 h-28 bg-gradient-to-br from-[#c8a6a6]/25 to-[#263152]/15 rounded-full blur-lg animate-pulse delay-700"></div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 
            className="text-4xl font-bold font-serif mb-2"
            style={{
              background: 'linear-gradient(135deg, #f5e6ff, #c1d43a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            📚 Biblioteca KUNNA
          </h1>
          <p className="text-[#f5e6ff]/70 text-sm mb-4">
            Historias reales de mujeres que han decidido compartir su verdad
          </p>
          <Button
            onClick={() => navigate('/escribir-libro')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center gap-2"
          >
            <PenTool className="w-4 h-4" />
            Escribir mi libro
          </Button>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-4"
        >
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#f5e6ff]/40" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por título, descripción o autor..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#263152]/50 border border-[#f5e6ff]/20 text-[#f5e6ff] placeholder:text-[#f5e6ff]/40 focus:outline-none focus:border-[#c1d43a]"
            />
          </div>

          {/* Categorías */}
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaFiltro(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  categoriaFiltro === cat
                    ? 'bg-gradient-to-r from-[#c1d43a] to-[#f5e6ff] text-[#263152]'
                    : 'bg-[#263152]/50 text-[#f5e6ff]/70 border border-[#f5e6ff]/20 hover:border-[#c1d43a]/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid de libros */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-[#c1d43a] animate-spin" />
          </div>
        ) : librosFiltrados.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-16 h-16 text-[#f5e6ff]/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-[#f5e6ff] mb-2">
              {busqueda ? 'No se encontraron libros' : 'Aún no hay libros publicados'}
            </h3>
            <p className="text-[#f5e6ff]/70">
              {busqueda ? 'Intenta con otros términos de búsqueda' : 'Sé la primera en compartir tu historia'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {librosFiltrados.map((libro, index) => (
                <motion.div
                  key={libro.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/leer/${libro.id}`)}
                  className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 230, 255, 0.15), rgba(193, 212, 58, 0.10))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(245, 230, 255, 0.2)'
                  }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  {/* Portada */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#263152] to-[#382a3c] rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                    {libro.portada_url ? (
                      <img 
                        src={libro.portada_url} 
                        alt={libro.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Book className="w-16 h-16 text-[#f5e6ff]/30" />
                    )}

                    {/* Overlay en hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                      <span className="text-white font-semibold">Leer ahora</span>
                    </div>
                  </div>

                  {/* Info del libro */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[#f5e6ff] line-clamp-2 group-hover:text-[#c1d43a] transition-colors">
                      {libro.titulo}
                    </h3>

                    <p className="text-xs text-[#f5e6ff]/60">
                      {getNombreAutor(libro)}
                    </p>

                    {libro.descripcion && (
                      <p className="text-sm text-[#f5e6ff]/70 line-clamp-2">
                        {libro.descripcion}
                      </p>
                    )}

                    {/* Estadísticas */}
                    <div className="flex items-center gap-3 text-xs text-[#f5e6ff]/60 pt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span>{libro.promedio_estrellas || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{libro.book_publications?.[0]?.views_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{Math.ceil((libro.total_palabras || 0) / 200)} min</span>
                      </div>
                    </div>

                    {/* Categoría */}
                    <span className="inline-block px-3 py-1 rounded-full text-xs bg-[#c1d43a]/20 text-[#c1d43a]">
                      {libro.categoria}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default BibliotecaPublica;
