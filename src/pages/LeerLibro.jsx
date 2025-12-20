// src/pages/LeerLibro.jsx
// Modal/Página para leer libros con protecciones anti-copia

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient';
import { 
  X, ChevronLeft, ChevronRight, Heart, Sparkles, 
  Users as Hug, Star, Loader2, BookOpen, Clock
} from 'lucide-react';
import { 
  getCapitulos, darReaccion, quitarReaccion, 
  getReacciones, calificarLibro, getPromedioCalificacion 
} from '@/lib/booksService';
import { Button } from '@/components/ui/button';

const LeerLibro = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [libro, setLibro] = useState(null);
  const [capitulos, setCapitulos] = useState([]);
  const [capituloActualIndex, setCapituloActualIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reacciones, setReacciones] = useState({ heart: 0, hug: 0, sparkle: 0 });
  const [misReacciones, setMisReacciones] = useState([]);
  const [calificacion, setCalificacion] = useState(null);
  const [tiempoLectura, setTiempoLectura] = useState(0);

  const contenidoRef = useRef(null);
  const tiempoInicio = useRef(Date.now());

  // Touch/swipe para navegación
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  useEffect(() => {
    if (user && bookId) {
      cargarLibroYCapitulos();
      cargarReacciones();
    }
  }, [user, bookId]);

  useEffect(() => {
    // Contador de tiempo de lectura
    const interval = setInterval(() => {
      setTiempoLectura(Math.floor((Date.now() - tiempoInicio.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // PROTECCIONES ANTI-COPIA
  useEffect(() => {
    const contenido = contenidoRef.current;
    if (!contenido) return;

    // Bloquear selección
    const bloquearSeleccion = (e) => {
      e.preventDefault();
      return false;
    };

    // Bloquear copiar
    const bloquearCopiar = (e) => {
      e.preventDefault();
      toast({
        title: '🔒 Contenido protegido',
        description: 'Este contenido no se puede copiar',
        variant: 'destructive'
      });
      return false;
    };

    // Bloquear click derecho
    const bloquearContextMenu = (e) => {
      e.preventDefault();
      toast({
        title: '🔒 Contenido protegido',
        description: 'No se permite captura de pantalla',
        variant: 'destructive'
      });
      return false;
    };

    // Bloquear shortcuts de copia
    const bloquearShortcuts = (e) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'C')) ||
        (e.metaKey && (e.key === 'c' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'a' || e.key === 'A')) ||
        (e.metaKey && (e.key === 'a' || e.key === 'A')) ||
        (e.ctrlKey && (e.key === 'x' || e.key === 'X')) ||
        (e.metaKey && (e.key === 'x' || e.key === 'X')) ||
        (e.key === 'PrintScreen') ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')) // Mac screenshot
      ) {
        e.preventDefault();
        toast({
          title: '🔒 Acción bloqueada',
          description: 'Este contenido está protegido',
          variant: 'destructive'
        });
        return false;
      }
    };

    contenido.addEventListener('selectstart', bloquearSeleccion);
    contenido.addEventListener('copy', bloquearCopiar);
    contenido.addEventListener('contextmenu', bloquearContextMenu);
    document.addEventListener('keydown', bloquearShortcuts);

    // CSS para bloquear selección
    contenido.style.userSelect = 'none';
    contenido.style.webkitUserSelect = 'none';
    contenido.style.mozUserSelect = 'none';
    contenido.style.msUserSelect = 'none';
    contenido.style.webkitTouchCallout = 'none';

    return () => {
      contenido.removeEventListener('selectstart', bloquearSeleccion);
      contenido.removeEventListener('copy', bloquearCopiar);
      contenido.removeEventListener('contextmenu', bloquearContextMenu);
      document.removeEventListener('keydown', bloquearShortcuts);
    };
  }, [contenidoRef.current, capituloActualIndex]);

  const cargarLibroYCapitulos = async () => {
    try {
      setLoading(true);

      // Cargar libro
      const { data: libroData, error: libroError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .eq('estado', 'published')
        .single();

      if (libroError) throw libroError;
      setLibro(libroData);

      // Cargar capítulos
      const caps = await getCapitulos(bookId);
      
      // Filtrar según tipo de publicación
      let capitulosVisibles = caps.filter(c => c.estado === 'published');
      
      if (libroData.publicacion_tipo === 'extracto' && libroData.extracto_capitulos) {
        capitulosVisibles = capitulosVisibles.filter(c => 
          libroData.extracto_capitulos.includes(c.id)
        );
      }

      setCapitulos(capitulosVisibles);

      // Incrementar views
      await supabase.rpc('increment_views', { book_id_param: bookId });

    } catch (error) {
      console.error('Error cargando libro:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo cargar el libro',
        variant: 'destructive'
      });
      navigate('/biblioteca');
    } finally {
      setLoading(false);
    }
  };

  const cargarReacciones = async () => {
    if (capitulos.length === 0) return;
    
    const capituloActual = capitulos[capituloActualIndex];
    if (!capituloActual) return;

    try {
      const reaccionesData = await getReacciones(capituloActual.id);
      setReacciones(reaccionesData);

      // Cargar mis reacciones
      const { data } = await supabase
        .from('reactions')
        .select('type')
        .eq('chapter_id', capituloActual.id)
        .eq('user_id', user.id);

      setMisReacciones(data?.map(r => r.type) || []);
    } catch (error) {
      console.error('Error cargando reacciones:', error);
    }
  };

  const handleReaccion = async (type) => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para reaccionar',
        variant: 'destructive'
      });
      return;
    }

    const capituloActual = capitulos[capituloActualIndex];
    
    try {
      if (misReacciones.includes(type)) {
        await quitarReaccion(capituloActual.id, type);
        setMisReacciones(misReacciones.filter(t => t !== type));
        setReacciones({ ...reacciones, [type]: reacciones[type] - 1 });
      } else {
        await darReaccion(capituloActual.id, type);
        setMisReacciones([...misReacciones, type]);
        setReacciones({ ...reacciones, [type]: reacciones[type] + 1 });
      }
    } catch (error) {
      console.error('Error con reacción:', error);
    }
  };

  const handleCalificar = async (stars) => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para calificar',
        variant: 'destructive'
      });
      return;
    }

    try {
      await calificarLibro(bookId, stars, tiempoLectura, capituloActualIndex + 1);
      setCalificacion(stars);
      toast({
        title: '✅ Gracias por calificar',
        description: `Has dado ${stars} estrellas a este libro`
      });
    } catch (error) {
      console.error('Error calificando:', error);
    }
  };

  const siguienteCapitulo = () => {
    if (capituloActualIndex < capitulos.length - 1) {
      setCapituloActualIndex(capituloActualIndex + 1);
      cargarReacciones();
    }
  };

  const anteriorCapitulo = () => {
    if (capituloActualIndex > 0) {
      setCapituloActualIndex(capituloActualIndex - 1);
      cargarReacciones();
    }
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      anteriorCapitulo();
    } else if (info.offset.x < -100) {
      siguienteCapitulo();
    }
    animate(x, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#263152] via-[#382a3c] to-[#8d7583] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#c1d43a] animate-spin" />
      </div>
    );
  }

  const capituloActual = capitulos[capituloActualIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#263152] via-[#382a3c] to-[#8d7583] relative overflow-hidden">
      <Helmet>
        <title>{libro?.titulo || 'Leyendo'} - KUNNA</title>
      </Helmet>

      {/* Botón cerrar */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate('/biblioteca')}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-[#263152]/80 backdrop-blur-sm border border-[#f5e6ff]/20 hover:bg-[#263152] transition-colors"
      >
        <X className="w-6 h-6 text-[#f5e6ff]" />
      </motion.button>

      {/* Contenedor principal */}
      <div className="max-w-4xl mx-auto p-6 pt-20">
        {/* Header del libro */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-[#f5e6ff] mb-2">
            {libro?.titulo}
          </h1>
          <p className="text-[#f5e6ff]/60 text-sm">
            {libro?.anon_mode === 'anonimo' ? '👤 Anónimo' : 
             libro?.anon_mode === 'alias' ? `✨ ${libro.alias_nombre}` : 
             '📝 Autor verificado'}
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-[#f5e6ff]/60">
            <span>Capítulo {capituloActualIndex + 1} de {capitulos.length}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {capituloActual?.tiempo_lectura_min || 0} min
            </span>
          </div>
        </motion.div>

        {/* Contenedor cristal del contenido */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="relative p-8 rounded-3xl mb-8"
          style={{
            x,
            opacity,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            minHeight: '60vh'
          }}
        >
          {/* Marca de agua */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <span className="text-9xl font-bold text-[#f5e6ff]">KUNNA</span>
          </div>

          {/* Contenido protegido */}
          <div 
            ref={contenidoRef}
            className="relative z-10"
          >
            <h2 className="text-2xl font-bold text-[#f5e6ff] mb-6">
              {capituloActual?.titulo}
            </h2>
            <div 
              className="text-[#f5e6ff]/90 leading-relaxed whitespace-pre-wrap text-lg"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {capituloActual?.contenido}
            </div>
          </div>

          {/* Navegación */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#f5e6ff]/20">
            <Button
              variant="ghost"
              onClick={anteriorCapitulo}
              disabled={capituloActualIndex === 0}
              className="text-[#f5e6ff] disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Anterior
            </Button>

            <span className="text-[#f5e6ff]/60 text-sm">
              Desliza para cambiar de página
            </span>

            <Button
              variant="ghost"
              onClick={siguienteCapitulo}
              disabled={capituloActualIndex === capitulos.length - 1}
              className="text-[#f5e6ff] disabled:opacity-30"
            >
              Siguiente
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </motion.div>

        {/* Reacciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-4 mb-8"
        >
          <button
            onClick={() => handleReaccion('heart')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              misReacciones.includes('heart')
                ? 'bg-red-500/30 text-red-200'
                : 'bg-[#263152]/50 text-[#f5e6ff]/60 hover:bg-[#263152]'
            }`}
          >
            <Heart className={misReacciones.includes('heart') ? 'fill-current' : ''} />
            <span>{reacciones.heart}</span>
          </button>

          <button
            onClick={() => handleReaccion('hug')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              misReacciones.includes('hug')
                ? 'bg-blue-500/30 text-blue-200'
                : 'bg-[#263152]/50 text-[#f5e6ff]/60 hover:bg-[#263152]'
            }`}
          >
            <Hug className={misReacciones.includes('hug') ? 'fill-current' : ''} />
            <span>{reacciones.hug}</span>
          </button>

          <button
            onClick={() => handleReaccion('sparkle')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              misReacciones.includes('sparkle')
                ? 'bg-yellow-500/30 text-yellow-200'
                : 'bg-[#263152]/50 text-[#f5e6ff]/60 hover:bg-[#263152]'
            }`}
          >
            <Sparkles className={misReacciones.includes('sparkle') ? 'fill-current' : ''} />
            <span>{reacciones.sparkle}</span>
          </button>
        </motion.div>

        {/* Calificación */}
        {capituloActualIndex === capitulos.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 rounded-2xl bg-[#263152]/50 backdrop-blur-sm"
          >
            <p className="text-[#f5e6ff] mb-4">¿Qué te pareció este libro?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleCalificar(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      calificacion >= star || false
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-[#f5e6ff]/30'
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LeerLibro;
