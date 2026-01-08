# ⚡ SETUP RÁPIDO DÍA 2 - KUNNA AL-E
**Tiempo estimado:** 10 minutos  
**Prioridad:** CRÍTICA

---

## 🎯 TAREAS CRÍTICAS OBLIGATORIAS

### ✅ TAREA 1: Ejecutar SQL de Chat Círculo (2 min)

**Archivo:** `CREATE_CIRCULO_MESSAGES_TABLE.sql`

**Pasos:**
1. Abrir Supabase Dashboard
2. Ir a **SQL Editor**
3. Copiar TODO el contenido de `CREATE_CIRCULO_MESSAGES_TABLE.sql`
4. Pegar y ejecutar
5. Verificar mensaje de éxito

**Validación:**
```sql
-- Verificar que la tabla existe
SELECT * FROM circulo_messages LIMIT 1;

-- Debería retornar sin error (aunque vacía)
```

---

### ✅ TAREA 2: Configurar Storage Bucket (5 min)

**Bucket:** `videos-sos`

**Pasos:**

1. **Crear bucket:**
   - Ir a **Storage** → **New bucket**
   - Name: `videos-sos`
   - Public: **❌ NO** (privado)
   - Click "Create bucket"

2. **Configurar políticas RLS:**
   - Click en el bucket `videos-sos`
   - Ir a **Policies**
   - Click "New policy"

**Política 1: Upload**
```sql
CREATE POLICY "Usuario puede subir su video SOS"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'videos-sos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

**Política 2: Select**
```sql
CREATE POLICY "Usuario y círculo pueden ver videos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'videos-sos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM circulos_confianza
        WHERE user_id = ((storage.foldername(name))[1])::uuid
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(miembros) AS m
          WHERE (m->>'id')::uuid = auth.uid()
        )
      )
    )
  );
```

**Validación:**
- Bucket aparece en la lista
- Policies muestran 2 políticas activas

---

### ✅ TAREA 3: Verificar Variables de Entorno (1 min)

**Archivo:** `.env`

**Verificar que existan:**
```env
# AL-E Core
VITE_ALE_CORE_BASE=https://api.al-eon.com
VITE_WORKSPACE_ID=core
VITE_DEFAULT_MODE=universal

# Supabase
VITE_SUPABASE_URL=https://wpsysctbaxbtzyebcjlb.supabase.co
VITE_SUPABASE_ANON_KEY=[tu-key]
VITE_SUPABASE_SERVICE_ROLE_KEY=[tu-key]

# APIs
VITE_RAPIDAPI_KEY=[tu-key]
VITE_GOOGLE_MAPS_API_KEY=AIzaSyAh0PS9k_Cn90yv6NIQfyZAs1UefLPPF5Q
VITE_GOOGLE_CLIENT_ID=[tu-client-id]
```

**Si falta algo:** Copiar de `.env.example`

---

### ✅ TAREA 4: Iniciar Servidor (2 min)

```bash
cd /Users/victormanuelguerraescareno/Documents/KUNNA

# Instalar dependencias (si es primera vez)
npm install

# Iniciar desarrollo
npm run dev
```

**Validación:**
- Consola muestra: `🤖 AL-E Observer iniciado`
- Consola muestra: `⏰ CheckIn Monitor iniciado`
- Sin errores en consola
- App abre en http://localhost:5173

---

## 🧪 TESTING RÁPIDO (15 min)

### Test 1: Moderación de Chat (3 min)

**Objetivo:** Verificar que AL-E bloquea contenido tóxico

**Pasos:**
1. Navegar a `/circulo`
2. Crear círculo si no existe
3. Invitar a alguien
4. Escribir mensaje normal: "Hola" → ✅ Debe aparecer
5. Escribir mensaje tóxico: "Te odio" → ❌ Debe bloquearse
6. Ver mensaje de intervención empática

**Resultado esperado:**
- Mensaje normal se envía
- Mensaje tóxico NO aparece
- Se muestra alerta de moderación

---

### Test 2: Círculo de Confianza (3 min)

**Objetivo:** Verificar estados en tiempo real

**Pasos:**
1. Navegar a `/circulo`
2. Crear círculo
3. Invitar a usuario de prueba
4. Cambiar estado en tabla `estados_usuario`:
```sql
UPDATE estados_usuario 
SET estado = 'en_riesgo' 
WHERE user_id = '[user-id-miembro]';
```
5. Ver que el estado se actualiza en UI sin refresh

**Resultado esperado:**
- Estado cambia a 🟠 "En Riesgo"
- Se actualiza sin recargar página

---

### Test 3: Salida Programada (5 min)

**Objetivo:** Verificar creación y check-ins

**Pasos:**
1. Navegar a `/salidas`
2. Click "Nueva Salida"
3. Llenar formulario:
   - Título: "Reunión de prueba"
   - Fecha: Hoy
   - Hora: En 5 minutos
   - Lugar: "Café Central"
4. Guardar
5. Esperar 5 minutos
6. Ver que aparece botón de Check-in
7. Hacer check-in

**Resultado esperado:**
- Salida se crea correctamente
- Aparece en lista de "Activas"
- Check-in se registra
- Estado cambia a "Completada"

---

### Test 4: Video SOS (4 min)

**Objetivo:** Verificar grabación y upload

**Pasos:**
1. Navegar a página principal
2. Activar botón SOS (usar PIN de prueba)
3. Permitir permisos de cámara/micrófono
4. Esperar 15 segundos (audio + video)
5. Verificar en Supabase:
```sql
SELECT * FROM evidencias_sos 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC 
LIMIT 1;
```
6. Verificar que video_url existe
7. Ir a Storage → videos-sos
8. Verificar que archivo existe

**Resultado esperado:**
- Video se graba
- Se sube a Storage
- Se registra en `evidencias_sos`
- URL es válida

---

## 📊 CHECKLIST DE VALIDACIÓN

Antes de declarar éxito, verificar:

### Base de Datos:
- [ ] Tabla `circulo_messages` existe
- [ ] Bucket `videos-sos` existe con políticas
- [ ] Todas las 10 tablas existen sin errores

### Funcionalidades:
- [ ] AL-E Observer registra eventos en `ale_events`
- [ ] Moderación bloquea contenido tóxico
- [ ] Video SOS se graba y sube
- [ ] Estados de círculo se actualizan en tiempo real
- [ ] Salidas programadas permiten check-ins

### Performance:
- [ ] Carga inicial < 3 segundos
- [ ] Moderación responde < 2 segundos
- [ ] Video upload completa < 15 segundos
- [ ] Sin errores en consola del navegador

### Seguridad:
- [ ] RLS activo en todas las tablas
- [ ] Storage bucket es privado
- [ ] No se expone SERVICE_ROLE_KEY en frontend

---

## 🚨 TROUBLESHOOTING RÁPIDO

### Error: "circulo_messages does not exist"
```bash
# Solución: Ejecutar SQL de nuevo
# Ir a Supabase SQL Editor y ejecutar CREATE_CIRCULO_MESSAGES_TABLE.sql
```

### Error: "videos-sos bucket not found"
```bash
# Solución: Crear bucket manualmente
# Supabase Dashboard → Storage → New bucket → videos-sos
```

### Error: "AL-E API no responde"
```bash
# Verificar variable de entorno
echo $VITE_ALE_CORE_BASE

# Debería ser: https://api.al-eon.com
# Si no, agregar a .env
```

### Error: "Realtime no funciona"
```sql
-- Verificar que tabla tenga Realtime habilitado
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND schemaname = 'public' 
AND tablename = 'estados_usuario';

-- Si está vacío, ejecutar:
ALTER PUBLICATION supabase_realtime ADD TABLE estados_usuario;
```

### Error: "CheckIn Monitor no inicia"
```bash
# Verificar consola del navegador
# Debería ver: "⏰ CheckIn Monitor iniciado"
# Si no aparece, verificar src/main.jsx línea 15-20
```

---

## 📈 MÉTRICAS DE ÉXITO

Al finalizar setup:

| Métrica | Objetivo | Validación |
|---------|----------|------------|
| Tablas SQL | 10/10 | `\dt` en Supabase SQL Editor |
| Storage buckets | 2/2 | Dashboard Storage |
| Servicios activos | 5/5 | Consola navegador |
| Tests pasados | 4/4 | Manual |
| Errores consola | 0 | F12 → Console |

---

## ⏭️ DESPUÉS DEL SETUP

Una vez completado:

1. **Probar flujo completo E2E** (30 min)
2. **Optimizar performance** (1 hora)
3. **Documentar para usuario** (30 min)
4. **Deploy a producción** (1 hora)

---

## 💡 TIPS

- **Usa dos navegadores:** Uno para tu usuario, otro para miembro del círculo
- **Consola siempre abierta:** F12 para ver logs de AL-E
- **SQL Editor favorito:** Guarda queries útiles en Supabase
- **Postman/Thunder Client:** Para probar API de AL-E directamente

---

**Tiempo total estimado:** 25-30 minutos  
**Después de esto:** 🟢 TODO debe funcionar

---

**Documento creado:** 7 de enero 2026  
**Última actualización:** 8 de enero 2026, 00:05 hrs  
**Estado:** ✅ LISTO PARA EJECUTAR
