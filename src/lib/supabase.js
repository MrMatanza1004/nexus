import { createClient } from '@supabase/supabase-js'

let supabaseClient = null
let serviceClient = null

export function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return null
    supabaseClient = createClient(url, key)
  }
  return supabaseClient
}

export function getServiceSupabase() {
  if (!serviceClient) {
    serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }
  return serviceClient
}

// Proxy-based lazy init for convenient access in components
export const supabase = new Proxy({}, {
  get(_, prop) {
    const client = getSupabase()
    if (!client) return () => Promise.resolve({ data: null, error: null })
    return client[prop]
  }
})
