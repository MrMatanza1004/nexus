'use client'

import { useState, useEffect, useRef } from 'react'
import { socialProofsBarajados } from '@/data/social-proof'

export default function SocialProof() {
  const [event, setEvent] = useState(null)
  const [animClass, setAnimClass] = useState('social-proof-enter')
  const indexRef = useRef(0)
  const eventsRef = useRef(socialProofsBarajados)

  useEffect(() => {
    // Mostrar el primero inmediatamente
    const first = eventsRef.current[0]
    setEvent(first)
    indexRef.current = 1

    const interval = setInterval(() => {
      // Fade out
      setAnimClass('social-proof-exit')

      setTimeout(() => {
        const idx = indexRef.current % eventsRef.current.length
        setEvent(eventsRef.current[idx])
        indexRef.current = idx + 1
        setAnimClass('social-proof-enter')
      }, 300) // 300ms de transición
    }, 2000) // 2 segundos por reseña

    return () => clearInterval(interval)
  }, [])

  if (!event) return null

  return (
    <div className={`fixed bottom-6 left-6 z-50 max-w-sm ${animClass}`}>
      <div className="card p-4 flex items-center gap-3 shadow-lg border-violet-200">
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
          {event.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">
            {event.name}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {event.action}
          </p>
          <p className="text-xs text-violet-500">
            📍 {event.location}
          </p>
        </div>
      </div>
    </div>
  )
}
