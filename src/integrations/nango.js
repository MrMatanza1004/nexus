import { Nango } from '@nangohq/node'

let nangoClient = null

export function getNangoClient() {
  if (!nangoClient) {
    const secretKey = process.env.NANGO_API_KEY
    if (!secretKey) return null
    nangoClient = new Nango({ secretKey })
  }
  return nangoClient
}

/**
 * Obtiene el access token vigente de Nango para un provider y connectionId.
 */
export async function getNangoAccessToken(provider, connectionId) {
  const nango = getNangoClient()
  if (!nango) throw new Error('NANGO_API_KEY no configurada')

  const connection = await nango.getConnection(provider, connectionId)
  return connection.credentials?.access_token
}

/**
 * Creates a Nango Connect session for one or more integrations.
 */
export async function createConnectSession(userId, userEmail, integrations = ['google-drive']) {
  const nango = getNangoClient()
  if (!nango) throw new Error('NANGO_API_KEY no configurada')

  const { data } = await nango.createConnectSession({
    tags: {
      end_user_id: userId,
      end_user_email: userEmail,
    },
    allowed_integrations: integrations,
  })

  return data.token
}

/**
 * Verify a Nango connection is still valid.
 */
export async function checkConnectionValid(provider, connectionId) {
  try {
    const nango = getNangoClient()
    if (!nango) return false
    await nango.getConnection(provider, connectionId)
    return true
  } catch {
    return false
  }
}

/**
 * Fetch emails from Gmail API via Nango.
 */
export async function fetchEmails(connectionId, maxResults = 20, query = '') {
  const token = await getNangoAccessToken('google-mail', connectionId)

  // First get message list
  const qs = new URLSearchParams({
    maxResults: String(maxResults),
    q: query,
    labelIds: 'INBOX',
    fields: 'messages(id,threadId),resultSizeEstimate,nextPageToken',
  })

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${qs}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!listRes.ok) {
    const err = await listRes.text()
    throw new Error(`Gmail API list error: ${listRes.status} — ${err}`)
  }

  const listData = await listRes.json()
  const messages = listData.messages || []

  if (messages.length === 0) return { messages: [], resultSizeEstimate: 0 }

  // Get full message details (batch by fetching individually)
  const messageDetails = await Promise.all(
    messages.slice(0, maxResults).map(async (msg) => {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date&fields=id,threadId,labelIds,snippet,payload/headers,internalDate`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!detailRes.ok) return null
      const detail = await detailRes.json()

      // Extract headers into a map
      const headers = {}
      if (detail.payload?.headers) {
        detail.payload.headers.forEach(h => {
          headers[h.name.toLowerCase()] = h.value
        })
      }

      return {
        id: detail.id,
        threadId: detail.threadId,
        labelIds: detail.labelIds || [],
        snippet: detail.snippet || '',
        from: headers.from || '',
        to: headers.to || '',
        subject: headers.subject || '(Sin asunto)',
        date: headers.date || new Date(Number(detail.internalDate)).toISOString(),
        internalDate: detail.internalDate,
      }
    })
  )

  return {
    messages: messageDetails.filter(Boolean),
    resultSizeEstimate: listData.resultSizeEstimate || 0,
    nextPageToken: listData.nextPageToken || null,
  }
}

/**
 * Fetch full thread (all messages in a thread).
 */
export async function fetchThread(connectionId, threadId) {
  const token = await getNangoAccessToken('google-mail', connectionId)

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full&fields=id,messages(id,threadId,labelIds,snippet,payload,internalDate)`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gmail API thread error: ${res.status} — ${err}`)
  }

  const data = await res.json()
  const messages = (data.messages || []).map(msg => {
    const headers = {}
    if (msg.payload?.headers) {
      msg.payload.headers.forEach(h => {
        headers[h.name.toLowerCase()] = h.value
      })
    }

    // Extract body
    let body = ''
    if (msg.payload?.parts) {
      const part = msg.payload.parts.find(p => p.mimeType === 'text/plain')
      if (part?.body?.data) {
        body = Buffer.from(part.body.data, 'base64url').toString('utf-8')
      }
    } else if (msg.payload?.body?.data) {
      body = Buffer.from(msg.payload.body.data, 'base64url').toString('utf-8')
    }

    return {
      id: msg.id,
      threadId: msg.threadId,
      labelIds: msg.labelIds || [],
      snippet: msg.snippet || '',
      from: headers.from || '',
      to: headers.to || '',
      subject: headers.subject || '',
      date: headers.date || '',
      body,
      internalDate: msg.internalDate,
    }
  })

  return { id: data.id, messages }
}

/**
 * Send email via Gmail API.
 */
export async function sendEmail(connectionId, { to, subject, body, cc, bcc }) {
  const token = await getNangoAccessToken('google-mail', connectionId)

  // Build RFC 2822 email
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    body,
  ]

  if (cc) emailLines.splice(2, 0, `Cc: ${cc}`)

  const raw = Buffer.from(emailLines.join('\r\n')).toString('base64url')

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gmail API send error: ${res.status} — ${err}`)
  }

  return await res.json()
}
