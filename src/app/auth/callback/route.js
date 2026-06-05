import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { sendEmail, welcomeEmail } from '@/lib/email'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL
    || process.env.NEXT_PUBLIC_APP_URL
    || 'https://ionexus.pro'

  try {
    if (code) {
      const response = NextResponse.redirect(`${appUrl}${safeNext}`)

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll() { return request.cookies.getAll() },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, { ...options, path: '/' })
              )
            },
          },
        }
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Auth callback exchange error:', error.message)
        return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error.message)}`)
      }

      // ── Enviar welcome email si es un usuario nuevo (primera vez) ──
      if (data?.user?.email && data?.user?.user_metadata?.full_name) {
        const alreadyWelcomed = data.user.user_metadata?.welcome_sent
        if (!alreadyWelcomed) {
          const { subject, html } = welcomeEmail(data.user.user_metadata.full_name)
          sendEmail({ to: data.user.email, subject, html }).catch(err => {
            console.error('Welcome email error (non-fatal):', err.message)
          })
          // Marcar como enviado
          try {
            const adminClient = createServerClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL,
              process.env.SUPABASE_SERVICE_ROLE_KEY,
              { cookies: { getAll: () => [], setAll: () => {} } }
            )
            await adminClient.auth.admin.updateUserById(data.user.id, {
              user_metadata: { ...data.user.user_metadata, welcome_sent: true },
            })
          } catch (metaErr) {
            console.error('Failed to mark welcome_sent (non-fatal):', metaErr.message)
          }
        }
      }

      // ── Referido ──
      try {
        const refCode = request.cookies.get('nexus_ref')?.value
        if (refCode) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const adminClient = createServerClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL,
              process.env.SUPABASE_SERVICE_ROLE_KEY,
              { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
            )
            await adminClient.auth.admin.updateUserById(user.id, {
              user_metadata: { ...user.user_metadata, referred_by: refCode },
            })
            await adminClient.from('affiliate_conversions').insert({
              affiliate_code: refCode, referred_user_id: user.id,
              commission_amount: 0, status: 'pending',
            }).catch(() => {})
          }
          response.cookies.set('nexus_ref', '', { maxAge: 0, path: '/' })
        }
      } catch (refErr) {
        console.error('Affiliate tracking error (non-fatal):', refErr.message)
      }

      return response
    }
  } catch (err) {
    console.error('Auth callback fatal error:', err.message)
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent('Error interno: ' + err.message)}`)
  }

  return NextResponse.redirect(`${appUrl}/login?error=auth_failed`)
}
