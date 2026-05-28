'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setName(data.user?.user_metadata?.full_name || '')
    })
  }, [])

  async function updateProfile(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    })
    if (error) toast.error(error.message)
    else toast.success('Perfil actualizado')
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">⚙️ Configuración</h1>

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

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Plan Actual</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900">Plan {user?.user_metadata?.plan_type === 'pro' ? 'Profesional' : user?.user_metadata?.plan_type === 'ai' ? 'Pro + AI' : 'Prueba Gratis'}</p>
            <p className="text-sm text-slate-500">Podés cambiar de plan cuando quieras</p>
          </div>
          <span className="badge-info">Activo</span>
        </div>
      </div>

      <div className="card p-6 border-red-200">
        <h2 className="font-semibold text-slate-900 mb-2">Cerrar Sesión</h2>
        <p className="text-sm text-slate-500 mb-4">Salir de tu cuenta de NEXUS</p>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2.5 rounded-lg transition-all">
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
