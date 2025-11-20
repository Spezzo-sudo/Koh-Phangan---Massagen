-- ========================================
-- DIAGNOSE: Was ist los mit dem Trigger?
-- ========================================

-- 1. Prüfe ob Trigger existiert
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  enabled
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Prüfe ob RLS aktiviert ist
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'profiles';

-- 3. Prüfe alle RLS Policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 4. Prüfe Service Role Permissions
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name='profiles';

-- 5. Zähle wie viele User und Profile existieren
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles;

-- 6. Finde User OHNE Profil (diese sind das Problem!)
SELECT
  u.id,
  u.email,
  u.created_at,
  p.id as profile_exists
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- 7. Prüfe ob die Funktion existiert
SELECT
  proname,
  prosrc
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 8. Prüfe die Function Definition
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'handle_new_user';
