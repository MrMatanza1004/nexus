'use client'

import { useState } from 'react'
import Link from 'next/link'
import GoogleDriveButton from '@/components/integrations/NangoDriveButton'
import Logo from '@/components/Logo'

export default function FreeContractPage() {
  const [form, setForm] = useState({ clientName: '', projectName: '', amount: '', scope: '', timeline: '', payment: '50% inicio / 50% entrega' })
  const [contract, setContract] = useState('')
  const [loading, setLoading] = useState(false)

  async function generate() {
    if (!form.clientName && !form.projectName) return
    setLoading(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'contract',
          prompt: `Cliente: ${form.clientName || '[Cliente]'}\nServicio: ${form.projectName || '[Servicio]'}\nMonto: $${form.amount || '[Monto]'}\nPlazo: ${form.timeline || 'A convenir'}\nPago: ${form.payment}\nAlcance: ${form.scope || 'Servicios profesionales según lo acordado'}`,
        }),
      })
      const data = await res.json()
      setContract(data.result || '')
    } catch (err) {
      setContract('Error al generar. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function copyContract() {
    navigator.clipboard.writeText(contract)
  }

  function printContract() {
    const w = window.open('', '_blank')
    w.document.write(`<html><head><title>Contrato</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.8;white-space:pre-wrap}</style></head><body>${contract.replace(/\n/g,'<br>')}<script>setTimeout(()=>window.print(),500)</script></body></html>`)
    w.document.close()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <Link href="/register" className="text-sm text-violet-600 font-semibold hover:text-violet-700">Crear cuenta gratis →</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Generador de Contratos con IA</h1>
          <p className="text-lg text-slate-600">Contrato profesional generado por inteligencia artificial en segundos.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Datos del contrato</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del cliente</label>
              <input type="text" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className="input-field" placeholder="Ej: María López" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto / Servicio</label>
              <input type="text" value={form.projectName} onChange={e => setForm({ ...form, projectName: e.target.value })} className="input-field" placeholder="Ej: Rediseño de sitio web" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input-field" placeholder="Ej: 5000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Plazo de entrega</label>
              <input type="text" value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })} className="input-field" placeholder="Ej: 4 semanas" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Forma de pago</label>
              <select value={form.payment} onChange={e => setForm({ ...form, payment: e.target.value })} className="input-field">
                <option>50% inicio / 50% entrega</option>
                <option>100% al inicio</option>
                <option>33% / 33% / 33%</option>
                <option>Mensual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alcance (opcional)</label>
              <textarea value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} className="input-field" rows={3} placeholder="Describí brevemente el alcance..." />
            </div>
            <button onClick={generate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (<><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generando...</>) : '✨ Generar Contrato con IA'}
            </button>
          </div>

          <div>
            {loading ? (
              <div className="card p-12 text-center">
                <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 animate-pulse">IA redactando tu contrato...</p>
              </div>
            ) : contract ? (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">Contrato generado ✅</h2>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={copyContract} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium">📋 Copiar</button>
                    <button onClick={printContract} className="text-xs bg-violet-100 hover:bg-violet-200 text-violet-700 px-3 py-1.5 rounded-lg font-medium">🖨️ PDF</button>
                    <GoogleDriveButton
                      content={contract}
                      filename={`Contrato-${form.projectName || 'NEXUS'}.txt`}
                    />
                  </div>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans bg-slate-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">{contract}</pre>
                <div className="mt-4 p-4 bg-violet-50 rounded-lg text-sm text-violet-700">
                  <p className="font-semibold mb-1">💡 Versión gratuita</p>
                  <p className="mb-3">Con NEXUS Pro: firma digital, contratos ilimitados, portal del cliente y más.</p>
                  <Link href="/register" className="text-violet-600 font-bold hover:text-violet-700">Crear cuenta gratis →</Link>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-5xl mb-4">⚖️</p>
                <p className="text-slate-500">Completá los datos y generá tu contrato con IA</p>
                <p className="text-xs text-slate-400 mt-2">Powered by OpenAI gpt-oss-120b</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
