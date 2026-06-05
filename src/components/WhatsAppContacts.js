'use client'

import { useState, useEffect, useCallback } from 'react'

export default function WhatsAppContacts() {
  const [contacts, setContacts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(true)

  const loadContacts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/whatsapp/contacts?page=${page}&pageSize=${pageSize}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setContacts(data.data || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Error loading contacts:', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => { loadContacts() }, [loadContacts])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-4">Contactos ({total})</h2>

      {loading ? (
        <div className="card p-8 text-center">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-slate-500">No hay contactos todavía. Los contactos aparecen cuando recibís mensajes.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {contacts.map(contact => (
              <div key={contact.id} className="card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm shrink-0">
                    {(contact.wa_push_name || contact.wa_chat_id).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {contact.wa_push_name || contact.wa_chat_id}
                    </p>
                    <p className="text-xs text-slate-500 font-mono truncate">{contact.wa_chat_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {contact.client && (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {contact.client.name}
                    </span>
                  )}
                  {contact.last_message_at && (
                    <span className="text-xs text-slate-400">
                      {new Date(contact.last_message_at).toLocaleDateString('es-AR')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                Página {page} de {totalPages} ({total} contactos)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
