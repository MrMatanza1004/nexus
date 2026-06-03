import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const returnTo = searchParams.get('returnTo') || '/dashboard'

  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = 'https://ionexus.pro/api/google-drive/callback'

  if (!clientId) {
    return NextResponse.json({ error: 'Google Client ID not configured', missingEnv: 'GOOGLE_CLIENT_ID' }, { status: 500 })
  }

  // El state contiene el userId y el returnTo, serializado como JSON
  const state = JSON.stringify({ userId, returnTo })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/drive.file',
    access_type: 'offline',
    prompt: 'consent',
    state,
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  return NextResponse.json({ url })
}
