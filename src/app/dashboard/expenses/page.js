'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

const categories = ['Herramientas', 'Marketing', 'Servicios', 'Comida', 'Transporte', 'Educación', 'Oficina', 'Otros']

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ amount: '', category: 'Herramientas', description: '', date: '' })
  const [totalByCategory, setTotalByCategory] = useState({})

  useEffect(() => { loadExpenses() }, [])

  async function loadExpenses() {
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const { data } = await supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false })
    if (data) {
      setExpenses(data)
      const byCat = {}
      data.forEach(e => {
        byCat[e.category] = (byCat[e.category] || 0) + Number(e.amount)
      })
      setTotalByCategory(byCat)
    }
    setLoading(false)
  }

  async function saveExpense(e) {
    e.preventDefault()
    if (!form.amount) return toast.error('El monto es obligatorio')
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      amount: Number(form.amount),
      category: form.category,
      description: form.description,
      date: form.date || new Date().toISOString().split('T')[0],
    })
    if (error) return toast.error(error.message)
    setForm({ amount: '', category: 'Herramientas', description: '', date: '' })
    setShowForm(false)
    toast.success('Gasto registrado')
    loadExpenses()
  }

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">💸 Gastos</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancelar' : '+ Registrar Gasto'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-slate-500">Total gastado</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </div>
        {Object.entries(totalByCategory).slice(0, 3).map(([cat, amount]) => (
          <div key={cat} className="card p-4">
            <p className="text-sm text-slate-500">{cat}</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(amount)}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={saveExpense} className="card p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto $ *</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input-field" placeholder="50" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Hosting mensual" />
          </div>
          <button type="submit" className="btn-primary">Guardar</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : expenses.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-4xl mb-3">💸</p><p className="text-slate-500">No hay gastos registrados</p></div>
      ) : (
        <div className="space-y-2">
          {expenses.map(exp => (
            <div key={exp.id} className="card p-4 flex items-center justify-between card-hover">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-lg">💸</div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">{exp.description || 'Gasto'}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="badge-info">{exp.category}</span>
                    <span>📅 {formatDate(exp.date || exp.created_at)}</span>
                  </div>
                </div>
              </div>
              <p className="font-bold text-red-600">{formatCurrency(exp.amount)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
