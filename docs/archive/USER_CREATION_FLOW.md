# 👤 User Creation & Signup Flow

This document explains exactly how users get created and logged in, addressing the question: **"Do I have to create every user manually?"**

## The Simple Answer: NO! ✅

Users are created **automatically** when they sign up through the app. You don't need to manually create every user.

---

## How It Works: Two Parallel Flows

### Flow 1: Customer Signs Up (Most Common in Production)

```
Customer opens app
        ↓
Clicks "Sign Up" button
        ↓
Fills form:
  - Email: john@example.com
  - Password: password123
  - Full Name: John Doe
  - Role: Customer
        ↓
Clicks "Create Account"
        ↓
App calls signUp(email, password, metadata)
        ↓
[AUTOMATICALLY - You don't do anything!]
  ├─ Supabase Auth creates auth.users entry with JWT
  ├─ App reads auth.users.id
  └─ App creates profile in public.profiles table:
        id: (auto-linked to auth.users.id)
        email: john@example.com
        role: customer
        full_name: John Doe
        phone: null (optional)
        ↓
Redirect to Customer Dashboard ✅
User can immediately start booking!
```

**Result:**
- ✅ Auth user created
- ✅ Profile created
- ✅ Both linked via foreign key
- ✅ User can login immediately

---

### Flow 2: Admin Manually Creates User (Testing/Emergency)

Sometimes you want to manually create a user (e.g., testing before the app is live):

```
Admin goes to Supabase Dashboard
        ↓
Authentication tab → + Create new user
        ↓
Fills:
  - Email: ms.ang@phanganserenity.com
  - Password: (any password)
  - User Metadata:
      {
        "full_name": "Ms. Ang",
        "role": "therapist"
      }
        ↓
Clicks "Create user"
        ↓
[IN SUPABASE]
  ├─ Auth user created in auth.users
  └─ User gets JWT token
        ↓
User visits app and logs in with that email/password
        ↓
App's login flow:
  ├─ Checks if profile exists
  ├─ If NOT: Creates profile from metadata
  └─ If YES: Uses existing profile
        ↓
Logged in! ✅
```

**Result:**
- ✅ Auth user created (manually)
- ✅ Profile auto-created on first login
- ✅ User can use app

---

## Code: Where This Happens

### Signup Function (contexts.tsx)

```typescript
export const signUp = async (email: string, password: string, metadata: any) => {
  // Step 1: Create auth.users entry
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,  // ← stores role, full_name in metadata
    },
  });

  if (authError) throw authError;
  const userId = authData.user?.id;

  // Step 2: Create profile in public.profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,        // ← Links to auth.users.id
      email,
      role: metadata.role,
      full_name: metadata.full_name,
    });

  if (profileError) throw profileError;

  // User is now registered!
  return authData.user;
};
```

**What this does:**
1. Creates auth user in `auth.users` table
2. Gets the auto-generated `user.id`
3. Creates corresponding profile in `public.profiles` using that `user.id`
4. Foreign key automatically links them

### Login Function (contexts.tsx)

```typescript
export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Logged in! User's profile is already created
  return data.user;
};
```

---

## Why This Design Works

| Question | Answer |
|----------|--------|
| Do I create users manually? | **No** (except for testing). App signup handles it. |
| How does the FK constraint work? | App creates both auth.users AND profile in one transaction. |
| What if someone only has an auth user (no profile)? | Profile auto-creates on first login. |
| Can I migrate from mock users to real users? | Yes - just delete mock data, new users sign up normally. |
| What if profile creation fails? | Auth user still exists. Profile auto-creates on next login. |

---

## Setup Checklist for Development

- [ ] **Step 1:** Run `npm run dev` to start the app
- [ ] **Step 2:** Go to the signup page
- [ ] **Step 3:** Sign up as a customer (John Doe, john@example.com, password123)
  - This automatically creates auth.users + profile
- [ ] **Step 4:** Sign up as a therapist (Ms. Ang, ms.ang@phanganserenity.com, password123)
  - This automatically creates auth.users + profile
- [ ] **Step 5:** Seed services via SEED_DATA.sql
  - Services don't need users, so this is separate
- [ ] **Step 6:** Login as customer, book a massage
- [ ] **Step 7:** Login as therapist, see assigned bookings

---

## Production Deployment

In production, the signup flow is the same:

1. **Real users sign up** through the app signup page
2. **No manual user creation** needed (except admins)
3. **Services** are pre-seeded via SQL (SEED_DATA.sql)
4. **Everything else** happens through the app UI

That's it! The system is designed so users create themselves.

---

## FAQ

**Q: Do I really not need to manually create users?**
A: Correct. The app signup form does it all automatically. You only create users manually for testing.

**Q: What if I want to create test users without using the app?**
A: Go to Supabase Dashboard → Authentication → + Create new user. But this is optional - you can also use the app.

**Q: Why can't I seed profiles via SQL?**
A: Because profiles have a foreign key to `auth.users`. You can't create a profile without an auth.users entry. The signup form ensures they're created together.

**Q: What's in user_metadata vs profile?**
A:
- `user_metadata` = stored in Supabase Auth (role, full_name, etc.)
- `profile` = stored in public.profiles (id, email, role, full_name, etc.)
- They're duplicated for convenience. The profile is what the app uses most.

**Q: Can I change a user's role after signup?**
A: Yes - either update the profile, or create a new auth.users entry with different metadata.

---

## Visual Database Relationships

```
Supabase Auth (System Table)
┌─────────────────────┐
│   auth.users        │
├─────────────────────┤
│ id (UUID)           │ ← Auto-generated
│ email               │ ← john@example.com
│ password_hash       │ ← Hashed
│ user_metadata       │ ← {role: "customer", full_name: "John Doe"}
│ created_at          │
└─────────────────────┘
       │
       │ (Foreign Key: id)
       ↓
┌─────────────────────────────────┐
│   public.profiles               │
├─────────────────────────────────┤
│ id (UUID, FK to auth.users)     │ ← Same as auth.users.id
│ email                           │ ← john@example.com
│ role                            │ ← customer
│ full_name                       │ ← John Doe
│ phone (nullable)                │
│ created_at                      │
└─────────────────────────────────┘
       │
       │ (Foreign Key: customer_id)
       ↓
┌─────────────────────────────────┐
│   public.bookings               │
├─────────────────────────────────┤
│ id                              │
│ customer_id (FK profiles)       │ ← Links to customer profile
│ therapist_id (FK profiles)      │ ← Links to therapist profile
│ service_id (FK services)        │
│ date, time, status              │
└─────────────────────────────────┘
```

**Key:** The foreign key relationship means a profile MUST have a matching auth.users entry. This is enforced by the database.

---

## Next Steps

You're all set! Now:

1. **Seed services:** Run SEED_DATA.sql
2. **Sign up users:** Use the app signup form
3. **Test the booking flow:** Customer books, therapist accepts
4. **Deploy:** See PRODUCTION.md

