'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, subMonths, addMonths, isSameMonth, isSameDay,
  format, parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, Trash2 } from 'lucide-react'

const EVENT_COLORS = {
  event: 'bg-violet-500',
  appointment: 'bg-emerald-500',
  reminder: 'bg-amber-500',
  deadline: 'bg-red-500',
  call: 'bg-cyan-500',
}

const EVENT_LABELS = {
  event: 'Evento',
  appointment: 'Cita',
  reminder: 'Recordatorio',
  deadline: 'Vencimiento',
  call: 'Llamada',
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [form, setForm] = useState({
    title: '', description: '', event_type: 'event',
    start_time: '', end_time: '', client_id: '', project_id: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadMonthEvents()
    loadClientsAndProjects()
  }, [currentDate])

  async function loadMonthEvents() {
    setLoading(true)
    const start = startOfMonth(currentDate).toISOString()
    const end = endOfMonth(currentDate).toISOString()

    try {
      const res = await fetch(`/api/calendar/events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`)
      const data = await res.json()
      if (data.events) setEvents(data.events)
    } catch {
      toast.error('Error al cargar eventos')
    } finally {
      setLoading(false)
    }
  }

  async function loadClientsAndProjects() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [cRes, pRes] = await Promise.all([
        supabase.from('clients').select('id, name').eq('user_id', user.id),
        supabase.from('projects').select('id, name').eq('user_id', user.id),
      ])
      if (cRes.data) setClients(cRes.data)
      if (pRes.data) setProjects(pRes.data)
    } catch {
      // silently fail
    }
  }

  function getCalendarDays() {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    const days = []
    let day = calStart
    while (day <= calEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }

  function getEventsForDay(day) {
    return events.filter(e => {
      try {
        return isSameDay(parseISO(e.start_time), day)
      } catch {
        return false
      }
    })
  }

  function openAddModal(day) {
    setSelectedDay(day)
    setEditingEvent(null)
    const dateStr = format(day, "yyyy-MM-dd'T'09:00")
    setForm({
      title: '', description: '', event_type: 'event',
      start_time: dateStr, end_time: dateStr.replace('09:00', '10:00'),
      client_id: '', project_id: '',
    })
    setShowModal(true)
  }

  function openEditModal(event) {
    setSelectedDay(parseISO(event.start_time))
    setEditingEvent(event)
    setForm({
      title: event.title || '',
      description: event.description || '',
      event_type: event.event_type || 'event',
      start_time: event.start_time?.slice(0, 16) || '',
      end_time: event.end_time?.slice(0, 16) || '',
      client_id: event.client_id || '',
      project_id: event.project_id || '',
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingEvent(null)
    setSelectedDay(null)
  }

  async function saveEvent(e) {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('El título es obligatorio')
    if (!form.start_time) return toast.error('La fecha de inicio es obligatoria')

    setSaving(true)
    const loadingToast = toast.loading(editingEvent ? 'Actualizando...' : 'Guardando...')

    try {
      const body = {
        title: form.title,
        description: form.description,
        event_type: form.event_type,
        start_time: new Date(form.start_time).toISOString(),
        end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
        client_id: form.client_id || null,
        project_id: form.project_id || null,
      }

      let res
      if (editingEvent) {
        res = await fetch('/api/calendar/events', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingEvent.id, ...body }),
        })
      } else {
        res = await fetch('/api/calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      const data = await res.json()
      if (data.error) {
        toast.error(data.error, { id: loadingToast })
        return
      }

      toast.success(editingEvent ? 'Evento actualizado' : 'Evento creado', { id: loadingToast })
      closeModal()
      loadMonthEvents()
    } catch (err) {
      toast.error('Error al guardar: ' + err.message, { id: loadingToast })
    } finally {
      setSaving(false)
    }
  }

  async function deleteEvent() {
    if (!editingEvent) return
    if (!confirm('¿Eliminar este evento permanentemente?')) return

    const loadingToast = toast.loading('Eliminando...')
    try {
      const res = await fetch('/api/calendar/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingEvent.id }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error, { id: loadingToast })
        return
      }
      toast.success('Evento eliminado', { id: loadingToast })
      closeModal()
      loadMonthEvents()
    } catch (err) {
      toast.error('Error al eliminar', { id: loadingToast })
    }
  }

  const calendarDays = getCalendarDays()
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-violet-600" />
          Calendario
        </h1>
      </div>

      {/* Month Navigation */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-slate-900">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week day headers */}
        <div className="hidden sm:grid sm:grid-cols-7 gap-px mb-px">
          {weekDays.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Desktop: Month Grid */}
            <div className="hidden sm:grid sm:grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
              {calendarDays.map((day, idx) => {
                const dayEvents = getEventsForDay(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isToday = isSameDay(day, new Date())

                return (
                  <button
                    key={idx}
                    onClick={() => openAddModal(day)}
                    className={`min-h-[100px] p-2 text-left transition-all hover:bg-violet-50 group ${
                      isCurrentMonth ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1 ${
                        isToday
                          ? 'bg-violet-600 text-white'
                          : isCurrentMonth
                            ? 'text-slate-900'
                            : 'text-slate-400'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div
                          key={ev.id}
                          onClick={e => { e.stopPropagation(); openEditModal(ev) }}
                          className={`text-xs px-1.5 py-0.5 rounded text-white truncate cursor-pointer ${EVENT_COLORS[ev.event_type] || 'bg-slate-500'}`}
                          title={ev.title}
                        >
                          {ev.start_time && format(parseISO(ev.start_time), 'HH:mm')}{' '}
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-slate-400 font-medium px-1">
                          +{dayEvents.length - 3} más
                        </div>
                      )}
                    </div>

                    {dayEvents.length === 0 && isCurrentMonth && (
                      <div className="text-xs text-slate-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-3 h-3 inline mr-0.5" />
                        Agregar
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Mobile: List view */}
            <div className="sm:hidden space-y-2">
              {events.length === 0 ? (
                <div className="card p-8 text-center">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No hay eventos este mes</p>
                  <button
                    onClick={() => openAddModal(new Date())}
                    className="btn-primary text-sm mt-4 inline-flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar evento
                  </button>
                </div>
              ) : (
                events.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => openEditModal(ev)}
                    className="card p-4 w-full text-left card-hover flex items-start gap-3"
                  >
                    <div className={`w-2 h-full min-h-[40px] rounded-full shrink-0 mt-1 ${EVENT_COLORS[ev.event_type] || 'bg-slate-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{ev.title}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ev.start_time ? format(parseISO(ev.start_time), 'd MMM, HH:mm', { locale: es }) : '—'}
                        </span>
                        <span className="badge-info text-xs">{EVENT_LABELS[ev.event_type] || ev.event_type}</span>
                      </div>
                      {ev.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{ev.description}</p>
                      )}
                      {(ev.clients?.name || ev.projects?.name) && (
                        <div className="flex gap-2 mt-1">
                          {ev.clients?.name && <span className="text-xs text-violet-600 font-medium">{ev.clients.name}</span>}
                          {ev.projects?.name && <span className="text-xs text-emerald-600 font-medium">{ev.projects.name}</span>}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Desktop empty state */}
            {events.length === 0 && !loading && (
              <div className="hidden sm:block card p-8 text-center mt-4">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No hay eventos este mes</p>
                <p className="text-xs text-slate-400 mt-1">Hacé clic en un día para agregar un evento</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 text-lg">
                {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={saveEvent} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="input-field"
                  placeholder="Nombre del evento"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Detalles del evento (opcional)"
                />
              </div>

              {/* Date & Time */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Inicio *</label>
                  <input
                    type="datetime-local"
                    value={form.start_time}
                    onChange={e => setForm({ ...form, start_time: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fin</label>
                  <input
                    type="datetime-local"
                    value={form.end_time}
                    onChange={e => setForm({ ...form, end_time: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select
                  value={form.event_type}
                  onChange={e => setForm({ ...form, event_type: e.target.value })}
                  className="input-field"
                >
                  <option value="event">📌 Evento</option>
                  <option value="appointment">📅 Cita</option>
                  <option value="reminder">⏰ Recordatorio</option>
                  <option value="deadline">🚨 Vencimiento</option>
                  <option value="call">📞 Llamada</option>
                </select>
              </div>

              {/* Client & Project */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                  <select
                    value={form.client_id}
                    onChange={e => setForm({ ...form, client_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Sin cliente</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto</label>
                  <select
                    value={form.project_id}
                    onChange={e => setForm({ ...form, project_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Sin proyecto</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                {editingEvent ? (
                  <button
                    type="button"
                    onClick={deleteEvent}
                    className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-sm text-slate-600 hover:text-slate-800 px-4 py-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      editingEvent ? 'Actualizar' : 'Guardar'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
