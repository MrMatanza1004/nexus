'use client'

import { useState, useEffect, useCallback } from 'react'
import Nango from '@nangohq/frontend'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function NangoDriveButton({ content, filename = 'documento.txt', mimeType = 'text/plain' }) {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nangoReady, setNangoReady] = useState(false)
  const [userId, setUserId] = useState(null)

  const nango = new Nango()

  useEffect(() => {
    checkConnection()

    // Check URL params from Nango callback
    const params = new URLSearchParams(window.location.search)
    if (params.get('drive') === 'connected') {
      setConnected(true)
      toast.success('✅ Google Drive conectado')
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (params.get('drive') === 'error') {
      const msg = params.get('drive_msg') || 'Error al conectar Google Drive'
      toast.error(`❌ ${msg}`)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  async function checkConnection() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const connections = user.user_metadata?.nango_connections || {}
        setConnected(!!connections['google-drive'])
      }
    } catch {}
  }

  async function connectDrive() {
    try {
      // Obtener session token de Nango desde nuestro backend
      const res = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google-drive' }),
      })
      const data = await res.json()

      if (data.error) {
        return toast.error('Error: ' + data.error)
      }

      if (!data.sessionToken) {
        return toast.error('No se pudo obtener el token de conexión')
      }

      // Abrir Connect UI de Nango
      const connect = nango.openConnectUI({
        onEvent: async (event) => {
          if (event.type === 'connect') {
            // Nango webhook ya guardó la conexión.
            // Refrescamos metadata del usuario
            await supabase.auth.getUser()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              const connections = user.user_metadata?.nango_connections || {}
              setConnected(!!connections['google-drive'])
              setUserId(user.id)
            }
            toast.success('✅ Google Drive conectado')
          } else if (event.type === 'close') {
            // Usuario cerró el modal sin conectar
          }
        },
      })

      connect.setSessionToken(data.sessionToken)
    } catch (err) {
      toast.error('Error al conectar: ' + err.message)
    }
  }

  async function saveToDrive() {
    if (!content) return toast.error('No hay contenido para guardar')
    setLoading(true)
    const loadingToast = toast.loading('📤 Guardando en tu Google Drive...')

    try {
      const res = await fetch('/api/google-drive/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, filename, mimeType }),
      })
      const data = await res.json()

      if (data.needsAuth) {
        toast.error(`🔑 ${data.error}`, { id: loadingToast, duration: 6000 })
        setConnected(false)
        return
      }
      if (data.error) {
        toast.error(`❌ ${data.error}`, { id: loadingToast, duration: 6000 })
        return
      }

      toast.success(
        <span>
          ✅ Guardado en Drive —{' '}
          <a href={data.viewUrl} target="_blank" rel="noreferrer" className="underline font-medium">
            Ver archivo
          </a>
        </span>,
        { id: loadingToast, duration: 6000 }
      )
    } catch (err) {
      toast.error('Error al guardar: ' + err.message, { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  // Botón "Conectar Google Drive"
  if (!connected) {
    return (
      <button
        onClick={connectDrive}
        className="flex items-center gap-2 text-xs bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg transition-all font-medium shadow-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 87.3 78" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L28 48.2H0c0 1.55.4 3.1 1.2 4.5l5.4 14.15z" fill="#0066DA"/>
          <path d="M43.65 25L29.35 0c-1.35.8-2.5 1.9-3.3 3.3L1.2 43.7C.4 45.1 0 46.65 0 48.2h28l15.65-23.2z" fill="#00AC47"/>
          <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.3l5.9 11.5 8.35 12.3z" fill="#EA4335"/>
          <path d="M43.65 25L57.95 0H29.35L43.65 25z" fill="#00832D"/>
          <path d="M59.3 48.2H87.3L73 23.55 57.95 0 43.65 25 59.3 48.2z" fill="#2684FC"/>
          <path d="M28 48.2l-14.25 28.6c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2L59.3 48.2H28z" fill="#FFBA00"/>
        </svg>
        Conectar mi Google Drive
      </button>
    )
  }

  // Botón "Guardar en mi Drive"
  return (
    <button
      onClick={saveToDrive}
      disabled={loading || !content}
      className="flex items-center gap-2 text-xs bg-white border border-slate-200 hover:border-green-300 text-slate-700 hover:text-green-700 px-3 py-1.5 rounded-lg transition-all font-medium shadow-sm disabled:opacity-50"
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      ) : (
        <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
      )}
      {loading ? 'Guardando...' : '📁 Guardar en mi Drive'}
    </button>
  )
}
