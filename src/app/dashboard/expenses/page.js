'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  Upload, FileText, Trash2, Edit, Search, Filter,
  Calendar, Image as ImageIcon, ScanLine, Tag, Plus, X,
  AlertCircle, ChevronDown, ChevronUp, ArrowUpDown,
} from 'lucide-react'

const CATEGORIES = [
  { value: 'Alimentación', icon: '🍽️', color: 'bg-orange-100 text-orange-700' },
  { value: 'Transporte', icon: '🚗', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Servicios', icon: '💡', color: 'bg-blue-100 text-blue-700' },
  { value: 'Software', icon: '💻', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'Oficina', icon: '📎', color: 'bg-slate-100 text-slate-700' },
  { value: 'Marketing', icon: '📢', color: 'bg-pink-100 text-pink-700' },
  { value: 'Educación', icon: '📚', color: 'bg-teal-100 text-teal-700' },
  { value: 'Salud', icon: '🏥', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'Viajes', icon: '✈️', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'Otros', icon: '📦', color: 'bg-gray-100 text-gray-700' },
]

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))

export default function ExpensesPage() {
  // ─── State ───────────────────────────────────────────
  const [expenses, setExpenses] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [saving, setSaving] = useState(false)
  const emptyForm = {
    amount: '',
    description: '',
    category: 'Alimentación',
    date: new Date().toISOString().split('T')[0],
    project_id: '',
    receipt_url: '',
  }
  const [form, setForm] = useState({ ...emptyForm })

  // Upload state
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // ─── Effects ─────────────────────────────────────────
  useEffect(() => { loadData() }, [])

  // ─── Data Loading ────────────────────────────────────
  async function loadData() {
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) { setLoading(false); return }

    const [expRes, projRes] = await Promise.all([
      supabase
        .from('expenses')
        .select('*, projects(name)')
        .eq('user_id', user.id)
        .order('date', { ascending: false }),
      supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name'),
    ])

    if (expRes.data) setExpenses(expRes.data)
    if (projRes.data) setProjects(projRes.data)
    setLoading(false)
  }

  // ─── Computed ────────────────────────────────────────
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const totalThisMonth = expenses
    .filter(e => e.date >= firstOfMonth)
    .reduce((s, e) => s + Number(e.amount), 0)

  const highestExpense = expenses.length
    ? expenses.reduce((max, e) => (Number(e.amount) > Number(max.amount) ? e : max), expenses[0])
    : null

  const totalByCategory = {}
  expenses.forEach(e => {
    const cat = e.category || 'Otros'
    totalByCategory[cat] = (totalByCategory[cat] || 0) + Number(e.amount)
  })

  const filtered = expenses.filter(e => {
    if (categoryFilter && e.category !== categoryFilter) return false
    if (dateFrom && e.date < dateFrom) return false
    if (dateTo && e.date > dateTo) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortBy === 'amount') return (Number(a.amount) - Number(b.amount)) * dir
    if (sortBy === 'date') return (new Date(a.date) - new Date(b.date)) * dir
    return 0
  })

  // ─── Upload Handlers ─────────────────────────────────
  function handleFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      return toast.error('Solo se aceptan imágenes')
    }
    if (file.size > 10 * 1024 * 1024) {
      return toast.error('La imagen no puede superar los 10MB')
    }
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setDragOver(false)
  }

  function clearFile() {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function scanReceipt() {
    if (!selectedFile) return toast.error('Seleccioná un comprobante primero')

    setScanning(true)
    try {
      const body = new FormData()
      body.append('receipt', selectedFile)

      const res = await fetch('/api/expenses/scan-receipt', {
        method: 'POST',
        body,
      })

      const data = await res.json()

      if (data.success && data.data) {
        setForm({
          ...emptyForm,
          amount: data.data.amount ? String(data.data.amount) : '',
          date: data.data.date || new Date().toISOString().split('T')[0],
          category: CATEGORIES.some(c => c.value === data.data.category)
            ? data.data.category
            : 'Otros',
          description: data.data.description || '',
          receipt_url: data.image_url || '',
        })
        setShowForm(true)
        toast.success('✅ Datos extraídos del comprobante')
      } else {
        // Fallback: pre-fill with image but let user enter manually
        setForm({
          ...emptyForm,
          receipt_url: data.image_url || '',
        })
        setShowForm(true)
        toast.error(data.error || 'No se pudieron extraer los datos. Completalos manualmente.')
      }
    } catch {
      toast.error('Error al escanear el comprobante')
    } finally {
      setScanning(false)
    }
  }

  // ─── Form Handlers ───────────────────────────────────
  function resetForm() {
    setForm({ ...emptyForm })
    setEditingExpense(null)
    clearFile()
  }

  function openCreateForm() {
    resetForm()
    setShowForm(true)
  }

  function openEditForm(exp) {
    setForm({
      amount: String(exp.amount),
      description: exp.description || '',
      category: CATEGORIES.some(c => c.value === exp.category) ? exp.category : 'Otros',
      date: exp.date || new Date().toISOString().split('T')[0],
      project_id: exp.project_id || '',
      receipt_url: exp.receipt_url || '',
    })
    setEditingExpense(exp)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeForm() {
    setShowForm(false)
    resetForm()
  }

  // ─── CRUD ────────────────────────────────────────────
  async function saveExpense(e) {
    e.preventDefault()
    if (!form.amount || !form.description) {
      return toast.error('El monto y la descripción son obligatorios')
    }

    setSaving(true)
    let user
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    } catch {
      user = null
    }
    if (!user) { setSaving(false); return }

    const expenseData = {
      user_id: user.id,
      amount: Number(form.amount),
      category: form.category,
      description: form.description,
      date: form.date,
      project_id: form.project_id || null,
      receipt_url: form.receipt_url || null,
    }

    if (editingExpense) {
      const { error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', editingExpense.id)

      if (error) { toast.error(error.message); setSaving(false); return }

      const project = projects.find(p => p.id === form.project_id)
      setExpenses(prev =>
        prev.map(e =>
          e.id === editingExpense.id
            ? { ...e, ...expenseData, projects: project ? { name: project.name } : null }
            : e,
        ),
      )
      toast.success('Gasto actualizado')
    } else {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()

      if (error) { toast.error(error.message); setSaving(false); return }

      const project = projects.find(p => p.id === form.project_id)
      const newExpense = {
        ...data[0],
        projects: project ? { name: project.name } : null,
      }
      setExpenses(prev => [newExpense, ...prev])
      toast.success('Gasto registrado')
    }

    setSaving(false)
    closeForm()
  }

  async function deleteExpense(id) {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) return toast.error(error.message)
    setExpenses(prev => prev.filter(e => e.id !== id))
    setDeleteConfirm(null)
    toast.success('Gasto eliminado')
  }

  // ─── Toggle sort ─────────────────────────────────────
  function toggleSort(field) {
    if (sortBy === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortDir('desc')
    }
  }

  // ─── Category Badge ──────────────────────────────────
  function CategoryBadge({ category }) {
    const cat = CATEGORY_MAP[category] || CATEGORY_MAP['Otros']
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>
        <span>{cat.icon}</span>
        {category}
      </span>
    )
  }

  // ─── Render ──────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText size={24} className="text-violet-600" />
          Gastos
        </h1>
        <button onClick={openCreateForm} className="btn-primary text-sm inline-flex items-center gap-2">
          <Plus size={16} />
          Registrar Gasto
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-slate-500 mb-1">Total del mes</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalThisMonth)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500 mb-1">Gasto más alto</p>
          {highestExpense ? (
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(highestExpense.amount)}</p>
              <p className="text-xs text-slate-400 truncate">{highestExpense.description}</p>
            </div>
          ) : (
            <p className="text-lg font-semibold text-slate-400">—</p>
          )}
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500 mb-1">Categorías</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(totalByCategory)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([cat, amount]) => (
                <span
                  key={cat}
                  className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                  title={`${cat}: ${formatCurrency(amount)}`}
                >
                  {cat}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Upload Receipt Section */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <ScanLine size={16} className="text-violet-600" />
          Escanear comprobante
        </h2>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-violet-500 bg-violet-50'
              : previewUrl
                ? 'border-emerald-300 bg-emerald-50/30'
                : 'border-slate-300 hover:border-violet-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />

          {scanning ? (
            /* Scanning state */
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <ScanLine size={24} className="absolute inset-0 m-auto text-violet-600 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-violet-700 animate-pulse">
                Escaneando comprobante...
              </p>
              <p className="text-xs text-slate-400">Esto puede tomar unos segundos</p>
            </div>
          ) : previewUrl ? (
            /* Preview state */
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-full max-w-xs mx-auto">
                <img
                  src={previewUrl}
                  alt="Comprobante"
                  className="w-full h-40 object-contain rounded-lg bg-white"
                />
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); clearFile() }}
                  className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md border border-slate-200 text-slate-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs text-slate-500">{selectedFile?.name}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); clearFile() }}
                  className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cambiar archivo
                </button>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); scanReceipt() }}
                  className="btn-primary text-sm inline-flex items-center gap-2 !px-4 !py-2"
                >
                  <ScanLine size={16} />
                  Escanear comprobante
                </button>
              </div>
            </div>
          ) : (
            /* Empty upload zone */
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
                <Upload size={24} className="text-violet-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">
                Arrastrá tu comprobante acá
              </p>
              <p className="text-xs text-slate-400">
                o hacé clic para seleccionar un archivo
              </p>
              <p className="text-xs text-slate-300">JPG, PNG, WEBP — Máx 10MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-6 mb-6 border-violet-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Tag size={18} className="text-violet-600" />
              {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {form.receipt_url && form.receipt_url.startsWith('data:') && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <img
                src={form.receipt_url}
                alt="Comprobante escaneado"
                className="max-h-32 object-contain mx-auto rounded"
              />
            </div>
          )}

          <form onSubmit={saveExpense} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Monto <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="input-field"
                  placeholder="Ej: 1500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="input-field"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.icon} {c.value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="input-field"
                placeholder="Ej: Hosting mensual, pasaje de avión..."
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Proyecto <span className="text-slate-300">(opcional)</span>
                </label>
                <select
                  value={form.project_id}
                  onChange={e => setForm({ ...form, project_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Sin proyecto</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary text-sm inline-flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>{editingExpense ? 'Actualizar' : 'Registrar'} Gasto</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-slate-400" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="input-field !w-auto !py-2 !px-3 text-sm"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.icon} {c.value}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-slate-400" />
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="input-field !w-auto !py-2 !px-3 text-sm"
            placeholder="Desde"
          />
          <span className="text-slate-300 text-sm">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="input-field !w-auto !py-2 !px-3 text-sm"
            placeholder="Hasta"
          />
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => toggleSort('date')}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              sortBy === 'date'
                ? 'bg-violet-100 text-violet-700'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ArrowUpDown size={12} />
            Fecha
            {sortBy === 'date' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
          </button>
          <button
            onClick={() => toggleSort('amount')}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              sortBy === 'amount'
                ? 'bg-violet-100 text-violet-700'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ArrowUpDown size={12} />
            Monto
            {sortBy === 'amount' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
          </button>
        </div>
      </div>

      {/* Category summary */}
      {Object.keys(totalByCategory).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(totalByCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amount]) => {
              const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
              const pct = total > 0 ? (amount / total) * 100 : 0
              const catInfo = CATEGORY_MAP[cat] || CATEGORY_MAP['Otros']
              return (
                <div
                  key={cat}
                  className="card px-3 py-2 text-xs flex items-center gap-2"
                >
                  <span>{catInfo.icon}</span>
                  <span className="font-medium text-slate-700">{cat}</span>
                  <span className="text-slate-900 font-semibold">{formatCurrency(amount)}</span>
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-slate-400">{Math.round(pct)}%</span>
                </div>
              )
            })}
        </div>
      )}

      {/* Expense List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
                <div className="h-5 bg-slate-200 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-slate-300" />
          </div>
          <p className="text-lg font-medium text-slate-700 mb-1">
            {expenses.length === 0
              ? 'No hay gastos registrados'
              : 'No hay gastos con esos filtros'}
          </p>
          <p className="text-sm text-slate-400 mb-6">
            {expenses.length === 0
              ? 'Subí un comprobante o registrá tu primer gasto'
              : 'Probá cambiando los filtros'}
          </p>
          {expenses.length === 0 && (
            <button onClick={openCreateForm} className="btn-primary text-sm inline-flex items-center gap-2">
              <Plus size={16} />
              Registrar primer gasto
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(exp => {
            const catInfo = CATEGORY_MAP[exp.category] || CATEGORY_MAP['Otros']
            return (
              <div key={exp.id} className="card p-4 card-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-lg ${catInfo.color} flex items-center justify-center text-lg shrink-0`}>
                      {catInfo.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">
                        {exp.description || 'Gasto'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                        <CategoryBadge category={exp.category} />
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(exp.date || exp.created_at)}
                        </span>
                        {exp.projects?.name && (
                          <span className="text-slate-400">📁 {exp.projects.name}</span>
                        )}
                        {exp.receipt_url && (
                          <span className="inline-flex items-center gap-1 text-violet-500">
                            <ImageIcon size={11} />
                            Comprobante
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-lg font-bold text-red-600">
                      {formatCurrency(exp.amount)}
                    </span>
                    <button
                      onClick={() => openEditForm(exp)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors ml-2"
                      title="Editar"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(exp)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-300 hover:text-red-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Eliminar gasto
            </h3>
            <p className="text-sm text-slate-500 text-center mb-5">
              ¿Estás seguro de eliminar <strong className="text-slate-700">{deleteConfirm.description || 'este gasto'}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => deleteExpense(deleteConfirm.id)}
                className="px-4 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
