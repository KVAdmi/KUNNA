import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import supabase from '@/lib/customSupabaseClient';

const TestimoniosZinha = () => {
  const [testimonios, setTestimonios] = useState([]);

  useEffect(() => {
    const fetchTestimonios = async () => {
      const { data, error } = await supabase
        .from('testimonioszinhas')
        .select('*')
        .order('fecha', { ascending: false });
      if (!error) setTestimonios(data);
    };
    fetchTestimonios();
  }, []);

  return (
    <section className="max-w-6xl mx-auto mt-24 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-800">Testimonios Zinha</h2>
        <p className="text-zinc-500 mt-2 text-base max-w-xl mx-auto">
          Voces reales, momentos compartidos y experiencias que nos inspiran a seguir construyendo comunidad.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonios.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/30 backdrop-blur-md border border-white/50 rounded-2xl overflow-hidden shadow-lg hover:scale-[1.01] transition duration-300"
          >
            {/* Imagen */}
            {item.imagen_url && (
              <img
                src={item.imagen_url}
                alt={item.titulo}
                className="w-full h-48 object-cover border-b border-white/30"
              />
            )}

            <div className="p-5 text-white">
              {/* Burbuja tipo */}
              <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 text-xs rounded-full uppercase tracking-wide font-semibold mb-2 shadow-sm">
                {item.tipo}
              </span>

              <h4 className="text-xl font-semibold leading-snug">{item.titulo}</h4>

              {item.autor && (
                <p className="text-sm text-white/70 italic mt-1">por {item.autor}</p>
              )}

              <p className="text-sm mt-2 text-white/90 line-clamp-4">{item.descripcion}</p>

              {/* Link video si es tipo video */}
              {item.tipo === 'video' && item.video_url && (
                <a
                  href={item.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-3 text-sm underline text-white/90 hover:text-white"
                >
                  Ver video completo
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TestimoniosZinha;