'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const fakeEvents = [
  { name: 'María G.', action: 'acaba de crear su primer proyecto', location: 'Argentina' },
  { name: 'Carlos R.', action: 'generó una propuesta de $2,500', location: 'México' },
  { name: 'Ana L.', action: 'registró un nuevo cliente', location: 'Colombia' },
  { name: 'Juan P.', action: 'facturó $1,200 este mes', location: 'España' },
  { name: 'Sofía M.', action: 'completó 5 tareas hoy', location: 'Chile' },
  { name: 'Diego F.', action: 'actualizó su portafolio', location: 'Perú' },
  { name: 'Valentina C.', action: 'firmó un contrato nuevo', location: 'México' },
  { name: 'Andrés G.', action: 'alcanzó su meta mensual', location: 'Argentina' },
]

export default function SocialProof() {
  const [event, setEvent] = useState(null)
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const showEvent = () => {
      const e = fakeEvents[index % fakeEvents.length]
      setEvent(e)
      setVisible(true)
      setIndex(i => i + 1)

      setTimeout(() => setVisible(false), 4000)
    }

    showEvent()
    const interval = setInterval(showEvent, 15000)

    return () => clearInterval(interval)
  }, [index])

  if (!event) return null

  return (
    <div className={`fixed bottom-6 left-6 z-50 max-w-sm ${visible ? 'social-proof-enter' : 'social-proof-exit pointer-events-none'}`}>
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
