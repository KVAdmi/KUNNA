# 🆘 AYUDA URGENTE - TRACKING SYSTEM NO FUNCIONA

## 📋 PROBLEMA CRÍTICO
Los tokens de tracking enviados por SMS NO CARGAN el mapa de ubicación. Sistema de seguridad INOPERATIVO.

## 🔧 STACK TÉCNICO
- **Frontend**: HTML/JavaScript + Leaflet.js 
- **Backend**: Supabase PostgreSQL
- **Deploy**: Netlify + Vite dev server

## 🐛 SÍNTOMAS
1. Página muestra "Cargando seguimiento..." forever
2. Mapa nunca se renderiza  
3. API no responde o retorna error

## 📡 CONFIGURACIÓN SUPABASE
```
URL: https://gptwzuqmuvzttajgjrry.supabase.co
Function: obtener_seguimiento_por_token_v2(p_token TEXT)
Table: acompanamientos_activos
```

## 🔍 DATOS DE PRUEBA
```
Token URL: track_d402362837f541d2b90af1076eb6c43b
Token BD: 4747bc76-3ede-... (diferente?)
Lat: 20.7028240, Lng: -103.3043980
```

## 🚨 NECESITO VERIFICAR
1. ¿Función RPC existe en Supabase?
2. ¿Permisos correctos para anon user?
3. ¿Token match entre URL y BD?
4. ¿Qué error devuelve la API exactamente?

## 📞 TESTING URLs
- Prod: https://tracking.zinha.app/track_d402362837f541d2b90af1076eb6c43b  
- Local: http://localhost:5173/tracking.html#track_d402362837f541d2b90af1076eb6c43b

## ⚡ CRITICIDAD: MÁXIMA
Sistema de seguridad para mujeres. Cada minuto cuenta.

---

## 🔧 CÓDIGO DE DEBUGGING

```javascript
// Test API call
const response = await fetch('https://gptwzuqmuvzttajgjrry.supabase.co/rest/v1/rpc/obtener_seguimiento_por_token_v2', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdHd6dXFtdXZ6dHRhamdqcnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDU1NzAsImV4cCI6MjA2ODA4MTU3MH0.AAbVhdrI7LmSPKKRX0JhSkYxVg7VOw-ccizKTOh7pV8',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwdHd6dXFtdXZ6dHRhamdqcnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDU1NzAsImV4cCI6MjA2ODA4MTU3MH0.AAbVhdrI7LmSPKKRX0JhSkYxVg7VOw-ccizKTOh7pV8'
    },
    body: JSON.stringify({ p_token: 'track_d402362837f541d2b90af1076eb6c43b' })
});

console.log('Status:', response.status);
console.log('Data:', await response.json());
```

## 📋 TABLA SUPABASE
```sql
CREATE TABLE acompanamientos_activos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    seguimiento text, -- TOKEN AQUÍ
    latitud_actual decimal(10,8),
    longitud_actual decimal(11,8),
    precision_metros integer,
    created_at timestamptz DEFAULT now()
);
```

## ⚠️ ESTADO ACTUAL
- ✅ Datos existen en Supabase
- ❌ API call falla o no retorna datos
- ❌ Frontend no renderiza mapa
- ❌ Usuarias sin protección activa
