import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: client, error } = await supabase
      .from('clients')
      .select('id, name, email, company, user_id')
      .eq('portal_token', params.token)
      .eq('portal_active', true)
      .single()

    if (error || !client) {
      return NextResponse.json({ error: 'Portal no encontrado o desactivado' }, { status: 404 })
    }

    const [proposals, contracts, invoices] = await Promise.all([
      supabase.from('proposals').select('id, title, amount, status, created_at, updated_at').eq('client_id', client.id).order('created_at', { ascending: false }),
      supabase.from('contracts').select('id, title, amount, status, signed, created_at').eq('client_id', client.id).order('created_at', { ascending: false }),
      supabase.from('invoices').select('id, number, amount, status, due_date, paid_at, stripe_payment_link, created_at').eq('client_id', client.id).order('created_at', { ascending: false }),
    ])

    return NextResponse.json({
      client: { name: client.name, email: client.email, company: client.company },
      proposals: proposals.data || [],
      contracts: contracts.data || [],
      invoices: invoices.data || [],
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
