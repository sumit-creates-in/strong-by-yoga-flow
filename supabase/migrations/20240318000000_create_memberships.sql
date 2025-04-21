-- Create memberships table
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own memberships
CREATE POLICY "Users can view own memberships"
    ON public.memberships
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to update their own memberships
CREATE POLICY "Users can update own memberships"
    ON public.memberships
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to insert their own memberships
CREATE POLICY "Users can insert own memberships"
    ON public.memberships
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS memberships_user_id_idx ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS memberships_is_active_idx ON public.memberships(is_active);

-- Grant access to authenticated users
GRANT ALL ON public.memberships TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated; 