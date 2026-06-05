// Price IDs hardcoded — Stripe product prices (MXN)
// Starter: $199/mes, Pro: $599/mes, AI: $999/mes

export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 199,
    priceId: 'price_1TceAHIKNlA3QlU4l77jf9Lv',
    currency: 'MXN',
    features: [
      'Task Manager',
      'Quick Notes',
      'Pomodoro Timer',
      'Daily Journal',
      'Client Directory (5 clients)',
      'Dashboard básico',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Profesional',
    price: 599,
    priceId: 'price_1TceALIKNlA3QlU4AQulK1AI',
    currency: 'MXN',
    features: [
      'TODAS las herramientas',
      'Clientes ilimitados',
      'Generador de Propuestas',
      'Generador de Contratos',
      'Generador de Facturas',
      'Time Tracker',
      'Kanban Projects',
      'File Vault',
      'Sistema de Afiliados',
      'Metas y objetivos',
      'Historial completo',
      'Portal para clientes',
    ],
  },
  ai: {
    id: 'ai',
    name: 'Profesional + AI',
    price: 999,
    priceId: 'price_1TceAOIKNlA3QlU4FyCto5ie',
    currency: 'MXN',
    features: [
      'Todo lo del plan Pro',
      'AI Email Writer',
      'AI Bio Writer',
      'AI Proposal Enhancer',
      'AI Content Rewriter',
    ],
  },
}

export const AFFILIATE_COMMISSION_RATE = 0.25
export const AFFILIATE_COOKIE_DAYS = 30
export const TRIAL_DAYS = 7
export const SOCIAL_PROOF_INTERVAL = 15000

// Email marketing timing
export const UPGRADE_STARTER_DAYS = 14   // Days on Starter before upgrade email
export const UPGRADE_PRO_DAYS = 30        // Days on Pro before upgrade email
export const TRIAL_SEQUENCE_DAYS = 7      // Days of daily trial emails

// ─── WhatsApp ───
export const WHATSAPP_EVENTS = ['message.received', 'message.ack', 'session.status', 'session.disconnected']
export const BOT_COOLDOWN_SECONDS = 60
export const QR_EXPIRY_SECONDS = 120
