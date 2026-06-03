# Proposal: Email Marketing Automation

## Intent

Drive trial-to-paid + plan upgrades. NEXUS sends one welcome email then goes silent — missed revenue.

## Scope

### In Scope
- 7-day daily sequence for trial users (onboarding tips, features, testimonials, scarcity CTA)
- Sequence stops on purchase (re-checked at send time)
- Day 8+: weekly digest or stop
- Upgrade emails: Starter 14+ days → Pro; Pro 30+ days → Pro+AI; sent once
- New `email_campaigns` Supabase table for send tracking
- Email template functions in `src/lib/email.js`
- Cron routes: `/api/cron/daily-trial`, `/api/cron/upgrade-check`
- Vercel Cron config via `vercel.json`
- Timing consts in `src/lib/constants.js`

### Out of Scope
A/B testing, analytics dashboard, unsubscribe UI, manual admin trigger, multi-language, SMS/push, real-time webhook triggers.

## Capabilities

### New
- `email-campaigns`: Scheduled marketing emails to trial + upgrade-eligible users. Tracks send state, uses Resend.

### Modified
- None (additive only)

## Approach

**Daily trial:** Cron queries `profiles WHERE plan_type = 'trial'` with no email_campaigns for today → computes day# from `created_at` → sends email → records send. Day >7 → digest or skip.

**Upgrade:** Starter with `created_at + 14d <= now` AND no `starter_to_pro` → Pro offer. Same for Pro→Pro+AI at 30d.

**Data model:** `email_campaigns(user_id, campaign, day, sent_at)` indexed on user_id + campaign.

**Templates:** New functions in `src/lib/email.js` per existing pattern.

## Affected Areas

| Area | Impact |
|------|--------|
| `src/lib/email.js` | Modified — add templates |
| `src/lib/constants.js` | Modified — add timing consts |
| `src/app/api/cron/daily-trial/route.js` | New |
| `src/app/api/cron/upgrade-check/route.js` | New |
| `supabase/setup.sql` | Modified — add table + RLS |
| `vercel.json` | New — cron defs |
| `.env.local` | Modified — `CRON_SECRET` |

## Risks

| Risk | Mitigation |
|------|------------|
| Resend 100/day free cap | Check usage; batch with 1s delay; non-fatal logging |
| Race on plan change | Re-check `plan_type` at send time |
| Vercel Hobby: 1 daily cron | Chain both checks in same route |
| No test infra | Manual via SQL seed + local cron sim |

## Rollback Plan

1. Remove cron entries from `vercel.json`, redeploy — emails stop immediately.
2. `DROP TABLE public.email_campaigns` to wipe send state.
3. `git revert && git push` for code rollback.
4. Previous sent emails remain but no future sends.

## Dependencies

Vercel Hobby (cron), Resend key ✓, Supabase service role key ✓.

## Success Criteria

- [ ] Trial users get 7 daily emails; sequence stops <24h of purchase
- [ ] Starter 14d+ users get exactly 1 upgrade email
- [ ] Pro 30d+ users get exactly 1 upgrade email
- [ ] Welcome email flow unaffected
- [ ] All send state queryable from `email_campaigns`
