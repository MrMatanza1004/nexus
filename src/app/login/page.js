'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Bienvenido de vuelta')
    router.push('/dashboard')
  }

  async function handleMagicLink() {
    if (!email) {
      toast.error('Ingresá tu email primero')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Te enviamos un magic link a tu email')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-xl text-slate-900">NEXUS</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h1>
          <p className="text-slate-500 mt-2">Bienvenido de vuelta a tu centro de operaciones</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-500">o</span>
          </div>
        </div>

        <button onClick={handleMagicLink} disabled={loading} className="w-full border-2 border-slate-200 hover:border-violet-300 text-slate-700 font-medium py-3 rounded-lg transition-all">
          Enviar Magic Link
        </button>

        <p className="text-center text-sm text-slate-500 mt-6">
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="text-violet-600 font-semibold hover:text-violet-700">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  )
}
