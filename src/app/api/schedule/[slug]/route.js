import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// GET /api/schedule/[slug] — get booking link info + available slots
export async function GET(req, { params }) {
  try {
    const { slug } = await params
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Get booking link
    const { data: link, error: linkErr } = await supabase
      .from('booking_links')
      .select('*')
      .eq('slug', slug)
      .single()

    if (linkErr || !link) {
      return NextResponse.json({ error: 'Booking link not found' }, { status: 404 })
    }

    // Get user availability
    const { data: availability } = await supabase
      .from('availability')
      .select('*')
      .eq('user_id', link.user_id)
      .eq('enabled', true)
      .order('day_of_week')

    // Get user display info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', link.user_id)
      .single()

    // Get existing events for next 30 days (to exclude booked slots)
    const start = new Date().toISOString()
    const end = new Date(Date.now() + 30 * 86400000).toISOString()
    const { data: existingEvents } = await supabase
      .from('events')
      .select('start_time, end_time')
      .eq('user_id', link.user_id)
      .gte('start_time', start)
      .lte('start_time', end)

    return NextResponse.json({
      link,
      profile: { name: profile?.full_name || 'Usuario' },
      availability: availability || [],
      existing_events: existingEvents || [],
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/schedule/[slug]/book — book an appointment (public)
export async function POST(req, { params }) {
  try {
    const { slug } = await params
    const body = await req.json()
    const { name, email, notes, start_time, end_time } = body

    if (!name || !email || !start_time) {
      return NextResponse.json({ error: 'name, email and start_time required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Get booking link to find user
    const { data: link } = await supabase
      .from('booking_links')
      .select('user_id, title')
      .eq('slug', slug)
      .single()

    if (!link) return NextResponse.json({ error: 'Link not found' }, { status: 404 })

    // Create the event
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        user_id: link.user_id,
        title: `📅 ${link.title || 'Reunión'} — ${name}`,
        description: notes || '',
        event_type: 'appointment',
        start_time,
        end_time: end_time || new Date(new Date(start_time).getTime() + 30 * 60000).toISOString(),
        status: 'confirmed',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Send confirmation email via Resend (fire and forget)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://ionexus.pro'}/api/email/send-appointment`, {
      method: 'POST',
      body: JSON.stringify({ to: email, name, event }),
    }).catch(() => {})

    return NextResponse.json({ success: true, event })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
