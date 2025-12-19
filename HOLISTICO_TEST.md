# 🔮 Test Zona Holística KUNNA

## 1. VERIFICAR VARIABLES (Backend)

```bash
# En backend/.env deben estar:
RAPIDAPI_KEY=tu_api_key_aquí
RAPIDAPI_HOST=the-numerology-api.p.rapidapi.com
```

## 2. PRUEBA LOCAL (requiere Netlify Dev corriendo)

```bash
# Iniciar servidor dev
npm run dev

# En otra terminal:
curl -X POST http://localhost:8888/.netlify/functions/holistico-reading \
  -H "Content-Type: application/json" \
  -d '{
    "fecha_nacimiento": "1990-05-15",
    "name": "Test User",
    "pregunta": "¿Cuál es mi camino?"
  }'
```

## 3. PRUEBA PRODUCCIÓN (después del deploy)

```bash
curl -X POST https://kunna.help/.netlify/functions/holistico-reading \
  -H "Content-Type: application/json" \
  -d '{
    "fecha_nacimiento": "1990-05-15",
    "name": "Test User",
    "pregunta": "¿Estoy en el camino correcto?"
  }'
```

## 4. RESPUESTA ESPERADA

```json
{
  "success": true,
  "fecha_consulta": "2025-01-15T10:30:00.000Z",
  "tarot": {
    "carta": "The Fool",
    "significado": "Nuevos comienzos, fe en el viaje",
    "descripcion": "El comienzo de un nuevo ciclo",
    "imagen": "https://tarotapi.dev/cards/ar00.jpg",
    "_error": null
  },
  "numerologia": {
    "lucky_numbers": [3, 7, 12, 21],
    "life_path_number": 5,
    "significado": "Tus números de la suerte son: 3, 7, 12, 21",
    "_error": null
  },
  "astrologia": {
    "signo": "Tauro",
    "elemento": "Tierra",
    "_fallback": true,
    "_error": null
  },
  "mensaje_kunna": "Lectura Holística KUNNA\n\n...",
  "_warnings": {
    "rapidapi_used": true,
    "tarot_failed": false,
    "numerologia_fallback": false,
    "astrologia_fallback": true
  }
}
```

## 5. CÓDIGOS DE ERROR

- `405`: Method not allowed (solo POST)
- `400`: Falta `fecha_nacimiento` en body
- `500`: Error interno (revisar logs de Netlify)

## 6. INTEGRACIÓN UI (HolisticZone.jsx)

Ver próximo commit para integración mínima con botón "Obtener lectura".
