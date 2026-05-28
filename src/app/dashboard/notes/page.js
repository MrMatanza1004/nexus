'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'
import TipTapEditor from '@/components/TipTapEditor'

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [form, setForm] = useState({ title: '', content: '', tags: '' })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => { loadNotes() }, [])

  async function loadNotes() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('notes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
    if (data) setNotes(data)
    setLoading(false)
  }

  async function saveNote(e) {
    e.preventDefault()
    if (!form.content || form.content === '<p></p>') return toast.error('La nota no puede estar vacía')
    const { data: { user } } = await supabase.auth.getUser()

    if (editing) {
      await supabase.from('notes').update({ ...form, tags: form.tags }).eq('id', editing)
      setNotes(notes.map(n => n.id === editing ? { ...n, ...form } : n))
      toast.success('Nota actualizada')
    } else {
      const { data } = await supabase.from('notes').insert({ ...form, user_id: user.id }).select()
      setNotes([data[0], ...notes])
      toast.success('Nota guardada')
    }
    setForm({ title: '', content: '', tags: '' })
    setEditing(null)
  }

  function editNote(note) {
    setForm({ title: note.title || '', content: note.content, tags: note.tags || '' })
    setEditing(note.id)
  }

  async function deleteNote(id) {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(notes.filter(n => n.id !== id))
    toast.success('Nota eliminada')
  }

  function renderContent(content) {
    if (!content) return ''
    if (content.includes('<')) return content
    return content.replace(/\n/g, '<br>')
  }

  const filtered = notes.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase()) ||
    n.tags?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">📝 Notas</h1>
        {editing && <button onClick={() => { setEditing(null); setForm({ title: '', content: '', tags: '' }) }} className="text-sm text-slate-500 hover:text-slate-700">Cancelar edición</button>}
      </div>

      <form onSubmit={saveNote} className="card p-6 mb-6 space-y-4">
        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Título de la nota (opcional)" />
        <TipTapEditor
          content={form.content}
          onChange={(html) => setForm({ ...form, content: html })}
          placeholder="Escribí tu nota aquí..."
          minHeight={120}
        />
        <div className="flex items-center gap-3">
          <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="input-field flex-1" placeholder="Tags separados por coma (ej: idea, cliente, proyecto)" />
          <button type="submit" className="btn-primary shrink-0">{editing ? 'Actualizar' : 'Guardar Nota'}</button>
        </div>
      </form>

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="input-field mb-4" placeholder="🔍 Buscar en notas..." />

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-4xl mb-3">📝</p><p className="text-slate-500">No hay notas todavía</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(note => (
            <div key={note.id} className="card p-5 card-hover group relative">
              {note.title && <h3 className="font-semibold text-slate-900 mb-2">{note.title}</h3>}
              <div className="text-sm text-slate-600 line-clamp-4 [&_p]:m-0 [&_h1]:text-lg [&_h2]:text-base" dangerouslySetInnerHTML={{ __html: renderContent(note.content) }} />
              {note.tags && <div className="flex flex-wrap gap-1 mt-3">
                {note.tags.split(',').map((tag, i) => (
                  <span key={i} className="badge-info text-xs">{tag.trim()}</span>
                ))}
              </div>}
              <p className="text-xs text-slate-400 mt-3">{timeAgo(note.updated_at)}</p>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => editNote(note)} className="p-1.5 text-slate-400 hover:text-violet-600 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                <button onClick={() => deleteNote(note.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
