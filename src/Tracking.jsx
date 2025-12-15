<p>Latitud: {position?.lat}</p>
<p>Longitud: {position?.lng}</p>

useEffect(() => {
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      setPosition({ lat: latitude, lng: longitude });
      actualizarUbicacionEnSupabase(latitude, longitude); // Función para actualizar en Supabase
    },
    (error) => console.error("Error obteniendo ubicación:", error),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}, []);