-- Invoices v2 — line items, tax, recurring, reminders
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS total DECIMAL(10,2);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMPTZ;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS recurring_frequency TEXT CHECK (recurring_frequency IN ('weekly','biweekly','monthly','quarterly','yearly'));
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS recurring_end_date DATE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS parent_recurring_id UUID;

-- Invoice line items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  total DECIMAL(10,2),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring invoice templates
CREATE TABLE IF NOT EXISTS public.recurring_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly','biweekly','monthly','quarterly','yearly')),
  next_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring invoice items (template)
CREATE TABLE IF NOT EXISTS public.recurring_invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recurring_id UUID REFERENCES public.recurring_invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_user ON public.recurring_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next ON public.recurring_invoices(next_date);
CREATE INDEX IF NOT EXISTS idx_invoices_recurring ON public.invoices(parent_recurring_id);

-- RLS
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_invoice_items ENABLE ROW LEVEL SECURITY;

-- Invoice items follow invoice ownership
CREATE POLICY "Invoice items via invoice ownership" ON public.invoice_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.invoices WHERE id = invoice_id AND user_id = auth.uid())
);

-- Recurring: user manages own
CREATE POLICY "Users manage own recurring" ON public.recurring_invoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Recurring items via parent" ON public.recurring_invoice_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.recurring_invoices WHERE id = recurring_id AND user_id = auth.uid())
);

-- Update trigger for invoices (already exists from initial schema)
DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Update trigger for recurring
DROP TRIGGER IF EXISTS update_recurring_updated_at ON public.recurring_invoices;
CREATE TRIGGER update_recurring_updated_at BEFORE UPDATE ON public.recurring_invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
