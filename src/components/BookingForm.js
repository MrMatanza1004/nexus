'use client'

import { useState, useMemo } from 'react'
import {
  addDays, format, parseISO, startOfDay,
  isBefore, isAfter, addMinutes, isEqual,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, ChevronLeft, Calendar, CheckCircle } from 'lucide-react'

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/**
 * @param {{ availability: Array<{day_of_week: number, start_time: string, end_time: string}>, duration: number, slug: string, existingEvents: Array<{start_time: string, end_time: string}>, advanceNotice: number, maxPerDay: number, bufferBefore: number, bufferAfter: number }} props
 */
export default function BookingForm({
  availability,
  duration,
  slug,
  existingEvents,
  advanceNotice = 1440,
  maxPerDay = 3,
  bufferBefore = 0,
  bufferAfter = 0,
}) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const earliestBookable = useMemo(
    () => addDays(today, Math.ceil(advanceNotice / 1440)),
    [today, advanceNotice]
  )

  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [confirmedEvent, setConfirmedEvent] = useState(null)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Generate available slots grouped by day
  const slotsByDay = useMemo(() => {
    const result = []

    // Generate days from earliest bookable to earliest + 30 days
    const maxDays = addDays(earliestBookable, 30)
    let day = earliestBookable

    while (isBefore(day, maxDays) || isEqual(day, maxDays)) {
      const dayOfWeek = day.getDay()
      const daySlots = availability
        .filter(a => a.day_of_week === dayOfWeek)
        .flatMap(a => {
          const slots = []
          const startParts = a.start_time.split(':').map(Number)
          const endParts = a.end_time.split(':').map(Number)
          let slotStart = new Date(day)
          slotStart.setHours(startParts[0], startParts[1], 0, 0)
          const slotEndLimit = new Date(day)
          slotEndLimit.setHours(endParts[0], endParts[1], 0, 0)

          while (isBefore(addMinutes(slotStart, duration), slotEndLimit) || isEqual(addMinutes(slotStart, duration), slotEndLimit)) {
            const slotEnd = addMinutes(slotStart, duration)

            // Check if this slot conflicts with existing events
            const hasConflict = existingEvents.some(event => {
              const eventStart = parseISO(event.start_time)
              const eventEnd = event.end_time ? parseISO(event.end_time) : addMinutes(eventStart, 30)
              return (
                (isBefore(slotStart, eventEnd) || isEqual(slotStart, eventEnd)) &&
                (isAfter(slotEnd, eventStart) || isEqual(slotEnd, eventStart))
              )
            })

            if (!hasConflict) {
              // Check if slot is in the past
              if (isAfter(slotStart, new Date())) {
                slots.push({
                  start: new Date(slotStart),
                  end: new Date(slotEnd),
                  label: `${format(slotStart, 'HH:mm')} - ${format(slotEnd, 'HH:mm')}`,
                })
              }
            }

            slotStart = addMinutes(slotStart, duration)
          }
          return slots
        })

      // Check max per day
      if (daySlots.length > maxPerDay) {
        daySlots.length = maxPerDay
      }

      if (daySlots.length > 0) {
        result.push({
          date: new Date(day),
          label: format(day, "EEEE d 'de' MMMM", { locale: es }),
          slots: daySlots,
        })
      }

      day = addDays(day, 1)
    }

    return result.slice(0, 21) // cap at 21 days visible
  }, [availability, duration, earliestBookable, existingEvents, maxPerDay])

  function handleSlotSelect(slot) {
    setSelectedSlot(slot)
    setShowForm(true)
    setError('')
  }

  function goBack() {
    setShowForm(false)
    setSelectedSlot(null)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedSlot) return
    if (!form.name.trim()) return setError('El nombre es obligatorio')
    if (!form.email.trim()) return setError('El email es obligatorio')

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/schedule/${slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: form.name,
          email: form.email,
          notes: form.notes || '',
          start_time: selectedSlot.start.toISOString(),
          end_time: selectedSlot.end.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })

      const data = await res.json()
      if (data.error) {
        setError(data.error)
        return
      }

      setConfirmedEvent(data.event || data)
    } catch {
      setError('Error de conexión. Intentalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Confirmation Screen ──
  if (confirmedEvent) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          ¡Reunión agendada!
        </h2>
        <p className="text-slate-500 mb-6">
          Recibirás un email de confirmación.
        </p>
        <div className="card p-4 bg-slate-50 border-slate-200 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-violet-500 shrink-0" />
            <span className="font-medium text-slate-900">
              {format(parseISO(confirmedEvent.start_time), "EEEE d 'de' MMMM, yyyy", { locale: es })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-violet-500 shrink-0" />
            <span className="text-slate-700">
              {format(parseISO(confirmedEvent.start_time), 'HH:mm')} - {format(parseISO(confirmedEvent.end_time), 'HH:mm')}
            </span>
          </div>
          <div className="text-sm text-slate-600 border-t border-slate-200 pt-2 mt-2">
            <p>Nombre: <span className="font-medium text-slate-900">{confirmedEvent.title?.replace('Reunión: ', '') || form.name}</span></p>
            <p>Email: <span className="font-medium text-slate-900">{form.email}</span></p>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 1: Select Slot ──
  if (!showForm) {
    return (
      <div>
        <h3 className="font-semibold text-slate-900 mb-4 text-center">
          Seleccioná un horario disponible
        </h3>

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4 mb-4 text-sm">
          <span className="font-medium text-slate-700">
            {MONTH_LABELS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
        </div>

        {slotsByDay.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No hay horarios disponibles en los próximos 30 días</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {slotsByDay.map(group => (
              <div key={group.date.toISOString()}>
                <p className="text-sm font-semibold text-slate-700 mb-2 capitalize">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.slots.map((slot, i) => (
                    <button
                      key={i}
                      onClick={() => handleSlotSelect(slot)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedSlot && isEqual(selectedSlot.start, slot.start)
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'border-slate-200 text-slate-700 hover:border-violet-400 hover:text-violet-600 bg-white'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Step 2: Fill Form ──
  return (
    <div>
      <button
        onClick={goBack}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver a horarios
      </button>

      <div className="card p-3 bg-violet-50 border-violet-200 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-violet-600 shrink-0" />
          <span className="font-medium text-violet-900">{selectedSlot.label}</span>
        </div>
        <p className="text-xs text-violet-600 mt-1">
          {format(selectedSlot.start, "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="Tu nombre"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="input-field"
            placeholder="tu@email.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notas (opcional)</label>
          <textarea
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="input-field"
            rows={3}
            placeholder="Algo que quieras comentar..."
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Agendando...
            </>
          ) : (
            'Agendar reunión'
          )}
        </button>
      </form>
    </div>
  )
}
