-- Add user_id column to existing tables to link with Clerk user IDs
-- This assumes your existing tables don't have this column yet

-- Add user_id to loads table
ALTER TABLE loads 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add user_id to drivers table  
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add user_id to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add user_id to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Enable RLS on key tables
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for loads table
CREATE POLICY "Users can view their company's loads" ON loads
    FOR SELECT USING (
        user_id = auth.jwt() ->> 'sub' OR
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can insert loads for their company" ON loads
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update their company's loads" ON loads
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.jwt() ->> 'sub'
        )
    );

-- Create RLS policies for drivers table
CREATE POLICY "Users can view their company's drivers" ON drivers
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can manage their company's drivers" ON drivers
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.jwt() ->> 'sub'
        )
    );

-- Create RLS policies for user_profiles table
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Create RLS policies for companies table
CREATE POLICY "Users can view their company" ON companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM user_profiles 
            WHERE user_id = auth.jwt() ->> 'sub'
        )
    );
