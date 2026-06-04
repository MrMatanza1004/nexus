'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAffiliate } from '@/hooks/useAffiliate'
import toast from 'react-hot-toast'
import { Handshake, Copy, ExternalLink, Users, DollarSign, TrendingUp, Clock, UserPlus } from 'lucide-react'

function useCountdown(targetMs) {
  const [remaining, setRemaining] = useState(null)

  useEffect(() => {
    if (!targetMs) return

    function tick() {
      const diff = targetMs - Date.now()
      if (diff <= 0) { setRemaining(0); return }
      setRemaining(diff)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [targetMs])

  return remaining
}

function formatCountdownShort(ms) {
  if (ms === null) return null
  if (ms <= 0) return null

  const totalSec = Math.floor(ms / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60

  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m ${secs}s`
}

export default function AffiliateDashboardCard() {
  const { code, link, totalReferrals, monthlyEarnings, totalEarnings, activeReferrals, loading, copyLink } = useAffiliate()
  const [copied, setCopied] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [promo, setPromo] = useState(null)

  useEffect(() => {
    if (dismissed) return
    const timer = setTimeout(() => setDismissed(true), 35000)
    return () => clearTimeout(timer)
  }, [dismissed])

  // Fetch current promotion stats
  useEffect(() => {
    fetch('/api/affiliate/promotions')
      .then(r => r.json())
      .then(data => { if (data && data.title) setPromo(data) })
      .catch(() => {})
  }, [])

  const countdown = useCountdown(promo?.endsAt)
  const slotsLeft = promo?.slotsRemaining ?? 0
  const isLowStock = slotsLeft <= 10 && slotsLeft > 0
  const isExpiring = countdown !== null && countdown > 0 && countdown < 86400000

  async function handleCopy() {
    const ok = await copyLink()
    if (ok) {
      setCopied(true)
      toast.success('Link de afiliado copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading || !code || dismissed) return null

  return (
    <div className="card p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-500/10 rounded-full blur-xl pointer-events-none" />

      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 z-10"
        title="Cerrar"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
            <Handshake className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Programa de Afiliados</h3>
            <p className="text-xs text-slate-500">Ganá 25% recurrente por cada referral</p>
          </div>
        </div>

        {/* Urgency banner - real data */}
        {promo && (
          <div className={`rounded-lg p-3 mb-4 border ${isExpiring || isLowStock ? 'bg-red-50 border-red-200' : 'bg-violet-50 border-violet-200'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">
                  {isExpiring ? '⏰' : isLowStock ? '⚡' : '🔥'}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{promo.title}</p>
                  <p className="text-xs text-slate-500">{promo.desc}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                {countdown !== null && countdown > 0 && (
                  <span className={`text-xs font-mono font-bold ${isExpiring ? 'text-red-600' : 'text-violet-600'}`}>
                    {formatCountdownShort(countdown)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              {countdown !== null && countdown > 0 && (
                <span className={`text-xs font-semibold flex items-center gap-1 ${isExpiring ? 'text-red-500' : 'text-slate-500'}`}>
                  <Clock className="w-3 h-3" />
                  {isExpiring ? 'Termina pronto' : `${formatCountdownShort(countdown)} restantes`}
                </span>
              )}
              {slotsLeft > 0 && (
                <span className={`text-xs font-semibold flex items-center gap-1 ${isLowStock ? 'text-orange-500' : 'text-slate-500'}`}>
                  <UserPlus className="w-3 h-3" />
                  {isLowStock ? `Solo quedan ${slotsLeft} cupos` : `${slotsLeft} cupos disponibles`}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-violet-50 rounded-lg p-3 text-center">
            <DollarSign className="w-4 h-4 text-violet-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-violet-600">${monthlyEarnings.toFixed(0)}</p>
            <p className="text-xs text-violet-700">Este mes</p>
          </div>
          <div className="bg-violet-50 rounded-lg p-3 text-center">
            <Users className="w-4 h-4 text-violet-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-violet-600">{activeReferrals}</p>
            <p className="text-xs text-violet-700">Activos</p>
          </div>
          <div className="bg-violet-50 rounded-lg p-3 text-center">
            <TrendingUp className="w-4 h-4 text-violet-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-violet-600">${totalEarnings.toFixed(0)}</p>
            <p className="text-xs text-violet-700">Total</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copiado' : 'Copiar mi link'}
          </button>
          <Link
            href="/dashboard/affiliate"
            className="border-2 border-violet-200 hover:border-violet-400 text-violet-700 font-medium py-2.5 px-4 rounded-lg transition-all text-sm flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
