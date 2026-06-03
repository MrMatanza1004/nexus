import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, welcomeEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 min para backfill

export async function POST(req) {
  try {
    // Solo el admin puede ejecutar esto
    const authHeader = req.headers.get('authorization') || ''
    const url = new URL(req.url)
    const querySecret = url.searchParams.get('secret')
    const CRON_SECRET = process.env.CRON_SECRET
    const isValid = authHeader === `Bearer ${CRON_SECRET}` || querySecret === CRON_SECRET

    if (!CRON_SECRET || !isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Obtener todos los usuarios de auth.users (vía admin API)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      return NextResponse.json({ error: 'Error listing users: ' + listError.message }, { status: 500 })
    }

    const results = { sent: 0, skipped: 0, errors: [] }

    for (const user of users) {
      try {
        const email = user.email
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'

        // Verificar si ya se le envió welcome email
        // (no tenemos tracking, así que chequeamos si el usuario tiene metadata vieja
        //  o si ya pasó por el auth callback post-fix)
        const alreadyWelcomed = user.user_metadata?.welcome_sent
        if (alreadyWelcomed) {
          results.skipped++
          continue
        }

        if (!email) {
          results.skipped++
          continue
        }

        // Enviar welcome email
        const { subject, html } = welcomeEmail(name)
        await sendEmail({ to: email, subject, html })

        // Marcar como enviado
        await supabase.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            welcome_sent: true,
          },
        })

        results.sent++
        console.log(`Welcome email sent to ${email}`)
      } catch (err) {
        results.errors.push(`User ${user.id}: ${err.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      total_users: users.length,
      results,
    })
  } catch (err) {
    console.error('Backfill error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
