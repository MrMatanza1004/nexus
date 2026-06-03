'use client'

import { useState, useEffect } from 'react'
import { getCurrentPromotion } from '@/data/affiliate-promotions'

export default function AffiliatePromotionBanner() {
  const [promo, setPromo] = useState(null)

  useEffect(() => {
    setPromo(getCurrentPromotion())
  }, [])

  if (!promo) return null

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
    commission_boost: `+${promo.bonus}% extra`,
    fixed_bonus: `+$${promo.bonus} por referido`,
    tier_bonus: `Hasta $${promo.value} de bonus`,
    double_plan: `${promo.value}% comisión`,
    free_access: `$${promo.value} en acceso gratis`,
    contest: `Ganá $${promo.value}`,
    special: `${promo.value}% comisión`,
  }

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
            </div>
          </div>
          <div className="shrink-0">
            <span className="inline-block bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
              {labels[promo.type]}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
