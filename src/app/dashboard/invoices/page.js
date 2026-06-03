'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency, invoiceNumber } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  Plus, FileText, Download, Send, Trash2, Check,
  AlertCircle, Clock, Repeat, CreditCard, Mail,
  PlusCircle, X,
} from 'lucide-react'

export default function InvoicesPage() {
  // ─── State ───────────────────────────────────────────
  const [invoices, setInvoices] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [saving, setSaving] = useState(false)

  // Payment modal
  const [paymentModal, setPaymentModal] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Form state
  const emptyForm = {
    client_id: '',
    due_date: '',
    notes: '',
    is_recurring: false,
    recurring_frequency: 'monthly',
    recurring_end_date: '',
    items: [{ description: '', quantity: 1, unit_price: 0, tax_rate: 0 }],
  }
  const [form, setForm] = useState({ ...emptyForm })

  // ─── Effects ─────────────────────────────────────────
  useEffect(() => { loadData() }, [])

  // ─── Data Loading ────────────────────────────────────
  async function loadData() {
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) { setLoading(false); return }

    const [iRes, cRes] = await Promise.all([
      supabase
        .from('invoices')
        .select('*, clients(name), invoice_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user.id),
    ])

    if (iRes.data) setInvoices(iRes.data)
    if (cRes.data) setClients(cRes.data)
    setLoading(false)
  }

  // ─── Calculations ────────────────────────────────────
  function getDaysRemaining(dueDate) {
    if (!dueDate) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24))
  }

  function calcItemTotal(item) {
    return Number(item.quantity || 0) * Number(item.unit_price || 0)
  }

  function calcSubtotal(items) {
    return items.reduce((s, i) => s + calcItemTotal(i), 0)
  }

  function calcTax(items) {
    return items.reduce((s, i) => s + calcItemTotal(i) * (Number(i.tax_rate || 0) / 100), 0)
  }

  function calcTotal(items) {
    return calcSubtotal(items) + calcTax(items)
  }

  // Summary
  const totalPending = invoices
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((s, i) => s + Number(i.total || i.amount || 0), 0)
  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((s, i) => s + Number(i.total || i.amount || 0), 0)
  const overdueInvoices = invoices.filter(i => i.status === 'overdue')
  const totalOverdue = overdueInvoices.reduce((s, i) => s + Number(i.total || i.amount || 0), 0)
  const nearestDue = invoices
    .filter(i => i.status === 'pending' && i.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0]

  // Filtered list
  const filtered = invoices.filter(i => {
    if (filter === 'all') return true
    return i.status === filter
  })

  // ─── Form Handlers ───────────────────────────────────
  function resetForm() {
    setForm({ ...emptyForm })
    setEditingInvoice(null)
  }

  function openCreateModal() {
    resetForm()
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    resetForm()
  }

  function openEditModal(inv) {
    const safeItems =
      inv.invoice_items?.length > 0
        ? [...inv.invoice_items]
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(i => ({
              description: i.description,
              quantity: Number(i.quantity),
              unit_price: Number(i.unit_price),
              tax_rate: Number(i.tax_rate || 0),
            }))
        : [
            {
              description: inv.description || '',
              quantity: 1,
              unit_price: Number(inv.amount || inv.total || 0),
              tax_rate: 0,
            },
          ]

    setForm({
      client_id: inv.client_id || '',
      due_date: inv.due_date || '',
      notes: inv.notes || '',
      is_recurring: inv.is_recurring || false,
      recurring_frequency: inv.recurring_frequency || 'monthly',
      recurring_end_date: inv.recurring_end_date || '',
      items: safeItems,
    })
    setEditingInvoice(inv)
    setShowModal(true)
  }

  function addItem() {
    setForm({
      ...form,
      items: [...form.items, { description: '', quantity: 1, unit_price: 0, tax_rate: 0 }],
    })
  }

  function removeItem(idx) {
    if (form.items.length <= 1) return
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })
  }

  function updateItem(idx, field, value) {
    const updated = [...form.items]
    updated[idx] = { ...updated[idx], [field]: value }
    setForm({ ...form, items: updated })
  }

  // ─── CRUD ────────────────────────────────────────────
  async function saveInvoice(e) {
    e.preventDefault()
    if (!form.client_id) return toast.error('Selecciona un cliente')
    if (form.items.length === 0) return toast.error('Agrega al menos un concepto')
    if (form.items.some(i => !i.description.trim()))
      return toast.error('Todos los conceptos necesitan descripción')

    setSaving(true)

    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) { setSaving(false); return }

    const subtotal = calcSubtotal(form.items)
    const taxAmount = calcTax(form.items)
    const total = calcTotal(form.items)
    const number = editingInvoice?.number || invoiceNumber(user.id, invoices.length)
    const firstDesc = form.items[0]?.description || ''

    const invoiceData = {
      user_id: user.id,
      client_id: form.client_id,
      number,
      description: firstDesc,
      amount: total,
      subtotal,
      tax_rate: 0,
      tax_amount: taxAmount,
      total,
      due_date: form.due_date || null,
      notes: form.notes || null,
      status: editingInvoice?.status || 'pending',
      is_recurring: form.is_recurring,
      recurring_frequency: form.is_recurring ? form.recurring_frequency : null,
      recurring_end_date: form.is_recurring ? form.recurring_end_date || null : null,
    }

    const itemsData = form.items.map((item, idx) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      tax_rate: Number(item.tax_rate || 0),
      total: calcItemTotal(item),
      sort_order: idx,
    }))

    if (editingInvoice) {
      const { error: invErr } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', editingInvoice.id)
      if (invErr) { toast.error(invErr.message); setSaving(false); return }

      await supabase.from('invoice_items').delete().eq('invoice_id', editingInvoice.id)
      const itemsWithFK = itemsData.map(i => ({ ...i, invoice_id: editingInvoice.id }))
      const { error: itemsErr } = await supabase.from('invoice_items').insert(itemsWithFK)
      if (itemsErr) { toast.error(itemsErr.message); setSaving(false); return }

      setInvoices(prev =>
        prev.map(inv =>
          inv.id === editingInvoice.id
            ? { ...inv, ...invoiceData, invoice_items: itemsWithFK }
            : inv,
        ),
      )
      toast.success('Factura actualizada')
    } else {
      const { data, error: invErr } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
      if (invErr) { toast.error(invErr.message); setSaving(false); return }

      const newId = data[0].id
      const itemsWithFK = itemsData.map(i => ({ ...i, invoice_id: newId }))
      const { error: itemsErr } = await supabase.from('invoice_items').insert(itemsWithFK)
      if (itemsErr) { toast.error(itemsErr.message); setSaving(false); return }

      const client = clients.find(c => c.id === form.client_id)
      setInvoices(prev => [
        {
          ...data[0],
          clients: client ? { name: client.name } : null,
          invoice_items: itemsWithFK,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ])
      toast.success('Factura creada')
    }

    resetForm()
    setShowModal(false)
    setSaving(false)
  }

  async function markPaid(inv) {
    if (!paymentMethod) return toast.error('Selecciona un método de pago')

    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_method: paymentMethod,
        paid_amount: Number(inv.total || inv.amount || 0),
      })
      .eq('id', inv.id)

    if (error) return toast.error(error.message)

    setInvoices(prev =>
      prev.map(i =>
        i.id === inv.id
          ? {
              ...i,
              status: 'paid',
              paid_at: new Date().toISOString(),
              payment_method: paymentMethod,
              paid_amount: Number(inv.total || inv.amount || 0),
            }
          : i,
      ),
    )
    setPaymentModal(null)
    setPaymentMethod('')
    toast.success('Factura marcada como pagada')
  }

  async function deleteInvoice(id) {
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (error) return toast.error(error.message)
    setInvoices(prev => prev.filter(i => i.id !== id))
    setDeleteConfirm(null)
    toast.success('Factura eliminada')
  }

  async function sendByEmail(inv) {
    try {
      const res = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: inv.id }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error al enviar factura por email')
      }
      const data = await res.json()
      setInvoices(prev =>
        prev.map(i =>
          i.id === inv.id ? { ...i, sent_at: data.sent_at || new Date().toISOString() } : i,
        ),
      )
      toast.success('Factura enviada por email')
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function generatePaymentLink(inv) {
    try {
      const res = await fetch('/api/invoices/payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: inv.id }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error al generar link de pago')
      }
      const data = await res.json()
      setInvoices(prev =>
        prev.map(i =>
          i.id === inv.id ? { ...i, stripe_payment_link: data.url } : i,
        ),
      )
      if (data.url) {
        navigator.clipboard?.writeText(data.url)
        toast.success('Link de pago copiado al portapapeles')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function sendReminder(inv) {
    try {
      const res = await fetch('/api/invoices/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: inv.id }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error al enviar recordatorio')
      }
      setInvoices(prev =>
        prev.map(i =>
          i.id === inv.id
            ? {
                ...i,
                last_reminder_at: new Date().toISOString(),
                reminder_count: (i.reminder_count || 0) + 1,
              }
            : i,
        ),
      )
      toast.success('Recordatorio enviado')
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ─── Print / PDF ─────────────────────────────────────
  function printInvoice(inv) {
    const client = clients.find(c => c.id === inv.client_id)
    const items = inv.invoice_items || []
    const subtotal = items.reduce((s, i) => s + Number(i.total || 0), 0)
    const taxAmount =
      inv.tax_amount ||
      items.reduce(
        (s, i) => s + Number(i.total || 0) * (Number(i.tax_rate || 0) / 100),
        0,
      )
    const total = inv.total || subtotal + taxAmount

    const itemsRows =
      items.length > 0
        ? items
            .map(
              i => `
        <tr>
          <td>${i.description}</td>
          <td>${i.quantity}</td>
          <td>${formatCurrency(i.unit_price)}</td>
          <td>${formatCurrency(i.total || i.quantity * i.unit_price)}</td>
        </tr>`,
            )
            .join('')
        : `<tr><td>${inv.description || 'Servicios profesionales'}</td><td>1</td><td>${formatCurrency(inv.amount || total)}</td><td>${formatCurrency(inv.amount || total)}</td></tr>`

    const taxPercent =
      items.length > 0 ? Math.max(...items.map(i => Number(i.tax_rate || 0))) : 0

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
  td:nth-child(2), th:nth-child(2) { text-align: center; }
  td:nth-child(3), th:nth-child(3) { text-align: right; }
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
      <p><strong>${client?.name || 'Cliente'}</strong><br>${inv.notes || inv.description || ''}</p>
    </div>
    <div>
      <h3>Detalles</h3>
      <p>Fecha: ${formatDate(inv.created_at)}<br>Vence: ${inv.due_date ? formatDate(inv.due_date) : '—'}<br>Estado: <span class="status-${inv.status}"><strong>${inv.status === 'paid' ? 'PAGADA' : inv.status === 'overdue' ? 'VENCIDA' : 'PENDIENTE'}</strong></span></p>
    </div>
  </div>
  <table>
    <thead><tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead>
    <tbody>${itemsRows}</tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
    <div><span>IVA (${taxPercent}%)</span><span>${formatCurrency(taxAmount)}</span></div>
    <div class="grand"><span>Total</span><span>${formatCurrency(total)}</span></div>
  </div>
  ${inv.is_recurring ? `<p style="text-align:center;color:#94a3b8;font-size:13px;margin-top:20px;">🔄 Factura recurrente · ${inv.recurring_frequency}</p>` : ''}
  <div class="footer">
    <p>Generado con NEXUS · ${new Date().toLocaleDateString('es')}</p>
    <p style="margin-top:4px">Gracias por tu confianza</p>
  </div>
  <script>setTimeout(() => window.print(), 500)</script>
</body></html>`)
    w.document.close()
  }

  // ─── Helpers ─────────────────────────────────────────
  function StatusBadge({ status }) {
    const styles = {
      paid: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-slate-100 text-slate-600',
    }
    const labels = {
      paid: 'Pagada',
      pending: 'Pendiente',
      overdue: 'Vencida',
      cancelled: 'Cancelada',
    }
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}
      >
        {labels[status] || status}
      </span>
    )
  }

  function DueDateDisplay({ dueDate }) {
    const days = getDaysRemaining(dueDate)
    if (!dueDate) return null

    let colorClass = 'text-slate-500'
    let label = formatDate(dueDate)
    if (days === 0) {
      colorClass = 'text-amber-600 font-medium'
      label = 'Vence hoy'
    } else if (days < 0) {
      colorClass = 'text-red-600 font-medium'
      label = `Vencida hace ${Math.abs(days)}d`
    } else if (days <= 3) {
      colorClass = 'text-amber-600'
      label = `${formatDate(dueDate)} (${days}d)`
    } else {
      label = `${formatDate(dueDate)} (${days}d)`
    }

    return (
      <span className={`inline-flex items-center gap-1 text-xs ${colorClass}`}>
        <Clock size={12} />
        {label}
      </span>
    )
  }

  // ─── Helper: payment method label ─────────────────
  function paymentMethodLabel(method) {
    const labels = {
      transfer: 'transferencia',
      cash: 'efectivo',
      stripe: 'Stripe',
      paypal: 'PayPal',
      other: 'otro',
    }
    return labels[method] || method
  }

  // ─── Render ──────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText size={24} className="text-violet-600" />
          Facturas
        </h1>
        <button onClick={openCreateModal} className="btn-primary text-sm inline-flex items-center gap-2">
          <Plus size={16} />
          Nueva Factura
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Clock size={16} />
            <p className="text-sm text-slate-500">Pendiente de cobro</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Check size={16} />
            <p className="text-sm text-slate-500">Total cobrado</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertCircle size={16} />
            <p className="text-sm text-slate-500">Facturas vencidas</p>
          </div>
          {overdueInvoices.length > 0 ? (
            <div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
              <p className="text-xs text-red-500 mt-0.5">{overdueInvoices.length} factura{overdueInvoices.length !== 1 ? 's' : ''}</p>
            </div>
          ) : (
            <p className="text-lg font-semibold text-slate-400">—</p>
          )}
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-violet-600 mb-1">
            <Clock size={16} />
            <p className="text-sm text-slate-500">Próximo vencimiento</p>
          </div>
          {nearestDue ? (
            <div>
              <p className="text-lg font-bold text-slate-900">
                {formatDate(nearestDue.due_date)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatCurrency(nearestDue.total || nearestDue.amount)}
              </p>
            </div>
          ) : (
            <p className="text-lg font-semibold text-slate-400">Sin vencimientos</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'paid', label: 'Pagadas' },
          { key: 'overdue', label: 'Vencidas' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-violet-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Cargando facturas...</p>
        </div>
      ) : /* Empty */
      filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-slate-300" />
          </div>
          <p className="text-lg font-medium text-slate-700 mb-1">
            {filter === 'all' ? 'No hay facturas todavía' : 'No hay facturas en este estado'}
          </p>
          <p className="text-sm text-slate-400 mb-6">
            {filter === 'all'
              ? 'Crea tu primera factura para empezar a cobrar'
              : 'Prueba cambiando el filtro o crea una nueva factura'}
          </p>
          {filter === 'all' && (
            <button onClick={openCreateModal} className="btn-primary text-sm inline-flex items-center gap-2">
              <Plus size={16} />
              Crear primera factura
            </button>
          )}
        </div>
      ) : (
        /* Invoice List */
        <div className="space-y-3">
          {filtered.map(inv => (
            <div key={inv.id} className="card p-4 card-hover">
              {/* Top row: status, number, recurring badge, amount */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <StatusBadge status={inv.status} />
                  <span className="font-semibold text-slate-900 text-sm">{inv.number}</span>
                  {inv.is_recurring && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                      <Repeat size={12} />
                      Recurrente
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-slate-900 shrink-0 ml-3">
                  {formatCurrency(inv.total || inv.amount)}
                </span>
              </div>

              {/* Middle row: client, items count, due date */}
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-3 flex-wrap">
                {inv.clients?.name && (
                  <span className="inline-flex items-center gap-1">
                    👤 {inv.clients.name}
                  </span>
                )}
                {inv.invoice_items?.length > 0 && (
                  <span className="text-slate-400">
                    {inv.invoice_items.length}{' '}
                    {inv.invoice_items.length === 1 ? 'concepto' : 'conceptos'}
                  </span>
                )}
                {inv.due_date && <DueDateDisplay dueDate={inv.due_date} />}
                {inv.sent_at && (
                  <span className="text-xs text-slate-400">
                    Enviada {formatDate(inv.sent_at)}
                  </span>
                )}
                {inv.paid_at && inv.payment_method && (
                  <span className="text-xs text-slate-400">
                    Cobro por {paymentMethodLabel(inv.payment_method)}
                  </span>
                )}
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-0.5 pt-2 border-t border-slate-100">
                {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      setPaymentModal(inv)
                      setPaymentMethod('')
                    }}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                    title="Marcar como pagada"
                  >
                    <Check size={15} />
                  </button>
                )}
                <button
                  onClick={() => printInvoice(inv)}
                  className="p-1.5 rounded-lg hover:bg-violet-50 text-violet-600 transition-colors"
                  title="Descargar PDF"
                >
                  <Download size={15} />
                </button>
                <button
                  onClick={() => sendByEmail(inv)}
                  className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                  title="Enviar por email"
                >
                  <Send size={15} />
                </button>
                {!inv.stripe_payment_link && inv.status !== 'paid' && inv.status !== 'cancelled' && (
                  <button
                    onClick={() => generatePaymentLink(inv)}
                    className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
                    title="Generar link de pago"
                  >
                    <CreditCard size={15} />
                  </button>
                )}
                {inv.status === 'overdue' &&
                  (!inv.last_reminder_at ||
                    (Date.now() - new Date(inv.last_reminder_at).getTime()) /
                        (1000 * 60 * 60 * 24) >
                      3) && (
                    <button
                      onClick={() => sendReminder(inv)}
                      className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors"
                      title="Enviar recordatorio"
                    >
                      <Mail size={15} />
                    </button>
                  )}
                <div className="flex-1" />
                <button
                  onClick={() => openEditModal(inv)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                  title="Editar"
                >
                  <FileText size={15} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(inv)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Create / Edit Modal ────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-12 bg-black/50 overflow-y-auto"
          onClick={e => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {editingInvoice ? 'Editar Factura' : 'Nueva Factura'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={saveInvoice} className="p-6 space-y-6">
              {/* Client + Due Date */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.client_id}
                    onChange={e => setForm({ ...form, client_id: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha de vencimiento
                  </label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Conceptos
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm text-violet-600 hover:text-violet-700 font-medium inline-flex items-center gap-1"
                  >
                    <PlusCircle size={16} />
                    Agregar concepto
                  </button>
                </div>

                <div className="space-y-3">
                  {form.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => updateItem(idx, 'description', e.target.value)}
                          placeholder="Descripción del concepto"
                          className="input-field text-sm mb-2"
                        />
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label className="block text-xs text-slate-400 mb-0.5">Cant.</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={e => updateItem(idx, 'quantity', e.target.value)}
                              className="input-field text-sm"
                              min="1"
                              step="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-0.5">Precio</label>
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={e => updateItem(idx, 'unit_price', e.target.value)}
                              className="input-field text-sm"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-0.5">IVA %</label>
                            <input
                              type="number"
                              value={item.tax_rate}
                              onChange={e => updateItem(idx, 'tax_rate', e.target.value)}
                              className="input-field text-sm"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 mb-0.5">Total</label>
                            <div className="input-field text-sm bg-white flex items-center h-[42px] font-medium text-slate-900">
                              {formatCurrency(calcItemTotal(item))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1.5 mt-6 rounded-lg hover:bg-red-100 text-red-300 hover:text-red-500 transition-colors shrink-0 disabled:opacity-30"
                        disabled={form.items.length <= 1}
                        title="Eliminar concepto"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-1">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(calcSubtotal(form.items))}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>IVA</span>
                  <span>{formatCurrency(calcTax(form.items))}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>{formatCurrency(calcTotal(form.items))}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Notas o instrucciones adicionales para el cliente..."
                />
              </div>

              {/* Recurring */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_recurring}
                    onChange={e =>
                      setForm({ ...form, is_recurring: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Factura recurrente
                  </span>
                </label>

                {form.is_recurring && (
                  <div className="grid sm:grid-cols-2 gap-4 pl-6 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Frecuencia
                      </label>
                      <select
                        value={form.recurring_frequency}
                        onChange={e =>
                          setForm({ ...form, recurring_frequency: e.target.value })
                        }
                        className="input-field text-sm"
                      >
                        <option value="weekly">Semanal</option>
                        <option value="biweekly">Quincenal</option>
                        <option value="monthly">Mensual</option>
                        <option value="quarterly">Trimestral</option>
                        <option value="yearly">Anual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Fecha de fin <span className="text-slate-300">(opcional)</span>
                      </label>
                      <input
                        type="date"
                        value={form.recurring_end_date}
                        onChange={e =>
                          setForm({ ...form, recurring_end_date: e.target.value })
                        }
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-sm inline-flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>{editingInvoice ? 'Actualizar' : 'Crear'} Factura</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Payment Modal ──────────────────────────── */}
      {paymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setPaymentModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Check size={20} className="text-emerald-500" />
              Marcar como pagada
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              Factura {paymentModal.number} —{' '}
              {formatCurrency(paymentModal.total || paymentModal.amount)}
            </p>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Método de pago <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="input-field"
              >
                <option value="">Seleccionar método...</option>
                <option value="transfer">Transferencia bancaria</option>
                <option value="cash">Efectivo</option>
                <option value="stripe">Stripe / Tarjeta</option>
                <option value="paypal">PayPal</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPaymentModal(null)}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => markPaid(paymentModal)}
                disabled={!paymentMethod}
                className="btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Check size={16} />
                Confirmar pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation ────────────────────── */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Eliminar factura
            </h3>
            <p className="text-sm text-slate-500 text-center mb-5">
              ¿Estás seguro de eliminar la factura{' '}
              <strong className="text-slate-700">{deleteConfirm.number}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => deleteInvoice(deleteConfirm.id)}
                className="px-4 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
