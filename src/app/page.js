import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import { AnimatedCounter, ScrollReveal, LogoWall } from './home-client'

/* ------------------------------------------------------------------ */
/*  DESIGN READ: SaaS landing for freelance professionals (LatAm)     */
/*  Dark tech / premium-neutral. DESIGN_VARIANCE:7 MOTION:6 DENSITY:4 */
/*  Accent: violet (brand-consistent). Font: Geist (in layout.js)     */
/*  Max 1 eyebrow per 3 sections → 0 eyebrows; headline does the job  */
/* ------------------------------------------------------------------ */

const stats = [
  { label: 'Freelancers activos', end: 5000, suffix: '+' },
  { label: 'Ingreso promedio extra', end: 30, suffix: '%' },
  { label: 'Herramientas integradas', end: 12, suffix: '' },
  { label: 'Paises', end: 8, suffix: '' },
]

const painPoints = [
  {
    icon: 'AlertCircle', problem: 'No sabes cuanto ganas realmente',
    solution: 'Dashboard con metricas en tiempo real de ingresos, gastos y ganancias netas.',
    img: 'photo-1554224155-8d04cb21cd6c',
  },
  {
    icon: 'FileText', problem: 'Tiras propuestas al aire',
    solution: 'Generador de propuestas profesionales que convierten 2x mas.',
    img: 'photo-1450101499163-c8848c66ca85',
  },
  {
    icon: 'Shield', problem: 'Trabajas sin contrato',
    solution: 'Contratos con validez legal generados por IA en 2 minutos.',
    img: 'photo-1586281380349-0b7d5c5e5c9f',
  },
  {
    icon: 'FolderOpen', problem: 'Archivos perdidos',
    solution: 'File Vault organizado por cliente con integracion Google Drive.',
    img: 'photo-1497366812374-5e3c0a8b7d6e',
  },
  {
    icon: 'DollarSign', problem: 'No cobras a tiempo',
    solution: 'Facturas con link de pago Stripe y recordatorios automaticos.',
    img: 'photo-1579621970563-ebec7560ff3e',
  },
]

const features = [
  { icon: 'List', name: 'Task Manager', desc: 'Drag & drop con prioridades y fechas' },
  { icon: 'Clock', name: 'Time Tracker', desc: 'Registra horas y factura automaticamente' },
  { icon: 'FileText', name: 'Quick Notes', desc: 'Captura ideas al instante con IA' },
  { icon: 'BookOpen', name: 'Daily Journal', desc: 'Reflexion diaria con tracking de humor' },
  { icon: 'Users', name: 'Pipeline CRM', desc: 'Kanban de ventas: lead a cliente' },
  { icon: 'Layout', name: 'Kanban Projects', desc: 'Tablero visual por proyecto' },
  { icon: 'FileCheck', name: 'Propuestas IA', desc: 'Genera propuestas que cierran ventas' },
  { icon: 'ScrollText', name: 'Contratos IA', desc: 'Contratos profesionales en segundos' },
  { icon: 'CreditCard', name: 'Facturas', desc: 'Factura y cobra con Stripe' },
  { icon: 'BarChart3', name: 'Dashboard', desc: 'Metricas en tiempo real' },
  { icon: 'Target', name: 'Metas', desc: 'Tracking visual de objetivos' },
  { icon: 'Bot', name: 'AI Tools', desc: 'Email, bio, rewrite, outreach' },
]

const testimonials = [
  {
    name: 'Sofia L.', role: 'Disenadora UX, 3 anos',
    text: 'Antes tenia todo en Excel, Notion, WhatsApp... un caos. NEXUS me ordeno la vida. Ahora manejo 12 clientes desde una sola plataforma.',
  },
  {
    name: 'Martin G.', role: 'Desarrollador Web, 5 anos',
    text: 'Empece facturando $1.5K/mes. Con las propuestas de NEXUS cerre proyectos de $8K.',
  },
  {
    name: 'Carolina M.', role: 'Content Strategist, 4 anos',
    text: 'Mis clientes AMAN el portal. Todo esta ahi, en tiempo real. Dejaron de preguntarme como va el proyecto.',
  },
]

/* ------------------------------------------------------------------ */
/*  SECTION MAP (8 sections, 0 eyebrows → within 1/3 rule)           */
/*  1: Hero split      2: Logo wall     3: Pain bento                */
/*  4: Stats strip     5: Features      6: Affiliate                 */
/*  7: Testimonials    8: Pricing       9: Final CTA                 */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">

      {/* ─── 1. HERO: asymmetric split ─── */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tighter">
                NEXUS: El OS de tu Negocio Freelance
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 mb-10 max-w-[55ch] leading-relaxed">
                Gestiona proyectos, clientes y finanzas en un solo lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="btn-primary inline-flex items-center justify-center gap-2 text-base px-8 py-3.5 shadow-lg shadow-violet-600/20"
                >
                  Comenzar Gratis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="btn-outline inline-flex items-center justify-center text-base px-8 py-3.5"
                >
                  Ver Planes
                </Link>
              </div>
            </div>
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

      {/* ─── 2. LOGO WALL ─── */}
      <LogoWall />

      {/* ─── 3. PAIN BENTO: asymmetric 1+2+2 ─── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
              Esto te suena familiar?
            </h2>
            <p className="text-zinc-400 max-w-[65ch] mb-14">
              La mayoria de freelancers pierden 30% de sus ingresos por falta de organizacion.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Hero card: spans 2 cols */}
            <PainCard item={painPoints[0]} span="md:col-span-2 md:row-span-2" imageHeight="h-72" />
            {/* Right column: 2 cards stacked */}
            <PainCard item={painPoints[1]} />
            <PainCard item={painPoints[2]} />
            {/* Bottom row: 3 cards, but already used 4 items → last 2 fill */}
            <PainCard item={painPoints[3]} />
            <PainCard item={painPoints[4]} />
          </div>
        </div>
      </section>

      {/* ─── 4. STATS STRIP ─── */}
      <section className="py-16 bg-zinc-900/50 border-y border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  <AnimatedCounter end={s.end} suffix={s.suffix} />
                </div>
                <div className="text-sm text-zinc-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. FEATURES: 4-col grid with 3 anchor cards ─── */}
      <section className="py-20 lg:py-28" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
              Todo lo que necesitas, en un solo lugar
            </h2>
            <p className="text-zinc-400 max-w-[65ch] mb-14">
              No mas tabs perdidos, no mas suscripciones duplicadas.
            </p>
          </ScrollReveal>

          <div className="relative mb-12 rounded-xl overflow-hidden border border-zinc-800 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80&auto=format&fit=crop"
              alt=""
              className="w-full h-48 sm:h-56 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <FeatureCard key={i} item={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. AFFILIATE BENTO: 1+2 ─── */}
      <section className="py-20 lg:py-28 bg-zinc-900/50 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
              Crece mientras construyes tu red
            </h2>
            <p className="text-zinc-400 max-w-[65ch] mb-14">
              NEXUS es una plataforma de crecimiento con referidos, promociones y pagos automaticos.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Large image card */}
            <div className="md:col-span-2 relative rounded-xl overflow-hidden group min-h-[400px] flex items-end">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80&auto=format&fit=crop"
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
              <div className="relative p-8">
                <span className="inline-block bg-violet-600/30 text-violet-300 text-xs font-semibold px-3 py-1 rounded-full border border-violet-600/30 mb-3">
                  25% recurrente
                </span>
                <h3 className="text-xl font-bold text-white mb-2">Link Unico de Afiliado</h3>
                <p className="text-zinc-300 max-w-lg">Comparte tu link y gana 25% recurrente por cada referral que se suscriba.</p>
              </div>
            </div>

            {/* Right column: 2 stacked cards */}
            <div className="flex flex-col gap-6">
              <div className="flex-1 card p-6 flex flex-col justify-center card-hover">
                <div className="w-10 h-10 rounded-lg bg-violet-600/15 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-bold text-white mb-1">Promociones Semanales</h3>
                <p className="text-sm text-zinc-400">Comisiones de hasta 75%, bonos y sorteos. Rota cada semana.</p>
              </div>
              <div className="flex-1 card p-6 flex flex-col justify-center card-hover">
                <div className="w-10 h-10 rounded-lg bg-violet-600/15 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-white mb-1">Pagos Automaticos</h3>
                <p className="text-sm text-zinc-400">Conecta tu cuenta bancaria via Stripe y cobra sin intervencion manual.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. TESTIMONIALS: static grid ─── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight text-center">
              Lo que dicen los que ya escalan con NEXUS
            </h2>
            <p className="text-zinc-400 text-center mb-14">
              Mas de 5,000 freelancers transformaron su negocio.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-6 border-zinc-800/60">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-violet-400 fill-violet-400" />
                  ))}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-100 text-sm">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. PRICING ─── */}
      <section className="py-20 lg:py-28 bg-zinc-900/50 border-t border-zinc-800/50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight text-center">
              Invierte en tu crecimiento
            </h2>
            <p className="text-zinc-400 text-center mb-14">Precio de lanzamiento. Bloquea tu precio ahora.</p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
            <PricingCardShell
              name="Starter"
              price="199"
              original="399"
              desc="Para quienes arrancan"
              cta="Empezar"
              features={['Task Manager', 'Quick Notes', 'Pomodoro Timer', 'Daily Journal', 'Hasta 5 clientes', 'Dashboard basico']}
            />
            <PricingCardShell
              name="Profesional"
              price="599"
              original="899"
              desc="El plan que elegi para mi"
              cta="Elegir Profesional"
              featured
              features={[
                'TODAS las herramientas', 'Clientes ilimitados', 'Propuestas con IA',
                'Contratos con IA', 'Facturas + Stripe', 'Time Tracker',
                'Kanban Projects', 'File Vault + Drive', 'Sistema de Afiliados',
                'Client Portal', 'Metas y tracking', 'Historial completo',
              ]}
            />
            <PricingCardShell
              name="Profesional + AI"
              price="999"
              original="1499"
              desc="Potenciado con inteligencia artificial"
              cta="Elegir Pro + AI"
              features={[
                'Todo lo del plan Profesional', 'AI Email Writer', 'AI Bio Writer',
                'AI Proposal Enhancer', 'AI Content Rewriter', 'AI Contract Generator',
                'Soporte prioritario',
              ]}
            />
          </div>

          <p className="text-center text-sm text-zinc-500">7 dias de prueba gratis. Sin tarjeta al registrarte.</p>
        </div>
      </section>

      {/* ─── 9. FINAL CTA ─── */}
      <section className="relative py-28 lg:py-36 overflow-hidden border-t border-zinc-800">
        <div className="absolute inset-0 opacity-[0.04]">
          <img
            src="https://images.unsplash.com/photo-1497366216548-2ba5f7a6c6b1?w=1600&q=60&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              Deja de usar 8 herramientas distintas
            </h2>
            <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto">
              Centraliza tu negocio, cierra mas clientes, factura mas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn-primary inline-flex items-center justify-center gap-2 text-base px-10 py-3.5 shadow-lg shadow-violet-600/20"
              >
                Comenzar Gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="btn-outline inline-flex items-center justify-center text-base px-10 py-3.5"
              >
                Ver Planes
              </Link>
            </div>
            <p className="text-zinc-600 text-sm mt-6">Sin tarjeta de credito. Cancela cuando quieras.</p>
          </ScrollReveal>
        </div>
      </section>

    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Server-compatible sub-components (no hooks, no interactivity)     */
/* ------------------------------------------------------------------ */

function PainCard({ item, span = '', imageHeight = 'h-44' }) {
  const icons = {
    AlertCircle: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    FileText: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    Shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    FolderOpen: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
    DollarSign: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  }

  return (
    <ScrollReveal>
      <div className={`card overflow-hidden card-hover group ${span}`}>
        <img
          src={`https://images.unsplash.com/${item.img}?w=800&q=80&auto=format&fit=crop`}
          alt=""
          className={`w-full ${imageHeight} object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500`}
          loading="lazy"
        />
        <div className="p-5">
          <div className="flex items-center gap-2.5 mb-2">
            <svg className="w-5 h-5 text-violet-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icons[item.icon]} />
            </svg>
            <h3 className="font-semibold text-zinc-100 text-sm">{item.problem}</h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">{item.solution}</p>
        </div>
      </div>
    </ScrollReveal>
  )
}

function FeatureCard({ item, index }) {
  const icons = {
    List: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    Clock: 'M12 6v6h4.5M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
    FileText: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    BookOpen: 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
    Users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
    Layout: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    FileCheck: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M9 15l2 2 4-4',
    ScrollText: 'M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z M9 8h6',
    CreditCard: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    BarChart3: 'M3 20h18M3 20v-4m18 4v-4M3 12V8m18 4V4M3 4v0',
    Target: 'M12 2a10 10 0 1010 10A10 10 0 0012 2z M12 6a6 6 0 106 6 6 6 0 00-6-6z M12 10a2 2 0 102 2 2 2 0 00-2-2z',
    Bot: 'M12 8V4m0 0L9 7m3-3l3 3M12 2v2 M12 16v4m0 0l-3-3m3 3l3-3M4 12H2m2 0a8 8 0 0116 0m2 0h-2',
  }
  const isAnchor = index === 0 || index === 4 || index === 8 || index === 11

  return (
    <ScrollReveal>
      <div className={`group card p-5 card-hover relative overflow-hidden ${isAnchor ? 'border-violet-800/30' : ''}`}>
        {isAnchor && (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/8 to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
        )}
        <div className="relative flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${isAnchor ? 'bg-violet-600/15' : ''}`}>
            <svg className={`w-5 h-5 ${isAnchor ? 'text-violet-400' : 'text-zinc-500 group-hover:text-violet-400'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icons[item.icon]} />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-zinc-100 text-sm">{item.name}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">{item.desc}</p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  )
}

function PricingCardShell({ name, price, original, desc, cta, featured = false, features }) {
  return (
    <div
      className={`card p-8 flex flex-col relative transition-all duration-300 hover:-translate-y-1 ${
        featured
          ? 'border-violet-700 ring-1 ring-violet-700 shadow-xl scale-[1.02]'
          : 'card-hover'
      }`}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-sm font-bold px-5 py-1.5 rounded-full shadow-lg">
          Mas Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-zinc-100">{name}</h3>
        <p className="text-zinc-500 text-sm mb-4">{desc}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-zinc-600 line-through text-lg">${original} MXN</span>
          <span className="text-4xl font-bold text-zinc-100">${price}</span>
          <span className="text-zinc-500">MXN/mes</span>
        </div>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, j) => (
          <li key={j} className="flex items-start gap-2 text-sm text-zinc-400">
            <svg className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`text-center font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
          featured
            ? 'btn-primary'
            : 'border border-zinc-700 text-zinc-300 hover:border-violet-600 hover:text-violet-400'
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}
