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
    const { data: { user } } = await supabase.auth.getUser()
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

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('centro-files').upload(fileName, file)
    if (uploadError) {
      toast.error('Error al subir archivo')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('centro-files').getPublicUrl(fileName)
    await supabase.from('files').insert({
      user_id: user.id, name: file.name, url: publicUrl,
      size: file.size, type: file.type,
      project_id: filterProject || null,
      client_id: null,
    })
    toast.success('Archivo subido')
    setUploading(false)
    loadData()
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
    if (!type) return '📄'
    if (type.startsWith('image')) return '🖼️'
    if (type.includes('pdf')) return '📕'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊'
    if (type.includes('zip') || type.includes('rar')) return '📦'
    return '📄'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">📁 Archivos</h1>
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
        <div className="card p-12 text-center"><p className="text-4xl mb-3">📁</p><p className="text-slate-500">No hay archivos todavía</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map(file => (
            <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="card p-4 card-hover block">
              <div className="text-3xl mb-3">{getIcon(file.type)}</div>
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
