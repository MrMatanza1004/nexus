# Design: WhatsApp Gateway + Autoresponder Bot

## Technical Approach

Docker sidecar: OpenWA (whatsapp-web.js + Puppeteer) runs on a VPS container; NEXUS on Vercel talks HTTP REST + webhooks. Four new Supabase tables under RLS, sequential bot rule evaluation (priority ASC, first match wins), `openwa.js` client mirroring `nango.js` singleton pattern.

## Architecture Decisions

### Sidecar over embedded
| Option | Tradeoff | Verdict |
|--------|----------|---------|
| Embedded in Next.js | Puppeteer can't run on serverless (no Chrome, 30s limit) | ❌ |
| Next.js Node server | Defeats Vercel deployment | ❌ |
| **OpenWA Docker sidecar** | $6-10/mo VPS, clean process isolation | ✅ |

**Rationale**: whatsapp-web.js needs a long-lived Chrome (~400MB RAM). Vercel serverless can't run it.

### HTTP REST over WebSocket
| Option | Tradeoff | Verdict |
|--------|----------|---------|
| WebSocket | Vercel can't hold persistent sockets | ❌ |
| **HTTP + webhooks** | Request-response; OpenWA calls back on events | ✅ |

**Rationale**: NEXUS is stateless on Vercel. OpenWA natively supports webhooks.

### Sequential eval over DAG
| Option | Tradeoff | Verdict |
|--------|----------|---------|
| Complex DAG engine | Overkill for 4 trigger types | ❌ |
| **Sequential eval** | Priority ASC, first match wins. O(n), testable | ✅ |

**Rationale**: No rule depends on another's output. Simple trigger types don't need branching logic.

### New tables over extending existing
**Rationale**: WhatsApp data lifecycle differs from existing entities.

## Data Flow

```
INCOMING: WhatsApp → OpenWA → POST /api/whatsapp/webhook → NEXUS
  ├─ Store message
  ├─ Contact link (normalize phone → clients.phone)
  └─ Bot eval → match? → POST OpenWA /send → WhatsApp

OUTGOING: Dashboard → POST /api/whatsapp/send → NEXUS → OpenWA REST → WhatsApp

QR: Dashboard → POST /api/whatsapp/session/connect → NEXUS → OpenWA /sessions/add → QR
    Poll GET /api/whatsapp/session/status until scanned
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/integrations/openwa.js` | Create | OpenWA API client singleton |
| `src/app/api/whatsapp/webhook/route.js` | Create | Webhook: message, ack, disconnect |
| `src/app/api/whatsapp/session/connect/route.js` | Create | Create session, return QR |
| `src/app/api/whatsapp/session/status/route.js` | Create | Poll session state |
| `src/app/api/whatsapp/session/disconnect/route.js` | Create | Logout session |
| `src/app/api/whatsapp/send/route.js` | Create | Proxy send to OpenWA |
| `src/app/api/whatsapp/bot-rules/route.js` | Create | CRUD bot rules |
| `src/app/api/whatsapp/contacts/route.js` | Create | Contact list |
| `src/app/dashboard/whatsapp/page.js` | Create | WhatsApp section page |
| `src/components/WhatsAppQR.js` | Create | QR display + countdown poll |
| `src/components/WhatsAppBotRules.js` | Create | Rule editor |
| `src/components/WhatsAppContacts.js` | Create | Contact list component |
| `src/components/WhatsAppSendMessage.js` | Create | Message compose form |
| `src/lib/whatsapp.js` | Create | Webhook verify, dedup, bot evaluator |
| `src/lib/constants.js` | Modify | Add `WHATSAPP_EVENTS`, `BOT_COOLDOWN_SECONDS`, `QR_EXPIRY_SECONDS` |
| `src/app/dashboard/layout.js` | Modify | Add WhatsApp nav item under "Operaciones" |
| `supabase/migrations/20250603000003_whatsapp.sql` | Create | 4 tables + RLS + indexes |
| `.env.example` | Modify | `OPENWA_BASE_URL`, `OPENWA_MASTER_KEY`, `OPENWA_WEBHOOK_SECRET` |

## Interfaces / Contracts

### OpenWA REST API (consumed by NEXUS, all with `X-Master-Key` header)
```
POST /sessions/add              → { qr, pairingCode }
GET  /sessions/{id}/status      → { status: "connected|scanning|disconnected|expired" }
POST /sessions/{id}/send        → { eventId, status }
     Body: { to: "5212345@c.us", text: "..." }
```

### NEXUS Webhook Receiver (from OpenWA)
```
POST /api/whatsapp/webhook
Headers: { x-webhook-secret: OPENWA_WEBHOOK_SECRET }
Body: { event: "message|ack|disconnected", sessionId, eventId, data: { from, body } }
→ 200 { received: true }
```
Dedup: skip if same `eventId` seen within 5 min.

### NEXUS Dashboard API (all scoped to authenticated user)
```
POST /api/whatsapp/session/connect     → { qr, pairingCode, expiresIn: 60 }
GET  /api/whatsapp/session/status      → { status, qr? }
POST /api/whatsapp/session/disconnect   → 200
POST /api/whatsapp/send                 → { eventId, status: "pending" }
GET  /api/whatsapp/bot-rules            → [...rules]
POST /api/whatsapp/bot-rules            → 201
PATCH /api/whatsapp/bot-rules/{id}      → updated rule
DELETE /api/whatsapp/bot-rules/{id}     → 200
GET  /api/whatsapp/contacts?page=1      → { contacts, total, page }
```

## SQL Schema: 4 Tables

All tables: `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`, `user_id UUID REFERENCES profiles(id) ON DELETE CASCADE`, `created_at TIMESTAMPTZ DEFAULT NOW()`. RLS: `USING (auth.uid() = user_id)`.

- **whatsapp_sessions**: user_id UNIQUE, status CHECK(`disconnected|scanning|connected|expired`), qr_code, pairing_code, updated_at trigger
- **whatsapp_contacts**: wa_chat_id UNIQUE per user, client_id FK→clients ON DELETE SET NULL, phone, name
- **whatsapp_messages**: event_id UNIQUE (dedup), direction CHECK(`incoming|outgoing`), status CHECK(`pending|delivered|read|failed`), bot_responded, bot_cooldown_skipped
- **whatsapp_bot_rules**: trigger CHECK(`keyword|regex|any_message|hours_inactive`), keyword, pattern, response, priority, enabled, cooldown_seconds, hours_inactive, match_count, updated_at trigger

Indexes on user_id and event_id; contact phone for client matching.

## Testing

- **Unit**: Bot evaluator + openwa.js client (Vitest with mocks)
- **Integration**: Webhook signatures, dedup (Vitest + mocked Supabase)
- **Manual**: QR flow + E2E on staging VPS

## Migration

4 SQL tables via Supabase migration. WhatsApp nav renders only if `OPENWA_BASE_URL` is set. VPS provisioning is out of scope but required before dashboard goes live.
