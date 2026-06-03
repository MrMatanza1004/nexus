import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { fetchEmails } from '@/integrations/nango'

export const dynamic = 'force-dynamic'

export async function GET(req) {
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
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const connections = user.user_metadata?.nango_connections || {}
    const connectionId = connections['google-mail']
    if (!connectionId) {
      return NextResponse.json({ error: 'Gmail no conectado' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const maxResults = parseInt(searchParams.get('maxResults') || '20')
    const query = searchParams.get('q') || ''
    const labelIds = searchParams.get('labelIds') || 'INBOX'

    const result = await fetchEmails(connectionId, maxResults, query)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Error fetching emails:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
