-- =============================================
-- KUNNA DATABASE SCHEMA - SUPABASE SQL
-- Ejecutar en SQL Editor de Supabase
-- =============================================

-- 1. TABLA PROFILES (usuarios y perfiles)
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT UNIQUE,
  full_name TEXT,
  foto_url TEXT,
  telefono TEXT,
  fecha_nacimiento DATE,
  genero TEXT CHECK (genero IN ('mujer', 'otro', 'prefiero_no_decir')),
  ubicacion TEXT,
  
  -- Estado de suscripción KUNNA
  plan_activo TEXT DEFAULT 'free' CHECK (plan_activo IN ('free', 'premium')),
  plan_tipo TEXT CHECK (plan_tipo IN ('mensual', 'trimestral', 'semestral', 'anual')),
  fecha_suscripcion TIMESTAMPTZ,
  fecha_expiracion TIMESTAMPTZ,
  payment_id TEXT, -- ID del pago de Mercado Pago
  
  -- Configuraciones de la app
  notificaciones_push BOOLEAN DEFAULT true,
  modo_privado BOOLEAN DEFAULT false,
  tema_oscuro BOOLEAN DEFAULT false,
  
  -- Metadatos
  profile_completed BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  primera_visita BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA PAYMENTS (historial de pagos Mercado Pago)
-- =============================================
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Datos de Mercado Pago
  mp_payment_id TEXT UNIQUE, -- ID del pago en MP
  mp_preference_id TEXT, -- ID de la preferencia
  mp_external_reference TEXT, -- referencia externa
  mp_status TEXT, -- approved, rejected, pending, etc.
  mp_status_detail TEXT,
  
  -- Datos del plan
  plan_tipo TEXT NOT NULL CHECK (plan_tipo IN ('mensual', 'trimestral', 'semestral', 'anual')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'MXN',
  
  -- Fechas
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Webhook data
  webhook_data JSONB
);

-- 3. TABLA EMERGENCY_CONTACTS (contactos de emergencia SOS)
-- =============================================
CREATE TABLE contactos_emergencia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  relacion TEXT, -- madre, hermana, pareja, amiga, etc.
  es_principal BOOLEAN DEFAULT false, -- contacto principal para SOS
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA SOS_ALERTS (historial de alertas SOS)
-- =============================================
CREATE TABLE acompanamientos_activos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL, -- token único para tracking
  
  -- Estado del SOS
  activo BOOLEAN DEFAULT true,
  tipo TEXT CHECK (tipo IN ('sos_full', 'sos_lite', 'tracking', 'panico')) DEFAULT 'sos_full',
  
  -- Ubicación y tracking
  lat_inicio DECIMAL(10,7),
  lng_inicio DECIMAL(10,7),
  lat_actual DECIMAL(10,7),
  lng_actual DECIMAL(10,7),
  ubicacion_texto TEXT,
  precision_metros INTEGER,
  
  -- Contacto alertado
  contacto_id UUID REFERENCES contactos_emergencia(id),
  contacto_notificado BOOLEAN DEFAULT false,
  
  -- Audio de evidencia
  audio_url TEXT, -- URL del audio grabado
  audio_duracion INTEGER, -- duración en segundos
  
  -- Tiempos
  inicio TIMESTAMPTZ DEFAULT NOW(),
  fin TIMESTAMPTZ,
  duracion_segundos INTEGER,
  
  -- Metadatos
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA CHAT_ROOMS (salas de comunidad)
-- =============================================
CREATE TABLE salas_comunidad (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  icono TEXT, -- emoji o icono
  color TEXT, -- color hex del tema
  
  -- Configuraciones
  activa BOOLEAN DEFAULT true,
  privada BOOLEAN DEFAULT false,
  max_usuarios INTEGER DEFAULT 50,
  
  -- Moderación
  moderada BOOLEAN DEFAULT true,
  palabras_bloqueadas TEXT[], -- array de palabras no permitidas
  
  -- URL de videollamada (legacy)
  url_videollamada TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA CHAT_MESSAGES (mensajes de salas)
-- =============================================
CREATE TABLE mensajes_sala (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sala_id UUID REFERENCES salas_comunidad(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  contenido TEXT NOT NULL,
  tipo TEXT DEFAULT 'text' CHECK (tipo IN ('text', 'image', 'audio', 'system')),
  
  -- Moderación
  editado BOOLEAN DEFAULT false,
  moderado BOOLEAN DEFAULT false,
  reportado BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA DIARY_ENTRIES (diario emocional)
-- =============================================
CREATE TABLE diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Contenido del diario
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('muy_mal', 'mal', 'neutral', 'bien', 'muy_bien')),
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
  
  -- Etiquetas y categorías
  tags TEXT[], -- array de etiquetas
  categoria TEXT, -- ansiedad, tristeza, alegría, etc.
  
  -- Configuraciones
  privado BOOLEAN DEFAULT true,
  compartido_comunidad BOOLEAN DEFAULT false,
  
  -- IA y análisis (para KUNNA Premium)
  ai_analysis JSONB, -- análisis de IA del estado emocional
  ai_suggestions JSONB, -- sugerencias de la IA
  
  -- Archivos adjuntos
  audio_url TEXT,
  image_urls TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA STORAGE BUCKETS CONFIGURATION
-- =============================================
-- Para archivos de audio del SOS, fotos de perfil, etc.

-- Bucket para audios de pánico/evidencia
INSERT INTO storage.buckets (id, name, public) VALUES 
('audios-panico', 'audios-panico', false),
('audios-seguridad', 'audios-seguridad', false),
('avatars', 'avatars', true),
('diary-media', 'diary-media', false);

-- 9. FUNCIONES ÚTILES
-- =============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contactos_emergencia 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON salas_comunidad 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON mensajes_sala 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diary_updated_at BEFORE UPDATE ON diary_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. DATOS INICIALES - SALAS DE COMUNIDAD
-- =============================================
INSERT INTO salas_comunidad (nombre, descripcion, icono, color, activa) VALUES 
('General', 'Conversación general de la comunidad KUNNA', '💬', '#8d7583', true),
('Apoyo Emocional', 'Espacio seguro para compartir y recibir apoyo', '🤗', '#c1d43a', true),
('Autocuidado', 'Tips y experiencias de bienestar personal', '✨', '#f5e6ff', true),
('Madres', 'Espacio para madres que buscan apoyo y comunidad', '👶', '#ffb3d9', true),
('Emprendedoras', 'Mujeres emprendedoras compartiendo experiencias', '💼', '#87ceeb', true);

-- =============================================
-- FIN DEL SCHEMA INICIAL DE KUNNA
-- =============================================