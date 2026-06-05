# Tasks: WhatsApp Gateway + Autoresponder Bot

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~910 (19 files: 2 modified, 17 created) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation) → PR 2 (API Core) → PR 3 (Bot + Rules API) → PR 4 (Dashboard UI) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Base |
|------|------|-----------|------|
| 1 | DB migration, env vars, OpenWA client, shared lib | PR 1 | main |
| 2 | Webhook receiver + session endpoints + message send | PR 2 | PR 1 branch |
| 3 | Bot evaluator + bot-rules CRUD + contacts endpoint | PR 3 | PR 2 branch |
| 4 | Dashboard pages + QR component + rule editor + nav | PR 4 | PR 3 branch |

## Phase 1: Foundation

- [x] 1.1 Create `supabase/migrations/20250603000003_whatsapp.sql` — 4 tables (whatsapp_sessions, whatsapp_contacts, whatsapp_messages, whatsapp_bot_rules) with RLS, indexes, update triggers; follow migration pattern from `invoices_v2.sql`
- [x] 1.2 Add `OPENWA_BASE_URL`, `OPENWA_MASTER_KEY`, `OPENWA_WEBHOOK_SECRET` to `.env.example`
- [x] 1.3 Add WhatsApp constants to `src/lib/constants.js`: `WHATSAPP_EVENTS`, `BOT_COOLDOWN_SECONDS`, `QR_EXPIRY_SECONDS`
- [x] 1.4 Create `src/integrations/openwa.js` — singleton client mirroring `nango.js` pattern: `getOpenwaClient()`, methods for `createSession`, `getSessionStatus`, `sendMessage` via `X-Master-Key` auth
- [x] 1.5 Create `src/lib/whatsapp.js` — webhook signature verification (secret header check), event dedup (in-memory Map with 5min TTL), bot evaluator stub

## Phase 2: API Layer

- [x] 2.1 Create `src/app/api/whatsapp/webhook/route.js` — POST handler verifying `x-webhook-secret`, dispatching `message`, `ack`, `disconnected` events; dedup via eventId; 401 on invalid secret; pattern from `resend/webhook/route.js`
- [x] 2.2 Create `src/app/api/whatsapp/session/connect/route.js` — POST, calls OpenWA `/sessions/add`, inserts/upserts row in `whatsapp_sessions` with status `scanning`, returns `{ qr, pairingCode, expiresIn }`
- [x] 2.3 Create `src/app/api/whatsapp/session/status/route.js` — GET, queries `whatsapp_sessions` for current user; returns `{ status, qr? }` or `{ status: "disconnected" }`
- [x] 2.4 Create `src/app/api/whatsapp/session/disconnect/route.js` — POST, calls OpenWA logout, sets session to `disconnected`
- [x] 2.5 Create `src/app/api/whatsapp/send/route.js` — POST, validates session `connected`, calls OpenWA `/sessions/{id}/send`, inserts `whatsapp_messages` with status `pending`; 400 if disconnected
- [x] 2.6 Create `src/app/api/whatsapp/contacts/route.js` — GET, paginated list of `whatsapp_contacts` for current user; query param `?page=1`

## Phase 3: Bot Engine

- [x] 3.1 Implement bot evaluator in `src/lib/whatsapp.js` — load enabled rules ordered by `priority ASC`, match by `keyword`/`regex`/`any_message`/`hours_inactive`, first match wins; template variable substitution (`{{name}}`, `{{clientName}}`)
- [x] 3.2 Implement cooldown enforcement — skip response if same contact received bot reply within `cooldown_seconds` (default 60s); set `bot_cooldown_skipped: true` on message record
- [x] 3.3 Wire bot evaluation into webhook `message` handler — after storing message, run evaluator; on match call OpenWA send + update `bot_responded: true`
- [x] 3.4 Create `src/app/api/whatsapp/bot-rules/route.js` — POST (create), GET (list), PATCH (update), DELETE per rule; validate trigger type, regex pattern, priority; all scoped to authenticated user
- [x] 3.5 Add contact-to-client linking in webhook handler — normalize incoming phone, match `clients.phone`, set `client_id` on `whatsapp_contact`

## Phase 4: Dashboard UI

- [x] 4.1 Create `src/app/dashboard/whatsapp/page.js` — tabbed page with Connect QR, Bot Rules, Contacts, Send Message tabs; renders conditionally if user has session
- [x] 4.2 Create `src/components/WhatsAppQR.js` — QR display, countdown poll (60s), auto-regenerate on expiry, reconnect button
- [x] 4.3 Create `src/components/WhatsAppBotRules.js` — inline CRUD editor: add/edit/delete rules, toggle enabled, priority drag, trigger type selector (keyword/regex/any_message/hours_inactive)
- [x] 4.4 Create `src/components/WhatsAppContacts.js` — paginated contact list with phone, name, linked client badge
- [x] 4.5 Create `src/components/WhatsAppSendMessage.js` — compose form: contact selector, text input, send button; status feedback (pending/delivered/read/failed)
- [x] 4.6 Add "WhatsApp" nav item to `src/app/dashboard/layout.js` under "Operaciones" group (after Calendario) — icon `MessageSquare` from lucide-react
