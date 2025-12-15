// API endpoint para servir datos de seguimiento en tiempo real
// Archivo: src/pages/api/seguimiento/[token].js (si usas Next.js)
// O configurar en tu servidor para manejar /api/seguimiento/TOKEN

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Usar service role para acceso completo
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { token } = req.query

  if (!token) {
    return res.status(400).json({ 
      success: false, 
      mensaje: 'Token requerido' 
    })
  }

  try {
    // Llamar función de Supabase para obtener datos de seguimiento
    const { data, error } = await supabase
      .rpc('obtener_seguimiento_por_token', { p_token: token })

    if (error) {
      console.error('Error Supabase:', error)
      return res.status(500).json({ 
        success: false, 
        mensaje: 'Error interno del servidor' 
      })
    }

    return res.status(200).json(data)

  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ 
      success: false, 
      mensaje: 'Error inesperado' 
    })
  }
}

// Si no usas Next.js, aquí tienes la versión para Express:
/*
app.get('/api/seguimiento/:token', async (req, res) => {
  const { token } = req.params
  
  if (!token) {
    return res.status(400).json({ 
      success: false, 
      mensaje: 'Token requerido' 
    })
  }

  try {
    const { data, error } = await supabase
      .rpc('obtener_seguimiento_por_token', { p_token: token })

    if (error) {
      console.error('Error Supabase:', error)
      return res.status(500).json({ 
        success: false, 
        mensaje: 'Error interno del servidor' 
      })
    }

    return res.status(200).json(data)

  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ 
      success: false, 
      mensaje: 'Error inesperado' 
    })
  }
})
*/
