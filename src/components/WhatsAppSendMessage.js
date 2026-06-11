'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function WhatsAppSendMessage() {
  const [chatId, setChatId] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [contacts, setContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [selectedContact, setSelectedContact] = useState('')

  // ─── Load contacts ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    fetch('/api/whatsapp/contacts?pageSize=50')
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setContacts(data.data || [])
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingContacts(false) })
    return () => { cancelled = true }
  }, [])

  // ─── Select a contact → autofill chatId ────────────────────────
  const handleSelectContact = (e) => {
    const waChatId = e.target.value
    setSelectedContact(waChatId)
    setChatId(waChatId)
  }

  // ─── Send message ──────────────────────────────────────────────
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
        setResult({ status: 'failed' })
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

  const contactName = contacts.find(c => c.wa_chat_id === chatId)?.wa_push_name

  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Enviar Mensaje</h2>
      <form onSubmit={handleSend}>
        {/* Contact selector */}
        <div className="mb-4">
          <label className="block text-xs text-slate-500 font-medium mb-1">Contacto</label>
          <select
            value={selectedContact}
            onChange={handleSelectContact}
            className="input-field text-sm w-full"
            disabled={loadingContacts}
          >
            <option value="">{loadingContacts ? 'Cargando contactos...' : 'Seleccionar contacto...'}</option>
            {contacts.map(c => (
              <option key={c.wa_chat_id} value={c.wa_chat_id}>
                {c.wa_push_name || c.wa_chat_id}
                {c.client?.name ? ` — ${c.client.name}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Manual chat ID (collapsible fallback) */}
        <details className="mb-4 text-xs text-slate-400">
          <summary className="cursor-pointer hover:text-slate-600">O ingresar ID manual</summary>
          <div className="mt-2">
            <input
              type="text"
              value={chatId}
              onChange={e => { setChatId(e.target.value); setSelectedContact('') }}
              placeholder="Ej: 5491123456789@c.us"
              className="input-field text-sm w-full"
            />
            <p className="text-xs text-slate-400 mt-1">El ID del chat de WhatsApp (número con @c.us)</p>
          </div>
        </details>

        {contactName && (
          <p className="text-xs text-violet-600 font-medium mb-3 -mt-2">
            Enviando a: {contactName}
          </p>
        )}

        {/* Message text */}
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

        {/* Send button + result */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={sending || !chatId.trim() || !text.trim()}
            className="btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              result.status === 'sent' ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {result.status === 'sent' ? (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Enviado</>
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
