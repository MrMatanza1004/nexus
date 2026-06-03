import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendEmail } from '@/integrations/nango'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })

    // Get invoice + client
    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .select('*, clients(id, name, email)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (invErr || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    if (!invoice.clients?.email) return NextResponse.json({ error: 'El cliente no tiene email registrado' }, { status: 400 })

    // Get invoice items
    const { data: items } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id)
      .order('sort_order')

    // Build email HTML
    const itemsHtml = (items || []).map(item => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${item.description}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">$${Number(item.unit_price).toFixed(2)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">$${Number(item.total).toFixed(2)}</td>
      </tr>
    `).join('') || `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0">${invoice.description || 'Servicios profesionales'}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center">1</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">$${Number(invoice.amount).toFixed(2)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right">$${Number(invoice.amount).toFixed(2)}</td>
      </tr>
    `

    const total = invoice.total || invoice.amount
    const subtotal = invoice.subtotal || total
    const taxAmount = invoice.tax_amount || 0

    const html = `
      <div style="max-width:600px;margin:0 auto;font-family:Inter,Arial,sans-serif;color:#1e293b">
        <div style="padding:32px 0;border-bottom:2px solid #7c3aed;margin-bottom:24px">
          <h1 style="color:#7c3aed;font-size:24px;margin:0">NEXUS</h1>
          <p style="color:#64748b;font-size:13px;margin:4px 0 0">El Sistema Operativo Freelance</p>
        </div>
        <p style="font-size:14px;color:#64748b">Hola <strong>${invoice.clients.name}</strong>,</p>
        <p style="font-size:14px;color:#475569">Adjuntamos la factura <strong>#${invoice.number}</strong> por un total de <strong style="color:#7c3aed">$${Number(total).toFixed(2)}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:8px;text-align:left;font-size:12px;text-transform:uppercase;color:#94a3b8">Descripción</th>
              <th style="padding:8px;text-align:center;font-size:12px;text-transform:uppercase;color:#94a3b8">Cant.</th>
              <th style="padding:8px;text-align:right;font-size:12px;text-transform:uppercase;color:#94a3b8">Precio</th>
              <th style="padding:8px;text-align:right;font-size:12px;text-transform:uppercase;color:#94a3b8">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="margin-left:auto;width:250px">
          <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px"><span>Subtotal</span><span>$${Number(subtotal).toFixed(2)}</span></div>
          ${taxAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px"><span>IVA (${invoice.tax_rate || 0}%)</span><span>$${Number(taxAmount).toFixed(2)}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;padding:12px 0 0;border-top:2px solid #1e293b;margin-top:4px;font-size:18px;font-weight:700"><span>Total</span><span>$${Number(total).toFixed(2)}</span></div>
        </div>
        ${invoice.due_date ? `<p style="font-size:13px;color:#94a3b8;margin-top:24px">Vence: ${new Date(invoice.due_date).toLocaleDateString('es-MX')}</p>` : ''}
        ${invoice.stripe_payment_link ? `<a href="${invoice.stripe_payment_link}" style="display:inline-block;margin-top:16px;padding:12px 32px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">💳 Pagar en línea</a>` : ''}
        <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:12px">
          <p>Generado con NEXUS · ${new Date().toLocaleDateString('es-MX')}</p>
        </div>
      </div>
    `

    // Send via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NEXUS <facturas@ionexus.pro>',
        to: [invoice.clients.email],
        subject: `Factura #${invoice.number} — ${invoice.clients.name}`,
        html,
      }),
    })

    if (!resendRes.ok) {
      const err = await resendRes.text()
      throw new Error(`Resend error: ${err}`)
    }

    // Mark as sent
    await supabase.from('invoices').update({
      sent_at: new Date().toISOString(),
    }).eq('id', id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error sending invoice:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
