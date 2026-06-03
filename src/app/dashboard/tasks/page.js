'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { generateWithAI } from '@/lib/ai'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', due_date: '' })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showAI, setShowAI] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => { loadTasks() }, [])

  async function loadTasks() {
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) setTasks(data)
    setLoading(false)
  }

  async function addTask() {
    if (!newTask.title.trim()) return toast.error('Escribí un título para la tarea')
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: newTask.title,
      priority: newTask.priority,
      due_date: newTask.due_date || null,
      status: 'pending',
    }).select()
    if (error) return toast.error(error.message)
    setTasks([data[0], ...tasks])
    setNewTask({ title: '', priority: 'medium', due_date: '' })
    toast.success('Tarea creada')
  }

  async function toggleTask(task) {
    const newStatus = task.status === 'done' ? 'pending' : 'done'
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(tasks.filter(t => t.id !== id))
    toast.success('Tarea eliminada')
  }

  // 🧠 AI Task Breakdown
  async function aiBreakdown() {
    if (!aiInput.trim()) return toast.error('Describí el proyecto')
    setAiLoading(true)
    const loadingToast = toast.loading('🤖 La IA está desglosando el proyecto...')
    try {
      const { result } = await generateWithAI('tasks', aiInput)
      // Parse result into tasks
      const lines = result.split('\n').filter(l => l.trim())
      const parsedTasks = []
      for (const line of lines) {
        // Quitar números, guiones, checkboxes
        const clean = line.replace(/^[\d\.\-\*\s\[\]x]*\s*/i, '').trim()
        if (clean && clean.length > 5) {
          parsedTasks.push(clean)
        }
      }

      let user
      try {
        const { data } = await supabase.auth.getUser()
        user = data?.user
      } catch {
        user = null
      }

      if (user && parsedTasks.length > 0) {
        const inserts = parsedTasks.map(title => ({
          user_id: user.id,
          title: title.length > 200 ? title.substring(0, 200) : title,
          priority: 'medium',
          status: 'pending',
        }))
        const { data: newTasks, error } = await supabase.from('tasks').insert(inserts).select()
        if (!error && newTasks) {
          setTasks([...newTasks, ...tasks])
          toast.success(`✅ ${newTasks.length} tareas creadas desde el proyecto`, { id: loadingToast })
          setShowAI(false)
          setAiInput('')
        } else {
          toast.error(error.message, { id: loadingToast })
        }
      }
    } catch (err) {
      toast.error('Error: ' + err.message, { id: loadingToast })
    } finally {
      setAiLoading(false)
    }
  }

  // Add individual task from AI result
  async function addAiTask(title) {
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return

    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: title.length > 200 ? title.substring(0, 200) : title,
      priority: 'medium',
      status: 'pending',
    }).select()
    if (error) return toast.error(error.message)
    setTasks([data[0], ...tasks])
    toast.success('Tarea agregada')
  }

  const filtered = tasks.filter(t => filter === 'all' ? true : t.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">📋 Tareas</h1>
        <button
          onClick={() => setShowAI(true)}
          className="btn-primary text-sm flex items-center gap-2"
        >
          🤖 Desglosar proyecto
        </button>
      </div>

      {/* AI Modal */}
      {showAI && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !aiLoading && setShowAI(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">🤖 Desglosar proyecto con IA</h2>
              <button onClick={() => setShowAI(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Describí tu proyecto y la IA lo va a dividir en tareas accionables con prioridades.</p>
            <textarea
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              className="input-field w-full mb-4"
              rows={5}
              placeholder="Ej: Hacer una landing page para un cliente que vende cursos online. Necesito secciones: hero, servicios, testimonios, FAQ, y formulario de contacto. También integrar Stripe para pagos y un dashboard simple."
              disabled={aiLoading}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAI(false)} className="text-sm text-slate-600 hover:text-slate-800 px-4 py-2" disabled={aiLoading}>Cancelar</button>
              <button onClick={aiBreakdown} disabled={aiLoading || !aiInput.trim()} className="btn-primary flex items-center gap-2">
                {aiLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Desglosando...
                  </>
                ) : '🚀 Desglosar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newTask.title}
          onChange={e => setNewTask({ ...newTask, title: e.target.value })}
          className="input-field flex-1"
          placeholder="¿Qué necesitás hacer?"
          onKeyDown={e => e.key === 'Enter' && addTask()}
        />
        <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} className="input-field w-auto">
          <option value="low">🟢 Baja</option>
          <option value="medium">🟡 Media</option>
          <option value="high">🔴 Alta</option>
        </select>
        <input type="date" value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} className="input-field w-auto" />
        <button onClick={addTask} className="btn-primary shrink-0">Agregar</button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'done', label: 'Completadas' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.key ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-slate-500">No hay tareas {filter !== 'all' ? (filter === 'done' ? 'completadas' : 'pendientes') : ''}</p>
          <p className="text-xs text-slate-400 mt-2">Usá "🤖 Desglosar proyecto" para generar tareas desde una descripción</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => (
            <div key={task.id} className={`card p-4 flex items-center gap-3 card-hover ${task.status === 'done' ? 'opacity-60' : ''}`}>
              <button onClick={() => toggleTask(task)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-violet-500'}`}>
                {task.status === 'done' && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  {task.priority === 'high' && <span className="badge-danger">Alta</span>}
                  {task.priority === 'medium' && <span className="badge-warning">Media</span>}
                  {task.priority === 'low' && <span className="badge-info">Baja</span>}
                  {task.due_date && <span className="text-xs text-slate-400">📅 {formatDate(task.due_date)}</span>}
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
