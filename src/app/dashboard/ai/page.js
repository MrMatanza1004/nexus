'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { aiTools, generateWithAI } from '@/lib/ai'
import toast from 'react-hot-toast'

export default function AIPage() {
  const [activeTool, setActiveTool] = useState('email')
  const [formValues, setFormValues] = useState({})
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const tool = aiTools[activeTool]

  function updateField(key, value) {
    setFormValues(prev => ({ ...prev, [key]: value }))
  }

  async function handleGenerate() {
    if (!tool) return

    setLoading(true)
    setResult('')

    try {
      const prompt = tool.buildPrompt(formValues)
      const { result: aiResult } = await generateWithAI(tool.id, prompt)
      setResult(aiResult)
      setHistory(prev => [{ tool: tool.id, name: tool.title, result: aiResult, time: new Date() }, ...prev].slice(0, 20))
    } catch (err) {
      toast.error(err.message || 'Error al generar')
    } finally {
      setLoading(false)
    }
  }

  async function copyResult() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      toast.success('Copiado al portapapeles 📋')
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🤖 NEXUS AI</h1>
          <p className="text-sm text-slate-500 mt-1">8 herramientas potenciadas por inteligencia artificial</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-violet-600 hover:text-violet-700 font-medium"
          >
            {showHistory ? '✕ Cerrar historial' : '📜 Historial'}
          </button>
        )}
      </div>

      {/* Tool Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {Object.values(aiTools).map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTool(t.id); setResult(''); setFormValues({}) }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTool === t.id
                ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="text-lg">{t.icon}</span>
            <span className="hidden sm:inline">{t.title}</span>
          </button>
        ))}
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="card p-4 mb-6 max-h-[300px] overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">📜 Últimas generaciones</h3>
          {history.map((h, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 rounded px-2 -mx-2 transition-colors"
              onClick={() => setResult(h.result)}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{aiTools[h.tool]?.icon || '🤖'}</span>
                <span className="text-sm text-slate-700">{h.name}</span>
              </div>
              <span className="text-xs text-slate-400">{h.time.toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">{tool.icon}</span>
            <div>
              <h2 className="font-semibold text-slate-900">{tool.title}</h2>
              <p className="text-xs text-slate-500">{tool.desc}</p>
            </div>
          </div>

          <div className="space-y-4" onKeyDown={handleKeyDown}>
            {tool.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={formValues[field.key] || field.options[0]}
                    onChange={e => updateField(field.key, e.target.value)}
                    className="input-field"
                  >
                    {field.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={formValues[field.key] || ''}
                    onChange={e => updateField(field.key, e.target.value)}
                    className="input-field"
                    placeholder={field.placeholder}
                    rows={field.rows || 3}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formValues[field.key] || ''}
                    onChange={e => updateField(field.key, e.target.value)}
                    className="input-field"
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generando...
                </>
              ) : (
                <>✨ Generar con IA</>
              )}
            </button>

            <p className="text-xs text-slate-400 text-center">
              {loading ? 'Procesando con GPT-4o-mini...' : 'Enter ↵  ·  Ctrl+Enter ↵  para generar'}
            </p>
          </div>
        </div>

        {/* Result Panel */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Resultado</h2>
            <div className="flex items-center gap-2">
              {result && (
                <>
                  <button
                    onClick={() => {
                      setFormValues(prev => {
                        // Intentar rellenar el campo de contenido con el resultado
                        const contentField = tool.fields.find(f => f.key === 'content')
                        return contentField ? { ...prev, [contentField.key]: result } : prev
                      })
                      setResult('')
                    }}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all font-medium"
                    title="Usar como entrada"
                  >
                    🔄 Usar como input
                  </button>
                  <button
                    onClick={copyResult}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all font-medium"
                  >
                    📋 Copiar
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Result display */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-slate-500 animate-pulse">La IA está pensando...</p>
              <p className="text-xs text-slate-400 mt-1">Procesando con GPT-4o-mini</p>
            </div>
          ) : result ? (
            <div className="flex-1">
              <div className="bg-gradient-to-br from-violet-50 to-white rounded-lg p-4 max-h-[500px] overflow-y-auto border border-violet-100">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">{result}</pre>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400">
                  Generado con {activeTool === 'contract_clause' ? 'GPT-4o-mini ⚖️' : 'GPT-4o-mini ✨'}
                </span>
                <span className="text-xs text-slate-400">
                  {result.split(' ').length} palabras
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
              <span className="text-5xl mb-4">{tool.icon}</span>
              <p className="text-sm font-medium">Completá los campos y generá contenido</p>
              <p className="text-xs mt-1">Con tecnología OpenRouter + GPT-4o-mini</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="card p-4 mt-6 bg-gradient-to-r from-violet-50 to-transparent">
        <div className="flex items-start gap-3">
          <span className="text-lg">💡</span>
          <div>
            <p className="text-sm font-medium text-slate-900">Pro tip</p>
            <p className="text-xs text-slate-600 mt-0.5">
              {activeTool === 'email' && 'Usá "Follow-up" + "Urgente" para recuperar clientes que no respondieron.'}
              {activeTool === 'bio' && 'Una bio corta funciona mejor en LinkedIn. Usá la versión "Casual" para redes sociales.'}
              {activeTool === 'proposal' && 'Combiná "Urgencia" + "Garantía" para maximizar conversión.'}
              {activeTool === 'rewrite' && 'Probá "Acortar" para resumir textos largos en 2-3 párrafos.'}
              {activeTool === 'contract_clause' && 'Generá "Todo el contrato básico" y personalizalo.'}
              {activeTool === 'ideas' && 'Pedí 10 ideas y usá las mejores 3. La IA a veces da sorpresas.'}
              {activeTool === 'tasks' && 'Desglosá proyectos grandes en tareas para no abrumarte.'}
              {activeTool === 'outreach' && 'Los mensajes cálidos tienen 3x más respuesta que los fríos.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
