-- =============================================
-- NEXUS - Database Setup (Supabase SQL)
-- =============================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan_type TEXT DEFAULT 'trial',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  affiliate_code TEXT UNIQUE,
  referred_by TEXT,
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  due_date DATE,
  project_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  portal_token TEXT UNIQUE,
  portal_active BOOLEAN DEFAULT FALSE,
  pipeline_stage TEXT DEFAULT 'lead' CHECK (pipeline_stage IN ('lead','contacted','meeting','proposal','negotiation','won','lost')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'idea' CHECK (status IN ('idea','in_progress','review','done','cancelled')),
  budget DECIMAL(10,2),
  started_at DATE,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTES
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. JOURNAL ENTRIES
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  mood TEXT DEFAULT 'neutral' CHECK (mood IN ('great','good','neutral','bad','terrible')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROPOSALS
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT,
  amount DECIMAL(10,2),
  scope TEXT,
  timeline TEXT,
  terms TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONTRACTS
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT,
  amount DECIMAL(10,2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','signed')),
  signed BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  number TEXT,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','cancelled')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  stripe_payment_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT DEFAULT 'Otros',
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TIME ENTRIES
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  duration INTEGER NOT NULL, -- in seconds
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. FILES
CREATE TABLE IF NOT EXISTS public.files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AFFILIATE CLICKS
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_code TEXT NOT NULL,
  ip TEXT,
  referrer TEXT,
  landing_page TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AFFILIATE CONVERSIONS
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_code TEXT NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. GOALS
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  target_amount DECIMAL(10,2),
  current_amount DECIMAL(10,2) DEFAULT 0,
  category TEXT DEFAULT 'Ingresos',
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. FEEDBACK REQUESTS
CREATE TABLE IF NOT EXISTS public.feedback_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id TEXT,
  request_content TEXT,
  response_content TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON public.proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_code ON public.affiliate_clicks(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_code ON public.affiliate_conversions(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_user ON public.affiliate_conversions(referred_user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: user can read/update their own
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- All other tables: user can CRUD their own records
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- Repeat for other tables...
DO $$
DECLARE
  tables TEXT[] := ARRAY['projects','notes','journal_entries','proposals','contracts','invoices','expenses','time_entries','files','goals','testimonials','feedback_requests'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format('CREATE POLICY "Users can view own %s" ON public.%I FOR SELECT USING (auth.uid() = user_id);', t, t);
    EXECUTE format('CREATE POLICY "Users can insert own %s" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id);', t, t);
    EXECUTE format('CREATE POLICY "Users can update own %s" ON public.%I FOR UPDATE USING (auth.uid() = user_id);', t, t);
    EXECUTE format('CREATE POLICY "Users can delete own %s" ON public.%I FOR DELETE USING (auth.uid() = user_id);', t, t);
  END LOOP;
END $$;

-- Affiliate clicks: insert only (anyone can record a click)
CREATE POLICY "Anyone can insert affiliate clicks" ON public.affiliate_clicks FOR INSERT WITH CHECK (true);

-- Affiliate conversions: insert by trigger, read by owner
CREATE POLICY "Users can view own conversions" ON public.affiliate_conversions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND affiliate_code = affiliate_code)
);

-- =============================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, affiliate_code, plan_type)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'affiliate_code', upper(substr(md5(random()::text), 1, 8))),
    'trial'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- UPDATE TIMESTAMP FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
DO $$
DECLARE
  tables TEXT[] := ARRAY['profiles','tasks','clients','projects','notes','proposals','contracts','invoices','feedback_requests'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%I;', t, t);
    EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();', t, t);
  END LOOP;
END $$;
