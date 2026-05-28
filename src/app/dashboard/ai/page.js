'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const emailTemplates = {
  follow_up: {
    label: 'Follow-up',
    generate: (client, project) => `Hola ${client?.name || '[Cliente]'},\n\nEspero que este mensaje te encuentre bien. Quería hacer un seguimiento de nuestra conversación anterior sobre ${project?.name || 'el proyecto'}.\n\nQuedo atento a cualquier novedad o pregunta que puedas tener.\n\nSaludos cordiales,\n[Tu nombre]`,
    tone: 'Profesional',
  },
  proposal: {
    label: 'Propuesta',
    generate: (client, project) => `Estimado/a ${client?.name || '[Cliente]'},\n\nTal como lo hablamos, te comparto la propuesta para ${project?.name || 'el proyecto'}.\n\nAdjunto encontrarás los detalles del alcance, los plazos estimados y el presupuesto correspondiente. Quedo a disposición para cualquier ajuste o consulta.\n\nSaludos,\n[Tu nombre]`,
    tone: 'Formal',
  },
  invoice_reminder: {
    label: 'Recordatorio de pago',
    generate: (client, project) => `Hola ${client?.name || '[Cliente]'},\n\nTe escribo para recordarte amablemente que la factura correspondiente a ${project?.name || 'los servicios prestados'} se encuentra pendiente de pago.\n\nPodés realizarlo a través del link de pago que te envié anteriormente. Agradezco tu atención.\n\nSaludos,\n[Tu nombre]`,
    tone: 'Cordial',
  },
  thank_you: {
    label: 'Agradecimiento',
    generate: (client, project) => `Hola ${client?.name || '[Cliente]'},\n\nQuería agradecerte por la confianza depositada en mí para ${project?.name || 'el proyecto'}. Fue un placer trabajar con vos.\n\nEspero que el resultado haya sido de tu agrado. Quedo a tu disposición para futuras colaboraciones.\n\nUn abrazo,\n[Tu nombre]`,
    tone: 'Cálido',
  },
  check_in: {
    label: 'Check-in de proyecto',
    generate: (client, project) => `Hola ${client?.name || '[Cliente]'},\n\nEspero que todo vaya bien. Quería hacer un check-in rápido sobre ${project?.name || 'el proyecto'} para ver cómo vamos y si hay algo que necesites ajustar.\n\nAvísame cualquier cosa.\n\nSaludos,\n[Tu nombre]`,
    tone: 'Informal',
  },
  testimonial_request: {
    label: 'Pedir testimonio',
    generate: (client, project) => `Hola ${client?.name || '[Cliente]'},\n\nMe alegró mucho trabajar con vos en ${project?.name || 'el proyecto'}. Si te quedó un buen sabor de boca, ¿me regalarías unas líneas para mi sitio?\n\nTu opinión ayuda a otros freelancers a confiar en mí.\n\n¡Gracias!\n[Tu nombre]`,
    tone: 'Cálido',
  },
}

const bios = [
  {
    title: 'Profesional con experiencia',
    generate: (name, role, years) => `Soy ${name || '[Nombre]'}, ${role || '[rol]'} con ${years || 'X'} años de experiencia ayudando a empresas y emprendedores a alcanzar sus objetivos a través de soluciones creativas y estratégicas.

Mi enfoque combina pensamiento analítico con ejecución impecable, garantizando resultados que superan expectativas. He trabajado con clientes de diversos sectores, desde startups hasta corporaciones multinacionales.

Creo firmemente en el poder de la colaboración y la comunicación transparente como pilares de proyectos exitosos.`,
  },
  {
    title: 'Creativo y resolutivo',
    generate: (name, role, years) => `${name || '[Nombre]'} · ${role || '[rol]'}

Transformo ideas en resultados. Con ${years || 'X'} años de experiencia, me especializo en crear soluciones que no solo se ven bien, sino que funcionan.

Mi filosofía de trabajo: entender el problema antes de buscar la solución. Cada proyecto es único y merece un enfoque personalizado.

Clientes satisfechos en 3 continentes.`,
  },
  {
    title: 'Enfocado en resultados',
    generate: (name, role, years) => `${name || '[Nombre]'} — ${role || '[rol]'}

+${years || 'X'} años generando impacto real para marcas y negocios. No solo entrego trabajo, entrego resultados medibles.

Mi metodología: entender tu negocio, diseñar la estrategia, ejecutar con excelencia.

¿Hablamos de tu próximo proyecto?`,
  },
]

const proposalEnhancers = [
  {
    title: 'Añadir urgencia',
    enhance: (content) => `${content}\n\n⚠️ OFERTA POR TIEMPO LIMITADO\nEsta propuesta tiene un descuento del 15% por lanzamiento. El precio aumenta en 7 días.\n\n👉 Asegurá tu tarifa preferencial respondiendo este mensaje.`,
  },
  {
    title: 'Añadir garantía',
    enhance: (content) => `${content}\n\n🛡️ GARANTÍA DE SATISFACCIÓN\nSi no estás 100% satisfecho con el resultado, ajustamos todo hasta que quedes contento. Sin costo adicional.\n\nTu tranquilidad es mi prioridad.`,
  },
  {
    title: 'Añadir prueba social',
    enhance: (content) => `${content}\n\n⭐ LO QUE DICEN MIS CLIENTES\n"Trabajar con [Nombre] transformó la forma en que manejamos nuestros proyectos. Altamente recomendado." — Cliente reciente\n\n💰 Resultado: +40% de eficiencia en 3 meses.`,
  },
  {
    title: 'Añadir llamado a la acción',
    enhance: (content) => `${content}\n\n🚀 PRÓXIMOS PASOS\n1. Revisá esta propuesta\n2. Respondé este mensaje con tu OK\n3. Arrancamos en 48hs\n\n👉 Respondé ahora para asegurar tu lugar en mi agenda.`,
  },
]

export default function AIPage() {
  const [tab, setTab] = useState('email')
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [result, setResult] = useState('')

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('clients').select('id, name, email').eq('user_id', user.id)
    if (data) setClients(data)
  }

  const [emailForm, setEmailForm] = useState({ template: 'follow_up', name: '', project: '' })
  const [bioForm, setBioForm] = useState({ template: 0, name: '', role: '', years: '' })
  const [proposalForm, setProposalForm] = useState({ enhancer: 0, content: '' })

  function generateEmail() {
    const tmpl = emailTemplates[emailForm.template]
    const client = clients.find(c => c.id === selectedClient)
    let text = tmpl.generate(client || { name: emailForm.name }, { name: emailForm.project })
    setResult(text)
  }

  function generateBio() {
    const tmpl = bios[bioForm.template]
    let text = tmpl.generate(bioForm.name, bioForm.role, bioForm.years)
    setResult(text)
  }

  function enhanceProposal() {
    const tmpl = proposalEnhancers[proposalForm.enhancer]
    let text = proposalForm.content
      ? tmpl.enhance(proposalForm.content)
      : 'Primero escribí o pegá el contenido de tu propuesta arriba.'
    setResult(text)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">🤖 AI Tools</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { key: 'email', label: '✉️ Email Writer' },
          { key: 'bio', label: '👤 Bio Generator' },
          { key: 'proposal', label: '📄 Proposal Enhancer' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.key ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="card p-6">
          {tab === 'email' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-900">Generar Email</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                <select value={selectedClient || ''} onChange={e => setSelectedClient(e.target.value)} className="input-field">
                  <option value="">Seleccionar cliente existente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">O nombre del cliente</label>
                <input type="text" value={emailForm.name} onChange={e => setEmailForm({ ...emailForm, name: e.target.value })} className="input-field" placeholder="Ej: Juan Pérez" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto / Contexto</label>
                <input type="text" value={emailForm.project} onChange={e => setEmailForm({ ...emailForm, project: e.target.value })} className="input-field" placeholder="Ej: Rediseño de landing page" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de email</label>
                <select value={emailForm.template} onChange={e => setEmailForm({ ...emailForm, template: e.target.value })} className="input-field">
                  {Object.entries(emailTemplates).map(([k, v]) => <option key={k} value={k}>{v.label} ({v.tone})</option>)}
                </select>
              </div>
              <button onClick={generateEmail} className="btn-primary">Generar Email ✨</button>
            </div>
          )}

          {tab === 'bio' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-900">Generar Bio Profesional</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tu nombre</label>
                <input type="text" value={bioForm.name} onChange={e => setBioForm({ ...bioForm, name: e.target.value })} className="input-field" placeholder="Ej: Ana García" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tu rol</label>
                <input type="text" value={bioForm.role} onChange={e => setBioForm({ ...bioForm, role: e.target.value })} className="input-field" placeholder="Ej: Diseñadora UX / Desarrollador Web" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Años de experiencia</label>
                <input type="number" value={bioForm.years} onChange={e => setBioForm({ ...bioForm, years: e.target.value })} className="input-field" placeholder="Ej: 5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estilo</label>
                <select value={bioForm.template} onChange={e => setBioForm({ ...bioForm, template: Number(e.target.value) })} className="input-field">
                  {bios.map((b, i) => <option key={i} value={i}>{b.title}</option>)}
                </select>
              </div>
              <button onClick={generateBio} className="btn-primary">Generar Bio ✨</button>
            </div>
          )}

          {tab === 'proposal' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-slate-900">Mejorar Propuesta</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contenido de la propuesta</label>
                <textarea value={proposalForm.content} onChange={e => setProposalForm({ ...proposalForm, content: e.target.value })} className="input-field" rows={6} placeholder="Pegá el texto de tu propuesta acá..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mejora a aplicar</label>
                <select value={proposalForm.enhancer} onChange={e => setProposalForm({ ...proposalForm, enhancer: Number(e.target.value) })} className="input-field">
                  {proposalEnhancers.map((p, i) => <option key={i} value={i}>{p.title}</option>)}
                </select>
              </div>
              <button onClick={enhanceProposal} className="btn-primary">Mejorar ✨</button>
            </div>
          )}
        </div>

        {/* Result Panel */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Resultado</h2>
            {result && (
              <button onClick={() => { navigator.clipboard.writeText(result); toast.success('Copiado!') }}
                className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all font-medium">
                📋 Copiar
              </button>
            )}
          </div>
          {result ? (
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans bg-slate-50 rounded-lg p-4 max-h-[500px] overflow-y-auto">{result}</pre>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-3">✨</p>
              <p className="text-sm">Completá el formulario y generá tu contenido</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
