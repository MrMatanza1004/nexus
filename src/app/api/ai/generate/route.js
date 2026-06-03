import { NextResponse } from 'next/server'

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'openai/gpt-oss-120b:free' // 100% gratis en OpenRouter

const SYSTEM_PROMPTS = {
  email: `Eres un asistente experto en redacción de emails profesionales para freelancers.
Generá emails en español neutro con tono profesional pero cálido.
Incluí el asunto (Subject) al inicio del email.
Adaptá el tono según el contexto: follow-up, propuesta, recordatorio, agradecimiento, etc.
Máximo 3 párrafos. Directo, claro, profesional.`,

  bio: `Eres un redactor de bios profesionales para freelancers.
Generá una biografía profesional atractiva en español neutro.
Estilo moderno, profesional y persuasivo.
Incluí: qué hace, cómo trabaja, qué resultados genera, y un cierre con llamado a la acción.
3-4 párrafos máximo.`,

  proposal: `Eres un experto en conversión para freelancers.
Mejorá la propuesta del usuario aplicando técnicas de persuasión y copywriting.
Mantené el contenido original pero potenciálo con: urgencia, garantía, prueba social o llamado a la acción según lo solicitado.
No inventes datos concretos que el usuario no haya proporcionado.`,

  rewrite: `Eres un editor de contenido profesional.
Reescribí el texto del usuario según lo solicitado: cambiar tono, acortar, expandir, hacerlo más formal o más casual.
Mantené el significado original y los datos concretos.
Mejorá la claridad y el impacto del mensaje.`,

  contract_clause: `Eres un asesor legal especializado en contratos para freelancers.
Generá cláusulas contractuales claras y profesionales en español neutro.
Cubrí los aspectos clave: partes, alcance, plazos, forma de pago, confidencialidad, propiedad intelectual, rescisión.
Usá lenguaje claro pero jurídicamente sólido.
Aclaración: esto no constituye asesoría legal formal.`,

  ideas: `Eres un generador de ideas creativo para freelancers y profesionales.
Generá ideas originales y accionables basadas en el contexto proporcionado.
Pensá en términos de: contenido, negocios, marketing, productos, servicios.
Priorizá ideas que se puedan ejecutar con recursos limitados.
Formato: lista numerada con título y breve descripción de cada idea.`,

  tasks: `Eres un project manager experto en desglose de tareas.
Tomá un proyecto o objetivo y dividilo en tareas accionables y bien definidas.
Cada tarea debe tener: nombre, descripción breve, prioridad (alta/media/baja), y tiempo estimado.
Organizalas en orden lógico de ejecución.
Usá formato de check list.`,

  outreach: `Eres un experto en prospección y ventas para freelancers.
Generá mensajes de outreach (frío/cálido) en español neutro.
Tono profesional pero humano, nada de plantillas genéricas.
Personalizá según el contexto del prospecto.
Máximo 4 párrafos. Incluí línea de asunto.
Objetivo: conseguir una reunión o respuesta, no vender directamente.`,

  contract: `Eres un abogado especializado en contratos para freelancers hispanohablantes.
Generá un contrato de servicios profesionales COMPLETO en español neutro.
Incluí todas las cláusulas estándar: objeto, honorarios, forma de pago, plazo, propiedad intelectual, confidencialidad, cancelación, jurisdicción.
Usá lenguaje claro pero jurídicamente sólido.
Formato: texto plano con numeración de cláusulas.
Al final incluí líneas de firma para ambas partes.
Nota al pie: "Este contrato fue generado con NEXUS AI. Se recomienda revisión legal profesional."`,

  receipt: `Eres un asistente experto en escanear comprobantes y facturas.
Extraé los datos del gasto/comprobante que se muestra en la imagen.
Buscá: monto total, fecha, categoría, y descripción breve.
Categorías posibles: Alimentación, Transporte, Servicios, Software, Oficina, Marketing, Educación, Salud, Viajes, Otros.
Respondé SOLO con JSON válido, sin texto adicional, sin markdown:
{ "amount": number, "date": "YYYY-MM-DD", "category": string, "description": string }
Si no podés determinar un campo, usá null. No inventes datos.`,
}

export async function POST(request) {
  try {
    const { tool, prompt, context } = await request.json()

    if (!tool || !SYSTEM_PROMPTS[tool]) {
      return NextResponse.json({ error: 'Herramienta no válida' }, { status: 400 })
    }

    if (!process.env.OPENROUTER_API_KEY) {
      // Fallback: si no hay API key, devolvemos un mensaje amigable
      return NextResponse.json({
        result: `🔑 Para usar la IA en vivo, necesitás configurar tu API key de OpenRouter.\n\nAndá a Configuración → API Keys y agregá tu clave.\n\nMientras tanto, podés:\n- Configurar tu key en https://openrouter.ai/keys\n- Crear una cuenta gratis (dan crédito inicial)\n\nO seguí usando las plantillas predeterminadas ✨`,
        needsKey: true,
      })
    }

    const systemPrompt = SYSTEM_PROMPTS[tool]
    const userMessage = `${prompt}\n\n${context ? 'Contexto adicional:\n' + context : ''}`

    const response = await fetch(OPENROUTER_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://ionexus.pro',
        'X-Title': 'NEXUS AI',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenRouter error:', error)
      return NextResponse.json({ error: 'Error al conectar con la IA' }, { status: 500 })
    }

    const data = await response.json()
    const result = data.choices?.[0]?.message?.content || ''

    return NextResponse.json({ result })
  } catch (error) {
    console.error('AI generate error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
