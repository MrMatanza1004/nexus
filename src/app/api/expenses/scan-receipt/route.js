import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(req) {
  try {
    // 1. Recibir archivo como FormData
    const formData = await req.formData()
    const file = formData.get('receipt')

    if (!file || !file.name) {
      return NextResponse.json(
        { success: false, error: 'No se envió ningún comprobante' },
        { status: 400 },
      )
    }

    // 2. Validar tipo y tamaño
    if (!file.type || !file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'El archivo debe ser una imagen' },
        { status: 400 },
      )
    }

    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'La imagen no puede superar los 10MB' },
        { status: 400 },
      )
    }

    // 3. Leer archivo como base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64Image}`
    const truncatedForPrompt = base64Image.substring(0, 150000) // limitar tamaño del prompt

    // 4. Llamar a la IA
    const prompt = `Extraé los datos de este gasto/comprobante (en BASE64 al final): monto total, fecha, categoría (Alimentación/Transporte/Servicios/Software/Oficina/Marketing/Educación/Salud/Viajes/Otros), y descripción breve. Respondé SOLO con JSON: { "amount": number, "date": "YYYY-MM-DD", "category": string, "description": string }.\n\nImagen BASE64: ${truncatedForPrompt}`

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || 'http://localhost:3000'

    let extracted = null

    try {
      const aiRes = await fetch(`${siteUrl}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: 'receipt', prompt }),
        signal: AbortSignal.timeout(25000),
      })

      if (aiRes.ok) {
        const aiData = await aiRes.json()
        const resultText = aiData.result || ''

        // Intentar parsear JSON de la respuesta
        const jsonMatch = resultText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0])
            if (parsed.amount || parsed.date || parsed.category || parsed.description) {
              extracted = {
                amount: parsed.amount ? Number(parsed.amount) : null,
                date: parsed.date || null,
                category: parsed.category || null,
                description: parsed.description || null,
              }
            }
          } catch {
            // JSON inválido, seguir con fallback
          }
        }
      }
    } catch {
      // AI falló — seguir con fallback
    }

    // 5. Si la IA no pudo extraer datos, devolver la imagen para ingreso manual
    if (!extracted) {
      return NextResponse.json({
        success: false,
        error: 'No se pudieron extraer los datos automáticamente. Completá los campos manualmente.',
        image_url: dataUri,
      })
    }

    return NextResponse.json({
      success: true,
      data: extracted,
      image_url: dataUri,
    })
  } catch (err) {
    console.error('Scan receipt error:', err)
    return NextResponse.json(
      { success: false, error: 'Error al procesar el comprobante' },
      { status: 500 },
    )
  }
}
