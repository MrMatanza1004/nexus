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

    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (invErr || !invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    const total = invoice.total || invoice.amount
    const amountInCents = Math.round(Number(total) * 100)

    // Create Stripe payment link via API
    const stripeRes = await fetch('https://api.stripe.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'line_items[0][price_data][currency]': 'mxn',
        'line_items[0][price_data][product_data][name]': `Factura #${invoice.number}`,
        'line_items[0][price_data][unit_amount]': String(amountInCents),
        'line_items[0][quantity]': '1',
        'after_completion[type]': 'redirect',
        'after_completion[redirect][url]': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ionexus.pro'}/dashboard/invoices?paid=${id}`,
      }),
    })

    if (!stripeRes.ok) {
      const err = await stripeRes.text()
      throw new Error(`Stripe error: ${err}`)
    }

    const paymentLink = await stripeRes.json()

    // Save to invoice
    await supabase.from('invoices').update({
      stripe_payment_link: paymentLink.url,
    }).eq('id', id)

    return NextResponse.json({ url: paymentLink.url })
  } catch (err) {
    console.error('Error generating payment link:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
