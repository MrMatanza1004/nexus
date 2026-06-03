import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // ── Server-side auth check: verify admin session via cookies ──
    const cookieStore = await cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'imthebow@gmail.com'
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin authenticated — use service_role client for backend operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    // ── USERS ──
    const { data: allProfiles, error: profileErr } = await supabase
      .from('profiles')
      .select('id, email, plan_type, created_at, affiliate_code')
      .order('created_at', { ascending: false })

    if (profileErr) throw new Error(`Profiles: ${profileErr.message}`)

    const totalUsers = allProfiles?.length || 0
    const activeSubs = allProfiles?.filter(p => p.plan_type && !['trial', 'cancelled'].includes(p.plan_type)).length || 0
    const trialUsers = allProfiles?.filter(p => p.plan_type === 'trial').length || 0
    const cancelledUsers = allProfiles?.filter(p => p.plan_type === 'cancelled').length || 0
    const everPaid = activeSubs + (allProfiles?.filter(p => p.plan_type && !['trial', 'cancelled', null].includes(p.plan_type)).length || 0)
    const conversionRate = totalUsers > 0 ? Math.round((everPaid / totalUsers) * 100) : 0

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    const newThisWeek = allProfiles?.filter(p => p.created_at && p.created_at >= weekAgo).length || 0

    // Daily signups for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
    const signupsByDay = {}
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo)
      d.setDate(d.getDate() + i)
      signupsByDay[d.toISOString().slice(0, 10)] = 0
    }
    for (const p of allProfiles || []) {
      if (p.created_at) {
        const day = p.created_at.slice(0, 10)
        if (signupsByDay[day] !== undefined) signupsByDay[day]++
      }
    }

    // Plan distribution
    const planDist = {}
    for (const p of allProfiles || []) {
      const plan = p.plan_type || 'unknown'
      planDist[plan] = (planDist[plan] || 0) + 1
    }

    // ── AFFILIATES ──
    const { data: conversions, error: convErr } = await supabase
      .from('affiliate_conversions')
      .select('affiliate_code, status, commission_amount, created_at, referred_user_id')

    if (convErr) console.error('Conversions error:', convErr.message)

    const totalConversions = conversions?.length || 0
    const paidConversions = conversions?.filter(c => c.status === 'paid').length || 0
    const pendingConversions = conversions?.filter(c => c.status === 'pending').length || 0
    const totalCommissionsPaid = conversions?.reduce((sum, c) => sum + (parseFloat(c.commission_amount) || 0), 0) || 0

    const affiliateMap = {}
    for (const c of conversions || []) {
      if (!affiliateMap[c.affiliate_code]) {
        affiliateMap[c.affiliate_code] = { code: c.affiliate_code, total: 0, paid: 0, pending: 0, commissions: 0 }
      }
      affiliateMap[c.affiliate_code].total++
      if (c.status === 'paid') {
        affiliateMap[c.affiliate_code].paid++
        affiliateMap[c.affiliate_code].commissions += parseFloat(c.commission_amount) || 0
      }
      if (c.status === 'pending') affiliateMap[c.affiliate_code].pending++
    }

    const affiliateList = Object.values(affiliateMap).sort((a, b) => b.total - a.total)

    // ── STRIPE ──
    const [customers, charges, subscriptions] = await Promise.all([
      stripe.customers.list({ limit: 100 }).catch(() => ({ data: [] })),
      stripe.charges.list({ limit: 100 }).catch(() => ({ data: [] })),
      stripe.subscriptions.list({ limit: 100, status: 'all' }).catch(() => ({ data: [] })),
    ])

    const totalRevenue = charges.data.reduce((sum, ch) => sum + (ch.amount / 100), 0)
    const chargeCount = charges.data.length
    const activeStripeSubs = subscriptions.data.filter(s => s.status === 'active' || s.status === 'trialing').length
    const pastDue = subscriptions.data.filter(s => s.status === 'past_due').length
    const canceled = subscriptions.data.filter(s => s.status === 'canceled').length

    const revenueByDay = {}
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo)
      d.setDate(d.getDate() + i)
      revenueByDay[d.toISOString().slice(0, 10)] = 0
    }
    for (const ch of charges.data) {
      const day = new Date(ch.created * 1000).toISOString().slice(0, 10)
      if (revenueByDay[day] !== undefined) revenueByDay[day] += ch.amount / 100
    }

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthlyCharges = charges.data.filter(ch => new Date(ch.created * 1000) >= monthStart)
    const revenueThisMonth = monthlyCharges.reduce((sum, ch) => sum + (ch.amount / 100), 0)

    return NextResponse.json({
      users: {
        total: totalUsers,
        new_this_week: newThisWeek,
        active_subscriptions: activeSubs,
        trial: trialUsers,
        cancelled: cancelledUsers,
        conversion_rate: conversionRate,
        conversion_label: `${conversionRate}%`,
      },
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        this_month: Math.round(revenueThisMonth * 100) / 100,
        currency: 'MXN',
        total_charges: chargeCount,
        by_day: Object.entries(revenueByDay).map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 })),
      },
      stripe: {
        total_customers: customers.data.length,
        active_subscriptions: activeStripeSubs,
        past_due: pastDue,
        canceled: canceled,
      },
      affiliate: {
        total_conversions: totalConversions,
        paid_conversions: paidConversions,
        pending_conversions: pendingConversions,
        total_commissions_paid: Math.round(totalCommissionsPaid * 100) / 100,
        affiliates: affiliateList.map(a => ({ ...a, commissions: Math.round(a.commissions * 100) / 100 })),
      },
      charts: {
        signups: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
      },
      plans: planDist,
      all_profiles: allProfiles || [],
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
