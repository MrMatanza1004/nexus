import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req, { params }) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('portal_token', params.token)
      .eq('portal_active', true)
      .single()

    if (!client) return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 })

    const { data: proposal } = await supabase
      .from('proposals')
      .select('id, client_id, status')
      .eq('id', params.proposalId)
      .eq('client_id', client.id)
      .single()

    if (!proposal) return NextResponse.json({ error: 'Propuesta no encontrada' }, { status: 404 })
    if (proposal.status !== 'sent') return NextResponse.json({ error: 'Esta propuesta ya fue respondida' }, { status: 400 })

    await supabase
      .from('proposals')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', proposal.id)

    return NextResponse.json({ success: true, status: 'accepted' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
