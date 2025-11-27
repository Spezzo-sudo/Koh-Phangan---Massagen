-- ========================================
-- FIX RLS POLICY FOR PROFILE CREATION
-- ========================================
-- This allows users to create and update their own profiles during signup

-- 1. DROP existing restrictive policy
DROP POLICY IF EXISTS "Enable insert for authenticated users on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;

-- 2. CREATE new permissive policies
CREATE POLICY "Allow users to insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to read own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id OR true);  -- Allow anyone to read (change to "auth.uid() = id" if you want privacy)

-- Verify policies are created
SELECT * FROM pg_policies WHERE tablename = 'profiles';
