-- ===============================
-- PHANGAN SERENITY - SEED DATA
-- ===============================
-- Copy & paste this into Supabase SQL Editor to populate test data

-- 1. SEED SERVICES (6 services - no foreign key constraints)
INSERT INTO public.services (id, title, description, price_60, price_90, type, category, staff_required) VALUES
  (uuid_generate_v4(), 'Thai Massage', 'Traditional Thai massage for ultimate relaxation', 1500, 2000, 'Thai Massage', 'Massage', 1),
  (uuid_generate_v4(), 'Oil Massage', 'Relaxing oil massage with organic oils', 1800, 2200, 'Oil Massage', 'Massage', 1),
  (uuid_generate_v4(), 'Deep Tissue', 'Therapeutic deep tissue massage', 2000, 2500, 'Deep Tissue', 'Massage', 1),
  (uuid_generate_v4(), 'Manicure', 'Professional manicure service', 500, NULL, 'Manicure', 'Nails', 1),
  (uuid_generate_v4(), 'Pedicure', 'Professional pedicure service', 600, NULL, 'Pedicure', 'Nails', 1),
  (uuid_generate_v4(), 'Bridal Glow Package', 'Complete bridal prep: massage + nails + makeup', 5000, NULL, 'Wellness Package', 'Packages', 2);

-- 2. PROFILES & THERAPISTS
-- NOTE: Profiles CANNOT be seeded via SQL because they require foreign keys to auth.users
-- Profiles are created AUTOMATICALLY when users sign up in the app or via Supabase Auth tab
--
-- TO ADD THERAPISTS/CUSTOMERS:
-- 1. Go to Supabase Dashboard → Authentication tab
-- 2. Click "+ Create new user"
-- 3. Email: ms.ang@phanganserenity.com (or any therapist/customer email)
-- 4. Password: (any password for testing)
-- 5. User Metadata (required):
--    {
--      "full_name": "Ms. Ang",
--      "role": "therapist"
--    }
-- 6. Click "Create user"
--
-- The app's signup form will automatically create the profile when the user registers
-- OR you can manually create a profile entry if you have the auth user ID:
-- INSERT INTO public.profiles (id, email, role, full_name, phone)
-- VALUES (auth_user_id_here, 'email@example.com', 'customer', 'Name', 'phone');

-- Verify services were inserted:
SELECT 'SERVICES SEEDED:' as status, COUNT(*) as count FROM public.services;
