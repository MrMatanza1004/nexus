'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const priceIds = {
  starter: 'price_1TceAHIKNlA3QlU4l77jf9Lv',
  pro: 'price_1TceALIKNlA3QlU4AQulK1AI',
  ai: 'price_1TceAOIKNlA3QlU4FyCto5ie',
}

export default function PricingCheckout({ planId, label, featured = false }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null)).catch(() => {})
  }, [])

  async function handleClick() {
    if (!user) { router.push('/register'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceIds[planId],
          userId: user.id,
          affiliateCode: user?.user_metadata?.affiliate_code || '',
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error || 'Error al procesar el pago')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`text-center font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
        featured
          ? 'btn-primary'
          : 'border border-zinc-700 text-zinc-300 hover:border-violet-600 hover:text-violet-400'
      }`}
    >
      {loading ? (
        <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Procesando...</>
      ) : (
        label
      )}
    </button>
  )
}
