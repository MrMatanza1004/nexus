import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

// POST /api/schedule/[slug]/book — publicly book a meeting
export async function POST(req, { params }) {
  try {
    const { slug } = await params

    // Admin client to read/write without auth (public booking)
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    // Get booking link
    const { data: link } = await supabaseAdmin
      .from('booking_links')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!link || !link.enabled) {
      return NextResponse.json({ error: 'Link no encontrado o desactivado' }, { status: 404 })
    }

    const body = await req.json()
    const { name, email, notes, start_time, end_time, timezone } = body

    // Basic validation
    if (!name || !email || !start_time) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const startDate = new Date(start_time)
    const endDate = end_time ? new Date(end_time) : new Date(startDate.getTime() + link.duration * 60000)

    // Validate advance notice
    const now = new Date()
    const minAdvance = new Date(now.getTime() + (link.advance_notice || 1440) * 60000)
    if (startDate < minAdvance) {
      return NextResponse.json({
        error: `Debe agendarse con al menos ${Math.round((link.advance_notice || 1440) / 60)}h de anticipación`,
      }, { status: 400 })
    }

    // Check for conflicts
    const { data: conflictingEvents } = await supabaseAdmin
      .from('events')
      .select('id, start_time, end_time')
      .eq('user_id', link.user_id)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())

    if (conflictingEvents && conflictingEvents.length > 0) {
      return NextResponse.json({
        error: 'Este horario ya no está disponible. Por favor elegí otro.',
      }, { status: 409 })
    }

    // Count existing events on this day for max_per_day check
    const dayStart = new Date(startDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(startDate)
    dayEnd.setHours(23, 59, 59, 999)

    const { count: dayCount } = await supabaseAdmin
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', link.user_id)
      .gte('start_time', dayStart.toISOString())
      .lte('start_time', dayEnd.toISOString())

    if (dayCount && link.max_per_day && dayCount >= link.max_per_day) {
      return NextResponse.json({
        error: 'Se alcanzó el máximo de reuniones para este día',
      }, { status: 409 })
    }

    // Create the event
    const eventDescription = [
      notes && `Notas: ${notes}`,
      `Email: ${email}`,
      timezone && `Timezone: ${timezone}`,
    ].filter(Boolean).join(' | ')

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .insert({
        user_id: link.user_id,
        title: `Reunión: ${name}`,
        description: eventDescription || '',
        event_type: 'appointment',
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        location: timezone ? `Timezone: ${timezone}` : null,
        status: 'confirmed',
      })
      .select()
      .single()

    if (error) {
      console.error('Booking insert error:', error)
      return NextResponse.json({ error: 'Error al agendar la reunión' }, { status: 500 })
    }

    return NextResponse.json({ event, success: true })
  } catch (err) {
    console.error('Schedule booking error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
