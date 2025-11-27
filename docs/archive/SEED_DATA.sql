-- ===============================
-- PHANGAN SERENITY - SEED DATA
-- ===============================
-- Copy & paste this into Supabase SQL Editor to populate test data

-- 1. ADD IMAGE COLUMN (if it doesn't exist)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image TEXT;

-- 2. SEED SERVICES (6 services with images)
INSERT INTO public.services (id, title, description, price_60, price_90, type, category, staff_required, image) VALUES
  (uuid_generate_v4(), 'Thai Massage', 'Traditional Thai massage for ultimate relaxation. Includes stretching and pressure point work.', 1500, 2000, 'Thai Massage', 'Massage', 1, 'https://images.unsplash.com/photo-1552882657-a7e71d38048f?w=400&h=300&fit=crop'),
  (uuid_generate_v4(), 'Oil Massage', 'Relaxing oil massage with organic oils. Perfect for stress relief and muscle tension.', 1800, 2200, 'Oil Massage', 'Massage', 1, 'https://images.unsplash.com/photo-1570129477492-45a003537e0f?w=400&h=300&fit=crop'),
  (uuid_generate_v4(), 'Deep Tissue', 'Therapeutic deep tissue massage for muscle recovery and pain relief.', 2000, 2500, 'Deep Tissue', 'Massage', 1, 'https://images.unsplash.com/photo-1513318411602-c91caa4f8e35?w=400&h=300&fit=crop'),
  (uuid_generate_v4(), 'Manicure', 'Professional manicure service with premium nail polish selection.', 500, NULL, 'Manicure', 'Nails', 1, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop'),
  (uuid_generate_v4(), 'Pedicure', 'Professional pedicure service with relaxing foot soak and massage.', 600, NULL, 'Pedicure', 'Nails', 1, 'https://images.unsplash.com/photo-1604628346881-b72b27e84530?w=400&h=300&fit=crop'),
  (uuid_generate_v4(), 'Full Moon Party Glow', 'Complete package: Thai massage + body polish + nail art. Get ready to celebrate!', 3000, NULL, 'Wellness Package', 'Packages', 2, 'https://images.unsplash.com/photo-1599599810694-2f3f62d306cc?w=400&h=300&fit=crop');

-- 3. PROFILES & THERAPISTS
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

-- 4. Verify services were inserted:
SELECT 'SERVICES SEEDED:' as status, COUNT(*) as count FROM public.services;
