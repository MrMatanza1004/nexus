import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAppUrl } from '@/lib/urls'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const body = await req.json()
    const { customerId, returnUrl } = body

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${getAppUrl()}/dashboard/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Portal error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
