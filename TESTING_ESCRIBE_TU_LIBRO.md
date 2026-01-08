# ✅ CHECKLIST DE TESTING - ESCRIBE TU LIBRO

## 🗄️ BASE DE DATOS

### 1. Ejecutar SQL en Supabase
- [ ] Ir a Supabase Dashboard → SQL Editor
- [ ] Copiar todo el contenido de `CREATE_ESCRIBE_TU_LIBRO_SCHEMA.sql`
- [ ] Click "Run" → Verificar sin errores
- [ ] Copiar todo el contenido de `SETUP_STORAGE_BOOKS.sql`
- [ ] Click "Run" → Verificar bucket `books` creado

### 2. Verificar tablas creadas
- [ ] Ir a Table Editor
- [ ] Verificar tablas existen:
  - [x] `books`
  - [x] `chapters`
  - [x] `chapter_versions`
  - [x] `book_publications`
  - [x] `reactions`
  - [x] `ratings`
  - [x] `ebook_orders`
  - [x] `moderation_logs`

### 3. Verificar Storage
- [ ] Ir a Storage → Buckets
- [ ] Verificar bucket `books` existe
- [ ] Verificar es público
- [ ] Crear carpeta `portadas/` manualmente (si no existe)

---

## 💻 FRONTEND

### 1. Verificar archivos creados
```bash
cd /Users/victormanuelguerraescareno/Documents/KUNNA

# Componentes nuevos
ls -la src/pages/EscribeTuLibro.jsx
ls -la src/components/escribir/ChapterEditor.jsx
ls -la src/components/escribir/BookMetadata.jsx

# Seguridad
ls -la src/components/safety/SafeScreen.jsx
ls -la src/context/StealthModeContext.jsx
```

### 2. Iniciar servidor dev
```bash
npm run dev
# O si usa Vite:
# vite
```

### 3. Navegar a la app
- [ ] Abrir `http://localhost:5173` (o puerto configurado)
- [ ] Login con cuenta de test
- [ ] Navegar a `/biblioteca`
- [ ] Verificar botón "Escribir mi libro" visible

---

## 📝 TESTING MANUAL - CREAR LIBRO

### 1. Crear nuevo libro
- [ ] Click "Escribir mi libro" desde `/biblioteca`
- [ ] Redirige a `/escribir-libro`
- [ ] Click "Nuevo Libro"
- [ ] Se abre modal de metadata
- [ ] Cambiar título a "Mi Historia de Prueba"
- [ ] Agregar descripción: "Libro de test"
- [ ] Seleccionar modo: "Anónimo"
- [ ] Click "Guardar cambios"
- [ ] Modal se cierra
- [ ] Libro aparece en lista

### 2. Agregar capítulos
- [ ] Click en el libro creado
- [ ] Vista de capítulos (vacía)
- [ ] Click "Nuevo Capítulo"
- [ ] Redirige a editor
- [ ] Cambiar título: "Capítulo 1: El inicio"
- [ ] Escribir contenido (min 50 palabras)
- [ ] Esperar 10 segundos → Ver "Guardado HH:MM"
- [ ] Verificar contador de palabras actualiza
- [ ] Click "← Volver a capítulos"
- [ ] Capítulo aparece en lista

### 3. Agregar más capítulos
- [ ] Click "Nuevo Capítulo"
- [ ] Título: "Capítulo 2: El desarrollo"
- [ ] Escribir contenido diferente (100+ palabras)
- [ ] Guardar manual con botón
- [ ] Volver
- [ ] Verificar 2 capítulos en orden

### 4. Editar metadata
- [ ] Click ícono de editar (lápiz)
- [ ] Modal se abre con datos actuales
- [ ] Cambiar modo a "Con Alias"
- [ ] Ingresar alias: "La Escritora Anónima"
- [ ] Upload de portada → Seleccionar imagen < 2MB
- [ ] Esperar upload
- [ ] Verificar preview de imagen
- [ ] Guardar cambios
- [ ] Modal se cierra

### 5. Publicar libro
- [ ] Desde vista de capítulos
- [ ] Click "Publicar en Biblioteca"
- [ ] Confirmar (si hay alert)
- [ ] Ver mensaje "✨ ¡Libro publicado en la biblioteca!"
- [ ] Estado cambia a "Publicado"

---

## 📚 TESTING - LEER EN BIBLIOTECA

### 1. Verificar en feed público
- [ ] Navegar a `/biblioteca`
- [ ] Libro aparece en grid
- [ ] Muestra: título, descripción, portada
- [ ] Badge "Publicado" verde
- [ ] Autor: "Anónimo" o alias configurado
- [ ] Estadísticas: 2 capítulos, X palabras

### 2. Leer libro (si LeerLibro.jsx existe)
- [ ] Click en el libro
- [ ] Redirige a `/leer/{bookId}`
- [ ] Muestra capítulos publicados
- [ ] Puede leer contenido completo

---

## 🔐 TESTING - SEGURIDAD

### 1. Verificar RLS
- [ ] Logout de cuenta actual
- [ ] Login con cuenta diferente (User B)
- [ ] Navegar a `/escribir-libro`
- [ ] No muestra libros de User A (solo propios)
- [ ] Navegar a `/biblioteca`
- [ ] SÍ muestra libros publicados de User A
- [ ] Logout User B, login User A

### 2. Verificar Storage
- [ ] Desde browser DevTools → Network
- [ ] Editar libro → Upload nueva portada
- [ ] Verificar request va a:
   - `{SUPABASE_URL}/storage/v1/object/books/portadas/{filename}`
- [ ] Verificar status: 200 OK
- [ ] Verificar URL pública retornada

### 3. Modo Sigilo (Stealth Mode)
- [ ] Abrir DevTools → Console
- [ ] Ejecutar: `localStorage.setItem('kunna_stealth_mode', 'true')`
- [ ] Refrescar página
- [ ] Verificar copy cambia (si implementado en UI)
- [ ] Desactivar: `localStorage.removeItem('kunna_stealth_mode')`

### 4. Quick Exit
- [ ] Navegar a `/escribir-libro`
- [ ] Presionar ESC 2 veces (en 1 segundo)
- [ ] Redirige a `/safe-screen`
- [ ] Muestra pantalla neutral
- [ ] Click "Volver" → Regresa a app

---

## 🐛 TESTING - CASOS EDGE

### 1. Auto-save con internet lento
- [ ] DevTools → Network → Throttling → "Slow 3G"
- [ ] Editar capítulo → Escribir contenido
- [ ] Esperar 10 segundos
- [ ] Verificar "Guardando..." aparece
- [ ] Esperar completar
- [ ] Verificar "Guardado HH:MM"

### 2. Upload portada muy grande
- [ ] Editar metadata
- [ ] Intentar subir imagen > 2MB
- [ ] Verificar alert: "La imagen debe ser menor a 2MB"
- [ ] No sube archivo

### 3. Upload archivo no-imagen
- [ ] Editar metadata
- [ ] Intentar subir PDF/DOCX
- [ ] Verificar alert: "Solo se permiten imágenes"
- [ ] No sube archivo

### 4. Publicar sin capítulos
- [ ] Crear libro nuevo
- [ ] NO agregar capítulos
- [ ] Click "Publicar en Biblioteca"
- [ ] Verificar alert: "Agrega al menos un capítulo antes de publicar"
- [ ] No publica

### 5. Título vacío
- [ ] Crear libro
- [ ] Editar metadata
- [ ] Borrar título (dejar vacío)
- [ ] Click "Guardar"
- [ ] Verificar alert: "El título es obligatorio"
- [ ] No guarda

### 6. Alias vacío con modo Alias
- [ ] Editar metadata
- [ ] Seleccionar "Con Alias/Seudónimo"
- [ ] Dejar campo de alias vacío
- [ ] Click "Guardar"
- [ ] Verificar alert: "Ingresa tu alias/seudónimo"
- [ ] No guarda

---

## ✅ RESULTADO ESPERADO

### Todo funcional:
- ✅ Crear libros (draft)
- ✅ Escribir capítulos (auto-save)
- ✅ Contador de palabras en tiempo real
- ✅ Tiempo de lectura calculado
- ✅ Configurar metadata (título, modo anónimo, portada)
- ✅ Upload de portada a Storage
- ✅ Publicar en biblioteca
- ✅ Ver en feed público
- ✅ RLS protege libros privados
- ✅ Libros publicados son públicos
- ✅ Modo Sigilo funciona
- ✅ Quick Exit funciona

### Problemas encontrados:
_(Documentar aquí cualquier bug/error)_

- 

---

## 📊 MÉTRICAS

- **Tiempo total de testing:** ___ minutos
- **Bugs encontrados:** ___
- **Bugs críticos:** ___
- **Features funcionando:** ___/11

---

**Fecha:** ___________  
**Tester:** ___________  
**Versión:** 1.0.0
