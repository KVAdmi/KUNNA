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

  // Parsear birthdate YYYY-MM-DD a componentes separados
  const [birth_year, birth_month, birth_day] = birthdate.split('-')
  
  // La API usa GET con birth_year, birth_month, birth_day separados
  const encodedName = encodeURIComponent(full_name)
  const params = new URLSearchParams({
    birth_year,
    birth_month,
    birth_day,
    full_name: encodedName
  })
  
  const url = `https://${RAPIDAPI_HOST}/${endpoint}?${params.toString()}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    console.error(`RapidAPI ${endpoint} failed:`, response.status, errorText)
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

    // 🔢 NUMEROLOGÍA (endpoints principales confirmados)
    if (includeNumerology) {
      try {
        console.log('🔢 Obteniendo numerología...')
        
        // Llamar endpoints en grupos para mejor manejo de errores
        const coreNumbers = await Promise.allSettled([
          rapidAPIFetch('life_path', birthdate, full_name),
          rapidAPIFetch('destiny', birthdate, full_name),
          rapidAPIFetch('soul_urge', birthdate, full_name),
          rapidAPIFetch('personality', birthdate, full_name),
        ])

        const additionalNumbers = await Promise.allSettled([
          rapidAPIFetch('maturity', birthdate, full_name),
          rapidAPIFetch('birthday', birthdate, full_name),
          rapidAPIFetch('personal_year', birthdate, full_name),
        ])

        const cyclesNumbers = await Promise.allSettled([
          rapidAPIFetch('challenges', birthdate, full_name),
          rapidAPIFetch('pinnacles', birthdate, full_name),
        ])

        result.numerology = {
          lifePath: coreNumbers[0].status === 'fulfilled' ? coreNumbers[0].value : null,
          destiny: coreNumbers[1].status === 'fulfilled' ? coreNumbers[1].value : null,
          soulUrge: coreNumbers[2].status === 'fulfilled' ? coreNumbers[2].value : null,
          personality: coreNumbers[3].status === 'fulfilled' ? coreNumbers[3].value : null,
          maturity: additionalNumbers[0].status === 'fulfilled' ? additionalNumbers[0].value : null,
          birthDay: additionalNumbers[1].status === 'fulfilled' ? additionalNumbers[1].value : null,
          personalYear: additionalNumbers[2].status === 'fulfilled' ? additionalNumbers[2].value : null,
          challenges: cyclesNumbers[0].status === 'fulfilled' ? cyclesNumbers[0].value : null,
          pinnacles: cyclesNumbers[1].status === 'fulfilled' ? cyclesNumbers[1].value : null,
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
