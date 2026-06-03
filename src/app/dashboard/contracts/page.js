'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import { generateWithAI } from '@/lib/ai'
import GoogleDriveButton from '@/components/integrations/NangoDriveButton'

export default function ContractsPage() {
  const [contracts, setContracts] = useState([])
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    client_id: '', title: '', content: '', amount: '', status: 'draft'
  })

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
    const [cRes, clRes] = await Promise.all([
      supabase.from('contracts').select('*, clients(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name').eq('user_id', user.id),
    ])
    if (cRes.data) setContracts(cRes.data)
    if (clRes.data) setClients(clRes.data)
    setLoading(false)
  }

  async function handleGenerate() {
    const client = clients.find(c => c.id === form.client_id)
    const loadingToast = toast.loading('Generando contrato con IA...')
    try {
      const prompt = `Cliente: ${client?.name || '[Cliente]'}\nServicio: ${form.title || '[Servicio]'}\nMonto: $${form.amount || '[Monto]'}\nPago: 50% inicio / 50% entrega\nExtras: ninguno`
      const { result } = await generateWithAI('contract', prompt)
      setForm({ ...form, content: result })
      toast.success('Contrato generado con IA', { id: loadingToast })
    } catch (err) {
      toast.error('Error: ' + err.message, { id: loadingToast })
    }
  }

  async function saveContract(e) {
    e.preventDefault()
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const payload = {
      user_id: user.id, client_id: form.client_id || null,
      title: form.title, amount: form.amount ? Number(form.amount) : null,
      content: form.content || '', status: form.status,
    }
    if (editId) {
      await supabase.from('contracts').update(payload).eq('id', editId)
      toast.success('Contrato actualizado')
    } else {
      const { error } = await supabase.from('contracts').insert(payload)
      if (error) return toast.error(error.message)
      toast.success('Contrato creado')
    }
    setForm({ client_id: '', title: '', content: '', amount: '', status: 'draft' })
    setEditId(null); setShowForm(false); loadData()
  }

  function editContract(c) {
    setForm({
      client_id: c.client_id || '', title: c.title || '',
      content: c.content || '', amount: c.amount?.toString() || '', status: c.status
    })
    setEditId(c.id); setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Contratos</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null) }} className="btn-primary text-sm">
          {showForm ? 'Cancelar' : '+ Nuevo Contrato'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveContract} className="card p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className="input-field">
                <option value="">Seleccionar</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Servicio</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Diseño de sitio web" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto $</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input-field" placeholder="2500" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Contenido del contrato</label>
              <button type="button" onClick={handleGenerate} className="text-xs text-violet-600 hover:text-violet-700 font-medium">
                <svg className="w-3.5 h-3.5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.83 14.83l4.24 4.24 M9.17 9.17L4.93 4.93 M12 2l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" /></svg>
                Generar con IA
              </button>
            </div>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="input-field font-mono text-sm" rows={15} />
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            <button type="submit" className="btn-primary">{editId ? 'Actualizar' : 'Guardar Contrato'}</button>
            {form.content && (
              <GoogleDriveButton
                content={form.content}
                filename={`Contrato-${form.title || 'NEXUS'}.txt`}
              />
            )}
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : contracts.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-10 h-10 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l-3 6h6l-3-6z M4 22h16 M8 22V8 M16 22V8" /></svg>
          <p className="text-slate-500">No hay contratos todavía</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map(c => (
            <div key={c.id} className="card p-5 card-hover flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-slate-900">{c.title || 'Contrato'}</h3>
                  <span className={`badge ${c.signed ? 'badge-success' : c.status === 'sent' ? 'badge-info' : 'badge-warning'}`}>
                    {c.signed ? <><svg className="w-3.5 h-3.5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Firmado</> : c.status === 'sent' ? 'Enviado' : 'Borrador'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  {c.clients?.name && <span><svg className="w-3.5 h-3.5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z" /></svg>{c.clients.name}</span>}
                  {c.amount && <span className="font-medium text-emerald-600">{formatCurrency(c.amount)}</span>}
                  <span><svg className="w-3.5 h-3.5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{formatDate(c.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => editContract(c)} className="p-2 text-slate-400 hover:text-violet-600 rounded-lg hover:bg-violet-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
