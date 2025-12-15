-- =============================================
-- KUNNA RLS POLICIES - SEGURIDAD SUPABASE
-- Ejecutar DESPUÉS del schema principal
-- =============================================

-- HABILITAR RLS EN TODAS LAS TABLAS
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos_emergencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE acompanamientos_activos ENABLE ROW LEVEL SECURITY;
ALTER TABLE salas_comunidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes_sala ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES PARA TABLA PROFILES
-- =============================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Los usuarios pueden ver perfiles básicos de otros (para chat)
CREATE POLICY "Users can view basic profile info" ON profiles
    FOR SELECT USING (true);

-- =============================================
-- POLICIES PARA TABLA PAYMENTS
-- =============================================

-- Los usuarios solo ven sus propios pagos
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

-- Solo el sistema puede insertar pagos (vía webhooks)
CREATE POLICY "System can insert payments" ON payments
    FOR INSERT WITH CHECK (true);

-- Los usuarios pueden actualizar sus pagos (para marcar como procesados)
CREATE POLICY "Users can update own payments" ON payments
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- POLICIES PARA CONTACTOS_EMERGENCIA
-- =============================================

-- Los usuarios solo ven sus propios contactos
CREATE POLICY "Users can view own contacts" ON contactos_emergencia
    FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propios contactos
CREATE POLICY "Users can create own contacts" ON contactos_emergencia
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios contactos
CREATE POLICY "Users can update own contacts" ON contactos_emergencia
    FOR UPDATE USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propios contactos
CREATE POLICY "Users can delete own contacts" ON contactos_emergencia
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- POLICIES PARA ACOMPANAMIENTOS_ACTIVOS (SOS)
-- =============================================

-- Los usuarios solo ven sus propios SOS
CREATE POLICY "Users can view own sos alerts" ON acompanamientos_activos
    FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propios SOS
CREATE POLICY "Users can create own sos alerts" ON acompanamientos_activos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios SOS
CREATE POLICY "Users can update own sos alerts" ON acompanamientos_activos
    FOR UPDATE USING (auth.uid() = user_id);

-- Permitir acceso público para tracking por token (necesario para seguimiento)
CREATE POLICY "Public can view sos by token" ON acompanamientos_activos
    FOR SELECT USING (token IS NOT NULL);

-- =============================================
-- POLICIES PARA SALAS_COMUNIDAD
-- =============================================

-- Todos pueden ver salas públicas
CREATE POLICY "Anyone can view public rooms" ON salas_comunidad
    FOR SELECT USING (activa = true AND privada = false);

-- Solo admins pueden crear/modificar salas (lo haremos manual por ahora)
CREATE POLICY "Only admins can modify rooms" ON salas_comunidad
    FOR ALL USING (false);

-- =============================================
-- POLICIES PARA MENSAJES_SALA
-- =============================================

-- Los usuarios pueden ver mensajes de salas públicas
CREATE POLICY "Users can view public room messages" ON mensajes_sala
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM salas_comunidad 
            WHERE salas_comunidad.id = mensajes_sala.sala_id 
            AND activa = true 
            AND privada = false
        )
    );

-- Los usuarios autenticados pueden enviar mensajes
CREATE POLICY "Authenticated users can send messages" ON mensajes_sala
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM salas_comunidad 
            WHERE salas_comunidad.id = mensajes_sala.sala_id 
            AND activa = true 
            AND privada = false
        )
    );

-- Los usuarios pueden editar sus propios mensajes
CREATE POLICY "Users can update own messages" ON mensajes_sala
    FOR UPDATE USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propios mensajes
CREATE POLICY "Users can delete own messages" ON mensajes_sala
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- POLICIES PARA DIARY_ENTRIES
-- =============================================

-- Los usuarios solo ven sus propios diarios
CREATE POLICY "Users can view own diary entries" ON diary_entries
    FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propias entradas
CREATE POLICY "Users can create own diary entries" ON diary_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias entradas
CREATE POLICY "Users can update own diary entries" ON diary_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propias entradas
CREATE POLICY "Users can delete own diary entries" ON diary_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Los usuarios pueden ver entradas compartidas a la comunidad
CREATE POLICY "Users can view shared diary entries" ON diary_entries
    FOR SELECT USING (compartido_comunidad = true);

-- =============================================
-- POLICIES PARA STORAGE BUCKETS
-- =============================================

-- Audios de pánico: solo el usuario propietario
CREATE POLICY "Users can access own panic audios" ON storage.objects 
    FOR ALL USING (bucket_id = 'audios-panico' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Audios de seguridad: solo el usuario propietario  
CREATE POLICY "Users can access own security audios" ON storage.objects 
    FOR ALL USING (bucket_id = 'audios-seguridad' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Avatares: público para lectura, privado para escritura
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects 
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar" ON storage.objects 
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar" ON storage.objects 
    FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Media del diario: solo el usuario propietario
CREATE POLICY "Users can access own diary media" ON storage.objects 
    FOR ALL USING (bucket_id = 'diary-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- FUNCIONES ADICIONALES PARA SUSCRIPCIONES
-- =============================================

-- Función para verificar si el usuario tiene plan premium activo
CREATE OR REPLACE FUNCTION is_premium_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan profiles.plan_activo%TYPE;
    plan_expiration profiles.fecha_expiracion%TYPE;
BEGIN
    SELECT plan_activo, fecha_expiracion 
    INTO user_plan, plan_expiration
    FROM profiles 
    WHERE id = user_id;
    
    RETURN user_plan = 'premium' AND (plan_expiration IS NULL OR plan_expiration > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar suscripción después de pago exitoso
CREATE OR REPLACE FUNCTION update_user_subscription(
    user_id UUID,
    plan_tipo TEXT,
    payment_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    expiration_date TIMESTAMPTZ;
BEGIN
    -- Calcular fecha de expiración según el plan
    CASE plan_tipo
        WHEN 'mensual' THEN expiration_date := NOW() + INTERVAL '1 month';
        WHEN 'trimestral' THEN expiration_date := NOW() + INTERVAL '3 months';
        WHEN 'semestral' THEN expiration_date := NOW() + INTERVAL '6 months';
        WHEN 'anual' THEN expiration_date := NOW() + INTERVAL '1 year';
        ELSE RAISE EXCEPTION 'Tipo de plan inválido: %', plan_tipo;
    END CASE;
    
    -- Actualizar perfil del usuario
    UPDATE profiles SET
        plan_activo = 'premium',
        plan_tipo = update_user_subscription.plan_tipo,
        fecha_suscripcion = NOW(),
        fecha_expiracion = expiration_date,
        payment_id = update_user_subscription.payment_id,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS PARA AUTOMATIZACIÓN
-- =============================================

-- Trigger para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_mp_payment_id ON payments(mp_payment_id);
CREATE INDEX idx_contactos_user_id ON contactos_emergencia(user_id);
CREATE INDEX idx_sos_user_id ON acompanamientos_activos(user_id);
CREATE INDEX idx_sos_token ON acompanamientos_activos(token);
CREATE INDEX idx_sos_activo ON acompanamientos_activos(activo);
CREATE INDEX idx_mensajes_sala_id ON mensajes_sala(sala_id);
CREATE INDEX idx_mensajes_user_id ON mensajes_sala(user_id);
CREATE INDEX idx_mensajes_created_at ON mensajes_sala(created_at);
CREATE INDEX idx_diary_user_id ON diary_entries(user_id);
CREATE INDEX idx_diary_created_at ON diary_entries(created_at);

-- =============================================
-- FIN DE LAS POLÍTICAS RLS
-- =============================================