export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 9,
    priceId: 'price_starter', // Replace with Stripe price ID
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
    price: 29,
    priceId: 'price_pro',
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
    price: 49,
    priceId: 'price_ai',
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
