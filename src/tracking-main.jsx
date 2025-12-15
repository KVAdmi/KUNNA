import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 20.6597, lng: -103.3496 }; // Guadalajara
const MAP_OPTIONS = {
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true
};

const TrackingApp = () => {
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  const obtenerSeguimientoPorToken = async (token) => {
    const response = await fetch(
      'https://gptwzuqmuvzttajgjrry.supabase.co/rest/v1/rpc/obtener_seguimiento_por_token_v2',
      {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdHd6dXFtdXZ6dHRhamdqcnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDU1NzAsImV4cCI6MjA2ODA4MTU3MH0.AAbVhdrI7LmSPKKRX0JhSkYxVg7VOw-ccizKTOh7pV8',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdHd6dXFtdXZ6dHRhamdqcnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDU1NzAsImV4cCI6MjA2ODA4MTU3MH0.AAbVhdrI7LmSPKKRX0JhSkYxVg7VOw-ccizKTOh7pV8',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_token: token
        })
      }
    );
    if (!response.ok) {
      throw new Error('Error al obtener los datos del token');
    }
    const data = await response.json();
    console.log('DATA DEL TOKEN', data);
    return data[0]; // esto te debe dar latitud, longitud, etc.
  };


  useEffect(() => {
    const inicializarMapa = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
          setError('Token de seguimiento no proporcionado en la URL.');
          return;
        }
        const data = await obtenerSeguimientoPorToken(token);

        if (data && data.latitud && data.longitud) {
          const position = { lat: parseFloat(data.latitud), lng: parseFloat(data.longitud) };
          setTrackingData(data);
          setCurrentPosition(position);
          setMapCenter(position);
        } else {
          setError('No se encontraron datos de ubicación válidos para el token.');
        }
      } catch (err) {
        setError(err.message);
      }
    };

    inicializarMapa();
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!trackingData) return <p>Cargando mapa y ubicación...</p>;

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white p-4 text-center">
        <img src="/images/logo.png" alt="Zinha Logo" className="mx-auto mb-2" style={{ maxWidth: '150px' }} />
        <h1 className="text-2xl font-bold">Plataforma Seguridad Zinha</h1>
      </header>

      <main className="flex-1 grid grid-cols-3 gap-4 p-4">
        <section className="col-span-1 bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold">Datos del Tracking</h2>
          <p>Latitud: {currentPosition?.lat}</p>
          <p>Longitud: {currentPosition?.lng}</p>
          <p>Hora: {new Date(trackingData?.ultima_actualizacion).toLocaleTimeString()}</p>
        </section>

        <section className="col-span-2 bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold">Ubicación Actual</h2>
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '400px' }}
              center={mapCenter}
              zoom={16}
              options={MAP_OPTIONS}
            >
              {currentPosition && <Marker position={currentPosition} label="Ubicación" />}
            </GoogleMap>
          </LoadScript>
        </section>
      </main>

      <footer className="bg-gray-200 p-4 text-center">
        <p className="legal-text">El seguimiento implementado en esta plataforma es confidencial y cumple estándares de cifrado militar.</p>
      </footer>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<TrackingApp />);

console.log("✅ Cargando tracking-main.jsx");
console.log("🧠 YA ESTOY EN TRACKING-MAIN.JSX");

