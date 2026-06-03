'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAffiliate } from '@/hooks/useAffiliate'
import toast from 'react-hot-toast'

export default function AffiliateDashboardCard() {
  const { code, link, totalReferrals, monthlyEarnings, totalEarnings, activeReferrals, loading, copyLink } = useAffiliate()
  const [copied, setCopied] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Auto-dismiss after 30 seconds if user doesn't interact
  useEffect(() => {
    if (dismissed) return
    const timer = setTimeout(() => setDismissed(true), 30000)
    return () => clearTimeout(timer)
  }, [dismissed])

  async function handleCopy() {
    const ok = await copyLink()
    if (ok) {
      setCopied(true)
      toast.success('Link de afiliado copiado al portapapeles 🚀')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading || !code || dismissed) return null

  const referralsNeeded = Math.max(0, 5 - activeReferrals)

  return (
    <div className="card p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-violet-500/5 to-transparent pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Dismiss button */}
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
        {/* Urgency header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🤝</span>
          <div>
            <h3 className="font-bold text-slate-900">Ganá con NEXUS</h3>
            <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {referralsNeeded > 0
                ? `Referí ${referralsNeeded} más y desbloqueá BONUS del 50%`
                : '🎉 Bonus activo — 50% extra en comisiones'}
            </p>
          </div>
        </div>

        {/* Stats mini-grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-amber-600">${monthlyEarnings.toFixed(0)}</p>
            <p className="text-xs text-amber-700">Este mes</p>
          </div>
          <div className="bg-violet-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-violet-600">{activeReferrals}</p>
            <p className="text-xs text-violet-700">Activos</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-emerald-600">${totalEarnings.toFixed(0)}</p>
            <p className="text-xs text-emerald-700">Total</p>
          </div>
        </div>

        {/* Countdown urgency */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-lg p-3 mb-3 text-center">
          <p className="text-white text-xs font-semibold mb-1">
            ⏰ OFERTA POR TIEMPO LIMITADO
          </p>
          <p className="text-white/90 text-sm font-bold">
            {referralsNeeded > 0
              ? `${referralsNeeded} referido${referralsNeeded > 1 ? 's' : ''} más = BONUS del 50% en todas tus comisiones`
              : '🎉 ¡Bonus activo! Cada referido te da 50% más'}
          </p>
          <div className="mt-2 bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (activeReferrals / 5) * 100)}%` }}
            />
          </div>
          <p className="text-white/70 text-xs mt-1">{activeReferrals}/5 referidos</p>
        </div>

        {/* Copy link CTA */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
          >
            {copied ? '✅ Copiado' : '📋 Copiar mi link'}
          </button>
          <Link
            href="/dashboard/affiliate"
            className="border-2 border-violet-200 hover:border-violet-400 text-violet-700 font-medium py-2.5 px-4 rounded-lg transition-all text-sm"
          >
            Dashboard →
          </Link>
        </div>
      </div>
    </div>
  )
}
