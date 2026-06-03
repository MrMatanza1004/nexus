// ─────────────────────────────────────────────
// NEXUS — Inngest API Route (Next.js App Router)
// ─────────────────────────────────────────────
import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { dailyCron } from '@/inngest/functions'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [dailyCron],
})
