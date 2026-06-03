-- Add period tracking to affiliate_conversions for recurring commissions
ALTER TABLE public.affiliate_conversions 
ADD COLUMN IF NOT EXISTS period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS period_end TIMESTAMPTZ;

-- Drop old unique constraint that prevented multiple conversions per referral
ALTER TABLE public.affiliate_conversions 
DROP CONSTRAINT IF EXISTS affiliate_conversions_affiliate_code_referred_user_id_key;
