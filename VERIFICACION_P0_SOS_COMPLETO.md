# ✅ VERIFICACIÓN P0 SOS - SISTEMA COMPLETO

## 🎯 CHECKLIST DE VERIFICACIÓN

### 1️⃣ BASE DE DATOS (Supabase SQL Editor)

Ejecutar este SQL para verificar que todo está creado:

```sql
-- Verificar tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'evidencias_sos',
  'acompanamientos_puntos',
  'acompanamientos_activos'
);

-- Verificar funciones RPC existen
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'iniciar_seguimiento_tiempo_real_v2',
  'obtener_seguimiento_por_token_v2',
  'obtener_evidencias_acompanamiento',
  'generar_url_evidencia_firmada'
);

-- Verificar buckets de storage existen
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id IN (
  'audios-panico',
  'videos-panico',
  'fotos-panico'
);

-- Verificar policies de storage existen
SELECT policyname, tablename 
FROM pg_policies 
WHERE schemaname = 'storage';
```

**✅ Resultado esperado:**
- 3 tablas encontradas
- 4 funciones RPC encontradas
- 3 buckets encontrados
- 12+ policies encontradas (4 por bucket)

---

### 2️⃣ CÓDIGO JAVASCRIPT (Ya deployado)

**Archivos actualizados:**
- ✅ `src/hooks/useEmergencyActionsExtended.js` - Audio + evidencias
- ✅ `src/lib/preciseLocationService.js` - GPS points + polyline
- ✅ `src/pages/PublicTracking.jsx` - Visualización polyline
- ✅ `src/config/tracking.js` - URLs centralizadas

**Variables globales en uso:**
- `window.__currentTrackingToken` - Token de seguimiento
- `window.__currentAcompId` - ID de acompañamiento para evidencias

---

### 3️⃣ FLUJO COMPLETO DE SOS (Prueba Manual)

#### Paso 1: Activar SOS desde la app
1. Login en la app (kunna.help)
2. Ir a "Seguridad" → Click en botón SOS
3. Esperar confirmación "Acompañamiento activo"

#### Paso 2: Verificar tracking
1. Se abre automáticamente nueva pestaña con URL: `https://tracking.kunna.help/track_XXXXX`
2. Debe mostrarse:
   - ✅ Estado: "🟢 EN VIVO"
   - ✅ Mapa con ubicación actual
   - ✅ Coordenadas GPS visibles
   - ✅ Última actualización timestamp

#### Paso 3: Verificar grabación de audio
**En consola del navegador (F12):**
```
[SOS] Grabación de audio iniciada automáticamente
[AUDIO] Grabación iniciada
🎙️ Grabando 15 segundos...
✅ Grabación guardada
[SOS] ✅ Audio registrado en evidencias_sos
```

#### Paso 4: Verificar GPS tracking
**En consola del navegador:**
```
[BG-TASK] Nueva ubicación: {latitude: X, longitude: Y}
[SUPABASE] Ubicación actualizada
[POLYLINE] ✅ Punto GPS guardado
```

**En el mapa público (tracking.kunna.help/track_XXX):**
- El marcador debe moverse cada 3 segundos
- Debe dibujarse una línea (polyline) mostrando la ruta

#### Paso 5: Verificar base de datos
```sql
-- Ver evidencias de audio guardadas
SELECT 
  id,
  tipo,
  archivo_nombre,
  archivo_size_bytes,
  duracion_segundos,
  created_at
FROM evidencias_sos
ORDER BY created_at DESC
LIMIT 5;

-- Ver puntos GPS guardados
SELECT 
  latitud,
  longitud,
  precision_metros,
  recorded_at
FROM acompanamientos_puntos
ORDER BY recorded_at DESC
LIMIT 10;

-- Ver acompañamientos activos
SELECT 
  token,
  activo,
  tipo,
  latitud_actual,
  longitud_actual,
  inicio,
  fin
FROM acompanamientos_activos
ORDER BY inicio DESC
LIMIT 5;
```

---

### 4️⃣ PRUEBAS DE SEGURIDAD

#### Test 1: Storage privado
```javascript
// En consola del navegador (F12) en tracking.kunna.help/track_XXX
const { data, error } = await supabase
  .from('evidencias_sos')
  .select('*')
  .limit(1);

console.log('Evidencias:', data, 'Error:', error);
```

**✅ Resultado esperado:** 
- Solo debe mostrar evidencias del usuario autenticado
- Usuarios anónimos NO deben ver URLs directas

#### Test 2: RPC público funciona
```javascript
// En consola del navegador en tracking.kunna.help/track_XXX
const token = window.location.pathname.split('/').pop();
const { data, error } = await supabase
  .rpc('obtener_evidencias_acompanamiento', { p_token: token });

console.log('Evidencias públicas:', data);
```

**✅ Resultado esperado:**
- Lista de evidencias sin URLs (por seguridad)
- Metadata: tipo, tamaño, duración

---

### 5️⃣ VERIFICACIÓN DE POLYLINE EN VIVO

1. Activar SOS desde móvil/laptop
2. **Caminar 50 metros** mientras el tracking está activo
3. Abrir URL pública en otra pestaña
4. **Verificar:**
   - ✅ Línea verde se va dibujando en tiempo real
   - ✅ Marcador sigue tu ubicación
   - ✅ Cada 3 segundos hay actualización

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: No se graba audio
**Síntoma:** Console muestra "Error de micrófono"
**Solución:** 
- Verificar permisos del navegador (Chrome: candado → Configuración del sitio)
- Verificar que HTTPS está activo (audio solo funciona en HTTPS)

### Problema 2: Polyline no se dibuja
**Síntoma:** Solo se ve marcador, no línea
**Causa:** Menos de 2 puntos GPS guardados
**Solución:** Esperar 6+ segundos para que se guarden al menos 2 puntos

### Problema 3: Tracking no se actualiza en vivo
**Síntoma:** Mapa público no muestra cambios
**Causa:** Realtime subscription no conectada
**Solución:** 
```javascript
// Verificar en consola de tracking.kunna.help/track_XXX
console.log('Channel ref:', channelRef.current);
// Debe mostrar: RealtimeChannel {topic: "tracking:track_XXXXX", ...}
```

### Problema 4: Error al subir audio a Storage
**Síntoma:** "Error al subir audio"
**Causa:** Bucket policy bloqueando
**Solución:** Verificar que el path tenga formato: `userId/acompId/audio_timestamp.webm`

---

## 📊 MÉTRICAS DE ÉXITO P0

| Métrica | Meta | Verificar |
|---------|------|-----------|
| Audio grabado automáticamente | Cada 15 segundos | ✅ Console logs + DB |
| GPS actualizado | Cada 3 segundos | ✅ Polyline en mapa |
| Latencia de tracking | < 5 segundos | ✅ Timestamp en UI |
| Precisión GPS | < 50 metros | ✅ Campo `precision_metros` |
| Evidencias guardadas en DB | 100% de audios | ✅ Query `evidencias_sos` |
| Polyline visible | Después de 6+ segundos | ✅ Línea verde en mapa |

---

## ✅ DEFINICIÓN DE DONE (P0)

- [x] Tabla `evidencias_sos` creada
- [x] Tabla `acompanamientos_puntos` creada
- [x] Storage buckets creados (audios-panico, videos-panico, fotos-panico)
- [x] Storage policies configuradas (RLS privado)
- [x] RPC `obtener_evidencias_acompanamiento()` creado
- [x] RPC `generar_url_evidencia_firmada()` creado
- [x] Audio se graba automáticamente al activar SOS
- [x] Audio metadata se guarda en `evidencias_sos`
- [x] GPS points se insertan cada 3 segundos
- [x] Polyline se dibuja en tracking público
- [x] Build exitoso sin errores
- [x] Deploy en producción (Netlify)

---

## 🚀 PRÓXIMOS PASOS (P1 - Opcional)

1. **Video recording** - Misma lógica que audio pero con cámara
2. **UI de evidencias** - Mostrar lista de audios en tracking público
3. **Signed URLs** - Generar URLs firmadas para compartir audios de forma segura
4. **"Última vez visto"** - Indicador cuando GPS deja de actualizarse
5. **Siri Shortcut** - Activar SOS por voz en iOS
6. **Android Tile** - Widget de acceso rápido en Android

---

## 📝 NOTAS TÉCNICAS

### Audio Recording Flow:
```
toggleCompanionship() 
  → setIsFollowing(true)
  → startRecordingAudio()
    → MediaRecorder.start()
    → Timer 15s
    → MediaRecorder.stop()
    → Upload to Storage (audios-panico)
    → INSERT INTO evidencias_sos
    → Toast "Grabación guardada"
```

### GPS Tracking Flow:
```
startBackgroundTaskWatch()
  → setInterval(updateLocation, 3000)
    → getCurrentPosition()
    → UPDATE acompanamientos_activos
    → INSERT INTO acompanamientos_puntos
    → Realtime broadcast
    → PublicTracking updates polyline
```

### Storage Structure:
```
audios-panico/
  └── {userId}/
      └── {acompId}/
          ├── audio_1734291234567.webm
          ├── audio_1734291249567.webm
          └── audio_1734291264567.webm
```

---

**FIN DE VERIFICACIÓN P0 SOS** 🎯
