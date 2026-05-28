import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const landing = searchParams.get('landing') || '/'

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  }

  // Record click
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )

  await supabase.from('affiliate_clicks').insert({
    affiliate_code: code,
    ip: req.headers.get('x-forwarded-for') || 'unknown',
    referrer: req.headers.get('referer') || '',
    landing_page: landing,
  })

  // Set cookie for 30 days
  const response = NextResponse.redirect(new URL(landing, req.url))
  response.cookies.set('nexus_ref', code, {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
  })

  return response
}
