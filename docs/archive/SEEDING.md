# 🌱 Data Seeding Guide

This guide explains how to populate your Supabase database with test data.

## Quick Answer: How Do Users Get Created?

**Users are NOT seeded via SQL.** They are created in two ways:

### ✅ Way 1: App Signup Form (Recommended for customers)
1. User opens the app
2. Clicks "Sign Up"
3. Enters email, password, full name, and selects role (Customer/Therapist/Admin)
4. **App automatically creates:**
   - Auth user in Supabase Auth
   - Profile in `public.profiles` table
5. User can immediately login and use the app

### ✅ Way 2: Manual Auth Creation (Recommended for testing/admin)
1. Go to [Supabase Dashboard](https://app.supabase.com) → **Authentication** tab
2. Click **+ Create new user**
3. Enter email and password
4. Add User Metadata with role:
```json
{
  "full_name": "User Name",
  "role": "customer"  // or "therapist" or "admin"
}
```
5. Click **Create user**
6. User can login with that email/password, and profile auto-creates on first login

**Why profiles auto-create:** The signup form and login flow both call code that creates a profile if one doesn't exist.

---

## Seeding Services (The ONLY SQL Seeding)

Services are the ONLY data seeded via SQL, since they don't depend on users.

### Step 1: Seed Services

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor** tab
4. Create a new query
5. Copy & paste the contents of `SEED_DATA.sql`
6. Click **RUN** button
7. You should see: `✓ 6 SERVICES SEEDED`

That's it! Your app now has these services available for booking:
- Thai Massage (฿1500 for 60min)
- Oil Massage (฿1800 for 60min)
- Deep Tissue (฿2000 for 60min)
- Manicure (฿500)
- Pedicure (฿600)
- Bridal Glow Package (฿5000)

---

## Creating Test Users (For Development)

### Option A: Use App Signup (Most Realistic)

1. Run the app: `npm run dev`
2. Click "Sign Up"
3. Create a test customer:
   - Email: `john@example.com`
   - Password: `password123`
   - Full Name: `John Doe`
   - Role: `Customer`
4. Click "Create Account" → Redirects to Customer Dashboard
5. Repeat to create a therapist:
   - Email: `ms.ang@phanganserenity.com`
   - Password: `password123`
   - Full Name: `Ms. Ang`
   - Role: `Therapist`

### Option B: Manual Auth Creation (Faster for Testing)

If you want to quickly create test users without using the app:

1. Go to **Supabase Dashboard** → **Authentication** tab
2. Click **+ Create new user**

**Create Therapist:**
- Email: `ms.ang@phanganserenity.com`
- Password: (any password)
- User Metadata:
```json
{
  "full_name": "Ms. Ang",
  "role": "therapist"
}
```

**Create Customer:**
- Email: `john@example.com`
- Password: (any password)
- User Metadata:
```json
{
  "full_name": "John Doe",
  "role": "customer"
}
```

**Create Admin:**
- Email: `admin@phanganserenity.com`
- Password: (any password)
- User Metadata:
```json
{
  "full_name": "Admin User",
  "role": "admin"
}
```

---

## Test Logins

After creating users (either via app signup or manual auth), login in the app:

**Customer:**
- Email: `john@example.com`
- Password: (the one you set)

**Therapist:**
- Email: `ms.ang@phanganserenity.com`
- Password: (the one you set)

**Admin:**
- Email: `admin@phanganserenity.com`
- Password: (the one you set)

## What Data Gets Seeded?

### Services Only (6 items) ✅ SQL Seeded
- Thai Massage (฿1500/60min)
- Oil Massage (฿1800/60min)
- Deep Tissue (฿2000/60min)
- Manicure (฿500)
- Pedicure (฿600)
- Bridal Glow Package (฿5000)

### Users/Profiles ✅ Created via Signup or Manual Auth
- Created when user signs up via app, OR
- Created manually in Supabase Auth tab
- Auto-linked to services for booking

## Verifying Data

To check if seeding worked:

1. Go to **SQL Editor**
2. Run this query:
```sql
SELECT COUNT(*) as total FROM public.services;
SELECT COUNT(*) as total FROM public.profiles WHERE role = 'therapist';
SELECT COUNT(*) as total FROM public.profiles WHERE role = 'customer';
```

You should see:
- 6 services
- 1+ therapists (however many you created)
- 1+ customers (however many you created)

## Resetting Data (Development Only)

To start fresh, run in SQL Editor:

```sql
-- ⚠️ WARNING: This deletes ALL data!
DELETE FROM public.bookings;
DELETE FROM public.profiles;
DELETE FROM public.services;

-- Then recreate services by running SEED_DATA.sql again
```

**Note:** This only deletes from the database. To delete Auth users, go to Supabase → Authentication tab and delete them manually.

## Production Considerations

- **Real Signups:** In production, users create accounts through the app signup form. No manual Auth creation needed.
- **Services Management:** Manage services through an admin dashboard (Phase 2 TODO).
- **Therapist Directory:** Therapists sign up via app, not seeded.
- **Sensitive Data:** Never commit real customer/therapist data to GitHub.

## Troubleshooting

### "User already exists"
- You already created that user. Use a different email or delete and recreate.

### "Invalid metadata JSON"
- Make sure metadata is valid JSON. Use a JSON validator.

### "Foreign key constraint failed"
- Service or therapist ID doesn't exist. Check the IDs match.

---

Need help? Check `PRODUCTION.md` or `TECH_SPEC.md`.
