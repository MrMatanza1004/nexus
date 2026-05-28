export function generateAffiliateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
  }).format(new Date(date))
}

export function formatDateShort(date) {
  return new Intl.DateTimeFormat('es', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function timeAgo(date) {
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 2) return 'ahora mismo'
  if (minutes < 60) return `hace ${minutes} min`
  if (hours < 24) return `hace ${hours}h`
  return `hace ${days}d`
}

export function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function invoiceNumber(userId, count) {
  const prefix = 'FAC'
  const num = String(count + 1).padStart(4, '0')
  return `${prefix}-${num}`
}

export function calculateCommission(amount, rate = 0.25) {
  return amount * rate
}
