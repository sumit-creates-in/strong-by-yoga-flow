
-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'gift', 'expiry')),
  payment_id text,
  booking_id text,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now(),
  description text
);

-- Enable Row Level Security
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own transactions
CREATE POLICY "Users can view their own transactions" 
ON public.credit_transactions
FOR SELECT
USING (auth.uid() = user_id);
