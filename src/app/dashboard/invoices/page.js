'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency, invoiceNumber } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ client_id: '', amount: '', description: '', due_date: '', status: 'pending' })

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
    const [iRes, cRes] = await Promise.all([
      supabase.from('invoices').select('*, clients(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name').eq('user_id', user.id),
    ])
    if (iRes.data) setInvoices(iRes.data)
    if (cRes.data) setClients(cRes.data)
    setLoading(false)
  }

  async function saveInvoice(e) {
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
    const count = invoices.length
    const { data, error } = await supabase.from('invoices').insert({
      user_id: user.id, client_id: form.client_id || null,
      number: invoiceNumber(user.id, count),
      amount: Number(form.amount), description: form.description,
      due_date: form.due_date || null, status: 'pending',
    }).select('*, clients(name)')
    if (error) return toast.error(error.message)
    setInvoices([data[0], ...invoices])
    setForm({ client_id: '', amount: '', description: '', due_date: '', status: 'pending' })
    setShowForm(false)
    toast.success('Factura creada')
  }

  async function markPaid(id) {
    await supabase.from('invoices').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id)
    setInvoices(invoices.map(i => i.id === id ? { ...i, status: 'paid', paid_at: new Date().toISOString() } : i))
    toast.success('Factura marcada como pagada ✅')
  }

  function printInvoice(inv) {
    const client = clients.find(c => c.id === inv.client_id)
    const w = window.open('', '_blank')
    w.document.write(`<!DOCTYPE html>
<html><head><title>Factura ${inv.number}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1e293b; }
  .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #7c3aed; }
  .brand h1 { font-size: 24px; color: #7c3aed; }
  .brand p { color: #64748b; font-size: 13px; }
  .invoice-title { text-align: right; }
  .invoice-title h2 { font-size: 28px; font-weight: 800; color: #0f172a; }
  .invoice-title p { color: #94a3b8; font-size: 14px; }
  .billing { display: flex; justify-content: space-between; margin-bottom: 40px; }
  .billing h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
  .billing p { font-size: 14px; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
  th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; padding: 12px 8px; border-bottom: 2px solid #e2e8f0; }
  td { padding: 12px 8px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
  td:last-child, th:last-child { text-align: right; }
  .totals { margin-left: auto; width: 300px; }
  .totals div { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
  .totals .grand { border-top: 2px solid #1e293b; margin-top: 4px; padding-top: 12px; font-size: 18px; font-weight: 700; }
  .status-paid { color: #10b981; }
  .status-pending { color: #f59e0b; }
  .status-overdue { color: #ef4444; }
  .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
  .print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 24px; background: #7c3aed; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
  @media print { .print-btn { display: none; } body { padding: 0; } }
</style></head><body>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / PDF</button>
  <div class="header">
    <div class="brand"><h1>NEXUS</h1><p>El Sistema Operativo Freelance</p></div>
    <div class="invoice-title"><h2>FACTURA</h2><p>#${inv.number}</p></div>
  </div>
  <div class="billing">
    <div>
      <h3>Facturado a</h3>
      <p><strong>${client?.name || 'Cliente'}</strong><br>${inv.description || ''}</p>
    </div>
    <div>
      <h3>Detalles</h3>
      <p>Fecha: ${new Date(inv.created_at).toLocaleDateString('es')}<br>Vence: ${inv.due_date ? new Date(inv.due_date).toLocaleDateString('es') : '—'}<br>Estado: <span class="status-${inv.status}"><strong>${inv.status === 'paid' ? 'PAGADA' : inv.status === 'overdue' ? 'VENCIDA' : 'PENDIENTE'}</strong></span></p>
    </div>
  </div>
  <table>
    <thead><tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead>
    <tbody><tr><td>${inv.description || 'Servicios profesionales'}</td><td>1</td><td>${formatCurrency(inv.amount)}</td><td>${formatCurrency(inv.amount)}</td></tr></tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal</span><span>${formatCurrency(inv.amount)}</span></div>
    <div><span>IVA (0%)</span><span>$0</span></div>
    <div class="grand"><span>Total</span><span>${formatCurrency(inv.amount)}</span></div>
  </div>
  <div class="footer">
    <p>Generado con NEXUS · ${new Date().toLocaleDateString('es')}</p>
    <p style="margin-top:4px">Gracias por tu confianza</p>
  </div>
  <script>setTimeout(() => window.print(), 500)</script>
</body></html>`)
    w.document.close()
  }

  const filtered = invoices.filter(i => filter === 'all' ? true : i.status === filter)
  const totalPending = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + Number(i.amount || 0), 0)
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">💰 Facturas</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancelar' : '+ Nueva Factura'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-slate-500">Pendiente de cobro</p>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Total cobrado</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={saveInvoice} className="card p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className="input-field">
                <option value="">Seleccionar</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto $ *</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input-field" placeholder="1500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vence</label>
              <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} placeholder="Rediseño de sitio web" />
          </div>
          <button type="submit" className="btn-primary">Crear Factura</button>
        </form>
      )}

      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'paid', label: 'Pagadas' },
          { key: 'overdue', label: 'Vencidas' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.key ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-4xl mb-3">💰</p><p className="text-slate-500">No hay facturas todavía</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(inv => (
            <div key={inv.id} className="card p-4 flex items-center justify-between card-hover">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${inv.status === 'paid' ? 'bg-emerald-100' : inv.status === 'overdue' ? 'bg-red-100' : 'bg-amber-100'}`}>
                  {inv.status === 'paid' ? '✅' : inv.status === 'overdue' ? '⚠️' : '⏳'}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 text-sm">{inv.number || 'FACT'}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {inv.clients?.name && <span>👤 {inv.clients.name}</span>}
                    {inv.description && <span>· {inv.description}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="font-bold text-slate-900">{formatCurrency(inv.amount)}</p>
                <div className="flex items-center gap-2 justify-end text-xs mt-1">
                  <span className="text-slate-400">📅 {formatDate(inv.created_at)}</span>
                  <button onClick={() => printInvoice(inv)} className="text-violet-600 hover:text-violet-700 font-medium text-xs">📄 PDF</button>
                  {inv.status === 'pending' && (
                    <button onClick={() => markPaid(inv.id)} className="text-emerald-600 hover:text-emerald-700 font-medium text-xs">✅ Pagar</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
