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

// Proxy-based lazy init for convenient access in components.
// Returns null-safe stubs at any depth to prevent "is not a function" crashes
// when env vars are unavailable (build cache, SSR, etc.)
function createNullStub() {
  return new Proxy(() => Promise.resolve({ data: null, error: null }), {
    get(target, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return target[prop]
      }
      return createNullStub()
    }
  })
}

export const supabase = new Proxy({}, {
  get(_, prop) {
    const client = getSupabase()
    if (!client) return createNullStub()
    return client[prop]
  }
})
