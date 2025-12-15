// CommunityBlog.jsx
// Página de Blog estilo periódico (Zinha) — lista para pegar
// Rework total: sin emojis, look & feel de periódico, CTA visible para “Contar tu historia”,
// secciones por categoría, y conexión a Supabase con tu tabla `blog_historias`.

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Edit3, Send, Heart, MessageCircle, Clock, User, Book, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// Paleta de colores Zinha
const colors = {
  rose: '#c8a6a6',
  purple: '#8d7583',
  lime: '#c1d43a',
  darkPurple: '#382a3c',
  lightPurple: '#f5e6ff',
};

// Utilidades
const fmtLongMX = (d) => new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

export default function CommunityBlog() {
  const { toast } = useToast();
  const { user } = useAuth();

  // UI / State
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeCat, setActiveCat] = useState('todas');

  // Carga aprobados/publicados
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_historias')
      .select('*')
      .eq('estatus_revision', 'aprobado')
      .eq('publicado', true)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      toast({ title: 'Error al cargar', description: 'No pudimos obtener las historias.', variant: 'destructive' });
      return;
    }
    setPosts(data || []);
  };

  useEffect(() => { fetchPosts(); }, []);

  // RPC: like
  const handleLike = async (id) => {
    const { error } = await supabase.rpc('incrementar_likes_blog', { post_id: id });
    if (error) {
      toast({ title: 'No se pudo reaccionar', variant: 'destructive' });
      return;
    }
    fetchPosts();
  };

  // Envío de historia (va a revisión)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Campos vacíos', description: 'Escribe un título y contenido.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('blog_historias').insert([
      {
        titulo: title.trim(),
        contenido: content.trim(),
        anonimo: isAnonymous,
        usuario_id: isAnonymous ? null : user?.id || null,
        estatus_revision: 'pendiente',
        publicado: false,
      },
    ]);
    setLoading(false);

    if (error) {
      toast({ title: 'Error al enviar', description: 'Intenta más tarde.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Historia enviada', description: 'Tu texto fue enviado para revisión editorial.' });
    setTitle('');
    setContent('');
    setIsAnonymous(true);
    fetchPosts();
  };

  // Función para abrir/mostrar historia completa
  const openStory = (story) => {
    // Por ahora mostraremos un toast con el título, en el futuro esto podría abrir un modal
    toast({ 
      title: story.titulo, 
      description: `Artículo de ${story.nombre_autor || 'Colaboradora Anónima'}` 
    });
  };

  // CATEGORÍAS detectadas dinámicamente desde los posts
  const categories = useMemo(() => {
    const set = new Set();
    posts.forEach(p => { if (p.categoria) set.add(p.categoria); });
    return ['todas', ...Array.from(set)];
  }, [posts]);

  const filtered = useMemo(() => {
    if (activeCat === 'todas') return posts;
    return posts.filter(p => (p.categoria || '').toLowerCase() === activeCat.toLowerCase());
  }, [posts, activeCat]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-[#f8f6f4] via-[#f5f2ef] to-[#f0ebe6] relative overflow-hidden">
      {/* Efectos de fondo elegantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-[#c8a6a6]/15 to-[#8d7583]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-32 h-32 bg-gradient-to-br from-[#f5e6ff]/20 to-[#c1d43a]/10 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/4 w-36 h-36 bg-gradient-to-br from-[#382a3c]/10 to-[#263152]/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Helmet>
        <title>Revista KUNNA — Comunidad</title>
        <meta name="description" content="Historias reales de la comunidad KUNNA. Comparte la tuya y dale voz a otras." />
        <style>{`
          .magazine-text{line-height:1.9;text-align:justify;hyphens:auto;font-family: 'Georgia', serif}
          .magazine-columns{column-count:1;column-gap:2.5rem}
          @media(min-width:768px){.magazine-columns{column-count:2}}
          .drop-cap{float:left;font-size:4rem;line-height:3rem;padding-right:0.5rem;margin-top:0.25rem;font-weight:700}
        `}</style>
      </Helmet>

      {/* MASTHEAD tipo revista de lujo */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute top-0 left-0 w-full h-3 opacity-30"
            style={{ background: `linear-gradient(90deg, ${colors.darkPurple}, ${colors.rose}, ${colors.lime}, ${colors.purple})` }}
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: -30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }} 
          className="relative text-center py-16 px-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 246, 244, 0.8))',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-8 mb-8">
              {/* Imagen del Blog */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative group cursor-pointer"
              >
                <div className="relative max-w-xs">
                  <img 
                    src="/images/Blog.png" 
                    alt="Blog KUNNA"
                    className="w-auto h-auto max-h-80 rounded-3xl shadow-xl group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Efecto de cristal */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 backdrop-blur-[0.5px] rounded-3xl border border-white/5 shadow-2xl z-10 group-hover:shadow-3xl transition-all duration-500"></div>
                  
                  {/* Overlay con brillo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Efecto de luz flotante */}
                  <motion.div
                    className="absolute top-4 right-4 w-4 h-4 rounded-full opacity-0 group-hover:opacity-80"
                    style={{ backgroundColor: colors.lime }}
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  ></motion.div>
                </div>
              </motion.div>

              {/* Título Principal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-center"
              >
                <motion.div 
                  className="relative"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <h1 
                    className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${colors.darkPurple}, ${colors.rose}, ${colors.purple})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 4px 20px rgba(56, 42, 60, 0.2)'
                    }}
                  >
                    REVISTA KUNNA
                  </h1>
                  
                  <div 
                    className="text-lg md:text-xl font-medium tracking-[0.3em] mb-4 italic"
                    style={{ color: colors.purple }}
                  >
                    VOCES QUE TRANSFORMAN
                  </div>
                  
                  <div 
                    className="text-sm font-semibold tracking-wider"
                    style={{ color: colors.darkPurple }}
                  >
                    EDICIÓN ESPECIAL — {new Date().toLocaleDateString('es-MX', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }).toUpperCase()}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24 relative z-10">
        {/* CTA: Contar tu historia - Estilo revista premium */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }} 
          className="mb-16"
        >
          <div 
            className="rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/30"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(245, 230, 255, 0.15))',
            }}
          >
            <div 
              className="px-8 py-6 relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${colors.darkPurple}, ${colors.purple}, ${colors.rose})` 
              }}
            >
              {/* Efecto de brillo en el header */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-pulse"></div>
              </div>
              
              <div className="relative z-10 flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm"
                >
                  <Edit3 className="w-8 h-8 text-white drop-shadow-lg" />
                </motion.div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wide">
                    COMPARTE TU HISTORIA
                  </h2>
                  <p className="text-white/90 text-lg font-medium">
                    Tu voz importa, tu experiencia inspira
                  </p>
                </div>
              </div>
            </div>

            <div className="p-10">
              <div 
                className="text-lg font-medium mb-8 p-4 rounded-xl"
                style={{ 
                  color: colors.darkPurple,
                  background: 'linear-gradient(135deg, rgba(245, 230, 255, 0.3), rgba(200, 166, 166, 0.2))'
                }}
              >
                 <strong>PROCESO EDITORIAL ESPECIALIZADO:</strong> Tu testimonio pasará por nuestro equipo editorial. 
                Si se aprueba, se publica en nuestra revista digital y puede ser seleccionado para nuestro podcast exclusivo.
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label 
                    className="block text-lg font-bold mb-4 flex items-center gap-2" 
                    style={{ color: colors.darkPurple }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.lime }}></div>
                    TITULAR DE TU HISTORIA
                  </label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Un titular que capture la esencia de tu experiencia..." 
                    className="w-full px-6 py-4 rounded-2xl border-2 border-white/50 focus:border-current focus:ring-0 transition-all duration-300 font-serif text-xl shadow-lg backdrop-blur-sm"
                    style={{ 
                      color: colors.darkPurple,
                      borderColor: colors.purple + '40',
                      background: 'rgba(255, 255, 255, 0.8)'
                    }}
                  />
                </div>
                
                <div>
                  <label 
                    className="block text-lg font-bold mb-4 flex items-center gap-2" 
                    style={{ color: colors.darkPurple }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.rose }}></div>
                    CONTENIDO DE TU HISTORIA
                  </label>
                  <textarea 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    maxLength={10000} 
                    rows={10} 
                    placeholder="Comparte tu experiencia con autenticidad. Cada palabra cuenta para inspirar a otras mujeres en su camino..." 
                    className="w-full px-6 py-6 rounded-2xl border-2 border-white/50 focus:border-current focus:ring-0 transition-all duration-300 resize-none font-serif leading-relaxed text-lg shadow-lg backdrop-blur-sm"
                    style={{ 
                      color: colors.darkPurple,
                      borderColor: colors.purple + '40',
                      background: 'rgba(255, 255, 255, 0.8)'
                    }}
                  />
                  <div 
                    className="text-sm text-right mt-2 font-medium" 
                    style={{ color: colors.purple }}
                  >
                    {content.length}/10,000 caracteres
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-6">
                  <label 
                    className="flex items-center gap-4 text-lg font-medium cursor-pointer group" 
                    style={{ color: colors.darkPurple }}
                  >
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={isAnonymous} 
                        onChange={() => setIsAnonymous(v => !v)} 
                        className="sr-only"
                      />
                      <div 
                        className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${isAnonymous ? 'bg-current border-current' : 'border-current bg-transparent'}`}
                        style={{ color: colors.lime }}
                      >
                        {isAnonymous && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    Publicar como colaboradora anónima
                  </label>
                  
                  <motion.button
                    type="submit" 
                    disabled={loading} 
                    className="px-8 py-4 font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3 shadow-xl"
                    style={{
                      background: `linear-gradient(135deg, ${colors.darkPurple}, ${colors.purple})`,
                      color: 'white'
                    }}
                    whileHover={{ 
                      boxShadow: '0 20px 40px rgba(56, 42, 60, 0.4)',
                      y: -2
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-5 h-5" />
                    {loading ? 'ENVIANDO...' : 'ENVIAR AL EDITOR'}
                  </motion.button>
                </div>
              </form>

              <div 
                className="mt-8 p-6 rounded-2xl border-l-4"
                style={{ 
                  backgroundColor: 'rgba(245, 230, 255, 0.3)',
                  borderColor: colors.lime,
                  color: colors.darkPurple
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-3" style={{ backgroundColor: colors.lime }}></div>
                  <div>
                    <strong className="text-lg">PROCESO EDITORIAL PROFESIONAL:</strong>
                    <p className="mt-2 leading-relaxed">
                      Nuestro equipo editorial revisa cada historia con respeto y cuidado. Si es seleccionada, 
                      te contactaremos para autorización final y posible inclusión en nuestro podcast exclusivo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Navegación por secciones - Estilo revista elegante */}
        <motion.nav 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="text-center mb-6">
            <h3 
              className="text-2xl font-serif font-bold mb-2"
              style={{ color: colors.darkPurple }}
            >
              EXPLORA POR SECCIONES
            </h3>
            <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: colors.lime }}></div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat, index) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => setActiveCat(cat)}
                className={`px-6 py-3 text-sm font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg ${
                  activeCat === cat 
                    ? 'text-white shadow-xl' 
                    : 'text-current hover:shadow-xl'
                }`}
                style={{
                  background: activeCat === cat 
                    ? `linear-gradient(135deg, ${colors.darkPurple}, ${colors.purple})`
                    : 'rgba(255, 255, 255, 0.8)',
                  color: activeCat === cat ? 'white' : colors.darkPurple,
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${activeCat === cat ? 'transparent' : colors.purple + '30'}`
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {cat.toUpperCase()}
              </motion.button>
            ))}
          </div>
        </motion.nav>

        {/* Artículos como revista de lujo */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="space-y-8"
        >
          {filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16 px-8"
            >
              <div 
                className="max-w-md mx-auto p-8 rounded-3xl backdrop-blur-lg shadow-2xl"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: `1px solid ${colors.purple}30`
                }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.lime + '20' }}>
                  <Book className="w-8 h-8" style={{ color: colors.darkPurple }} />
                </div>
                <h4 
                  className="text-xl font-serif font-bold mb-4"
                  style={{ color: colors.darkPurple }}
                >
                  PRÓXIMAS COLABORACIONES
                </h4>
                <p 
                  className="text-base leading-relaxed"
                  style={{ color: colors.purple }}
                >
                  Estamos preparando contenido extraordinario para esta sección. 
                  ¡Sé la primera en contribuir con tu historia!
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-8 md:gap-12">
              {filtered.map((story, index) => (
                <motion.article
                  key={story.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="group cursor-pointer"
                  onClick={() => openStory(story)}
                >
                  <div 
                    className="relative p-8 md:p-12 rounded-3xl backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: `1px solid ${colors.purple}20`
                    }}
                  >
                    {/* Efecto de gradiente flotante */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${colors.rose}, ${colors.lime}, ${colors.purple})`
                      }}
                    ></div>
                    
                    {/* Decoración lateral */}
                    <div 
                      className="absolute left-0 top-0 h-full w-1 group-hover:w-2 transition-all duration-300"
                      style={{ backgroundColor: colors.lime }}
                    ></div>

                    <div className="relative z-10">
                      {/* Encabezado del artículo */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span 
                              className="px-4 py-1 text-xs font-bold rounded-full tracking-wider"
                              style={{ 
                                backgroundColor: colors.lime + '20',
                                color: colors.darkPurple
                              }}
                            >
                              {story.categoria.toUpperCase()}
                            </span>
                            <span 
                              className="text-sm font-medium"
                              style={{ color: colors.purple }}
                            >
                              {new Date(story.fecha_creacion).toLocaleDateString('es-ES', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          
                          <h3 
                            className="text-2xl md:text-3xl font-serif font-bold leading-tight group-hover:scale-[1.02] transition-transform duration-300"
                            style={{ color: colors.darkPurple }}
                          >
                            {story.titulo}
                          </h3>
                        </div>
                        
                        <motion.div 
                          className="ml-4"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <ExternalLink 
                            className="w-6 h-6 opacity-60 group-hover:opacity-100 transition-opacity duration-300" 
                            style={{ color: colors.purple }}
                          />
                        </motion.div>
                      </div>

                      {/* Extracto del contenido */}
                      <p 
                        className="text-lg leading-relaxed font-serif mb-6 line-clamp-3"
                        style={{ color: colors.darkPurple + 'CC' }}
                      >
                        {story.contenido.length > 200 
                          ? story.contenido.substring(0, 200) + '...' 
                          : story.contenido
                        }
                      </p>

                      {/* Pie del artículo */}
                      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.purple + '20' }}>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                            style={{ backgroundColor: colors.darkPurple }}
                          >
                            {story.nombre_autor ? story.nombre_autor.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <div 
                              className="font-semibold"
                              style={{ color: colors.darkPurple }}
                            >
                              {story.nombre_autor || 'Colaboradora Anónima'}
                            </div>
                            <div 
                              className="text-sm"
                              style={{ color: colors.purple }}
                            >
                              Contribuidora
                            </div>
                          </div>
                        </div>
                        
                        <motion.div 
                          className="flex items-center gap-2 text-sm font-medium group-hover:text-current transition-colors"
                          style={{ color: colors.purple }}
                          whileHover={{ x: 5 }}
                        >
                          <span>LEER ARTÍCULO</span>
                          <ChevronRight className="w-4 h-4" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
