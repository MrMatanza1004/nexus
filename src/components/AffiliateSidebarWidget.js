'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAffiliate } from '@/hooks/useAffiliate'
import toast from 'react-hot-toast'

export default function AffiliateSidebarWidget() {
  const { code, link, totalReferrals, monthlyEarnings, totalEarnings, activeReferrals, payoutProgress, loading, copyLink } = useAffiliate()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const ok = await copyLink()
    if (ok) {
      setCopied(true)
      toast.success('Link de afiliado copiado 📋')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading || !code) return null

  return (
    <div className="border-t border-white/10 mt-6 pt-4 px-3">
      {/* Header with urgency */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          AFILIADOS
        </span>
        <Link href="/dashboard/affiliate" className="text-xs text-violet-400 hover:text-violet-300">
          Ver más →
        </Link>
      </div>

      {/* Earnings display */}
      <div className="bg-white/5 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-400">Ganado este mes</span>
          <span className="text-sm font-bold text-emerald-400">${monthlyEarnings.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Referidos activos</span>
          <span className="text-sm font-bold text-white">{activeReferrals}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Próximo hito: $50</span>
          <span>${(totalEarnings % 50).toFixed(0)} / $50</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${payoutProgress}%`,
              background: 'linear-gradient(90deg, #7c3aed, #f59e0b)',
            }}
          />
        </div>
      </div>

      {/* Urgency CTA */}
      <div className="bg-gradient-to-r from-amber-500/20 to-violet-500/20 rounded-lg p-2.5 mb-2">
        <p className="text-xs text-amber-300 font-semibold mb-2 text-center">
          ⏰ {activeReferrals < 3
            ? 'Referí 3 personas esta semana y ganá BONUS del 50%'
            : '¡Estás a un referido del siguiente nivel!'
          }
        </p>
        <div className="flex gap-1.5">
          <button
            onClick={handleCopy}
            className="flex-1 text-xs bg-amber-500 hover:bg-amber-600 text-white font-medium py-1.5 rounded transition-colors"
          >
            {copied ? '✅ Copiado' : '📋 Copiar Link'}
          </button>
          <Link
            href={`https://wa.me/?text=${encodeURIComponent('¡Unite a NEXUS y gestioná tu negocio freelance como un profesional! ' + link)}`}
            target="_blank"
            className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 rounded text-center transition-colors"
          >
            📱 WhatsApp
          </Link>
        </div>
      </div>

      {/* Social proof mini */}
      {totalReferrals > 0 && (
        <p className="text-xs text-slate-500 text-center">
          {totalReferrals} {totalReferrals === 1 ? 'persona se unió' : 'personas se unieron'} por tu link
        </p>
      )}
    </div>
  )
}
