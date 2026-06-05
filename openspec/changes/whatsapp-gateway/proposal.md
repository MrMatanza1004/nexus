# Proposal: WhatsApp Gateway + Autoresponder Bot

## Intent

Agregar un gateway de WhatsApp auto-gestionado a NEXUS usando OpenWA (MIT, self-hosted) para que freelancers puedan recibir y enviar mensajes de WhatsApp desde el dashboard, más un bot de autorespuesta configurable.

## Scope

### In Scope
- OpenWA como Docker sidecar en VPS
- Webhook receiver en NEXUS (`/api/whatsapp/webhook`)
- CRUD de sesiones WhatsApp vinculadas al usuario
- Bot autorespondedor con reglas configurables (keyword, regex, any_message)
- UI en dashboard: conectar sesión (QR) + administrar reglas
- Integración con clientes existentes (vincular wa_chat_id a client_id)
- Envío de mensajes desde dashboard

### Out of Scope
- Broadcast masivo (>50 contactos)
- Chatwoot u otro CRM integration
- WhatsApp Business API (usamos Web automation)
- Múltiples sesiones por usuario (1 sesión por cuenta NEXUS)

## Capabilities

### New Capabilities
- `whatsapp-gateway`: Gateway WhatsApp self-hosted con OpenWA, webhook receiver, envío de mensajes
- `whatsapp-bot`: Bot autorespondedor con reglas configurables por usuario

### Modified Capabilities
- `dashboard-nav`: Nueva sección "WhatsApp" en el sidebar del dashboard
- Ninguna otra capability existente cambia su comportamiento

## Approach

OpenWA corre como contenedor Docker en un VPS (mínimo $6/mo). NEXUS en Vercel se comunica vía HTTP. Los mensajes entrantes llegan via webhook POST a `/api/whatsapp/webhook`. El bot evalúa reglas almacenadas en Supabase (`whatsapp_bot_rules`). El envío de mensajes usa la API REST de OpenWA.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/api/whatsapp/` | New | Webhook, sessions, messages, bot rules endpoints |
| `src/app/dashboard/whatsapp/` | New | UI pages for WhatsApp config |
| `src/components/WhatsApp*` | New | QR scanner, contact selector, bot rule editor |
| `src/integrations/openwa.js` | New | OpenWA API client |
| `src/lib/constants.js` | Modified | Add WhatsApp constants |
| `src/app/dashboard/layout.js` | Modified | Add WhatsApp nav item |
| `supabase/migrations/` | New | whatsapp_sessions, bot_rules, contacts, messages tables |
| `.env.example` | Modified | OPENWA_BASE_URL, OPENWA_MASTER_KEY, OPENWA_WEBHOOK_SECRET |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Ban de número WhatsApp (contra ToS) | Med | Número dedicado, rate limits, sin spam |
| QR expira / sesión desconectada | Med | Notificación en dashboard + regenerar QR |
| VPS down / OpenWA caído | Bajo | Docker restart policy + health check |
| Consumo de RAM (Puppeteer ~400MB) | Bajo | VPS con >=2GB RAM |

## Rollback Plan

1. Detener contenedor OpenWA: `docker compose -f /opt/openwa/docker-compose.yml down`
2. Eliminar webhook en OpenWA (desactivar endpoint)
3. Eliminar tablas de Supabase: `DROP TABLE whatsapp_messages, whatsapp_contacts, whatsapp_bot_rules, whatsapp_sessions`
4. Revertir cambios en UI dashboard

## Dependencies

- VPS con Docker (mínimo 2GB RAM, $6-10/mo)
- OpenWA v0.1.6+ (rmyndharis/OpenWA)
- whatsapp-web.js (incluido en OpenWA)
- Número de WhatsApp DEDICADO (no personal)

## Success Criteria

- [ ] Usuario puede escanear QR desde dashboard y conectar WhatsApp
- [ ] Mensaje entrante se registra en DB y dispara webhook
- [ ] Bot responde automáticamente basado en reglas configurables
- [ ] Usuario puede enviar mensajes desde el dashboard
- [ ] Contactos WhatsApp se vinculan a clientes existentes
