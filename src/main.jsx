// src/main.jsx - VERSIÓN CORREGIDA Y FINAL

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/SupabaseAuthContext.jsx';
import App from './App.jsx';
import './index.css';
import aleObserver from './services/aleObserver.js';
import checkInMonitorService from './services/checkInMonitorService.js';

// Obtenemos el elemento raíz del DOM
const rootElement = document.getElementById('root');

// Inicializar AL-E Observer (comienza a capturar eventos)
aleObserver.init('system-init');
console.log('🤖 AL-E Observer iniciado');

// Inicializar monitor de check-ins (solo en producción o cuando hay usuario)
// Se activará automáticamente cuando el usuario haga login
if (typeof window !== 'undefined') {
  // Esperar a que AuthProvider esté listo
  setTimeout(() => {
    checkInMonitorService.iniciar();
    console.log('⏰ CheckIn Monitor iniciado');
  }, 2000);
}

// Creamos el root de React
const root = ReactDOM.createRoot(rootElement);

// Renderizamos la aplicación
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);