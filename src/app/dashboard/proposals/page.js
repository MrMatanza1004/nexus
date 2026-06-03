'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import TipTapEditor from '@/components/TipTapEditor'
import { generateWithAI } from '@/lib/ai'

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([])
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({
    client_id: '', title: '', amount: '', description: '', scope: '', timeline: '', terms: '', status: 'draft'
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
    const [pRes, cRes] = await Promise.all([
      supabase.from('proposals').select('*, clients(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name').eq('user_id', user.id),
    ])
    if (pRes.data) setProposals(pRes.data)
    if (cRes.data) setClients(cRes.data)
    setLoading(false)
  }

  function generateContent() {
    const client = clients.find(c => c.id === form.client_id)
    const clientName = client?.name || '[Cliente]'
    const date = new Date().toLocaleDateString('es')
    return `<h2>Propuesta de Servicios</h2>
<p><strong>Para:</strong> ${clientName}</p>
<p><strong>Fecha:</strong> ${date}</p>
<p><strong>Título del Proyecto:</strong> ${form.title || 'Proyecto'}</p>
<p><strong>Monto:</strong> ${form.amount ? `$${form.amount}` : '[Monto]'}</p>
<p><strong>Plazo:</strong> ${form.timeline || 'A convenir'}</p>
<h3>Alcance del Proyecto</h3>
<p>${form.scope || '[Describe el alcance del proyecto aquí]'}</p>
<h3>Entregables</h3>
<ul><li>[Entregable 1]</li><li>[Entregable 2]</li><li>[Entregable 3]</li></ul>
<h3>Cronograma Estimado</h3>
<p>${form.timeline || '[Detalla los tiempos de entrega]'}</p>
<h3>Inversión</h3>
<p><strong>Total: $${form.amount || '[Monto a definir]'}</strong></p>
<p><em>Formas de pago: 50% al inicio, 50% contra entrega</em></p>
<h3>Términos y Condiciones</h3>
<p>${form.terms || 'Propuesta válida por 15 días.'}</p>
<hr><p><em>Generado con NEXUS - El Sistema Operativo Freelance</em></p>`
  }

  function handleGenerate() {
    const content = generateContent()
    setForm({ ...form, description: content })
  }

  async function saveProposal(e) {
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
      user_id: user.id,
      client_id: form.client_id || null,
      title: form.title,
      amount: form.amount ? Number(form.amount) : null,
      content: form.description || generateContent(),
      scope: form.scope,
      timeline: form.timeline,
      terms: form.terms,
      status: 'draft',
    }

    if (editId) {
      await supabase.from('proposals').update(payload).eq('id', editId)
      toast.success('Propuesta actualizada')
    } else {
      const { data, error } = await supabase.from('proposals').insert(payload).select()
      if (error) return toast.error(error.message)
      toast.success('Propuesta creada')
    }
    setForm({ client_id: '', title: '', amount: '', description: '', scope: '', timeline: '', terms: '', status: 'draft' })
    setEditId(null)
    setShowForm(false)
    loadData()
  }

  function editProposal(p) {
    setForm({
      client_id: p.client_id || '',
      title: p.title || '',
      amount: p.amount?.toString() || '',
      description: p.content || '',
      scope: p.scope || '',
      timeline: p.timeline || '',
      terms: p.terms || '',
      status: p.status,
    })
    setEditId(p.id)
    setShowForm(true)
  }

  async function aiEnhance() {
    const content = form.description || form.scope || ''
    if (!content || content === '<p></p>') return toast.error('Primero escribí el contenido de la propuesta')

    const plainText = content.replace(/<[^>]*>/g, '').trim()
    if (!plainText) return toast.error('Escribí contenido antes de usar IA')

    const loading = toast.loading('IA potenciando propuesta...')
    try {
      const { result } = await generateWithAI('proposal', plainText, 'Aplicá todas las mejoras: urgencia, garantía, llamado a la acción, prueba social.')
      if (result) {
        const htmlResult = content.includes('<h') ? content : `<p>${result.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`
        setForm({ ...form, description: htmlResult })
        toast.success('Propuesta potenciada con IA', { id: loading })
      }
    } catch (err) {
      toast.error('Error: ' + err.message, { id: loading })
    }
  }

  function printProposal(p) {
    const w = window.open('', '_blank')
    w.document.write(`
      <html><head><title>${p.title} - Propuesta</title>
      <style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6}
      h1{color:#7c3aed} h2{color:#1e293b;margin-top:30px} .meta{color:#64748b;font-size:14px}
      .footer{margin-top:50px;padding-top:20px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8}
      </style></head><body>
      <div style="text-align:right;margin-bottom:10px">
        <button onclick="window.print()" style="padding:8px 20px;background:#7c3aed;color:white;border:none;border-radius:6px;cursor:pointer">Imprimir / PDF</button>
      </div>
      ${p.content}
      <div class="footer">Generado con NEXUS - El Sistema Operativo Freelance</div>
      <script>setTimeout(() => window.print(), 500)</script>
      </body></html>
    `)
    w.document.close()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Propuestas</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null) }} className="btn-primary text-sm">
          {showForm ? 'Cancelar' : '+ Nueva Propuesta'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveProposal} className="card p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className="input-field">
                <option value="">Seleccionar cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título del proyecto</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Rediseño de Landing Page" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto $</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input-field" placeholder="2500" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alcance</label>
              <textarea value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} className="input-field" rows={3} placeholder="¿Qué incluye el proyecto?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cronograma</label>
              <textarea value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })} className="input-field" rows={3} placeholder="2 semanas / 3 entregas" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Términos</label>
            <textarea value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} className="input-field" rows={2} placeholder="50% al inicio, 50% al finalizar. Válido por 15 días." />
          </div>
          <div>
              <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Contenido de la propuesta</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={aiEnhance} className="text-xs bg-violet-100 hover:bg-violet-200 text-violet-700 px-3 py-1.5 rounded-lg transition-all font-medium">Potenciar con IA</button>
                <button type="button" onClick={handleGenerate} className="text-xs text-violet-600 hover:text-violet-700 font-medium">Generar automáticamente</button>
              </div>
            </div>
            <TipTapEditor
              content={form.description}
              onChange={(html) => setForm({ ...form, description: html })}
              placeholder="Escribí la propuesta aquí..."
              minHeight={360}
            />
          </div>
          <button type="submit" className="btn-primary">{editId ? 'Actualizar Propuesta' : 'Guardar Propuesta'}</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : proposals.length === 0 ? (
        <div className="card p-12 text-center"><svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v6h6" /></svg><p className="text-slate-500">No hay propuestas todavía. Creá la primera.</p></div>
      ) : (
        <div className="space-y-3">
          {proposals.map(p => (
            <div key={p.id} className="card p-5 card-hover flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-slate-900">{p.title || 'Propuesta sin título'}</h3>
                  <span className={`badge ${p.status === 'sent' ? 'badge-info' : p.status === 'accepted' ? 'badge-success' : p.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                    {p.status === 'draft' ? 'Borrador' : p.status === 'sent' ? 'Enviada' : p.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  {p.clients?.name && <span><svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a4 4 0 100 8 4 4 0 000-8z" /></svg>{p.clients.name}</span>}
                  {p.amount && <span className="font-medium text-emerald-600">{formatCurrency(p.amount)}</span>}
                  <span><svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9h18M21 5v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3v4M17 3v4M3 13h18" /></svg>{formatDate(p.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => printProposal(p)} className="p-2 text-slate-400 hover:text-violet-600 rounded-lg hover:bg-violet-50" title="Ver / Imprimir">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
                <button onClick={() => editProposal(p)} className="p-2 text-slate-400 hover:text-violet-600 rounded-lg hover:bg-violet-50" title="Editar">
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
