# Mock Data Usage Report

## Overview
This document identifies all locations in the codebase where **MOCK DATA** (instead of real database APIs) are being used.

---

## 1. Constants.ts - HARDCODED MOCK DATA ⚠️

**File:** `constants.ts`

**Problem:** All services, therapists, products, bookings, and expenses are **hardcoded arrays**.

### Data Being Mocked:
```typescript
export const SERVICES: Service[] = [
  { id: 's1', title: 'Traditional Thai Massage', price60: 300, ... },
  { id: 's2', title: 'Aroma Oil Massage', price60: 400, ... },
  // ... 10+ more hardcoded services
]

export const THERAPISTS: Therapist[] = [
  { id: 't1', name: 'Ms. Ang', skills: [...], available: true, ... },
  { id: 't2', name: 'Somchai', ... },
  // ... more hardcoded therapists
]

export const PRODUCTS: Product[] = [ ... ]
export const MOCK_BOOKINGS: Booking[] = [ ... ]
export const MOCK_EXPENSES: Expense[] = [ ... ]
```

**Why This Is Bad:**
- ❌ Services are hardcoded (should come from Supabase `public.services` table)
- ❌ Therapists are hardcoded (should come from `public.profiles` WHERE role='therapist')
- ❌ Bookings are hardcoded mock data (should come from Supabase `public.bookings`)
- ❌ Can't add new therapists/services without editing code
- ❌ Admin can't manage these via UI

---

## 2. contexts.tsx - Mock State Management ⚠️

**File:** `contexts.tsx` (lines 200-350)

**Problem:** DataProvider uses mock data for initialization and fallback.

### Where Mocks Are Used:

#### Line 202: Initialize State with Mock Data
```typescript
const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
const [therapists, setTherapists] = useState<Therapist[]>(THERAPISTS);
```

#### Lines 221-263: checkAvailability()
- Checks availability against **mock bookings** in state
- Not checking Supabase `public.bookings` table
- If booking created in DB directly, availability check fails

#### Lines 265-291: toggleTherapistBlock() & updateTherapist()
- Updates mock therapists in state only
- Changes NOT persisted to Supabase
- Lost on page refresh

#### Lines 294-350: addBooking()
- Tries Supabase first, **falls back to mock**
```typescript
if (supabase) {
  try {
    // Try to save to Supabase
    const { data, error: dbError } = await supabase.from('bookings').insert([...]);
    if (dbError) throw dbError;
  } catch (dbErr) {
    console.warn("Supabase save failed, falling back to mock:", dbErr);
  }
}

// 1. ALWAYS saves to local state (mock)
setBookings(prev => [newBooking, ...prev]);
```

**Why This Is Bad:**
- ❌ Bookings in state ≠ Bookings in Supabase database
- ❌ Two sources of truth
- ❌ Data loss on refresh
- ❌ Therapist availability checks only against local state

---

## 3. Which Components Are Affected

### CustomerDashboard
- Shows services from `SERVICES` constant (not from DB)
- Shows therapists from `THERAPISTS` constant (not from DB)
- Books appointments (saved to state + Supabase)

### TherapistDashboard
- Shows bookings from state (not from DB in real-time)
- Updates availability in state only (not persisted)

### BookingPage
- Checks availability against state bookings (not DB)
- Creates bookings that fallback to mock if DB fails

### AdminDashboard
- Shows mock data
- No ability to manage services, therapists, or products

---

## 4. How Data SHOULD Flow (vs Current)

### Current (WRONG):
```
UI → React State (Mock) ↔ Supabase DB
      (Primary)           (Fallback)
```

### Correct:
```
UI → React Query/SWR ← Supabase DB
         (Cache)      (Single Source)
```

---

## 5. Specific Files & What They Mock

| File | Data Mocked | Should Come From | Status |
|------|-------------|------------------|--------|
| `constants.ts` | Services, Therapists, Products, Bookings, Expenses | Supabase tables | ❌ HARDCODED |
| `contexts.tsx` L202 | Bookings state init | Supabase `bookings` table | ❌ MOCK |
| `contexts.tsx` L204 | Therapists state | Supabase `profiles` WHERE role='therapist' | ❌ MOCK |
| `contexts.tsx` L221-263 | Availability check logic | Supabase real-time query | ⚠️ MIXED |
| `contexts.tsx` L265-291 | Therapist block/update | Supabase `profiles` table | ❌ STATE ONLY |
| `contexts.tsx` L294-350 | Booking creation | Supabase `bookings` table | ⚠️ FALLBACK |

---

## 6. Action Items to Fix

### PRIORITY 1: Remove Hardcoded Services
- [ ] Delete `export const SERVICES` from constants.ts
- [ ] Fetch services via `supabase.from('services').select()`
- [ ] Cache in state with React Query or SWR
- [ ] Update CustomerDashboard to use fetched services

### PRIORITY 2: Remove Hardcoded Therapists
- [ ] Delete `export const THERAPISTS` from constants.ts
- [ ] Fetch therapists via `supabase.from('profiles').select().eq('role', 'therapist')`
- [ ] Cache in React Query
- [ ] Update TherapistDashboard to show real therapists

### PRIORITY 3: Fix Availability Check
- [ ] Modify `checkAvailability()` to query Supabase bookings in real-time
- [ ] Instead of checking state, query DB directly
- [ ] Handle race conditions (booking created between check & insert)

### PRIORITY 4: Persist Therapist Updates
- [ ] Modify `toggleTherapistBlock()` to update Supabase `profiles` table
- [ ] Modify `updateTherapist()` to persist to DB
- [ ] Remove state-only updates

### PRIORITY 5: Bookings Single Source of Truth
- [ ] Fetch bookings from Supabase on load
- [ ] Remove mock booking fallback
- [ ] Handle real-time updates with Supabase realtime subscriptions
- [ ] Remove `setBookings` state-based approach

### PRIORITY 6: Remove Mock Products & Expenses
- [ ] Either implement features or remove from code
- [ ] If keeping: move to Supabase

---

## 7. Impact When Mock Data Is Not Synced

**Scenario:** User books a massage

1. ✅ Booking saved to Supabase `public.bookings` table
2. ✅ Booking added to React state
3. ❌ But state not synced when:
   - Admin books appointment in different browser tab
   - Database modified directly via SQL
   - Therapist updates availability in another session
   - Page refreshes (state reset to MOCK_BOOKINGS)

**Result:** Users see stale/incorrect availability data

---

## 8. Recommended Solution

Use **React Query (or SWR)** with **Supabase Realtime**:

```typescript
// Fetch services from Supabase
const { data: services } = useQuery('services', () =>
  supabase.from('services').select()
);

// Fetch therapists from Supabase
const { data: therapists } = useQuery('therapists', () =>
  supabase.from('profiles')
    .select()
    .eq('role', 'therapist')
);

// Fetch bookings with real-time updates
const { data: bookings } = useQuery('bookings', () =>
  supabase.from('bookings').select()
);

// Subscribe to real-time changes
useEffect(() => {
  const subscription = supabase
    .from('bookings')
    .on('*', payload => {
      queryClient.invalidateQueries('bookings');
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

---

## Summary

- **9 out of 10 data sources are MOCKED**
- **Only Supabase Auth is real**
- **State & DB not synced**
- **Data loss on refresh**
- **Need to migrate to real database queries**

