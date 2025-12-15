import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Book, Download, Loader2, BookOpen, Library, Star } from 'lucide-react';

const ZinhaLibrary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  // Lista estática de libros con las URLs que proporcionaste
  const staticBooks = [
    {
      id: 1,
      titulo: "No Sé Cómo Mostrar Dónde Me Duele",
      autor: "Autor por determinar",
      url_pdf: "https://gptwzuqmuvzttajgjrry.supabase.co/storage/v1/object/public/biblioteca/No_se_como_mostrar_donde_me_duele.pdf",
      descripcion: "Un libro sobre el dolor emocional y cómo expresarlo",
      categoria: "Autoayuda"
    },
    {
      id: 2,
      titulo: "Querido Yo, Vamos A Estar Bien",
      autor: "Autor por determinar", 
      url_pdf: "https://gptwzuqmuvzttajgjrry.supabase.co/storage/v1/object/public/biblioteca/Querido-Yo-Vamos-A-Estar-Bien%20.pdf",
      descripcion: "Carta de amor propio y sanación personal",
      categoria: "Crecimiento Personal"
    },
    {
      id: 3,
      titulo: "Quién Entiende a los Hombres",
      autor: "Ana Von Rebeur",
      url_pdf: "https://gptwzuqmuvzttajgjrry.supabase.co/storage/v1/object/public/biblioteca/Quien-entiende-a-los-hombres-Ana-Von-Rebeur.pdf",
      descripcion: "Reflexiones sobre las relaciones y la comprensión",
      categoria: "Relaciones"
    },
    {
      id: 4,
      titulo: "Sanando Heridas Mientras Rompo en Llanto",
      autor: "Jairo",
      url_pdf: "https://gptwzuqmuvzttajgjrry.supabase.co/storage/v1/object/public/biblioteca/Sanando%20Heridas%20Mientras%20Rompo%20en%20Llanto-Jairo.pdf",
      descripcion: "Un proceso de sanación emocional profunda",
      categoria: "Sanación"
    },
    {
      id: 5,
      titulo: "Terapia para Llevar",
      autor: "Ana Pérez",
      url_pdf: "https://gptwzuqmuvzttajgjrry.supabase.co/storage/v1/object/public/biblioteca/Terapia%20para%20llevar%20-%20%20Ana%20Peerez.pdf",
      descripcion: "Herramientas terapéuticas para el día a día",
      categoria: "Psicología"
    },
    {
      id: 6,
      titulo: "Volver a Soñar",
      autor: "Megan Maxwell",
      url_pdf: "https://gptwzuqmuvzttajgjrry.supabase.co/storage/v1/object/public/biblioteca/Volver%20a%20Sonar%20Megan%20Maxwell.pdf",
      descripcion: "Redescubre la magia de los sueños y la esperanza",
      categoria: "Inspiración"
    }
  ];

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    // Por ahora usamos la lista estática, pero la estructura está lista para la base de datos
    setTimeout(() => {
      setBooks(staticBooks);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDownload = async (book) => {
    if (!user || !book.url_pdf) return;
    setDownloadingId(book.id);

    // Registrar la descarga si tienes la tabla configurada
    try {
      const { error: insertError } = await supabase
        .from('descargas_libros')
        .insert({ user_id: user.id, libro_id: book.id });

      if (insertError) {
        console.log('Info: Tabla de descargas no configurada aún');
      }
    } catch (error) {
      console.log('Info: Sistema de registro de descargas pendiente');
    }

    toast({ 
      title: '¡Descarga iniciada!', 
      description: `Abriendo "${book.titulo}" en una nueva pestaña.` 
    });
    
    window.open(book.url_pdf, '_blank');
    setDownloadingId(null);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-[#f8f6f4] via-[#f2f0ed] to-[#ebe8e4] overflow-y-auto">
      {/* Efectos de fondo bibliotecarios */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#8d7583]/20 to-[#c8a6a6]/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#382a3c]/15 to-[#263152]/10 rounded-full blur-lg animate-pulse delay-700"></div>
        <div className="absolute bottom-32 left-20 w-28 h-28 bg-gradient-to-br from-[#c1d43a]/10 to-[#f5e6ff]/15 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-gradient-to-br from-[#c8a6a6]/20 to-[#8d7583]/15 rounded-full blur-lg animate-pulse delay-500"></div>
        
        {/* Elementos decorativos de biblioteca */}
        <motion.div
          className="absolute top-32 left-1/4 text-[#8d7583]/20 text-4xl"
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          📚
        </motion.div>
        <motion.div
          className="absolute top-1/2 right-1/4 text-[#382a3c]/15 text-3xl"
          animate={{ 
            rotate: [0, -3, 3, 0],
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          📖
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 left-1/3 text-[#c1d43a]/20 text-2xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "linear"
          }}
        >
          ✨
        </motion.div>
      </div>

      <Helmet>
        <title>Biblioteca KUNNA - Tu Espacio de Conocimiento</title>
        <meta name="description" content="Descubre una colección cuidadosamente seleccionada de libros para tu crecimiento personal, sanación y empoderamiento." />
      </Helmet>

      {/* Contenedor cristal principal */}
      <div className="relative z-10 p-6 rounded-3xl m-4" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15))',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>

        {/* Header de la biblioteca */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="mr-4"
            >
              <Library className="w-12 h-12 text-[#8d7583]" />
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-6xl font-bold font-serif"
              style={{
                background: 'linear-gradient(135deg, #8d7583, #c8a6a6, #382a3c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 30px rgba(141, 117, 131, 0.3)'
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Biblioteca KUNNA
            </motion.h1>
          </div>
          <p className="text-xl text-[#382a3c]/80 max-w-2xl mx-auto leading-relaxed font-medium">
            Tu santuario de conocimiento y crecimiento personal. Cada libro es una puerta hacia tu transformación.
          </p>
        </motion.div>

        {/* Imagen de Biblioteca con efecto cristal - EXACTO como en otras páginas */}
        <motion.div 
          className="relative py-8 mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="relative group cursor-pointer"
            >
              <div className="relative max-w-xs">
                <img 
                  src="/images/Biblioteca.jpg" 
                  alt="Biblioteca KUNNA"
                  className="w-auto h-auto max-h-80 rounded-3xl shadow-xl group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                
                {/* Efecto de cristal */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 backdrop-blur-[0.5px] rounded-3xl border border-white/10 shadow-2xl z-10 group-hover:shadow-3xl transition-all duration-500"></div>
                
                {/* Overlay con brillo */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Efecto de luz flotante */}
                <motion.div
                  className="absolute top-4 right-4 w-4 h-4 rounded-full opacity-0 group-hover:opacity-80"
                  style={{ backgroundColor: '#8d7583' }}
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
          </div>
        </motion.div>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-4"
            >
              <BookOpen className="w-12 h-12 text-[#8d7583]" />
            </motion.div>
            <p className="text-[#382a3c]/70 text-lg">Organizando los estantes...</p>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group cursor-pointer h-full"
              >
                <div 
                  className="relative overflow-hidden rounded-2xl p-4 h-full backdrop-blur-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-500 flex flex-col min-h-[320px]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(141, 117, 131, 0.15), rgba(200, 166, 166, 0.10), rgba(245, 230, 255, 0.08))',
                  }}
                >
                  {/* Efecto de brillo en hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icono del libro */}
                    <div className="flex justify-between items-start mb-3">
                      <motion.div 
                        className="p-3 rounded-xl shadow-lg"
                        style={{ 
                          background: 'linear-gradient(135deg, #8d7583, #c8a6a6)',
                          boxShadow: '0 6px 20px rgba(141, 117, 131, 0.3)'
                        }}
                        whileHover={{ 
                          rotate: [0, -5, 5, 0],
                          scale: 1.1
                        }}
                        transition={{ duration: 0.6 }}
                      >
                        <Book className="w-6 h-6 text-white drop-shadow-lg" />
                      </motion.div>
                      
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full" style={{
                          background: 'linear-gradient(135deg, rgba(193, 212, 58, 0.2), rgba(245, 230, 255, 0.2))',
                          color: '#382a3c'
                        }}>
                          {book.categoria}
                        </span>
                      </div>
                    </div>

                    {/* Información del libro - flex-grow para empujar el botón abajo */}
                    <div className="mb-4 flex-grow">
                      <h3 className="text-lg font-bold text-[#382a3c] mb-2 group-hover:text-[#8d7583] transition-colors duration-300 leading-tight line-clamp-2">
                        {book.titulo}
                      </h3>
                      <p className="text-[#8d7583] font-medium mb-2 text-sm">
                        {book.autor}
                      </p>
                      <p className="text-[#382a3c]/70 text-xs leading-relaxed line-clamp-3">
                        {book.descripcion}
                      </p>
                    </div>

                    {/* Botón de descarga - siempre al final */}
                    <div className="mt-auto">
                      <motion.button
                        onClick={() => handleDownload(book)}
                        disabled={downloadingId === book.id}
                        className="w-full py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 text-sm"
                        style={{
                          background: downloadingId === book.id 
                            ? 'linear-gradient(135deg, #8d7583, #c8a6a6)' 
                            : 'linear-gradient(135deg, #382a3c, #263152)',
                          color: '#f5e6ff',
                          boxShadow: '0 3px 12px rgba(56, 42, 60, 0.3)'
                        }}
                        whileHover={{ 
                          boxShadow: '0 5px 18px rgba(56, 42, 60, 0.4)',
                          y: -2
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {downloadingId === book.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Descargando...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Leer Libro
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-12 rounded-3xl max-w-md mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 230, 255, 0.2), rgba(200, 166, 166, 0.1))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(245, 230, 255, 0.3)'
            }}
          >
            <Library className="w-16 h-16 text-[#8d7583] mx-auto mb-4" />
            <p className="text-[#382a3c] text-lg">Los bibliotecarios están organizando nuevos tesoros literarios.</p>
            <p className="text-[#8d7583] mt-2">¡Vuelve pronto para descubrir más!</p>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default ZinhaLibrary;