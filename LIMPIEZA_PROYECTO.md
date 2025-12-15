# 🧹 LIMPIEZA DEL PROYECTO KUNNA

## 🗑️ ARCHIVOS A ELIMINAR (BASURA)

### Archivos de Prueba Gemini (8 archivos)
- gemini-pro-test.js
- gemini-rest-test.cjs
- gemini-test.cjs
- gemini-test.js
- gemini.env
- geminiClient.js
- test-gemini-server.js
- testGemini.js

### Archivos Debug/Test HTML (8 archivos)
- debug-geolocation.html
- debug-rpc-test.html
- debug-supabase-test.html
- debug-token.html
- test-supabase.html
- test-tracking.html
- tracking_backup_working.html
- tracking_fixed.html

### Archivos HTML de Animaciones Kunna Eye (4 archivos)
- kunna_eye_blink.html
- kunna_mask_blink.html
- kunna_pulse.html
- kunna_ultra_blink.html

### SQLs Obsoletos/Duplicados (10 archivos)
- FIX_RLS_CHAT_POLICIES.sql (ya aplicado)
- FIX_RPC_COMPLETA.sql (obsoleto)
- FIX_RPC_FINAL_WORKING.sql (obsoleto)
- FIX_RPC_obtener_seguimiento_por_token_v2.sql (duplicado)
- FIX_SALAS_KUNNA_ACTUALIZAR.sql (ya aplicado)
- RESTAURAR_SALAS_ORIGINALES.sql (backup viejo)
- DIAGNOSTICO_CHAT.sql (debug temporal)

### Documentación Obsoleta (2 archivos)
- HELP_REQUEST.md (request viejo de Zinha)
- ANALISIS_MODULOS_TABLAS.md (ya revisado, info en README)
- SALAS_OFICIALES_README.md (duplica INSERT_SALAS_OFICIALES_KUNNA.sql)

### Scripts y Configs Viejos
- fix-jitsi-server.sh (Jitsi se va a eliminar)
- gen-passwords.sh (no se usa)
- jwt-generator-backend.ts (TypeScript suelto)
- api-seguimiento-endpoint.js (ejemplo viejo)
- docker-compose.yml (no se usa Docker)

### Archivos Root de Tracking Viejos
- tracking.html (hay versión en public/)
- index.html (duplicado en root, el real está en dist/)

### Carpetas Completas a Eliminar
- decompressedTemplate/ (templates descomprimidos)
- Biblioteca/ (¿qué es esto?)
- config-jitsi/ (Jitsi se elimina)
- pages/ (¿estructura vieja?)
- plugins/ (¿qué plugins?)
- api-example/ (ejemplos que no se usan)
- tools/ (revisar contenido primero)

---

## ✅ ARCHIVOS A MANTENER Y ORGANIZAR

### SQLs Importantes (mover a sql/)
- KUNNA_DATABASE_SCHEMA.sql ✅
- KUNNA_RLS_POLICIES.sql ✅
- CREATE_AGENDA_PERSONAL_TABLE.sql ✅
- INSERT_SALAS_OFICIALES_KUNNA.sql ✅
- ADD_USUARIOS_SALA_TABLE.sql ✅
- ENABLE_REALTIME_CHAT.sql ✅
- CREATE_RPC_obtener_seguimiento_por_token_v2.sql ✅
- INIT_RPC_iniciar_seguimiento_v2.sql ✅
- KUNNA_FIX_PROFILE.sql (si aún se necesita)

### Documentación Útil
- README_SUSCRIPCIONES.md ✅
- SETUP_TRACKING_KUNNA.md ✅
- INTEGRACION_PLANES_EJEMPLO.jsx ✅

### Configs Esenciales
- package.json
- vite.config.js
- tailwind.config.js
- postcss.config.js
- capacitor.config.ts
- netlify.toml
- .gitignore
- .env (y variantes)

### Carpetas Esenciales
- src/ (código fuente)
- public/ (assets públicos)
- android/ (build Android)
- ios/ (build iOS)
- netlify/ (functions)
- backend/ (si tiene API)
- scripts/ (scripts de build)
- resources/ (recursos Capacitor)
- dist/ (build output)
- node_modules/

---

## 📁 ESTRUCTURA PROPUESTA DESPUÉS DE LIMPIEZA

```
KUNNA/
├── .env
├── package.json
├── vite.config.js
├── tailwind.config.js
├── capacitor.config.ts
├── netlify.toml
│
├── src/                    # Código fuente
├── public/                 # Assets públicos
├── android/                # Build Android
├── ios/                    # Build iOS
│
├── sql/                    # ⭐ NUEVA: SQLs organizados
│   ├── schema/
│   │   ├── database-schema.sql
│   │   └── rls-policies.sql
│   ├── tables/
│   │   ├── agenda_personal.sql
│   │   └── usuarios_sala.sql
│   ├── functions/
│   │   ├── rpc_obtener_seguimiento.sql
│   │   └── rpc_iniciar_seguimiento.sql
│   └── data/
│       └── insert_salas_oficiales.sql
│
├── docs/                   # ⭐ NUEVA: Documentación
│   ├── README_SUSCRIPCIONES.md
│   ├── SETUP_TRACKING.md
│   └── INTEGRACION_PLANES.md
│
├── netlify/
│   └── functions/
├── backend/
├── scripts/
└── resources/
```

---

## 🚀 PLAN DE ACCIÓN

### FASE 1: Eliminar Archivos de Prueba/Debug (SEGURO)
✅ Archivos Gemini (8)
✅ HTMLs debug (8)
✅ HTMLs animaciones eye (4)
✅ Scripts obsoletos (5)

**TOTAL: 25 archivos seguros para eliminar**

### FASE 2: Organizar SQLs
- Crear carpeta `sql/` con subcarpetas
- Mover SQLs importantes allí
- Eliminar SQLs obsoletos/duplicados (7)

### FASE 3: Limpiar Carpetas
- Eliminar `decompressedTemplate/`
- Eliminar `Biblioteca/` (si vacía)
- Eliminar `config-jitsi/`
- Revisar `pages/`, `plugins/`, `api-example/`, `tools/`

### FASE 4: Organizar Docs
- Crear carpeta `docs/`
- Mover MDs útiles allí
- Eliminar MDs obsoletos

---

## ⚠️ PRECAUCIONES

NO TOCAR:
- node_modules/
- dist/
- .git/
- src/
- public/ (revisar tracking.html)
- android/
- ios/
- netlify/
- backend/ (revisar si tiene código)

REVISAR ANTES DE BORRAR:
- tools/ (puede tener scripts útiles)
- pages/ (¿estructura vieja de Next?)
- plugins/ (¿extensiones VS Code?)
- supabase/ (¿configs locales?)

---

¿Procedo con la limpieza? Empiezo eliminando los 25 archivos seguros de la Fase 1.
