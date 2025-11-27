# Production Readiness Roadmap

## Current State ⚠️
- ✅ Real Auth (Supabase Auth works)
- ✅ Real Email (Resend integration ready)
- ✅ Real Database (Supabase connected)
- ❌ **CRITICAL:** 90% of code still uses MOCK data instead of Supabase queries
- ❌ Data not synced between State and Database
- ❌ No real-time updates
- ❌ Admin dashboard doesn't exist
- ❌ Can't manage services/therapists via UI

**Status:** MVP with broken data flow

---

## Phase 1: FIX DATA LAYER (CRITICAL) - 1-2 weeks

### Goal: Remove ALL mock data, use ONLY Supabase

#### 1.1 Install React Query (Data Fetching)
```bash
npm install @tanstack/react-query
```

**Why:**
- Automatic caching
- Real-time sync
- Handles loading/error states

#### 1.2 Refactor: Fetch Services from Supabase
**File:** `lib/queries.ts` (NEW)

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*');
      if (error) throw error;
      return data;
    }
  });
};

export const useTherapists = () => {
  return useQuery({
    queryKey: ['therapists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'therapist');
      if (error) throw error;
      return data;
    }
  });
};

export const useBookings = (userId?: string) => {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      let query = supabase.from('bookings').select('*');
      if (userId) query = query.or(`customer_id.eq.${userId},therapist_id.eq.${userId}`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
};
```

**Status:** Update in next section

#### 1.3 Update Components to Use React Query

**File:** `pages/CustomerDashboard.tsx`

**BEFORE (WRONG):**
```typescript
import { SERVICES, THERAPISTS } from '../constants';

export default function CustomerDashboard() {
  return (
    <div>
      {SERVICES.map(service => (...))}  // Hardcoded!
      {THERAPISTS.map(therapist => (...))}  // Hardcoded!
    </div>
  );
}
```

**AFTER (CORRECT):**
```typescript
import { useServices, useTherapists } from '../lib/queries';

export default function CustomerDashboard() {
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: therapists, isLoading: therapistsLoading } = useTherapists();

  if (servicesLoading || therapistsLoading) return <div>Loading...</div>;

  return (
    <div>
      {services?.map(service => (...))}  // From DB!
      {therapists?.map(therapist => (...))}  // From DB!
    </div>
  );
}
```

#### 1.4 Update Contexts: Real Booking Creation

**File:** `contexts.tsx` - Fix `addBooking()`

**BEFORE (WRONG):**
```typescript
const addBooking = async (input: CreateBookingInput) => {
  const newBooking = { ...input, id: `b${Date.now()}`, status: 'pending' };

  if (supabase) {
    try {
      await supabase.from('bookings').insert([...]);
    } catch (dbErr) {
      console.warn("Supabase save failed, falling back to mock:", dbErr);
    }
  }

  // ALWAYS saves to mock state - DATA NOT IN SYNC
  setBookings(prev => [newBooking, ...prev]);
};
```

**AFTER (CORRECT):**
```typescript
const addBooking = async (input: CreateBookingInput) => {
  if (!supabase) throw new Error('Supabase not configured');

  // ONLY save to Supabase, no fallback
  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      customer_id: input.customerId,  // Use actual ID, not name
      therapist_id: input.therapistId,
      service_id: input.serviceId,
      scheduled_date: input.date,
      scheduled_time: input.time,
      duration: input.duration,
      location_text: input.location,
      gps_lat: input.coordinates?.lat,
      gps_lng: input.coordinates?.lng,
      total_price: input.totalPrice,
      status: 'pending',
      notes: input.notes || null
    }])
    .select();

  if (error) throw error;

  // Invalidate cache to refetch
  queryClient.invalidateQueries({ queryKey: ['bookings'] });

  // Send email notification
  await sendBookingNotifications(data[0]);

  return data[0];
};
```

#### 1.5 Fix Availability Check

**BEFORE (WRONG):**
```typescript
const checkAvailability = (therapistId: string, dateStr: string, time: string, duration: number) => {
  // Checks only local state bookings - DOESN'T check DB!
  const relevantBookings = bookings.filter(b =>
    b.therapistId === therapistId &&
    new Date(b.date).toDateString() === targetDate
  );
};
```

**AFTER (CORRECT):**
```typescript
export const checkAvailability = async (
  therapistId: string,
  dateStr: string,
  time: string,
  duration: number
) => {
  // Query SUPABASE DIRECTLY, not state
  const targetDate = new Date(dateStr).toDateString();

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('therapist_id', therapistId)
    .gte('scheduled_date', dateStr)
    .lt('scheduled_date', new Date(new Date(dateStr).getTime() + 86400000).toISOString())
    .in('status', ['pending', 'confirmed', 'in_progress']);

  if (error) throw error;

  // Check for time overlap
  const timeStart = parseInt(time.split(':')[0]);
  const timeEnd = timeStart + (duration / 60);

  return !bookings?.some(b => {
    const bookingStart = parseInt(b.scheduled_time.split(':')[0]);
    const bookingEnd = bookingStart + (b.duration / 60);
    return bookingStart < timeEnd && timeStart < bookingEnd;
  });
};
```

#### 1.6 Delete Hardcoded Mock Data

**DELETE from constants.ts:**
```typescript
// ❌ DELETE these:
export const SERVICES: Service[] = [...]
export const THERAPISTS: Therapist[] = [...]
export const MOCK_BOOKINGS: Booking[] = [...]
export const MOCK_EXPENSES: Expense[] = [...]
export const PRODUCTS: Product[] = [...]
```

**KEEP in constants.ts:**
```typescript
// ✅ Keep these (non-data):
export const TIME_SLOTS = ['09:00', '10:00', ...]
export const SERVICE_CATEGORIES = ['Massage', 'Nails', ...]
```

**Checklist:**
- [ ] Install React Query
- [ ] Create `lib/queries.ts` with useServices, useTherapists, useBookings
- [ ] Update CustomerDashboard to use `useServices()` & `useTherapists()`
- [ ] Update TherapistDashboard to use `useBookings(userId)`
- [ ] Fix `addBooking()` - no fallback to mock
- [ ] Fix `checkAvailability()` - query DB directly
- [ ] Delete SERVICES, THERAPISTS, MOCK_BOOKINGS from constants
- [ ] Test: Create booking → appears in DB
- [ ] Test: Book on other browser → both see same data

---

## Phase 2: BUILD ADMIN DASHBOARD (1 week)

### Goal: Admins can manage services, therapists, bookings

#### 2.1 Create Admin Service Management

**File:** `pages/AdminDashboard.tsx` (NEW)

Features needed:
- List all services (with ability to add/edit/delete)
- List all therapists (enable/disable)
- List all bookings (confirm/reject/cancel)
- View analytics dashboard

#### 2.2 Add CRUD Operations

**File:** `lib/mutations.ts` (NEW)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (service) => {
      const { data, error } = await supabase
        .from('services')
        .insert([service])
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    }
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    }
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    }
  });
};
```

**Checklist:**
- [ ] Create AdminDashboard page
- [ ] Build Service Management UI
- [ ] Build Therapist Management UI
- [ ] Build Booking Management UI
- [ ] Implement create/edit/delete operations
- [ ] Add role-based RLS checks in Supabase
- [ ] Test: Admin can add service → appears for all customers

---

## Phase 3: REAL-TIME UPDATES (3 days)

### Goal: Bookings sync in real-time across tabs/devices

#### 3.1 Setup Supabase Realtime Subscription

**File:** `lib/queries.ts` - Update

```typescript
export const useBookings = (userId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      let q = supabase.from('bookings').select('*');
      if (userId) q = q.or(`customer_id.eq.${userId},therapist_id.eq.${userId}`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    }
  });

  // Subscribe to real-time changes
  useEffect(() => {
    const subscription = supabase
      .from('bookings')
      .on('*', (payload) => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return query;
};
```

**Checklist:**
- [ ] Enable Realtime in Supabase Dashboard
- [ ] Add subscription to useBookings
- [ ] Add subscription to useServices
- [ ] Test: Book in one tab → appears in another tab instantly

---

## Phase 4: TESTING & DEPLOYMENT (1 week)

### 4.1 Setup Automated Testing

```bash
npm install -D vitest @testing-library/react
```

Test files needed:
- `lib/queries.test.ts` - Query functions
- `lib/mutations.test.ts` - Mutation functions
- `components/BookingForm.test.tsx` - UI components

### 4.2 E2E Testing (Cypress)

```bash
npm install -D cypress
```

Test scenarios:
- Customer signup → create booking → see in dashboard
- Therapist accepts booking → customer sees status change
- Admin adds service → customers can book it
- Cancel booking with refund logic

### 4.3 Deploy to Production

**Option 1: Vercel (Easiest)**
```bash
git push origin main
# Go to vercel.com → Connect repo → Deploy
```

**Option 2: Self-hosted (Hostinger)**
See PRODUCTION.md for Nginx + PM2 setup

**Checklist:**
- [ ] Setup CI/CD pipeline
- [ ] Run all tests
- [ ] Test in staging environment
- [ ] Security review (RLS policies)
- [ ] Performance testing
- [ ] Deploy to production
- [ ] Monitor errors (Sentry)

---

## Phase 5: POLISH & FEATURES (Ongoing)

### 5.1 Payment Processing (Stripe)
- Customer sees total price
- Payment integration before booking

### 5.2 SMS Notifications
- Therapist gets SMS when booked
- Customer gets SMS confirmations

### 5.3 Reviews & Ratings
- Customers rate therapists
- Therapists view ratings

### 5.4 Advanced Scheduling
- Calendar UI for therapists
- Bulk block/unblock slots
- Recurring appointments

### 5.5 Mobile App (React Native)
- Same API, native app
- Push notifications

---

## Timeline Summary

| Phase | Duration | Blockers | Result |
|-------|----------|----------|--------|
| Phase 1 | 1-2 weeks | None - critical | Real DB, no mock data |
| Phase 2 | 1 week | Phase 1 done | Admin dashboard works |
| Phase 3 | 3 days | Phase 1 done | Real-time sync |
| Phase 4 | 1 week | Phase 3 done | Production ready |
| Phase 5 | Ongoing | None | Added features |

**TOTAL TO PRODUCTION:** 3-4 weeks

---

## What To Do RIGHT NOW (Today)

1. **Start Phase 1.1:** Install React Query
2. **Start Phase 1.2:** Create `lib/queries.ts`
3. **Update CustomerDashboard:** Use `useServices()` instead of SERVICES constant
4. **Test:** Verify services load from DB
5. **Remove hardcoded data:** Delete SERVICES/THERAPISTS from constants.ts

This is the **critical path** - everything else depends on Phase 1.

---

## Common Mistakes To Avoid

❌ **Don't:**
- Keep using SERVICES constant after React Query setup
- Store bookings in local state
- Query DB in component render (use hooks)
- Forget to invalidate queries after mutations
- Skip RLS policies (security risk)
- Deploy without testing real bookings

✅ **Do:**
- Always use React Query for fetching
- Always invalidate after mutations
- Test the whole flow (signup → book → confirm)
- Setup RLS policies for each table
- Monitor production errors
- Have backup data strategy

---

## Questions?

Refer to:
- [TECH_SPEC.md](TECH_SPEC.md) - Database schema
- [MOCK_DATA_REPORT.md](MOCK_DATA_REPORT.md) - What's broken
- [PRODUCTION.md](PRODUCTION.md) - Deployment
- Supabase docs: https://supabase.com/docs

