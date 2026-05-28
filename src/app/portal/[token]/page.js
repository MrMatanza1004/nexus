'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ClientPortalPage({ params }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { loadPortal() }, [])

  async function loadPortal() {
    try {
      const res = await fetch(`/api/portal/${params.token}`)
      if (!res.ok) { setError('Portal no encontrado'); setLoading(false); return }
      const json = await res.json()
      setData(json)
    } catch { setError('Error al cargar') }
    setLoading(false)
  }

  async function handleAction(type, id) {
    setActionLoading(`${type}-${id}`)
    const endpoint = type === 'proposal'
      ? `/api/portal/${params.token}/proposals/${id}/approve`
      : `/api/portal/${params.token}/contracts/${id}/sign`
    await fetch(endpoint, { method: 'POST' })
    await loadPortal()
    setActionLoading(null)
  }

  function statusBadge(status) {
    const styles = { sent: 'badge-warning', accepted: 'badge-success', rejected: 'badge-error', draft: 'badge-info', signed: 'badge-success' }
    const labels = { sent: 'Pendiente', accepted: 'Aceptada', rejected: 'Rechazada', draft: 'Borrador', signed: 'Firmado' }
    return <span className={`badge ${styles[status] || 'badge-info'}`}>{labels[status] || status}</span>
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-6xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Portal no encontrado</h1>
        <p className="text-slate-500">El link de acceso no es válido o fue desactivado por tu asesor.</p>
      </div>
    </div>
  )

  const { client, proposals, contracts, invoices } = data || {}

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-3">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-lg text-slate-900">NEXUS · Portal del Cliente</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-6 mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Hola, {client?.name} 👋
          </h1>
          <p className="text-slate-500">Este es tu espacio personal para gestionar propuestas, contratos y facturas.</p>
        </div>

        {/* Proposals */}
        <h2 className="text-lg font-semibold text-slate-900 mb-3">📄 Propuestas</h2>
        {(!proposals || proposals.length === 0) ? (
          <div className="card p-6 mb-8 text-center text-slate-500 text-sm">No tenés propuestas pendientes</div>
        ) : (
          <div className="space-y-3 mb-8">
            {proposals.map(p => (
              <div key={p.id} className="card p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{p.title || 'Propuesta'}</h3>
                  <p className="text-sm text-slate-500">${p.amount ? p.amount.toLocaleString() : '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(p.status)}
                  {p.status === 'sent' && (
                    <button
                      onClick={() => handleAction('proposal', p.id)}
                      disabled={actionLoading === `proposal-${p.id}`}
                      className="btn-primary text-sm py-2"
                    >
                      {actionLoading === `proposal-${p.id}` ? '...' : '✅ Aceptar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contracts */}
        <h2 className="text-lg font-semibold text-slate-900 mb-3">⚖️ Contratos</h2>
        {(!contracts || contracts.length === 0) ? (
          <div className="card p-6 mb-8 text-center text-slate-500 text-sm">No tenés contratos pendientes</div>
        ) : (
          <div className="space-y-3 mb-8">
            {contracts.map(c => (
              <div key={c.id} className="card p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{c.title || 'Contrato'}</h3>
                  <p className="text-sm text-slate-500">${c.amount ? c.amount.toLocaleString() : '—'}</p>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(c.signed ? 'signed' : c.status)}
                  {!c.signed && (
                    <button
                      onClick={() => handleAction('contract', c.id)}
                      disabled={actionLoading === `contract-${c.id}`}
                      className="btn-primary text-sm py-2"
                    >
                      {actionLoading === `contract-${c.id}` ? '...' : '✍️ Firmar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoices */}
        <h2 className="text-lg font-semibold text-slate-900 mb-3">💰 Facturas</h2>
        {(!invoices || invoices.length === 0) ? (
          <div className="card p-6 mb-8 text-center text-slate-500 text-sm">No tenés facturas</div>
        ) : (
          <div className="space-y-3 mb-8">
            {invoices.map(inv => (
              <div key={inv.id} className="card p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{inv.number || 'Factura'}</h3>
                  <p className="text-sm text-slate-500">${inv.amount?.toLocaleString()} · {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${
                    inv.status === 'paid' ? 'badge-success' : inv.status === 'overdue' ? 'badge-error' : 'badge-warning'
                  }`}>
                    {inv.status === 'paid' ? 'Pagada' : inv.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                  </span>
                  {inv.status === 'pending' && inv.stripe_payment_link && (
                    <a href={inv.stripe_payment_link} target="_blank" rel="noopener" className="btn-primary text-sm py-2">
                      💳 Pagar
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center text-xs text-slate-400 mt-12">
          <p>NEXUS — El Sistema Operativo de tu Negocio Freelance</p>
        </div>
      </div>
    </div>
  )
}
