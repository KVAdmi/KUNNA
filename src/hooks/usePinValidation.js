import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient'; // Asegúrate que la ruta sea correcta

const usePinValidation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validatePin = useCallback(async (pin, room) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    if (!pin || !room) {
      setError("El PIN y la sala son obligatorios.");
      setIsLoading(false);
      return;
    }

    console.log(`[PIN] Attempting to validate PIN for room: ${room}`);

    try {
      const { data, error: rpcError } = await supabase.rpc('claim_moderator_pin', {
        p_pin: pin,
        p_room: room,
      });

      if (rpcError) {
        throw rpcError;
      }

      // --- ESTA ES LA LÍNEA CORREGIDA ---
      // La RPC, si tiene éxito, devuelve los datos de la fila. Si falla, lanza una excepción.
      // Por lo tanto, si 'data' existe, significa que todo salió bien.
      if (data) {
        console.log("[PIN] PIN validation successful.");
        setIsSuccess(true);
      } else {
         // Este 'else' ahora es teóricamente inalcanzable, pero lo dejamos por seguridad.
         const errorMessage = "Respuesta inesperada del servidor.";
         console.error(`[PIN] Validation failed: ${errorMessage}`);
         setError(errorMessage);
      }

    } catch (err) {
      console.error("[PIN] Server error during PIN validation:", err);
      let errorMessage = "Falla del servidor al validar el PIN. Inténtalo de nuevo más tarde.";
      if (err.message.includes("expirado")) { // Ejemplo de cómo podrías personalizar el mensaje
          errorMessage = "El PIN ha expirado.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = () => {
      setIsLoading(false);
      setError(null);
      setIsSuccess(false);
  }

  return { validatePin, isLoading, error, isSuccess, reset };
};

export default usePinValidation;

