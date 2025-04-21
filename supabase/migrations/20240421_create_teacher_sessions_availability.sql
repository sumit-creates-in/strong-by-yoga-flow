-- Create teacher_session_types table
CREATE TABLE teacher_session_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    credits INTEGER,
    is_active BOOLEAN DEFAULT true,
    type TEXT DEFAULT 'video',
    min_time_before_booking INTEGER DEFAULT 2,
    max_advance_booking_period INTEGER DEFAULT 30,
    min_time_before_cancelling INTEGER DEFAULT 4,
    min_time_before_rescheduling INTEGER DEFAULT 6,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create teacher_availability table
CREATE TABLE teacher_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    slots JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create triggers for updated_at
CREATE TRIGGER update_teacher_session_types_updated_at
    BEFORE UPDATE ON teacher_session_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_availability_updated_at
    BEFORE UPDATE ON teacher_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 