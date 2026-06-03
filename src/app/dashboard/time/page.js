'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function TimePage() {
  const [entries, setEntries] = useState([])
  const [projects, setProjects] = useState([])
  const [running, setRunning] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ project_id: '', description: '', duration: '', date: '' })
  const intervalRef = useRef(null)

  useEffect(() => {
    loadData()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  async function loadData() {
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const [eRes, pRes] = await Promise.all([
      supabase.from('time_entries').select('*, projects(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('projects').select('id, name').eq('user_id', user.id),
    ])
    if (eRes.data) setEntries(eRes.data)
    if (pRes.data) setProjects(pRes.data)
    setLoading(false)
  }

  function startTimer(projectId) {
    setRunning(projectId)
    setSeconds(0)
    intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }

  function stopTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const duration = `${hours}h ${minutes}m`

    toast.custom(t => (
      <div className="card p-4 shadow-lg">
        <p className="font-medium mb-3"><svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>Se registraron {duration}</p>
        <div className="flex gap-2">
          <button onClick={async () => {
            let user
            try {
              const { data } = await supabase.auth.getUser()
              user = data?.user
            } catch {
              user = null
            }
            if (!user) return
            await supabase.from('time_entries').insert({
              user_id: user.id, project_id: running,
              duration: seconds, description: 'Time tracking session',
              date: new Date().toISOString().split('T')[0],
            })
            toast.dismiss(t.id)
            toast.success('Tiempo registrado')
            setRunning(null)
            setSeconds(0)
            loadData()
          }} className="btn-primary text-sm py-2">Guardar</button>
          <button onClick={() => { toast.dismiss(t.id); setRunning(null); setSeconds(0) }} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Descartar</button>
        </div>
      </div>
    ), { duration: 10000 })
  }

  const formatTime = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const totalMinutes = entries.reduce((s, e) => s + (e.duration || 0), 0)
  const totalHours = Math.floor(totalMinutes / 3600)
  const totalMin = Math.floor((totalMinutes % 3600) / 60)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Time Tracker</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-slate-500">Total registrado</p>
          <p className="text-2xl font-bold text-slate-900">{totalHours}h {totalMin}m</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Entradas</p>
          <p className="text-2xl font-bold text-slate-900">{entries.length}</p>
        </div>
      </div>

      {/* Timer */}
      <div className="card p-6 mb-6 text-center">
        {running ? (
          <div>
            <p className="text-5xl font-mono font-bold text-violet-600 mb-4">{formatTime(seconds)}</p>
            <p className="text-sm text-slate-500 mb-4">Trackeando: {projects.find(p => p.id === running)?.name || 'Proyecto'}</p>
            <button onClick={stopTimer} className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-lg text-lg transition-all">
              <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
              Detener
            </button>
          </div>
        ) : (
          <div>
            <svg className="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>
            <p className="text-slate-500 mb-4">Seleccioná un proyecto para empezar a trackear</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              <option value="" disabled selected className="hidden">Seleccionar proyecto</option>
              {projects.map(p => (
                <button key={p.id} onClick={() => startTimer(p.id)} className="btn-outline text-sm py-2">
                  <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {p.name}
                </button>
              ))}
              {projects.length === 0 && <p className="text-sm text-slate-400">Creá un proyecto primero</p>}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : entries.length === 0 ? (
        <div className="card p-12 text-center"><svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></svg><p className="text-slate-500">No hay entradas de tiempo</p></div>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="card p-4 flex items-center justify-between card-hover">
              <div>
                <p className="font-medium text-slate-900 text-sm">{entry.description || 'Sesión de trabajo'}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  {entry.projects?.name && <span className="badge-info">{entry.projects.name}</span>}
                  <span><svg className="w-3.5 h-3.5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9h18M21 5v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3v4M17 3v4M3 13h18" /></svg>{formatDate(entry.date || entry.created_at)}</span>
                </div>
              </div>
              <p className="font-mono font-bold text-slate-900">
                {Math.floor(entry.duration / 3600)}h {Math.floor((entry.duration % 3600) / 60)}m
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
