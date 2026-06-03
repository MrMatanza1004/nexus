import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getNangoAccessToken } from '@/integrations/nango'

export async function POST(req) {
  try {
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

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      return NextResponse.json({ error: `Error de autenticación: ${error.message}`, needsAuth: true }, { status: 401 })
    }
    if (!user) {
      return NextResponse.json({ error: 'No hay sesión activa. Iniciá sesión de nuevo.', needsAuth: true }, { status: 401 })
    }

    // Obtener token: primero Nango, fallback a sistema anterior
    const nangoConnections = user.user_metadata?.nango_connections || {}
    const connectionId = nangoConnections['google-drive']
    let token = null

    if (connectionId) {
      try {
        token = await getNangoAccessToken(connectionId)
      } catch (nangoErr) {
        console.error('Nango getConnection error:', nangoErr.message)
      }
    }

    // Fallback: token manual guardado en user_metadata (sistema anterior)
    if (!token) {
      const accessToken = user.user_metadata?.drive_access_token
      const refreshToken = user.user_metadata?.drive_refresh_token
      const expiresAt = user.user_metadata?.drive_token_expires_at

      if (accessToken) {
        token = accessToken
        if (expiresAt && Date.now() > expiresAt) {
          if (!refreshToken) {
            return NextResponse.json({
              error: 'La sesión de Drive expiró y no hay refresh_token. Conectá Google Drive de nuevo.',
              needsAuth: true,
            }, { status: 401 })
          }

          try {
            const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                refresh_token: refreshToken,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                grant_type: 'refresh_token',
              }),
            })
            const refreshData = await refreshRes.json()

            if (refreshData.error) {
              return NextResponse.json({
                error: `Error al refrescar token de Drive: ${refreshData.error_description || refreshData.error}. Conectá de nuevo.`,
                needsAuth: true,
              }, { status: 401 })
            }

            token = refreshData.access_token

            // Guardar nuevo token
            const adminClient = createServerClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL,
              process.env.SUPABASE_SERVICE_ROLE_KEY,
              { cookies: { getAll: () => [], setAll: () => {} } }
            )
            await adminClient.auth.admin.updateUserById(user.id, {
              user_metadata: {
                ...user.user_metadata,
                drive_access_token: token,
                drive_token_expires_at: Date.now() + (refreshData.expires_in || 3600) * 1000,
              },
            })
          } catch (refreshErr) {
            return NextResponse.json({
              error: `Error al refrescar token: ${refreshErr.message}. Conectá Google Drive de nuevo.`,
              needsAuth: true,
            }, { status: 500 })
          }
        }
      }
    }

    if (!token) {
      return NextResponse.json({
        error: 'Google Drive no conectado. Apretá "Conectar mi Google Drive" primero.',
        needsAuth: true,
      }, { status: 401 })
    }

    // Subir archivo a Google Drive
    const { content, filename, mimeType: fileMimeType = 'text/plain' } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'No hay contenido para guardar' }, { status: 400 })
    }
    if (!filename) {
      return NextResponse.json({ error: 'No se especificó nombre de archivo' }, { status: 400 })
    }

    const folderId = user.user_metadata?.drive_folder_id
    const metadata = { name: filename, mimeType: fileMimeType, ...(folderId ? { parents: [folderId] } : {}) }
    const boundary = '-------314159265358979323846'
    const body = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      `--${boundary}`,
      `Content-Type: ${fileMimeType}`,
      '',
      content,
      `--${boundary}--`,
    ].join('\r\n')

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body,
    })

    const file = await uploadRes.json()
    if (file.error) {
      console.error('Google Drive upload API error:', file.error.code, file.error.message)
      const msg = file.error.code === 401
        ? `Token de Drive inválido: ${file.error.message}. Conectá Google Drive de nuevo.`
        : `Error de Google Drive: ${file.error.message} (código ${file.error.code})`
      return NextResponse.json({ error: msg, needsAuth: file.error.code === 401 }, { status: 400 })
    }

    if (!file.id) {
      return NextResponse.json({ error: 'Google Drive no devolvió un ID de archivo' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      fileId: file.id,
      fileName: file.name,
      viewUrl: `https://drive.google.com/file/d/${file.id}/view`,
    })
  } catch (err) {
    console.error('Upload exception:', err.message)
    return NextResponse.json({ error: `Error interno al subir: ${err.message}` }, { status: 500 })
  }
}
