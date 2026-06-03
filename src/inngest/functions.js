// ─────────────────────────────────────────────
// NEXUS — Inngest Background Functions
// ─────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'
import { inngest } from '@/lib/inngest'
import {
  sendEmail,
  trialDayEmail,
  upgradeStarterToPro,
  upgradeProToAI,
} from '@/lib/email'
import { UPGRADE_STARTER_DAYS, UPGRADE_PRO_DAYS, TRIAL_SEQUENCE_DAYS } from '@/lib/constants'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ═══════════════════════════════════════════
// Daily Cron — Trial Emails + Upgrades
// Triggered by cron/daily route via Inngest event
// ═══════════════════════════════════════════
export const dailyCron = inngest.createFunction(
  { id: 'daily-cron', name: 'Daily Email Cron', throttle: { limit: 1, period: '24h' }, triggers: { event: 'nexus/daily.cron' } },
  async ({ step }) => {
    const results = { trial_sent: 0, upgrade_sent: 0, errors: [] }

    // Helper: batch process all users of a plan type
    async function processPlan({ planType, minDays, maxDays, emailFn, campaignName }) {
      const PAGE_SIZE = 500
      let page = 0
      while (true) {
        const { data: users, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, created_at')
          .eq('plan_type', planType)
          .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

        if (error) { results.errors.push(error.message); break }
        if (!users?.length) break

        for (const user of users) {
          await step.run(`${campaignName}-${user.id}`, async () => {
            const daysSince = Math.floor(
              (Date.now() - new Date(user.created_at).getTime()) / 86400000
            )
            const day = daysSince + 1

            // Skip if outside the send window
            if (maxDays && day > maxDays) return
            if (minDays && daysSince < minDays) return

            // Check if already sent
            const { data: existing } = await supabase
              .from('email_campaigns')
              .select('id')
              .eq('user_id', user.id)
              .eq('campaign', campaignName)
              .maybeSingle()
            if (existing) return

            // Re-check plan at send time
            const { data: profile } = await supabase
              .from('profiles')
              .select('plan_type')
              .eq('id', user.id)
              .single()
            if (!profile || profile.plan_type !== planType) return

            // Send the email
            const { subject, html } = emailFn(user.full_name || user.email, day)
            await sendEmail({ to: user.email, subject, html })

            // Record send
            await supabase.from('email_campaigns').insert({
              user_id: user.id,
              campaign: campaignName,
              day: maxDays ? day : null,
            })

            if (campaignName === 'trial_sequence') results.trial_sent++
            else results.upgrade_sent++
          })
        }
        page++
      }
    }

    // Trial sequence: day 1-7 emails
    await processPlan({
      planType: 'trial',
      maxDays: TRIAL_SEQUENCE_DAYS,
      emailFn: (name, day) => trialDayEmail(day, name),
      campaignName: 'trial_sequence',
    })

    // Starter → Pro upgrade (after N days)
    await processPlan({
      planType: 'starter',
      minDays: UPGRADE_STARTER_DAYS,
      emailFn: upgradeStarterToPro,
      campaignName: 'upgrade_starter_to_pro',
    })

    // Pro → AI upgrade (after N days)
    await processPlan({
      planType: 'pro',
      minDays: UPGRADE_PRO_DAYS,
      emailFn: upgradeProToAI,
      campaignName: 'upgrade_pro_to_ai',
    })

    return { results }
  }
)
