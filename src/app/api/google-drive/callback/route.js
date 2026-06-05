import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getGoogleDriveRedirectUri } from '@/lib/urls'

async function createNexusFolder(accessToken) {
  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'NexusIO Files',
      mimeType: 'application/vnd.google-apps.folder',
    }),
  })
  return await res.json()
}

export async function GET(req) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    console.error('Google OAuth error:', errorParam, searchParams.get('error_description'))
    return NextResponse.redirect(`${origin}/dashboard#drive=denied`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/dashboard?drive=error&drive_msg=${encodeURIComponent('No se recibió código de autorización de Google')}`)
  }

  let userId, returnTo
  try {
    const parsed = JSON.parse(stateParam || '{}')
    userId = parsed.userId
    returnTo = parsed.returnTo || '/dashboard'
  } catch {
    returnTo = '/dashboard'
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = getGoogleDriveRedirectUri()

  if (!clientId) {
    return NextResponse.redirect(`${origin}${returnTo}?drive=error&drive_msg=${encodeURIComponent('Falta GOOGLE_CLIENT_ID')}`)
  }
  if (!clientSecret) {
    return NextResponse.redirect(`${origin}${returnTo}?drive=error&drive_msg=${encodeURIComponent('Falta GOOGLE_CLIENT_SECRET')}`)
  }

  try {
    // 1. Exchange code por tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: redirectUri, grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()

    if (tokens.error) {
      return NextResponse.redirect(`${origin}${returnTo}?drive=error&drive_msg=${encodeURIComponent('Google token: ' + (tokens.error_description || tokens.error))}`)
    }

    if (!tokens.access_token) {
      return NextResponse.redirect(`${origin}${returnTo}?drive=error&drive_msg=${encodeURIComponent('Google no devolvió access_token')}`)
    }

    // 2. Crear carpeta "NexusIO Files" en Drive
    let folderId = null
    const folderResult = await createNexusFolder(tokens.access_token)
    if (folderResult.id) {
      folderId = folderResult.id
    } else {
      console.error('Folder creation error:', folderResult)
      // Non-fatal: continue even if folder creation fails
    }

    // 3. Guardar tokens + folderId en Supabase
    if (userId) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { cookies: { getAll: () => [], setAll: () => {} } }
      )

      const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(userId)

      if (getUserError) {
        return NextResponse.redirect(`${origin}${returnTo}?drive=error&drive_msg=${encodeURIComponent('Error al obtener usuario: ' + getUserError.message)}`)
      }

      if (user) {
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...user.user_metadata,
            drive_access_token: tokens.access_token,
            drive_refresh_token: tokens.refresh_token || user.user_metadata?.drive_refresh_token,
            drive_token_expires_at: Date.now() + (tokens.expires_in || 3600) * 1000,
            drive_folder_id: folderId,
            drive_folder_name: folderId ? 'NexusIO Files' : null,
            drive_connected: true,
          },
        })
      }
    }

    return NextResponse.redirect(`${origin}${returnTo}#drive=connected`)
  } catch (err) {
    console.error('Google Drive callback exception:', err.message)
    return NextResponse.redirect(`${origin}${returnTo}?drive=error&drive_msg=${encodeURIComponent('Error interno: ' + err.message)}`)
  }
}
