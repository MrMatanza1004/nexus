'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ client_id: '', content: '', rating: 5 })

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
    const [tRes, cRes] = await Promise.all([
      supabase.from('testimonials').select('*, clients(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name').eq('user_id', user.id),
    ])
    if (tRes.data) setTestimonials(tRes.data)
    if (cRes.data) setClients(cRes.data)
    setLoading(false)
  }

  async function saveTestimonial(e) {
    e.preventDefault()
    if (!form.content.trim()) return toast.error('Escribí el testimonio')
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const { error } = await supabase.from('testimonials').insert({
      user_id: user.id, client_id: form.client_id || null,
      content: form.content, rating: form.rating, approved: false,
    })
    if (error) return toast.error(error.message)
    setForm({ client_id: '', content: '', rating: 5 })
    setShowForm(false)
    toast.success('Testimonio agregado')
    loadData()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Testimonios</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancelar' : '+ Nuevo Testimonio'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveTestimonial} className="card p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className="input-field">
                <option value="">Seleccionar cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} className={`text-2xl ${n <= form.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Testimonio</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="input-field" rows={4} placeholder="Excelente trabajo, muy profesional..." required />
          </div>
          <button type="submit" className="btn-primary">Guardar</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : testimonials.length === 0 ? (
        <div className="card p-12 text-center"><svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg><p className="text-slate-500">No hay testimonios todavía</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map(t => (
            <div key={t.id} className="card p-5">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-sm text-slate-700 italic mb-3">"{t.content}"</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">{t.clients?.name || 'Anónimo'}</p>
                <span className={`badge ${t.approved ? 'badge-success' : 'badge-warning'}`}>{t.approved ? 'Aprobado' : 'Pendiente'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
