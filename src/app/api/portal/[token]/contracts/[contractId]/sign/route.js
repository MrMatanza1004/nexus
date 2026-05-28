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
      .select('id, name')
      .eq('portal_token', params.token)
      .eq('portal_active', true)
      .single()

    if (!client) return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 })

    const { data: contract } = await supabase
      .from('contracts')
      .select('id, client_id, status, signed')
      .eq('id', params.contractId)
      .eq('client_id', client.id)
      .single()

    if (!contract) return NextResponse.json({ error: 'Contrato no encontrado' }, { status: 404 })
    if (contract.signed) return NextResponse.json({ error: 'Este contrato ya fue firmado' }, { status: 400 })

    await supabase
      .from('contracts')
      .update({ signed: true, status: 'signed', signed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', contract.id)

    return NextResponse.json({ success: true, status: 'signed' })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
