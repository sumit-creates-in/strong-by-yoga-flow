-- Create teachers table
CREATE TABLE teachers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'Yoga Teacher',
    bio TEXT,
    avatar_url TEXT,
    short_bio TEXT,
    full_bio TEXT,
    experience INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    specialties TEXT[] DEFAULT '{}',
    expertise TEXT[] DEFAULT '{}',
    certifications TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{English}',
    teaching_style TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create an update_updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teachers_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 