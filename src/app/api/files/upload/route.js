import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    // 1. Verificar sesión del usuario via cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            const cookie = req.headers.get('cookie') || ''
            return cookie.split('; ').map(c => {
              const [name, ...rest] = c.split('=')
              return { name, value: rest.join('=') }
            }).filter(c => c.name)
          },
          setAll() {},
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado. Iniciá sesión.' }, { status: 401 })
    }

    // 2. Recibir archivo como FormData
    const formData = await req.formData()
    const file = formData.get('file')
    const projectId = formData.get('project_id') || null

    if (!file || !file.name) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    // 3. Subir a Supabase Storage con service_role key (bypass RLS)
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { error: uploadError } = await adminClient.storage
      .from('centro-files')
      .upload(fileName, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: `Error al subir a Storage: ${uploadError.message || uploadError}` }, { status: 500 })
    }

    const { data: { publicUrl } } = adminClient.storage
      .from('centro-files')
      .getPublicUrl(fileName)

    // 4. Guardar registro en tabla files
    const { error: dbError } = await adminClient.from('files').insert({
      user_id: user.id,
      name: file.name,
      url: publicUrl,
      size: file.size,
      type: file.type || 'application/octet-stream',
      project_id: projectId,
    })

    if (dbError) {
      console.error('DB insert error:', dbError)
      return NextResponse.json({ error: `Archivo subido pero error al registrar: ${dbError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      name: file.name,
      url: publicUrl,
    })
  } catch (err) {
    console.error('Upload exception:', err.message)
    return NextResponse.json({ error: `Error interno: ${err.message}` }, { status: 500 })
  }
}
