/**
 * OpenWA API client — WhatsApp gateway sidecar.
 * Singleton pattern matching nango.js.
 */
let openwaClient = null

export function getOpenwaClient() {
  if (!openwaClient) {
    const baseUrl = process.env.OPENWA_BASE_URL
    const masterKey = process.env.OPENWA_MASTER_KEY
    if (!baseUrl || !masterKey) return null
    openwaClient = new OpenwaClient(baseUrl, masterKey)
  }
  return openwaClient
}

class OpenwaClient {
  constructor(baseUrl, masterKey) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.masterKey = masterKey
  }

  async _fetch(path, options = {}) {
    const url = `${this.baseUrl}${path}`
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': this.masterKey,
        ...options.headers,
      },
    })

    if (!res.ok) {
      const err = await res.text().catch(() => '')
      throw new Error(`OpenWA API error ${res.status}${err ? ` — ${err}` : ''}`)
    }

    return res.json()
  }

  /**
   * Create a new WhatsApp session, returns QR code.
   * POST /sessions/add
   */
  async createSession(sessionName) {
    return this._fetch('/sessions/add', {
      method: 'POST',
      body: JSON.stringify({ sessionName }),
    })
  }

  /**
   * Get current session status.
   * GET /sessions/{sessionId}/status
   */
  async getSessionStatus(sessionId) {
    return this._fetch(`/sessions/${encodeURIComponent(sessionId)}/status`)
  }

  /**
   * Send a text message via OpenWA.
   * POST /sessions/{sessionId}/send
   */
  async sendMessage(sessionId, chatId, text) {
    return this._fetch(`/sessions/${encodeURIComponent(sessionId)}/send`, {
      method: 'POST',
      body: JSON.stringify({ to: chatId, text }),
    })
  }

  /**
   * Delete/logout a WhatsApp session.
   * POST /sessions/{sessionId}/delete
   */
  async deleteSession(sessionId) {
    return this._fetch(`/sessions/${encodeURIComponent(sessionId)}/delete`, {
      method: 'POST',
    })
  }
}

/**
 * Obtiene el access token vigente de OpenWA para una sesión.
 * Mantiene consistencia con el patrón getNangoAccessToken.
 */
export async function getOpenwaAccessToken(sessionId) {
  const client = getOpenwaClient()
  if (!client) throw new Error('OPENWA_BASE_URL o OPENWA_MASTER_KEY no configurados')

  const data = await client.getSessionStatus(sessionId)
  return data?.status
}

/**
 * Verify an OpenWA session is still connected.
 */
export async function checkSessionValid(sessionId) {
  try {
    const client = getOpenwaClient()
    if (!client) return false
    const data = await client.getSessionStatus(sessionId)
    return data?.status === 'connected'
  } catch {
    return false
  }
}
