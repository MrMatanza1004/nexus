import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = process.env.EMAIL_FROM || 'NEXUS <notificaciones@ionexus.pro>'

function layout(content) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', Arial, sans-serif; background: #f8fafc; padding: 40px 20px; }
  .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #7c3aed, #a78bfa); padding: 32px; text-align: center; }
  .header h1 { color: #fff; font-size: 20px; font-weight: 700; }
  .body { padding: 32px; }
  .body p { color: #475569; line-height: 1.6; margin-bottom: 16px; font-size: 15px; }
  .btn { display: inline-block; background: #7c3aed; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 8px 0; }
  .btn:hover { background: #6d28d9; }
  .footer { padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
  .footer p { color: #94a3b8; font-size: 12px; margin-bottom: 4px; }
</style></head><body>
  <div class="container">
    <div class="header"><h1>NEXUS</h1></div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>NEXUS — El Sistema Operativo Freelance</p>
      <p>Si no pediste este correo, podés ignorarlo.</p>
    </div>
  </div>
</body></html>`
}

export async function sendEmail({ to, subject, html }) {
  if (!resend) {
    return console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`)
  }
  return resend.emails.send({ from: FROM, to, subject, html: layout(html) })
}

export function welcomeEmail(name) {
  return {
    subject: 'Bienvenido a NEXUS 🚀',
    html: `<h2 style="margin-bottom:16px">¡Bienvenido a NEXUS, ${name}!</h2>
<p>Estás a punto de descubrir cómo gestionar tu freelance desde un solo lugar.</p>
<p>Con NEXUS podés:</p>
<p style="padding-left:16px">
✅ Facturar y cobrar online<br>
✅ Gestionar clientes y proyectos<br>
✅ Firmar contratos digitales<br>
✅ Llevar tu contabilidad al día<br>
✅ Y mucho más...
</p>
<p style="margin-top:20px"><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexus.app'}/dashboard" class="btn">Ir al Dashboard</a></p>`,
  }
}

export function portalInviteEmail(clientName, portalUrl) {
  return {
    subject: `${clientName} te invitó a su portal de cliente`,
    html: `<h2 style="margin-bottom:16px">Hola,</h2>
<p><strong>${clientName}</strong> te ha invitado a su portal exclusivo de cliente en NEXUS.</p>
<p>Desde acá podés:</p>
<p style="padding-left:16px">
✅ Ver y aprobar propuestas<br>
✅ Firmar contratos digitales<br>
✅ Consultar facturas y pagos
</p>
<p><a href="${portalUrl}" class="btn">Ingresar al Portal</a></p>
<p style="color:#94a3b8;font-size:13px;margin-top:16px">Este enlace es único y personal. No lo compartas.</p>`,
  }
}

export function invoiceReminderEmail(invoiceNumber, amount, dueDate) {
  return {
    subject: `Recordatorio de factura #${invoiceNumber}`,
    html: `<h2 style="margin-bottom:16px">Recordatorio de pago</h2>
<p>Te recordamos que la factura <strong>#${invoiceNumber}</strong> por <strong>$${amount}</strong> está pendiente de pago.</p>
<p><strong>Vencimiento:</strong> ${dueDate}</p>
<p>Si ya realizaste el pago, ignorá este mensaje.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexus.app'}/dashboard/invoices" class="btn">Ver Factura</a></p>`,
  }
}

export function affiliateInviteEmail({ affiliateName, affiliateLink, clientName, clientEmail }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ionexus.pro'
  return {
    subject: `${affiliateName} te invita a NEXUS — Gestioná tu freelance como un profesional`,
    html: `<table cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;margin:0 auto;font-family:Inter,Arial,sans-serif;background:#0a0a0f;border-radius:16px;overflow:hidden">
  <tr>
    <td style="background:linear-gradient(135deg,#7c3aed,#a78bfa);padding:36px 32px 32px;text-align:center">
      <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      </div>
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 4px;letter-spacing:-0.3px">Te invitaron a NEXUS</h1>
      <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0">Un ecosistema completo para freelancers</p>
    </td>
  </tr>
  <tr>
    <td style="padding:36px 32px;background:#fff">
      <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 8px">
        Hola${clientName ? ` ${clientName}` : ''},
      </p>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px">
        <strong style="color:#1e293b">${affiliateName}</strong> te invita a sumarte a <strong style="color:#7c3aed">NEXUS</strong>, el sistema operativo que usan miles de freelancers para gestionar su negocio.
      </p>

      <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:24px;color:#7c3aed;font-size:16px">✦</td>
          <td style="padding:8px 0;color:#475569;font-size:14px;line-height:1.5">Dashboard con métricas en tiempo real de ingresos, gastos y ganancias</td>
        </tr>
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:24px;color:#7c3aed;font-size:16px">✦</td>
          <td style="padding:8px 0;color:#475569;font-size:14px;line-height:1.5">Facturas con link de pago Stripe — cobrá al instante</td>
        </tr>
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:24px;color:#7c3aed;font-size:16px">✦</td>
          <td style="padding:8px 0;color:#475569;font-size:14px;line-height:1.5">Contratos con validez legal generados por IA en segundos</td>
        </tr>
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:24px;color:#7c3aed;font-size:16px">✦</td>
          <td style="padding:8px 0;color:#475569;font-size:14px;line-height:1.5">Propuestas profesionales que convierten 2x más</td>
        </tr>
        <tr>
          <td style="padding:8px 0;vertical-align:top;width:24px;color:#7c3aed;font-size:16px">✦</td>
          <td style="padding:8px 0;color:#475569;font-size:14px;line-height:1.5">Portal de cliente — ellos ven propuestas, contratos y facturas</td>
        </tr>
      </table>

      <div style="background:#f5f3ff;border:1px solid #e0d4fc;border-radius:12px;padding:24px;margin:0 0 24px;text-align:center">
        <p style="font-size:13px;color:#6b7280;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px">Link de invitación</p>
        <a href="${affiliateLink}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:16px">Unirme a NEXUS gratis →</a>
        <p style="font-size:12px;color:#94a3b8;margin:10px 0 0">Sin compromiso • 7 días gratis • Cancelá cuando quieras</p>
      </div>

      <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:0;text-align:center">
        ¿Preguntas? Escribile a ${affiliateName} o respondé este correo.
      </p>
    </td>
  </tr>
  <tr>
    <td style="background:#f8fafc;padding:24px 32px;text-align:center;border-top:1px solid #e2e8f0">
      <p style="color:#94a3b8;font-size:12px;margin:0 0 4px">NEXUS — El Sistema Operativo Freelance</p>
      <p style="color:#cbd5e1;font-size:11px;margin:0">Si no pediste esta invitación, ignorá este correo.</p>
    </td>
  </tr>
</table>`,
  }
}


// ═══════════════════════════════════════════
// EMAIL MARKETING — Trial Sequence (7 days)
// ═══════════════════════════════════════════

export function trialDayEmail(day, name) {
  const emails = {
    1: {
      subject: '🎯 Día 1 — Tu primer paso en NEXUS',
      html: `<h2 style="margin-bottom:16px">¡Arrancamos, ${name}!</h2>
<p>Bienvenido al día 1 de tu prueba gratuita. Hoy te voy a mostrar las herramientas esenciales para que empieces a organizar tu negocio.</p>
<p style="padding-left:16px">
✅ <strong>Task Manager:</strong> Creá tu primera tarea<br>
✅ <strong>Quick Notes:</strong> Capturá una idea al instante<br>
✅ <strong>Client Directory:</strong> Agregá tu primer cliente
</p>
<p>No necesitas configuración previa. Solo entrá y probá.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ionexus.pro'}/dashboard" class="btn">Ir al Dashboard</a></p>`,
    },
    2: {
      subject: '📊 Día 2 — Organizá tus proyectos',
      html: `<h2 style="margin-bottom:16px">Proyectos al día, ${name}</h2>
<p>El día 2 es para que empieces a ver el poder de NEXUS. El Pipeline CRM y Kanban Projects te van a cambiar la forma de trabajar.</p>
<p style="padding-left:16px">
📊 <strong>Pipeline CRM:</strong> Seguí tus leads en 7 etapas<br>
📋 <strong>Kanban Projects:</strong> Arrastrá y soltá tus tareas<br>
⏱️ <strong>Time Tracker:</strong> Registrá tu tiempo y facturá
</p>
<p>¿Probaste el Pipeline?</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ionexus.pro'}/dashboard/pipeline" class="btn">Ir a Pipeline</a></p>`,
    },
    3: {
      subject: '🤖 Día 3 — IA que trabaja por vos',
      html: `<h2 style="margin-bottom:16px">Tu asistente IA, ${name}</h2>
<p>NEXUS tiene 9 herramientas de IA integradas. Escribí emails, propuestas, contratos y más con un solo clic.</p>
<p style="padding-left:16px">
✍️ <strong>AI Email Writer:</strong> Respondé clientes al instante<br>
📄 <strong>AI Proposal:</strong> Propuestas que cierran ventas<br>
⚖️ <strong>AI Contract:</strong> Contratos profesionales en 10 segundos
</p>
<p>Probá la IA ahora:</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ionexus.pro'}/dashboard/ai" class="btn">Probar AI Tools</a></p>`,
    },
    4: {
      subject: '💰 Día 4 — Facturá y cobrá online',
      html: `<h2 style="margin-bottom:16px">Llega el dinero, ${name}</h2>
<p>Con NEXUS podés facturar y cobrar con Stripe directo desde la plataforma. Tus clientes reciben un portal exclusivo.</p>
<p style="padding-left:16px">
💳 <strong>Facturas + Stripe:</strong> Cobrá con tarjeta<br>
🔗 <strong>Client Portal:</strong> Tu cliente ve todo online<br>
📈 <strong>Tax Dashboard:</strong> Reportes financieros automáticos
</p>
<p>¿Vas a facturar este mes? Hacelo con NEXUS.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ionexus.pro'}/dashboard/invoices" class="btn">Crear Factura</a></p>`,
    },
    5: {
      subject: '🤝 Día 5 — Crece con tu red',
      html: `<h2 style="margin-bottom:16px">Tu red = tus ingresos, ${name}</h2>
<p>NEXUS tiene un sistema de afiliados que te paga automáticamente. Compartí tu link único y ganá 25% recurrente.</p>
<p style="padding-left:16px">
🔗 <strong>Link único:</strong> Cada miembro tiene su código<br>
🎰 <strong>100 promos semanales:</strong> Comisiones de hasta 75%<br>
💸 <strong>Pagos automáticos:</strong> Stripe Connect, sin intervención
</p>
<p>100 promociones rotan cada semana. Revisá cuál está activa hoy.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ionexus.pro'}/dashboard/affiliate" class="btn">Ver mi Link de Afiliado</a></p>`,
    },
    6: {
      subject: '🔥 Día 6 — Esto es lo que te estás perdiendo',
      html: `<h2 style="margin-bottom:16px">${name}, ya casi se termina la prueba</h2>
<p>Te quedan <strong>2 días</strong> de prueba gratuita. Estos son algunos números de gente que ya usa NEXUS:</p>
<p style="padding-left:16px;background:#f8fafc;padding:16px;border-radius:8px;margin:16px 0">
⭐ <strong>98%</strong> de satisfacción<br>
📈 +42% de facturación promedio en el primer mes<br>
⏱️ 3 horas/semana ahorradas en administración<br>
🏆 Más de 5,000 freelancers activos
</p>
<p>No dejes pasar esta oportunidad. Elegí tu plan hoy y seguí escalando.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ionexus.pro'}/pricing" class="btn">Ver Planes</a></p>`,
    },
    7: {
      subject: '⏰ Día 7 — Último día de tu prueba gratis',
      html: `<h2 style="margin-bottom:16px">HOY es el día, ${name}</h2>
<p>Tu prueba gratuita de 7 días <strong>termina HOY</strong>. Si no elegís un plan, vas a perder el acceso a todas las herramientas que probaste esta semana.</p>
<p style="text-align:center;font-size:24px;font-weight:700;color:#7c3aed;padding:16px;background:#f5f3ff;border-radius:8px;margin:16px 0">
  🚀 Starter desde $199/mes<br>
  <span style="font-size:14px;font-weight:400;color:#6b7280">7 días gratis, cancelá cuando quieras</span>
</p>
<p>Elegí el plan que mejor se adapte a tu negocio:</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ionexus.pro'}/pricing" class="btn">Elegir mi Plan</a></p>
<p style="font-size:13px;color:#94a3b8">PD: Si ya te suscribiste, ignorá este mensaje y seguí disfrutando NEXUS 🚀</p>`,
    },
  }

  return emails[day] || {
    subject: `📬 Día ${day} — Seguí explorando NEXUS`,
    html: `<h2 style="margin-bottom:16px">Seguimos, ${name}</h2>
<p>Seguí usando NEXUS y descubrí todo lo que puede hacer por tu negocio.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ionexus.pro'}/dashboard" class="btn">Ir al Dashboard</a></p>`,
  }
}

// ═══════════════════════════════════════════
// EMAIL MARKETING — Upgrade Emails
// ═══════════════════════════════════════════

export function upgradeStarterToPro(name) {
  return {
    subject: '🚀 Pasate a Profesional y duplicá tu productividad',
    html: `<h2 style="margin-bottom:16px">${name}, ya estás listo para el siguiente nivel</h2>
<p>Llevás un tiempo con NEXUS Starter y vemos que le estás sacando provecho. Es hora de dar el salto a <strong>Profesional</strong>.</p>
<p style="padding-left:16px">
✅ <strong>Clientes ilimitados</strong> — sin límites<br>
✅ <strong>Generador de Propuestas</strong> — cerrá más ventas<br>
✅ <strong>Contratos + Firma Digital</strong> — profesional al instante<br>
✅ <strong>File Vault + Google Drive</strong> — almacenamiento sin fin<br>
✅ <strong>Portal para Clientes</strong> — ellos ven todo online<br>
✅ <strong>Sistema de Afiliados</strong> — ingresos pasivos
</p>
<p style="text-align:center;font-size:20px;font-weight:700;color:#7c3aed;padding:12px;background:#f5f3ff;border-radius:8px;margin:16px 0">
  Upgrade a Profesional: <span style="font-size:24px">$599/mes</span>
</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ionexus.pro'}/pricing" class="btn">Actualizar a Profesional</a></p>`,
  }
}

export function upgradeProToAI(name) {
  return {
    subject: '🤖 Potenciá tu negocio con IA — Upgrade a Pro + AI',
    html: `<h2 style="margin-bottom:16px">${name}, llevá tu freelance al futuro con IA</h2>
<p>Ya usás NEXUS Profesional y sabés lo que es trabajar en serio. Ahora imaginate todo eso <strong>potenciado con Inteligencia Artificial</strong>.</p>
<p style="padding-left:16px">
🤖 <strong>AI Email Writer:</strong> Respondé emails en segundos<br>
✍️ <strong>AI Bio Writer:</strong> Bio profesional para tus redes<br>
📄 <strong>AI Proposal Enhancer:</strong> Propuestas que convierten más<br>
🔄 <strong>AI Content Rewriter:</strong> Adaptá tu contenido al instante<br>
⚖️ <strong>AI Contract Generator:</strong> Contratos sin errores
</p>
<p>Dejá que la IA haga el trabajo pesado mientras vos te enfocás en lo que importa: hacer crecer tu negocio.</p>
<p style="text-align:center;font-size:20px;font-weight:700;color:#7c3aed;padding:12px;background:#f5f3ff;border-radius:8px;margin:16px 0">
  Upgrade a Pro + AI: <span style="font-size:24px">$999/mes</span>
</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ionexus.pro'}/pricing" class="btn">Actualizar a Pro + AI</a></p>`,
  }
}
