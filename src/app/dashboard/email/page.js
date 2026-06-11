'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { timeAgo } from '@/lib/utils'
import NangoEmailButton from '@/components/integrations/NangoEmailButton'
import toast from 'react-hot-toast'
import {
  Inbox,
  Send,
  Star,
  FileText,
  Mail,
  Reply,
  Edit,
  ChevronLeft,
  Clock,
  X,
} from 'lucide-react'

const FOLDERS = [
  { id: 'INBOX', label: 'Inbox', icon: Inbox, q: '' },
  { id: 'SENT', label: 'Enviados', icon: Send, q: 'in:sent' },
  { id: 'DRAFTS', label: 'Borradores', icon: FileText, q: 'in:drafts' },
  { id: 'STARRED', label: 'Destacados', icon: Star, q: 'is:starred' },
]

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  'bg-orange-500', 'bg-lime-500',
]

function getAvatarColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitial(str) {
  return (str?.trim().charAt(0) || '?').toUpperCase()
}

function extractName(from) {
  const match = from?.match(/^"?(.+?)"?\s*</)
  return match ? match[1].trim() : from?.split('@')[0] || 'Desconocido'
}

function extractEmail(from) {
  const match = from?.match(/<(.+?)>/)
  return match ? match[1] : from || ''
}

export default function EmailPage() {
  const [connected, setConnected] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loadingThread, setLoadingThread] = useState(false)
  const [emails, setEmails] = useState([])
  const [threadMessages, setThreadMessages] = useState(null)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [currentFolder, setCurrentFolder] = useState('INBOX')
  const [view, setView] = useState('list')
  const [showCompose, setShowCompose] = useState(false)
  const [showCc, setShowCc] = useState(false)
  const [sending, setSending] = useState(false)
  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    body: '',
    cc: '',
    bcc: '',
  })

  const checkConnection = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const connections = user.user_metadata?.nango_connections || {}
        setConnected(!!connections['google-mail'])
      }
    } catch {
      // silently fail
    } finally {
      setInitialLoading(false)
    }
  }, [])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  useEffect(() => {
    if (connected) {
      loadEmails()
    }
  }, [connected, currentFolder])

  async function loadEmails() {
    setLoading(true)
    setView('list')
    setSelectedEmail(null)
    setThreadMessages(null)
    try {
      const folder = FOLDERS.find(f => f.id === currentFolder)
      const q = folder?.q || ''
      const res = await fetch(`/api/email/list?maxResults=20&q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        setEmails([])
      } else {
        setEmails(data.messages || [])
      }
    } catch (err) {
      toast.error('Error al cargar correos: ' + err.message)
      setEmails([])
    } finally {
      setLoading(false)
    }
  }

  async function openEmail(email) {
    setSelectedEmail(email)
    setView('detail')
    setLoadingThread(true)
    setThreadMessages(null)

    if (email.threadId) {
      try {
        const res = await fetch(`/api/email/thread/${email.threadId}`)
        const data = await res.json()
        if (data.error) {
          toast.error(data.error)
        } else if (data.messages) {
          setThreadMessages(data.messages)
        }
      } catch (err) {
        toast.error('Error al cargar el hilo')
      }
    }
    setLoadingThread(false)
  }

  function backToList() {
    setView('list')
    setSelectedEmail(null)
    setThreadMessages(null)
  }

  function openCompose() {
    setComposeForm({ to: '', subject: '', body: '', cc: '', bcc: '' })
    setShowCc(false)
    setShowCompose(true)
  }

  function replyTo(email) {
    const to = extractEmail(email.from)
    const subject = email.subject?.startsWith('Re:')
      ? email.subject
      : `Re: ${email.subject || ''}`
    setComposeForm({ to, subject, body: '', cc: '', bcc: '' })
    setShowCc(false)
    setShowCompose(true)
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!composeForm.to.trim()) return toast.error('El destinatario es obligatorio')
    if (!composeForm.subject.trim()) return toast.error('El asunto es obligatorio')
    if (!composeForm.body.trim()) return toast.error('El cuerpo del mensaje es obligatorio')

    setSending(true)
    const loadingToast = toast.loading('📤 Enviando...')

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composeForm),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(`❌ ${data.error}`, { id: loadingToast })
      } else {
        toast.success('✅ Correo enviado', { id: loadingToast })
        setShowCompose(false)
        if (currentFolder === 'SENT') loadEmails()
      }
    } catch (err) {
      toast.error('Error al enviar: ' + err.message, { id: loadingToast })
    } finally {
      setSending(false)
    }
  }

  function isUnread(email) {
    return email.labelIds?.includes('UNREAD')
  }

  // --- Initial loading state ---
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // --- Not connected state ---
  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card p-10 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Correo Electrónico</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Conectá tu Gmail para usar el correo desde el panel
          </p>
          <NangoEmailButton
            variant="inline"
            onConnect={checkConnection}
          />
        </div>
      </div>
    )
  }

  const currentFolderMeta = FOLDERS.find(f => f.id === currentFolder)

  return (
    <div className="flex flex-col sm:flex-row gap-0 sm:gap-6 h-[calc(100vh-8rem)]">
      {/* === Left folder sidebar === */}
      <div className="sm:w-48 shrink-0">
        <button
          onClick={openCompose}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md mb-4"
        >
          <Edit className="w-4 h-4" />
          Redactar
        </button>

        <nav className="space-y-1">
          {FOLDERS.map(folder => {
            const Icon = folder.icon
            const isActive = currentFolder === folder.id
            return (
              <button
                key={folder.id}
                onClick={() => setCurrentFolder(folder.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {folder.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <NangoEmailButton
            variant="badge"
            onConnect={checkConnection}
          />
        </div>
      </div>

      {/* === Main email area === */}
      <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          {view === 'detail' ? (
            <button
              onClick={backToList}
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {currentFolderMeta && <currentFolderMeta.icon className="w-5 h-5 text-violet-600" />}
              <h2 className="text-lg font-bold text-slate-900">{currentFolderMeta?.label || 'Inbox'}</h2>
              {!loading && emails.length > 0 && (
                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                  {emails.length}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {view === 'list' ? (
          /* === EMAIL LIST === */
          loading ? (
            /* Skeleton loading */
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse flex items-start gap-3 p-3 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : emails.length === 0 ? (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">Bandeja de entrada vacía</h3>
                <p className="text-sm text-slate-400">
                  {currentFolder === 'SENT' ? 'No hay correos enviados aún' : 
                   currentFolder === 'DRAFTS' ? 'No tenés borradores' :
                   currentFolder === 'STARRED' ? 'No hay correos destacados' :
                   'No tenés correos sin leer'}
                </p>
              </div>
            </div>
          ) : (
            /* Email items */
            <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-slate-100">
              {emails.map(email => {
                const name = extractName(email.from)
                const emailAddr = extractEmail(email.from)
                const unread = isUnread(email)
                const displayName = name || emailAddr

                return (
                  <button
                    key={email.id}
                    onClick={() => openEmail(email)}
                    className="w-full text-left px-4 sm:px-6 py-4 hover:bg-slate-50 transition-colors flex items-start gap-3 group"
                  >
                    {/* Unread indicator */}
                    <div className="w-4 shrink-0 pt-1.5">
                      {unread && (
                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(emailAddr || email.from)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {getInitial(name || emailAddr || email.from)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3 mb-0.5">
                        <span className={`text-sm truncate ${unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {displayName}
                        </span>
                        <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                          {email.internalDate ? timeAgo(Number(email.internalDate)) : timeAgo(email.date)}
                        </span>
                      </div>
                      <p className={`text-sm truncate mb-0.5 ${unread ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                        {email.subject || '(Sin asunto)'}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {email.snippet}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        ) : (
          /* === DETAIL VIEW === */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {selectedEmail && (
              <div>
                {/* Email header */}
                <div className="flex items-start gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-full ${getAvatarColor(extractEmail(selectedEmail.from) || selectedEmail.from)} flex items-center justify-center text-white text-lg font-bold shrink-0`}>
                    {getInitial(extractName(selectedEmail.from) || selectedEmail.from)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      {selectedEmail.subject || '(Sin asunto)'}
                    </h3>
                    <div className="flex flex-col gap-0.5 text-sm text-slate-500">
                      <span>
                        <span className="text-slate-400">De: </span>
                        {selectedEmail.from}
                      </span>
                      <span>
                        <span className="text-slate-400">Para: </span>
                        {selectedEmail.to || '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedEmail.date ? new Date(selectedEmail.date).toLocaleString('es') : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thread messages */}
                {loadingThread ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="animate-pulse border border-slate-100 rounded-xl p-4">
                        <div className="h-3 bg-slate-200 rounded w-1/4 mb-3" />
                        <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : threadMessages && threadMessages.length > 0 ? (
                  <div className="space-y-4">
                    {threadMessages.map((msg, idx) => (
                      <div
                        key={msg.id}
                        className={`border rounded-xl p-4 ${
                          idx === 0 && msg.id === selectedEmail?.id
                            ? 'border-violet-200 bg-violet-50/30'
                            : 'border-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-7 h-7 rounded-full ${getAvatarColor(msg.from || '')} flex items-center justify-center text-white text-xs font-bold`}>
                            {getInitial(extractName(msg.from) || msg.from)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {extractName(msg.from) || 'Desconocido'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {msg.date ? new Date(msg.date).toLocaleString('es') : '—'}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {msg.body || msg.snippet || '(Sin contenido)'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* No thread data — show snippet */
                  <div className="border border-slate-100 rounded-xl p-4">
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedEmail.snippet || '(Sin contenido)'}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => replyTo(selectedEmail)}
                    className="flex items-center gap-2 text-sm bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md"
                  >
                    <Reply className="w-4 h-4" />
                    Responder
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* === COMPOSE MODAL === */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCompose(false)}>
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
                <Edit className="w-5 h-5 text-violet-600" />
                Nuevo Mensaje
              </h2>
              <button onClick={() => setShowCompose(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              {/* To */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Para *</label>
                <input
                  type="email"
                  value={composeForm.to}
                  onChange={e => setComposeForm({ ...composeForm, to: e.target.value })}
                  className="input-field"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              {/* CC toggle */}
              <div>
                {!showCc ? (
                  <button
                    type="button"
                    onClick={() => setShowCc(true)}
                    className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                  >
                    + CC / BCC
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">CC</label>
                      <input
                        type="email"
                        value={composeForm.cc}
                        onChange={e => setComposeForm({ ...composeForm, cc: e.target.value })}
                        className="input-field"
                        placeholder="cc@ejemplo.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">BCC</label>
                      <input
                        type="email"
                        value={composeForm.bcc}
                        onChange={e => setComposeForm({ ...composeForm, bcc: e.target.value })}
                        className="input-field"
                        placeholder="bcc@ejemplo.com"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asunto *</label>
                <input
                  type="text"
                  value={composeForm.subject}
                  onChange={e => setComposeForm({ ...composeForm, subject: e.target.value })}
                  className="input-field"
                  placeholder="Asunto del correo"
                  required
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje *</label>
                <textarea
                  value={composeForm.body}
                  onChange={e => setComposeForm({ ...composeForm, body: e.target.value })}
                  className="input-field"
                  rows={8}
                  placeholder="Escribí tu mensaje..."
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="text-sm text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary flex items-center gap-2"
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
                      <Send className="w-4 h-4" />
                      Enviar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
