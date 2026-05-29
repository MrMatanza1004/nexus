'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

const categories = ['Ingresos', 'Clientes', 'Proyectos', 'Ahorro', 'Otro']

export default function GoalsPage() {
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', target_amount: '', category: 'Ingresos', deadline: '' })

  useEffect(() => { loadGoals() }, [])

  async function loadGoals() {
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const { data } = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) setGoals(data)
    setLoading(false)
  }

  async function saveGoal(e) {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Escribí un título')
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const { error } = await supabase.from('goals').insert({
      user_id: user.id, title: form.title,
      target_amount: Number(form.target_amount),
      current_amount: 0,
      category: form.category, deadline: form.deadline || null,
    })
    if (error) return toast.error(error.message)
    setForm({ title: '', target_amount: '', category: 'Ingresos', deadline: '' })
    setShowForm(false)
    toast.success('Meta creada! 🎯')
    loadGoals()
  }

  async function updateProgress(goal, amount) {
    const newCurrent = Number(goal.current_amount) + Number(amount)
    await supabase.from('goals').update({ current_amount: newCurrent }).eq('id', goal.id)
    setGoals(goals.map(g => g.id === goal.id ? { ...g, current_amount: newCurrent } : g))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">🎯 Metas</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancelar' : '+ Nueva Meta'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveGoal} className="card p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Ganar $5K este mes" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Meta $</label>
              <input type="number" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} className="input-field" placeholder="5000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha límite</label>
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input-field" />
          </div>
          <button type="submit" className="btn-primary">Crear Meta</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : goals.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-4xl mb-3">🎯</p><p className="text-slate-500">No hay metas todavía. Definí tus objetivos.</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map(goal => {
            const pct = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0
            return (
              <div key={goal.id} className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{goal.title}</h3>
                  <span className="badge-info text-xs">{goal.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                  <span>{formatCurrency(goal.current_amount)}</span>
                  <span className="font-medium">{formatCurrency(goal.target_amount)}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full gradient-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-violet-600">{Math.round(pct)}%</span>
                  {goal.deadline && <span className="text-slate-400">📅 {formatDate(goal.deadline)}</span>}
                </div>
                <div className="flex gap-2 mt-3">
                  {[100, 500, 1000].map(amount => (
                    <button key={amount} onClick={() => updateProgress(goal, amount)} className="text-xs px-3 py-1 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition-all">
                      +{formatCurrency(amount)}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
