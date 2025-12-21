/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper para respuestas JSON
const ok = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

// Helper para fetch de RapidAPI
const rapidAPIFetch = async (endpoint: string, birthdate: string, full_name: string) => {
  const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY')
  const RAPIDAPI_HOST = 'the-numerology-api.p.rapidapi.com'

  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY no configurada en Supabase')
  }

  const response = await fetch(`https://${RAPIDAPI_HOST}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
    body: JSON.stringify({ birthdate, full_name }),
  })

  if (!response.ok) {
    throw new Error(`RapidAPI ${endpoint} error: ${response.status}`)
  }

  return await response.json()
}

// Helper para fetch de TarotAPI
const tarotAPIFetch = async () => {
  const response = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1')
  
  if (!response.ok) {
    throw new Error(`TarotAPI error: ${response.status}`)
  }

  const data = await response.json()
  return data.cards?.[0] || null
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Solo POST permitido
    if (req.method !== 'POST') {
      return ok({ error: 'Method not allowed' }, 405)
    }

    // Parse body
    const { birthdate, full_name, includeNumerology = true, includeTarot = true, includeAstrology = false } = await req.json()

    if (!birthdate || !full_name) {
      return ok({ error: 'birthdate y full_name son requeridos' }, 400)
    }

    console.log(`📊 Holistico Reading para: ${full_name}, fecha: ${birthdate}`)

    const result: any = {
      timestamp: new Date().toISOString(),
      user: { birthdate, full_name },
    }

    // 🔢 NUMEROLOGÍA (los 16 números)
    if (includeNumerology) {
      try {
        console.log('🔢 Obteniendo numerología...')
        const [
          lifePath,
          destiny,
          soulUrge,
          personality,
          maturity,
          birthDay,
          challenges,
          pinnacles,
          periods,
          personal,
          universal,
          planes,
        ] = await Promise.all([
          rapidAPIFetch('lifepath', birthdate, full_name),
          rapidAPIFetch('destiny', birthdate, full_name),
          rapidAPIFetch('soulurge', birthdate, full_name),
          rapidAPIFetch('personality', birthdate, full_name),
          rapidAPIFetch('maturity', birthdate, full_name),
          rapidAPIFetch('birthday', birthdate, full_name),
          rapidAPIFetch('challenges', birthdate, full_name),
          rapidAPIFetch('pinnacles', birthdate, full_name),
          rapidAPIFetch('periods', birthdate, full_name),
          rapidAPIFetch('personalyear', birthdate, full_name),
          rapidAPIFetch('universalyear', birthdate, full_name),
          rapidAPIFetch('planesofexpression', birthdate, full_name),
        ])

        result.numerology = {
          lifePath,
          destiny,
          soulUrge,
          personality,
          maturity,
          birthDay,
          challenges,
          pinnacles,
          periods,
          personalYear: personal,
          universalYear: universal,
          planesOfExpression: planes,
        }
        console.log('✅ Numerología obtenida')
      } catch (err) {
        console.error('❌ Error en numerología:', err)
        const error = err as Error
        result.numerology = { error: error.message }
      }
    }

    // 🃏 TAROT
    if (includeTarot) {
      try {
        console.log('🃏 Obteniendo tarot...')
        const card = await tarotAPIFetch()
        result.tarot = card
        console.log('✅ Tarot obtenido:', card?.name)
      } catch (err) {
        console.error('❌ Error en tarot:', err)
        const error = err as Error
        result.tarot = { error: error.message }
      }
    }

    // ♈ ASTROLOGÍA (placeholder - implementar cuando tengas API)
    if (includeAstrology) {
      result.astrology = {
        message: 'Astrología pendiente de implementar con API externa',
      }
    }

    console.log('✅ Reading completo')
    return ok({ ok: true, data: result })

  } catch (err) {
    console.error('❌ Error general:', err)
    const error = err as Error
    return ok({ error: error.message }, 500)
  }
})
