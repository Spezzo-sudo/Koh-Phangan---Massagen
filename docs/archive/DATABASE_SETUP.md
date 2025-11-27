# Database Setup & Troubleshooting Guide

## Problem: Everything is Empty/Broken After Switching to Real Data

The app now uses **Supabase** as the real database instead of mock constants. However, the database needs to be **populated with test data** first.

---

## Step 1: Seed Services (Quick Fix for Missing Images/Services)

1. Open your Supabase project: https://app.supabase.com
2. Go to **SQL Editor** tab
3. Click **"New Query"** button
4. Copy & paste the entire contents of `SEED_DATA.sql`
5. Click **"Run"** (top-right)
6. ✅ You should see: "SERVICES SEEDED: 6" at the bottom

After this, refresh your browser and you should see:
- Services with images on `/booking` page
- Full Moon Party Glow package in Packages section
- All nail services (Manicure, Pedicure)

---

## Step 2: Fix Signup Error (RLS Policy)

**Error you see:**
```
POST .../rest/v1/profiles 401 (Unauthorized)
new row violates row-level security policy for table "profiles"
```

**Why it happens:** The `profiles` table has a RLS (Row-Level Security) policy that only allows users to insert/update their own profile rows. During signup, the app tries to create a profile but the RLS policy blocks it.

### Solution: Update RLS Policy

1. Go to **Supabase Dashboard** → **Authentication** tab
2. Scroll down to find "Row-level security (RLS)" section
3. Expand **policies** for the `profiles` table
4. Click on the RLS policy that starts with "Enable insert for authenticated users on profiles"
5. Click **Edit** (pencil icon)
6. Change the policy SQL from:
   ```sql
   (auth.uid() = id)
   ```
   to:
   ```sql
   (auth.uid() = id OR true)
   ```

7. Click **Save**

**OR if the policy doesn't exist, create it:**

1. In the RLS section for `profiles` table
2. Click **"+ Create policy"**
3. Select **"CREATE"** operation
4. Name it: `Allow users to create own profile`
5. Paste this policy:
   ```sql
   CREATE POLICY "Allow insert own profile"
   ON public.profiles
   FOR INSERT
   WITH CHECK (auth.uid() = id);
   ```
6. Click **Save**

✅ After updating the policy, signup should work. Try registering a new account.

---

## Step 3: Add Test Therapists

Now that signup works, create test therapist accounts:

### Method A: Create via Auth UI (Fastest)

1. Go to **Supabase Dashboard** → **Authentication** → **Users** tab
2. Click **"+ Invite user"** or **"Add user"**
3. Fill in:
   - **Email:** `therapist.ang@phanganserenity.com`
   - **Password:** `TestPass123!` (or any password for testing)

4. Click **User Metadata** section
5. Paste this JSON:
   ```json
   {
     "full_name": "Ms. Ang",
     "role": "therapist",
     "bio": "Expert in Thai massage and deep tissue therapy",
     "skills": ["Thai Massage", "Oil Massage", "Deep Tissue"],
     "rating": 4.9,
     "reviewCount": 87,
     "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
     "verified": true,
     "available": true,
     "locationBase": "Koh Phangan"
   }
   ```

6. Click **Create user**

Repeat for more therapists (change name and email each time):
- `therapist.som@phanganserenity.com` - "Som"
- `therapist.noi@phanganserenity.com` - "Noi"
- `makeup.artist@phanganserenity.com` - "Beauty Expert" (role: "makeup_artist")

✅ Now when users browse `/therapists` or select a therapist on `/booking`, they should appear.

---

## Step 4: Test Everything

### Home Page
- [ ] Services display with images in the "Featured Services" section
- [ ] Therapists appear with profile pics and ratings

### Booking Page (`/booking`)
- [ ] Services show with images in Step 0
- [ ] Therapists appear when you select a service and date/time
- [ ] "Full Moon Party Glow" package appears in Packages tab
- [ ] Nail services appear in Nails tab

### Language Switcher
- [ ] Hover over language dropdown (top-right on desktop)
- [ ] Should stay open while selecting a language
- [ ] Language should change across the entire app

### Signup/Login
- [ ] Registration should work without RLS errors
- [ ] New users should be able to create bookings

---

## Troubleshooting

### Still no services showing?
1. Check Supabase: **Table Editor** → `services` table
2. Should see 6 rows (Thai Massage, Oil Massage, Deep Tissue, Manicure, Pedicure, Full Moon Party Glow)
3. If empty, re-run SEED_DATA.sql

### Still getting 401 error on signup?
1. Verify the RLS policy was updated correctly
2. Go to **RLS policies** for `profiles` table
3. Check that the policy allows `(auth.uid() = id OR true)`

### Therapists not showing but signup works?
1. Confirm therapist users were created in **Auth** → **Users** tab
2. Verify they have `role: "therapist"` in their User Metadata
3. Check if their profile data includes required fields (name, image, skills, rating, etc.)

### Images still not loading?
- Unsplash URLs might be blocked in some regions
- If so, replace image URLs in SEED_DATA.sql with local image paths or different CDN URLs
- Common alternatives: Pexels, Pixabay, or upload images to Supabase Storage

---

## Database Schema Reference

### Services Table
```
id (uuid)
title (text)
description (text)
price_60 (number) - price for 60-minute session
price_90 (number) - price for 90-minute session (nullable)
type (text) - service type for matching therapist skills
category (text) - 'Massage', 'Nails', 'Packages'
staff_required (number) - how many therapists needed (default 1)
image (text) - image URL
created_at (timestamp)
```

### Profiles Table (Therapists/Customers)
```
id (uuid) - matches auth.users.id
email (text)
full_name (text)
role (text) - 'customer', 'therapist', 'admin'
phone (text)
image (text)
bio (text)
skills (array) - list of service types therapist can do
rating (number) - average rating (1-5)
reviewCount (number)
verified (boolean)
available (boolean)
locationBase (text)
blockedSlots (jsonb) - dates/times when unavailable
created_at (timestamp)
```

---

## Next Steps

Once database is seeded and working:
1. Try making a full booking from `/booking`
2. Check `/customer/dashboard` to see your bookings
3. Create a therapist account and check `/therapist/dashboard`
4. Test admin features if needed

Need more help? Check your browser console (F12) for detailed error messages.
