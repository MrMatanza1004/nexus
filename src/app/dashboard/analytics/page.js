'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard,
  AlertCircle, Users, BarChart3, Clock, Activity,
  FolderOpen, Target,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────
const formatMXN = (value) =>
  Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

const timeAgo = (date) => {
  if (!date) return ''
  const now = new Date()
  const diff = now - new Date(date)
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 2) return 'ahora mismo'
  if (mins < 60) return `hace ${mins} min`
  if (hrs < 24) return `hace ${hrs}h`
  if (days < 30) return `hace ${days}d`
  return new Date(date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

const periodLabel = {
  this_month: 'Este mes',
  last_month: 'Mes pasado',
  last_3_months: 'Últimos 3 meses',
  this_year: 'Este año',
  custom: 'Personalizado',
}

const periodOptions = [
  { key: 'this_month', label: 'Este mes' },
  { key: 'last_month', label: 'Mes pasado' },
  { key: 'last_3_months', label: 'Últimos 3 meses' },
  { key: 'this_year', label: 'Este año' },
  { key: 'custom', label: 'Personalizado' },
]

const statusLabels = {
  idea: '💡 Idea',
  in_progress: '🔄 En Progreso',
  review: '🔍 Revisión',
  done: '✅ Completado',
  cancelled: '❌ Cancelado',
}

// ─── Skeleton Component ──────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
}

function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="card p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <Skeleton className="h-5 w-48" />
      <div className="flex items-end gap-2 h-40">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <Skeleton className="w-full h-24" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ListSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────
function EmptyState() {
  return (
    <div className="card p-16 text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <BarChart3 size={40} className="text-slate-300" />
      </div>
      <p className="text-lg font-medium text-slate-700 mb-2">
        No hay datos suficientes para mostrar métricas
      </p>
      <p className="text-sm text-slate-400 max-w-md mx-auto">
        Comienza registrando facturas, gastos y clientes para ver tus
        análisis y métricas de negocio aquí.
      </p>
      {/* Simple chart illustration */}
      <div className="flex items-end justify-center gap-3 h-24 mt-8 mb-2">
        <div className="w-8 bg-slate-200 rounded-t" style={{ height: '40%' }} />
        <div className="w-8 bg-slate-200 rounded-t" style={{ height: '65%' }} />
        <div className="w-8 bg-slate-300 rounded-t" style={{ height: '50%' }} />
        <div className="w-8 bg-slate-200 rounded-t" style={{ height: '80%' }} />
        <div className="w-8 bg-slate-300 rounded-t" style={{ height: '60%' }} />
        <div className="w-8 bg-slate-200 rounded-t" style={{ height: '45%' }} />
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────
export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('this_month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  // ─── Fetch ─────────────────────────────────────────
  const fetchData = useCallback(async (p, start, end) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const params = new URLSearchParams({ period: p })
      if (p === 'custom') {
        if (start) params.set('start', start)
        if (end) params.set('end', end)
      }

      const res = await fetch(`/api/analytics?${params}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error al cargar analytics' }))
        throw new Error(err.error || 'Error de red')
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      toast.error(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(period, customStart, customEnd)
  }, [period, fetchData])

  // ─── Period handlers ───────────────────────────────
  function handlePeriodChange(key) {
    setPeriod(key)
    setShowCustom(key === 'custom')
    if (key !== 'custom') {
      setCustomStart('')
      setCustomEnd('')
    }
  }

  function applyCustom() {
    if (!customStart || !customEnd) {
      toast.error('Selecciona fecha de inicio y fin')
      return
    }
    if (new Date(customEnd) < new Date(customStart)) {
      toast.error('La fecha de fin debe ser posterior a la de inicio')
      return
    }
    fetchData('custom', customStart, customEnd)
  }

  // ─── Derived ───────────────────────────────────────
  const kpi = data?.kpi
  const incomeUp = kpi && kpi.income_change >= 0

  // ─── Render ────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 size={24} className="text-violet-600" />
          Analíticas
        </h1>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        {periodOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => handlePeriodChange(opt.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === opt.key
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}

        {showCustom && (
          <div className="flex items-center gap-2 ml-2 flex-wrap">
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="input-field text-sm w-auto"
            />
            <span className="text-slate-400 text-sm">—</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="input-field text-sm w-auto"
            />
            <button
              onClick={applyCustom}
              className="px-3 py-2 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-200 transition-colors"
            >
              Aplicar
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div>
          <KPISkeleton />
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6"><ListSkeleton rows={4} /></div>
            <div className="card p-6"><ListSkeleton rows={5} /></div>
          </div>
        </div>
      )}

      {/* Empty / No Data */}
      {!loading && !data && <EmptyState />}

      {/* Data */}
      {!loading && data && (
        <div>
          {/* ── KPI Cards ──────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Income */}
            <div className="card p-4">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <DollarSign size={16} />
                <p className="text-sm text-slate-500">Ingresos totales</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatMXN(kpi.total_income)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {kpi.prev_income > 0 ? (
                  <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${incomeUp ? 'text-emerald-600' : 'text-red-500'}`}>
                    {incomeUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {Math.abs(kpi.income_change).toFixed(1)}% vs {periodLabel[period === 'custom' ? 'last_month' : period] === periodLabel.last_month ? 'mes pasado' : 'periodo anterior'}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Sin datos previos</span>
                )}
              </div>
            </div>

            {/* Expenses */}
            <div className="card p-4">
              <div className="flex items-center gap-2 text-red-500 mb-1">
                <CreditCard size={16} />
                <p className="text-sm text-slate-500">Gastos totales</p>
              </div>
              <p className="text-2xl font-bold text-red-500">
                {formatMXN(kpi.total_expenses)}
              </p>
              {kpi.prev_expenses > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  Anterior: {formatMXN(kpi.prev_expenses)}
                </p>
              )}
            </div>

            {/* Net Profit */}
            <div className="card p-4">
              <div className="flex items-center gap-2 text-violet-600 mb-1">
                <TrendingUp size={16} />
                <p className="text-sm text-slate-500">Ganancia neta</p>
              </div>
              <p className={`text-2xl font-bold ${kpi.net_profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {formatMXN(kpi.net_profit)}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${kpi.profit_margin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  <Target size={12} />
                  Margen: {kpi.profit_margin}%
                </span>
              </div>
            </div>

            {/* Pending Invoices */}
            <div className="card p-4">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <AlertCircle size={16} />
                <p className="text-sm text-slate-500">Facturas pendientes</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {kpi.pending_invoices_count}
              </p>
              {kpi.pending_invoices_count > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  {formatMXN(kpi.pending_invoices_amount)} por cobrar
                </p>
              )}
            </div>
          </div>

          {/* ── Charts Section ──────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Income vs Expenses */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-violet-500" />
                Ingresos vs Gastos mensual
              </h3>
              {(() => {
                const months = data.monthly || []
                const maxVal = Math.max(
                  ...months.map(m => Math.max(m.income, m.expenses)),
                  1
                )
                return (
                  <div className="flex items-end gap-2 h-40">
                    {months.map(m => (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex flex-col items-center gap-0.5">
                          <div
                            className="w-full bg-emerald-400 rounded-t transition-all duration-500"
                            style={{ height: `${(m.income / maxVal) * 100}%` }}
                            title={`Ingresos: ${formatMXN(m.income)}`}
                          />
                          <div
                            className="w-full bg-red-400 rounded-t transition-all duration-500"
                            style={{ height: `${(m.expense || m.expenses) / maxVal * 100}%` }}
                            title={`Gastos: ${formatMXN(m.expense || m.expenses)}`}
                          />
                        </div>
                        <span className="text-xs text-slate-400 uppercase tracking-wide">
                          {m.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })()}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-400" />
                  Ingresos
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-red-400" />
                  Gastos
                </span>
              </div>
            </div>

            {/* Expenses by Category */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <CreditCard size={16} className="text-violet-500" />
                Gastos por categoría
              </h3>
              {data.expenses_by_category.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <p className="text-sm">No hay gastos en este período</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.expenses_by_category.map(c => {
                    const maxCat = data.expenses_by_category[0]?.amount || 1
                    return (
                      <div key={c.category} className="flex items-center gap-3">
                        <span className="text-sm text-slate-600 w-24 truncate font-medium">
                          {c.category}
                        </span>
                        <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-violet-500 rounded-full h-4 transition-all duration-500"
                            style={{ width: `${(c.amount / maxCat) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700 w-20 text-right tabular-nums">
                          {formatMXN(c.amount)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Client Metrics + Recent Activity ────── */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Client Metrics */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Users size={16} className="text-violet-500" />
                Métricas de clientes
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{data.clients.total}</p>
                  <p className="text-xs text-slate-500">Total clientes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{data.clients.active}</p>
                  <p className="text-xs text-slate-500">Activos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-violet-600">
                    {formatMXN(data.clients.average_invoice)}
                  </p>
                  <p className="text-xs text-slate-500">Promedio x cliente</p>
                </div>
              </div>

              {data.clients.top_clients.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Top 5 clientes por ingresos
                  </p>
                  <div className="space-y-2">
                    {data.clients.top_clients.map((c, i) => {
                      const maxClient = data.clients.top_clients[0]?.total || 1
                      return (
                        <div key={c.name} className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                            i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-slate-300'
                          }`}>
                            {i + 1}
                          </span>
                          <span className="text-sm text-slate-700 flex-1 truncate">{c.name}</span>
                          <div className="flex-1 max-w-24">
                            <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-violet-500 rounded-full h-2 transition-all duration-500"
                                style={{ width: `${(c.total / maxClient) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-slate-700 w-20 text-right tabular-nums">
                            {formatMXN(c.total)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Activity size={16} className="text-violet-500" />
                Actividad reciente
              </h3>
              {data.recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <Clock size={32} className="mb-2 text-slate-200" />
                  <p className="text-sm">Sin actividad reciente</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {data.recent.map((item, i) => (
                    <div
                      key={`${item.type}-${item.id}-${i}`}
                      className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        item.type === 'invoice'
                          ? item.status === 'paid' ? 'bg-emerald-100' : 'bg-amber-100'
                          : 'bg-red-100'
                      }`}>
                        {item.type === 'invoice' ? (
                          <DollarSign size={14} className={
                            item.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                          } />
                        ) : (
                          <CreditCard size={14} className="text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 truncate">{item.description}</p>
                        <p className="text-xs text-slate-400">{timeAgo(item.timestamp)}</p>
                      </div>
                      <span className={`text-sm font-medium shrink-0 tabular-nums ${
                        item.type === 'invoice'
                          ? item.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                          : 'text-red-500'
                      }`}>
                        {item.type === 'expense' ? '-' : '+'}{formatMXN(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Project Metrics ─────────────────────── */}
          {Object.keys(data.projects.by_status).length > 0 && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <FolderOpen size={16} className="text-violet-500" />
                Métricas de proyectos
              </h3>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Project by status */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Proyectos por estado
                  </p>
                  <div className="space-y-2">
                    {Object.entries(data.projects.by_status).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-slate-700">
                          {statusLabels[status] || status}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-violet-500 rounded-full h-2 transition-all duration-500"
                              style={{
                                width: `${(count / Math.max(...Object.values(data.projects.by_status))) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-700 w-6 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top projects by budget */}
                {data.projects.top_projects.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Top proyectos por presupuesto
                    </p>
                    <div className="space-y-2">
                      {data.projects.top_projects.map((p, i) => {
                        const maxBudget = data.projects.top_projects[0]?.budget || 1
                        return (
                          <div key={p.name} className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                              i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : 'bg-amber-700'
                            }`}>
                              {i + 1}
                            </span>
                            <span className="text-sm text-slate-700 flex-1 truncate">{p.name}</span>
                            <div className="flex-1 max-w-24">
                              <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-emerald-500 rounded-full h-2 transition-all duration-500"
                                  style={{ width: `${(p.budget / maxBudget) * 100}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-slate-700 w-20 text-right tabular-nums">
                              {formatMXN(p.budget)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* If no projects */}
          {Object.keys(data.projects.by_status).length === 0 && (
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FolderOpen size={24} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-500">
                No hay proyectos registrados todavía. Los proyectos aparecerán aquí cuando los crees.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
