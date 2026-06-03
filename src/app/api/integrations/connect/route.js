import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createConnectSession } from '@/integrations/nango'

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

    const { provider } = await req.json().catch(() => ({ provider: 'google-drive' }))
    const integrations = provider ? [provider] : ['google-drive']

    const sessionToken = await createConnectSession(
      user.id,
      user.email || '',
      integrations
    )

    return NextResponse.json({ sessionToken })
  } catch (err) {
    console.error('Error creating Nango connect session:', err.message)
    return NextResponse.json({ error: 'Error al crear sesión de conexión: ' + err.message }, { status: 500 })
  }
}
