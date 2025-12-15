import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'

const TEMPLATES_BUCKET = 'documentos-seguridad'
const TEMPLATE_PATH = 'Cobertura_Vita365_Zinha.pdf'
const CERTS_BUCKET = 'certificados' // crea este bucket PRIVADO si aún no

const ok = (data: unknown, status=200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } })

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Autenticación de usuaria (JWT del frontend en Authorization)
    const auth = createClient(supabaseUrl, anon, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' }}})
    const { data: me } = await auth.auth.getUser()
    if (!me?.user) return ok({ error: 'No autenticada' }, 401)
    const userId = me.user.id

    // Admin client para Storage/DB
    const admin = createClient(supabaseUrl, service)

    // 1) Leer perfil
    const { data: perfil, error: ePerfil } = await admin
      .from('profiles')
      .select('nombre_completo, fecha_nacimiento, curp, id_vita')
      .eq('id', userId).single()
    if (ePerfil) throw ePerfil

    const nombre = perfil?.nombre_completo ?? ''
    const curp   = perfil?.curp ?? ''
    const idVita = perfil?.id_vita ?? ''
    const f = perfil?.fecha_nacimiento ? new Date(perfil.fecha_nacimiento) : null
    const fecha = f ? `${String(f.getDate()).padStart(2,'0')}/${String(f.getMonth()+1).padStart(2,'0')}/${f.getFullYear()}` : ''

    // 2) Cargar plantilla desde Storage (público)
    const { data: pub } = admin.storage.from(TEMPLATES_BUCKET).getPublicUrl(TEMPLATE_PATH)
    const tpl = await fetch(pub.publicUrl)
    if (!tpl.ok) throw new Error('No se pudo leer la plantilla')
    const bytes = await tpl.arrayBuffer()

    // 3) Rellenar página 2
    const pdf = await PDFDocument.load(bytes)
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const color = rgb(0.12, 0.11, 0.19)
    const size = 12
    const p2 = pdf.getPage(1) // página 2 (índice 1)

    // TODO: ajusta coordinates x,y una sola vez mirando tu PDF
    p2.drawText(nombre, { x: 140, y: 510, size, font, color })
    p2.drawText(fecha,  { x: 140, y: 480, size, font, color })
    p2.drawText(curp,   { x: 140, y: 450, size, font, color })
    p2.drawText(idVita, { x: 140, y: 420, size, font, color })

    const out = await pdf.save()
    const file = new Blob([out], { type: 'application/pdf' })

    // 4) Subir certificado y devolver URL firmada
    const path = `${userId}/certificado_${idVita || userId}_${Date.now()}.pdf`
    const up = await admin.storage.from(CERTS_BUCKET).upload(path, file, { upsert: true, contentType: 'application/pdf' })
    if (up.error) throw up.error

    const signed = await admin.storage.from(CERTS_BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7) // 7 días
    if (signed.error) throw signed.error

    // Guardar referencia en perfil (opcional)
    await admin.from('profiles')
      .update({ certificate_path: path, certificate_generated_at: new Date().toISOString() })
      .eq('id', userId)

    return ok({ ok: true, url: signed.data.signedUrl, path })
  } catch (e) {
    return ok({ ok:false, error: String(e) }, 500)
  }
})
