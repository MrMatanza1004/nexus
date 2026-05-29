'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [portalLoading, setPortalLoading] = useState(null)

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const { data } = await supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) setClients(data)
    setLoading(false)
  }

  async function saveClient(e) {
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
    const { data, error } = await supabase.from('clients').insert({ ...form, user_id: user.id }).select()
    if (error) return toast.error(error.message)
    setClients([data[0], ...clients])
    setForm({ name: '', email: '', phone: '', company: '', notes: '' })
    setShowForm(false)
    toast.success('Cliente agregado')
  }

  async function deleteClient(id) {
    if (!confirm('¿Eliminar este cliente? Se perderán sus datos.')) return
    await supabase.from('clients').delete().eq('id', id)
    setClients(clients.filter(c => c.id !== id))
    toast.success('Cliente eliminado')
  }

  async function inviteToPortal(clientId) {
    setPortalLoading(clientId)
    const res = await fetch('/api/portal/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    })
    const data = await res.json()
    if (data.error) return toast.error(data.error)
    await navigator.clipboard.writeText(data.url)
    toast.success('Link copiado al portapapeles! Enviáselo a tu cliente.')
    setClients(clients.map(c => c.id === clientId ? { ...c, portal_token: data.url.split('/').pop(), portal_active: true } : c))
    setPortalLoading(null)
  }

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">👥 Clientes</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancelar' : '+ Nuevo Cliente'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveClient} className="card p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
              <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field" rows={3} />
          </div>
          <button type="submit" className="btn-primary">Guardar Cliente</button>
        </form>
      )}

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field mb-4" placeholder="🔍 Buscar cliente..." />

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-slate-500">{clients.length === 0 ? 'Todavía no tenés clientes. Agregá el primero.' : 'No se encontraron clientes'}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(client => (
            <div key={client.id} className="card p-5 card-hover group relative">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white text-lg font-bold shrink-0">
                  {client.name?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{client.name}</h3>
                  {client.company && <p className="text-sm text-slate-500 truncate">{client.company}</p>}
                </div>
              </div>
              {client.email && <p className="text-sm text-slate-600 mb-1">📧 {client.email}</p>}
              {client.phone && <p className="text-sm text-slate-600 mb-1">📞 {client.phone}</p>}
              {client.notes && <p className="text-sm text-slate-500 mt-2 italic line-clamp-2">{client.notes}</p>}
              <p className="text-xs text-slate-400 mt-3">Creado {formatDate(client.created_at)}</p>
              <div className="flex gap-2 mt-3">
                {client.portal_active ? (
                  <span className="badge-success text-xs">🔗 Portal activo</span>
                ) : (
                  <button
                    onClick={() => inviteToPortal(client.id)}
                    disabled={portalLoading === client.id}
                    className="text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full hover:bg-violet-200 transition-all font-medium"
                  >
                    {portalLoading === client.id ? '...' : '🔗 Invitar al Portal'}
                  </button>
                )}
              </div>
              <button onClick={() => deleteClient(client.id)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
