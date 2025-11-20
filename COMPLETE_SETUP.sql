-- ========================================
-- COMPLETE DATABASE SETUP FOR PHANGAN SERENITY
-- ========================================
-- Run this ONCE to set up everything

-- ========== STEP 1: FIX RLS POLICIES ==========

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Enable insert for authenticated users on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users based on id" ON public.profiles;

-- Create new permissive policies for profile operations
CREATE POLICY "Allow users to insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow anyone to read profiles"
ON public.profiles
FOR SELECT
USING (true);

-- ========== STEP 2: ADD IMAGE COLUMN TO SERVICES ==========

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image TEXT;

-- ========== STEP 3: SEED SERVICES (6 with images) ==========

-- Clear existing services first (optional - comment out if you want to keep old data)
-- DELETE FROM public.services;

INSERT INTO public.services (id, title, description, price_60, price_90, type, category, staff_required, image) VALUES
  (uuid_generate_v4(), 'Thai Massage', 'Traditional Thai massage for ultimate relaxation. Includes stretching and pressure point work.', 1500, 2000, 'Thai Massage', 'Massage', 1, 'https://images.unsplash.com/photo-1552882657-a7e71d38048f?w=400&h=300&fit=crop'),
  (uuid_generate_v4(), 'Oil Massage', 'Relaxing oil massage with organic oils. Perfect for stress relief and muscle tension.', 1800, 2200, 'Oil Massage', 'Massage', 1, 'https://images.unsplash.com/photo-1570129477492-45a003537e0f?w=400&h=300&fit=crop'),
  (uuid_generate_v4(), 'Deep Tissue', 'Therapeutic deep tissue massage for muscle recovery and pain relief.', 2000, 2500, 'Deep Tissue', 'Massage', 1, 'https://images.unsplash.com/photo-1513318411602-c91caa4f8e35?w=400&h=300&fit=crop'),
  (uuid_generate_v4(), 'Manicure', 'Professional manicure service with premium nail polish selection.', 500, NULL, 'Manicure', 'Nails', 1, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop'),
  (uuid_generate_v4(), 'Pedicure', 'Professional pedicure service with relaxing foot soak and massage.', 600, NULL, 'Pedicure', 'Nails', 1, 'https://images.unsplash.com/photo-1604628346881-b72b27e84530?w=400&h=300&fit=crop'),
  (uuid_generate_v4(), 'Full Moon Party Glow', 'Complete package: Thai massage + body polish + nail art. Get ready to celebrate!', 3000, NULL, 'Wellness Package', 'Packages', 2, 'https://images.unsplash.com/photo-1599599810694-2f3f62d306cc?w=400&h=300&fit=crop');

-- ========== VERIFICATION ==========

SELECT 'SETUP COMPLETE!' as status;
SELECT 'RLS Policies Fixed' as step_1;
SELECT 'Services Seeded:' as step_2, COUNT(*) as count FROM public.services;
SELECT 'Image Column Added' as step_3;
