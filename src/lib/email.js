import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM = 'NEXUS <notifications@nexus.app>'

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
