// ─────────────────────────────────────────────
// NEXUS — Inngest Client
// ─────────────────────────────────────────────
import { Inngest } from 'inngest'

export const inngest = new Inngest({
  id: 'nexus',
  name: 'NEXUS',
  // Retry failed jobs up to 3 times with exponential backoff
  retryFunction: (attempt) => ({
    delay: Math.min(1000 * 2 ** attempt, 30000), // 2s, 4s, 8s... max 30s
    maxAttempts: 3,
  }),
})
