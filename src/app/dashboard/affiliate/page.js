'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import AffiliatePromotionBanner from '@/components/AffiliatePromotionBanner'

export default function AffiliatePage() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ clicks: 0, conversions: 0, earnings: 0 })
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
        if (u?.id) loadStats(u.id, code)
      })
    } catch { setUser(null) }

    // Check if returning from Stripe Connect onboarding
    const params = new URLSearchParams(window.location.search)
    if (params.get('connect') === 'success') {
      toast.success('✅ Pagos automáticos configurados')
      setConnectReady(true)
      window.history.replaceState({}, '', '/dashboard/affiliate')
    }
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
    ? `https://ionexus.pro/api/affiliate/track?code=${affiliateCode}&landing=/register`
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
        <h1 className="text-2xl font-bold text-slate-900">🤝 Afiliados</h1>
        <p className="text-slate-500 mt-1">Compartí tu link y ganá comisiones automáticas</p>
      </div>

      {/* Promo semanal */}
      <AffiliatePromotionBanner />

      {/* Auto-payout CTA */}
      <div className={`card p-5 mb-6 flex items-center justify-between gap-4 border-2 ${connectReady ? 'border-emerald-200 bg-emerald-50' : 'border-violet-200 bg-violet-50'}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{connectReady ? '✅' : '💳'}</span>
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
            ) : '⚡ Configurar pagos'}
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
            {copied ? '✅ Copiado' : '📋 Copiar'}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="badge-info text-xs">25% comisión recurrente</span>
          <span className="badge-info text-xs">Cookies 30 días</span>
          <span className="badge-info text-xs">Pago automático</span>
          {connectReady && <span className="badge-success text-xs">✅ Stripe Connect activo</span>}
        </div>
      </div>

      {/* Share ideas */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-3">📢 Ideas para compartir</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            '"Este es el sistema que uso para manejar todos mis clientes. Recomendadísimo."',
            '"Dejé de usar 5 herramientas distintas y centralicé todo en NEXUS."',
            '"Si sos freelancer y no usás NEXUS, estás perdiendo tiempo y plata."',
            '"El generador de propuestas de NEXUS me cerró proyectos de $5K+"',
          ].map((tweet, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 italic">
              {tweet}
              <button onClick={() => { navigator.clipboard.writeText(tweet); toast.success('Copiado!') }} className="text-xs text-violet-600 hover:text-violet-700 ml-2">📋</button>
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
                  {r.status === 'paid' ? '✅ Pagado' : 'Pendiente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
