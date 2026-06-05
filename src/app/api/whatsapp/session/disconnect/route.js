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

    // Get user's session
    const { data: session } = await supabase
      .from('whatsapp_sessions')
      .select('id, openwa_session_id')
      .eq('user_id', user.id)
      .maybeSingle()

    // Try to logout from OpenWA (non-fatal if it fails)
    if (session?.openwa_session_id) {
      const client = getOpenwaClient()
      if (client) {
        try {
          await client.deleteSession(session.openwa_session_id)
        } catch (err) {
          console.error('OpenWA logout error (non-fatal):', err)
        }
      }
    }

    // Update DB status regardless of OpenWA result
    await supabase
      .from('whatsapp_sessions')
      .update({ status: 'disconnected', qr_code: null, pairing_code: null })
      .eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Session disconnect error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
