'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

const statuses = ['idea', 'in_progress', 'review', 'done', 'cancelled']
const statusLabels = { idea: 'Idea', in_progress: 'En Progreso', review: 'Revisión', done: 'Completado', cancelled: 'Cancelado' }
const statusColors = { idea: 'bg-slate-100 text-slate-700', in_progress: 'bg-blue-100 text-blue-700', review: 'bg-amber-100 text-amber-700', done: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700' }

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', client_id: '', description: '', budget: '', deadline: '', status: 'idea' })
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list')
  const [selectedProject, setSelectedProject] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const [projRes, clientRes] = await Promise.all([
      supabase.from('projects').select('*, clients(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name').eq('user_id', user.id),
    ])
    if (projRes.data) setProjects(projRes.data)
    if (clientRes.data) setClients(clientRes.data)
    setLoading(false)
  }

  async function saveProject(e) {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('El nombre del proyecto es obligatorio')
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const { data, error } = await supabase.from('projects').insert({
      ...form, budget: form.budget ? Number(form.budget) : null, user_id: user.id,
    }).select('*, clients(name)')
    if (error) return toast.error(error.message)
    setProjects([data[0], ...projects])
    setForm({ name: '', client_id: '', description: '', budget: '', deadline: '', status: 'idea' })
    setShowForm(false)
    toast.success('Proyecto creado')
  }

  async function updateStatus(id, status) {
    await supabase.from('projects').update({ status }).eq('id', id)
    setProjects(projects.map(p => p.id === id ? { ...p, status } : p))
    toast.success(`Estado actualizado a: ${statusLabels[status]}`)
  }

  function openDetail(project) {
    setSelectedProject(project)
    setShowDetail(true)
  }

  // Kanban columns
  const columns = { idea: [], in_progress: [], review: [], done: [], cancelled: [] }
  projects.forEach(p => { if (columns[p.status]) columns[p.status].push(p) })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Proyectos</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-violet-100 text-violet-700' : 'text-slate-400 hover:text-slate-600'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </button>
          <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-violet-100 text-violet-700' : 'text-slate-400 hover:text-slate-600'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
            {showForm ? 'Cancelar' : '+ Nuevo Proyecto'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={saveProject} className="card p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className="input-field">
                <option value="">Sin cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Presupuesto</label>
              <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="input-field" placeholder="$0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha límite</label>
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
          </div>
          <button type="submit" className="btn-primary">Crear Proyecto</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center"><svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg><p className="text-slate-500">Todavía no hay proyectos</p></div>
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-5 gap-3 overflow-x-auto pb-4">
          {statuses.map(status => (
            <div key={status} className="min-w-[220px]">
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="font-semibold text-sm text-slate-700">{statusLabels[status]}</h3>
                <span className="badge bg-slate-200 text-slate-600">{columns[status].length}</span>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {columns[status].map(project => (
                  <div key={project.id} onClick={() => openDetail(project)} className="card p-3 card-hover cursor-pointer">
                    <h4 className="font-medium text-slate-900 text-sm mb-1">{project.name}</h4>
                    {project.clients?.name && <p className="text-xs text-slate-500 mb-2">{project.clients.name}</p>}
                    {project.budget && <p className="text-xs font-medium text-emerald-600">{formatCurrency(project.budget)}</p>}
                    {project.deadline && <p className="text-xs text-slate-400 mt-1"><svg className="w-3.5 h-3.5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9h18M21 5v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3v4M17 3v4M3 13h18" /></svg>{formatDate(project.deadline)}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <div key={project.id} onClick={() => openDetail(project)} className="card p-5 card-hover cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-900">{project.name}</h3>
                <span className={`badge text-xs ${statusColors[project.status]}`}>{statusLabels[project.status]}</span>
              </div>
              {project.clients?.name && <p className="text-sm text-slate-500 mb-2"><svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a4 4 0 100 8 4 4 0 000-8z" /></svg>{project.clients.name}</p>}
              {project.description && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{project.description}</p>}
              <div className="flex items-center justify-between text-xs text-slate-400">
                {project.budget && <span>{formatCurrency(project.budget)}</span>}
                {project.deadline && <span><svg className="w-3.5 h-3.5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9h18M21 5v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3v4M17 3v4M3 13h18" /></svg>{formatDate(project.deadline)}</span>}
              </div>
              <div className="flex gap-1 mt-3 pt-3 border-t border-slate-100">
                {statuses.map(s => (
                  <button key={s} onClick={e => { e.stopPropagation(); updateStatus(project.id, s) }} className={`w-2 h-2 rounded-full ${project.status === s ? 'ring-2 ring-violet-500' : ''} ${s === 'done' ? 'bg-emerald-500' : s === 'cancelled' ? 'bg-red-500' : s === 'in_progress' ? 'bg-blue-500' : s === 'review' ? 'bg-amber-500' : 'bg-slate-300'}`} title={statusLabels[s]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetail(false)}>
          <div className="card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">{selectedProject.name}</h2>
              <button onClick={() => setShowDetail(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2"><span className="text-sm font-medium text-slate-500">Estado:</span><span className={`badge ${statusColors[selectedProject.status]}`}>{statusLabels[selectedProject.status]}</span></div>
              {selectedProject.clients?.name && <p className="text-sm"><span className="font-medium text-slate-500">Cliente:</span> {selectedProject.clients.name}</p>}
              {selectedProject.budget && <p className="text-sm"><span className="font-medium text-slate-500">Presupuesto:</span> {formatCurrency(selectedProject.budget)}</p>}
              {selectedProject.deadline && <p className="text-sm"><span className="font-medium text-slate-500">Fecha límite:</span> {formatDate(selectedProject.deadline)}</p>}
              {selectedProject.description && <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedProject.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
