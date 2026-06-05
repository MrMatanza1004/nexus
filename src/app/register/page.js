'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import OAuthButtons from '@/components/OAuthButtons'
import Logo from '@/components/Logo'
import { generateAffiliateCode } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 🔥 Capturar código de referido desde URL y setear cookie
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const refFromUrl = params.get('ref')
    if (refFromUrl) {
      document.cookie = `nexus_ref=${refFromUrl}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
    }
  }, [])

  async function handleRegister(e) {
    e.preventDefault()
    if (!acceptTerms) {
      toast.error('Debés aceptar los Términos de Servicio y la Política de Privacidad')
      setLoading(false)
      return
    }
    setLoading(true)

    // Validar que el dominio del email tenga MX records (frena emails truchos)
    const domain = email.split('@')[1]
    if (domain) {
      try {
        const m = await fetch(`/api/auth/validate-email?email=${encodeURIComponent(email)}`)
        const r = await m.json()
        if (!r.valid) {
          toast.error('El email no parece válido — usá una dirección de correo real')
          setLoading(false)
          return
        }
      } catch {
        // Si falla la validación, dejamos pasar (mejor falso positivo que bloquear a un usuario real)
        console.warn('Email validation skipped — network error')
      }
    }

    const ref = document.cookie.split('; ').find(r => r.startsWith('nexus_ref='))
    const referredBy = ref ? ref.split('=')[1] : null

    let data, error
    try {
      const res = await supabase.auth.signUp({
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
      data = res.data
      error = res.error
    } catch {
      error = { message: 'Error de conexión con el servidor de autenticación' }
    }

    if (error) {
      toast.error(error.message)
      setLoading(false)
      // Even on error, the user might have been created (e.g. email failed)
      // If we have a userId, try to auto-confirm
      if (data?.user?.id) {
        console.warn('SignUp had error but user was created:', error.message)
        fetch('/api/auth/auto-confirm', {
          method: 'POST',
          body: JSON.stringify({ userId: data.user.id }),
        }).catch(() => {})
      }
      return
    }

    const userId = data?.user?.id
    if (!userId) {
      console.warn('Signup returned no user — may need email confirmation')
      toast.success('Revisá tu email para confirmar tu cuenta.')
      setLoading(false)
      return
    }

    if (referredBy) {
      supabase.from('affiliate_conversions').insert({
        affiliate_code: referredBy,
        referred_user_id: userId,
        commission_amount: 0,
        status: 'pending',
      }).catch(() => {})
    }

    // Auto-confirm user synchronously so they CAN sign in
    try {
      const confirmRes = await fetch('/api/auth/auto-confirm', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      })
      if (!confirmRes.ok) {
        const errData = await confirmRes.json().catch(() => ({}))
        console.error('Auto-confirm failed:', confirmRes.status, errData)
        toast.error('Error al confirmar cuenta. Contactá a soporte.')
        setLoading(false)
        return
      }
    } catch (err) {
      console.error('Auto-confirm network error:', err)
      toast.error('Error de conexión al confirmar cuenta.')
      setLoading(false)
      return
    }

    toast.success('Cuenta creada! Ya podés iniciar sesión.')
    setLoading(false)
    setTimeout(() => router.push('/login'), 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Logo />
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
          <label className="flex items-start gap-3 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={e => setAcceptTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            <span>
              Acepto los <a href="/terms" target="_blank" className="text-violet-600 underline">Términos de Servicio</a>,
              el <a href="/privacy" target="_blank" className="text-violet-600 underline">Aviso Legal y Política de Privacidad</a>,
              y <strong>otorgo mi consentimiento expreso</strong> para recibir comunicaciones comerciales y promocionales
              de NEXUS y sus proyectos asociados.
            </span>
          </label>
          <button type="submit" disabled={loading || !acceptTerms} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Creando cuenta...' : 'Comenzar mi Prueba Gratis'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-500">o registrate con</span>
          </div>
        </div>

        <OAuthButtons />

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
