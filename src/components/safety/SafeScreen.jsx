import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SafeScreen - Pantalla neutra sin contenido sensible
 * 
 * Se muestra al presionar Quick Exit
 * Apariencia de una app de productividad genérica
 * Sin términos sensibles, sin contexto de seguridad
 */
export default function SafeScreen() {
  const navigate = useNavigate();

  const handleReturn = () => {
    // Volver a home sin reemplazar historial esta vez
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header neutro */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            <span className="text-lg font-semibold text-gray-800">
              Mis Notas
            </span>
          </div>
          
          <button
            onClick={handleReturn}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Volver"
          >
            <svg 
              className="w-5 h-5 text-gray-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Contenido neutro (app de notas/productividad falsa) */}
      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        {/* Lista de "notas" genéricas */}
        <div className="space-y-3">
          {[
            { title: 'Lista de compras', date: 'Hace 2 horas' },
            { title: 'Ideas para proyecto', date: 'Ayer' },
            { title: 'Recordatorios', date: 'Hace 3 días' },
            { title: 'Notas de reunión', date: 'Hace 1 semana' }
          ].map((note, index) => (
            <div 
              key={index}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
            >
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {note.title}
              </h3>
              <p className="text-xs text-gray-500">
                {note.date}
              </p>
            </div>
          ))}
        </div>

        {/* Mensaje discreto para el usuario (solo visible internamente) */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Esta es una pantalla neutra. Puedes volver cuando sea seguro.
          </p>
          <button
            onClick={handleReturn}
            className="mt-3 w-full py-2 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Volver a la app
          </button>
        </div>
      </main>

      {/* Footer neutro */}
      <footer className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-gray-500">
          <span>© 2025 Mis Notas</span>
          <span>v1.0</span>
        </div>
      </footer>
    </div>
  );
}

/**
 * SafeScreenSimple - Versión ultra simple (solo botón de regreso)
 * Para casos donde se necesita el mínimo de UI
 */
export function SafeScreenSimple() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4" />
        <h1 className="text-xl font-medium text-gray-800 mb-2">
          Bienvenida
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Toca aquí para continuar
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
