# 🔮 ZONA HOLÍSTICA KUNNA - BACKEND FUNCTION

## ✅ IMPLEMENTADO

### Netlify Function
- **Archivo:** `netlify/functions/holistico-reading.cjs`
- **Endpoint:** `https://kunna.help/.netlify/functions/holistico-reading`
- **Método:** POST

### APIs Consumidas
1. **Tarot:** https://tarotapi.dev (pública, gratuita)
2. **Numerología:** Cálculo local (número de vida)
3. **Astrología:** Cálculo local (signo zodiacal)

---

## 🔑 VARIABLES DE ENTORNO

Ya configuradas en Netlify para kunna.help:

```bash
RAPIDAPI_KEY=<configurada>
RAPIDAPI_HOST=the-numerology-api.p.rapidapi.com
```

**NO expuestas en frontend. Backend-only.**

---

## 📡 USO DE LA API

### Request
```bash
POST https://kunna.help/.netlify/functions/holistico-reading
Content-Type: application/json

{
  "fecha_nacimiento": "1990-05-15",
  "pregunta": "¿Qué me depara el futuro?" // opcional
}
```

### Response
```json
{
  "success": true,
  "fecha_consulta": "2025-12-19T22:21:24.388Z",
  "tarot": {
    "carta": "Ten of Cups",
    "significado": "Contentment, repose...",
    "descripcion": "Appearance of Cups...",
    "imagen": null
  },
  "numerologia": {
    "numero_vida": 3,
    "significado": "Tu creatividad y expresión..."
  },
  "astrologia": {
    "signo": "Tauro",
    "elemento": "Tierra"
  },
  "mensaje_kunna": "💫 Lectura Holística KUNNA\n\n🔮 **Tarot:**..."
}
```

---

## 🧪 PRUEBA LOCAL

```bash
./test-holistico-function.sh
```

---

## 📦 DESPLIEGUE

1. **Commit y push a main**
   ```bash
   git add netlify/functions/holistico-reading.cjs
   git commit -m "feat: zona holística backend function"
   git push
   ```

2. **Netlify despliega automáticamente**
   - Detecta la función en `netlify/functions/`
   - La publica en: `/.netlify/functions/holistico-reading`

3. **Variables ya están configuradas**
   - RAPIDAPI_KEY ✅
   - RAPIDAPI_HOST ✅

---

## 🎨 INTEGRACIÓN FRONTEND (PRÓXIMA FASE)

El frontend llamará:

```javascript
const response = await fetch('https://kunna.help/.netlify/functions/holistico-reading', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fecha_nacimiento: '1990-05-15',
    pregunta: '¿Qué me depara el futuro?'
  })
});

const data = await response.json();
console.log(data.mensaje_kunna);
```

---

## 🔒 SEGURIDAD

✅ Claves NUNCA en frontend
✅ APIs externas llamadas solo desde backend
✅ CORS configurado
✅ Validación de entrada

---

## 🧠 PRÓXIMOS PASOS (NO AHORA)

1. Integrar AL-E (Gemini) para mensajes personalizados
2. Conectar RapidAPI para numerología avanzada
3. UI en HolisticZone.jsx (sin tocar arquitectura)

---

**ESTADO: ✅ BACKEND LISTO - ESPERANDO DESPLIEGUE**
