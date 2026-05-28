'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RateCalculatorPage() {
  const [form, setForm] = useState({
    targetSalary: 50000,
    expenses: 10000,
    profitMargin: 20,
    vacationWeeks: 4,
    billablePercent: 70,
  })
  const [result, setResult] = useState(null)

  function calculate() {
    const totalTarget = Number(form.targetSalary) + Number(form.expenses)
    const withProfit = totalTarget * (1 + Number(form.profitMargin) / 100)
    const workingWeeks = 52 - Number(form.vacationWeeks)
    const billableWeeks = workingWeeks * (Number(form.billablePercent) / 100)
    const billableDays = billableWeeks * 5
    const billableHours = billableDays * 8

    setResult({
      yearly: Math.round(withProfit),
      monthly: Math.round(withProfit / 12),
      weekly: Math.round(withProfit / workingWeeks),
      daily: Math.round(withProfit / billableDays),
      hourly: Math.round(withProfit / billableHours),
      billableDays: Math.round(billableDays),
      billableHours: Math.round(billableHours),
    })
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
            Calculadora de Tarifas Freelance
          </h1>
          <p className="text-lg text-slate-600">
            Descubrí cuánto cobrar por hora, día, proyecto o mes — según tus objetivos reales.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-slate-900">Tus números</h2>
            {[
              { key: 'targetSalary', label: 'Sueldo objetivo anual ($)', type: 'number', min: 0, step: 1000, prefix: true },
              { key: 'expenses', label: 'Gastos anuales ($)', type: 'number', min: 0, step: 500 },
              { key: 'profitMargin', label: 'Margen de ganancia (%)', type: 'number', min: 0, max: 100 },
              { key: 'vacationWeeks', label: 'Semanas de vacaciones', type: 'number', min: 0, max: 12 },
              { key: 'billablePercent', label: '% de tiempo facturable', type: 'number', min: 10, max: 100 },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
                <input type={field.type} value={form[field.key]} min={field.min} max={field.max} step={field.step || 1}
                  onChange={e => setForm({ ...form, [field.key]: Number(e.target.value) })}
                  className="input-field" />
              </div>
            ))}
            <button onClick={calculate} className="btn-primary w-full">Calcular mi tarifa 🚀</button>
          </div>

          <div>
            {result ? (
              <div className="card p-6 space-y-4">
                <h2 className="font-semibold text-slate-900">Tus tarifas recomendadas</h2>
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold text-violet-600">
                    ${result.hourly.toLocaleString()}
                  </p>
                  <p className="text-slate-500">por hora</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Por hora', value: result.hourly },
                    { label: 'Por día (8h)', value: result.daily },
                    { label: 'Por semana', value: result.weekly },
                    { label: 'Por mes', value: result.monthly },
                    { label: 'Por año', value: result.yearly },
                  ].map(r => (
                    <div key={r.label} className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500">{r.label}</p>
                      <p className="text-lg font-bold text-slate-900">${r.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-violet-50 rounded-lg p-3 text-sm text-violet-700 text-center">
                  📊 {result.billableDays} días facturables/año · {result.billableHours} horas facturables/año
                </div>
                <p className="text-xs text-slate-400 text-center mt-2">
                  Tip: en NEXUS podés trackear tus horas y facturar automáticamente con estas tarifas.
                </p>
                <Link href="/register" className="btn-primary w-full text-center block">
                  Empezar a usar NEXUS — Gratis
                </Link>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-5xl mb-4">💰</p>
                <p className="text-slate-500">Completá tus números y calculá tu tarifa ideal</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
