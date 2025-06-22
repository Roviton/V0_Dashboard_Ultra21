-- Fix RLS policies to be properly restrictive with company isolation
-- This will prevent users from seeing data from other companies

SELECT 'Starting restrictive RLS policy fix...' as status;

-- Step 1: Disable RLS temporarily to make changes
ALTER TABLE IF EXISTS loads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS load_drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignment_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS load_documents DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing overly permissive policies
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Step 3: Create a safe helper function that doesn't cause recursion
CREATE OR REPLACE FUNCTION auth.get_user_company_id()
RETURNS UUID AS $$
DECLARE
    user_company_id UUID;
BEGIN
    -- Get company_id directly from users table using auth.uid()
    SELECT company_id INTO user_company_id
    FROM public.users 
    WHERE id = auth.uid()
    LIMIT 1;
    
    RETURN user_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 4: Create restrictive, company-isolated policies

-- Companies table - users can only see their own company
CREATE POLICY "company_isolation_select" ON companies 
    FOR SELECT USING (id = auth.get_user_company_id());

CREATE POLICY "company_isolation_update" ON companies 
    FOR UPDATE USING (id = auth.get_user_company_id());

-- Users table - users can only see users from their own company
CREATE POLICY "users_company_isolation_select" ON users 
    FOR SELECT USING (company_id = auth.get_user_company_id());

CREATE POLICY "users_company_isolation_update" ON users 
    FOR UPDATE USING (company_id = auth.get_user_company_id());

CREATE POLICY "users_company_isolation_insert" ON users 
    FOR INSERT WITH CHECK (company_id = auth.get_user_company_id());

-- Loads table - strict company isolation
CREATE POLICY "loads_company_isolation_select" ON loads 
    FOR SELECT USING (company_id = auth.get_user_company_id());

CREATE POLICY "loads_company_isolation_insert" ON loads 
    FOR INSERT WITH CHECK (company_id = auth.get_user_company_id());

CREATE POLICY "loads_company_isolation_update" ON loads 
    FOR UPDATE USING (company_id = auth.get_user_company_id());

CREATE POLICY "loads_company_isolation_delete" ON loads 
    FOR DELETE USING (company_id = auth.get_user_company_id());

-- Customers table - strict company isolation
CREATE POLICY "customers_company_isolation_select" ON customers 
    FOR SELECT USING (company_id = auth.get_user_company_id());

CREATE POLICY "customers_company_isolation_insert" ON customers 
    FOR INSERT WITH CHECK (company_id = auth.get_user_company_id());

CREATE POLICY "customers_company_isolation_update" ON customers 
    FOR UPDATE USING (company_id = auth.get_user_company_id());

CREATE POLICY "customers_company_isolation_delete" ON customers 
    FOR DELETE USING (company_id = auth.get_user_company_id());

-- Drivers table - strict company isolation
CREATE POLICY "drivers_company_isolation_select" ON drivers 
    FOR SELECT USING (company_id = auth.get_user_company_id());

CREATE POLICY "drivers_company_isolation_insert" ON drivers 
    FOR INSERT WITH CHECK (company_id = auth.get_user_company_id());

CREATE POLICY "drivers_company_isolation_update" ON drivers 
    FOR UPDATE USING (company_id = auth.get_user_company_id());

CREATE POLICY "drivers_company_isolation_delete" ON drivers 
    FOR DELETE USING (company_id = auth.get_user_company_id());

-- Load_drivers table - access through load's company_id
CREATE POLICY "load_drivers_company_isolation_select" ON load_drivers 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = load_drivers.load_id 
            AND loads.company_id = auth.get_user_company_id()
        )
    );

CREATE POLICY "load_drivers_company_isolation_insert" ON load_drivers 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = load_drivers.load_id 
            AND loads.company_id = auth.get_user_company_id()
        )
    );

CREATE POLICY "load_drivers_company_isolation_update" ON load_drivers 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = load_drivers.load_id 
            AND loads.company_id = auth.get_user_company_id()
        )
    );

CREATE POLICY "load_drivers_company_isolation_delete" ON load_drivers 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = load_drivers.load_id 
            AND loads.company_id = auth.get_user_company_id()
        )
    );

-- Assignment_history table - access through load's company_id
CREATE POLICY "assignment_history_company_isolation_select" ON assignment_history 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = assignment_history.load_id 
            AND loads.company_id = auth.get_user_company_id()
        )
    );

CREATE POLICY "assignment_history_company_isolation_insert" ON assignment_history 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = assignment_history.load_id 
            AND loads.company_id = auth.get_user_company_id()
        )
    );

-- Load_documents table - access through load's company_id
CREATE POLICY "load_documents_company_isolation_select" ON load_documents 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = load_documents.load_id 
            AND loads.company_id = auth.get_user_company_id()
        )
    );

CREATE POLICY "load_documents_company_isolation_insert" ON load_documents 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = load_documents.load_id 
            AND loads.company_id = auth.get_user_company_id()
        )
    );

CREATE POLICY "load_documents_company_isolation_update" ON load_documents 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = load_documents.load_id 
            AND loads.company_id = auth.get_user_company_id()
        )
    );

CREATE POLICY "load_documents_company_isolation_delete" ON load_documents 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM loads 
            WHERE loads.id = load_documents.load_id 
            AND loads.company_id = auth.get_user_company_id()
        )
    );

-- Step 5: Re-enable RLS with the new restrictive policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_documents ENABLE ROW LEVEL SECURITY;

-- Step 6: Test the restrictive policies
SELECT 'Testing restrictive RLS policies...' as test;

-- This should only return loads for the authenticated user's company
SELECT 'Demo company loads (should only be visible to demo company users):' as test_description;
SELECT COUNT(*) as demo_load_count 
FROM loads 
WHERE company_id = '550e8400-e29b-41d4-a716-446655440000';

SELECT 'All visible loads (should be filtered by RLS):' as test_description;
SELECT COUNT(*) as visible_load_count FROM loads;

SELECT 'Restrictive RLS policies applied successfully!' as status;
SELECT 'Users can now only see data from their own company.' as result;
