-- 🎯 TABLA DE PUNTOS DE RUTA (POLYLINE)
-- Almacena cada punto GPS del tracking para dibujar la ruta completa

-- 1. Crear tabla
CREATE TABLE IF NOT EXISTS public.acompanamientos_puntos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  acompanamiento_id uuid NOT NULL,
  latitud numeric(10, 7) NOT NULL,
  longitud numeric(10, 7) NOT NULL,
  precision_metros integer,
  altitud_metros numeric(8, 2),
  velocidad_mps numeric(6, 2), -- metros por segundo
  rumbo_grados integer CHECK (rumbo_grados >= 0 AND rumbo_grados <= 360),
  bateria_porcentaje integer CHECK (bateria_porcentaje >= 0 AND bateria_porcentaje <= 100),
  en_movimiento boolean DEFAULT true,
  proveedor text, -- 'gps', 'network', 'fused'
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT acompanamientos_puntos_pkey PRIMARY KEY (id),
  CONSTRAINT acompanamientos_puntos_acompanamiento_id_fkey 
    FOREIGN KEY (acompanamiento_id) 
    REFERENCES public.acompanamientos_activos(id) 
    ON DELETE CASCADE
);

-- 2. Índices para performance
CREATE INDEX idx_puntos_acompanamiento 
  ON public.acompanamientos_puntos(acompanamiento_id);
  
CREATE INDEX idx_puntos_recorded_at 
  ON public.acompanamientos_puntos(recorded_at DESC);
  
CREATE INDEX idx_puntos_acomp_recorded 
  ON public.acompanamientos_puntos(acompanamiento_id, recorded_at DESC);

-- 3. RLS Policies
ALTER TABLE public.acompanamientos_puntos ENABLE ROW LEVEL SECURITY;

-- Los puntos son PÚBLICOS (cualquiera con el token puede verlos vía RPC)
-- Pero solo el sistema puede insertarlos
CREATE POLICY "Puntos visibles por token público" 
  ON public.acompanamientos_puntos
  FOR SELECT
  USING (true); -- Públicos vía RPC

-- Solo usuarios autenticados pueden insertar puntos (desde la app)
CREATE POLICY "Solo usuarios autenticados insertan puntos" 
  ON public.acompanamientos_puntos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.acompanamientos_activos
      WHERE id = acompanamiento_id
      AND user_id = auth.uid()
    )
  );

-- 4. Función para limpiar puntos antiguos (opcional, para optimización)
CREATE OR REPLACE FUNCTION public.limpiar_puntos_antiguos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Eliminar puntos de acompañamientos finalizados hace más de 30 días
  DELETE FROM public.acompanamientos_puntos
  WHERE acompanamiento_id IN (
    SELECT id FROM public.acompanamientos_activos
    WHERE activo = false
    AND fin < (NOW() - INTERVAL '30 days')
  );
END;
$$;

-- 5. Comentarios
COMMENT ON TABLE public.acompanamientos_puntos 
  IS 'Puntos GPS individuales para dibujar polyline de ruta en tiempo real';

COMMENT ON COLUMN public.acompanamientos_puntos.velocidad_mps 
  IS 'Velocidad en metros por segundo (m/s)';

COMMENT ON COLUMN public.acompanamientos_puntos.rumbo_grados 
  IS 'Dirección de movimiento en grados (0-360)';

COMMENT ON COLUMN public.acompanamientos_puntos.proveedor 
  IS 'Proveedor de ubicación: gps, network, fused';
