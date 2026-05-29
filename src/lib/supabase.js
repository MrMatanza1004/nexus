import { createClient } from '@supabase/supabase-js'

let supabaseClient = null
let serviceClient = null

function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return null
    supabaseClient = createClient(url, key)
  }
  return supabaseClient
}

function getServiceSupabase() {
  if (!serviceClient) {
    serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }
  return serviceClient
}

// Safe wrappers that never throw — return null data instead
export async function safeGetSession() {
  try {
    const client = getSupabase()
    if (!client) return { data: { session: null }, error: null }
    const { data, error } = await client.auth.getSession()
    if (error) return { data: { session: null }, error }
    return { data, error: null }
  } catch {
    return { data: { session: null }, error: null }
  }
}

export async function safeGetUser() {
  try {
    const client = getSupabase()
    if (!client) return { data: { user: null }, error: null }
    const { data, error } = await client.auth.getUser()
    if (error) return { data: { user: null }, error }
    return { data, error: null }
  } catch {
    return { data: { user: null }, error: null }
  }
}

export async function safeSignOut() {
  try {
    const client = getSupabase()
    if (!client) return { error: null }
    return await client.auth.signOut()
  } catch {
    return { error: null }
  }
}

export function onAuthChange(callback) {
  try {
    const client = getSupabase()
    if (!client) {
      callback(null)
      return { subscription: { unsubscribe: () => {} } }
    }
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null)
    })
    return { subscription }
  } catch {
    callback(null)
    return { subscription: { unsubscribe: () => {} } }
  }
}

export const supabase = new Proxy({}, {
  get(_, prop) {
    const client = getSupabase()
    if (!client) {
      // Return a function that resolves to empty data for any call
      const stub = (...args) => Promise.resolve({ data: null, error: null })
      // Make nested property access safe
      stub.auth = { getSession: stub, getUser: stub, signOut: stub, onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), signInWithPassword: stub, signUp: stub, signInWithOtp: stub, updateUser: stub }
      stub.from = () => ({ select: stub, insert: stub, update: stub, delete: stub, eq: stub, order: stub, limit: stub, gte: stub, lte: stub })
      stub.storage = { from: () => ({ upload: stub, getPublicUrl: stub, list: stub, remove: stub }) }
      return stub
    }
    return client[prop]
  }
})
