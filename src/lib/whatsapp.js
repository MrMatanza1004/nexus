import { timingSafeEqual } from 'crypto'
import { getOpenwaClient } from '../integrations/openwa.js'
import { BOT_COOLDOWN_SECONDS } from './constants.js'

/**
 * In-memory dedup store for webhook event IDs.
 * Entries expire after 5 minutes.
 */
const dedupMap = new Map()
const DEDUP_TTL_MS = 5 * 60 * 1000

// Periodic cleanup every 5 minutes
let cleanupInterval = null
function ensureCleanup() {
  if (cleanupInterval) return
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, expiry] of dedupMap) {
      if (now > expiry) dedupMap.delete(key)
    }
  }, DEDUP_TTL_MS)
}

/**
 * Check if an eventId was already processed within the 5-min window.
 * Returns true if already seen (should skip), false if new.
 */
export function isDuplicateEvent(eventId) {
  if (!eventId) return false
  if (dedupMap.has(eventId)) return true

  ensureCleanup()
  dedupMap.set(eventId, Date.now() + DEDUP_TTL_MS)
  return false
}

/**
 * Verify webhook signature using constant-time comparison.
 * Compares the request header against the configured secret.
 */
export function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !secret) return false

  const sigBuf = Buffer.from(signature, 'utf-8')
  const secretBuf = Buffer.from(secret, 'utf-8')

  if (sigBuf.length !== secretBuf.length) return false

  try {
    return timingSafeEqual(sigBuf, secretBuf)
  } catch {
    return false
  }
}

/**
 * Generate a simple UUID v4 for idempotency keys.
 */
export function generateIdempotencyKey() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Create a bot evaluator for the given Supabase client.
 * Returns an async function that evaluates an incoming message
 * against the user's active rules.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {(context: object) => Promise<{matched: boolean, rule?: object, response?: string, cooldown?: boolean}>}
 */
export function createBotEvaluator(supabase) {
  /**
   * Evaluate a message against the user's active bot rules.
   * Returns the first match with substituted response.
   *
   * @param {object} ctx
   * @param {string} ctx.userId
   * @param {string} ctx.message     — incoming message text
   * @param {string} ctx.chatId      — WhatsApp chat ID (e.g. 521234567890@c.us)
   * @param {string|null} ctx.contactLastMessageAt — contact's last_message_at BEFORE this message
   * @param {string|null} ctx.contactName          — contact pushName for {{name}}
   * @param {string|null} ctx.clientName           — linked client name for {{clientName}}
   * @returns {Promise<{matched: boolean, rule?: object, response?: string, cooldown?: boolean}>}
   */
  return async function evaluate(ctx) {
    const { userId, message, chatId, contactLastMessageAt, contactName, clientName } = ctx || {}
    if (!userId || !message) return { matched: false }

    const { data: rules, error } = await supabase
      .from('whatsapp_bot_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('priority', { ascending: true })

    if (error || !rules || rules.length === 0) return { matched: false }

    for (const rule of rules) {
      const matchResult = await evaluateRule(rule, message, {
        supabase,
        userId,
        chatId,
        contactLastMessageAt,
      })
      if (matchResult) {
        // Task 3.2 — Cooldown enforcement: check if same contact got bot reply recently
        const cooldownResult = await checkCooldown(rule, userId, chatId, supabase)
        if (cooldownResult.cooldownActive) {
          return { matched: false, cooldown: true, rule }
        }

        // Template variable substitution: {{name}} / {{clientName}}
        const response = substituteVariables(rule.response_value, {
          name: contactName || '',
          clientName: clientName || '',
        })

        return { matched: true, rule, response }
      }
    }

    return { matched: false }
  }
}

/**
 * Evaluate a single rule against the message text and context.
 *
 * @param {object} rule
 * @param {string} message
 * @param {object} context
 * @returns {Promise<boolean>}
 */
async function evaluateRule(rule, message, context) {
  switch (rule.trigger_type) {
    case 'any_message':
      return true

    case 'keyword': {
      if (!rule.trigger_value) return false
      const keyword = rule.trigger_value.toLowerCase()
      const text = message.toLowerCase()
      const logic = rule.match_logic || 'contains'

      if (logic === 'exact') return text === keyword
      return text.includes(keyword) // 'contains' (default)
    }

    case 'regex': {
      if (!rule.trigger_value) return false
      try {
        return new RegExp(rule.trigger_value, 'i').test(message)
      } catch {
        return false
      }
    }

    case 'hours_inactive': {
      // Match if contact hasn't messaged in N hours (trigger_value = hours)
      if (!rule.trigger_value) return false
      const hours = parseInt(rule.trigger_value, 10)
      if (isNaN(hours) || hours <= 0) return false

      // No previous message = infinitely inactive → match
      if (!context.contactLastMessageAt) return true

      const lastMsgTime = new Date(context.contactLastMessageAt).getTime()
      const now = Date.now()
      const diffHours = (now - lastMsgTime) / (1000 * 60 * 60)
      return diffHours >= hours
    }

    default:
      return false
  }
}

/**
 * Check cooldown: if same contact received a bot response by the same rule
 * within the rule's cooldown_minutes (falls back to BOT_COOLDOWN_SECONDS).
 *
 * @param {object} rule
 * @param {string} userId
 * @param {string} chatId
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<{cooldownActive: boolean}>}
 */
async function checkCooldown(rule, userId, chatId, supabase) {
  let cooldownMs

  if (rule.cooldown_minutes && rule.cooldown_minutes > 0) {
    cooldownMs = rule.cooldown_minutes * 60 * 1000
  } else {
    // Fall back to global default
    cooldownMs = BOT_COOLDOWN_SECONDS * 1000
  }

  const cooldownSince = new Date(Date.now() - cooldownMs).toISOString()

  const { data: recent } = await supabase
    .from('whatsapp_messages')
    .select('id')
    .eq('user_id', userId)
    .eq('chat_id', chatId)
    .eq('direction', 'outbound')
    .eq('rule_id', rule.id)
    .gte('created_at', cooldownSince)
    .limit(1)

  if (recent && recent.length > 0) {
    return { cooldownActive: true }
  }

  return { cooldownActive: false }
}

/**
 * Substitute {{name}} and {{clientName}} template variables in the response.
 *
 * @param {string} template
 * @param {object} vars
 * @param {string} vars.name
 * @param {string} vars.clientName
 * @returns {string}
 */
function substituteVariables(template, { name, clientName }) {
  return template
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{clientName\}\}/g, clientName)
}

/**
 * Execute a matched bot rule: send the response via OpenWA.
 *
 * @param {object} supabase - Supabase service-role client
 * @param {string} openwaSessionId - OpenWA session ID (not the DB session PK)
 * @param {string} chatId - Full WhatsApp chat ID (with @c.us suffix)
 * @param {string} responseValue - The evaluated response text
 * @returns {Promise<{eventId?: string, status: string}>}
 */
export async function executeBotRule(supabase, openwaSessionId, chatId, responseValue) {
  const client = getOpenwaClient()
  if (!client) {
    throw new Error('OpenWA client not configured — missing OPENWA_BASE_URL or OPENWA_MASTER_KEY')
  }

  const result = await client.sendMessage(openwaSessionId, chatId, responseValue)
  return { eventId: result?.eventId, status: result?.status || 'sent' }
}

/**
 * Normalize a WhatsApp chat ID to a plain phone number.
 * Strips @c.us, @s.whatsapp.net and similar suffixes.
 *
 * @param {string} chatId
 * @returns {string|null}
 */
export function normalizePhone(chatId) {
  if (!chatId) return null
  return chatId.replace(/@.*$/, '')
}
