'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import {
  AlertCircle, FileText, Shield, FolderOpen, DollarSign,
  List, Clock, BookOpen, Users, Layout, FileCheck, ScrollText,
  CreditCard, BarChart3, Target, Bot, Star, ArrowRight,
  Share2, Gift, Banknote
} from 'lucide-react'

// ─── Animated Counter ───
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const counted = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ─── Scroll-reveal wrapper ───
function Reveal({ children, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}

// ─── Logo Wall ───
const logoWallBrands = [
  { name: 'Stripe', slug: 'stripe' },
  { name: 'Supabase', slug: 'supabase' },
  { name: 'Vercel', slug: 'vercel' },
  { name: 'OpenAI', slug: 'openai' },
  { name: 'Google', slug: 'google' },
  { name: 'GitHub', slug: 'github' },
  { name: 'Resend', slug: 'resend' },
]

function LogoWall() {
  return (
    <section className="py-12 border-y border-zinc-800 overflow-hidden bg-zinc-950">
      <div className="relative">
        <div className="flex gap-16 animate-scroll" style={{ width: `${logoWallBrands.length * 2 * 160}px` }}>
          {[...logoWallBrands, ...logoWallBrands].map((brand, i) => (
            <div key={i} className="flex items-center justify-center min-w-[120px]">
              <img
                src={`https://cdn.simpleicons.org/${brand.slug}/888888`}
                alt={brand.name}
                className="h-8 w-auto opacity-50 hover:opacity-80 transition-opacity duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonial Carousel ───
const testimonials = [
  { name: 'Sofia L.', role: 'Disenadora UX, 3 anos', initials: 'SL', text: 'Antes tenia todo en Excel, Notion, WhatsApp... un caos. NEXUS me ordeno la vida. Ahora manejo 12 clientes desde una sola plataforma.', rating: 5 },
  { name: 'Martin G.', role: 'Desarrollador Web, 5 anos', initials: 'MG', text: 'Empece facturando $1.5K/mes. Con las propuestas de NEXUS cerre proyectos de $8K. El sistema de contratos me ahorro dolores de cabeza.', rating: 5 },
  { name: 'Carolina M.', role: 'Content Strategist, 4 anos', initials: 'CM', text: 'Mis clientes AMAN el portal. Dejaron de preguntarme como va el proyecto. Todo esta ahi, en tiempo real.', rating: 5 },
  { name: 'Andres R.', role: 'Consultor Marketing, 6 anos', initials: 'AR', text: 'Probe 5 herramientas antes. NEXUS es la primera que realmente usa mi equipo. El pipeline CRM nos cambio.', rating: 5 },
  { name: 'Valentina P.', role: 'Copywriter, 3 anos', initials: 'VP', text: 'El generador de contratos me ahorro $800 en abogados este ano. Y la facturacion con Stripe es impecable.', rating: 5 },
]

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      <div className="relative min-h-[280px]">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className={`transition-all duration-700 absolute inset-0 ${
              i === current ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
            }`}
          >
            <div className="card p-8 max-w-2xl mx-auto border-zinc-700/60 shadow-xl">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-violet-400 fill-violet-400" />
                ))}
              </div>
              <p className="text-lg text-zinc-300 leading-relaxed mb-6">
                {t.text}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-zinc-100">{t.name}</p>
                  <p className="text-sm text-zinc-500">{t.role}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? 'bg-violet-500 w-5' : 'bg-zinc-700 hover:bg-zinc-600'
            }`}
            aria-label={`Testimonio ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Pricing Card ───
function PricingCard({ plan, index }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null)).catch(() => {})
  }, [])

  async function handleClick() {
    if (!user) { router.push('/register'); return }

    const priceIds = {
      starter: 'price_1TceAHIKNlA3QlU4l77jf9Lv',
      pro: 'price_1TceALIKNlA3QlU4AQulK1AI',
      ai: 'price_1TceAOIKNlA3QlU4FyCto5ie',
    }

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceIds[plan.id],
          userId: user.id,
          affiliateCode: user?.user_metadata?.affiliate_code || '',
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error || 'Error')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div
      className={`card p-8 flex flex-col relative transition-all duration-300 hover:-translate-y-1 ${
        plan.featured ? 'border-violet-700 ring-1 ring-violet-700 shadow-xl scale-[1.02]' : 'card-hover'
      }`}
    >
      {plan.featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-sm font-bold px-5 py-1.5 rounded-full shadow-lg">
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
            <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`text-center font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
          plan.featured
            ? 'btn-primary'
            : 'border border-zinc-700 text-zinc-300 hover:border-violet-600 hover:text-violet-400'
        }`}
      >
        {loading ? (
          <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Redirigiendo...</>
        ) : (
          <>{user ? 'Pagar Ahora' : plan.cta}</>
        )}
      </button>
    </div>
  )
}

// ─── Main Page ───
export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">

      {/* SECTION 1: HERO - Asymmetric Split */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-zinc-950 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: content */}
            <div className="max-w-xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tighter">
                NEXUS: El Sistema Operativo de tu Negocio Freelance
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 mb-10 max-w-[55ch] leading-relaxed">
                Gestiona proyectos, clientes y finanzas en un solo lugar. Trabaja como agencia, no como independiente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="btn-primary inline-flex items-center justify-center gap-2 text-base px-8 py-3.5 shadow-lg shadow-violet-600/20">
                  Comenzar Gratis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/pricing" className="btn-outline inline-flex items-center justify-center text-base px-8 py-3.5">
                  Ver Planes
                </Link>
              </div>
            </div>

            {/* Right: real image */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-violet-600/10 rounded-2xl blur-2xl" />
                <img
                  src="https://images.unsplash.com/photo-1497366216548-2ba5f7a6c6b1?w=1200&q=80&auto=format&fit=crop"
                  alt="NEXUS dashboard preview"
                  className="relative rounded-xl border border-zinc-800 shadow-2xl w-full h-auto"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 2: LOGO WALL ═══════ */}
      <LogoWall />

      {/* SECTION 3: PAIN / SOLUTION - Asymmetric Bento */}
      <section className="py-20 lg:py-28 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14">
              <span className="inline-block text-[11px] font-mono uppercase tracking-[0.18em] text-violet-400 mb-4">
                El Problema
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 max-w-2xl tracking-tight">
                Esto te suena familiar?
              </h2>
              <p className="text-zinc-400 max-w-[65ch]">
                La mayoria de freelancers pierden 30% de sus ingresos por falta de organizacion. No dejes que te pase a ti.
              </p>
            </div>
          </Reveal>

          {/* 2 + 3 bento */}
          <div className="space-y-6">
            {/* Row 1: 2 items */}
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: AlertCircle, img: 'photo-1554224155-8d04cb21cd6c', problem: 'No sabes cuanto ganas realmente', solution: 'Dashboard con metricas en tiempo real de ingresos, gastos y ganancias netas.' },
                { icon: FileText, img: 'photo-1450101499163-c8848c66ca85', problem: 'Tiras propuestas al aire y nunca cierras', solution: 'Generador de propuestas profesionales que convierten 2x mas.' },
              ].map((item, i) => (
                <Reveal key={i}>
                  <div className="card overflow-hidden card-hover group">
                    <img
                      src={`https://images.unsplash.com/${item.img}?w=600&q=80&auto=format&fit=crop`}
                      alt=""
                      className="w-full h-52 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                      loading="lazy"
                    />
                    <div className="p-6">
                      <div className="flex items-center gap-2.5 mb-2">
                        <item.icon className="w-5 h-5 text-violet-400 shrink-0" />
                        <h3 className="font-semibold text-zinc-100">{item.problem}</h3>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">{item.solution}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Row 2: 3 items */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Shield, img: 'photo-1586281380349-0b7d5c5e5c9f', problem: 'Trabajas sin contrato y te han estafado', solution: 'Contratos con validez legal generados por IA en 2 minutos.' },
                { icon: FolderOpen, img: 'photo-1497366812374-5e3c0a8b7d6e', problem: 'Archivos perdidos en mil carpetas', solution: 'File Vault organizado por cliente con integracion Google Drive.' },
                { icon: DollarSign, img: 'photo-1579621970563-ebec7560ff3e', problem: 'No cobras a tiempo', solution: 'Facturas con link de pago Stripe y recordatorios automaticos.' },
              ].map((item, i) => (
                <Reveal key={i}>
                  <div className="card overflow-hidden card-hover group">
                    <img
                      src={`https://images.unsplash.com/${item.img}?w=600&q=80&auto=format&fit=crop`}
                      alt=""
                      className="w-full h-44 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                      loading="lazy"
                    />
                    <div className="p-5">
                      <div className="flex items-center gap-2.5 mb-2">
                        <item.icon className="w-5 h-5 text-violet-400 shrink-0" />
                        <h3 className="font-semibold text-zinc-100 text-sm">{item.problem}</h3>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">{item.solution}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURES - 4-Column Grid */}
      <section className="py-20 lg:py-28 bg-zinc-900/50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Todo lo que necesitas, en un solo lugar
              </h2>
              <p className="text-zinc-400 max-w-[65ch]">
                No mas tabs perdidos, no mas suscripciones duplicadas, no mas informacion dispersa.
              </p>
            </div>
          </Reveal>

          {/* Real image for this section */}
          <div className="relative mb-10 rounded-xl overflow-hidden border border-zinc-800 shadow-lg">
            <img
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80&auto=format&fit=crop"
            alt="NEXUS feature overview"
            className="w-full h-48 sm:h-64 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: List, name: 'Task Manager', desc: 'Drag & drop, prioridades, fechas, filtros' },
              { icon: Clock, name: 'Time Tracker', desc: 'Registra horas y factura automaticamente' },
              { icon: FileText, name: 'Quick Notes', desc: 'Captura ideas al instante con IA' },
              { icon: BookOpen, name: 'Daily Journal', desc: 'Reflexion diaria con tracking de humor' },
              { icon: Users, name: 'Pipeline CRM', desc: 'Kanban de ventas: lead a cliente' },
              { icon: Layout, name: 'Kanban Projects', desc: 'Tablero visual por proyecto' },
              { icon: FileCheck, name: 'Propuestas IA', desc: 'Genera propuestas que cierran ventas' },
              { icon: ScrollText, name: 'Contratos IA', desc: 'Contratos profesionales en segundos' },
              { icon: CreditCard, name: 'Facturas', desc: 'Factura y cobra con Stripe' },
              { icon: BarChart3, name: 'Dashboard', desc: 'Metricas en tiempo real' },
              { icon: Target, name: 'Metas', desc: 'Tracking visual de objetivos' },
              { icon: Bot, name: 'AI Tools', desc: 'Email, bio, rewrite, outreach' },
            ].map((tool, i) => {
              // At least 3-4 cards with visual variation
              const hasVariantBg = i === 0 || i === 4 || i === 8 || i === 11
              const gradientClasses = [
                'from-violet-600/10 to-transparent',
                'from-emerald-600/10 to-transparent',
                'from-amber-600/10 to-transparent',
                'from-blue-600/10 to-transparent',
              ]
              const gradClass = gradientClasses[Math.floor(i / 3) % gradientClasses.length]

              return (
                <Reveal key={i}>
                  <div className={`group card p-5 card-hover relative overflow-hidden ${hasVariantBg ? 'border-zinc-700/60' : ''}`}>
                    {hasVariantBg && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradClass} opacity-40 group-hover:opacity-60 transition-opacity`} />
                    )}
                    <div className={`relative flex items-start gap-3 ${hasVariantBg ? '' : ''}`}>
                      <div className={`p-2 rounded-lg shrink-0 ${hasVariantBg ? 'bg-violet-600/15' : ''}`}>
                        <tool.icon className={`w-5 h-5 ${hasVariantBg ? 'text-violet-400' : 'text-zinc-500 group-hover:text-violet-400'} transition-colors`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-zinc-100 text-sm">{tool.name}</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">{tool.desc}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: AFFILIATE / GROWTH - 3-Column Bento */}
      <section className="py-20 lg:py-28 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Crece mientras construyes tu red
              </h2>
              <p className="text-zinc-400 max-w-[65ch]">
                NEXUS no es solo una herramienta. Es una plataforma de crecimiento con referidos, promociones y pagos automaticos.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: image background */}
            <Reveal>
              <div className="relative rounded-xl overflow-hidden group min-h-[340px] flex items-end">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80&auto=format&fit=crop"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                <div className="relative p-6">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Share2 className="w-5 h-5 text-violet-400" />
                    <h3 className="font-bold text-white">Link Unico de Afiliado</h3>
                  </div>
                  <p className="text-sm text-zinc-300 mb-3">Cada miembro tiene su link. Compartelo y ganas 25% recurrente.</p>
                  <span className="inline-block bg-violet-600/30 text-violet-300 text-xs font-semibold px-3 py-1 rounded-full border border-violet-600/30">
                    25% recurrente
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Card 2: solid dark */}
            <Reveal>
              <div className="card p-6 min-h-[340px] flex flex-col justify-end card-hover">
                <div className="p-3 rounded-lg bg-amber-600/15 w-fit mb-4">
                  <Gift className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">100 Promociones Semanales</h3>
                <p className="text-sm text-zinc-400 mb-4">Cada semana una promo diferente: comisiones de hasta 75%, bonos, sorteos.</p>
                <span className="inline-block bg-amber-600/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full border border-amber-600/20">
                  Rota cada semana
                </span>
              </div>
            </Reveal>

            {/* Card 3: subtle gradient */}
            <Reveal>
              <div className="relative rounded-xl overflow-hidden min-h-[340px] group flex items-end bg-gradient-to-br from-emerald-600/15 via-zinc-900 to-zinc-950 border border-zinc-800">
                <img
                  src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80&auto=format&fit=crop"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
                  loading="lazy"
                />
                <div className="relative p-6 w-full">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Banknote className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-white">Pagos Automaticos</h3>
                  </div>
                  <p className="text-sm text-zinc-300 mb-3">Conecta tu cuenta bancaria via Stripe y cobra sin intervencion manual.</p>
                  <span className="inline-block bg-emerald-600/20 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-600/20">
                    Stripe Connect
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SECTION 6: TESTIMONIALS - Carousel */}
      <section className="py-20 lg:py-28 bg-zinc-900/50 relative overflow-hidden">
        {/* Decorative image background */}
        <div className="absolute inset-0 opacity-[0.04]">
          <img
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=60&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Reveal>
            <span className="inline-block text-[11px] font-mono uppercase tracking-[0.18em] text-violet-400 mb-4">
              Testimonios
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Lo que dicen los que ya escalan con NEXUS
            </h2>
            <p className="text-zinc-400 mb-12 max-w-2xl mx-auto">
              Mas de 5,000 freelancers transformaron su negocio.
            </p>
            <TestimonialCarousel />
          </Reveal>
        </div>
      </section>

      {/* ═══════ SECTION 7: PRICING ═══════ */}
      <section className="py-20 lg:py-28 bg-zinc-950 relative overflow-hidden" id="pricing">
        {/* Decorative image */}
        <div className="absolute inset-0 opacity-[0.03]">
          <img
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=60&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Invierte en tu crecimiento
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Precio de lanzamiento. Bloquea tu precio ahora.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { id: 'starter', name: 'Starter', price: '199', original: '399', desc: 'Para quienes arrancan', cta: 'Empezar', featured: false,
                features: ['Task Manager', 'Quick Notes', 'Pomodoro Timer', 'Daily Journal', 'Hasta 5 clientes', 'Dashboard basico'] },
              { id: 'pro', name: 'Profesional', price: '599', original: '899', desc: 'El plan que elegi para mi', cta: 'Elegir Profesional', featured: true,
                features: ['TODAS las herramientas', 'Clientes ilimitados', 'Propuestas con IA', 'Contratos con IA', 'Facturas + Stripe', 'Time Tracker', 'Kanban Projects', 'File Vault + Drive', 'Sistema de Afiliados', 'Client Portal', 'Metas y tracking', 'Historial completo'] },
              { id: 'ai', name: 'Profesional + AI', price: '999', original: '1499', desc: 'Potenciado con inteligencia artificial', cta: 'Elegir Pro + AI', featured: false,
                features: ['Todo lo del plan Profesional', 'AI Email Writer', 'AI Bio Writer', 'AI Proposal Enhancer', 'AI Content Rewriter', 'AI Contract Generator', 'Soporte prioritario'] },
            ].map((plan, i) => (
              <PricingCard key={i} plan={plan} index={i} />
            ))}
          </div>

          <p className="text-center text-sm text-zinc-500 mt-8">
            Todos los planes incluyen 7 dias de prueba gratis. Sin tarjeta al registrarte.
          </p>
        </div>
      </section>

      {/* ═══════ SECTION 8: FINAL CTA ═══════ */}
      <section className="relative py-28 lg:py-36 overflow-hidden bg-zinc-950 border-t border-zinc-800">
        {/* Decorative background image */}
        <div className="absolute inset-0 opacity-[0.04]">
          <img
            src="https://images.unsplash.com/photo-1497366216548-2ba5f7a6c6b1?w=1600&q=60&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              Deja de usar 8 herramientas distintas
            </h2>
            <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto">
              Centraliza tu negocio, cierra mas clientes, factura mas. 7 dias gratis, sin compromiso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary inline-flex items-center justify-center gap-2 text-base px-10 py-3.5 shadow-lg shadow-violet-600/20">
                Comenzar Gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/pricing" className="btn-outline inline-flex items-center justify-center text-base px-10 py-3.5">
                Ver Planes
              </Link>
            </div>
            <p className="text-zinc-600 text-sm mt-6">Sin tarjeta de credito. Cancela cuando quieras.</p>
          </Reveal>
        </div>
      </section>

    </div>
  )
}
