'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import TipTapEditor from '@/components/TipTapEditor'

export default function JournalPage() {
  const [entries, setEntries] = useState([])
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('neutral')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadEntries() }, [])

  async function loadEntries() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) setEntries(data)
    setLoading(false)
  }

  async function saveEntry(e) {
    e.preventDefault()
    if (!content || content === '<p></p>') return toast.error('Escribí algo en tu diario')
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('journal_entries').insert({
      user_id: user.id,
      content,
      mood,
      date: new Date().toISOString().split('T')[0],
    }).select()
    if (error) return toast.error(error.message)
    setEntries([data[0], ...entries])
    setContent('')
    toast.success('Entrada guardada 🌟')
  }

  const moods = [
    { value: 'great', label: '🔥 Increíble', emoji: '🔥' },
    { value: 'good', label: '😊 Bien', emoji: '😊' },
    { value: 'neutral', label: '😐 Normal', emoji: '😐' },
    { value: 'bad', label: '😞 Mal', emoji: '😞' },
    { value: 'terrible', label: '💀 Pésimo', emoji: '💀' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">📓 Diario Personal</h1>

      {/* Prompts */}
      <div className="card p-6 mb-6">
        <p className="text-sm text-slate-500 mb-4">¿Cómo estuvo tu día?</p>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {moods.map(m => (
            <button key={m.value} onClick={() => setMood(m.value)} className={`p-3 rounded-lg text-center transition-all ${mood === m.value ? 'bg-violet-100 border-2 border-violet-500' : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'}`}>
              <span className="text-2xl block mb-1">{m.emoji}</span>
              <span className="text-xs text-slate-600">{m.label.split(' ')[1]}</span>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <TipTapEditor
            content={content}
            onChange={(html) => setContent(html)}
            placeholder="¿Qué lograste hoy? ¿Qué aprendiste? ¿Qué harías diferente?"
            minHeight={150}
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={saveEntry} className="btn-primary">Guardar Entrada</button>
          <p className="text-xs text-slate-400">Escribir ayuda a despejar la mente y mantener el foco</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : entries.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-4xl mb-3">📓</p><p className="text-slate-500">No hay entradas todavía. Contá cómo fue tu día.</p></div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{moods.find(m => m.value === entry.mood)?.emoji || '😐'}</span>
                <span className="text-sm text-slate-400">{formatDate(entry.created_at)}</span>
              </div>
              <div className="text-slate-700 [&_p]:m-0 [&_h1]:text-lg [&_h2]:text-base" dangerouslySetInnerHTML={{ __html: entry.content }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
