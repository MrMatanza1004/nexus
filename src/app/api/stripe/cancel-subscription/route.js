import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req) {
  try {
    const { subscriptionId, subscriptionItemId } = await req.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId required' }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    // Cancel at period end so user keeps access until billing period ends
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    return NextResponse.json({ success: true, message: 'Suscripción cancelada. Seguís teniendo acceso hasta el final del período.' })
  } catch (err) {
    console.error('Cancel subscription error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
