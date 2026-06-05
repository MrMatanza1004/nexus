import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('whatsapp_contacts')
      .select('*, client:client_id ( id, name )', { count: 'exact' })
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .range(from, to)

    if (error) throw error

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    })
  } catch (err) {
    console.error('Contacts list error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
