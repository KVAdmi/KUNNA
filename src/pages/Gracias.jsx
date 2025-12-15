import React from 'react';
import { useNavigate } from 'react-router-dom';

const GraciasPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8efff] text-center px-6 py-10">
      <img
        src="/images/logo_kunna.png"
        alt="KUNNA"
        className="w-20 h-20 mb-4 opacity-80"
      />

      <h1 className="text-3xl font-semibold text-[#5c336e] mb-4">
        🌷 Gracias por ser parte de KUNNA
      </h1>

      <p className="text-[#6d4d7b] text-base max-w-md mb-6">
        Tu espacio está aquí cuando lo necesites. <br />
        Puedes volver cuando quieras, con calma y en tu tiempo.
      </p>

      <button
        onClick={() => navigate('/')}
        className="bg-[#c1d43a] hover:bg-[#b5c730] text-white font-medium py-2 px-6 rounded-full shadow-md transition"
      >
        Volver al Inicio
      </button>
    </div>
  );
};

export default GraciasPage;
