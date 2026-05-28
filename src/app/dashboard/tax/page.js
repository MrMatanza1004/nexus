'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

const MONTHS = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const MONTH_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4']

const CATEGORY_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b']

export default function TaxPage() {
  const [data, setData] = useState({ invoices: [], expenses: [] })
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => { loadData() }, [year])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const yearStart = `${year}-01-01`
    const yearEnd = `${year}-12-31`

    const [invRes, expRes] = await Promise.all([
      supabase.from('invoices').select('*').eq('user_id', user.id).gte('created_at', yearStart).lte('created_at', yearEnd).order('created_at', { ascending: false }),
      supabase.from('expenses').select('*').eq('user_id', user.id).gte('date', yearStart).lte('date', yearEnd).order('date', { ascending: false }),
    ])

    setData({ invoices: invRes.data || [], expenses: expRes.data || [] })
    setLoading(false)
  }

  const totalInvoiced = data.invoices.reduce((s, i) => s + Number(i.amount || 0), 0)
  const totalPaid = data.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount || 0), 0)
  const totalPending = data.invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + Number(i.amount || 0), 0)
  const totalExpenses = data.expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const netIncome = totalPaid - totalExpenses

  const expensesByCategory = data.expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount || 0)
    return acc
  }, {})

  const invoicesByMonth = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const invs = data.invoices.filter(inv => {
      const d = new Date(inv.created_at)
      return d.getMonth() + 1 === month && d.getFullYear() === year
    })
    return { month: MONTHS[month], total: invs.reduce((s, i) => s + Number(i.amount || 0), 0), count: invs.length }
  })

  const expensesChartData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }))

  function exportCSV() {
    const headers = ['Tipo', 'Fecha', 'Descripci\u00f3n', 'Monto', 'Estado']
    const rows = [
      ...data.invoices.map(i => ['Factura', new Date(i.created_at).toLocaleDateString(), i.description || i.number, i.amount, i.status]),
      ...data.expenses.map(e => ['Gasto', new Date(e.date).toLocaleDateString(), e.description || e.category, e.amount, '\u2014']),
    ]
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `nexus-tax-${year}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">💰 Tax Dashboard</h1>
        <div className="flex items-center gap-3">
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="input-field w-auto">
            {[2026, 2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={exportCSV} className="btn-primary text-sm">📥 Exportar CSV</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Facturado', value: totalInvoiced, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Cobrado', value: totalPaid, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pendiente', value: totalPending, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Gastos', value: totalExpenses, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Ganancia Neta', value: netIncome, color: netIncome >= 0 ? 'text-emerald-600' : 'text-red-600', bg: netIncome >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.bg}`}>
            <p className="text-sm text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{formatCurrency(s.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly trend */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">📈 Tendencia mensual</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={invoicesByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {invoicesByMonth.map((_, i) => <Cell key={i} fill={MONTH_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses by category */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">📊 Gastos por categoria</h2>
          {expensesChartData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No hay gastos registrados este año</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expensesChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${v/1000}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" width={90} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {expensesChartData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-4">📋 Transacciones recientes</h2>
        {data.invoices.length === 0 && data.expenses.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No hay transacciones este año</p>
        ) : (
          <div className="space-y-2">
            {[...data.invoices.slice(0, 10).map(i => ({ ...i, _type: 'Factura' })), ...data.expenses.slice(0, 10).map(e => ({ ...e, _type: 'Gasto' }))]
              .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
              .slice(0, 15).map(t => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${t._type === 'Factura' ? 'bg-violet-400' : 'bg-red-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {t._type === 'Factura' ? (t.number || 'Factura') : (t.description || t.category)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {t._type === 'Factura' ? t.description || '' : t.category} · {new Date(t.created_at || t.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${t._type === 'Gasto' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {t._type === 'Gasto' ? '-' : '+'} {formatCurrency(t.amount)}
                    </p>
                    {t._type === 'Factura' && (
                      <span className={`text-xs ${t.status === 'paid' ? 'badge-success' : t.status === 'overdue' ? 'badge-error' : 'badge-warning'}`}>
                        {t.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
