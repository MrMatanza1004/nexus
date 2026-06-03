import { NextResponse } from 'next/server'
import { getCurrentPromotion } from '@/data/affiliate-promotions'

export async function GET() {
  try {
    const promotion = getCurrentPromotion()
    return NextResponse.json(promotion)
  } catch (err) {
    console.error('Promotion error:', err)
    return NextResponse.json({ error: 'Failed to load promotion' }, { status: 500 })
  }
}
