# 🎯 INSTRUCCIONES P0 - Zona Holística REAL
**Fecha:** 19 dic 2025  
**Commit:** `3ecb635` - "fix: holistica real (rapidapi + ale + spanish) - P0 completo"  
**Deploy:** En curso en Netlify (2-5 min)

---

## ✅ QUÉ SE IMPLEMENTÓ (2 minutos)

### 1. Netlify Function mejorada (`holistico-reading.js`)
- ✅ RapidAPI con **health check real** (detecta 401/403/429)
- ✅ Tarot traducido a español con diccionario de 22 arcanos
- ✅ **Interpretación AL-E** (OpenAI) unificada con estructura:
  - `titulo`, `resumen`, `lectura`, `consejos`, `afirmacion`, `cierre`
- ✅ Fallback controlado (solo si `ALLOW_FALLBACK_LOCAL=1`)
- ✅ Contrato JSON consistente:
  ```json
  {
    "ok": true,
    "source": { "tarot": "tarotapi.dev", "numerologia": "rapidapi|local|none", "astrologia": "local", "ale": true },
    "tarot": { "nombre": "El Loco", "keywords": [...], "imagen": "..." },
    "numerologia": { ... },
    "astrologia": { "signo": "Tauro", "elemento": "Tierra" },
    "interpretacion": { "titulo": "...", "resumen": "...", "lectura": "...", "consejos": [], "afirmacion": "...", "cierre": "..." },
    "warnings": [],
    "timestamp": "..."
  }
  ```
- ✅ Logs limpios (NO expone keys)

### 2. Helper Frontend (`src/services/holisticoApi.js`)
- ✅ `getHolisticoReading({ fecha_nacimiento, pregunta, name })`
- ✅ Auto-detección de entorno (localhost:8888 vs kunna.help)
- ✅ `formatHolisticoReading(reading)` para UI

---

## 🔑 ENV VARS REQUERIDAS EN NETLIFY

Ve a: https://app.netlify.com/sites/kunnahelp/settings/env

**Obligatorias:**
- `RAPIDAPI_KEY` = tu key de RapidAPI
- `RAPIDAPI_HOST` = `the-numerology-api.p.rapidapi.com`

**Opcionales (para AL-E):**
- `OPENAI_API_KEY` = tu key de OpenAI
- `ALE_HOLISTICO_ENABLED` = `1` (activar AL-E)
- `ALE_HOLISTICO_MODEL` = `gpt-4o-mini` (o `gpt-4`)

**Opcional (control de fallback):**
- `ALLOW_FALLBACK_LOCAL` = `1` (permite fallback si RapidAPI falla; default: OFF)

**Opcional (tarot personalizado):**
- `TAROT_API_URL` = `https://tarotapi.dev/api/v1` (ya está por default)

---

## 🧪 CÓMO VALIDAR (AHORA MISMO)

### 1️⃣ Esperar deploy de Netlify (2-5 min)
Abre: https://app.netlify.com/sites/kunnahelp/deploys  
Espera que el deploy más reciente muestre **"Published"** ✅

### 2️⃣ Probar con curl (Mac Terminal)
```bash
curl -X POST "https://kunna.help/.netlify/functions/holistico-reading" \
  -H "Content-Type: application/json" \
  -d '{"fecha_nacimiento":"1990-05-15","pregunta":"¿Qué necesito ver hoy?"}' | jq
```

**Éxito esperado:**
```json
{
  "ok": true,
  "source": {
    "numerologia": "rapidapi"  // ← DEBE ser "rapidapi", NO "local"
  },
  "interpretacion": {
    "titulo": "...",  // ← Texto en ESPAÑOL
    "lectura": "..."  // ← Párrafos profundos
  }
}
```

**Si falla RapidAPI:**
```json
{
  "ok": true,
  "warnings": [
    { "service": "numerologia", "code": "RAPIDAPI_DOWN", "message": "..." }
  ],
  "source": { "numerologia": "none" }  // ← OK si no hay fallback
}
```

### 3️⃣ Probar en tu app (navegador)
1. Abre: http://localhost:5173/holistica
2. Completa el formulario
3. Presiona "Obtener lectura"
4. Abre **DevTools Console** (⌘+⌥+I)

**Busca en consola:**
```
[holisticoApi] Consultando: http://localhost:8888/.netlify/functions/holistico-reading
[holisticoApi] ✅ Lectura obtenida { source: { numerologia: 'rapidapi', ale: true } }
```

**Si ves errores CORS:** el deploy aún no terminó, espera 2 min más.

### 4️⃣ Validar texto en español
- ❌ NO debe aparecer: "The Fool", "New beginnings", "lucky numbers"
- ✅ SÍ debe aparecer: "El Loco", "nuevos comienzos", "Tu número de vida 3..."

---

## 🚨 SI ALGO FALLA (troubleshooting rápido)

### Error: "Failed to fetch"
- **Causa:** Deploy de Netlify aún no termina
- **Fix:** Espera 3-5 minutos, recarga página

### Error: "RapidAPI autenticación falló"
- **Causa:** `RAPIDAPI_KEY` incorrecta o no configurada
- **Fix:** Ve a Netlify → Settings → Environment variables → verifica key

### Error: Texto sigue en inglés
- **Causa:** Deploy antiguo en caché
- **Fix:** 
  1. Netlify → Deploys → "Trigger deploy" → "Clear cache and deploy"
  2. Espera 3 min, vuelve a probar

### Error: AL-E no responde
- **Causa:** `OPENAI_API_KEY` no configurada o `ALE_HOLISTICO_ENABLED` != 1
- **Fix:** La función usa interpretación básica (también en español), está OK

### Numerología dice "local" en lugar de "rapidapi"
- **Causa:** RapidAPI respondió con error (400/401/403)
- **Fix:** 
  1. Verifica `RAPIDAPI_KEY` y `RAPIDAPI_HOST` en Netlify
  2. Revisa logs de Netlify: Functions → holistico-reading → Ver log
  3. Busca: `[holistico] rapidapi status 400` ← indica qué falló

---

## 📋 QUÉ LE DICES AL SIGUIENTE CHAT/COPILOT

**Branch:** `main`  
**Commit:** `3ecb635` - "fix: holistica real (rapidapi + ale + spanish) - P0 completo"  

**Archivos modificados:**
- `netlify/functions/holistico-reading.js` (backend P0 completo)
- `src/services/holisticoApi.js` (helper frontend nuevo)

**Endpoints a probar:**
- Producción: `https://kunna.help/.netlify/functions/holistico-reading` (POST)
- Local: `http://localhost:8888/.netlify/functions/holistico-reading` (POST con `netlify dev`)

**Estado:**
- ✅ Backend: RapidAPI real + Tarot español + AL-E interpretación
- ✅ Frontend: Helper listo (SIN tocar UI de HolisticZone.jsx)
- ⏳ Deploy: En curso en Netlify (commit 3ecb635)
- 🔜 Próximo: Integrar `holisticoApi.js` en `HolisticZone.jsx` reemplazando fetch actual

**Comando de validación:**
```bash
curl -X POST "https://kunna.help/.netlify/functions/holistico-reading" \
  -H "Content-Type: application/json" \
  -d '{"fecha_nacimiento":"1990-05-15"}' | jq '.ok, .source, .interpretacion.titulo'
```

---

## 🎯 PRÓXIMO PASO (cuando deploy termine)

1. **Integrar en `HolisticZone.jsx`:**
   ```js
   import { getHolisticoReading, formatHolisticoReading } from '@/services/holisticoApi';
   
   // Reemplazar fetch actual con:
   const reading = await getHolisticoReading({ fecha_nacimiento, pregunta });
   const formatted = formatHolisticoReading(reading);
   ```

2. **Actualizar UI para mostrar:**
   - `formatted.interpretacion.titulo`
   - `formatted.interpretacion.resumen`
   - `formatted.interpretacion.lectura` (párrafos)
   - `formatted.interpretacion.consejos` (bullets)
   - `formatted.interpretacion.afirmacion`
   - `formatted.interpretacion.cierre`

3. **Mostrar warnings si existen:**
   ```js
   if (formatted.warnings.length > 0) {
     console.warn('Holística warnings:', formatted.warnings);
     // Opcional: mostrar toast al usuario
   }
   ```

---

## 📊 MÉTRICAS DE ÉXITO

- [ ] Deploy Netlify terminado (status: Published)
- [ ] `curl` devuelve `"ok": true`
- [ ] `source.numerologia` = `"rapidapi"` (o `"none"` si no hay key)
- [ ] TODO el texto en español (0 palabras en inglés)
- [ ] `interpretacion.lectura` tiene 3+ párrafos profundos
- [ ] Sin errores CORS en consola
- [ ] Tiempo respuesta < 5 segundos

---

**Creado por:** Copilot P0 Fix  
**Para:** Patty @ KUNNA  
**Duración:** 2 minutos de implementación + 3-5 min de deploy
