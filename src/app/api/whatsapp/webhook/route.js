import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  verifyWebhookSignature,
  isDuplicateEvent,
  createBotEvaluator,
  executeBotRule,
  normalizePhone,
} from '../../../../lib/whatsapp.js'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const secret = process.env.OPENWA_WEBHOOK_SECRET
    if (!secret) {
      console.error('Missing OPENWA_WEBHOOK_SECRET')
      return NextResponse.json({ error: 'Server config error' }, { status: 500 })
    }

    const signature = req.headers.get('x-webhook-secret')
    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook secret header' }, { status: 401 })
    }

    // Verify the webhook secret using constant-time comparison
    const body = await req.text()
    if (!verifyWebhookSignature(body, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    const { event, sessionId, eventId, data } = payload

    // Dedup check — skip if same eventId seen within 5 min
    if (eventId && isDuplicateEvent(eventId)) {
      return NextResponse.json({ received: true, deduped: true })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    switch (event) {
      case 'message.received': {
        // Find session by openwa_session_id (include openwa_session_id for bot sends)
        const { data: session } = await supabase
          .from('whatsapp_sessions')
          .select('id, user_id, openwa_session_id')
          .eq('openwa_session_id', sessionId)
          .single()

        if (!session) {
          console.error(`[WEBHOOK] No session found for openwa_session_id: ${sessionId}`)
          break
        }

        const userId = session.user_id
        const waChatId = data?.from
        const messageText = data?.body
        const pushName = data?.pushName

        if (!waChatId) break

        // ── Task 3.5: Read existing contact before upsert (for hours_inactive trigger) ──
        const { data: existingContact } = await supabase
          .from('whatsapp_contacts')
          .select('last_message_at, client_id')
          .eq('user_id', userId)
          .eq('wa_chat_id', waChatId)
          .maybeSingle()

        const contactLastMessageAt = existingContact?.last_message_at || null

        // ── Upsert contact (create or update last_message_at) ──
        await supabase
          .from('whatsapp_contacts')
          .upsert({
            user_id: userId,
            wa_chat_id: waChatId,
            wa_push_name: pushName || null,
            last_message_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,wa_chat_id',
          })

        // ── Store incoming message ──
        const { data: storedMessage } = await supabase
          .from('whatsapp_messages')
          .insert({
            user_id: userId,
            session_id: session.id,
            wa_message_id: eventId || null,
            chat_id: waChatId,
            direction: 'inbound',
            content: messageText || null,
            status: 'delivered',
          })
          .select()
          .single()

        // ── Task 3.5: Contact-to-client linking ──
        if (!existingContact?.client_id) {
          const phone = normalizePhone(waChatId)
          if (phone) {
            const { data: matchingClient } = await supabase
              .from('clients')
              .select('id, name')
              .eq('user_id', userId)
              .eq('phone', phone)
              .maybeSingle()

            if (matchingClient) {
              await supabase
                .from('whatsapp_contacts')
                .update({ client_id: matchingClient.id })
                .eq('user_id', userId)
                .eq('wa_chat_id', waChatId)
            }
          }
        }

        // ── Task 3.3 + 3.2: Bot evaluation + cooldown ──
        if (storedMessage && messageText) {
          // Get client name for template substitution if contact already linked
          let clientName = null
          if (existingContact?.client_id) {
            const { data: client } = await supabase
              .from('clients')
              .select('name')
              .eq('id', existingContact.client_id)
              .single()
            clientName = client?.name || null
          }

          const evaluator = createBotEvaluator(supabase)
          const evalResult = await evaluator({
            userId,
            message: messageText,
            chatId: waChatId,
            contactLastMessageAt,
            contactName: pushName || null,
            clientName,
          })

          if (evalResult.matched) {
            try {
              const { eventId: sendEventId } = await executeBotRule(
                supabase,
                session.openwa_session_id,
                waChatId,
                evalResult.response
              )

              // Store bot response outbound message
              await supabase
                .from('whatsapp_messages')
                .insert({
                  user_id: userId,
                  session_id: session.id,
                  wa_message_id: sendEventId || null,
                  chat_id: waChatId,
                  direction: 'outbound',
                  content: evalResult.response,
                  status: 'sent',
                  rule_id: evalResult.rule.id,
                })

              // Mark original inbound message as bot_responded
              await supabase
                .from('whatsapp_messages')
                .update({ bot_responded: true })
                .eq('id', storedMessage.id)
            } catch (err) {
              console.error('[BOT] Failed to send or record response:', err.message)
            }
          } else if (evalResult.cooldown) {
            // Cooldown active — mark on original message
            await supabase
              .from('whatsapp_messages')
              .update({ bot_cooldown_skipped: true })
              .eq('id', storedMessage.id)
          }
        }

        break
      }

      case 'message.ack': {
        // Update message delivery status from ack
        const waMessageId = data?.messageId || eventId
        const ackStatus = data?.status === 'read' ? 'read' : 'delivered'

        if (waMessageId) {
          await supabase
            .from('whatsapp_messages')
            .update({ status: ackStatus })
            .eq('wa_message_id', waMessageId)
        }
        break
      }

      case 'session.status': {
        // Update session status (connected, scanning, etc.)
        const phoneNumber = data?.phoneNumber || data?.phone_number

        if (sessionId) {
          const updateData = { status: data?.status || 'disconnected' }
          if (phoneNumber) updateData.phone_number = phoneNumber
          if (data?.status === 'connected') updateData.connected_at = new Date().toISOString()

          await supabase
            .from('whatsapp_sessions')
            .update(updateData)
            .eq('openwa_session_id', sessionId)
        }
        break
      }

      case 'session.disconnected': {
        if (sessionId) {
          await supabase
            .from('whatsapp_sessions')
            .update({ status: 'disconnected' })
            .eq('openwa_session_id', sessionId)
        }
        break
      }

      default:
        console.log(`[WEBHOOK] Unhandled event: ${event}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    // Always return 200 to prevent OpenWA from retrying on parse errors
    return NextResponse.json({ received: true })
  }
}
