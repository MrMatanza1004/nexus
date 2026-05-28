import { sendEmail, welcomeEmail } from '@/lib/email'

export async function POST(req) {
  try {
    const { email, name } = await req.json()
    if (!email || !name) {
      return Response.json({ error: 'Email and name required' }, { status: 400 })
    }

    const { subject, html } = welcomeEmail(name)
    await sendEmail({ to: email, subject, html })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return Response.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
