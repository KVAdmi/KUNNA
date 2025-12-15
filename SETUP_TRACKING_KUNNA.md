# 🚨 CONFIGURACIÓN TRACKING PARA KUNNA

## ❓ ¿QUÉ NECESITAS?

Para que el tracking funcione, necesitas:

### OPCIÓN A: Tienes dominio propio (ej: kunna.app)
1. Desplegar app en Netlify
2. Conectar dominio kunna.app
3. Configurar subdominio tracking.kunna.app
4. Actualizar RPC en Supabase con nuevo dominio

### OPCIÓN B: NO tienes dominio (GRATIS)
1. Desplegar en Netlify (te da URL gratis: `tu-app.netlify.app`)
2. Usar esa URL para tracking: `https://tu-app.netlify.app/track_TOKEN`
3. Actualizar RPC en Supabase

---

## 🔧 PASOS DETALLADOS

### PASO 1: Desplegar en Netlify

```bash
# Si ya tienes cuenta Netlify CLI
npm install -g netlify-cli
netlify login
netlify init

# O subir manualmente en netlify.com
npm run build
# Subir carpeta dist/ a Netlify
```

### PASO 2: Obtener tu URL de Netlify

Después del deploy, Netlify te dará una URL como:
- `https://kunna-app-12345.netlify.app` (automática)
- O tu dominio custom: `https://kunna.app`

### PASO 3: Actualizar función RPC en Supabase

Ve a Supabase SQL Editor y ejecuta:

```sql
-- Actualizar función que genera URLs de tracking
CREATE OR REPLACE FUNCTION iniciar_seguimiento_tiempo_real_v2(
    p_user_id UUID,
    p_destino TEXT DEFAULT '',
    p_contacto_emergencia TEXT DEFAULT ''
)
RETURNS TABLE(id UUID, token TEXT, url_seguimiento TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_nuevo_id UUID;
    v_nuevo_token TEXT;
BEGIN
    v_nuevo_id := gen_random_uuid();
    v_nuevo_token := 'track_' || REPLACE(v_nuevo_id::TEXT, '-', '');

    INSERT INTO acompanamientos_activos (
        id,
        user_id,
        token,
        destino,
        contacto_emergencia,
        activo,
        inicio
    )
    VALUES (
        v_nuevo_id,
        p_user_id,
        v_nuevo_token,
        p_destino,
        p_contacto_emergencia,
        true,
        NOW()
    )
    RETURNING id INTO v_nuevo_id;

    RETURN QUERY
    WITH tracking_data AS (
        SELECT 
            v_nuevo_id AS id,
            v_nuevo_token AS token,
            -- 🔥 CAMBIA ESTA URL POR LA TUYA DE NETLIFY
            'https://TU-APP.netlify.app/' || v_nuevo_token AS url_seguimiento
    )
    SELECT * FROM tracking_data;
END;
$$;
```

### PASO 4: Verificar que tracking.html existe

Tu archivo `public/tracking.html` debe estar en la build. Verifica:

```bash
npm run build
ls dist/tracking.html  # Debe existir
```

---

## 🧪 PROBAR TRACKING

Una vez desplegado:

1. Crea un seguimiento desde tu app
2. Copia el URL que genera: `https://tu-app.netlify.app/track_abc123...`
3. Ábrelo en navegador
4. Deberías ver el mapa con ubicación en tiempo real

---

## ⚡ OPCIÓN RÁPIDA: Usar Netlify gratis AHORA

Si quieres probar YA sin dominio:

```bash
# Build
npm run build

# Arrastra carpeta dist/ a netlify.com/drop
# Te da URL gratis tipo: https://gentle-stardust-12345.netlify.app
```

Luego actualiza la RPC con esa URL.

---

## 📱 PARA EL BOTÓN SOS

Una vez tengas el dominio configurado, el botón SOS enviará:

```
🚨 EMERGENCIA KUNNA 🚨

📍 Ubicación: https://maps.google.com/?q=20.123,-103.456
Precisión: 15m

🔗 Seguimiento en tiempo real:
https://tu-app.netlify.app/track_abc123xyz

⏰ 11/12/2025 20:30:15
```

El contacto puede hacer click y ver tu ubicación actualizándose en tiempo real.

---

## ❓ ¿QUÉ URL TIENES AHORA?

Dime:
1. ¿Tienes dominio propio para KUNNA? (ej: kunna.app)
2. ¿O usamos Netlify gratis por ahora?
3. ¿Ya desplegaste en Netlify alguna vez?

Te ayudo con el paso exacto que necesites.
