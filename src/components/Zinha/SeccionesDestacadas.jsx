import React from 'react';
import { motion } from 'framer-motion';

const TITULOS_CATEGORIAS = {
  mundo: 'Mundo',
  emprendimiento: 'Emprendimiento',
  salud: 'Salud',
  vida: 'Vida',
};

const SeccionesDestacadas = ({ noticias = [] }) => {
  const categorias = ['mundo', 'emprendimiento', 'salud', 'vida'];

  return (
    <section className="max-w-6xl mx-auto mt-20 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-800">Secciones Destacadas</h2>
        <p className="text-zinc-500 mt-2 text-base max-w-xl mx-auto">
          Una selección intencional de los temas que marcan el pulso de nuestra comunidad. Información que inspira, mueve y transforma.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {categorias.map((cat) => {
          const noticia = noticias.find((n) => n.categoria === cat);
          if (!noticia) return null;

          return (
            <motion.div
              key={noticia.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-zinc-100"
            >
              {noticia.imagen_url && (
                <img
                  src={noticia.imagen_url}
                  alt={noticia.titulo}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5">
                <h3 className="text-sm uppercase font-medium text-zinc-400 tracking-wide mb-1">
                  {TITULOS_CATEGORIAS[cat]}
                </h3>
                <h4 className="text-xl font-semibold text-zinc-800 leading-tight mb-2">
                  {noticia.titulo}
                </h4>
                <p className="text-sm text-zinc-500 mb-2">
                  {new Date(noticia.fecha).toLocaleDateString()}
                </p>
                <p className="text-sm text-zinc-700 line-clamp-4">
                  {noticia.descripcion}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default SeccionesDestacadas;
