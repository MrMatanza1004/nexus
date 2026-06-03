import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { fetchThread } from '@/integrations/nango'

export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
  try {
    const { threadId } = await params
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
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const connections = user.user_metadata?.nango_connections || {}
    const connectionId = connections['google-mail']
    if (!connectionId) {
      return NextResponse.json({ error: 'Gmail no conectado' }, { status: 400 })
    }

    const result = await fetchThread(connectionId, threadId)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Error fetching thread:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
