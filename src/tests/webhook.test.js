// ─────────────────────────────────────────────
// NEXUS — Stripe Webhook Tests
// ─────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock objects (hoisted so mock factories can reference them) ──
const mockStripe = vi.hoisted(() => ({
  webhooks: { constructEvent() { return JSON.parse('{}') } },
  accounts: { retrieve: () => ({ charges_enabled: true }) },
  transfers: { create: () => {} },
}))

const db = vi.hoisted(() => {
  const q = {}
  for (const m of ['from','select','insert','update','delete','upsert',
    'eq','in','neq','order','limit','range','gte','lte','single','maybeSingle']) {
    q[m] = () => q
  }
  q.then = undefined
  return q
})

const admin = vi.hoisted(() => ({
  updateUserById: () => Promise.resolve({ error: null }),
  getUserById: () => Promise.resolve({ data: { user: null }, error: null }),
  deleteUser: () => Promise.resolve({}),
  listUsers: () => Promise.resolve({ data: { users: [] } }),
}))

// ── Module mocks ──
function createMockStripe() { return mockStripe }
vi.mock('stripe', () => ({ default: createMockStripe }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: () => db, auth: { admin } }),
}))

vi.mock('@/data/affiliate-promotions', () => ({
  getCurrentPromotion: () => ({ type: 'none', value: 0 }),
}))

// ── Import AFTER mocks ──
const { POST } = await import('@/app/api/stripe/webhook/route')

// ── Test helpers ──
function makeEvent(type, obj = {}) {
  return { id: 'evt_test', type, data: { object: obj } }
}
function makeRequest(event, sig = 'test_sig') {
  return new Request('https://ionexus.pro/api/stripe/webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'stripe-signature': sig },
    body: JSON.stringify(event),
  })
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────
describe('Stripe Webhook', () => {
  beforeEach(() => {
    mockStripe.webhooks.constructEvent = (body) => JSON.parse(body)
  })

  describe('checkout.session.completed', () => {
    const baseSession = {
      id: 'cs_test', customer: 'cus_test', subscription: 'sub_test',
      metadata: { userId: 'u1', planType: 'pro' },
    }

    it('creates profile + updates user metadata', async () => {
      const res = await POST(makeRequest(makeEvent('checkout.session.completed', baseSession)))
      expect(res.status).toBe(200)
      expect((await res.json()).received).toBe(true)
    })

    it('handles affiliate referral', async () => {
      db.single = () => Promise.resolve({ data: { id: 'c1', status: 'pending' }, error: null })

      const res = await POST(makeRequest(makeEvent('checkout.session.completed', {
        ...baseSession,
        metadata: { ...baseSession.metadata, affiliateCode: 'REF123' },
        amount_total: 10000, currency: 'mxn',
      })))
      expect(res.status).toBe(200)
    })

    it('skips affiliate processing when no affiliateCode', async () => {
      // No affiliateCode in metadata — should not query conversions
      const res = await POST(makeRequest(makeEvent('checkout.session.completed', baseSession)))
      expect(res.status).toBe(200)
    })
  })

  describe('invoice.paid', () => {
    it('pays recurring commission with period dates', async () => {
      db.maybeSingle = () => Promise.resolve({ data: { id: 'u1' }, error: null })
      admin.getUserById = () => Promise.resolve({
        data: { user: { user_metadata: { referred_by: 'REF123' } } },
        error: null,
      })

      const res = await POST(makeRequest(makeEvent('invoice.paid', {
        subscription: 'sub_rec', amount_paid: 5000, currency: 'mxn',
        period_start: 1717000000, period_end: 1719600000,
      })))
      expect(res.status).toBe(200)
    })

    it('skips commission when profile not found', async () => {
      db.maybeSingle = () => Promise.resolve({ data: null, error: null })

      const res = await POST(makeRequest(makeEvent('invoice.paid', {
        subscription: 'sub_miss', amount_paid: 5000,
      })))
      expect(res.status).toBe(200)
    })

    it('skips commission when user has no referral', async () => {
      db.maybeSingle = () => Promise.resolve({ data: { id: 'u1' }, error: null })
      admin.getUserById = () => Promise.resolve({
        data: { user: { user_metadata: {} } }, error: null,
      })

      const res = await POST(makeRequest(makeEvent('invoice.paid', {
        subscription: 'sub_noaff', amount_paid: 5000,
      })))
      expect(res.status).toBe(200)
    })
  })

  describe('customer.subscription.deleted', () => {
    it('marks matching profiles as cancelled', async () => {
      db.from = () => {
        const chain = {}
        for (const m of ['select','insert','update','delete','upsert',
          'eq','in','neq','order','limit','range','gte','lte','single','maybeSingle']) {
          chain[m] = () => chain
        }
        chain.select = () => Promise.resolve({ data: [{ id: 'u1' }], error: null })
        return chain
      }

      const res = await POST(makeRequest(makeEvent('customer.subscription.deleted', {
        id: 'sub_cancel',
      })))
      expect(res.status).toBe(200)
    })
  })

  describe('account.updated', () => {
    it('syncs Stripe Connect account status', async () => {
      const res = await POST(makeRequest(makeEvent('account.updated', {
        id: 'acct_test', charges_enabled: true,
        metadata: { userId: 'u1' },
      })))
      expect(res.status).toBe(200)
    })
  })

  describe('error handling', () => {
    it('returns 400 on bad signature', async () => {
      mockStripe.webhooks.constructEvent = () => { throw new Error('bad sig') }
      const res = await POST(makeRequest(makeEvent('checkout.session.completed'), 'bad'))
      expect(res.status).toBe(400)
      expect((await res.json()).error).toContain('Webhook Error')
    })

    it('returns 500 when STRIPE_SECRET_KEY missing', async () => {
      const prev = process.env.STRIPE_SECRET_KEY
      process.env.STRIPE_SECRET_KEY = ''
      const res = await POST(makeRequest(makeEvent('checkout.session.completed')))
      expect(res.status).toBe(500)
      expect((await res.json()).error).toBe('Server configuration error')
      process.env.STRIPE_SECRET_KEY = prev
    })

    it('logs metadata update failure but still returns 200', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      admin.updateUserById = () => Promise.resolve({ error: new Error('DB fail') })

      const res = await POST(makeRequest(makeEvent('checkout.session.completed', {
        metadata: { userId: 'u1', planType: 'pro' },
      })))
      expect(res.status).toBe(200)
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })

    it('handles unhandled event types gracefully', async () => {
      const res = await POST(makeRequest(makeEvent('unknown.event.type', {})))
      expect(res.status).toBe(200)
    })
  })
})
