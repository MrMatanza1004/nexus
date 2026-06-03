import { NextResponse } from 'next/server'
import { resolveMx } from 'dns/promises'

export async function GET(req) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ valid: false, error: 'email required' }, { status: 400 })
  }

  const domain = email.split('@')[1]
  if (!domain || !domain.includes('.')) {
    return NextResponse.json({ valid: false, error: 'Formato de email inválido' })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const addresses = await resolveMx(domain, { signal: controller.signal })
    clearTimeout(timeout)
    const valid = addresses.length > 0
    return NextResponse.json({ valid, mx: addresses.map(a => a.exchange) })
  } catch {
    clearTimeout(timeout)
    return NextResponse.json({ valid: false, error: 'El dominio del email no existe o no recibe correos' })
  }
}
