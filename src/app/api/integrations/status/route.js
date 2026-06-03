import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getNangoClient } from '@/integrations/nango'

export const dynamic = 'force-dynamic'

const PROVIDERS = [
  { key: 'google-drive', label: 'Google Drive', icon: 'google-drive' },
  { key: 'google-mail', label: 'Gmail / Correo', icon: 'mail' },
  // Futuros providers se agregan acá:
  // { key: 'slack', label: 'Slack', icon: 'slack' },
  // { key: 'github', label: 'GitHub', icon: 'github' },
]

export async function GET(req) {
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

    const nangoConnections = user.user_metadata?.nango_connections || {}
    const nango = getNangoClient()

    const integrations = await Promise.all(
      PROVIDERS.map(async (p) => {
        const connectionId = nangoConnections[p.key]
        let connected = !!connectionId

        if (connectionId && nango) {
          try {
            await nango.getConnection(p.key, connectionId)
            connected = true
          } catch {
            connected = false
          }
        }

        return {
          ...p,
          connected,
          connectionId: connectionId || null,
        }
      })
    )

    return NextResponse.json({ integrations })
  } catch (err) {
    console.error('Error fetching integration status:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
