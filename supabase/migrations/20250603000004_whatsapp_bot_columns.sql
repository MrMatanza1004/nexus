-- WhatsApp Bot — supplemental columns for messages
-- Adds bot_responded, bot_cooldown_skipped, rule_id to whatsapp_messages

ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS bot_responded BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bot_cooldown_skipped BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rule_id UUID REFERENCES public.whatsapp_bot_rules(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_rule
  ON public.whatsapp_messages(rule_id);
