// src/pages/MisLibros.jsx
// Página principal del módulo "Escribe tu libro"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  BookOpen, Plus, Edit, Trash2, Eye, Loader2, Book, 
  Sparkles, Lock, Globe, User, Clock, FileText 
} from 'lucide-react';
import { getMisLibros, eliminarLibro } from '@/lib/booksService';
import { Button } from '@/components/ui/button';

const MisLibros = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user) {
      cargarLibros();
    }
  }, [user]);

  const cargarLibros = async () => {
    try {
      setLoading(true);
      const data = await getMisLibros();
      setBooks(data);
    } catch (error) {
      console.error('Error cargando libros:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudieron cargar tus libros',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarLibro = async (bookId) => {
    if (!confirm('¿Estás segura de eliminar este libro? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeletingId(bookId);
      await eliminarLibro(bookId);
      setBooks(books.filter(b => b.id !== bookId));
      toast({
        title: '✅ Libro eliminado',
        description: 'Tu libro ha sido eliminado correctamente'
      });
    } catch (error) {
      console.error('Error eliminando libro:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo eliminar el libro',
        variant: 'destructive'
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getIconoVisibilidad = (anonMode) => {
    switch (anonMode) {
      case 'anonimo':
        return <Lock className="w-4 h-4" />;
      case 'publico':
        return <Globe className="w-4 h-4" />;
      case 'alias':
        return <User className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  const getTextoVisibilidad = (anonMode, aliasNombre) => {
    switch (anonMode) {
      case 'anonimo':
        return 'Anónimo';
      case 'publico':
        return 'Público';
      case 'alias':
        return `Alias: ${aliasNombre}`;
      default:
        return 'Privado';
    }
  };

  const getEstadoBadge = (estado) => {
    const styles = {
      draft: 'bg-yellow-500/20 text-yellow-200',
      published: 'bg-green-500/20 text-green-200',
      archived: 'bg-gray-500/20 text-gray-200'
    };

    const textos = {
      draft: 'Borrador',
      published: 'Publicado',
      archived: 'Archivado'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[estado]}`}>
        {textos[estado]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#263152] via-[#382a3c] to-[#8d7583] relative overflow-hidden">
      <Helmet>
        <title>Mis Libros - KUNNA</title>
        <meta name="description" content="Escribe y publica tu historia" />
      </Helmet>

      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#c1d43a]/20 to-[#f5e6ff]/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-br from-[#c8a6a6]/25 to-[#263152]/15 rounded-full blur-lg animate-pulse delay-700"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-4xl font-bold font-serif mb-2"
                style={{
                  background: 'linear-gradient(135deg, #f5e6ff, #c1d43a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                📖 Mis Libros
              </h1>
              <p className="text-[#f5e6ff]/70 text-sm">
                Escribe tu historia. Comparte tu verdad.
              </p>
            </div>

            <Button
              onClick={() => navigate('/nuevo-libro')}
              className="bg-gradient-to-r from-[#c1d43a] to-[#f5e6ff] text-[#263152] font-bold hover:scale-105 transition-transform"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Libro
            </Button>
          </div>
        </motion.div>

        {/* Grid de libros */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-[#c1d43a] animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-16 h-16 text-[#f5e6ff]/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-[#f5e6ff] mb-2">
              Aún no tienes libros
            </h3>
            <p className="text-[#f5e6ff]/70 mb-6">
              Empieza a escribir tu historia. Es momento de compartir tu verdad.
            </p>
            <Button
              onClick={() => navigate('/nuevo-libro')}
              className="bg-gradient-to-r from-[#c1d43a] to-[#f5e6ff] text-[#263152] font-bold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear mi primer libro
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative overflow-hidden rounded-2xl p-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 230, 255, 0.15), rgba(193, 212, 58, 0.10))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(245, 230, 255, 0.2)'
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Portada o placeholder */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#263152] to-[#382a3c] rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                    {book.portada_url ? (
                      <img 
                        src={book.portada_url} 
                        alt={book.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Book className="w-16 h-16 text-[#f5e6ff]/30" />
                    )}
                    
                    {/* Badge de estado */}
                    <div className="absolute top-2 right-2">
                      {getEstadoBadge(book.estado)}
                    </div>
                  </div>

                  {/* Info del libro */}
                  <div className="space-y-2 mb-4">
                    <h3 className="text-xl font-bold text-[#f5e6ff] line-clamp-2">
                      {book.titulo}
                    </h3>
                    
                    {book.descripcion && (
                      <p className="text-[#f5e6ff]/70 text-sm line-clamp-2">
                        {book.descripcion}
                      </p>
                    )}

                    {/* Metadatos */}
                    <div className="flex items-center gap-4 text-xs text-[#f5e6ff]/60">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {book.total_capitulos || 0} caps
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.ceil((book.total_palabras || 0) / 200)} min
                      </div>
                    </div>

                    {/* Visibilidad */}
                    <div className="flex items-center gap-2 text-xs text-[#c1d43a]">
                      {getIconoVisibilidad(book.anon_mode)}
                      <span>{getTextoVisibilidad(book.anon_mode, book.alias_nombre)}</span>
                    </div>

                    {/* Categoría */}
                    <span className="inline-block px-3 py-1 rounded-full text-xs bg-[#c1d43a]/20 text-[#c1d43a]">
                      {book.categoria}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-[#c1d43a]/30 text-[#f5e6ff] hover:bg-[#c1d43a]/20"
                      onClick={() => navigate(`/editor/${book.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>

                    {book.estado === 'published' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#f5e6ff]/30 text-[#f5e6ff] hover:bg-[#f5e6ff]/10"
                        onClick={() => navigate(`/libro/${book.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                      onClick={() => handleEliminarLibro(book.id)}
                      disabled={deletingId === book.id}
                    >
                      {deletingId === book.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisLibros;
