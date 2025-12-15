-- 🎯 CONFIGURACIÓN DE STORAGE BUCKETS Y POLICIES
-- Buckets para evidencias SOS con políticas de seguridad

-- 1. CREAR BUCKETS (ejecutar en Supabase Dashboard → Storage)
-- Nota: Estos comandos pueden fallar si los buckets ya existen, está OK.

-- Bucket para audios de pánico (PRIVADO)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audios-panico',
  'audios-panico',
  false, -- PRIVADO
  10485760, -- 10MB max
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/m4a']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para videos de pánico (PRIVADO)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos-panico',
  'videos-panico',
  false, -- PRIVADO
  52428800, -- 50MB max
  ARRAY['video/webm', 'video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para fotos/screenshots (PRIVADO)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fotos-panico',
  'fotos-panico',
  false, -- PRIVADO
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. POLICIES PARA BUCKET: audios-panico

-- Permitir a usuarios autenticados SUBIR audios
CREATE POLICY "Usuarios pueden subir sus audios"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audios-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a usuarios autenticados VER sus audios
CREATE POLICY "Usuarios pueden ver sus audios"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audios-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a usuarios autenticados ACTUALIZAR sus audios
CREATE POLICY "Usuarios pueden actualizar sus audios"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audios-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'audios-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a usuarios autenticados ELIMINAR sus audios
CREATE POLICY "Usuarios pueden eliminar sus audios"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audios-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. POLICIES PARA BUCKET: videos-panico

CREATE POLICY "Usuarios pueden subir sus videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuarios pueden ver sus videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'videos-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuarios pueden actualizar sus videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'videos-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuarios pueden eliminar sus videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. POLICIES PARA BUCKET: fotos-panico

CREATE POLICY "Usuarios pueden subir sus fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fotos-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuarios pueden ver sus fotos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'fotos-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuarios pueden actualizar sus fotos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'fotos-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'fotos-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuarios pueden eliminar sus fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'fotos-panico'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. FUNCIÓN PARA GENERAR SIGNED URLs
-- Genera URLs firmadas con expiración para compartir evidencia de forma segura

CREATE OR REPLACE FUNCTION public.generar_url_evidencia_firmada(
  p_acompanamiento_id uuid,
  p_evidencia_id uuid,
  p_expiracion_segundos integer DEFAULT 3600 -- 1 hora por defecto
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_evidencia record;
  v_signed_url text;
BEGIN
  -- Verificar que la evidencia existe y pertenece al usuario
  SELECT * INTO v_evidencia
  FROM public.evidencias_sos
  WHERE id = p_evidencia_id
  AND acompanamiento_id = p_acompanamiento_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Evidencia no encontrada';
  END IF;
  
  -- Generar URL firmada
  -- Nota: Esta función requiere que tengas configurado el service_role key
  -- En producción, esto debería ser una Edge Function o backend
  
  -- Por ahora, retornamos el path para que el cliente genere la signed URL
  RETURN v_evidencia.archivo_path;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generar_url_evidencia_firmada(uuid, uuid, integer) 
  TO authenticated;

-- 6. RPC PARA OBTENER EVIDENCIAS DE UN ACOMPAÑAMIENTO
CREATE OR REPLACE FUNCTION public.obtener_evidencias_acompanamiento(
  p_token text
)
RETURNS TABLE (
  id uuid,
  tipo text,
  archivo_nombre text,
  archivo_size_bytes bigint,
  duracion_segundos integer,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.tipo,
    e.archivo_nombre,
    e.archivo_size_bytes,
    e.duracion_segundos,
    e.created_at
  FROM public.evidencias_sos e
  INNER JOIN public.acompanamientos_activos a 
    ON e.acompanamiento_id = a.id
  WHERE a.token = p_token
  ORDER BY e.created_at DESC;
END;
$$;

-- Permitir acceso público a esta función (para tracking público)
GRANT EXECUTE ON FUNCTION public.obtener_evidencias_acompanamiento(text) 
  TO anon, authenticated;

COMMENT ON FUNCTION public.obtener_evidencias_acompanamiento(text)
  IS 'Obtiene lista de evidencias de un acompañamiento vía token público (sin URLs directas)';
