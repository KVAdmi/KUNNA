-- Verificar si la función obtener_seguimiento_por_token_v2 funciona correctamente
DO $$
BEGIN
    -- Llamar a la función con un token de prueba
    PERFORM obtener_seguimiento_por_token_v2('track_XXXXX');
    RAISE NOTICE 'Función ejecutada correctamente';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error al ejecutar la función: %', SQLERRM;
END $$;
