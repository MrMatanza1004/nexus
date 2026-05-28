'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [cRes, clRes] = await Promise.all([
      supabase.from('contracts').select('*, clients(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name').eq('user_id', user.id),
    ])
    if (cRes.data) setContracts(cRes.data)
    if (clRes.data) setClients(clRes.data)
    setLoading(false)
  }

  function generateContract() {
    const client = clients.find(c => c.id === form.client_id)
    const cn = client?.name || '[Cliente]'
    const d = new Date().toLocaleDateString('es')
    return `CONTRATO DE PRESTACIÓN DE SERVICIOS

Entre [Tu Nombre], en adelante "EL PROFESIONAL", con domicilio en [Tu Dirección], y ${cn}, en adelante "EL CLIENTE", se celebra el presente contrato en la fecha ${d}.

1. OBJETO
El PROFESIONAL se compromete a realizar el servicio de "${form.title || '[Servicio]'}" por un monto total de $${form.amount || '[Monto]'}.

2. FORMA DE PAGO
- 50% al inicio del proyecto
- 50% contra entrega final

3. PLAZO DE ENTREGA
[A definir según cronograma acordado]

4. PROPIEDAD INTELECTUAL
Una vez realizado el pago total, los derechos de propiedad intelectual serán transferidos al CLIENTE.

5. CONFIDENCIALIDAD
El PROFESIONAL se compromete a mantener confidencialidad sobre toda la información del CLIENTE.

6. CANCELACIÓN
Cualquiera de las partes puede cancelar el contrato con 7 días de anticipación. En caso de cancelación, el CLIENTE pagará por el trabajo realizado hasta la fecha.

7. JURISDICCIÓN
Las partes se someten a la jurisdicción de los tribunales de [Ciudad].

Firma del PROFESIONAL: __________________
Firma del CLIENTE: __________________

---
Generado con NEXUS - El Sistema Operativo Freelance`
  }

  function handleGenerate() {
    setForm({ ...form, content: generateContract() })
  }

  async function saveContract(e) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = {
      user_id: user.id, client_id: form.client_id || null,
      title: form.title, amount: form.amount ? Number(form.amount) : null,
      content: form.content || generateContract(), status: form.status,
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
        <h1 className="text-2xl font-bold text-slate-900">⚖️ Contratos</h1>
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
              <button type="button" onClick={handleGenerate} className="text-xs text-violet-600 hover:text-violet-700 font-medium">🔄 Generar contrato</button>
            </div>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="input-field font-mono text-sm" rows={15} />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{editId ? 'Actualizar' : 'Guardar Contrato'}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : contracts.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-4xl mb-3">⚖️</p><p className="text-slate-500">No hay contratos todavía</p></div>
      ) : (
        <div className="space-y-3">
          {contracts.map(c => (
            <div key={c.id} className="card p-5 card-hover flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-slate-900">{c.title || 'Contrato'}</h3>
                  <span className={`badge ${c.signed ? 'badge-success' : c.status === 'sent' ? 'badge-info' : 'badge-warning'}`}>
                    {c.signed ? '✅ Firmado' : c.status === 'sent' ? 'Enviado' : 'Borrador'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  {c.clients?.name && <span>👤 {c.clients.name}</span>}
                  {c.amount && <span className="font-medium text-emerald-600">{formatCurrency(c.amount)}</span>}
                  <span>📅 {formatDate(c.created_at)}</span>
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
