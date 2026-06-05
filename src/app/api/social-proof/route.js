import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Get total active users (users who logged in recently)
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('updated_at', new Date(Date.now() - 30 * 86400000).toISOString())

    // Get total invoices count
    const { count: proposals } = await supabase
      .from('proposals')
      .select('id', { count: 'exact', head: true })

    // Get total amount invoiced
    const { data: invoices } = await supabase
      .from('invoices')
      .select('amount')
      .eq('status', 'paid')

    const totalInvoiced = invoices?.reduce((s, i) => s + Number(i.amount || 0), 0) || 0

    return NextResponse.json({
      activeUsers: activeUsers ?? 0,
      proposals: proposals ?? 0,
      totalInvoiced: totalInvoiced ?? 0,
      timestamp: new Date().toISOString(),
    }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
    })
  } catch (err) {
    console.error('Social proof error:', err.message)
    return NextResponse.json(
      { error: 'Social proof temporarily unavailable' },
      { status: 503 }
    )
  }
}
