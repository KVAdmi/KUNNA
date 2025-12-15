import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import supabase from '@/lib/customSupabaseClient';
import TestimoniosZinha from '@/components/Zinha/TestimoniosZinha';

const ZinhaInformaPage = () => {
  const [noticias, setNoticias] = useState([]);

  useEffect(() => {
    const fetchNoticias = async () => {
      const { data, error } = await supabase
        .from('zinhanoticias')
        .select('*')
        .order('fecha', { ascending: false });
      if (!error) setNoticias(data);
    };
    fetchNoticias();
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col px-4 py-8 bg-brand-background text-brand-primary">
      <Helmet>
        <title>KUNNA Informa</title>
        <meta
          name="description"
          content="Noticias de la comunidad, premios, salud y actualizaciones especiales."
        />
      </Helmet>

      {/* Encabezado Zinha Informa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="flex justify-center items-center mb-4">
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex justify-center items-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l2.39 4.78L20 8l-4 3.89L17.17 16 12 13.27 6.83 16 8 11.89 4 8l5.61-.22L12 2z" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold font-serif">KUNNA Informa</h1>
        <p className="text-brand-secondary mt-2 max-w-xl mx-auto">
          Noticias, concursos, premios mensuales y todo lo que necesitas saber
          para mantenerte conectada con la comunidad.
        </p>
      </motion.div>

      {/* Top 3 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-12 text-center"
      >
        <h2 className="text-3xl font-bold font-serif text-brand-primary mb-4">
          Top 3 – Acumulado de Puntos
        </h2>
        <p className="text-brand-secondary mb-6 max-w-md mx-auto">
          Las 3 personas con más puntos en toda la comunidad. Participa en
          retos y actividades para ganar.
        </p>

        <div className="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto mt-10">
          {/* 1er Lugar */}
          <div
            className="bg-white p-4 rounded-xl shadow-md border-2"
            style={{ borderColor: '#c8a6a6' }}
          >
            <h3 className="text-xl font-semibold text-[#c8a6a6] flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="#c8a6a6"
                viewBox="0 0 24 24"
              >
                <path d="M5 3h14v4a5 5 0 01-5 5v2h2a1 1 0 010 2h-2v2.126a4.002 4.002 0 01-2 0V16h-2a1 1 0 010-2h2v-2a5 5 0 01-5-5V3z" />
              </svg>
              1er Lugar
            </h3>
            <p className="text-brand-secondary mt-1">Nombre Persona o Alias</p>
            <p className="text-sm text-brand-secondary">+350 puntos</p>
          </div>

          {/* 2do Lugar */}
          <div
            className="bg-white p-4 rounded-xl shadow-md border-2"
            style={{ borderColor: '#263152' }}
          >
            <h3 className="text-xl font-semibold text-[#263152] flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="#263152"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l2.39 7.26H22l-5.8 4.21 2.2 6.79L12 17.27l-6.4 3.99 2.2-6.79L2 9.26h7.61z" />
              </svg>
              2do Lugar
            </h3>
            <p className="text-brand-secondary mt-1">Nombre Persona o Alias</p>
            <p className="text-sm text-brand-secondary">+290 puntos</p>
          </div>

          {/* 3er Lugar */}
          <div
            className="bg-white p-4 rounded-xl shadow-md border-2"
            style={{ borderColor: '#c1d43a' }}
          >
            <h3 className="text-xl font-semibold text-[#c1d43a] flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="#c1d43a"
                viewBox="0 0 24 24"
              >
                <path d="M17.657 6.343a8 8 0 01-11.314 11.314M6.343 6.343a8 8 0 0111.314 11.314" />
              </svg>
              3er Lugar
            </h3>
            <p className="text-brand-secondary mt-1">Nombre Persona o Alias</p>
            <p className="text-sm text-brand-secondary">+260 puntos</p>
          </div>
        </div>
      </motion.div>

      {/* Noticias generales */}
      <div className="grid gap-6 max-w-3xl mx-auto mt-12">
        {noticias.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white p-5 rounded-xl shadow-lg border border-brand-primary/10"
          >
            <h2 className="text-2xl font-bold mb-2">{item.titulo}</h2>
            <p className="text-sm text-brand-secondary mb-2">
              {new Date(item.fecha).toLocaleDateString()}
            </p>
            <p className="text-brand-text">{item.descripcion}</p>

            {item.imagen_url && (
              <img
                src={item.imagen_url}
                alt={item.titulo}
                className="w-full h-auto mt-4 rounded-lg object-cover max-h-72"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Testimonios Zinha */}
      <TestimoniosZinha />
    </div>
  );
};

export default ZinhaInformaPage;