import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    // Get the user's profile to find their Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('id', userId)
      .single()

    // Cancel any active Stripe subscription immediately
    if (profile?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id)
      } catch {} // Already cancelled or not found
    }

    // Delete user data from all tables
    const tables = ['tasks', 'clients', 'projects', 'notes', 'journal_entries', 'proposals',
      'contracts', 'invoices', 'expenses', 'time_entries', 'files', 'goals',
      'testimonials', 'feedback_requests', 'email_campaigns', 'affiliate_conversions']

    for (const table of tables) {
      await supabase.from(table).delete().eq('user_id', userId)
    }

    // Delete profile
    await supabase.from('profiles').delete().eq('id', userId)

    // Delete the auth user (this cascades to most tables via foreign keys)
    try {
      await supabase.auth.admin.deleteUser(userId)
    } catch {}

    return NextResponse.json({ success: true, message: 'Cuenta eliminada permanentemente.' })
  } catch (err) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
