import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light/20 via-white to-brand-light/20 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <img 
            src="/images/logo_kunna.png" 
            alt="KUNNA Logo" 
            className="w-32 h-32 mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ¡Bienvenid{user?.gender === 'female' ? 'a' : 'o'} a KUNNA!
          </h1>
          <p className="text-lg text-gray-600">
            Bienestar + seguridad + acompañamiento para mujeres
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
