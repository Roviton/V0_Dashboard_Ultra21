-- Add user_id column to existing tables to link with Clerk user IDs
-- This script is updated to match your actual database schema

-- Add user_id to loads table (if not exists)
ALTER TABLE loads 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add user_id to drivers table (if not exists)
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add user_id to companies table (if not exists)
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add user_id to users table (your actual table name, not user_profiles)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add user_id to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Enable RLS on key tables
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their company's loads" ON loads;
DROP POLICY IF EXISTS "Users can insert loads for their company" ON loads;
DROP POLICY IF EXISTS "Users can update their company's loads" ON loads;
DROP POLICY IF EXISTS "Users can view their company's drivers" ON drivers;
DROP POLICY IF EXISTS "Users can manage their company's drivers" ON drivers;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their company" ON companies;
DROP POLICY IF EXISTS "Users can view their company's customers" ON customers;

-- Create RLS policies for loads table
CREATE POLICY "Users can view their company's loads" ON loads
    FOR SELECT USING (
        user_id = auth.jwt() ->> 'sub' OR
        company_id IN (
            SELECT company_id FROM users 
            WHERE user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can insert loads for their company" ON loads
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM users 
            WHERE user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update their company's loads" ON loads
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE user_id = auth.jwt() ->> 'sub'
        )
    );

-- Create RLS policies for drivers table
CREATE POLICY "Users can view their company's drivers" ON drivers
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can manage their company's drivers" ON drivers
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE user_id = auth.jwt() ->> 'sub'
        )
    );

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Create RLS policies for companies table
CREATE POLICY "Users can view their company" ON companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM users 
            WHERE user_id = auth.jwt() ->> 'sub'
        )
    );

-- Create RLS policies for customers table
CREATE POLICY "Users can view their company's customers" ON customers
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can manage their company's customers" ON customers
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE user_id = auth.jwt() ->> 'sub'
        )
    );

-- Update existing users to link with Clerk (you'll need to do this manually for existing users)
-- For now, we'll just add a comment about this step
-- COMMENT: You'll need to manually update existing users with their Clerk user IDs
-- Example: UPDATE users SET user_id = 'clerk_user_id_here' WHERE email = 'user@example.com';

-- Create an index on user_id columns for better performance
CREATE INDEX IF NOT EXISTS idx_loads_user_id ON loads(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
