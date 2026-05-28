'use client'

import { useState, useEffect } from 'react'

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) {
        setExpired(true)
        return
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }

    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (expired) return null

  return (
    <div className="countdown-active inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
      <span className="text-amber-700 font-bold text-lg">⏰</span>
      <span className="text-amber-800 font-semibold">Oferta expira en:</span>
      <span className="text-amber-700 font-mono font-bold tabular-nums">
        {String(timeLeft.days).padStart(2, '0')}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </div>
  )
}
