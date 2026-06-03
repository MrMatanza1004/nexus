// ─────────────────────────────────────────────
// NEXUS — Daily Cron (Vercel Cron Jobs → Inngest)
// ─────────────────────────────────────────────
// This route is called by Vercel Cron Jobs every day at 14:00 CDMX.
// It fires an Inngest event which triggers the background function.
// The actual email processing happens in /src/inngest/functions.js
import { NextResponse } from 'next/server'
import { inngest } from '@/lib/inngest'

export const dynamic = 'force-dynamic'

const ALLOWED_CRON_SECRET = process.env.CRON_SECRET

export async function GET(req) {
  // ── Security ──
  const authHeader = req.headers.get('authorization') || ''
  const url = new URL(req.url)
  const querySecret = url.searchParams.get('secret')
  const isValid = authHeader === `Bearer ${ALLOWED_CRON_SECRET}` || querySecret === ALLOWED_CRON_SECRET

  if (!ALLOWED_CRON_SECRET || !isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Fire Inngest event to trigger daily background job ──
  try {
    await inngest.send({ name: 'nexus/daily.cron' })
    return NextResponse.json({ success: true, message: 'Daily cron triggered via Inngest' })
  } catch (err) {
    console.error('Failed to trigger Inngest cron:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
