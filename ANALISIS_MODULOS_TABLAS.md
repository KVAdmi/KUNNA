# 📊 ANÁLISIS COMPLETO DE MÓDULOS Y TABLAS REQUERIDAS - KUNNA

## 🎯 RESUMEN EJECUTIVO

**Tablas que EXISTEN:** ✅
1. `profiles` - Usuarios
2. `contactos_emergencia` - Contactos SOS
3. `acompanamientos_activos` - Tracking SOS
4. `salas_comunidad` - Salas de chat
5. `mensajes_sala` - Mensajes del chat
6. `usuarios_sala` - Tracking de usuarios en salas
7. `diary_entries` - Diario emocional
8. `payments` - Pagos Mercado Pago

**Tabla que FALTA:** ❌
- `agenda_personal` - **NO EXISTE** (pero se usa en PersonalAgendaPage.jsx)

---

## 📱 MÓDULOS DE LA APP Y SUS TABLAS

### 1. 🏠 **HOME / INICIO**
**Archivos:** `HomePage.jsx`, `HomePageNew.jsx`
**Tablas necesarias:** 
- ✅ `profiles` (datos del usuario)
- ✅ `acompanamientos_activos` (estado SOS)

---

### 2. 🛡️ **SEGURIDAD / SOS**
**Archivos:** `SecurityModule.jsx`, `SOSPage.jsx`, `Tracking.jsx`
**Tablas necesarias:**
- ✅ `contactos_emergencia` (contactos de emergencia)
- ✅ `acompanamientos_activos` (alertas activas, tracking GPS)
- ✅ `profiles` (datos del usuario)

**Funcionalidades:**
- Botón pánico inmediato
- Tracking GPS en tiempo real
- Notificación a contactos
- Grabación de audio de evidencia
- Historial de alertas

---

### 3. 👥 **COMUNIDAD / CHAT**
**Archivos:** `CommunityModule.jsx`, `ChatRooms.jsx`, `ChatRoomPageSimple.jsx`, `ChatRoomPage.jsx`
**Tablas necesarias:**
- ✅ `salas_comunidad` (lista de salas)
- ✅ `mensajes_sala` (mensajes del chat)
- ✅ `usuarios_sala` (quién está en qué sala)
- ✅ `profiles` (perfiles de usuarios)

**Funcionalidades:**
- 5 salas temáticas (Gritos Ahogados, Solas Pero No, Autoduda, Cicatrices Suaves, Renacer)
- Chat en tiempo real con Supabase Realtime
- Tracking de usuarios activos
- Moderación de mensajes

---

### 4. 📖 **DIARIO EMOCIONAL**
**Archivos:** `EmotionalJournal.jsx`
**Tablas necesarias:**
- ✅ `diary_entries` (entradas del diario)
- ✅ `profiles` (usuario propietario)

**Funcionalidades:**
- Escribir entradas diarias
- Seleccionar estado de ánimo (mood)
- Calendario de emociones
- Análisis IA (premium)
- Tags y categorías
- Compartir a comunidad (opcional)
- Adjuntar audio/imágenes

**Campos de `diary_entries`:**
```sql
- title TEXT
- content TEXT
- mood TEXT (muy_mal, mal, neutral, bien, muy_bien)
- mood_score INTEGER (1-5)
- tags TEXT[]
- categoria TEXT
- privado BOOLEAN
- compartido_comunidad BOOLEAN
- ai_analysis JSONB
- ai_suggestions JSONB
- audio_url TEXT
- image_urls TEXT[]
```

---

### 5. 📅 **AGENDA PERSONAL**
**Archivos:** `PersonalAgendaPage.jsx`
**Tablas necesarias:**
- ❌ **`agenda_personal`** - **NO EXISTE EN LA BD**
- ✅ `profiles` (usuario propietario)

**Funcionalidades actuales en el código:**
- Calendario visual
- Crear eventos con título, descripción, fecha, hora
- Recordatorios/notificaciones
- Editar y eliminar eventos
- Vista de eventos del día

**ESTRUCTURA REQUERIDA (basado en el código):**
```sql
CREATE TABLE agenda_personal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  notificar BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 6. 💖 **BIENESTAR / SALUD**
**Archivos:** `HealthModule.jsx`, `MenstrualCycleCalculator.jsx`
**Tablas necesarias:**
- ✅ `profiles` (datos del usuario)
- ⚠️ **Usa `localStorage`** (no está en BD)

**Funcionalidades:**
- Calculadora de ciclo menstrual
- Agenda cíclica
- Recordatorio de citas médicas
- Medicamentos y dosis

**NOTA:** Actualmente usa `localStorage`, debería migrar a BD:
- `healthAppointments` → tabla `citas_medicas`
- `healthMedications` → tabla `medicamentos`

---

### 7. ✨ **HOLÍSTICA**
**Archivos:** `HolisticZone.jsx`
**Tablas necesarias:**
- ✅ `profiles`
- 🔮 Contenido estático (meditaciones, yoga, etc)

---

### 8. 💼 **EMPRENDE EN CASA**
**Archivos:** `EmprendeEnCasa.jsx`
**Tablas necesarias:**
- ✅ `profiles`
- 📚 Contenido educativo estático

---

### 9. 📚 **BIBLIOTECA KUNNA**
**Archivos:** `ZinhaLibrary.jsx`, `PodcastPage.jsx`, `SupportDirectoryPage.jsx`
**Tablas necesarias:**
- ✅ `profiles`
- 📚 Contenido estático (libros, podcasts, recursos)

---

### 10. 👤 **PERFIL DE USUARIO**
**Archivos:** `ProfilePage.jsx`, `CompleteProfilePage.jsx`
**Tablas necesarias:**
- ✅ `profiles` (todos los datos del usuario)
- ✅ `payments` (historial de suscripciones)

**Funcionalidades:**
- Foto de perfil
- Datos personales (nombre, email, teléfono)
- Fecha de nacimiento, género, ubicación
- Plan activo (free/premium)
- Configuraciones (notificaciones, privacidad, tema)
- Onboarding

---

### 11. 💳 **PAGOS / SUSCRIPCIONES**
**Archivos:** `PaymentPage.jsx`, `SubscriptionPage.jsx`
**Tablas necesarias:**
- ✅ `payments` (historial de pagos Mercado Pago)
- ✅ `profiles` (plan_activo, fecha_expiracion)

---

## ⚠️ ACCIÓN REQUERIDA INMEDIATA

### 1. **CREAR TABLA `agenda_personal`**
La página `PersonalAgendaPage.jsx` está intentando leer/escribir de una tabla que NO EXISTE.

**SQL a ejecutar:**
```sql
CREATE TABLE agenda_personal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  notificar BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE agenda_personal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
ON agenda_personal FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own events"
ON agenda_personal FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
ON agenda_personal FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
ON agenda_personal FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_agenda_updated_at
BEFORE UPDATE ON agenda_personal
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índice para performance
CREATE INDEX idx_agenda_user_fecha ON agenda_personal(user_id, fecha);
```

---

### 2. **MIGRAR SALUD DE `localStorage` A BD** (Opcional - Futuro)
Crear tablas:
- `citas_medicas` (doctor, especialidad, fecha, hora)
- `medicamentos` (nombre, dosis, frecuencia, próxima_toma)
- `ciclo_menstrual` (fecha_inicio, duración, síntomas)

---

## 📊 ESTADO FINAL DE TABLAS

| Tabla | Estado | Módulo que la usa |
|-------|--------|-------------------|
| `profiles` | ✅ Existe | Todos los módulos |
| `contactos_emergencia` | ✅ Existe | SOS/Seguridad |
| `acompanamientos_activos` | ✅ Existe | SOS/Tracking |
| `salas_comunidad` | ✅ Existe | Comunidad/Chat |
| `mensajes_sala` | ✅ Existe | Comunidad/Chat |
| `usuarios_sala` | ✅ Existe | Comunidad/Chat |
| `diary_entries` | ✅ Existe | Diario Emocional |
| `payments` | ✅ Existe | Pagos/Suscripciones |
| **`agenda_personal`** | ❌ **FALTA** | **Agenda Personal** |
| `citas_medicas` | ⚠️ Opcional | Bienestar (usa localStorage) |
| `medicamentos` | ⚠️ Opcional | Bienestar (usa localStorage) |

---

## ✅ CONCLUSIÓN

**TODO FUNCIONA EXCEPTO:**
- ❌ **Agenda Personal** - La tabla `agenda_personal` NO EXISTE y la página intenta usarla

**SIGUIENTE PASO:**
Ejecutar el SQL de creación de `agenda_personal` en Supabase.

---

**Fecha de análisis:** 10 de diciembre 2025  
**Proyecto:** KUNNA - Plataforma de bienestar para mujeres
