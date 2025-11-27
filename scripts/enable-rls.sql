-- =====================================================
-- ROW LEVEL SECURITY (RLS) FOR PROFILES TABLE
-- =====================================================
-- Enable RLS on profiles table
alter table public.profiles enable row level security;

-- Policy 1: Allow users to read their own profile
create policy "Users can read their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Policy 2: Allow authenticated users to read all therapist profiles (for booking page)
create policy "Anyone can read verified therapists"
  on public.profiles
  for select
  using (
    role = 'therapist' AND is_verified = true
    OR auth.uid() = id
  );

-- Policy 3: Allow users to update their own profile
create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Policy 4: Allow service role (backend) to insert new profiles (for signup trigger)
create policy "Service role can insert profiles"
  on public.profiles
  for insert
  with check (true);

-- Policy 5: Allow admins to update any profile (for verification)
create policy "Admins can update any profile"
  on public.profiles
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Policy 6: Allow admins to read all profiles
create policy "Admins can read all profiles"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
