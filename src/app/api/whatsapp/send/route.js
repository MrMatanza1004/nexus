import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getOpenwaClient } from '../../../../integrations/openwa.js'

export const dynamic = 'force-dynamic'

export async function POST(req) {
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

    // Verify session is connected
    const { data: session } = await supabase
      .from('whatsapp_sessions')
      .select('id, openwa_session_id, status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!session || session.status !== 'connected') {
      return NextResponse.json({ error: 'WhatsApp not connected' }, { status: 400 })
    }

    const { chatId, text } = await req.json()
    if (!chatId || !text) {
      return NextResponse.json({ error: 'chatId and text are required' }, { status: 400 })
    }

    const client = getOpenwaClient()
    if (!client) {
      return NextResponse.json({ error: 'OpenWA not configured' }, { status: 500 })
    }

    // Send via OpenWA
    const result = await client.sendMessage(session.openwa_session_id, chatId, text)

    // Record outgoing message
    const { data: message } = await supabase
      .from('whatsapp_messages')
      .insert({
        user_id: user.id,
        session_id: session.id,
        wa_message_id: result?.eventId || null,
        chat_id: chatId,
        direction: 'outbound',
        content: text,
        status: 'pending',
      })
      .select()
      .single()

    return NextResponse.json({
      eventId: result?.eventId,
      status: 'pending',
      messageId: message?.id,
    })
  } catch (err) {
    console.error('Send message error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
