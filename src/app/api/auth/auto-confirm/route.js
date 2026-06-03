import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Auto-confirm the user so they can sign in without email verification
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ confirmed: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
