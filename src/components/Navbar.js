'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const cleanupRef = useRef(null)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setUser(data?.session?.user ?? null)
      } catch {
        setUser(null)
      }
    }
    initAuth()

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })
      cleanupRef.current = subscription
    } catch {
      // Silently fail if proxy returned stub
    }

    return () => cleanupRef.current?.unsubscribe()
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="w-8 h-8 shrink-0" xmlns="http://www.w3.org/2000/svg" aria-label="NEXUS logo">
              <rect width="32" height="32" rx="7" fill="#7c3aed" />
              <g fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 10 L10 22" />
                <path d="M22 10 L22 22" />
                <path d="M11 22 L21 10" />
                <circle cx="16" cy="16" r="1.5" fill="#fff" />
              </g>
            </svg>
            <span className="font-extrabold tracking-wider text-white text-lg hidden sm:inline">NEXUS</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/tools/rate-calculator" className="text-zinc-400 hover:text-white font-medium transition-colors text-sm">
              Calculadora
            </Link>
            <Link href="/tools/contract-generator" className="text-zinc-400 hover:text-white font-medium transition-colors text-sm">
              Contratos
            </Link>
            <Link href="/pricing" className="text-zinc-400 hover:text-white font-medium transition-colors text-sm">
              Precios
            </Link>
            {user ? (
              <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">
                Ir al Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-zinc-400 hover:text-white font-medium transition-colors text-sm">
                  Iniciar Sesion
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  Comenzar Gratis
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-zinc-800"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 p-4 space-y-3">
          <Link href="/tools/rate-calculator" className="block text-zinc-400 hover:text-white font-medium py-2 text-sm" onClick={() => setMenuOpen(false)}>
            Calculadora
          </Link>
          <Link href="/tools/contract-generator" className="block text-zinc-400 hover:text-white font-medium py-2 text-sm" onClick={() => setMenuOpen(false)}>
            Contratos
          </Link>
          <Link href="/pricing" className="block text-zinc-400 hover:text-white font-medium py-2 text-sm" onClick={() => setMenuOpen(false)}>
            Precios
          </Link>
          {user ? (
            <Link href="/dashboard" className="block btn-primary text-center text-sm py-2" onClick={() => setMenuOpen(false)}>
              Ir al Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="block text-zinc-400 hover:text-white font-medium py-2 text-sm" onClick={() => setMenuOpen(false)}>
                Iniciar Sesion
              </Link>
              <Link href="/register" className="block btn-primary text-center text-sm py-2" onClick={() => setMenuOpen(false)}>
                Comenzar Gratis
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
