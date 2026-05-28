'use client'

import Link from 'next/link'
import CountdownTimer from '@/components/CountdownTimer'

const plans = [
  {
    name: 'Starter',
    price: '9',
    original: '19',
    desc: 'Para quienes arrancan',
    features: [
      'Task Manager',
      'Quick Notes',
      'Pomodoro Timer',
      'Daily Journal',
      'Hasta 5 clientes',
      'Dashboard básico',
    ],
    cta: 'Empezar',
    featured: false,
  },
  {
    name: 'Profesional',
    price: '29',
    original: '49',
    desc: 'El plan que elegí para mí',
    features: [
      'TODAS las herramientas',
      'Clientes ilimitados',
      'Propuestas ilimitadas',
      'Contratos + firma digital',
      'Facturas + Stripe',
      'Time Tracker',
      'Kanban Projects',
      'File Vault',
      'Sistema de Afiliados',
      'Portal para clientes',
      'Metas y tracking',
      'Historial completo',
    ],
    cta: 'Elegir Profesional',
    featured: true,
  },
  {
    name: 'Profesional + AI',
    price: '49',
    original: '79',
    desc: 'Potenciado con inteligencia artificial',
    features: [
      'Todo lo del plan Profesional',
      'AI Email Writer',
      'AI Bio Writer',
      'AI Proposal Enhancer',
      'AI Content Rewriter',
      'Soporte prioritario',
    ],
    cta: 'Elegir Pro + AI',
    featured: false,
  },
]

function checkmark() {
  return <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
}

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <CountdownTimer targetDate={new Date(Date.now() + 3 * 86400000).toISOString()} />
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 mt-4">
            Invertí en tu negocio
          </h1>
          <p className="text-lg text-slate-600">
            Precios de lanzamiento. <strong className="text-slate-900">Suben pronto.</strong> Bloqueá tu precio ahora.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`card p-8 flex flex-col relative ${plan.featured ? 'border-violet-500 ring-2 ring-violet-500 shadow-xl scale-105' : 'card-hover'}`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 gradient-primary text-white text-sm font-bold px-6 py-1.5 rounded-full">
                  Más Popular 🔥
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-400 line-through text-lg">${plan.original}</span>
                  <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                  <span className="text-slate-500">/mes</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                    {checkmark()}
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`text-center font-semibold py-3 rounded-lg transition-all ${plan.featured ? 'btn-primary' : 'border-2 border-slate-300 text-slate-700 hover:border-violet-500 hover:text-violet-600'}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. No hay contratos ni permanencia. Cancelás y perdés acceso al final del período pagado.' },
              { q: '¿Qué pasa con mis datos si cancelo?', a: 'Podés exportar todo tu contenido en cualquier momento. Después de cancelar, guardamos tus datos por 30 días.' },
              { q: '¿Cómo funciona el sistema de afiliados?', a: 'Cada miembro tiene un link único. Cuando alguien se registra con tu link, ganás 25% de su pago cada mes.' },
              { q: '¿Aceptan tarjetas de crédito/débito?', a: 'Sí. Stripe procesa todos los pagos de forma segura. Aceptamos Visa, Mastercard, Amex.' },
            ].map((faq, i) => (
              <details key={i} className="card p-4 group">
                <summary className="font-semibold text-slate-900 cursor-pointer flex items-center justify-between">
                  {faq.q}
                  <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
