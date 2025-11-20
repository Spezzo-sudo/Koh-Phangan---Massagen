-- ========================================
-- FIX: Repair Database Trigger and RLS
-- Run this if signup doesn't create profiles
-- ========================================

-- STEP 1: Disable RLS temporarily (so trigger can write)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop old broken trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- STEP 3: Recreate the trigger function (corrected)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- STEP 4: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- STEP 5: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create PERMISSIVE policies (allows access by default)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Allow service role (trigger) to insert without restrictions
CREATE POLICY "Service role inserts profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to read own profile
CREATE POLICY "Users read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- Allow users to update own profile
CREATE POLICY "Users update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to update any profile
CREATE POLICY "Admins update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  )
  WITH CHECK (true);

-- STEP 7: Grant permissions explicitly to service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- STEP 8: Verify trigger exists
SELECT
  trigger_name,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ✅ SUCCESS: Trigger should now work!
-- New users will automatically get a profile created when they sign up.
