-- 🎯 TABLA DE EVIDENCIAS SOS
-- Almacena audios, videos, fotos de cada evento SOS

-- 1. Crear tabla
CREATE TABLE IF NOT EXISTS public.evidencias_sos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  acompanamiento_id uuid NOT NULL,
  user_id uuid NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('audio', 'video', 'foto', 'screenshot')),
  archivo_nombre text NOT NULL,
  archivo_path text NOT NULL, -- path en Storage
  archivo_url text, -- URL pública (signed)
  archivo_size_bytes bigint,
  duracion_segundos integer, -- solo para audio/video
  metadata jsonb, -- info adicional (resolución, codec, etc)
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT evidencias_sos_pkey PRIMARY KEY (id),
  CONSTRAINT evidencias_sos_acompanamiento_id_fkey 
    FOREIGN KEY (acompanamiento_id) 
    REFERENCES public.acompanamientos_activos(id) 
    ON DELETE CASCADE,
  CONSTRAINT evidencias_sos_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE
);

-- 2. Índices para performance
CREATE INDEX idx_evidencias_sos_acompanamiento 
  ON public.evidencias_sos(acompanamiento_id);
  
CREATE INDEX idx_evidencias_sos_user 
  ON public.evidencias_sos(user_id);
  
CREATE INDEX idx_evidencias_sos_tipo 
  ON public.evidencias_sos(tipo);

-- 3. RLS Policies
ALTER TABLE public.evidencias_sos ENABLE ROW LEVEL SECURITY;

-- Solo el dueño puede ver sus evidencias
CREATE POLICY "Usuarios ven solo sus evidencias" 
  ON public.evidencias_sos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el dueño puede insertar evidencias
CREATE POLICY "Usuarios insertan solo sus evidencias" 
  ON public.evidencias_sos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Solo el dueño puede actualizar sus evidencias
CREATE POLICY "Usuarios actualizan solo sus evidencias" 
  ON public.evidencias_sos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Solo el dueño puede eliminar sus evidencias
CREATE POLICY "Usuarios eliminan solo sus evidencias" 
  ON public.evidencias_sos
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Comentarios
COMMENT ON TABLE public.evidencias_sos 
  IS 'Almacena evidencias multimedia (audio, video, fotos) generadas durante eventos SOS';

COMMENT ON COLUMN public.evidencias_sos.tipo 
  IS 'Tipo de evidencia: audio, video, foto, screenshot';

COMMENT ON COLUMN public.evidencias_sos.archivo_path 
  IS 'Ruta en Supabase Storage: evidencias/<userId>/<acompId>/<file>';

COMMENT ON COLUMN public.evidencias_sos.archivo_url 
  IS 'URL firmada (signed URL) con expiración, no pública permanente';
