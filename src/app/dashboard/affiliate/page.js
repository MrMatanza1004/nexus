'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AffiliatePage() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ clicks: 0, conversions: 0, earnings: 0 })
  const [referrals, setReferrals] = useState([])
  const [copied, setCopied] = useState(false)
  const [affiliateCode, setAffiliateCode] = useState('')

  useEffect(() => {
    try {
      supabase.auth.getUser().then(({ data }) => {
        setUser(data?.user ?? null)
        const code = data?.user?.user_metadata?.affiliate_code
        setAffiliateCode(code || '')
        if (data?.user?.id) loadStats(data.user.id, code)
      })
    } catch {
      setUser(null)
    }
  }, [])

  async function loadStats(userId, code) {
    const [clickRes, convRes] = await Promise.all([
      supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }).eq('affiliate_code', code),
      supabase.from('affiliate_conversions').select('*').eq('affiliate_code', code),
    ])
    const conversions = convRes.data || []
    const earnings = conversions.filter(c => c.status === 'paid').reduce((s, c) => s + Number(c.commission_amount || 0), 0)
    setStats({
      clicks: clickRes.count || 0,
      conversions: conversions.length,
      earnings,
    })
    setReferrals(conversions)
  }

  const affiliateLink = `${window.location.origin}/register?ref=${affiliateCode}`

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
        <p className="text-slate-500 mt-1">Compartí tu link y ganá 25% recurrente por cada referido</p>
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
        <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
          <span className="badge-info">25% comisión recurrente</span>
          <span className="badge-info">Cookies de 30 días</span>
          <span className="badge-info">Sin límite</span>
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
              "{tweet}"
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
              <span className={`badge ${r.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                {r.status === 'paid' ? 'Pagado' : 'Pendiente'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
