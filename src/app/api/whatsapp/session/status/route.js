import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
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

    const { data: session } = await supabase
      .from('whatsapp_sessions')
      .select('status, qr_code, phone_number, connected_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!session) {
      return NextResponse.json({ status: 'disconnected' })
    }

    return NextResponse.json({
      status: session.status,
      qr: session.qr_code || undefined,
      phoneNumber: session.phone_number || undefined,
      connectedAt: session.connected_at || undefined,
    })
  } catch (err) {
    console.error('Session status error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
