'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { generateAffiliateCode } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)

    const ref = document.cookie.split('; ').find(r => r.startsWith('nexus_ref='))
    const referredBy = ref ? ref.split('=')[1] : null

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          affiliate_code: generateAffiliateCode(),
          referred_by: referredBy,
          plan_type: 'trial',
        },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (referredBy) {
      await supabase.from('affiliate_conversions').insert({
        affiliate_code: referredBy,
        referred_user_id: data.user.id,
        commission_amount: 0,
        status: 'pending',
      })
    }

    fetch('/api/email/send-welcome', {
      method: 'POST',
      body: JSON.stringify({ email, name: fullName }),
    }).catch(() => {})

    toast.success('Cuenta creada! Revisá tu email para confirmar.')
    router.push('/login')
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
          <h1 className="text-2xl font-bold text-slate-900">Crear tu Cuenta</h1>
          <p className="text-slate-500 mt-2">7 días gratis, sin compromiso</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="input-field"
              placeholder="Tu nombre"
              required
            />
          </div>
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
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creando cuenta...' : 'Comenzar mi Prueba Gratis'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          Al registrarte, aceptás nuestros Términos y Condiciones
        </p>

        <p className="text-center text-sm text-slate-500 mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-violet-600 font-semibold hover:text-violet-700">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
