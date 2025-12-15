# 🎧 SALAS OFICIALES DE LA COMUNIDAD KUNNA

## Resumen

Se han creado las **5 salas temáticas oficiales** de KUNNA, cada una diseñada como refugio emocional con identidad clara y enfoque concreto.

---

## 📋 Las 5 Salas Creadas

### 1. 🌫️ **Gritos Ahogados**
- **Tema:** Desahogo profundo y catarsis
- **Descripción:** Espacio íntimo para soltar lo guardado por años, sin juicio
- **Color:** `#8d7583` (Rosa grisáceo)
- **Categoría:** Catarsis

### 2. 🌙 **Solas Pero No**
- **Tema:** Soledad y acompañamiento
- **Descripción:** Para vacío emocional, noches pesadas, soledad acompañada
- **Color:** `#382a3c` (Púrpura nocturno)
- **Categoría:** Conexión

### 3. 🪞 **Autoduda**
- **Tema:** Autoconcepto y reconstrucción
- **Descripción:** Hablar de inseguridades, comparación, sentirse "insuficiente"
- **Color:** `#c8a6a6` (Rosa empolvado)
- **Categoría:** Autoestima

### 4. 🕊️ **Cicatrices Suaves**
- **Tema:** Sanación de heridas emocionales
- **Descripción:** Sanar relaciones que dolieron, trauma, vínculos rotos
- **Color:** `#b8a8c8` (Lavanda sanadora)
- **Categoría:** Sanación

### 5. ✨ **Renacer**
- **Tema:** Crecimiento y transformación
- **Descripción:** Nuevos hábitos, celebrar avances, micro-victorias
- **Color:** `#c1d43a` (Verde lima brillante)
- **Categoría:** Crecimiento

---

## 🛠️ Archivos Creados

### 1. `INSERT_SALAS_OFICIALES_KUNNA.sql`
**Archivo SQL para insertar las salas en la base de datos.**

**Ubicación:** `/Users/pg/Documents/KUNNA/INSERT_SALAS_OFICIALES_KUNNA.sql`

**Cómo usar:**
1. Abre Supabase SQL Editor
2. Copia y pega el contenido del archivo
3. Ejecuta el script
4. Las 5 salas se insertarán en la tabla `salas_comunidad`

**Contenido del INSERT:**
- ✅ Nombre, descripción, icono, color
- ✅ Configuración: activa=true, privada=false, max_usuarios=50
- ✅ Moderación activada por defecto
- ✅ Query de verificación incluida

---

### 2. `src/constants/salasKunna.js`
**Referencia JavaScript de las salas (opcional).**

**Ubicación:** `/Users/pg/Documents/KUNNA/src/constants/salasKunna.js`

**Uso:**
```javascript
import { SALAS_KUNNA_OFICIAL, getSalaBySlug } from '@/constants/salasKunna';

// Obtener todas las salas
console.log(SALAS_KUNNA_OFICIAL);

// Buscar una sala específica
const autoduda = getSalaBySlug('autoduda');
```

**Funciones incluidas:**
- `getSalaBySlug(slug)` - Buscar sala por slug
- `getSalasByCategoria(categoria)` - Filtrar por categoría
- `isSalaOficial(nombre)` - Validar si es sala oficial
- `CATEGORIAS_SALAS` - Objeto con metadatos de categorías

---

## 📦 Implementación Paso a Paso

### Paso 1: Ejecutar el SQL
```sql
-- En Supabase SQL Editor:
-- Copiar y ejecutar: INSERT_SALAS_OFICIALES_KUNNA.sql
```

### Paso 2: Verificar Inserción
```sql
SELECT nombre, descripcion, icono, color 
FROM public.salas_comunidad 
ORDER BY created_at DESC;
```

### Paso 3: Verificar en la App
1. Navegar a `/comunidad/salas`
2. Deberías ver las 5 salas con:
   - Nombres correctos
   - Iconos emojis
   - Descripciones completas
   - Colores diferenciados

---

## 🎨 Diseño Visual

La página `ChatRooms.jsx` ya está lista para mostrar las salas con:
- ✅ Cards elegantes con glassmorphism
- ✅ Gradientes animados en títulos
- ✅ Iconos de categoría
- ✅ Indicadores de estado (activa/disponible)
- ✅ Botones de entrada estilizados

**No se modificó ninguna lógica de routing ni mensajes** - solo se agregó el catálogo de salas.

---

## 🔒 Configuración de Seguridad

Todas las salas tienen:
- ✅ **Activa:** `true` (visible y funcional)
- ✅ **Privada:** `false` (acceso público para la comunidad)
- ✅ **Max usuarios:** 50 (límite razonable)
- ✅ **Moderada:** `true` (protección contra spam/abuso)

---

## 🧪 Testing

### Verificar Funcionamiento:
1. **Lista de salas:** Ir a `/comunidad/salas` → Ver las 5 salas
2. **Entrar a sala:** Click en "Entrar al Chat" → Debe abrir `/comunidad/sala/:id`
3. **Enviar mensaje:** Escribir y enviar → Debe guardarse en `mensajes_sala`
4. **Real-time:** Abrir en dos ventanas → Mensajes en tiempo real

---

## 📝 Notas Importantes

### ✅ Lo que SÍ se modificó:
- Se creó el SQL para insertar las 5 salas oficiales
- Se creó referencia JavaScript opcional para el frontend
- Se documentó la identidad de cada sala

### ❌ Lo que NO se tocó:
- Arquitectura del sistema de chat
- Rutas de navegación (`/comunidad/sala/:id`)
- Lógica de mensajes en `ChatRoomPageSimple.jsx`
- Sistema de real-time subscriptions
- Tabla `usuarios_sala` o `mensajes_sala`

### 🎯 Resultado:
Un catálogo profesional de 5 salas temáticas listas para usar, cada una con propósito emocional claro y diseño coherente con la marca KUNNA.

---

## 🚀 Próximos Pasos Opcionales

Si quieres expandir funcionalidad:

1. **Agregar columna `categoria`:**
```sql
ALTER TABLE salas_comunidad ADD COLUMN categoria TEXT;
UPDATE salas_comunidad SET categoria = 'catarsis' WHERE nombre = 'Gritos Ahogados';
-- etc...
```

2. **Filtros por categoría en UI:**
```jsx
// En ChatRooms.jsx
const [categoriaFiltro, setCategoriaFiltro] = useState(null);
const salasFiltradas = categoriaFiltro 
  ? rooms.filter(r => r.categoria === categoriaFiltro) 
  : rooms;
```

3. **Estadísticas de salas:**
```sql
SELECT 
  s.nombre,
  COUNT(DISTINCT m.user_id) as usuarios_unicos,
  COUNT(m.id) as total_mensajes
FROM salas_comunidad s
LEFT JOIN mensajes_sala m ON m.sala_id = s.id
GROUP BY s.id, s.nombre;
```

---

## 🆘 Soporte

Si las salas no aparecen:
1. Verificar que el SQL se ejecutó sin errores
2. Revisar permisos RLS en Supabase
3. Confirmar que `ChatRooms.jsx` hace `.from('salas_comunidad').select('*')`
4. Ver console del navegador para errores de Supabase

---

**Creado con ❤️ para la Comunidad KUNNA**  
*Círculos de Confianza - Espacios seguros para sanar y crecer*
