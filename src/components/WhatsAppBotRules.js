'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

const TRIGGER_TYPES = [
  { value: 'keyword', label: 'Palabra clave' },
  { value: 'regex', label: 'Expresión regular' },
  { value: 'any_message', label: 'Cualquier mensaje' },
  { value: 'hours_inactive', label: 'Horas inactivo' },
]

const emptyRule = {
  name: '',
  trigger_type: 'keyword',
  trigger_value: '',
  response_value: '',
  priority: 0,
  cooldown_minutes: 0,
  is_active: true,
}

export default function WhatsAppBotRules() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ ...emptyRule })
  const [saving, setSaving] = useState(false)

  const loadRules = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/bot-rules')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setRules(data.data || [])
    } catch (err) {
      toast.error('Error al cargar reglas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRules() }, [loadRules])

  function startNew() {
    setEditForm({ ...emptyRule })
    setEditingId('new')
  }

  function startEdit(rule) {
    setEditForm({
      name: rule.name || '',
      trigger_type: rule.trigger_type,
      trigger_value: rule.trigger_value || '',
      response_value: rule.response_value || '',
      priority: rule.priority ?? 0,
      cooldown_minutes: rule.cooldown_minutes ?? 0,
      is_active: rule.is_active !== false,
    })
    setEditingId(rule.id)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ ...emptyRule })
  }

  async function handleSave() {
    if (!editForm.response_value.trim()) {
      toast.error('La respuesta es obligatoria')
      return
    }
    if (['keyword', 'regex'].includes(editForm.trigger_type) && !editForm.trigger_value.trim()) {
      toast.error('El valor del disparador es obligatorio para este tipo')
      return
    }

    setSaving(true)
    try {
      if (editingId === 'new') {
        const res = await fetch('/api/whatsapp/bot-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editForm.name || null,
            trigger_type: editForm.trigger_type,
            trigger_value: editForm.trigger_value || null,
            response_value: editForm.response_value,
            priority: parseInt(editForm.priority, 10) || 0,
            cooldown_minutes: parseInt(editForm.cooldown_minutes, 10) || 0,
          }),
        })
        if (!res.ok) {
          const errData = await res.json()
          toast.error(errData.error || 'Error al crear')
          return
        }
        const result = await res.json()
        toast.success('Regla creada')
        setRules(prev => [...prev, result.data].sort((a, b) => a.priority - b.priority))
      } else {
        const res = await fetch('/api/whatsapp/bot-rules', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            name: editForm.name || null,
            trigger_type: editForm.trigger_type,
            trigger_value: editForm.trigger_value || null,
            response_value: editForm.response_value,
            priority: parseInt(editForm.priority, 10) || 0,
            cooldown_minutes: parseInt(editForm.cooldown_minutes, 10) || 0,
          }),
        })
        if (!res.ok) {
          const errData = await res.json()
          toast.error(errData.error || 'Error al actualizar')
          return
        }
        const result = await res.json()
        setRules(prev => prev.map(r => r.id === editingId ? result.data : r))
        toast.success('Regla actualizada')
      }
      cancelEdit()
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta regla?')) return
    try {
      const res = await fetch(`/api/whatsapp/bot-rules?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Error al eliminar')
        return
      }
      setRules(prev => prev.filter(r => r.id !== id))
      toast.success('Regla eliminada')
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  async function toggleActive(rule) {
    const updated = { ...rule, is_active: !rule.is_active }
    setRules(prev => prev.map(r => r.id === rule.id ? updated : r))
    try {
      const res = await fetch('/api/whatsapp/bot-rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rule.id, is_active: !rule.is_active }),
      })
      if (!res.ok) {
        setRules(prev => prev.map(r => r.id === rule.id ? rule : r))
        throw new Error('Failed')
      }
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">Reglas del Bot</h2>
        <button onClick={startNew} className="btn-primary text-sm">
          + Nueva Regla
        </button>
      </div>

      {editingId === 'new' && (
        <div className="card p-4 mb-4 border-2 border-violet-200 bg-violet-50">
          <h3 className="font-semibold text-slate-900 mb-3">Nueva Regla</h3>
          <RuleFormFields form={editForm} onChange={setEditForm} />
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={cancelEdit} className="text-sm text-slate-600 hover:text-slate-800 px-3 py-2">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {rules.length === 0 && editingId !== 'new' ? (
        <div className="card p-8 text-center">
          <p className="text-slate-500">No tenés reglas configuradas. Creá tu primera regla para automatizar respuestas.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map(rule => (
            <div key={rule.id} className={`card p-4 ${editingId === rule.id ? 'border-2 border-violet-200 bg-violet-50' : ''}`}>
              {editingId === rule.id ? (
                <>
                  <RuleFormFields form={editForm} onChange={setEditForm} />
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button onClick={cancelEdit} className="text-sm text-slate-600 hover:text-slate-800 px-3 py-2">
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {rule.name && <span className="font-medium text-slate-900 text-sm">{rule.name}</span>}
                      <span className="badge-info text-xs">{TRIGGER_TYPES.find(t => t.value === rule.trigger_type)?.label || rule.trigger_type}</span>
                      <span className="text-xs text-slate-400">Prio: {rule.priority}</span>
                      {rule.cooldown_minutes > 0 && (
                        <span className="text-xs text-slate-400">Cooldown: {rule.cooldown_minutes} min</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">
                      {rule.trigger_value && (
                        <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded mr-2">{rule.trigger_value}</span>
                      )}
                      → {rule.response_value}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.is_active}
                        onChange={() => toggleActive(rule)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-violet-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                    <button onClick={() => startEdit(rule)} className="text-slate-400 hover:text-violet-600 p-1" title="Editar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(rule.id)} className="text-slate-400 hover:text-red-500 p-1" title="Eliminar">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RuleFormFields({ form, onChange }) {
  function set(field, value) {
    onChange(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div>
        <label className="block text-xs text-slate-500 font-medium mb-1">Nombre</label>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Opcional"
          className="input-field text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 font-medium mb-1">Tipo de disparador</label>
        <select
          value={form.trigger_type}
          onChange={e => set('trigger_type', e.target.value)}
          className="input-field text-sm"
        >
          {TRIGGER_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      {form.trigger_type !== 'any_message' && (
        <div>
          <label className="block text-xs text-slate-500 font-medium mb-1">Valor del disparador</label>
          <input
            type="text"
            value={form.trigger_value}
            onChange={e => set('trigger_value', e.target.value)}
            placeholder={form.trigger_type === 'hours_inactive' ? 'Cantidad de horas' : 'Palabra o patrón'}
            className="input-field text-sm"
          />
        </div>
      )}
      <div className="sm:col-span-2 lg:col-span-1">
        <label className="block text-xs text-slate-500 font-medium mb-1">Respuesta</label>
        <input
          type="text"
          value={form.response_value}
          onChange={e => set('response_value', e.target.value)}
          placeholder="Mensaje de respuesta"
          className="input-field text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 font-medium mb-1">Prioridad</label>
        <input
          type="number"
          value={form.priority}
          onChange={e => set('priority', e.target.value)}
          className="input-field text-sm"
          min="0"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 font-medium mb-1">Cooldown (min)</label>
        <input
          type="number"
          value={form.cooldown_minutes}
          onChange={e => set('cooldown_minutes', e.target.value)}
          className="input-field text-sm"
          min="0"
        />
      </div>
    </div>
  )
}
