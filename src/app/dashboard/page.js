'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import AffiliateDashboardCard from '@/components/AffiliateDashboardCard'
import Link from 'next/link'

export default function DashboardHome() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ clients: 0, tasks: 0, invoicesTotal: 0, projects: 0, invoicesPending: 0 })
  const [recentClients, setRecentClients] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    try {
      supabase.auth.getUser().then(({ data }) => {
        setUser(data?.user ?? null)
        const h = new Date().getHours()
        if (h < 12) setGreeting('Buenos días ☀️')
        else if (h < 18) setGreeting('Buenas tardes 🌤️')
        else setGreeting('Buenas noches 🌙')
      })
    } catch {
      setUser(null)
    }

    loadStats()
    loadRecent()
  }, [])

  async function loadStats() {
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return

    const [clients, tasks, invoices, projects] = await Promise.all([
      supabase.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('invoices').select('amount, status').eq('user_id', user.id),
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

    const paidInvoices = invoices.data?.filter(i => i.status === 'paid') || []
    const totalPaid = paidInvoices.reduce((sum, i) => sum + Number(i.amount || 0), 0)
    const pendingCount = invoices.data?.filter(i => i.status === 'pending' || i.status === 'overdue').length || 0

    setStats({
      clients: clients.count || 0,
      tasks: tasks.count || 0,
      invoicesTotal: totalPaid,
      projects: projects.count || 0,
      invoicesPending: pendingCount,
    })
  }

  async function loadRecent() {
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return

    const { data: cls } = await supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
    if (cls) setRecentClients(cls)

    const { data: tks } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
    if (tks) setRecentTasks(tks)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{greeting}</h1>
        <p className="text-slate-500 mt-1">{user?.user_metadata?.full_name || 'Freelancer'}, acá está el resumen de tu negocio.</p>
      </div>

      {/* Affiliate Card */}
      <div className="mb-6">
        <AffiliateDashboardCard />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Clientes', value: stats.clients, icon: '👥', color: 'violet', href: '/dashboard/clients' },
          { label: 'Proyectos', value: stats.projects, icon: '📁', color: 'emerald', href: '/dashboard/projects' },
          { label: 'Facturado', value: formatCurrency(stats.invoicesTotal), icon: '💰', color: 'amber', href: '/dashboard/invoices' },
          { label: 'Pendientes', value: stats.invoicesPending, icon: '⏳', color: 'rose', href: '/dashboard/invoices' },
        ].map((s, i) => (
          <Link key={i} href={s.href} className="card p-4 sm:p-6 card-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-3xl font-bold text-slate-900">{s.value}</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '👤', label: 'Nuevo Cliente', href: '/dashboard/clients', color: 'violet' },
          { icon: '📄', label: 'Nueva Propuesta', href: '/dashboard/proposals', color: 'emerald' },
          { icon: '📋', label: 'Nueva Tarea', href: '/dashboard/tasks', color: 'amber' },
          { icon: '💰', label: 'Nueva Factura', href: '/dashboard/invoices', color: 'blue' },
        ].map((action, i) => (
          <Link key={i} href={action.href} className="card p-4 flex items-center gap-3 card-hover">
            <div className={`w-10 h-10 rounded-lg bg-${action.color}-100 flex items-center justify-center text-xl`}>
              {action.icon}
            </div>
            <span className="font-medium text-slate-900">{action.label}</span>
            <span className="ml-auto text-slate-400">→</span>
          </Link>
        ))}
      </div>

      {/* Recent items */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Últimos Clientes</h2>
            <Link href="/dashboard/clients" className="text-sm text-violet-600 font-medium hover:text-violet-700">Ver todos →</Link>
          </div>
          {recentClients.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Todavía no tenés clientes. Creá el primero.</p>
          ) : (
            <div className="space-y-3">
              {recentClients.map(client => (
                <div key={client.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                      {client.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.email || client.company || '—'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(client.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Últimas Tareas</h2>
            <Link href="/dashboard/tasks" className="text-sm text-violet-600 font-medium hover:text-violet-700">Ver todas →</Link>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No tenés tareas pendientes. Bien ahí 🎉</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : task.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <span className={`text-sm ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900 font-medium'}`}>
                      {task.title}
                    </span>
                  </div>
                  {task.due_date && <span className="text-xs text-slate-400">{formatDate(task.due_date)}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
