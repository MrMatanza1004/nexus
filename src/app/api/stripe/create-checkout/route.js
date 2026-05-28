import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const body = await req.json()
    const { priceId, userId, affiliateCode } = body

    if (!priceId || !userId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: userId,
      metadata: {
        userId,
        affiliateCode: affiliateCode || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?checkout=canceled`,
      subscription_data: {
        metadata: {
          userId,
          affiliateCode: affiliateCode || '',
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
