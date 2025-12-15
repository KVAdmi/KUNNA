// src/main.jsx - VERSIÓN CORREGIDA Y FINAL

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/SupabaseAuthContext.jsx';
import App from './App.jsx';
import './index.css';

// Obtenemos el elemento raíz del DOM
const rootElement = document.getElementById('root');

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