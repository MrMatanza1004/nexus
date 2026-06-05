'use client'

import { useState, useEffect } from 'react'
import WhatsAppQR from '@/components/WhatsAppQR'
import WhatsAppBotRules from '@/components/WhatsAppBotRules'
import WhatsAppContacts from '@/components/WhatsAppContacts'
import WhatsAppSendMessage from '@/components/WhatsAppSendMessage'

const TABS = [
  { id: 'connect', label: 'Conexión' },
  { id: 'bot', label: 'Bot' },
  { id: 'contacts', label: 'Contactos' },
]

export default function WhatsAppPage() {
  const [sessionStatus, setSessionStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('connect')

  useEffect(() => {
    fetch('/api/whatsapp/session/status')
      .then(r => r.json())
      .then(data => {
        setSessionStatus(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const isConnected = sessionStatus?.status === 'connected'
  const availableTabs = isConnected ? TABS : TABS.filter(t => t.id === 'connect')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">WhatsApp</h1>
        <p className="text-slate-500 mt-1">Gestioná tu conexión de WhatsApp y el bot automatizado</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {availableTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'connect' && <WhatsAppQR />}
      {activeTab === 'bot' && <WhatsAppBotRules />}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <WhatsAppSendMessage />
          <WhatsAppContacts />
        </div>
      )}
    </div>
  )
}
