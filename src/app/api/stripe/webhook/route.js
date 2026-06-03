import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getCurrentPromotion } from '@/data/affiliate-promotions'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing Stripe env vars')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }
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
        const planType = session.metadata?.planType || 'pro'
        await supabase.from('profiles').upsert({
          id: userId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan_type: planType,
          updated_at: new Date().toISOString(),
        })
        // Also update user_metadata so settings page reflects it
        const { error: metaError } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { plan_type: planType },
        })
        if (metaError) console.error(`CRITICAL: User ${userId} paid but metadata update failed:`, metaError)

        if (affiliateCode) {
          const { data: conversion } = await supabase
            .from('affiliate_conversions')
            .select('*')
            .eq('affiliate_code', affiliateCode)
            .eq('referred_user_id', userId)
            .single()

          if (conversion) {
            // Get current promotion commission rate
            const promo = getCurrentPromotion()
            const baseRate = 0.25
            const promoRate = promo.type === 'commission_boost' ? promo.value / 100 : baseRate
            const commissionRate = Math.max(baseRate, promoRate)
            const amount = session.amount_total ? (session.amount_total / 100) : 0
            const commission = amount * commissionRate
            const currency = session.currency || 'mxn'

            await supabase.from('affiliate_conversions').update({
              status: 'paid',
              commission_amount: commission,
            }).eq('id', conversion.id)

            // Auto-payout via Stripe Connect if affiliate has account
            if (commission > 0) {
              await tryAutoPayoutAffiliate(stripe, supabase, affiliateCode, commission, currency)
            }
          }
        }
      }
      break
    }

    case 'invoice.paid': {
      // Recurring subscription payment — pay affiliate recurring commission
      const invoice = event.data.object
      const subscriptionId = invoice.subscription

      if (!subscriptionId) break

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle()

      if (profileErr || !profile) {
        console.error('Profile not found for subscription:', subscriptionId, profileErr)
        break
      }

      // Find if this user was referred
      const { data: { user } } = await supabase.auth.admin.getUserById(profile.id)
      const referredBy = user?.user_metadata?.referred_by

      if (referredBy) {
        const amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0
        const promo = getCurrentPromotion()
        const baseRate = 0.25
        const promoRate = promo.type === 'commission_boost' ? promo.value / 100 : baseRate
        const commissionRate = Math.max(baseRate, promoRate)
        const commission = amount * commissionRate
        const currency = invoice.currency || 'mxn'

        // Insert recurring commission record with period dates
        await supabase.from('affiliate_conversions').insert({
          affiliate_code: referredBy,
          referred_user_id: profile.id,
          commission_amount: commission,
          status: 'paid',
          period_start: new Date(invoice.period_start * 1000).toISOString(),
          period_end: new Date(invoice.period_end * 1000).toISOString(),
        })

        if (commission > 0) {
          await tryAutoPayoutAffiliate(stripe, supabase, referredBy, commission, currency)
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)

      if (profiles?.length) {
        await supabase.from('profiles')
          .update({ plan_type: 'cancelled', updated_at: new Date().toISOString() })
          .in('id', profiles.map(p => p.id))
      }
      break
    }

    case 'account.updated': {
      // Stripe Connect account updated — store onboarding status
      const account = event.data.object
      if (account.charges_enabled && account.metadata?.userId) {
        await supabase.auth.admin.updateUserById(account.metadata.userId, {
          user_metadata: {
            stripe_connect_id: account.id,
            stripe_connect_ready: true,
          },
        }).catch(err => console.error('Account updated sync failed:', err))
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

async function tryAutoPayoutAffiliate(stripe, supabase, affiliateCode, commission, currency = 'mxn') {
  try {
    // Find affiliate user by their affiliate_code in profiles table
    const { data: affiliateProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('affiliate_code', affiliateCode)
      .single()

    if (!affiliateProfile) {
      console.error('Affiliate not found for code:', affiliateCode)
      return
    }

    const { data: { user: affiliate } } = await supabase.auth.admin.getUserById(affiliateProfile.id)
    if (!affiliate) return

    const stripeConnectId = affiliate.user_metadata?.stripe_connect_id
    if (!stripeConnectId) return

    // Verify account is ready
    const account = await stripe.accounts.retrieve(stripeConnectId)
    if (!account.charges_enabled) return

    // Transfer commission to affiliate (same currency as original payment)
    await stripe.transfers.create({
      amount: Math.round(commission * 100),
      currency,
      destination: stripeConnectId,
      metadata: {
        affiliateCode,
        type: 'affiliate_commission',
        platform: 'nexus',
      },
    })
  } catch (err) {
    console.error('Auto-payout failed:', err.message)
    // Non-fatal: commission is already recorded in DB
  }
}
