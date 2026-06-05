-- WhatsApp Gateway — sessions, bot rules, contacts, messages
-- OpenWA self-hosted sidecar for incoming/outgoing WhatsApp messaging

-- 1. WHATSAPP SESSIONS (one per user)
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  session_name TEXT,
  openwa_session_id TEXT,
  phone_number TEXT,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('disconnected','scanning','connected','expired')),
  qr_code TEXT,
  pairing_code TEXT,
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WHATSAPP BOT RULES
CREATE TABLE IF NOT EXISTS public.whatsapp_bot_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('keyword','regex','any_message','hours_inactive')),
  trigger_value TEXT,
  response_type TEXT,
  response_value TEXT NOT NULL,
  match_logic TEXT DEFAULT 'contains',
  is_active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  cooldown_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WHATSAPP CONTACTS
CREATE TABLE IF NOT EXISTS public.whatsapp_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  wa_chat_id TEXT NOT NULL,
  wa_push_name TEXT,
  last_message_at TIMESTAMPTZ,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, wa_chat_id)
);

-- 4. WHATSAPP MESSAGES
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.whatsapp_sessions(id) ON DELETE SET NULL,
  wa_message_id TEXT UNIQUE,
  chat_id TEXT,
  direction TEXT CHECK (direction IN ('inbound','outbound')),
  message_type TEXT DEFAULT 'text',
  content TEXT,
  media_url TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent','pending','delivered','read','failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user ON public.whatsapp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_status ON public.whatsapp_sessions(status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_rules_user ON public.whatsapp_bot_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_rules_active ON public.whatsapp_bot_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_user ON public.whatsapp_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_chat ON public.whatsapp_contacts(wa_chat_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_contacts_client ON public.whatsapp_contacts(client_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user ON public.whatsapp_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_session ON public.whatsapp_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_wa_id ON public.whatsapp_messages(wa_message_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON public.whatsapp_messages(created_at);

-- RLS
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_bot_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- WhatsApp sessions: user manages own
CREATE POLICY "Users can view own sessions" ON public.whatsapp_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.whatsapp_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.whatsapp_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.whatsapp_sessions FOR DELETE USING (auth.uid() = user_id);

-- Bot rules: user manages own
CREATE POLICY "Users can view own bot rules" ON public.whatsapp_bot_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bot rules" ON public.whatsapp_bot_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bot rules" ON public.whatsapp_bot_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bot rules" ON public.whatsapp_bot_rules FOR DELETE USING (auth.uid() = user_id);

-- Contacts: user manages own
CREATE POLICY "Users can view own contacts" ON public.whatsapp_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON public.whatsapp_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON public.whatsapp_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON public.whatsapp_contacts FOR DELETE USING (auth.uid() = user_id);

-- Messages: user manages own
CREATE POLICY "Users can view own messages" ON public.whatsapp_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.whatsapp_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON public.whatsapp_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.whatsapp_messages FOR DELETE USING (auth.uid() = user_id);

-- Update triggers
DROP TRIGGER IF EXISTS update_whatsapp_sessions_updated_at ON public.whatsapp_sessions;
CREATE TRIGGER update_whatsapp_sessions_updated_at BEFORE UPDATE ON public.whatsapp_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_whatsapp_bot_rules_updated_at ON public.whatsapp_bot_rules;
CREATE TRIGGER update_whatsapp_bot_rules_updated_at BEFORE UPDATE ON public.whatsapp_bot_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
