import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getAppUrl } from '@/lib/urls'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Obtener metadata actual del usuario
    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let accountId = user.user_metadata?.stripe_connect_id

    // Si no tiene cuenta Connect, crear una
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          userId,
          platform: 'nexus',
        },
      })
      accountId = account.id

      // Guardar en metadata de Supabase
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...user.user_metadata,
          stripe_connect_id: accountId,
        },
      })
    }

    // Crear link de onboarding (si no completó o es nueva)
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${getAppUrl()}/dashboard/affiliate?connect=refresh`,
      return_url: `${getAppUrl()}/dashboard/affiliate?connect=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err) {
    console.error('Stripe Connect error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
