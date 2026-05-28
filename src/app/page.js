'use client'

import Link from 'next/link'
import CountdownTimer from '@/components/CountdownTimer'

const tools = [
  { icon: '📋', name: 'Task Manager', desc: 'Organizá tus tareas con drag & drop, prioridades y fechas' },
  { icon: '⏱️', name: 'Pomodoro Timer', desc: 'Focus sessions con registro automático de horas' },
  { icon: '📝', name: 'Quick Notes', desc: 'Capturá ideas al instante' },
  { icon: '📓', name: 'Daily Journal', desc: 'Reflexión diaria con tracking de humor' },
  { icon: '👥', name: 'Pipeline CRM', desc: 'Kanban de ventas: lead → cliente' },
  { icon: '📊', name: 'Kanban Projects', desc: 'Tablero visual para cada proyecto' },
  { icon: '📄', name: 'Propuestas', desc: 'Generá propuestas profesionales en segundos' },
  { icon: '⚖️', name: 'Contratos', desc: 'Firma digital ready en 2 minutos' },
  { icon: '💰', name: 'Facturas', desc: 'Facturá y cobrá con Stripe integrado' },
  { icon: '📈', name: 'Dashboard', desc: 'Métricas en tiempo real de tu negocio' },
  { icon: '💰', name: 'Tax Dashboard', desc: 'Reportes financieros + export CSV' },
  { icon: '🔗', name: 'Client Portal', desc: 'Tu cliente ve y aprueba todo online' },
  { icon: '🎯', name: 'Metas', desc: 'Definí objetivos con tracking visual' },
  { icon: '🤖', name: 'AI Email Writer', desc: 'Emails profesionales desde contexto' },
  { icon: '⭐', name: 'Testimonios', desc: 'Recolectá y mostrá pruebas sociales' },
  { icon: '📁', name: 'File Vault', desc: 'Storage por cliente y proyecto' },
]

const testimonials = [
  { name: 'Sofía L.', role: 'Diseñadora UX', text: 'Antes tenía todo en Excel, Notion, WhatsApp... un caos. NEXUS me ordenó la vida.', rating: 5 },
  { name: 'Martín G.', role: 'Desarrollador Web', text: 'Empecé facturando $1.5K/mes, hoy voy por $8K. El sistema de propuestas me cambió el juego.', rating: 5 },
  { name: 'Carolina M.', role: 'Content Strategist', text: 'Mis clientes aman el portal. Dejaron de preguntarme "cómo va el proyecto".', rating: 5 },
  { name: 'Andrés R.', role: 'Consultor Marketing', text: 'Probé 5 herramientas antes. NEXUS es la primera que realmente usa mi equipo.', rating: 5 },
  { name: 'Valentina P.', role: 'Copywriter', text: 'El generador de contratos solo me ahorró $800 en abogados este año.', rating: 5 },
  { name: 'Diego H.', role: 'Product Designer', text: 'No sabía cuánto ganaba realmente hasta que empecé a usar NEXUS.', rating: 5 },
]

function checkmark() {
  return <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="gradient-hero min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-sm font-medium">Disponible ahora — Prueba gratis 7 días</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                El <span className="text-gradient">Sistema Operativo</span>
                <br />
                de tu Negocio Freelance
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-lg">
                Una sola plataforma para gestionar clientes, proyectos, tareas, propuestas, contratos, facturas y más. <strong className="text-white">Todo lo que necesitás para operar como profesional.</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/register" className="btn-primary text-lg px-8 py-4 text-center">
                  Comenzar Gratis — 7 Días de Prueba
                </Link>
                <Link href="/pricing" className="btn-outline text-white border-white/30 hover:bg-white/10 text-lg px-8 py-4 text-center">
                  Ver Precios
                </Link>
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-sm">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full gradient-primary border-2 border-slate-800 flex items-center justify-center text-white text-xs font-bold">
                      {['A','S','E','M','K'][i-1]}
                    </div>
                  ))}
                </div>
                <span><strong className="text-white">1,247+</strong> freelancers ya usan NEXUS</span>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="card p-6 shadow-2xl bg-white/5 backdrop-blur-xl border-white/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Dashboard</span>
                    <span className="text-emerald-400 text-sm">+32% este mes</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Clientes', value: '24', color: 'violet', change: '+3' },
                      { label: 'Proyectos', value: '12', color: 'emerald', change: '+5' },
                      { label: 'Facturado', value: '$8.4K', color: 'amber', change: '+42%' },
                    ].map(s => (
                      <div key={s.label} className="bg-white/5 rounded-lg p-3">
                        <p className="text-slate-400 text-xs">{s.label}</p>
                        <p className="text-white font-bold text-lg">{s.value}</p>
                        <p className={`text-${s.color}-400 text-xs`}>{s.change}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 gradient-primary rounded-full" />
                  </div>
                  <p className="text-slate-400 text-xs text-center">Meta mensual: $10,000 — 74% completado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREE TOOLS STRIP */}
      <section className="bg-gradient-to-r from-violet-600 to-indigo-600 py-4">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <p className="text-white font-medium text-sm">🛠️ Herramientas gratuitas para freelancers:</p>
          <div className="flex gap-3">
            <Link href="/tools/rate-calculator" className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-all">
              💰 Calculadora de Tarifas
            </Link>
            <Link href="/tools/contract-generator" className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-all">
              ⚖️ Generador de Contratos
            </Link>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF BANNER */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '1,247+', label: 'Freelancers activos' },
              { value: '12,500+', label: 'Propuestas generadas' },
              { value: '$4.2M+', label: 'Facturado por usuarios' },
              { value: '98.7%', label: 'Satisfacción' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAIN / SOLUTION */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              ¿Suena conocido?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              La mayoría de freelancers pierden dinero y tiempo por falta de un sistema.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                problem: '📉 "No sé cuánto estoy ganando realmente"',
                solution: 'Dashboard con métricas en tiempo real de ingresos, gastos y ganancias netas.',
              },
              {
                problem: '📝 "Tiro propuestas al aire y nunca cierro"',
                solution: 'Generador de propuestas profesionales que convierten 2x más.',
              },
              {
                problem: '⚖️ "Trabajo sin contrato y me han estafado"',
                solution: 'Contratos con validez legal generados en 2 minutos.',
              },
              {
                problem: '📎 "Tengo archivos perdidos en 5 carpetas distintas"',
                solution: 'File Vault organizado por cliente y proyecto.',
              },
              {
                problem: '💰 "No cobro a tiempo y me da cosa perseguir"',
                solution: 'Facturas con link de pago Stripe + recordatorios automáticos.',
              },
              {
                problem: '🤯 "Uso 8 herramientas distintas y es un caos"',
                solution: 'Una sola plataforma. Todo integrado. Sin perder información.',
              },
            ].map((item, i) => (
              <div key={i} className="card p-6 card-hover">
                <p className="text-lg font-semibold text-slate-900 mb-3">{item.problem}</p>
                <div className="w-12 h-1 gradient-primary rounded-full mb-3" />
                <p className="text-slate-600">{item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HERRAMIENTAS */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-100 rounded-full px-4 py-2 mb-4">
              <span className="text-violet-700 text-sm font-medium">30+ Herramientas Todo-en-Uno</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Todo lo que necesitás para operar como una <span className="text-gradient">agencia profesional</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Cada herramienta está diseñada para que uses NEXUS todos los días y no necesites nada más.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((tool, i) => (
              <div key={i} className="card p-4 card-hover flex items-start gap-3">
                <span className="text-2xl">{tool.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                  <p className="text-sm text-slate-500">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUE LADDER - PRICING */}
      <section className="py-20 bg-slate-50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <CountdownTimer targetDate={new Date(Date.now() + 3 * 86400000).toISOString()} />
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 mt-4">
              Invertí en tu negocio, no en herramientas
            </h2>
            <p className="text-lg text-slate-600">
              Precio de lanzamiento. <strong className="text-slate-900">Sube pronto.</strong>
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
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
            ].map((plan, i) => (
              <div
                key={i}
                className={`card p-8 flex flex-col relative ${
                  plan.featured
                    ? 'border-violet-500 ring-2 ring-violet-500 shadow-xl scale-105'
                    : 'card-hover'
                }`}
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
                  className={`text-center font-semibold py-3 rounded-lg transition-all ${
                    plan.featured
                      ? 'btn-primary'
                      : 'border-2 border-slate-300 text-slate-700 hover:border-violet-500 hover:text-violet-600'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 mt-8">
            Todos los planes incluyen 7 días de prueba gratis. Sin tarjeta al registrarte.
          </p>
        </div>
      </section>

      {/* AFFILIATE TEASER */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            ¿Usás NEXUS y querés ganar con ello?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Convertite en afiliado y ganá <strong className="text-violet-600">25% recurrente</strong> cada mes por cada persona que refieras. Sin límite.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            {[
              { icon: '🔗', title: 'Compartí tu link', desc: 'Cada miembro tiene un link único de afiliado' },
              { icon: '💰', title: 'Ganás 25% recurrente', desc: 'Cobrás cada mes que tu referido siga activo' },
              { icon: '🚀', title: 'Crece tu ingreso pasivo', desc: 'Más referidos = más ingresos sin límite' },
            ].map((item, i) => (
              <div key={i} className="card p-6 card-hover">
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/register" className="btn-primary text-lg px-8 py-4">
            Empezar a Usar NEXUS — Prueba Gratis
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Lo que dicen los que ya usan NEXUS
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-6 card-hover">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 gradient-hero">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Dejá de usar 8 herramientas distintas.
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Centralizá tu negocio en un solo lugar. <strong className="text-white">7 días gratis, sin compromiso.</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/register" className="btn-primary text-lg px-8 py-4 text-center">
              Comenzar mi Prueba Gratis
            </Link>
            <Link href="/pricing" className="btn-outline text-white border-white/30 hover:bg-white/10 text-lg px-8 py-4 text-center">
              Ver Planes
            </Link>
          </div>
          <p className="text-slate-400 text-sm">Sin tarjeta de crédito. Cancelá cuando quieras.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 gradient-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="text-white font-bold text-lg">NEXUS</span>
          </div>
          <p className="text-slate-400 text-sm">El Sistema Operativo de tu Negocio Freelance</p>
          <p className="text-slate-500 text-xs mt-4">© 2026 NEXUS. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
