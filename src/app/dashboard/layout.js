'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AffiliateSidebarWidget from '@/components/AffiliateSidebarWidget'
import Logo from '@/components/Logo'
import toast from 'react-hot-toast'

const sidebarItems = [
  { icon: '📊', label: 'Dashboard', href: '/dashboard' },
  { icon: '📊', label: 'Pipeline', href: '/dashboard/pipeline' },
  { icon: '📋', label: 'Tareas', href: '/dashboard/tasks' },
  { icon: '👥', label: 'Clientes', href: '/dashboard/clients' },
  { icon: '📁', label: 'Proyectos', href: '/dashboard/projects' },
  { icon: '✉️', label: 'Correo', href: '/dashboard/email' },
  { icon: '🗓️', label: 'Calendario', href: '/dashboard/calendar' },
  { icon: '📝', label: 'Notas', href: '/dashboard/notes' },
  { icon: '📓', label: 'Diario', href: '/dashboard/journal' },
  { icon: '📄', label: 'Propuestas', href: '/dashboard/proposals' },
  { icon: '⚖️', label: 'Contratos', href: '/dashboard/contracts' },
  { icon: '💳', label: 'Gastos', href: '/dashboard/expenses' },
  { icon: '💰', label: 'Facturas', href: '/dashboard/invoices' },
  { icon: '⏱️', label: 'Tiempo', href: '/dashboard/time' },
  { icon: '💾', label: 'Archivos', href: '/dashboard/files' },
  { icon: '🤖', label: 'AI Tools', href: '/dashboard/ai' },
  { icon: '💰', label: 'Tax Dashboard', href: '/dashboard/tax' },
  { icon: '🤝', label: 'Afiliados', href: '/dashboard/affiliate' },
  { icon: '🎯', label: 'Metas', href: '/dashboard/goals' },
  { icon: '⭐', label: 'Testimonios', href: '/dashboard/testimonials' },
  { icon: '💬', label: 'Feedback', href: '/dashboard/feedback' },
  { icon: '📊', label: 'Analíticas', href: '/dashboard/analytics' },
  { icon: '📊', label: 'Admin', href: '/dashboard/admin', adminOnly: true },
  { icon: '⚙️', label: 'Configuración', href: '/dashboard/settings' },
]

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAdmin = user?.email === 'imthebow@gmail.com'
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let cancelled = false
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled) return
        if (!session) {
          router.push('/login')
          return
        }
        setUser(session.user)

        // Verificar estado de Google Drive via Nango
        const meta = session.user?.user_metadata || {}
        const nangoConnections = meta.nango_connections || {}
        const driveConnected = !!nangoConnections['google-drive'] || !!meta.drive_access_token
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    checkSession()
    return () => { cancelled = true }
  }, [router])

  async function handleLogout() {
    try {
      await supabase.auth.signOut()
      toast.success('Sesión cerrada')
      router.push('/')
    } catch {
      // Silently fail if proxy returned stub
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex pt-16">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-slate-900 text-white z-30 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 overflow-y-auto`}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6 px-3">
              <Logo variant="icon" />
              <div>
                <p className="font-bold text-sm tracking-wider">NEXUS</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
          </div>

          <nav className="space-y-1">
            {sidebarItems.filter(item => item.adminOnly ? isAdmin : true).map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link text-sm ${pathname === item.href ? 'sidebar-link-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <AffiliateSidebarWidget />

          <div className="border-t border-white/10 mt-6 pt-4 px-3">
            <button onClick={handleLogout} className="sidebar-link w-full text-slate-400 hover:text-red-400 text-sm">
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo variant="icon" className="!w-6 !h-6" />
            <span className="font-bold text-slate-900 text-sm tracking-wider">NEXUS</span>
          </Link>
          <div className="w-10" />
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
