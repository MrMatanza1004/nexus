import { createServerClient } from '@supabase/ssr'
import BookingForm from '@/components/BookingForm'

export const dynamic = 'force-dynamic'

export default async function SchedulePage({ params }) {
  const { slug } = await params

  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // Fetch booking link by slug
  const { data: link } = await supabaseAdmin
    .from('booking_links')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!link || !link.enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="card p-12 text-center max-w-md mx-4">
          <div className="text-5xl mb-4">📅</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Link no encontrado</h1>
          <p className="text-slate-500">
            El link de agendamiento no existe o ha sido desactivado.
          </p>
        </div>
      </div>
    )
  }

  // Fetch user details for display
  const { data: userProfile } = await supabaseAdmin
    .from('profiles')
    .select('full_name')
    .eq('id', link.user_id)
    .single()

  // Fetch availability for this user
  const { data: availability } = await supabaseAdmin
    .from('availability')
    .select('*')
    .eq('user_id', link.user_id)
    .eq('enabled', true)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  // Fetch existing events to avoid conflicts
  const now = new Date().toISOString()
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: existingEvents } = await supabaseAdmin
    .from('events')
    .select('start_time, end_time')
    .eq('user_id', link.user_id)
    .gte('start_time', now)
    .lte('start_time', thirtyDaysFromNow)

  const safeAvailability = availability || []
  const safeEvents = existingEvents || []

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📅</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {link.title || 'Agenda una reunión'}
          </h1>
          {link.description && (
            <p className="text-slate-500">{link.description}</p>
          )}
          {userProfile?.full_name && (
            <p className="text-sm text-slate-400 mt-1">
              con <span className="font-medium text-slate-600">{userProfile.full_name}</span>
            </p>
          )}
          <p className="text-sm text-slate-400 mt-1">
            Duración: {link.duration} minutos
          </p>
        </div>

        {/* Booking Form */}
        <div className="card p-6 sm:p-8">
          <BookingForm
            availability={safeAvailability}
            duration={link.duration}
            slug={slug}
            existingEvents={safeEvents}
            advanceNotice={link.advance_notice || 1440}
            maxPerDay={link.max_per_day || 3}
            bufferBefore={link.buffer_before || 0}
            bufferAfter={link.buffer_after || 0}
          />
        </div>
      </div>
    </div>
  )
}
