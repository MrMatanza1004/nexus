'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription?.unsubscribe()
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-xl text-slate-900">NEXUS</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/tools/rate-calculator" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Calculadora
            </Link>
            <Link href="/tools/contract-generator" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Contratos
            </Link>
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Precios
            </Link>
            {user ? (
              <Link href="/dashboard" className="btn-primary text-sm py-2.5">
                Ir al Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2.5">
                  Comenzar Gratis
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3">
          <Link href="/tools/rate-calculator" className="block text-slate-600 font-medium py-2" onClick={() => setMenuOpen(false)}>
            Calculadora
          </Link>
          <Link href="/tools/contract-generator" className="block text-slate-600 font-medium py-2" onClick={() => setMenuOpen(false)}>
            Contratos
          </Link>
          <Link href="/pricing" className="block text-slate-600 font-medium py-2" onClick={() => setMenuOpen(false)}>
            Precios
          </Link>
          {user ? (
            <Link href="/dashboard" className="block btn-primary text-center text-sm" onClick={() => setMenuOpen(false)}>
              Ir al Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="block text-slate-600 font-medium py-2" onClick={() => setMenuOpen(false)}>
                Iniciar Sesión
              </Link>
              <Link href="/register" className="block btn-primary text-center text-sm" onClick={() => setMenuOpen(false)}>
                Comenzar Gratis
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
