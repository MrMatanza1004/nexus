// ─────────────────────────────────────────────
// NEXUS — Feature Flags
// ─────────────────────────────────────────────
// All flags default to false unless explicitly enabled via env vars.
// This allows safe gradual rollouts without redeploying.

const flags = {
  // ═══ Product Features ═══
  /** Enable new multi-step onboarding flow */
  new_onboarding: process.env.FLAG_NEW_ONBOARDING === '1',
  /** Enable AI-powered proposal generation */
  ai_proposals: process.env.FLAG_AI_PROPOSALS === '1',
  /** Show experimental dashboard metrics v2 */
  metrics_v2: process.env.FLAG_METRICS_V2 === '1',

  // ═══ Infrastructure ═══
  /** Use Inngest for background jobs (vs direct API) */
  inngest_background_jobs: process.env.FLAG_INNGEST === '1' || true, // default on
  /** Log all API responses to console */
  debug_logging: process.env.FLAG_DEBUG === '1',

  // ═══ Affiliate ═══
  /** Enable auto-payout via Stripe Connect */
  auto_payout: process.env.FLAG_AUTO_PAYOUT === '1',
}

export function isEnabled(flag) {
  return flags[flag] === true
}

export function getFlags() {
  return { ...flags }
}
