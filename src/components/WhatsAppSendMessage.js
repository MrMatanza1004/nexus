'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function WhatsAppSendMessage() {
  const [chatId, setChatId] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSend(e) {
    e.preventDefault()
    if (!chatId.trim() || !text.trim()) {
      toast.error('Completá todos los campos')
      return
    }

    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: chatId.trim(), text: text.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Error al enviar')
        if (data.error === 'WhatsApp not connected') {
          setResult({ status: 'disconnected' })
        } else {
          setResult({ status: 'failed' })
        }
        return
      }
      setResult({ status: 'sent', ...data })
      toast.success('Mensaje enviado')
      setText('')
    } catch (err) {
      toast.error('Error: ' + err.message)
      setResult({ status: 'failed' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Enviar Mensaje</h2>
      <form onSubmit={handleSend}>
        <div className="mb-4">
          <label className="block text-xs text-slate-500 font-medium mb-1">Contacto (chat ID)</label>
          <input
            type="text"
            value={chatId}
            onChange={e => setChatId(e.target.value)}
            placeholder="Ej: 5491123456789@c.us"
            className="input-field text-sm w-full"
          />
          <p className="text-xs text-slate-400 mt-1">El ID del chat de WhatsApp (número con @c.us)</p>
        </div>
        <div className="mb-4">
          <label className="block text-xs text-slate-500 font-medium mb-1">Mensaje</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Escribí tu mensaje..."
            rows={3}
            className="input-field text-sm w-full resize-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={sending}
            className="btn-primary text-sm inline-flex items-center gap-2"
          >
            {sending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Enviar
              </>
            )}
          </button>
          {result && (
            <span className={`text-sm flex items-center gap-1 ${
              result.status === 'sent' ? 'text-emerald-600' : 
              result.status === 'disconnected' ? 'text-amber-600' : 'text-red-500'
            }`}>
              {result.status === 'sent' ? (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Enviado</>
              ) : result.status === 'disconnected' ? (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>Desconectado</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Error</>
              )}
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
