'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from 'recharts'

const ADMIN_EMAIL = 'imthebow@gmail.com'

function StatCard({ label, value, sub, icon, color }) {
  return (
    <div className="card p-5 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full opacity-10 ${color}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

const PIE_COLORS = ['#8b5cf6', '#f59e0b', '#94a3b8', '#38bdf8', '#ef4444']

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data?.user ?? null
      setUser(u)
      if (!u) { router.push('/login'); return }
      if (u.email !== ADMIN_EMAIL) {
        setError('Acceso denegado. Solo el administrador puede acceder a esta sección.')
        setLoading(false)
        return
      }
      fetch('/api/admin/stats')
        .then(r => r.json())
        .then(d => { if (d.error) setError(d.error); else setStats(d) })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }).catch(() => router.push('/login'))
  }, [router])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 text-violet-600 mx-auto mb-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-slate-500">Cargando estadísticas en vivo...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="card p-8 border-red-200 text-center max-w-md">
        <span className="text-4xl block mb-4">🔒</span>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso Restringido</h2>
        <p className="text-slate-600">{error}</p>
      </div>
    </div>
  )

  if (!stats) return null

  const fmt = (n) => '$' + (n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })
  const pct = (n) => (n || 0).toLocaleString('es-MX', { minimumFractionDigits: 1 }) + '%'

  // Plan distribution for pie chart
  const planPie = Object.entries(stats.plans || {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">📊 Admin Dashboard</h1>
        <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium">
          👑 {user?.email}
        </span>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard label="Usuarios" value={stats.users?.total || 0} icon="👥" color="bg-indigo-500" />
        <StatCard label="Nuevos / Semana" value={stats.users?.new_this_week || 0} icon="🌟" color="bg-amber-500" />
        <StatCard label="Subs Activas" value={stats.users?.active_subscriptions || 0} icon="✅" color="bg-emerald-500" />
        <StatCard label="En Prueba" value={stats.users?.trial || 0} icon="🔍" color="bg-sky-500" />
        <StatCard label="Cancelados" value={stats.users?.cancelled || 0} icon="🚫" color="bg-slate-500" />
        <StatCard label="Conversión" value={stats.users?.conversion_label || '0%'} sub={`${stats.users?.active_subscriptions || 0} pagaron`} icon="📈" color="bg-violet-500" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        <StatCard label="Ingresos Totales" value={fmt(stats.revenue?.total)} sub={stats.revenue?.currency || 'MXN'} icon="💰" color="bg-emerald-500" />
        <StatCard label="Ingresos este Mes" value={fmt(stats.revenue?.this_month)} sub={`${stats.revenue?.total_charges || 0} transacciones`} icon="📈" color="bg-violet-500" />
        <StatCard label="Clientes Stripe" value={stats.stripe?.total_customers || 0} icon="🏦" color="bg-blue-500" />
      </div>

      {/* ─── Charts Row ─── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-1">💰 Ingresos (últimos 30 días)</h3>
          <p className="text-xs text-slate-400 mb-4">MXN — Datos en vivo de Stripe</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenue?.by_day || []}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={n => '$' + (n >= 1000 ? (n/1000).toFixed(0) + 'k' : n)} />
                <Tooltip formatter={(v) => [fmt(v), 'Ingresos']} labelFormatter={d => d} />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Signups Chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-1">📊 Nuevos Registros (30 días)</h3>
          <p className="text-xs text-slate-400 mb-4">Usuarios por día — Supabase en vivo</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts?.signups || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip formatter={(v) => [v, 'Nuevos usuarios']} labelFormatter={d => d} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── Plan Distribution + Stripe Status ─── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Plan Pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-1">📋 Distribución de Planes</h3>
          <p className="text-xs text-slate-400 mb-4">En vivo desde Supabase</p>
          {planPie.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {planPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {planPie.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="capitalize text-slate-700 w-20">{item.name}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className="h-full rounded-full" style={{ width: `${(item.value / (stats.users?.total || 1)) * 100}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                    <span className="text-slate-500 w-8 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Sin datos de planes todavía</p>
          )}
        </div>

        {/* Stripe Status */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 mb-3">💳 Estado Stripe</h3>
          <div className="space-y-4">
            {[
              { label: 'Suscripciones Activas', value: stats.stripe?.active_subscriptions || 0, color: 'bg-emerald-500', max: (stats.stripe?.active_subscriptions || 0) + (stats.stripe?.past_due || 0) + (stats.stripe?.canceled || 0) || 1 },
              { label: 'Vencidas (past_due)', value: stats.stripe?.past_due || 0, color: 'bg-red-500', max: 1 },
              { label: 'Canceladas', value: stats.stripe?.canceled || 0, color: 'bg-slate-400', max: 1 },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.value}</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2.5">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div><span className="font-medium text-slate-700">Clientes Stripe:</span> {stats.stripe?.total_customers || 0}</div>
              <div><span className="font-medium text-slate-700">Total cargos:</span> {stats.revenue?.total_charges || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── AFFILIATES DETALLADO ─── */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-1">🔗 Afiliados — Detalle por Código</h3>
        <p className="text-xs text-slate-400 mb-4">En vivo desde Supabase</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Conversiones" value={stats.affiliate?.total_conversions || 0} icon="🔗" color="bg-cyan-500" />
          <StatCard label="Pagadas" value={stats.affiliate?.paid_conversions || 0} icon="✅" color="bg-teal-500" />
          <StatCard label="Pendientes" value={stats.affiliate?.pending_conversions || 0} icon="⏳" color="bg-amber-500" />
          <StatCard label="Comisiones Pagadas" value={fmt(stats.affiliate?.total_commissions_paid)} icon="💸" color="bg-fuchsia-500" />
        </div>

        {stats.affiliate?.affiliates?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-2 font-medium">Código</th>
                  <th className="pb-2 font-medium">Total Ref</th>
                  <th className="pb-2 font-medium">Pagadas</th>
                  <th className="pb-2 font-medium">Pendientes</th>
                  <th className="pb-2 font-medium">Comisiones</th>
                  <th className="pb-2 font-medium">Tasa Éxito</th>
                </tr>
              </thead>
              <tbody>
                {stats.affiliate.affiliates.map((aff, i) => (
                  <tr key={aff.code} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50">
                    <td className="py-2.5 font-mono text-xs font-medium text-violet-600">{aff.code}</td>
                    <td className="py-2.5 font-semibold">{aff.total}</td>
                    <td className="py-2.5 text-emerald-600 font-medium">{aff.paid}</td>
                    <td className="py-2.5 text-amber-600">{aff.pending}</td>
                    <td className="py-2.5 font-semibold">{fmt(aff.commissions)}</td>
                    <td className="py-2.5">
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                        {aff.total > 0 ? Math.round((aff.paid / aff.total) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <p className="text-lg mb-1">🔗</p>
            <p>Sin conversiones de afiliados todavía</p>
            <p className="text-xs mt-1">Cuando un afiliado refiera a alguien y pague, aparecerá acá</p>
          </div>
        )}
      </div>

      {/* ─── ALL USERS + EXPORT ─── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-slate-900">📧 Todos los Usuarios Registrados</h3>
          <button
            onClick={() => {
              const header = 'Email,Plan,Fecha Registro,Código Afiliado\n'
              const rows = (stats.all_profiles || []).map(u =>
                `"${u.email || ''}","${u.plan_type || 'trial'}","${u.created_at ? new Date(u.created_at).toISOString().slice(0, 10) : ''}","${u.affiliate_code || ''}"`
              ).join('\n')
              const blob = new Blob([header + rows], { type: 'text/plain;charset=utf-8' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `nexus-usuarios-${new Date().toISOString().slice(0, 10)}.csv`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="btn-primary text-sm py-2 px-4"
          >
            📥 Exportar CSV
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">{stats.all_profiles?.length || 0} usuarios registrados</p>

        {stats.all_profiles?.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Plan</th>
                    <th className="pb-2 font-medium">Registro</th>
                    <th className="pb-2 font-medium">Afiliado</th>
                    <th className="pb-2 font-medium">ID</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.all_profiles.map((u, i) => (
                    <tr key={u.id || i} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50">
                      <td className="py-2 text-xs font-medium text-violet-600">{u.email || '-'}</td>
                      <td className="py-2">
                        <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                          u.plan_type === 'pro' || u.plan_type === 'ai'
                            ? 'bg-emerald-100 text-emerald-700'
                            : u.plan_type === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>{u.plan_type || 'trial'}</span>
                      </td>
                      <td className="py-2 text-xs text-slate-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '-'}
                      </td>
                      <td className="py-2 font-mono text-xs text-slate-400">{u.affiliate_code || '-'}</td>
                      <td className="py-2 font-mono text-xs text-slate-400">{u.id?.slice(0, 8)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-2 md:hidden">
              {stats.all_profiles.slice(0, 20).map((u, i) => (
                <div key={u.id || i} className="border border-slate-100 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-violet-600 text-xs truncate max-w-[200px]">{u.email || '-'}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      u.plan_type === 'pro' || u.plan_type === 'ai' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>{u.plan_type || 'trial'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{u.created_at ? new Date(u.created_at).toLocaleDateString('es-MX') : '-'}</span>
                    <span className="font-mono">{u.affiliate_code || '-'}</span>
                  </div>
                </div>
              ))}
              {stats.all_profiles.length > 20 && (
                <p className="text-xs text-slate-400 text-center py-2">
                  +{stats.all_profiles.length - 20} usuarios más — exportá el CSV para verlos todos
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400 py-4 text-center">Sin usuarios registrados todavía</p>
        )}
      </div>

      {/* ─── Recent Signups ─── */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 mb-1">🆕 Últimos 10 Registros</h3>
        <p className="text-xs text-slate-400 mb-4">Usuarios más recientes</p>
        {stats.recent_signups?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="pb-2 font-medium">ID</th>
                  <th className="pb-2 font-medium">Plan</th>
                  <th className="pb-2 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_signups.map((u, i) => (
                  <tr key={u.id || i} className="border-b border-slate-100 text-slate-700">
                    <td className="py-2 font-mono text-xs text-slate-400">{u.id?.slice(0, 12)}...</td>
                    <td className="py-2">
                      <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        u.plan_type === 'pro' || u.plan_type === 'ai'
                          ? 'bg-emerald-100 text-emerald-700'
                          : u.plan_type === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.plan_type || 'trial'}
                      </span>
                    </td>
                    <td className="py-2 text-slate-500 text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-4 text-center">Sin registros todavía</p>
        )}
      </div>
    </div>
  )
}
