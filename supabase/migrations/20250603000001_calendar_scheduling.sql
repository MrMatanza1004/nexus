-- Calendar & Scheduling for NEXUS
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'event' CHECK (event_type IN ('event','appointment','reminder','deadline','call')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  meeting_link TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  google_event_id TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed','tentative','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduling availability (for public booking page)
CREATE TABLE IF NOT EXISTS public.availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, day_of_week, start_time)
);

-- Public booking links
CREATE TABLE IF NOT EXISTS public.booking_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT DEFAULT 'Agenda una reunión',
  description TEXT,
  duration INTEGER DEFAULT 30, -- minutes
  buffer_before INTEGER DEFAULT 0,
  buffer_after INTEGER DEFAULT 0,
  max_per_day INTEGER DEFAULT 3,
  advance_notice INTEGER DEFAULT 1440, -- minutes (24h)
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_client ON public.events(client_id);
CREATE INDEX IF NOT EXISTS idx_availability_user ON public.availability(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_links_user ON public.booking_links(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_links_slug ON public.booking_links(slug);

-- RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_links ENABLE ROW LEVEL SECURITY;

-- Events: user manages their own
CREATE POLICY "Users can view own events" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON public.events FOR DELETE USING (auth.uid() = user_id);

-- Availability: user manages their own
CREATE POLICY "Users can view own availability" ON public.availability FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own availability" ON public.availability FOR ALL USING (auth.uid() = user_id);

-- Booking links: anyone can read, user manages
CREATE POLICY "Anyone can view booking links" ON public.booking_links FOR SELECT USING (true);
CREATE POLICY "Users can manage own booking links" ON public.booking_links FOR ALL USING (auth.uid() = user_id);

-- Update trigger
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
