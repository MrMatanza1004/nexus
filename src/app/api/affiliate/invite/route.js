import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, affiliateInviteEmail } from '@/lib/email'
import { getAffiliateLink } from '@/lib/urls'

export const dynamic = 'force-dynamic'

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
    if (error || !user) {
      return NextResponse.json({ error: 'No hay sesión activa' }, { status: 401 })
    }

    const affiliateCode = user.user_metadata?.affiliate_code
    if (!affiliateCode) {
      return NextResponse.json({ error: 'No tenés código de afiliado' }, { status: 400 })
    }

    const { clientId } = await req.json()
    if (!clientId) {
      return NextResponse.json({ error: 'Falta clientId' }, { status: 400 })
    }

    // Get client data
    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .select('name, email')
      .eq('id', clientId)
      .eq('user_id', user.id)
      .single()

    if (clientErr || !client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    if (!client.email) {
      return NextResponse.json({ error: 'El cliente no tiene email registrado' }, { status: 400 })
    }

    const affiliateLink = getAffiliateLink(affiliateCode)
    const affiliateName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Un usuario'

    const email = affiliateInviteEmail({
      affiliateName,
      affiliateLink,
      clientName: client.name,
      clientEmail: client.email,
    })

    await sendEmail({ to: client.email, subject: email.subject, html: email.html })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Affiliate invite error:', err.message)
    return NextResponse.json({ error: 'Error al enviar invitación: ' + err.message }, { status: 500 })
  }
}
