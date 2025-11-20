# Deployment Guide – Go-Live Checkliste

Dieser Guide führt dich Schritt für Schritt durch die **Live-Schaltung** von Phangan Serenity.

---

## 🎯 Übersicht: Von Prototyp zu Production

**Aktueller Status:** Prototyp (Mock-Daten, keine externe API)
**Ziel:** Live-App mit echter Datenbank, Google Maps & Payment

**Geschätzter Zeitaufwand:** 4-6 Stunden (bei Vorbereitung)
**Kosten:** ~10-20 USD/Monat (Supabase Free Tier + Google Maps ~5 USD)

---

## ✅ Pre-Launch Checklist

### Phase 1: Backend Setup (Supabase) – 2 Stunden

#### 1.1 Supabase Projekt erstellen

**Schritte:**

1. Account erstellen auf https://supabase.com
2. Neues Projekt anlegen:
   - **Name:** phangan-serenity
   - **Database Password:** [Sicheres Passwort generieren]
   - **Region:** Singapore (am nächsten zu Thailand)

3. **Projekt-URL & Keys notieren:**
   ```
   SUPABASE_URL: https://xxxxx.supabase.co
   SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

#### 1.2 Datenbank-Schema erstellen

**Im Supabase SQL Editor folgendes SQL ausführen:**

```sql
-- ============================================
-- PHANGAN SERENITY DATABASE SCHEMA
-- ============================================

-- Tabelle: services (Dienstleistungen)
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price_60 INTEGER NOT NULL,
  price_90 INTEGER NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabelle: therapists (Therapeuten)
CREATE TABLE therapists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  skills TEXT[], -- Array von ServiceTypes
  bio TEXT,
  rating NUMERIC(2, 1) DEFAULT 0,
  available BOOLEAN DEFAULT TRUE,
  location_base TEXT,
  verified BOOLEAN DEFAULT FALSE,
  review_count INTEGER DEFAULT 0,
  recent_review TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabelle: products (Shop-Produkte)
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image TEXT,
  category TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabelle: users (Benutzer)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'customer', -- 'customer' | 'therapist' | 'admin'
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabelle: bookings (Buchungen)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),

  -- Beziehungen
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  therapist_id TEXT REFERENCES therapists(id),
  service_id TEXT REFERENCES services(id),

  -- Buchungsdetails
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL, -- z.B. "14:00"
  duration INTEGER NOT NULL, -- 60 oder 90
  addons TEXT[], -- Array von Addon-IDs

  -- Preis & Status
  total_price INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'confirmed' | 'on_way' | 'arrived' | 'in_progress' | 'completed' | 'cancelled'

  -- Location
  location_text TEXT NOT NULL,
  location_lat NUMERIC(10, 8),
  location_lng NUMERIC(11, 8),

  -- Kontakt
  customer_phone TEXT,
  notes TEXT
);

-- Tabelle: cart_items (Warenkörbe)
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabelle: addons (Extras)
CREATE TABLE addons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT
);

-- Indexes für Performance
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_therapist ON bookings(therapist_id);
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
```

---

#### 1.3 Initial Data Import (Mock-Daten migrieren)

**Services importieren:**

```sql
INSERT INTO services (id, title, description, price_60, price_90, type, category, image) VALUES
('s1', 'Traditional Thai Massage', 'Ancient healing system...', 300, 450, 'Thai Massage', 'Massage', 'https://...'),
('s2', 'Aroma Oil Massage', 'Gentle massage using aromatic oils...', 400, 600, 'Oil Massage', 'Massage', 'https://...'),
-- ... weitere Services aus constants.ts kopieren
```

**Therapeuten importieren:**

```sql
INSERT INTO therapists (id, name, image, skills, bio, rating, available, location_base, verified, review_count, recent_review) VALUES
('t1', 'Ms. Ang', 'https://...', ARRAY['Thai Massage', 'Foot Reflexology'], 'Specialist in...', 4.9, TRUE, 'Thong Sala', TRUE, 124, 'Best Thai massage...'),
-- ... weitere
```

**Produkte & Addons analog importieren**

---

#### 1.4 Row Level Security (RLS) aktivieren

**WICHTIG für Sicherheit!**

```sql
-- Beispiel: Kunden können nur ihre eigenen Buchungen sehen
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Therapeuten können ihre zugewiesenen Bookings sehen & updaten
CREATE POLICY "Therapists can view assigned bookings"
  ON bookings FOR SELECT
  USING (
    therapist_id IN (
      SELECT id FROM therapists WHERE id = (SELECT id FROM users WHERE auth.uid() = users.id)
    )
  );

-- ... weitere Policies für cart_items, users, etc.
```

---

#### 1.5 Supabase Auth konfigurieren

**Im Supabase Dashboard → Authentication:**

1. **Email Provider aktivieren:**
   - Sign-in methods → Email → Enable
   - Confirm Email: Optional (für MVP: OFF)

2. **OAuth Provider (optional):**
   - Google Sign-In aktivieren (für schnelleren Login)

3. **Email Templates anpassen:**
   - Konfirmations-Email
   - Passwort-Reset-Email
   - Mit Branding (Logo, Farben)

---

### Phase 2: Google Maps API Setup – 30 Minuten

#### 2.1 Google Cloud Projekt erstellen

1. Gehe zu https://console.cloud.google.com
2. Neues Projekt: **"Phangan Serenity"**
3. **APIs aktivieren:**
   - Maps JavaScript API
   - Places API
   - Geocoding API

#### 2.2 API Key erstellen

1. **Credentials → Create Credentials → API Key**
2. **API Key einschränken (WICHTIG!):**
   ```
   Application restrictions: HTTP referrers
   Website restrictions:
     - https://phanganserenity.com/*
     - http://localhost:5173/* (für Dev)

   API restrictions:
     - Maps JavaScript API
     - Places API
   ```

3. **Billing aktivieren:**
   - Credit Card hinterlegen
   - Budget Alert setzen (z.B. 10 USD/Monat)

**Geschätzte Kosten:** ~3-5 USD/Monat bei 100-200 Buchungen/Monat

---

### Phase 3: Code-Migration (Mock → Live) – 1 Stunde

#### 3.1 Environment Variables erstellen

**Datei erstellen: `.env.local`** (im Root-Verzeichnis)

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX

# Optional: Stripe (für Online-Payment)
VITE_STRIPE_PUBLIC_KEY=pk_live_XXXXXXXXX
```

**⚠️ WICHTIG:** `.env.local` zu `.gitignore` hinzufügen!

```bash
echo ".env.local" >> .gitignore
```

---

#### 3.2 Supabase Client aktivieren

**`lib/supabase.ts` ist bereits vorbereitet:**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Keine Änderung nötig!** Funktioniert, sobald `.env.local` existiert.

---

#### 3.3 DataContext auf Supabase umstellen

**In `contexts.tsx` die Mock-Funktionen ersetzen:**

**Vorher (Mock):**
```typescript
const addBooking = (booking: CreateBookingInput) => {
  const newBooking: Booking = { id: generateId(), status: 'pending', ...booking };
  setBookings(prev => [...prev, newBooking]);
};
```

**Nachher (Supabase):**
```typescript
import { supabase } from './lib/supabase';

const addBooking = async (booking: CreateBookingInput) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      customer_id: user?.id,
      therapist_id: booking.therapistId,
      service_id: booking.serviceId,
      scheduled_date: booking.date,
      scheduled_time: booking.time,
      duration: booking.duration,
      total_price: booking.totalPrice,
      location_text: booking.location,
      customer_phone: booking.customerPhone,
      notes: booking.notes,
      addons: booking.addons
    })
    .select()
    .single();

  if (error) throw error;

  // State aktualisieren
  setBookings(prev => [...prev, data]);
};
```

**Analog für:**
- `fetchBookings()` → `supabase.from('bookings').select('*')`
- `updateBookingStatus()` → `supabase.from('bookings').update({status}).eq('id', id)`

---

#### 3.4 Google Maps Hook aktivieren

**In `hooks/usePlacesAutocomplete.ts` die Mock-Logik ersetzen:**

**Vorher (Mock):**
```typescript
setPredictions(
  KOH_PHANGAN_LOCATIONS.filter(loc => loc.toLowerCase().includes(input.toLowerCase()))
);
```

**Nachher (Google Places API):**
```typescript
import { loadGoogleMaps } from '../lib/googleMaps';

const service = new google.maps.places.AutocompleteService();

service.getPlacePredictions(
  {
    input,
    componentRestrictions: { country: 'th' },
    types: ['establishment', 'geocode']
  },
  (predictions, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      setPredictions(predictions || []);
    }
  }
);
```

---

#### 3.5 Auth mit Supabase verbinden

**In `contexts.tsx` → AuthContext:**

**Login-Funktion ersetzen:**
```typescript
const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  // User-Daten aus users-Tabelle laden
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  setUser(userData);
  setIsAuthenticated(true);
};
```

**Logout:**
```typescript
const logout = async () => {
  await supabase.auth.signOut();
  setUser(null);
  setIsAuthenticated(false);
};
```

---

### Phase 4: Testing & QA – 1 Stunde

#### 4.1 Lokales Testing mit Live-APIs

```bash
# .env.local mit echten Keys erstellen
# Dann:
npm run dev
```

**Test-Szenarien:**

- [ ] Login/Logout funktioniert (Supabase Auth)
- [ ] Buchung erstellen → Erscheint in Supabase Dashboard
- [ ] Google Maps Autocomplete zeigt echte Orte
- [ ] Dashboard zeigt gespeicherte Buchungen
- [ ] Therapeuten können Buchungen annehmen/ablehnen
- [ ] Status-Updates werden in DB gespeichert

---

#### 4.2 Browser Compatibility Testing

**Testen auf:**
- [ ] Chrome (Desktop & Mobile)
- [ ] Safari (iOS)
- [ ] Firefox
- [ ] Samsung Internet (Android)

**Tools:**
- BrowserStack (kostenpflichtig)
- Responsively App (kostenlos)

---

#### 4.3 Performance Testing

**Lighthouse Audit:**
```bash
npm run build
npm run preview
# Dann im Browser: F12 → Lighthouse → "Generate Report"
```

**Ziele:**
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >80

**Common Fixes:**
- Bilder komprimieren (WebP Format)
- Lazy Loading für Images
- Preload wichtiger Fonts

---

### Phase 5: Deployment – 30 Minuten

#### 5.1 Vercel Deployment

**Schritte:**

1. **Vercel Account erstellen** (https://vercel.com)

2. **GitHub Repo verbinden:**
   - "Import Project" → GitHub auswählen
   - Repository: `Koh-Phangan---Massagen` auswählen

3. **Environment Variables in Vercel setzen:**
   ```
   Settings → Environment Variables → Add

   VITE_SUPABASE_URL = https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGci...
   VITE_GOOGLE_MAPS_API_KEY = AIzaSy...
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

5. **Custom Domain verbinden:**
   - Domain kaufen (z.B. Namecheap: `phanganserenity.com`)
   - In Vercel: Settings → Domains → Add Domain
   - DNS Records bei Registrar setzen (Vercel zeigt Anleitung)

**Fertig!** App ist live unter `https://phanganserenity.com`

---

#### 5.2 Alternative: Netlify Deployment

```bash
# Netlify CLI installieren
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**Vorteile Netlify:**
- Einfacheres Interface für Anfänger
- Built-in Form Handling
- Kostenlose Analytics

---

### Phase 6: Business Setup – 2 Stunden

#### 6.1 Rechtliche Seiten erstellen

**Zu erstellen:**

1. **Impressum** (Pflicht in DE/EU)
   - Firmendaten
   - Kontakt
   - Handelsregisternummer (falls vorhanden)

2. **Datenschutzerklärung (DSGVO-konform)**
   - Tools: https://datenschutz-generator.de
   - Erwähnen: Supabase (EU-Server), Google Maps, Cookies

3. **AGB (Allgemeine Geschäftsbedingungen)**
   - Stornierungsbedingungen
   - Zahlungsbedingungen
   - Haftungsausschluss

**Als neue Seiten hinzufügen:**
```typescript
// pages/ImprintPage.tsx
// pages/PrivacyPage.tsx
// pages/TermsPage.tsx
```

**Im Footer verlinken:**
```typescript
<Link to="/imprint">Impressum</Link>
<Link to="/privacy">Datenschutz</Link>
<Link to="/terms">AGB</Link>
```

---

#### 6.2 Analytics einrichten

**Google Analytics 4:**

1. Account erstellen: https://analytics.google.com
2. Tracking-ID kopieren (z.B. `G-XXXXXXXXXX`)
3. In `index.html` einfügen:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Alternativ: Plausible Analytics** (DSGVO-freundlich, keine Cookies)

---

#### 6.3 Therapeuten onboarden

**Admin-Panel (TODO):**

Aktuell manuell in Supabase:

1. Supabase Dashboard → Table Editor → `users`
2. Insert Row:
   ```
   email: therapist1@example.com
   name: Ms. Ang
   role: therapist
   ```
3. Passwort setzen: Authentication → Users → Invite User

**Therapeuten-Schulung:**
- Login-Daten senden
- Dashboard-Tour (Video aufnehmen)
- Support-Hotline einrichten (WhatsApp Business?)

---

### Phase 7: Monitoring & Maintenance

#### 7.1 Error Tracking

**Sentry einrichten:**

```bash
npm install @sentry/react
```

```typescript
// In index.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxxxx@sentry.io/xxxxx",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

**Vorteile:**
- Automatische Fehler-Reports
- Stack Traces
- User Feedback

---

#### 7.2 Uptime Monitoring

**UptimeRobot (kostenlos):**
- Prüft alle 5 Minuten, ob Seite erreichbar ist
- Email-Alert bei Ausfall

**Alternativ:** Vercel Analytics (eingebaut)

---

#### 7.3 Backup-Strategie

**Supabase Auto-Backups:**
- Free Tier: 7 Tage Backups
- Pro Tier: 30 Tage + Point-in-Time Recovery

**Zusätzlich: Wöchentliche Exports**

```sql
-- Im Supabase SQL Editor ausführen (manuell oder via Cron):
COPY (SELECT * FROM bookings) TO '/tmp/bookings_backup.csv' CSV HEADER;
```

---

## 🚨 Go-Live Day Checkliste

**24h vor Launch:**

- [ ] Final Testing auf Staging-Environment
- [ ] Performance Audit (Lighthouse)
- [ ] Security Audit (OWASP Top 10)
- [ ] Backup erstellen (Supabase Snapshot)

**Launch Day:**

- [ ] DNS auf Production umstellen
- [ ] SSL-Zertifikat prüfen (https://)
- [ ] Smoke Tests (Login, Booking, Checkout)
- [ ] Analytics aktiviert & funktioniert
- [ ] Error Tracking aktiv (Sentry)
- [ ] Monitoring aktiv (UptimeRobot)

**Nach Launch:**

- [ ] Social Media Posts (Instagram, Facebook)
- [ ] Pressemitteilung (lokale Medien auf Koh Phangan)
- [ ] Erste 10 Kunden: Rabatt-Code (z.B. LAUNCH20)

---

## 📊 KPIs & Success Metrics

**Zu tracken:**

- Buchungen pro Tag
- Conversion Rate (Besucher → Buchung)
- Durchschnittlicher Buchungswert (THB)
- Therapeuten-Auslastung
- Customer Satisfaction Score (Post-Service-Umfrage)

**Tools:**
- Google Analytics (Traffic)
- Supabase Dashboard (Buchungen)
- Custom SQL Reports (Umsatz-Analytics)

---

## 🆘 Notfall-Plan

**Was tun bei:**

### App ist down
1. Vercel Status prüfen (https://vercel.com/status)
2. Supabase Status prüfen (https://status.supabase.com)
3. Rollback auf letzten funktionierenden Deploy
   ```bash
   vercel rollback
   ```

### Datenbank-Fehler
1. Supabase Logs prüfen (Dashboard → Logs)
2. RLS Policies prüfen (häufigste Fehlerquelle)
3. Backup wiederherstellen (falls Datenverlust)

### Zahlungsfehler
1. Prüfen: Stripe Webhook funktioniert?
2. Logs prüfen
3. Manuell in Stripe nachbuchen

---

## 💰 Kosten-Übersicht (monatlich)

| Service | Free Tier | Bezahlt (ab) |
|---------|-----------|--------------|
| **Supabase** | Bis 500 MB DB, 2 GB Traffic | $25/Monat (Pro) |
| **Vercel** | Unlimited Deployments | $20/Monat (Team) |
| **Google Maps** | $200 Credit/Monat | ~$3-10 (je nach Nutzung) |
| **Domain** | - | $12/Jahr |
| **Sentry** | 5k Events/Monat | $26/Monat |
| **Total (MVP)** | **~$0** (mit Free Tiers) | **~$30-50** (mit bezahlten Plans) |

**Tipp:** Starte mit Free Tiers, upgrade bei Bedarf.

---

## 🎉 Fertig!

Du hast es geschafft! Deine App ist live.

**Nächste Schritte:**
1. Marketing starten (Social Media, Google Ads)
2. User Feedback sammeln
3. Features iterieren

**Viel Erfolg! 🚀**
