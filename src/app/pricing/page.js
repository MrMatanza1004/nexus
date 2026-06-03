'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 199,
    original: 399,
    priceId: 'price_1TceAHIKNlA3QlU4l77jf9Lv',
    currency: 'MXN',
    desc: 'Para quienes arrancan',
    features: [
      'Task Manager',
      'Quick Notes',
      'Pomodoro Timer',
      'Daily Journal',
      'Hasta 5 clientes',
      'Dashboard basico',
    ],
    cta: 'Empezar',
    featured: false,
  },
  {
    id: 'pro',
    name: 'Profesional',
    price: 599,
    original: 899,
    priceId: 'price_1TceALIKNlA3QlU4AQulK1AI',
    currency: 'MXN',
    desc: 'El plan que elegi para mi',
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
    id: 'ai',
    name: 'Profesional + AI',
    price: 999,
    original: 1499,
    priceId: 'price_1TceAOIKNlA3QlU4FyCto5ie',
    currency: 'MXN',
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
  return (
    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function PricingPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(null)
  const [affiliateCode, setAffiliateCode] = useState('')
  const router = useRouter()

  useEffect(() => {
    try {
      supabase.auth.getUser().then(({ data }) => {
        setUser(data?.user ?? null)
        const ref = data?.user?.user_metadata?.affiliate_code
        if (ref) setAffiliateCode(ref)
      })
    } catch {
      setUser(null)
    }
  }, [])

  async function handleCheckout(plan) {
    if (!user) {
      router.push('/register')
      return
    }

    setLoading(plan.id)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.id,
          affiliateCode: affiliateCode || '',
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Error al crear sesion de pago')
      }
    } catch (err) {
      toast.error('Error de conexion: ' + err.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-[100dvh] pt-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Invierte en tu negocio
          </h1>
          <p className="text-lg text-zinc-400">
            Precios de lanzamiento. Bloquea tu precio ahora.
          </p>
          {user && (
            <p className="text-sm text-emerald-500 mt-2 font-medium">
              Sesion iniciada: paga con tarjeta al instante
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`bg-zinc-900/80 border border-zinc-800 rounded-xl p-8 flex flex-col relative transition-all duration-300 hover:-translate-y-1 ${
                plan.featured ? 'border-violet-700 ring-1 ring-violet-700 shadow-xl scale-[1.02]' : 'hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-sm font-bold px-5 py-1.5 rounded-full">
                  Mas Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-zinc-100">{plan.name}</h3>
                <p className="text-zinc-500 text-sm mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-zinc-600 line-through text-lg">${plan.original} MXN</span>
                  <span className="text-4xl font-bold text-zinc-100">${plan.price}</span>
                  <span className="text-zinc-500">MXN/mes</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-zinc-400">
                    {checkmark()}
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan)}
                disabled={loading !== null}
                className={`text-center font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                  plan.featured
                    ? 'bg-violet-600 hover:bg-violet-500 text-white'
                    : 'border border-zinc-700 text-zinc-300 hover:border-violet-600 hover:text-violet-400'
                }`}
              >
                {loading === plan.id ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Redirigiendo a pago...</>
                ) : (
                  <>{user ? 'Pagar Ahora' : plan.cta}</>
                )}
              </button>
              {!user && (
                <p className="text-xs text-zinc-500 text-center mt-2">
                  Primero crea tu cuenta gratis, despues pagas
                </p>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8 tracking-tight">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: 'Puedo cancelar cuando quiera?', a: 'Si. No hay contratos ni permanencia. Cancelas y pierdes acceso al final del periodo pagado.' },
              { q: 'Que pasa con mis datos si cancelo?', a: 'Puedes exportar todo tu contenido en cualquier momento. Despues de cancelar, guardamos tus datos por 30 dias.' },
              { q: 'Como funciona el sistema de afiliados?', a: 'Cada miembro tiene un link unico. Cuando alguien se registra con tu link, ganas 25% de su pago cada mes.' },
              { q: 'Aceptan tarjetas de credito/debito?', a: 'Si. Stripe procesa todos los pagos de forma segura. Aceptamos Visa, Mastercard, Amex.' },
              { q: 'Que metodos de pago aceptan ademas de tarjeta?', a: 'Actualmente solo tarjeta de credito/debito via Stripe.' },
            ].map((faq, i) => (
              <details key={i} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 group">
                <summary className="font-semibold text-zinc-100 cursor-pointer flex items-center justify-between">
                  {faq.q}
                  <svg className="w-5 h-5 text-zinc-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-zinc-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
