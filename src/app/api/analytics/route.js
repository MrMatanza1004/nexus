// ─────────────────────────────────────────────
// NEXUS — BI Analytics API
// ─────────────────────────────────────────────
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

function getMonthRange(year, month) {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59)
  return { start, end }
}

export async function GET(req) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const period = url.searchParams.get('period') || 'this_month'
    const customStart = url.searchParams.get('start') || ''
    const customEnd = url.searchParams.get('end') || ''

    // ── Resolve date ranges ─────────────────────────
    const now = new Date()
    let startDate, endDate

    switch (period) {
      case 'this_month': {
        const r = getMonthRange(now.getFullYear(), now.getMonth())
        startDate = r.start
        endDate = now
        break
      }
      case 'last_month': {
        const r = getMonthRange(now.getFullYear(), now.getMonth() - 1)
        startDate = r.start
        endDate = r.end
        break
      }
      case 'last_3_months': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        endDate = now
        break
      }
      case 'this_year': {
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = now
        break
      }
      case 'custom': {
        startDate = customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = customEnd ? new Date(customEnd) : now
        break
      }
      default: {
        const r = getMonthRange(now.getFullYear(), now.getMonth())
        startDate = r.start
        endDate = now
      }
    }

    const startISO = startDate.toISOString()
    const endISO = endDate.toISOString()
    const startDateStr = startISO.slice(0, 10)
    const endDateStr = endISO.slice(0, 10)

    // ── Previous period (same duration, immediately before start) ──
    const periodDuration = endDate.getTime() - startDate.getTime()
    const prevEnd = new Date(startDate.getTime() - 86400000)
    const prevStart = new Date(prevEnd.getTime() - periodDuration)
    const prevStartISO = prevStart.toISOString()
    const prevEndISO = prevEnd.toISOString()
    const prevStartStr = prevStartISO.slice(0, 10)
    const prevEndStr = prevEndISO.slice(0, 10)

    // ── Parallel queries ────────────────────────────
    const [
      currentInvoicesRes,
      prevInvoicesRes,
      currentExpensesRes,
      prevExpensesRes,
      pendingInvoicesRes,
      clientsRes,
      projectsRes,
      monthlyInvoicesRes,
      monthlyExpensesRes,
      recentInvoicesRes,
      recentExpensesRes,
    ] = await Promise.all([
      // Paid invoices — current period
      supabase
        .from('invoices')
        .select('id, amount, client_id, paid_at')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('paid_at', startISO)
        .lte('paid_at', endISO),

      // Paid invoices — previous period (for comparison)
      supabase
        .from('invoices')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('paid_at', prevStartISO)
        .lte('paid_at', prevEndISO),

      // Expenses — current period
      supabase
        .from('expenses')
        .select('id, amount, category, date, description')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .lte('date', endDateStr),

      // Expenses — previous period
      supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', prevStartStr)
        .lte('date', prevEndStr),

      // Pending invoices
      supabase
        .from('invoices')
        .select('id, amount')
        .eq('user_id', user.id)
        .in('status', ['pending', 'overdue']),

      // All clients
      supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user.id),

      // All projects
      supabase
        .from('projects')
        .select('id, name, status, budget')
        .eq('user_id', user.id),

      // Monthly invoices chart (last 6 months)
      supabase
        .from('invoices')
        .select('amount, paid_at')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .gte('paid_at', new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()),

      // Monthly expenses chart (last 6 months)
      supabase
        .from('expenses')
        .select('amount, date')
        .eq('user_id', user.id)
        .gte('date', new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10)),

      // Recent invoices (for activity feed)
      supabase
        .from('invoices')
        .select('id, amount, number, client_id, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),

      // Recent expenses (for activity feed)
      supabase
        .from('expenses')
        .select('id, amount, category, description, date, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    // ── Unpack ───────────────────────────────────────
    const paidInvoices = currentInvoicesRes.data || []
    const prevPaidInvoices = prevInvoicesRes.data || []
    const currentExpenses = currentExpensesRes.data || []
    const prevExpensesData = prevExpensesRes.data || []
    const pendingInvoices = pendingInvoicesRes.data || []
    const allClients = clientsRes.data || []
    const allProjects = projectsRes.data || []
    const monthlyInvoices = monthlyInvoicesRes.data || []
    const monthlyExpenses = monthlyExpensesRes.data || []
    const recentInvoices = recentInvoicesRes.data || []
    const recentExpenses = recentExpensesRes.data || []

    // Build client name map
    const clientMap = {}
    allClients.forEach(c => { clientMap[c.id] = c.name })

    // ── KPI Calculations ─────────────────────────────
    const totalIncome = paidInvoices.reduce((s, i) => s + Number(i.amount || 0), 0)
    const prevIncome = prevPaidInvoices.reduce((s, i) => s + Number(i.amount || 0), 0)
    const totalExpenses = currentExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)
    const prevExpensesTotal = prevExpensesData.reduce((s, e) => s + Number(e.amount || 0), 0)
    const netProfit = totalIncome - totalExpenses
    const prevNet = prevIncome - prevExpensesTotal
    const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0
    const pendingCount = pendingInvoices.length
    const pendingAmount = pendingInvoices.reduce((s, i) => s + Number(i.amount || 0), 0)
    const incomeChange = prevIncome > 0
      ? Math.round(((totalIncome - prevIncome) / prevIncome) * 10000) / 100
      : totalIncome > 0 ? 100 : 0

    // ── Expenses by category ─────────────────────────
    const categoryMap = {}
    currentExpenses.forEach(e => {
      const cat = e.category || 'Otros'
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount || 0)
    })
    const expensesByCategory = Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount)

    // ── Monthly chart (last 6 months) ────────────────
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = d.toISOString().slice(0, 7)
      const label = d.toLocaleDateString('es-MX', { month: 'short', timeZone: 'UTC' })
      months.push({ month: monthKey, label, income: 0, expenses: 0 })
    }

    monthlyInvoices.forEach(inv => {
      if (!inv.paid_at) return
      const key = inv.paid_at.slice(0, 7)
      const m = months.find(m => m.month === key)
      if (m) m.income += Number(inv.amount || 0)
    })
    monthlyExpenses.forEach(exp => {
      if (!exp.date) return
      const key = exp.date.slice(0, 7)
      const m = months.find(m => m.month === key)
      if (m) m.expenses += Number(exp.amount || 0)
    })

    // ── Client metrics ───────────────────────────────
    const clientIdsInPeriod = new Set(paidInvoices.filter(i => i.client_id).map(i => i.client_id))
    const activeClients = clientIdsInPeriod.size
    const totalClients = allClients.length
    const avgInvoicePerClient = activeClients > 0 ? totalIncome / activeClients : 0

    // Top clients by revenue
    const clientRevenue = {}
    paidInvoices.forEach(inv => {
      if (!inv.client_id) return
      const name = clientMap[inv.client_id] || 'Sin nombre'
      clientRevenue[name] = (clientRevenue[name] || 0) + Number(inv.amount || 0)
    })
    const topClients = Object.entries(clientRevenue)
      .map(([name, total]) => ({ name, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    // ── Project metrics ──────────────────────────────
    const projectStatusCount = {}
    allProjects.forEach(p => {
      const st = p.status || 'unknown'
      projectStatusCount[st] = (projectStatusCount[st] || 0) + 1
    })

    const topProjects = allProjects
      .filter(p => p.budget)
      .sort((a, b) => (b.budget || 0) - (a.budget || 0))
      .slice(0, 3)
      .map(p => ({ name: p.name, budget: Number(p.budget || 0) }))

    // ── Recent activity feed ─────────────────────────
    const recentActivity = [
      ...recentInvoices.map(inv => ({
        type: 'invoice',
        id: inv.id,
        description: `Factura ${inv.number || ''} — ${clientMap[inv.client_id] || 'Cliente'}`,
        amount: Number(inv.amount || 0),
        status: inv.status,
        timestamp: inv.created_at,
      })),
      ...recentExpenses.map(exp => ({
        type: 'expense',
        id: exp.id,
        description: `Gasto: ${exp.description || exp.category || 'Sin descripción'}`,
        amount: Number(exp.amount || 0),
        category: exp.category,
        timestamp: exp.date || exp.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      .slice(0, 10)

    // ── Response ─────────────────────────────────────
    return NextResponse.json({
      kpi: {
        total_income: Math.round(totalIncome * 100) / 100,
        total_expenses: Math.round(totalExpenses * 100) / 100,
        net_profit: Math.round(netProfit * 100) / 100,
        profit_margin: profitMargin,
        income_change: incomeChange,
        prev_income: Math.round(prevIncome * 100) / 100,
        prev_expenses: Math.round(prevExpensesTotal * 100) / 100,
        prev_net: Math.round(prevNet * 100) / 100,
        pending_invoices_count: pendingCount,
        pending_invoices_amount: Math.round(pendingAmount * 100) / 100,
      },
      monthly: months.map(m => ({
        ...m,
        income: Math.round(m.income * 100) / 100,
        expenses: Math.round(m.expenses * 100) / 100,
      })),
      expenses_by_category: expensesByCategory,
      clients: {
        total: totalClients,
        active: activeClients,
        average_invoice: Math.round(avgInvoicePerClient * 100) / 100,
        top_clients: topClients,
      },
      projects: {
        by_status: projectStatusCount,
        top_projects: topProjects,
      },
      recent: recentActivity,
    })
  } catch (err) {
    console.error('Analytics API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
