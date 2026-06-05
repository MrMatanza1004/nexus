/**
 * URL Configuration for NEXUS
 *
 * Different URLs for different contexts:
 * - PUBLIC_URL: used for links shared with external users (affiliate, etc.)
 * - APP_URL: used for internal redirects and current environment
 * - GOOGLE_DRIVE_REDIRECT_URI: must match Google Cloud Console exactly
 */

// Production URL — always used for external-facing links (affiliate, etc.)
const PRODUCTION_URL = 'https://ionexus.pro'

/**
 * Ensures a URL string always has a scheme (https:// by default).
 * This prevents errors when env vars are set without a scheme (e.g. "ionexus.pro").
 */
function ensureScheme(url, defaultScheme = 'https://') {
  if (!url) return PRODUCTION_URL
  if (/^https?:\/\//i.test(url)) return url
  return `${defaultScheme}${url}`
}

/**
 * Public URL shown to external users (affiliate links, etc.)
 * Configure via NEXT_PUBLIC_PUBLIC_URL env var, defaults to production.
 */
export function getPublicUrl() {
  return ensureScheme(process.env.NEXT_PUBLIC_PUBLIC_URL || PRODUCTION_URL)
}

/**
 * Current app URL — used for internal redirects and callbacks.
 * Falls back to NEXT_PUBLIC_SITE_URL → NEXT_PUBLIC_APP_URL → window.location.origin
 */
export function getAppUrl() {
  // Helper to check if an env var is a non‑empty string
  const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== ''

  // Prefer NEXT_PUBLIC_SITE_URL, then NEXT_PUBLIC_APP_URL if defined
  const envUrl = isNonEmptyString(process.env.NEXT_PUBLIC_SITE_URL)
    ? process.env.NEXT_PUBLIC_SITE_URL
    : isNonEmptyString(process.env.NEXT_PUBLIC_APP_URL)
      ? process.env.NEXT_PUBLIC_APP_URL
      : undefined

  // Fallback to window.location.origin in the browser, otherwise production URL
  const fallback = typeof window !== 'undefined' ? window.location.origin : PRODUCTION_URL

  const rawUrl = envUrl || fallback
  return ensureScheme(rawUrl.replace(/\/$/, ''))
}

/**
 * Build an affiliate tracking link
 * Always uses the public URL since these are shared externally.
 */
export function getAffiliateLink(code) {
  return `${getPublicUrl()}/api/affiliate/track?code=${code}&landing=/register`
}

/**
 * Google Drive OAuth redirect URI
 * Must match exactly what's configured in Google Cloud Console.
 * Override via GOOGLE_DRIVE_REDIRECT_URI env var for local development.
 */
export function getGoogleDriveRedirectUri() {
  return process.env.GOOGLE_DRIVE_REDIRECT_URI
    || `${PRODUCTION_URL}/api/google-drive/callback`
}

/**
 * Email from address — uses configured domain or falls back to production
 */
export function getEmailFrom(name = 'NEXUS') {
  const domain = process.env.EMAIL_DOMAIN || 'ionexus.pro'
  return `${name} <${process.env.EMAIL_FROM || `notificaciones@${domain}`}>`
}
