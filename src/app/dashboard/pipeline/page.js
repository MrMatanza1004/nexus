'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { DndContext, DragOverlay, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, defaultPreset } from '@dnd-kit/core'

const STAGES = [
  { key: 'lead', label: 'Prospectos', color: 'bg-slate-100', accent: 'bg-slate-400' },
  { key: 'contacted', label: 'Contactados', color: 'bg-blue-50', accent: 'bg-blue-400' },
  { key: 'meeting', label: 'Reunion', color: 'bg-amber-50', accent: 'bg-amber-400' },
  { key: 'proposal', label: 'Propuesta', color: 'bg-violet-50', accent: 'bg-violet-400' },
  { key: 'negotiation', label: 'Negociacion', color: 'bg-orange-50', accent: 'bg-orange-400' },
  { key: 'won', label: 'Ganados', color: 'bg-emerald-50', accent: 'bg-emerald-400' },
  { key: 'lost', label: 'Perdidos', color: 'bg-red-50', accent: 'bg-red-400' },
]

function DropZone({ stage, leads, onMove, className = '' }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key })

  return (
    <div
      ref={setNodeRef}
      className={`${className} rounded-xl p-3 min-w-[180px] transition-all ${stage.color} ${isOver ? 'ring-2 ring-violet-400 ring-offset-2 scale-[1.02]' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-700">{stage.label}</h3>
        <span className={`text-xs font-bold text-white rounded-full px-2 py-0.5 ${stage.accent}`}>
          {leads.length}
        </span>
      </div>
      <div className="space-y-2 min-h-[60px]">
        {leads.map(lead => (
          <DraggableCard key={lead.id} lead={lead} stage={stage} onMove={onMove} />
        ))}
      </div>
    </div>
  )
}

function DraggableCard({ lead, stage, onMove }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id, data: { stage: stage.key } })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  } : undefined

  const stageIndex = STAGES.findIndex(s => s.key === stage.key)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white rounded-lg p-3 shadow-sm border border-slate-200/60 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <p className="font-semibold text-sm text-slate-900 truncate">{lead.name}</p>
      {lead.company && <p className="text-xs text-slate-500 truncate">{lead.company}</p>}
      {lead.email && <p className="text-xs text-slate-400 truncate mt-1">{lead.email}</p>}
      <p className="text-xs text-slate-400 mt-1">{formatDate(lead.created_at)}</p>
      <div className="flex gap-1 mt-2">
        {stageIndex > 0 && (
          <button onClick={(e) => { e.stopPropagation(); onMove(lead.id, STAGES[stageIndex - 1].key) }}
            className="text-xs bg-slate-100 hover:bg-slate-200 rounded px-2 py-1 transition-all" title="Mover atras"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" /></svg></button>
        )}
        {stageIndex < STAGES.length - 1 && stage.key !== 'lost' && stage.key !== 'won' && (
          <button onClick={(e) => { e.stopPropagation(); onMove(lead.id, STAGES[stageIndex + 1].key) }}
            className="text-xs bg-slate-100 hover:bg-slate-200 rounded px-2 py-1 transition-all" title="Mover adelante"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" /></svg></button>
        )}
        {stage.key !== 'won' && stage.key !== 'lost' && (
          <>
            <button onClick={(e) => { e.stopPropagation(); onMove(lead.id, 'won') }}
              className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded px-2 py-1 transition-all" title="Ganado"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button>
            <button onClick={(e) => { e.stopPropagation(); onMove(lead.id, 'lost') }}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded px-2 py-1 transition-all" title="Perdido"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </>
        )}
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const [leads, setLeads] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', company: '', notes: '', pipeline_stage: 'lead' })
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => { loadLeads() }, [])

  async function loadLeads() {
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const { data } = await supabase.from('clients').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
    if (data) setLeads(data)
    setLoading(false)
  }

  async function addLead(e) {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('El nombre es obligatorio')
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const { data, error } = await supabase.from('clients').insert({
      name: form.name, email: form.email, company: form.company, notes: form.notes,
      pipeline_stage: form.pipeline_stage, user_id: user.id,
    }).select()
    if (error) return toast.error(error.message)
    setLeads([data[0], ...leads])
    setForm({ name: '', email: '', company: '', notes: '', pipeline_stage: 'lead' })
    setShowForm(false)
    toast.success('Lead agregado')
  }

  async function moveLead(id, newStage) {
    setLeads(leads.map(l => l.id === id ? { ...l, pipeline_stage: newStage } : l))
    const { error } = await supabase.from('clients').update({ pipeline_stage: newStage, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { toast.error(error.message); loadLeads() }
  }

  function handleDragStart(event) {
    setActiveId(event.active.id)
  }

  function handleDragEnd(event) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const leadId = active.id
    const lead = leads.find(l => l.id === leadId)
    if (!lead) return

    const fromStage = active.data.current?.stage
    const toStage = over.id

    if (fromStage && toStage && fromStage !== toStage && STAGES.some(s => s.key === toStage)) {
      moveLead(leadId, toStage)
    }
  }

  const grouped = useMemo(() =>
    Object.fromEntries(STAGES.map(s => [s.key, leads.filter(l => l.pipeline_stage === s.key)])),
    [leads]
  )

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pipeline de Ventas</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancelar' : '+ Nuevo Lead'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addLead} className="card p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
              <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Etapa inicial</label>
            <select value={form.pipeline_stage} onChange={e => setForm({ ...form, pipeline_stage: e.target.value })} className="input-field">
              {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field" rows={2} placeholder="Notas del lead..." />
          </div>
          <button type="submit" className="btn-primary">Agregar Lead</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : leads.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 6l-9.5 9.5-5-5L1 18" /></svg>
          <p className="text-slate-500">Aún no tenés leads. Empezá a trackear tus prospectos.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-7">
            {STAGES.map(stage => (
              <DropZone key={stage.key} stage={stage} leads={grouped[stage.key] || []} onMove={moveLead} className="min-w-[240px] snap-start md:min-w-0" />
            ))}
          </div>
          <DragOverlay>
            {activeLead ? (
              <div className="bg-white rounded-lg p-3 shadow-xl border-2 border-violet-400 w-[180px]">
                <p className="font-semibold text-sm text-slate-900 truncate">{activeLead.name}</p>
                {activeLead.company && <p className="text-xs text-slate-500 truncate">{activeLead.company}</p>}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <div className="card p-4 mt-4 text-sm text-slate-500">
        <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> <strong>ProTip:</strong> Arrastrá las tarjetas entre columnas para mover leads. También podés usar los botones de navegación y acciones.
      </div>
    </div>
  )
}
