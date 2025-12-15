-- 🎯 RPC FUNCTION QUE EXTRAE COORDENADAS DEL JSONB
-- Ejecutar este SQL en Supabase Dashboard > SQL Editor

-- 1. ELIMINAR LA FUNCIÓN EXISTENTE
DROP FUNCTION IF EXISTS obtener_seguimiento_por_token_v2(TEXT);

-- 2. CREAR LA FUNCIÓN QUE FUNCIONA CON LOS DATOS REALES
CREATE OR REPLACE FUNCTION obtener_seguimiento_por_token_v2(p_token TEXT)
RETURNS TABLE(
    id UUID,
    token TEXT,
    user_id UUID,
    latitud_actual DECIMAL(10,8),
    longitud_actual DECIMAL(11,8),
    ubicacion_actual JSONB,
    activo BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    precision_metros INTEGER,
    destino TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log para debugging
    RAISE NOTICE 'Buscando seguimiento con token: %', p_token;
    
    -- Buscar en acompanamientos_activos y EXTRAER coordenadas del JSONB
    RETURN QUERY
    SELECT 
        a.id,
        a.token,
        a.user_id,
        -- ✅ EXTRAER LATITUD del JSONB ubicacion_actual
        CASE 
            WHEN a.latitud_actual IS NOT NULL THEN a.latitud_actual
            WHEN a.ubicacion_actual ? 'coordinates' THEN 
                (a.ubicacion_actual->'coordinates'->>1)::DECIMAL(10,8)
            ELSE NULL
        END as latitud_actual,
        -- ✅ EXTRAER LONGITUD del JSONB ubicacion_actual  
        CASE 
            WHEN a.longitud_actual IS NOT NULL THEN a.longitud_actual
            WHEN a.ubicacion_actual ? 'coordinates' THEN 
                (a.ubicacion_actual->'coordinates'->>0)::DECIMAL(11,8)
            ELSE NULL
        END as longitud_actual,
        a.ubicacion_actual,
        a.activo,
        a.created_at,
        a.updated_at,
        a.precision_metros,
        a.destino
    FROM acompanamientos_activos a
    WHERE a.token = p_token
    AND a.activo = true
    ORDER BY a.updated_at DESC
    LIMIT 1;
    
    -- Log del resultado
    IF NOT FOUND THEN
        RAISE NOTICE 'No se encontró seguimiento activo para token: %', p_token;
    ELSE
        RAISE NOTICE 'Seguimiento encontrado para token: %', p_token;
    END IF;
    
END;
$$;

-- ✅ PERMISOS PARA USUARIOS ANÓNIMOS (EMERGENCIAS)
GRANT EXECUTE ON FUNCTION obtener_seguimiento_por_token_v2(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION obtener_seguimiento_por_token_v2(TEXT) TO authenticated;

-- ✅ COMENTARIO
COMMENT ON FUNCTION obtener_seguimiento_por_token_v2(TEXT) 
IS 'Obtiene datos de seguimiento en tiempo real por token - EXTRAE coordenadas del JSONB ubicacion_actual';
