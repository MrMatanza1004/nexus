import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getOpenwaClient } from '../../../../../integrations/openwa.js'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = getOpenwaClient()
    if (!client) {
      return NextResponse.json({ error: 'OpenWA not configured' }, { status: 500 })
    }

    // Check existing session status
    const { data: existingSession } = await supabase
      .from('whatsapp_sessions')
      .select('id, status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingSession?.status === 'connected') {
      return NextResponse.json(
        { error: 'Already connected. Disconnect first.' },
        { status: 409 }
      )
    }

    const sessionName = `${user.id}-whatsapp`
    const result = await client.createSession(sessionName)

    // Upsert session row (create or update existing)
    const sessionData = {
      user_id: user.id,
      session_name: sessionName,
      openwa_session_id: sessionName,
      status: 'scanning',
      qr_code: result?.qr || null,
      pairing_code: result?.pairingCode || null,
    }

    await supabase
      .from('whatsapp_sessions')
      .upsert(sessionData, { onConflict: 'user_id' })

    return NextResponse.json({
      qr: result?.qr,
      pairingCode: result?.pairingCode,
      expiresIn: process.env.QR_EXPIRY_SECONDS
        ? parseInt(process.env.QR_EXPIRY_SECONDS, 10)
        : 120,
    })
  } catch (err) {
    console.error('Session connect error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
