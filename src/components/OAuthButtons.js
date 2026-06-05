'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const providers = [
  {
    id: 'github',
    name: 'GitHub',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
    color: 'bg-[#24292f] hover:bg-[#1b1f23]',
  },
  {
    id: 'google',
    name: 'Google',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.456 10.275c.01.216.015.434.015.654 0 4.443-3.024 7.583-7.513 7.583-4.386 0-7.958-3.572-7.958-7.958S5.57 2.596 7.958 2.596c2.12 0 3.997.785 5.447 2.268l-2.168 2.083c-.862-.83-1.96-1.225-3.279-1.225-2.684 0-4.864 2.18-4.864 4.864s2.18 4.864 4.864 4.864c2.479 0 3.96-1.317 4.368-3.036h-4.368V10.28h7.404c.038.001.073.004.108.006.007.044.012.088.012.133z" />
      </svg>
    ),
    color: 'bg-[#db4437] hover:bg-[#c53929]',
  },
]

export default function OAuthButtons() {
  const [loading, setLoading] = useState(null)

  async function handleOAuthSignIn(provider) {
    setLoading(provider)
    try {
      const redirectTo = process.env.NEXT_PUBLIC_SITE_URL
        || process.env.NEXT_PUBLIC_APP_URL
        || window.location.origin
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${redirectTo.replace(/\/$/, '')}/auth/callback`,
        },
      })
      if (error) {
        toast.error(error.message)
        setLoading(null)
      }
    } catch {
      toast.error('Error al conectar con el proveedor')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {providers.map((p) => (
        <button
          key={p.id}
          onClick={() => handleOAuthSignIn(p.id)}
          disabled={loading !== null}
          className={`w-full flex items-center justify-center gap-3 text-white font-medium py-3 rounded-lg transition-all ${p.color} disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {loading === p.id ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            p.icon
          )}
          {loading === p.id ? 'Conectando...' : `Continuar con ${p.name}`}
        </button>
      ))}
    </div>
  )
}
