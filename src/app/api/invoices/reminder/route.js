import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    if (invoice.status !== 'overdue' && invoice.status !== 'pending') {
      return NextResponse.json({ error: 'Solo se pueden enviar recordatorios de facturas pendientes o vencidas' }, { status: 400 })
    }

    // Check cooldown (3 days since last reminder)
    if (invoice.last_reminder_at) {
      const daysSince = (Date.now() - new Date(invoice.last_reminder_at).getTime()) / 86400000
      if (daysSince < 3) {
        return NextResponse.json({
          error: `Ya enviaste un recordatorio hace ${Math.round(daysSince)} día(s). Esperá al menos 3 días.`,
        }, { status: 429 })
      }
    }

    if (!invoice.clients?.email) {
      return NextResponse.json({ error: 'El cliente no tiene email registrado' }, { status: 400 })
    }

    const total = invoice.total || invoice.amount
    const daysOverdue = invoice.due_date
      ? Math.max(0, Math.floor((Date.now() - new Date(invoice.due_date).getTime()) / 86400000))
      : 0

    const html = `
      <div style="max-width:600px;margin:0 auto;font-family:Inter,Arial,sans-serif;color:#1e293b">
        <div style="padding:32px 0;border-bottom:2px solid #7c3aed;margin-bottom:24px">
          <h1 style="color:#7c3aed;font-size:24px;margin:0">NEXUS</h1>
          <p style="color:#64748b;font-size:13px;margin:4px 0 0">El Sistema Operativo Freelance</p>
        </div>
        <p style="font-size:14px;color:#64748b">Hola <strong>${invoice.clients.name}</strong>,</p>
        <p style="font-size:14px;color:#475569">
          ${daysOverdue > 0
            ? `Te recordamos que la factura <strong>#${invoice.number}</strong> está vencida hace <strong style="color:#ef4444">${daysOverdue} días</strong>.`
            : `Te recordamos la factura <strong>#${invoice.number}</strong> está próxima a vencer.`
          }
        </p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:24px 0">
          <p style="margin:0;font-size:14px;color:#991b1b">
            <strong>Total pendiente: $${Number(total).toFixed(2)}</strong>
          </p>
        </div>
        ${invoice.stripe_payment_link ? `
          <a href="${invoice.stripe_payment_link}" style="display:inline-block;padding:12px 32px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">💳 Pagar ahora</a>
        ` : ''}
        <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:12px">
          <p>Generado con NEXUS · ${new Date().toLocaleDateString('es-MX')}</p>
        </div>
      </div>
    `

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NEXUS <facturas@ionexus.pro>',
        to: [invoice.clients.email],
        subject: `⏰ Recordatorio: Factura #${invoice.number} ${daysOverdue > 0 ? '— VENCIDA' : ''}`,
        html,
      }),
    })

    if (!resendRes.ok) {
      const err = await resendRes.text()
      throw new Error(`Resend error: ${err}`)
    }

    // Update reminder count
    const newCount = (invoice.reminder_count || 0) + 1
    await supabase.from('invoices').update({
      last_reminder_at: new Date().toISOString(),
      reminder_count: newCount,
    }).eq('id', id)

    return NextResponse.json({ success: true, reminder_count: newCount })
  } catch (err) {
    console.error('Error sending reminder:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
