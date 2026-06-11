'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

const QR_EXPIRY_SECONDS = 120
const POLL_INTERVAL_CONNECTED = 60000   // cada 60s si está conectado
const POLL_INTERVAL_SCANNING = 10000    // cada 10s mientras escanea

export default function WhatsAppQR() {
  const [status, setStatus] = useState('loading')
  const [qr, setQr] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState(null)
  const [connectedAt, setConnectedAt] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [countdown, setCountdown] = useState(QR_EXPIRY_SECONDS)
  const [autoConnectDone, setAutoConnectDone] = useState(false)
  const countdownRef = useRef(null)
  const pollRef = useRef(null)

  // ─── Fetch status from API ─────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/session/status')
      if (!res.ok) return
      const data = await res.json()
      setStatus(data.status)
      if (data.qr) setQr(data.qr)
      if (data.phoneNumber) setPhoneNumber(data.phoneNumber)
      if (data.connectedAt) setConnectedAt(data.connectedAt)

      // Si volvió a disconnected mientras estábamos conectados, refrescar
      return data
    } catch (err) {
      console.error('Status fetch error:', err)
    }
  }, [])

  // ─── Auto‑connect on mount if disconnected ────────────────────
  const connect = useCallback(async () => {
    if (connecting) return
    setConnecting(true)
    try {
      const res = await fetch('/api/whatsapp/session/connect', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'Already connected. Disconnect first.') {
          setStatus('connected')
          toast('WhatsApp ya está conectado')
        } else {
          toast.error(data.error || 'Error al conectar')
        }
        return
      }
      setStatus('scanning')
      setQr(data.qr)
      setCountdown(data.expiresIn || QR_EXPIRY_SECONDS)
      toast.success('Escaneá el código QR con WhatsApp')
    } catch (err) {
      toast.error('Error de conexión: ' + err.message)
    } finally {
      setConnecting(false)
    }
  }, [connecting])

  // ─── Auto‑connect on first load ────────────────────────────────
  useEffect(() => {
    if (autoConnectDone) return
    fetchStatus().then(data => {
      setAutoConnectDone(true)
      if (!data || data.status === 'disconnected' || data.status === 'loading') {
        connect()
      }
    })
  }, [autoConnectDone, fetchStatus, connect])

  // ─── Polling ───────────────────────────────────────────────────
  useEffect(() => {
    const interval = status === 'scanning' ? POLL_INTERVAL_SCANNING : POLL_INTERVAL_CONNECTED
    pollRef.current = setInterval(fetchStatus, interval)
    return () => clearInterval(pollRef.current)
  }, [status, fetchStatus])

  // ─── QR countdown ──────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'scanning') {
      if (countdownRef.current) clearInterval(countdownRef.current)
      return
    }

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // QR expired → auto‑regenerate
          clearInterval(countdownRef.current)
          connect()
          return QR_EXPIRY_SECONDS
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownRef.current)
  }, [status, connect])

  // ─── Disconnect ────────────────────────────────────────────────
  const handleDisconnect = async () => {
    if (!confirm('¿Desconectar WhatsApp?')) return
    setDisconnecting(true)
    try {
      const res = await fetch('/api/whatsapp/session/disconnect', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Error al desconectar')
        return
      }
      setStatus('disconnected')
      setQr(null)
      setPhoneNumber(null)
      setConnectedAt(null)
      setCountdown(QR_EXPIRY_SECONDS)
      toast.success('WhatsApp desconectado')
      // Auto‑generar nuevo QR después de desconectar
      setTimeout(() => connect(), 500)
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setDisconnecting(false)
    }
  }

  // ─── Manual QR regenerate ──────────────────────────────────────
  const handleRegenerate = () => {
    setCountdown(QR_EXPIRY_SECONDS)
    connect()
  }

  // ─── Loading state ─────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="card p-8 text-center">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 mt-3 text-sm">Verificando sesión...</p>
      </div>
    )
  }

  // ─── Connected state ───────────────────────────────────────────
  if (status === 'connected') {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">Conectado ✓</h3>
        {phoneNumber && <p className="text-slate-500 mb-1">{phoneNumber}</p>}
        {connectedAt && (
          <p className="text-xs text-slate-400 mb-6">
            Desde {new Date(connectedAt).toLocaleString('es-AR')}
          </p>
        )}
        <button
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-6 rounded-lg transition-all text-sm"
        >
          {disconnecting ? 'Desconectando...' : 'Desconectar'}
        </button>
      </div>
    )
  }

  // ─── Scanning / Disconnected state ─────────────────────────────
  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60

  return (
    <div className="card p-8 text-center">
      {(status === 'scanning' && qr) ? (
        <>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Escaneá el código QR</h3>
          <p className="text-sm text-slate-500 mb-4">
            Abrí WhatsApp en tu celular → Menú → WhatsApp Web → Escanear código
          </p>

          {/* QR image */}
          <div className="inline-block bg-white p-4 rounded-xl mb-4 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="WhatsApp QR" className="w-64 h-64 mx-auto" />
          </div>

          {/* Countdown bar */}
          <div className="max-w-xs mx-auto mb-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>El QR expira en</span>
              <span className={`font-mono font-bold ${countdown < 30 ? 'text-red-500' : 'text-slate-700'}`}>
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  countdown < 30 ? 'bg-red-500' : 'bg-violet-500'
                }`}
                style={{ width: `${(countdown / QR_EXPIRY_SECONDS) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={connecting}
            className="btn-primary text-sm inline-flex items-center gap-2"
          >
            {connecting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Regenerando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerar QR
              </>
            )}
          </button>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">WhatsApp no conectado</h3>
          <p className="text-sm text-slate-500 mb-6">
            Conectá tu WhatsApp para enviar y recibir mensajes desde NEXUS
          </p>
          <button
            onClick={connect}
            disabled={connecting}
            className="btn-primary text-sm inline-flex items-center gap-2"
          >
            {connecting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Conectando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Conectar WhatsApp
              </>
            )}
          </button>
        </>
      )}
    </div>
  )
}
