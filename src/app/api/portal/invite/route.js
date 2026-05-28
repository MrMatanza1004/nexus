import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, portalInviteEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const { clientId } = await req.json()
    if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const token = crypto.randomUUID()

    const { data, error } = await supabase
      .from('clients')
      .update({ portal_token: token, portal_active: true })
      .eq('id', clientId)
      .select('name, email')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/portal/${token}`

    if (data?.email) {
      const { subject, html } = portalInviteEmail(data.name, portalUrl)
      sendEmail({ to: data.email, subject, html }).catch(() => {})
    }

    return NextResponse.json({ url: portalUrl, client: data })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
