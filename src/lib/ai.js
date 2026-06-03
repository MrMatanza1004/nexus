'use client'

import toast from 'react-hot-toast'

// Mapa de herramientas con metadatos
export const aiTools = {
  email: {
    id: 'email',
    icon: '✉️',
    title: 'Email Writer',
    desc: 'Escribí emails profesionales con IA',
    color: 'violet',
    fields: [
      { key: 'clientName', label: 'Nombre del cliente', type: 'text', placeholder: 'Ej: Juan Pérez' },
      { key: 'project', label: 'Proyecto / Contexto', type: 'text', placeholder: 'Ej: Rediseño de landing page' },
      { key: 'tone', label: 'Tono', type: 'select', options: ['Profesional', 'Cálido', 'Formal', 'Informal', 'Urgente'] },
      { key: 'type', label: 'Tipo de email', type: 'select', options: ['Follow-up', 'Propuesta', 'Recordatorio de pago', 'Agradecimiento', 'Check-in', 'Pedir testimonio', 'Presentación'] },
    ],
    buildPrompt: (vals) => {
      let context = `Escribí un email para ${vals.clientName || 'un cliente'}`
      if (vals.project) context += ` sobre el proyecto: ${vals.project}`
      context += `.\nTono: ${vals.tone || 'profesional'}`
      context += `.\nTipo: ${vals.type || 'follow-up'}`
      return context
    }
  },
  bio: {
    id: 'bio',
    icon: '👤',
    title: 'Bio Generator',
    desc: 'Creá tu bio profesional con IA',
    color: 'emerald',
    fields: [
      { key: 'name', label: 'Tu nombre', type: 'text', placeholder: 'Ej: Ana García' },
      { key: 'role', label: 'Tu rol', type: 'text', placeholder: 'Ej: Diseñadora UX' },
      { key: 'years', label: 'Años de experiencia', type: 'text', placeholder: 'Ej: 5' },
      { key: 'style', label: 'Estilo', type: 'select', options: ['Profesional con experiencia', 'Creativo y resolutivo', 'Enfocado en resultados', 'Casual y cercano'] },
      { key: 'specialty', label: 'Especialidad (opcional)', type: 'text', placeholder: 'Ej: UI/UX, branding, desarrollo web' },
    ],
    buildPrompt: (vals) => {
      return `Nombre: ${vals.name || '[Nombre]'}\nRol: ${vals.role || '[Rol]'}\nExperiencia: ${vals.years || 'X'} años\nEstilo: ${vals.style || 'profesional'}\nEspecialidad: ${vals.specialty || '—'}`
    }
  },
  proposal: {
    id: 'proposal',
    icon: '📄',
    title: 'Proposal Enhancer',
    desc: 'Potenciá tus propuestas con persuasión',
    color: 'amber',
    fields: [
      { key: 'content', label: 'Contenido de la propuesta', type: 'textarea', placeholder: 'Pegá el texto de tu propuesta acá...', rows: 6 },
      { key: 'enhancement', label: 'Mejora a aplicar', type: 'select', options: ['Urgencia (oferta limitada)', 'Garantía de satisfacción', 'Prueba social', 'Llamado a la acción', 'Todas las anteriores'] },
      { key: 'clientName', label: 'Nombre del cliente (opcional)', type: 'text', placeholder: 'Ej: María López' },
    ],
    buildPrompt: (vals) => `Propuesta original:\n${vals.content || '[Sin contenido]'}\n\nMejora solicitada: ${vals.enhancement || 'mejorar persuasión'}\nCliente: ${vals.clientName || '—'}`
  },
  rewrite: {
    id: 'rewrite',
    icon: '✍️',
    title: 'Content Rewriter',
    desc: 'Reescribí contenido con IA',
    color: 'blue',
    fields: [
      { key: 'content', label: 'Texto a reescribir', type: 'textarea', placeholder: 'Pegá el texto acá...', rows: 6 },
      { key: 'action', label: 'Acción', type: 'select', options: ['Mejorar redacción', 'Hacerlo más formal', 'Hacerlo más casual', 'Acortar', 'Expandir', 'Cambiar tono'] },
    ],
    buildPrompt: (vals) => `Texto:\n${vals.content || '[Sin texto]'}\n\nAcción: ${vals.action || 'mejorar redacción'}`
  },
  contract_clause: {
    id: 'contract_clause',
    icon: '⚖️',
    title: 'Contract Clause Generator',
    desc: 'Generá cláusulas para tus contratos',
    color: 'red',
    fields: [
      { key: 'type', label: 'Tipo de cláusula', type: 'select', options: ['Confidencialidad (NDA)', 'Forma de pago', 'Propiedad intelectual', 'Alcance del trabajo', 'Rescisión', 'Entrega y plazos', 'Todo el contrato básico'] },
      { key: 'project', label: 'Tipo de proyecto', type: 'text', placeholder: 'Ej: Desarrollo web' },
      { key: 'amount', label: 'Monto (opcional)', type: 'text', placeholder: 'Ej: $2,500' },
      { key: 'timeline', label: 'Plazo (opcional)', type: 'text', placeholder: 'Ej: 4 semanas' },
    ],
    buildPrompt: (vals) => `Tipo de cláusula: ${vals.type || 'básica'}\nProyecto: ${vals.project || 'servicios profesionales'}\nMonto: ${vals.amount || 'a convenir'}\nPlazo: ${vals.timeline || 'a convenir'}`
  },
  ideas: {
    id: 'ideas',
    icon: '💡',
    title: 'Idea Generator',
    desc: 'Generá ideas creativas con IA',
    color: 'amber',
    fields: [
      { key: 'topic', label: 'Tema / Área', type: 'text', placeholder: 'Ej: Contenido para Instagram, nuevas features, servicios' },
      { key: 'count', label: 'Cantidad de ideas', type: 'select', options: ['3 ideas', '5 ideas', '10 ideas'] },
      { key: 'focus', label: 'Enfoque', type: 'select', options: ['Contenido / Marketing', 'Producto / Features', 'Negocio / Crecimiento', 'General'] },
    ],
    buildPrompt: (vals) => `Tema: ${vals.topic || 'ideas creativas'}\nCantidad: ${vals.count || '5 ideas'}\nEnfoque: ${vals.focus || 'general'}`
  },
  tasks: {
    id: 'tasks',
    icon: '📋',
    title: 'Task Breakdown',
    desc: 'Dividí proyectos en tareas accionables',
    color: 'indigo',
    fields: [
      { key: 'project', label: 'Nombre del proyecto', type: 'text', placeholder: 'Ej: Landing page para cliente' },
      { key: 'details', label: 'Detalles del proyecto', type: 'textarea', placeholder: 'Describí el proyecto, alcance, entregables...', rows: 4 },
      { key: 'timeline', label: 'Plazo (opcional)', type: 'text', placeholder: 'Ej: 2 semanas' },
    ],
    buildPrompt: (vals) => `Proyecto: ${vals.project || '[Proyecto]'}\nDetalles: ${vals.details || '[Sin detalles]'}\nPlazo: ${vals.timeline || 'No especificado'}`
  },
  outreach: {
    id: 'outreach',
    icon: '💬',
    title: 'Outreach Generator',
    desc: 'Mensajes de prospección con IA',
    color: 'emerald',
    fields: [
      { key: 'prospect', label: 'Nombre del prospecto', type: 'text', placeholder: 'Ej: Carlos Mendoza' },
      { key: 'company', label: 'Empresa', type: 'text', placeholder: 'Ej: TechCorp' },
      { key: 'context', label: 'Contexto (cómo lo conocés)', type: 'text', placeholder: 'Ej: Vi su perfil en LinkedIn' },
      { key: 'type', label: 'Tipo de outreach', type: 'select', options: ['Frío (sin contacto previo)', 'Cálido (hubo interacción)', 'Seguimiento de propuesta', 'Reconexión'] },
      { key: 'service', label: 'Servicio que ofrecés', type: 'text', placeholder: 'Ej: Desarrollo web' },
    ],
    buildPrompt: (vals) => {
      return `Prospecto: ${vals.prospect || '[Prospecto]'}\nEmpresa: ${vals.company || '—'}\nContexto: ${vals.context || 'Sin contexto'}\nTipo: ${vals.type || 'frío'}\nServicio: ${vals.service || 'mis servicios'}`
    }
  },
  contract: {
    id: 'contract',
    icon: '⚖️',
    title: 'Contract Generator',
    desc: 'Generá contratos completos con IA',
    color: 'red',
    fields: [
      { key: 'clientName', label: 'Nombre del cliente', type: 'text', placeholder: 'Ej: María López' },
      { key: 'service', label: 'Servicio / Proyecto', type: 'text', placeholder: 'Ej: Desarrollo de sitio web' },
      { key: 'amount', label: 'Monto total ($)', type: 'text', placeholder: 'Ej: 3500' },
      { key: 'timeline', label: 'Plazo de entrega', type: 'text', placeholder: 'Ej: 4 semanas' },
      { key: 'payment', label: 'Forma de pago', type: 'select', options: ['50% inicio / 50% entrega', '100% al inicio', '33% / 33% / 33%', 'Mensual', 'A convenir'] },
      { key: 'extras', label: 'Cláusulas extra (opcional)', type: 'text', placeholder: 'Ej: NDA, propiedad intelectual, revisiones' },
    ],
    buildPrompt: (vals) =>
      `Cliente: ${vals.clientName || '[Cliente]'}\nServicio: ${vals.service || '[Servicio]'}\nMonto: $${vals.amount || '[Monto]'}\nPlazo: ${vals.timeline || '[Plazo]'}\nPago: ${vals.payment || '50/50'}\nExtras: ${vals.extras || 'ninguno'}`,
  },
}

// Función para llamar a la IA
export async function generateWithAI(tool, prompt, context = '') {
  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, prompt, context }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Error de conexión')
    }

    return await res.json()
  } catch (err) {
    console.error('AI error:', err)
    throw err
  }
}

// AI Assist: función rápida desde cualquier página
export async function aiAssist(tool, prompt) {
  const toastId = toast.loading('🤖 IA pensando...')
  try {
    const { result } = await generateWithAI(tool, prompt)
    toast.success('✅ Listo!', { id: toastId })
    return result
  } catch (err) {
    toast.error('Error al generar: ' + err.message, { id: toastId })
    return null
  }
}
