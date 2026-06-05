'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getAffiliateLink } from '@/lib/urls'

export function useAffiliate() {
  const [data, setData] = useState({
    code: null,
    link: '',
    totalReferrals: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
    activeReferrals: 0,
    payoutProgress: 0,
    loading: true,
  })

  useEffect(() => {
    loadAffiliateData()
  }, [])

  async function loadAffiliateData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setData(d => ({ ...d, loading: false }))
        return
      }

      const code = user.user_metadata?.affiliate_code
      if (!code) {
        setData(d => ({ ...d, loading: false }))
        return
      }

      const link = getAffiliateLink(code)

      // Get conversions
      const { data: conversions } = await supabase
        .from('affiliate_conversions')
        .select('*')
        .eq('affiliate_code', code)

      const total = conversions?.length || 0
      const active = conversions?.filter(c => c.status === 'active' || c.status === 'paid').length || 0
      const totalEarnings = conversions?.reduce((sum, c) => sum + Number(c.commission_amount || 0), 0) || 0

      // This month earnings
      const firstOfMonth = new Date()
      firstOfMonth.setDate(1)
      firstOfMonth.setHours(0, 0, 0, 0)
      const monthlyEarnings = conversions
        ?.filter(c => new Date(c.created_at) >= firstOfMonth)
        .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0) || 0

      // Progress toward next payout milestone ($50 = next milestone)
      const milestone = 50
      const progress = Math.min((totalEarnings % milestone) / milestone * 100, 100)

      setData({
        code,
        link,
        totalReferrals: total,
        monthlyEarnings,
        totalEarnings,
        activeReferrals: active,
        payoutProgress: progress,
        loading: false,
      })
    } catch {
      setData(d => ({ ...d, loading: false }))
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(data.link)
      return true
    } catch {
      return false
    }
  }

  return { ...data, copyLink }
}
