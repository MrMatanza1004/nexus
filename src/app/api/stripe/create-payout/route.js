import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

/**
 * Crea una transferencia a la cuenta Connect de un afiliado
 */
export async function POST(req) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const body = await req.json()
    const { userId, amount, currency = 'usd' } = body

    if (!userId || !amount) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const stripeConnectId = user.user_metadata?.stripe_connect_id

    if (!stripeConnectId) {
      return NextResponse.json({ error: 'Affiliate has no Stripe Connect account' }, { status: 400 })
    }

    // Verificar que la cuenta esté activa
    const account = await stripe.accounts.retrieve(stripeConnectId)
    if (!account.charges_enabled) {
      return NextResponse.json({ error: 'Stripe account not fully onboarded' }, { status: 400 })
    }

    // Crear transferencia a la cuenta Connect
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency,
      destination: stripeConnectId,
      metadata: {
        userId,
        type: 'affiliate_commission',
      },
    })

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: amount,
    })
  } catch (err) {
    console.error('Stripe payout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
