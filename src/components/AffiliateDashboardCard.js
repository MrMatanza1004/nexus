'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAffiliate } from '@/hooks/useAffiliate'
import toast from 'react-hot-toast'
import { Handshake, Copy, ExternalLink, Users, DollarSign, TrendingUp } from 'lucide-react'

export default function AffiliateDashboardCard() {
  const { code, link, totalReferrals, monthlyEarnings, totalEarnings, activeReferrals, loading, copyLink } = useAffiliate()
  const [copied, setCopied] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return
    const timer = setTimeout(() => setDismissed(true), 30000)
    return () => clearTimeout(timer)
  }, [dismissed])

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
