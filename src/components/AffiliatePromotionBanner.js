'use client'

import { useState, useEffect, useCallback } from 'react'

function useCountdown(targetMs) {
  const [remaining, setRemaining] = useState(null)

  useEffect(() => {
    if (!targetMs) return

    function tick() {
      const diff = targetMs - Date.now()
      if (diff <= 0) {
        setRemaining(0)
        return
      }
      setRemaining(diff)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [targetMs])

  return remaining
}

function formatCountdown(ms) {
  if (ms === null) return null
  if (ms <= 0) return 'Terminado'

  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
  return `${minutes}m ${secs}s`
}

const icons = {
  commission_boost: '🔥',
  fixed_bonus: '💰',
  tier_bonus: '🏆',
  double_plan: '🎯',
  free_access: '🎟',
  contest: '🥇',
  special: '🎊',
}

const labels = {
  commission_boost: (p) => `+${p.bonus}% extra`,
  fixed_bonus: (p) => `+$${p.bonus} por referido`,
  tier_bonus: (p) => `Hasta $${p.value} de bonus`,
  double_plan: (p) => `${p.value}% comisión`,
  free_access: (p) => `$${p.value} en acceso gratis`,
  contest: (p) => `Ganá $${p.value}`,
  special: (p) => `${p.value}% comisión`,
}

export default function AffiliatePromotionBanner() {
  const [promo, setPromo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/affiliate/promotions')
      .then(r => r.json())
      .then(data => {
        if (data && data.title) {
          setPromo(data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const countdown = useCountdown(promo?.endsAt)

  if (loading || !promo) return null

  const slotsLeft = promo.slotsRemaining
  const isLowStock = slotsLeft <= 10 && slotsLeft > 0
  const isExpiring = countdown !== null && countdown > 0 && countdown < 86400000 // < 24h

  return (
    <div className={`rounded-xl bg-gradient-to-r ${promo.color} p-[1px] mb-6`}>
      <div className="rounded-xl bg-white px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-2xl shrink-0 mt-0.5">{icons[promo.type] || '🎯'}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-sm">{promo.title}</h3>
                <span className="bg-violet-100 text-violet-700 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                  Semana {promo.week}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">{promo.desc}</p>

              {/* Urgency row: countdown + slots */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {/* Countdown */}
                {countdown !== null && countdown > 0 && (
                  <span className={`inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${isExpiring ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatCountdown(countdown)}
                  </span>
                )}

                {/* Slots remaining */}
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${isLowStock ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {slotsLeft > 0 ? `Quedan ${slotsLeft} cupos` : 'Cupos agotados'}
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="inline-block bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
              {labels[promo.type] ? labels[promo.type](promo) : 'Activo'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
