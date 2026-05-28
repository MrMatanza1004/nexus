'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function FreeContractPage() {
  const [form, setForm] = useState({ clientName: '', projectName: '', amount: '', scope: '' })
  const [contract, setContract] = useState('')

  function generate() {
    const date = new Date().toLocaleDateString()
    const text = `CONTRATO DE SERVICIOS PROFESIONALES

Fecha: ${date}

ENTRE:
[Tu Nombre] (en adelante, "EL PROFESIONAL")

Y:
${form.clientName || '[Nombre del Cliente]'} (en adelante, "EL CLIENTE")

OBJETO:
${form.projectName || '[Descripción del proyecto]'}

ALCANCE:
${form.scope || 'Servicios profesionales de [rubro] según se detalla en el alcance del proyecto.'}

HONORARIOS:
${form.amount ? `El CLIENTE pagará a EL PROFESIONAL la suma de $${Number(form.amount).toLocaleString()} por los servicios descritos.` : 'Los honorarios se acordarán mutuamente entre las partes.'}

FORMA DE PAGO:
50% al inicio del proyecto, 50% contra entrega final.

PLAZO:
El proyecto comenzará en [fecha de inicio] y finalizará en [fecha de finalización].

CONFIDENCIALIDAD:
EL PROFESIONAL se compromete a mantener la confidencialidad de toda la información del CLIENTE.

PROPIEDAD INTELECTUAL:
Una vez pagados la totalidad de los honorarios, los derechos de propiedad intelectual serán transferidos al CLIENTE.

JURISDICCIÓN:
Las partes se someten a la jurisdicción de los tribunales de [Ciudad].

FIRMA DEL PROFESIONAL: __________________
FIRMA DEL CLIENTE: __________________

---
Generado con NEXUS - El Sistema Operativo Freelance`
    setContract(text)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-lg text-slate-900">NEXUS</span>
          </Link>
          <Link href="/register" className="text-sm text-violet-600 font-semibold hover:text-violet-700">
            Crear cuenta gratis →
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Generador de Contratos Gratis
          </h1>
          <p className="text-lg text-slate-600">
            Generá un contrato profesional en segundos. La versión completa incluye firma digital, múltiples plantillas y más.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Datos del contrato</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del cliente</label>
              <input type="text" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className="input-field" placeholder="Ej: María López" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto</label>
              <input type="text" value={form.projectName} onChange={e => setForm({ ...form, projectName: e.target.value })} className="input-field" placeholder="Ej: Rediseño de sitio web" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input-field" placeholder="Ej: 5000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alcance del proyecto</label>
              <textarea value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} className="input-field" rows={3} placeholder="Describí brevemente el alcance..." />
            </div>
            <button onClick={generate} className="btn-primary w-full">Generar Contrato 📝</button>
          </div>

          <div>
            {contract ? (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">Contrato generado</h2>
                  <button onClick={() => { navigator.clipboard.writeText(contract) }}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all font-medium">
                    📋 Copiar
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans bg-slate-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">{contract}</pre>
                <div className="mt-4 p-4 bg-violet-50 rounded-lg text-sm text-violet-700">
                  <p className="font-semibold mb-1">💡 Versión gratuita</p>
                  <p className="mb-3">La versión completa de NEXUS incluye firma digital, plantillas legales, contratos ilimitados y tracking de estado.</p>
                  <Link href="/register" className="text-violet-600 font-bold hover:text-violet-700">
                    Crear cuenta gratis →</Link>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-5xl mb-4">⚖️</p>
                <p className="text-slate-500">Completá los datos y generá tu contrato gratis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
