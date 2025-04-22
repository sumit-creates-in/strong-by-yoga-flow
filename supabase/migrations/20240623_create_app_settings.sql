-- Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read app settings
CREATE POLICY "Authenticated users can read app settings"
    ON public.app_settings
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow authenticated users with special claims to manage app settings
-- Note: You might want to restrict this to admin users only in a real app
CREATE POLICY "Only admins can insert app settings"
    ON public.app_settings
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update app settings"
    ON public.app_settings
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Grant access to authenticated users
GRANT ALL ON public.app_settings TO authenticated; 