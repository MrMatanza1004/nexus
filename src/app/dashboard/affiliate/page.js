'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import { getAffiliateLink } from '@/lib/urls'
import AffiliatePromotionBanner from '@/components/AffiliatePromotionBanner'

const LEVELS = [
  { name: 'Bronce', min: 0, max: 4, color: 'amber', icon: '🥉', benefit: '25% comisión' },
  { name: 'Plata', min: 5, max: 14, color: 'slate', icon: '🥈', benefit: '25% + prioridad' },
  { name: 'Oro', min: 15, max: Infinity, color: 'yellow', icon: '🥇', benefit: '25% + soporte prioritario + badge exclusivo' },
]

const EARNINGS_MILESTONES = [100, 250, 500, 1000, 2500]

function LevelCard({ conversions }) {
  const level = useMemo(() => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (conversions >= LEVELS[i].min) return LEVELS[i]
    }
    return LEVELS[0]
  }, [conversions])

  const nextLevel = useMemo(() => {
    return LEVELS.find(l => l.min > conversions)
  }, [conversions])

  const progress = useMemo(() => {
    if (!nextLevel) return 100
    const range = nextLevel.min - level.min
    const current = conversions - level.min
    return Math.min((current / range) * 100, 100)
  }, [conversions, level, nextLevel])

  return (
    <div className="card p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-bl-full" />

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Tu Nivel</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl">{level.icon}</span>
            <span className="text-2xl font-bold text-slate-900">{level.name}</span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{level.benefit}</p>
        </div>
        {nextLevel && (
          <div className="text-right">
            <p className="text-xs text-slate-400">Próximo nivel</p>
            <p className="text-lg font-semibold text-slate-700">{nextLevel.icon} {nextLevel.name}</p>
            <p className="text-xs text-slate-400">Faltan {nextLevel.min - conversions} referidos</p>
          </div>
        )}
      </div>

      {nextLevel && (
        <div>
          <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {conversions} de {nextLevel.min} referidos activos — {progress.toFixed(0)}%
          </p>
        </div>
      )}

      {!nextLevel && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
          <p className="text-sm font-semibold text-yellow-800">🏆 Nivel máximo alcanzado</p>
          <p className="text-xs text-yellow-700">Disfrutá todos los beneficios del nivel Oro.</p>
        </div>
      )}
    </div>
  )
}

function MilestoneCard({ earnings }) {
  const nextMilestone = EARNINGS_MILESTONES.find(m => earnings < m)
  const prevMilestone = EARNINGS_MILESTONES.filter(m => m <= earnings).pop() || 0
  const progress = nextMilestone
    ? ((earnings - prevMilestone) / (nextMilestone - prevMilestone)) * 100
    : 100

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <p className="font-semibold text-slate-900 text-sm">Próximo hito de ganancias</p>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-slate-900">{formatCurrency(earnings)}</span>
        {nextMilestone ? (
          <span className="text-sm text-slate-400">Meta: {formatCurrency(nextMilestone)}</span>
        ) : (
          <span className="text-sm text-yellow-600 font-medium">🏆 Meta máxima alcanzada</span>
        )}
      </div>

      {nextMilestone && (
        <>
          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            Te faltan {formatCurrency(nextMilestone - earnings)} para llegar a {formatCurrency(nextMilestone)}.
            {nextMilestone - earnings <= 100 && ' ¡Casi ahí!'}
          </p>
        </>
      )}
    </div>
  )
}

function SocialProofBanner({ totalAffiliates }) {
  return (
    <div className="card p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {totalAffiliates > 0
                ? `${totalAffiliates} freelancers ya están en el programa de afiliados`
                : 'Crecé con la comunidad NEXUS'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalAffiliates > 0
                ? 'No estás solo. Cada vez más freelancers recomiendan NEXUS y ganan con el programa.'
                : 'Compartí tu link y empezá a generar ingresos pasivos.'}
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-3xl opacity-30">{'>'}_</div>
      </div>
    </div>
  )
}

export default function AffiliatePage() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ clicks: 0, conversions: 0, earnings: 0 })
  const [totalAffiliates, setTotalAffiliates] = useState(0)
  const [referrals, setReferrals] = useState([])
  const [copied, setCopied] = useState(false)
  const [affiliateCode, setAffiliateCode] = useState('')
  const [connectLoading, setConnectLoading] = useState(false)
  const [connectReady, setConnectReady] = useState(false)

  useEffect(() => {
    try {
      supabase.auth.getUser().then(({ data }) => {
        const u = data?.user ?? null
        setUser(u)
        const code = u?.user_metadata?.affiliate_code
        setAffiliateCode(code || '')
        setConnectReady(!!u?.user_metadata?.stripe_connect_ready)
        if (u?.id && code) loadStats(u.id, code)
      })
    } catch { setUser(null) }

    // Check if returning from Stripe Connect onboarding
    const params = new URLSearchParams(window.location.search)
    if (params.get('connect') === 'success') {
      toast.success('Pagos automáticos configurados')
      setConnectReady(true)
      window.history.replaceState({}, '', '/dashboard/affiliate')
    }

    // Load total affiliate count for social proof
    supabase.from('affiliate_clicks').select('affiliate_code', { count: 'exact', head: true }).then(({ count }) => {
      if (count) setTotalAffiliates(Math.round(count / 3)) // approximate unique affiliates
    })
  }, [])

  async function loadStats(userId, code) {
    const [clickRes, convRes] = await Promise.all([
      supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }).eq('affiliate_code', code),
      supabase.from('affiliate_conversions').select('*').eq('affiliate_code', code),
    ])
    const conversions = convRes.data || []
    const earnings = conversions.filter(c => c.status === 'paid').reduce((s, c) => s + Number(c.commission_amount || 0), 0)
    setStats({ clicks: clickRes.count || 0, conversions: conversions.length, earnings })
    setReferrals(conversions)
  }

  async function setupAutoPayout() {
    if (!user) return
    setConnectLoading(true)
    try {
      const res = await fetch('/api/stripe/create-connect-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const { url, error } = await res.json()
      if (error) return toast.error(error)
      window.location.href = url
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setConnectLoading(false)
    }
  }

  const affiliateLink = affiliateCode
    ? getAffiliateLink(affiliateCode)
    : ''

  function copyLink() {
    navigator.clipboard.writeText(affiliateLink)
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Afiliados</h1>
        <p className="text-slate-500 mt-1">Compartí tu link y ganá comisiones automáticas</p>
      </div>

      {/* Promo semanal */}
      <AffiliatePromotionBanner />

      {/* ── PRUEBA SOCIAL ── */}
      <div className="mb-6">
        <SocialProofBanner totalAffiliates={totalAffiliates} />
      </div>

      {/* ── NIVEL + PROGRESO ── */}
      <div className="mb-6">
        <LevelCard conversions={stats.conversions} />
      </div>

      {/* ── HITO DE GANANCIAS ── */}
      <div className="mb-6">
        <MilestoneCard earnings={stats.earnings} />
      </div>

      {/* Auto-payout CTA */}
      <div className={`card p-5 mb-6 flex items-center justify-between gap-4 border-2 ${connectReady ? 'border-emerald-200 bg-emerald-50' : 'border-violet-200 bg-violet-50'}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{connectReady
            ? <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            : <svg className="w-7 h-7 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          }</span>
          <div>
            <p className="font-semibold text-slate-900 text-sm">
              {connectReady ? 'Pagos automáticos activos' : 'Activar pagos automáticos'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {connectReady
                ? 'Tus comisiones se transfieren automáticamente a tu cuenta bancaria'
                : 'Conectá tu cuenta bancaria y recibí comisiones sin intervención manual'}
            </p>
          </div>
        </div>
        {!connectReady && (
          <button
            onClick={setupAutoPayout}
            disabled={connectLoading}
            className="btn-primary text-sm shrink-0 flex items-center gap-2"
          >
            {connectLoading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Conectando...</>
            ) : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Configurar pagos</>}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-slate-500">Clicks</p>
          <p className="text-2xl font-bold text-slate-900">{stats.clicks}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Conversiones</p>
          <p className="text-2xl font-bold text-slate-900">{stats.conversions}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-slate-500">Ganado</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.earnings)}</p>
        </div>
      </div>

      {/* Affiliate Link */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-3">Tu link de afiliado</h2>
        <div className="flex items-center gap-3">
          <input type="text" value={affiliateLink} readOnly className="input-field font-mono text-sm bg-slate-50" />
          <button onClick={copyLink} className={`btn-primary shrink-0 ${copied ? 'bg-emerald-500' : ''}`}>
            {copied ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Copiado</> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> Copiar</>}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="badge-info text-xs">25% comisión recurrente</span>
          <span className="badge-info text-xs">Cookies 30 días</span>
          <span className="badge-info text-xs">Pago automático</span>
          {connectReady && <span className="badge-success text-xs"><svg className="w-3 h-3 inline-block mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Stripe Connect activo</span>}
        </div>
      </div>

      {/* Share ideas */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-3">Ideas para compartir</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            '"Este es el sistema que uso para manejar todos mis clientes. Recomendadísimo."',
            '"Dejé de usar 5 herramientas distintas y centralicé todo en NEXUS."',
            '"Si sos freelancer y no usás NEXUS, estás perdiendo tiempo y plata."',
            '"El generador de propuestas de NEXUS me cerró proyectos de $5K+"',
          ].map((tweet, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 italic">
              {tweet}
              <button onClick={() => { navigator.clipboard.writeText(tweet); toast.success('Copiado!') }} className="text-xs text-violet-600 hover:text-violet-700 ml-2">
                <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Referrals */}
      <h2 className="font-semibold text-slate-900 mb-3">Referidos</h2>
      {referrals.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-slate-500">Todavía no tenés referidos. Compartí tu link y empezá a ganar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {referrals.map(r => (
            <div key={r.id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Usuario {r.referred_user_id?.slice(0, 8)}</p>
                <p className="text-xs text-slate-500">{formatDate(r.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                {r.commission_amount > 0 && (
                  <span className="text-sm font-semibold text-emerald-600">{formatCurrency(r.commission_amount)}</span>
                )}
                <span className={`badge ${r.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                  {r.status === 'paid' ? <><svg className="w-3.5 h-3.5 inline-block mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Pagado</> : 'Pendiente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
