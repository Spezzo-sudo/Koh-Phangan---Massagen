# 🚀 NEXT STEPS - Was Du SOFORT machen kannst

## TL;DR - Kurz und knackig

Dein Projekt hat **echtes Supabase Backend**, aber der **Frontend nutzt immer noch Fake-Daten**.

**Die Lösung:** React Query installieren + Services/Therapists/Bookings von DB laden statt hardcodiert

**Zeit bis Produktion:** 3-4 Wochen

---

## Schritt 1: React Query Installieren (5 Minuten)

```bash
cd C:\Users\mark\Desktop\Koh-Phangan---Massagen
npm install @tanstack/react-query
```

---

## Schritt 2: Neue Datei erstellen (lib/queries.ts)

Erstelle `lib/queries.ts` mit folgendem Inhalt:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

// Hole Services vom echten Supabase
export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*');
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000 // Cache 5 Minuten
  });
};

// Hole Therapists vom echten Supabase
export const useTherapists = () => {
  return useQuery({
    queryKey: ['therapists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'therapist');
      if (error) throw error;
      return data || [];
    }
  });
};

// Hole Bookings vom echten Supabase
export const useBookings = (userId?: string) => {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      let query = supabase.from('bookings').select('*');
      if (userId) {
        query = query.or(`customer_id.eq.${userId},therapist_id.eq.${userId}`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });
};
```

---

## Schritt 3: QueryClientProvider Setup (10 Minuten)

**Datei:** `App.tsx` - Oben einfügen:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Neue Zeile hinzufügen
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <DataProvider>
            <BrowserRouter>
              {/* ... rest des App */}
            </BrowserRouter>
          </DataProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

---

## Schritt 4: CustomerDashboard aktualisieren (15 Minuten)

**Datei:** `pages/CustomerDashboard.tsx`

**CHANGE:**

```typescript
// ❌ VORHER (falsch):
import { SERVICES, THERAPISTS } from '../constants';

// ✅ NACHHER (richtig):
import { useServices, useTherapists } from '../lib/queries';

export default function CustomerDashboard() {
  // ✅ Hole echte Daten von Supabase
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: therapists = [], isLoading: therapistsLoading } = useTherapists();

  if (servicesLoading || therapistsLoading) {
    return <div className="p-4">Loading services...</div>;
  }

  return (
    <div>
      {/* Services von DB anzeigen */}
      {services.map(service => (
        <div key={service.id}>
          <h3>{service.title}</h3>
          <p>{service.description}</p>
          <p>฿{service.price_60}/60min</p>
        </div>
      ))}

      {/* Therapists von DB anzeigen */}
      {therapists.map(therapist => (
        <div key={therapist.id}>
          <h3>{therapist.full_name}</h3>
          <p>{therapist.role}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Schritt 5: Test - Services von Supabase laden (5 Minuten)

1. **Starte die App:**
   ```bash
   npm run dev
   ```

2. **Gehe zu:** http://localhost:5174

3. **Prüfe in Browser Console (F12):**
   - Sollte `services` von Supabase laden
   - Kein `SERVICES` Fehler mehr

4. **Verifiziere in Supabase Dashboard:**
   - Gehe zu `public.services` Table
   - Sollte 6 Services zeigen (von SEED_DATA.sql)

---

## Schritt 6: Hardcoded Daten löschen (10 Minuten)

**Datei:** `constants.ts`

**LÖSCHE diese Lines:**
```typescript
❌ export const SERVICES: Service[] = [...]  // Komplett löschen
❌ export const THERAPISTS: Therapist[] = [...] // Komplett löschen
❌ export const MOCK_BOOKINGS: Booking[] = [...] // Komplett löschen
❌ export const PRODUCTS: Product[] = [...] // Komplett löschen
❌ export const MOCK_EXPENSES: Expense[] = [...] // Komplett löschen
```

**BEHALTE diese:**
```typescript
✅ export const TIME_SLOTS = ['09:00', '10:00', ...]
✅ export const SERVICE_CATEGORIES = ['Massage', 'Nails', ...]
```

---

## Schritt 7: Booking Fix (20 Minuten)

**Datei:** `contexts.tsx` - Funktion `addBooking()`

**WICHTIG:** Entferne den Fallback zu Mock:

```typescript
const addBooking = async (input: CreateBookingInput) => {
  setIsLoading(true);
  setError(null);

  try {
    // ✅ Nur zu Supabase speichern
    const { data, error: dbError } = await supabase
      .from('bookings')
      .insert([{
        customer_id: input.customerName, // TODO: Fix - use actual user ID
        therapist_id: input.therapistId,
        service_id: input.serviceId,
        scheduled_date: input.date,
        scheduled_time: input.time,
        duration: input.duration,
        location_text: input.location,
        gps_lat: input.coordinates?.lat || null,
        gps_lng: input.coordinates?.lng || null,
        total_price: input.totalPrice,
        status: 'pending',
        notes: input.notes || null
      }])
      .select();

    if (dbError) throw dbError;

    // ❌ LÖSCHE diese Zeilen:
    // setBookings(prev => [newBooking, ...prev]); // Nicht nötig
    // await sendBookingNotifications(newBooking); // Macht zu Fehler

    console.log("✅ Booking saved to Supabase:", data);

    // ✅ Invalidate React Query Cache
    // (Später: queryClient.invalidateQueries({ queryKey: ['bookings'] });)
  } catch (e: any) {
    setError(e.message || "Failed to create booking.");
  } finally {
    setIsLoading(false);
  }
};
```

---

## Schritt 8: Test das Ganze (15 Minuten)

1. **Öffne zwei Browser-Tabs:**
   - Tab 1: http://localhost:5174
   - Tab 2: http://localhost:5174

2. **Gehe in Customer Dashboard Tab 1**

3. **Prüfe in Browser Console (F12):**
   - Services laden? ✅
   - Therapists laden? ✅
   - Keine SERVICES constant Error? ✅

4. **Gehe zu Supabase Dashboard:**
   - `public.services` - sollte 6 Einträge zeigen ✅
   - `public.profiles` WHERE role='therapist' - sollte Therapists zeigen ✅

---

## Wenn es nicht funktioniert

### Error: "SERVICES is not defined"
- Du hast `constants.ts` nicht richtig gelöscht
- Oder Component nutzt immer noch SERVICES
- Fix: Suche nach `SERVICES` in Code und ersetze mit `useServices()`

### Error: "Supabase not configured"
- `.env` File fehlt oder is falsch
- Check: `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` sind gesetzt?

### Services laden nicht
- Hast du SEED_DATA.sql schon ausgeführt?
- Check: Supabase Dashboard → SQL Editor → `SELECT * FROM public.services;`
- Sollte 6 Rows zeigen

### React Query Error
- Hast du `npm install @tanstack/react-query` gemacht?
- Hast du `QueryClientProvider` in App.tsx hinzugefügt?

---

## Nach Phase 1 - Nächste Schritte

Wenn Phase 1 fertig ist:
- Phase 2: Admin Dashboard (Services verwalten)
- Phase 3: Real-time Updates
- Phase 4: Testing & Deployment

Siehe [ROADMAP.md](ROADMAP.md) für Details

---

## Wichtige Notes

⚠️ **ACHTUNG:**
- Lösche KEINE `.env` Keys in der Datei (sind schon in .gitignore)
- Committen NOT ALLOWED: API Keys, Secrets
- Testing nur lokal mit echten Keys

---

## Zusammenfassung

| Schritt | Zeit | Was passiert |
|---------|------|--------------|
| 1 | 5 min | React Query installieren |
| 2 | 10 min | `lib/queries.ts` erstellen |
| 3 | 10 min | QueryClientProvider in App.tsx |
| 4 | 15 min | CustomerDashboard updaten |
| 5 | 5 min | Test - Services laden |
| 6 | 10 min | Hardcoded Daten löschen |
| 7 | 20 min | Booking Fix |
| 8 | 15 min | Test alles |
| **TOTAL** | **90 min** | **Phase 1 fertig!** |

---

## Ready? Los geht's! 🚀

Starte mit Schritt 1 oben und schreib mir, wenn du steckenbleibst!

