import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ChevronRight, Loader2, Video } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '@/lib/customSupabaseClient'

// Estilos para animación de gradiente
const gradientAnimation = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = gradientAnimation;
  document.head.appendChild(style);
}

const ChatRooms = () => {
  const { toast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState({});
  const [videoStatus, setVideoStatus] = useState({});

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('salas_comunidad')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error de conexión',
          description: error.message,
        });
      } else {
        setRooms(data);
      }
      setLoading(false);
    };

    fetchRooms();
  }, [toast]);

  useEffect(() => {
    const channel = supabase
      .channel('sala-presencia')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'salas_comunidad' },
        async () => {
          const { data } = await supabase.from('salas_comunidad').select('*');
          const status = {};
          const count = {};
          data.forEach((sala) => {
            status[sala.id] = sala.esta_activa || false; // ← asegúrate que ese campo exista
            count[sala.id] = sala.total_conectadas || 0; // ← ajusta al nombre real del campo
          });
          setVideoStatus(status);
          setParticipants(count);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      {/* Background atmosférico similar a otras páginas */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8f6f4] via-[#faf9f7] to-[#f5f3f1]"></div>
      
      {/* Efectos flotantes de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-[#c8a6a6]/15 to-[#8d7583]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-32 h-32 bg-gradient-to-br from-[#f5e6ff]/20 to-[#c1d43a]/10 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/4 w-36 h-36 bg-gradient-to-br from-[#382a3c]/10 to-[#263152]/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-4 pb-24">
        <Helmet>
          <title>Salas de Chat - Comunidad KUNNA</title>
        </Helmet>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 max-w-4xl mx-auto"
        >
          {/* Imagen de Chat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative group cursor-pointer mb-8 flex justify-center"
          >
            <div className="relative max-w-xs">
              <img 
                src="/images/Chat.jpg" 
                alt="Círculos de Confianza"
                className="w-auto h-auto max-h-80 rounded-3xl shadow-xl group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            </div>
          </motion.div>

          <div className="mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-6 tracking-wide leading-tight">
                <span 
                  className="bg-gradient-to-r from-[#382a3c] via-[#8d7583] to-[#c8a6a6] bg-clip-text text-transparent"
                  style={{
                    backgroundSize: '200% 200%',
                    animation: 'gradient 6s ease infinite'
                  }}
                >
                  Círculos de
                </span>
                <br />
                <span 
                  className="bg-gradient-to-r from-[#c8a6a6] via-[#c1d43a] to-[#8d7583] bg-clip-text text-transparent"
                  style={{
                    backgroundSize: '200% 200%',
                    animation: 'gradient 6s ease infinite 1s'
                  }}
                >
                  Confianza
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-[#8d7583] leading-relaxed mb-6 font-medium tracking-wide">
                Espacios seguros para compartir, sanar y crecer
              </p>
            </motion.div>
            
            {/* Mensaje acogedor */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-[#c8a6a6]/20"
            >
              {/* Efecto de brillo sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <p className="text-[#382a3c] font-bold text-xl mb-3 tracking-wide">
                  Nunca estás sola
                </p>
                <p className="text-[#8d7583] leading-relaxed text-lg">
                  Siempre encontrarás compañeras dispuestas a escuchar, compartir experiencias y acompañarte en tu camino. 
                  Cada sala es un refugio de comprensión y apoyo mutuo.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#c8a6a6]/30 border-t-[#c8a6a6] rounded-full mb-4"
          />
          <p className="text-[#8d7583] font-medium">Cargando espacios de conexión...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {rooms.map((room, i) => (
            <motion.div 
              key={room.id} 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Link 
                to={`/comunidad/sala/${room.id}`} 
                className="relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 h-[380px] flex flex-col"
                style={{
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 246, 244, 0.9) 100%)',
                  border: '1px solid rgba(200, 166, 166, 0.2)',
                }}
              >
                {/* Efecto de brillo sutil en hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div 
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      background: 'linear-gradient(145deg, rgba(193, 212, 58, 0.05), rgba(200, 166, 166, 0.08))',
                    }}
                  ></div>
                </div>

                <div className="relative z-10 flex flex-col h-full p-6">
                  {/* Header con icono de categoría */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {/* Icono de categoría estilo biblioteca */}
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
                        style={{ 
                          background: `linear-gradient(135deg, ${
                            i % 4 === 0 ? '#c8a6a6, #f5e6ff' :
                            i % 4 === 1 ? '#c1d43a, #f5e6ff' :
                            i % 4 === 2 ? '#8d7583, #f5e6ff' :
                            '#382a3c, #8d7583'
                          })`,
                        }}
                      >
                        <span className="text-white font-bold text-lg">💬</span>
                      </div>
                      
                      {/* Indicador de estado elegante */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${(participants[room.id] || 0) > 0 ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                        <span className="text-xs text-gray-500 font-medium">
                          {(participants[room.id] || 0) > 0 ? 'Activa' : 'Disponible'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Categoría y título */}
                  <div className="mb-4">
                    <div className="mb-2">
                      <span 
                        className="text-xs font-bold tracking-wider uppercase"
                        style={{ 
                          color: i % 4 === 0 ? '#c8a6a6' :
                                 i % 4 === 1 ? '#c1d43a' :
                                 i % 4 === 2 ? '#8d7583' :
                                 '#382a3c'
                        }}
                      >
                        Círculo de Confianza
                      </span>
                    </div>
                    <h3 className="font-bold text-xl leading-tight mb-3" style={{ color: '#382a3c' }}>
                      {room.nombre}
                    </h3>
                  </div>
                  
                  {/* Descripción elegante */}
                  <div className="flex-1 mb-6">
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {room.descripcion}
                    </p>
                  </div>
                  
                  {/* Botón elegante estilo biblioteca */}
                  <div className="mt-auto">
                    <motion.div 
                      className="w-full py-4 px-6 rounded-2xl font-bold text-white text-center shadow-lg hover:shadow-xl transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #c8a6a6 0%, #8d7583 100%)',
                      }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm tracking-wide">Entrar al Chat</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default ChatRooms;

