'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, timeAgo } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function FilesPage() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [filterProject, setFilterProject] = useState('')
  const [filterType, setFilterType] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) return
    const [fRes, pRes, cRes] = await Promise.all([
      supabase.from('files').select('*, projects(name), clients(name)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('projects').select('id, name').eq('user_id', user.id),
      supabase.from('clients').select('id, name').eq('user_id', user.id),
    ])
    if (fRes.data) setFiles(fRes.data)
    if (pRes.data) setProjects(pRes.data)
    if (cRes.data) setClients(cRes.data)
    setLoading(false)
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande (máx 50MB)')
      return
    }

    setUploading(true)
    const loadingToast = toast.loading('Subiendo archivo...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('project_id', filterProject || '')

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.error) {
        toast.error(data.error, { id: loadingToast, duration: 6000 })
        setUploading(false)
        return
      }

      toast.success('Archivo subido', { id: loadingToast })
      setUploading(false)
      loadData()
    } catch (err) {
      toast.error(`Error de red: ${err.message}`, { id: loadingToast, duration: 6000 })
      setUploading(false)
    }
  }

  const filtered = files.filter(f => {
    if (filterProject && f.project_id !== filterProject) return false
    if (filterType) {
      const typeMap = { image: ['image/'], doc: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument'], code: ['text/'] }
      return typeMap[filterType]?.some(t => f.type?.startsWith(t))
    }
    return true
  })

  const getIcon = (type) => {
    if (!type) return (
      <svg className="w-8 h-8 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" />
      </svg>
    )
    if (type.startsWith('image')) return (
      <svg className="w-8 h-8 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.5-4.5 3 3L15 10l5 5 M3 3h18v18H3z" />
      </svg>
    )
    if (type.includes('pdf')) return (
      <svg className="w-8 h-8 inline-block text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />
      </svg>
    )
    if (type.includes('word') || type.includes('document')) return (
      <svg className="w-8 h-8 inline-block text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M10 9l-2 6 2 2" />
      </svg>
    )
    if (type.includes('spreadsheet') || type.includes('excel')) return (
      <svg className="w-8 h-8 inline-block text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M9 11l3 3-3 3 M15 11l-3 3 3 3" />
      </svg>
    )
    if (type.includes('zip') || type.includes('rar')) return (
      <svg className="w-8 h-8 inline-block text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    )
    return (
      <svg className="w-8 h-8 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" />
      </svg>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Archivos</h1>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-primary text-sm">
            {uploading ? 'Subiendo...' : '+ Subir Archivo'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="input-field w-auto">
          <option value="">Todos los proyectos</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field w-auto">
          <option value="">Todos los tipos</option>
          <option value="image">Imágenes</option>
          <option value="doc">Documentos</option>
          <option value="code">Código</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-10 h-10 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /></svg>
          <p className="text-slate-500">No hay archivos todavía</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map(file => (
            <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="card p-4 card-hover block">
              <div className="mb-3">{getIcon(file.type)}</div>
              <p className="font-medium text-slate-900 text-sm truncate mb-1">{file.name}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {file.size && <span>{(file.size / 1024 / 1024).toFixed(1)}MB</span>}
                {file.type && <span className="badge-info text-xs">{file.type.split('/')[0]}</span>}
              </div>
              <p className="text-xs text-slate-400 mt-2">{timeAgo(file.created_at)}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
