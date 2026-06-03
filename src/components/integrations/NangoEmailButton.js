'use client'

import { useState, useEffect } from 'react'
import Nango from '@nangohq/frontend'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Mail } from 'lucide-react'

export default function NangoEmailButton({ onConnect, variant = 'default', className = '' }) {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  const nango = new Nango()

  useEffect(() => {
    checkConnection()

    const params = new URLSearchParams(window.location.search)
    if (params.get('mail') === 'connected') {
      setConnected(true)
      toast.success('✅ Gmail conectado')
      window.history.replaceState({}, '', window.location.pathname)
      onConnect?.()
    }
    if (params.get('mail') === 'error') {
      const msg = params.get('mail_msg') || 'Error al conectar Gmail'
      toast.error(`❌ ${msg}`)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  async function checkConnection() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const connections = user.user_metadata?.nango_connections || {}
        setConnected(!!connections['google-mail'])
      }
    } catch {}
  }

  async function connectMail() {
    setLoading(true)
    try {
      const res = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google-mail' }),
      })
      const data = await res.json()

      if (data.error) {
        setLoading(false)
        return toast.error('Error: ' + data.error)
      }

      if (!data.sessionToken) {
        setLoading(false)
        return toast.error('No se pudo obtener el token de conexión')
      }

      const connect = nango.openConnectUI({
        onEvent: async (event) => {
          if (event.type === 'connect') {
            await supabase.auth.getUser()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              const connections = user.user_metadata?.nango_connections || {}
              setConnected(!!connections['google-mail'])
            }
            toast.success('✅ Gmail conectado')
            onConnect?.()
          } else if (event.type === 'close') {
            setLoading(false)
          }
        },
      })

      connect.setSessionToken(data.sessionToken)
    } catch (err) {
      setLoading(false)
      toast.error('Error al conectar: ' + err.message)
    }
  }

  if (connected) {
    if (variant === 'badge') {
      return (
        <span className={`inline-flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium ${className}`}>
          <Mail className="w-3 h-3" />
          Conectado ✓
        </span>
      )
    }

    return (
      <span className={`inline-flex items-center gap-2 text-sm text-emerald-600 font-medium ${className}`}>
        <Mail className="w-4 h-4" />
        Conectado ✓
      </span>
    )
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={connectMail}
        disabled={loading}
        className={`inline-flex items-center gap-2 text-sm bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <Mail className="w-4 h-4" />
        )}
        {loading ? 'Conectando...' : 'Conectar Gmail'}
      </button>
    )
  }

  return (
    <button
      onClick={connectMail}
      disabled={loading}
      className={`flex items-center gap-2 text-xs bg-white border border-slate-200 hover:border-violet-300 text-slate-700 px-3 py-1.5 rounded-lg transition-all font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 7l-10 7L2 7" />
        </svg>
      )}
      {loading ? 'Conectando...' : 'Conectar mi Gmail'}
    </button>
  )
}
