import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.userId
      const affiliateCode = session.metadata?.affiliateCode

      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan_type: 'pro',
          updated_at: new Date().toISOString(),
        })

        if (affiliateCode) {
          const { data: conversions } = await supabase
            .from('affiliate_conversions')
            .select('*')
            .eq('affiliate_code', affiliateCode)
            .eq('referred_user_id', userId)
            .single()

          if (conversions) {
            const commission = session.amount_total ? (session.amount_total / 100) * 0.25 : 0
            await supabase.from('affiliate_conversions').update({
              status: 'paid',
              commission_amount: commission,
            }).eq('id', conversions.id)
          }
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)

      if (profiles?.length) {
        await supabase.from('profiles').upsert({
          id: profiles[0].id,
          plan_type: 'cancelled',
          updated_at: new Date().toISOString(),
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
