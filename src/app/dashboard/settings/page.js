'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const PLANS = [
  { id: 'starter', name: 'Starter', price: '$199/mes', priceId: 'price_1TceAHIKNlA3QlU4l77jf9Lv', color: 'bg-slate-100 text-slate-700' },
  { id: 'pro', name: 'Profesional', price: '$599/mes', priceId: 'price_1TceALIKNlA3QlU4AQulK1AI', color: 'bg-violet-100 text-violet-700' },
  { id: 'ai', name: 'Pro + AI', price: '$999/mes', priceId: 'price_1TceAOIKNlA3QlU4FyCto5ie', color: 'bg-amber-100 text-amber-700' },
]

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(null) // 'cancel' | 'delete' | null
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  async function loadUserData() {
    let u
    try {
      const { data } = await supabase.auth.getUser()
      u = data?.user ?? null
    } catch { u = null }
    setUser(u)
    setName(u?.user_metadata?.full_name || '')

    if (u?.id) {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).single()
      setProfile(p)
    }
  }

  async function updateProfile(e) {
    e.preventDefault()
    setLoading(true)
    let error
    try {
      const res = await supabase.auth.updateUser({ data: { full_name: name } })
      error = res.error
    } catch { error = { message: 'Error de conexión' } }
    if (error) toast.error(error.message)
    else toast.success('Perfil actualizado')
    setLoading(false)
  }

  async function handleCheckout(planId, priceId) {
    setCheckoutLoading(planId)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          affiliateCode: user?.user_metadata?.affiliate_code || '',
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error || 'Error al crear pago')
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally { setCheckoutLoading(null) }
  }

  async function openBillingPortal() {
    const customerId = profile?.stripe_customer_id
    if (!customerId) return toast.error('No tenés un customer ID asociado. Contactá a soporte.')

    try {
      const res = await fetch('/api/stripe/portal-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.href,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error || 'Error al abrir portal')
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  async function handleLogout() {
    try { await supabase.auth.signOut(); toast.success('Sesión cerrada'); router.push('/') } catch {}
  }

  const currentPlan = user?.user_metadata?.plan_type || 'trial'
  const planLabel = currentPlan === 'pro' ? 'Profesional' : currentPlan === 'ai' ? 'Pro + AI' : currentPlan === 'starter' ? 'Starter' : 'Prueba Gratis'
  const hasSubscription = !!profile?.stripe_subscription_id

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">⚙️ Configuración</h1>

      {/* Plan / Subscription */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Suscripción</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-slate-900 text-lg">Plan {planLabel}</p>
            <p className="text-sm text-slate-500">
              {hasSubscription
                ? 'Suscripción activa — podés gestionar tu plan desde el portal de Stripe'
                : 'Todavía no tenés una suscripción activa'}
            </p>
          </div>
          <span className={`badge ${hasSubscription ? 'badge-success' : 'badge-warning'}`}>
            {hasSubscription ? '✅ Activo' : 'Sin suscripción'}
          </span>
        </div>

        {hasSubscription ? (
          <div className="space-y-3">
            <button onClick={openBillingPortal} className="btn-primary w-full flex items-center justify-center gap-2">
              💳 Gestionar Suscripción
            </button>
            <button
              onClick={() => setShowConfirm('cancel')}
              className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 font-medium px-6 py-2.5 rounded-lg transition-all text-sm"
            >
              Cancelar Suscripción
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Elegí un plan para activar tu suscripción:</p>
            <div className="grid gap-3">
              {PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => handleCheckout(plan.id, plan.priceId)}
                  disabled={checkoutLoading !== null}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-violet-500 hover:bg-violet-50 transition-all disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${plan.color} flex items-center justify-center font-bold text-sm`}>
                      {plan.id === 'starter' ? 'S' : plan.id === 'pro' ? 'P' : 'AI'}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">{plan.name}</p>
                      <p className="text-sm text-slate-500">{plan.price}</p>
                    </div>
                  </div>
                  <span className="text-violet-600 font-semibold text-sm flex items-center gap-1">
                    {checkoutLoading === plan.id ? (
                      <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Procesando...</>
                    ) : 'Suscribirse →'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Tu Perfil</h2>
        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={user?.email || ''} disabled className="input-field bg-slate-50 text-slate-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Código de afiliado</label>
            <input type="text" value={user?.user_metadata?.affiliate_code || ''} disabled className="input-field bg-slate-50 text-slate-400 font-mono" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Guardando...' : 'Guardar Cambios'}</button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 border-red-200 space-y-4">
        <h2 className="font-semibold text-red-700">⚠️ Zona de Peligro</h2>

        {/* Cancel Subscription Confirmation */}
        {showConfirm === 'cancel' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800 mb-3">
              ¿Estás seguro de que querés cancelar tu suscripción? Vas a perder acceso a las funciones premium al final del período facturado.
            </p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  setCancelling(true)
                  try {
                    const res = await fetch('/api/stripe/cancel-subscription', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        subscriptionId: profile?.stripe_subscription_id,
                      }),
                    })
                    const data = await res.json()
                    if (data.error) toast.error(data.error)
                    else {
                      toast.success('Suscripción cancelada. Seguís teniendo acceso hasta fin de período.')
                      setShowConfirm(null)
                      loadUserData()
                    }
                  } catch (err) {
                    toast.error('Error al cancelar: ' + err.message)
                  }
                  setCancelling(false)
                }}
                disabled={cancelling}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-60"
              >
                {cancelling ? 'Cancelando...' : 'Sí, cancelar suscripción'}
              </button>
              <button onClick={() => setShowConfirm(null)} className="text-sm text-slate-600 hover:text-slate-800 font-medium px-4 py-2">
                No, volver
              </button>
            </div>
          </div>
        )}

        {/* Delete Account Confirmation */}
        {showConfirm === 'delete' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800 mb-2">
              ¿Estás seguro de que querés <strong>eliminar tu cuenta permanentemente</strong>?
            </p>
            <p className="text-xs text-red-600 mb-3">
              Esta acción eliminará todos tus datos: tareas, clientes, proyectos, facturas, contratos, archivos y más. No se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  setDeleting(true)
                  try {
                    const res = await fetch('/api/account/delete', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: user?.id }),
                    })
                    const data = await res.json()
                    if (data.error) toast.error(data.error)
                    else {
                      toast.success('Cuenta eliminada.')
                      await supabase.auth.signOut()
                      router.push('/')
                    }
                  } catch (err) {
                    toast.error('Error: ' + err.message)
                  }
                  setDeleting(false)
                }}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-60"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
              </button>
              <button onClick={() => setShowConfirm(null)} className="text-sm text-slate-600 hover:text-slate-800 font-medium px-4 py-2">
                No, conservar cuenta
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {hasSubscription && !showConfirm && (
            <button
              onClick={() => setShowConfirm('cancel')}
              className="border-2 border-red-200 text-red-600 hover:bg-red-50 font-medium px-6 py-2.5 rounded-lg transition-all text-sm"
            >
              Cancelar Suscripción
            </button>
          )}
          {!showConfirm && (
            <button
              onClick={() => setShowConfirm('delete')}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2.5 rounded-lg transition-all text-sm"
            >
              Eliminar Cuenta
            </button>
          )}
          <button onClick={handleLogout} className="border-2 border-slate-300 text-slate-600 hover:bg-slate-50 font-medium px-6 py-2.5 rounded-lg transition-all text-sm">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}
