import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentPromotion } from '@/data/affiliate-promotions'

export const runtime = 'edge'

export async function GET() {
  try {
    const promotion = getCurrentPromotion()

    // Contar códigos de afiliado DISTINTOS que tuvieron actividad esta semana
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const startOfWeek = new Date()
    const day = startOfWeek.getUTCDay()
    const diff = day === 0 ? 6 : day - 1 // Monday
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - diff)
    startOfWeek.setUTCHours(0, 0, 0, 0)

    const weekStart = startOfWeek.toISOString()

    const [clicksRes, convRes] = await Promise.all([
      supabase
        .from('affiliate_clicks')
        .select('affiliate_code')
        .gte('created_at', weekStart),
      supabase
        .from('affiliate_conversions')
        .select('affiliate_code')
        .gte('created_at', weekStart),
    ])

    // Unique codes from both tables this week
    const codes = new Set()
    ;(clicksRes.data || []).forEach(r => codes.add(r.affiliate_code))
    ;(convRes.data || []).forEach(r => codes.add(r.affiliate_code))

    const slotsTaken = codes.size

    return NextResponse.json({
      ...promotion,
      slotsTaken,
      slotsRemaining: Math.max(0, promotion.maxSlots - slotsTaken),
      weekStart,
    })
  } catch (err) {
    console.error('Promotion stats error:', err)
    return NextResponse.json({ error: 'Failed to load promotion stats' }, { status: 500 })
  }
}
