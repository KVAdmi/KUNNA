// trackingViewer.js
// Este archivo gestiona la visualización del tracking en tiempo real.

import { supabase } from './lib/supabaseClient.js';
console.log('trackingViewer.js cargado');

let subscription = null;

function mostrarEstadoSeguimiento(seguimiento) {
  const statusText = document.getElementById('statusText');
  if (!seguimiento.activo) {
    statusText.textContent = 'Seguimiento finalizado';
  } else {
    statusText.textContent = 'Seguimiento activo';
  }
}

function updateMap(seguimiento) {
  // Aquí deberías actualizar el marcador en el mapa con latitud_actual y longitud_actual
  // Ejemplo:
  if (window.updateMapPosition) {
    window.updateMapPosition(seguimiento.latitud_actual, seguimiento.longitud_actual);
  }
}

async function initializeRealtimeTracking(token) {
  if (subscription) {
    subscription.unsubscribe();
  }
  subscription = supabase
    .channel(`tracking_${token}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'acompanamientos_activos',
      filter: `token=eq.${token}`,
    }, (payload) => {
      if (payload.new) {
        updateTrackingInfo(payload.new);
        mostrarEstadoSeguimiento(payload.new);
        updateMap(payload.new);
      }
    })
    .subscribe();

  // Cargar datos iniciales
  const seguimiento = await getTrackingData(token);
  if (seguimiento) {
    updateTrackingInfo(seguimiento);
    mostrarEstadoSeguimiento(seguimiento);
    updateMap(seguimiento);
  }
}

function updateTrackingInfo(seguimiento) {
  const updateElement = (id, value, formatter = null) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value !== null && value !== undefined && value !== '' ? 
        (formatter ? formatter(value) : value) : '--';
    }
  };
  const formatCoord = (coord) => {
    const num = parseFloat(coord);
    return !isNaN(num) ? num.toFixed(6) : '--';
  };
  updateElement('latitudInicial', seguimiento.latitud_inicial, formatCoord);
  updateElement('longitudInicial', seguimiento.longitud_inicial, formatCoord);
  updateElement('latitudFinal', seguimiento.latitud_final, formatCoord);
  updateElement('longitudFinal', seguimiento.longitud_final, formatCoord);
}

window.initializeRealtimeTracking = initializeRealtimeTracking;

window.updateTrackingInfo = updateTrackingInfo;

export async function getTrackingData(token) {
  const { data, error } = await window.supabase
    .from('acompanamientos_activos')
    .select('*')
    .eq('token', token)
    .single();
  if (error) {
    console.error('Error obteniendo datos de tracking:', error);
    return null;
  }
  return data;
}

// Inicializar el tracking en tiempo real si hay token en la URL
document.addEventListener('DOMContentLoaded', () => {
  const url = new URL(window.location.href);
  const token = url.searchParams.get('token');
  if (token) {
    initializeRealtimeTracking(token);
  }
});
