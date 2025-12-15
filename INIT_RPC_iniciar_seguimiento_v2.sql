-- 🎯 RPC FUNCTION PARA INICIAR SEGUIMIENTO

-- Primero eliminamos la función existente
DROP FUNCTION IF EXISTS iniciar_seguimiento_tiempo_real_v2(UUID, TEXT, TEXT);

-- Ahora creamos la nueva función
CREATE FUNCTION iniciar_seguimiento_tiempo_real_v2(
    p_user_id UUID,
    p_destino TEXT,
    p_contacto_emergencia TEXT
)
RETURNS TABLE (
    id UUID,
    token TEXT,
    url_seguimiento TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_nuevo_id UUID;
    v_nuevo_token TEXT;
BEGIN
    -- Generar token único
    v_nuevo_token := 'track_' || encode(gen_random_bytes(12), 'hex');
    
    -- Insertar nuevo registro
    INSERT INTO acompanamientos_activos (
        user_id,
        token,
        destino,
        contacto_emergencia,
        activo,
        inicio
    ) VALUES (
        p_user_id,
        v_nuevo_token,
        p_destino,
        p_contacto_emergencia,
        true,
        NOW()
    )
    RETURNING id INTO v_nuevo_id;

    -- Retornar datos necesarios
    RETURN QUERY
    WITH tracking_data AS (
        SELECT 
            v_nuevo_id AS id,
            v_nuevo_token AS token,
            'https://tracking.kunna.help/' || v_nuevo_token AS url_seguimiento
    )
    SELECT * FROM tracking_data;
END;
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION iniciar_seguimiento_tiempo_real_v2(UUID, TEXT, TEXT) TO authenticated;

-- Comentario
COMMENT ON FUNCTION iniciar_seguimiento_tiempo_real_v2(UUID, TEXT, TEXT)
IS 'Inicia una nueva sesión de seguimiento en tiempo real y devuelve el ID, token y URL';
