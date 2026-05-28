'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function FeedbackPage() {
  const [requests, setRequests] = useState([])
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ client_id: '', request_content: '', project_id: '' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [fRes, cRes] = await Promise.all([
      supabase.from('feedback_requests').select('*, clients(name), projects(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name').eq('user_id', user.id),
    ])
    if (fRes.data) setRequests(fRes.data)
    if (cRes.data) setClients(cRes.data)
    setLoading(false)
  }

  async function sendFeedbackRequest(e) {
    e.preventDefault()
    if (!form.client_id) return toast.error('Seleccioná un cliente')
    const { data: { user } } = await supabase.auth.getUser()
    const client = clients.find(c => c.id === form.client_id)
    const { error } = await supabase.from('feedback_requests').insert({
      user_id: user.id, client_id: form.client_id,
      request_content: form.request_content,
      project_id: form.project_id || null,
      status: 'pending',
    })
    if (error) return toast.error(error.message)
    setForm({ client_id: '', request_content: '', project_id: '' })
    setShowForm(false)
    toast.success(`Solicitud de feedback enviada a ${client?.name}`)
    loadData()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">💬 Feedback</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancelar' : '+ Solicitar Feedback'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={sendFeedbackRequest} className="card p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
              <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}
                className="input-field" required>
                <option value="">Seleccionar</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto (opcional)</label>
              <input type="text" value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}
                className="input-field" placeholder="Rediseño web" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje para el cliente</label>
            <textarea value={form.request_content} onChange={e => setForm({ ...form, request_content: e.target.value })}
              className="input-field" rows={3}
              placeholder="¡Hola! Me encantaría saber tu opinión sobre el trabajo que hicimos..." />
          </div>
          <button type="submit" className="btn-primary">Enviar Solicitud</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : requests.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-4xl mb-3">💬</p><p className="text-slate-500">No hay solicitudes de feedback</p></div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{r.clients?.name}</span>
                  <span className={`badge ${r.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                    {r.status === 'completed' ? 'Respondido' : 'Pendiente'}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{formatDate(r.created_at)}</span>
              </div>
              {r.request_content && <p className="text-sm text-slate-600 mb-2">{r.request_content}</p>}
              {r.response_content && (
                <div className="bg-slate-50 rounded-lg p-3 mt-2">
                  <p className="text-xs text-slate-500 mb-1">Respuesta del cliente:</p>
                  <p className="text-sm text-slate-700">{r.response_content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
