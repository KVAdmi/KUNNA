import { supabase } from '../lib/customSupabaseClient';

export const enviarAlertaPanico = async (user, contactos) => {
  if (!user || !contactos || contactos.length === 0) {
    alert("No se pudo enviar la alerta. Revisa que tengas contactos registrados.");
    return;
  }

  const location = await obtenerUbicacion();

  const { error } = await supabase.from("alertas_panico").insert({
    user_id: user.id,
    ubicacion: location ? `POINT(${location.longitude} ${location.latitude})` : null,
  });

  if (error) {
    alert("No se pudo guardar la alerta.");
    return;
  }

  const googleMapsUrl = location
    ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    : 'Ubicación no disponible';

  const primerContacto = contactos[0];
  const telefono = primerContacto.telefono.replace(/\D/g, ''); // elimina espacios, guiones, etc.

  const mensaje = encodeURIComponent(
    `🚨 Necesito ayuda. Esta es una alerta. Estoy en peligro.\nMi ubicación es:\n${googleMapsUrl}`
  );

  window.open(`https://wa.me/52${telefono}?text=${mensaje}`, "_blank");

  alert("🔴 Alerta enviada. Estamos contigo.");
};

const obtenerUbicacion = () => {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        resolve({ latitude, longitude });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
};
