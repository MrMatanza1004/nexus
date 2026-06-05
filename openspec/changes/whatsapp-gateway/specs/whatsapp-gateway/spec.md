# WhatsApp Gateway Specification

## Purpose

OpenWA gateway for NEXUS: session management, webhook receiver, message send, contact-to-client linking.

## Requirements

### Requirement: Session Connection (QR Flow)

System MUST generate a QR for the authenticated user to scan, and MUST regenerate on expiry.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy path | Authenticated on dashboard | Clicks "Connect WhatsApp" | Returns QR + pairing code; session → `scanning` |
| QR expires | QR displayed >60s without scan | System polls status | Generates new QR; user sees countdown |

### Requirement: Session Status

System SHALL expose status endpoint returning `disconnected | scanning | connected | expired`.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Session exists | User session connected | GET /api/whatsapp/session/status | Returns `{ status, qr? }` |
| No session | User never connected | Same request | Returns `{ status: "disconnected" }` |

### Requirement: Webhook Receiver

System MUST expose POST /api/whatsapp/webhook authenticated by OPENWA_WEBHOOK_SECRET.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Incoming message | Valid webhook with `message` event | POST with valid secret | Stores in `whatsapp_messages`; triggers bot evaluation |
| Invalid webhook | Request missing/wrong secret | POST to webhook | Returns 401; discards payload |

### Requirement: Message Delivery Status

System SHALL record delivered, read, and failed statuses from webhook `ack` events.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Delivered | Sent message status `pending` | Webhook `ack` (type=delivered) | Updates to `delivered` |
| Read | Sent message is `delivered` | Webhook `ack` (type=read) | Updates to `read` |

### Requirement: Send Message

System SHALL let authenticated users send text via dashboard proxied through OpenWA.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Send to known | Session `connected`; contact exists | User submits `{ to, text }` | Calls OpenWA; inserts with status `pending` |
| While disconnected | Session not `connected` | User attempts send | Returns 400; error "WhatsApp not connected" |

### Requirement: Contact-to-Client Linking

System MUST auto-link WhatsApp contacts to clients by normalized phone match.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Client matched | `clients.phone` matches normalized number | New incoming message from unknown number | `whatsapp_contact` created with `client_id` set |
| No match | No client with that phone | Same event | `whatsapp_contact` created with `client_id: null` |

### Requirement: Session Disconnection

System SHALL detect disconnection (QR expired, phone logout, OpenWA restart) and update state.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| QR expired | Session in `scanning` >60s | No scan | State → `disconnected`; dashboard shows "Reconnect" |
| Phone logout | Session was `connected` | User logs out from phone | Webhook delivers `disconnected`; state updated |

### Requirement: Webhook Idempotency

System MUST deduplicate webhook events via unique eventId within a 5-minute window.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Duplicate | Same `eventId` within 5 min | Second webhook arrives | Returns 200; skips processing |
| Stale duplicate | Same `eventId` after 5 min | Second webhook arrives | Processes normally (window expired) |

### Requirement: Session Scoping

System MUST enforce one WhatsApp session per authenticated user. Sessions SHALL be independent across users.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Single session | User already has session A | Tries to connect new session | Returns conflict; must disconnect first |
| Independent | Two different users | Both connect | Sessions isolated; messages routed per user |
