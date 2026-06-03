import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_WEBHOOK_SECRET) {
    console.error('Missing Resend env vars')
    return NextResponse.json({ error: 'Server config error' }, { status: 500 })
  }

  const payload = await req.text()

  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 })
  }

  let event
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
    })
  } catch (err) {
    console.error('Resend webhook verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const { type, data } = event

  switch (type) {
    case 'contact.created':
      console.log(`[RESEND] Contact created: ${data.email} (${data.first_name ?? ''} ${data.last_name ?? ''})`)
      // TODO: store in newsletter_subscribers table when available
      break

    case 'contact.deleted':
      console.log(`[RESEND] Contact deleted: ${data.email}`)
      break

    default:
      console.log(`[RESEND] Unhandled event type: ${type}`)
  }

  return NextResponse.json({ received: true })
}
