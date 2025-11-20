# Development Guide – Phangan Serenity

Dieser Guide richtet sich an Entwickler, die am Projekt mitarbeiten oder es weiterentwickeln möchten.

---

## 📐 Architektur-Übersicht

### Service-Layer-Pattern

Das Projekt nutzt ein **Service-Layer-Pattern** zur Trennung von UI-Logik und Daten-Logik. Dies ermöglicht:
- Einfaches Austauschen von Mock-Daten gegen echte API-Calls
- Testbarkeit (Unit Tests für Services)
- Klarere Code-Organisation

### Architektur-Diagramm

```
┌──────────────────────────────────────────────────────┐
│                    React UI Layer                     │
│  (Pages, Components, Hooks)                           │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│              React Context Layer                      │
│  - AuthContext (Login, User State)                    │
│  - LanguageContext (i18n)                             │
│  - DataContext (Bookings, Cart)                       │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────────┐
│                Service Layer (Mock)                   │
│  - constants.ts (Static Data)                         │
│  - usePlacesAutocomplete (Mock Google Maps)           │
└─────────────────┬────────────────────────────────────┘
                  │
                  ▼ (Wird ersetzt bei Live-Schaltung)
┌──────────────────────────────────────────────────────┐
│             External APIs (Planned)                   │
│  - Supabase (Database + Auth)                         │
│  - Google Maps Places API                             │
│  - Stripe (Optional für Online-Payment)               │
└──────────────────────────────────────────────────────┘
```

---

## 🗂️ Projektstruktur (Detailliert)

```
/Koh-Phangan---Massagen/
│
├── pages/                   # Hauptseiten (Route-basiert)
│   ├── Home.tsx            # Landing Page (Hero, Featured Services)
│   ├── BookingPage.tsx     # 5-Step Buchungsprozess (KERN der App)
│   ├── TherapistsPage.tsx  # Team-Übersicht
│   ├── ShopPage.tsx        # Produktkatalog
│   ├── LoginPage.tsx       # Login/Register (aktuell Mock)
│   ├── CustomerDashboard.tsx  # Kunden-Dashboard
│   └── TherapistDashboard.tsx # Therapeuten-Dashboard
│
├── hooks/                   # Custom React Hooks
│   └── usePlacesAutocomplete.ts  # Google Places Mock Hook
│
├── lib/                     # Externe Bibliotheken & Utilities
│   ├── supabase.ts         # Supabase Client (vorbereitet, noch nicht aktiv)
│   └── googleMaps.ts       # Google Maps Loader (vorbereitet)
│
├── contexts.tsx             # React Context Providers (Auth, Language, Data)
├── constants.ts             # Mock-Daten (Services, Therapeuten, Produkte)
├── types.ts                # TypeScript Interfaces & Enums
├── translations.ts         # i18n Übersetzungen (8 Sprachen)
├── App.tsx                 # Haupt-App-Komponente (Routing)
├── index.tsx               # Entry Point (React Root)
│
├── index.html              # HTML Template
├── tailwind.config.js      # Tailwind CSS Config (Custom Colors)
├── vite.config.ts          # Vite Build Config
├── tsconfig.json           # TypeScript Config
└── package.json            # Dependencies
```

---

## 🧩 Wichtige Module im Detail

### 1. **contexts.tsx** – State Management

Enthält drei zentrale Context Provider:

#### AuthContext
```typescript
// Simuliert Login/Logout
// In Live-Version: Supabase Auth
const { isAuthenticated, user, login, logout } = useAuth();
```

**Funktionen:**
- `login(email, password, role)` – Simulierter Login
- `logout()` – Logout & State-Reset
- `user` – Aktueller User (Customer/Therapist/Admin)

#### LanguageContext
```typescript
// Mehrsprachigkeit
const { language, setLanguage, t } = useLanguage();
```

**Funktionen:**
- `setLanguage(lang)` – Sprache wechseln (wird in localStorage gespeichert)
- `t(key)` – Übersetzung abrufen (z.B. `t('nav.home')`)

#### DataContext
```typescript
// Globaler State für Buchungen & Warenkorb
const { bookings, cart, addBooking, addToCart } = useData();
```

**Funktionen:**
- `addBooking(booking)` – Neue Buchung erstellen
- `addToCart(product)` – Produkt zum Warenkorb hinzufügen
- `updateBookingStatus(id, status)` – Status ändern (z.B. "confirmed" → "on_way")

---

### 2. **constants.ts** – Mock-Daten

Enthält alle statischen Daten:

```typescript
export const SERVICES: Service[] = [...]        // 8 Services (Massagen, Nails, Packages)
export const THERAPISTS: Therapist[] = [...]   // 4 Therapeuten mit Skills & Bewertungen
export const PRODUCTS: Product[] = [...]       // 3 Produkte (Öle, Balsame)
export const BOOKING_ADDONS: Addon[] = [...]   // 4 Add-ons (Tiger Balm, etc.)
export const TIME_SLOTS = [...]                // Buchbare Uhrzeiten
export const KOH_PHANGAN_LOCATIONS = [...]     // Mock Google Places Daten
export const MOCK_BOOKINGS: Booking[] = [...]  // Beispiel-Buchungen
```

**Warum Mock-Daten?**
- Schnellere Entwicklung ohne Backend-Abhängigkeit
- Kosten-Ersparnis (keine API-Calls während Prototyping)
- Einfaches Testen verschiedener Szenarien

**Migration zur Live-Version:**
- `SERVICES` → Supabase Table `services`
- `THERAPISTS` → Supabase Table `therapists`
- `PRODUCTS` → Supabase Table `products`
- `MOCK_BOOKINGS` → Supabase Table `bookings`

---

### 3. **types.ts** – TypeScript Interfaces

Zentrale Typen-Definitionen:

```typescript
// Enums
export enum ServiceType {
  THAI = 'Thai Massage',
  OIL = 'Oil Massage',
  DEEP_TISSUE = 'Deep Tissue',
  // ... weitere
}

// Interfaces
export interface Service { ... }
export interface Therapist { ... }
export interface Booking { ... }
export interface User { ... }
```

**Wichtig:** Diese Types sind **1:1 auf die Supabase-Datenbank abgestimmt**.
Das `DB_Booking` Interface spiegelt die SQL-Tabelle wider (snake_case).

---

### 4. **BookingPage.tsx** – Das Herzstück

Der komplexeste Teil der App. Ein 5-stufiger Buchungsprozess:

```
Step 0: Service wählen (mit Kategorie-Filter)
   ↓
Step 1: Add-ons hinzufügen
   ↓
Step 2: Datum, Zeit, Dauer wählen
   ↓
Step 3: Therapeut auswählen (Skill-basiertes Filtering)
   ↓
Step 4: Kontaktdaten & Standort (Google Maps Autocomplete)
   ↓
Step 5: Bestätigung
```

**Wichtige Logik:**

#### Therapeuten-Filtering (Step 3)
```typescript
const availableTherapists = useMemo(() => {
  if (!selectedServiceId) return [];
  const service = SERVICES.find(s => s.id === selectedServiceId);

  return THERAPISTS.filter(t =>
    t.skills.includes(service.type) && t.available
  ).sort((a, b) => b.rating - a.rating);
}, [selectedServiceId]);
```

**Ergebnis:** Zeigt nur Therapeuten, die den gewählten Service anbieten (z.B. bei "Maniküre" nur Nail-Specialists).

#### Preis-Kalkulation
```typescript
const basePrice = duration === 60 ? service.price60 : service.price90;
const addonsPrice = selectedAddons.reduce((sum, id) => {
  const addon = BOOKING_ADDONS.find(a => a.id === id);
  return sum + (addon?.price || 0);
}, 0);
const totalPrice = basePrice + addonsPrice;
```

---

### 5. **usePlacesAutocomplete.ts** – Google Maps Mock

```typescript
export function usePlacesAutocomplete(input: string) {
  const [predictions, setPredictions] = useState([]);

  // MOCK: Filtert lokale Liste
  // LIVE: Würde google.maps.places.AutocompleteService nutzen
}
```

**Migration zur Live-Version:**
```typescript
// Statt Mock-Daten:
const service = new google.maps.places.AutocompleteService();
service.getPlacePredictions({ input, types: ['establishment'] }, callback);
```

---

## 🎨 Styling & Design System

### Tailwind CSS Custom Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-teal': '#2dd4bf',   // CTAs, Links
        'brand-dark': '#0f172a',   // Überschriften
        'brand-sand': '#fef3c7',   // Backgrounds
        'brand-light': '#f0fdfa',  // Hover-States
        'brand-gold': '#fbbf24'    // Bewertungen
      }
    }
  }
}
```

### Utility-Klassen

- **Mobile-First:** Alle Layouts sind zuerst für Mobile optimiert (`md:`, `lg:` für Desktop)
- **Responsive Sticky Elements:** Footer-Buttons auf Mobile sind sticky (`fixed bottom-[72px]`)
- **Smooth Animations:** `animate-fade-in`, `transition-all`, `hover:scale-105`

---

## 🌐 Internationalisierung (i18n)

### Übersetzungen hinzufügen

**1. Neuen Key in `translations.ts` hinzufügen:**

```typescript
export const translations: Record<Language, any> = {
  en: {
    nav: { home: 'Home', book: 'Book' },
    // NEU:
    checkout: {
      title: 'Checkout',
      confirm: 'Confirm Payment'
    }
  },
  de: {
    nav: { home: 'Startseite', book: 'Buchen' },
    checkout: {
      title: 'Zur Kasse',
      confirm: 'Zahlung bestätigen'
    }
  },
  // ... weitere Sprachen
}
```

**2. Im Code verwenden:**

```typescript
const { t } = useLanguage();
<h1>{t('checkout.title')}</h1>
```

### Fehlende Übersetzungen

**Aktuell sind nur ~5% der UI-Texte übersetzt!**

**TODO (kritisch):**
- Service-Beschreibungen übersetzen
- Formular-Labels übersetzen
- Fehler-/Erfolgsmeldungen übersetzen
- Dashboard-Texte übersetzen

---

## 🛠️ Entwickler-Workflows

### Lokale Entwicklung starten

```bash
npm run dev
```

App läuft auf `http://localhost:5173`

**Hot Reload:** Änderungen werden sofort sichtbar (Vite HMR)

---

### Neuen Service hinzufügen

**1. Service in `constants.ts` definieren:**

```typescript
{
  id: 's9',
  title: 'Hot Stone Massage',
  description: 'Relaxing massage with heated stones.',
  price60: 500,
  price90: 750,
  type: ServiceType.HOT_STONE, // <- Neuer Type!
  category: 'Massage',
  image: 'https://...'
}
```

**2. ServiceType Enum erweitern:**

```typescript
// types.ts
export enum ServiceType {
  // ... existing
  HOT_STONE = 'Hot Stone Massage'
}
```

**3. Therapeuten mit neuer Skill ausstatten:**

```typescript
{
  id: 't1',
  name: 'Ms. Ang',
  skills: [ServiceType.THAI, ServiceType.HOT_STONE], // <- Hinzugefügt
  // ...
}
```

**Fertig!** Der Service erscheint automatisch in der Buchungsseite.

---

### Neuen Therapeuten hinzufügen

```typescript
{
  id: 't5',
  name: 'Mr. Som',
  image: 'https://...',
  skills: [ServiceType.THAI, ServiceType.DEEP_TISSUE],
  bio: 'Expert in sports massage.',
  rating: 4.8,
  available: true,
  locationBase: 'Haad Rin',
  verified: true,
  reviewCount: 67,
  recentReview: "Amazing deep tissue work!"
}
```

---

### Testing-Workflow

**Aktuell: Manuelles Testing**

**Empfohlene Testszenarien:**

1. **Buchungsprozess durchlaufen** (alle 5 Steps)
2. **Sprache wechseln** (prüfen, ob Übersetzungen funktionieren)
3. **Therapeuten-Matching** (z.B. "Maniküre" buchen → Nur Nail-Spezialisten sehen)
4. **Responsive Design** (Mobile, Tablet, Desktop)
5. **Login/Logout** (Dashboard-Zugriff testen)

**TODO (für Live-Version):**
- Unit Tests (Jest + React Testing Library)
- E2E Tests (Playwright oder Cypress)
- Accessibility Tests (Lighthouse, axe)

---

## 🔧 Build & Deployment

### Production Build erstellen

```bash
npm run build
```

Erzeugt optimierte Dateien in `/dist`

**Optimierungen:**
- Code Splitting (React Router lazy loading)
- Minification (Vite)
- Tree Shaking (Unused Code wird entfernt)

---

### Deployment auf Vercel (Empfohlen)

**1. Vercel Account erstellen** (https://vercel.com)

**2. GitHub Repo verbinden**

**3. Umgebungsvariablen setzen:**

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJ...
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

**4. Deploy**

```bash
vercel deploy --prod
```

**Vorteile Vercel:**
- Automatische SSL-Zertifikate
- CDN (schnelle Ladezeiten weltweit)
- Automatische Previews für Pull Requests
- Edge Functions Support (für zukünftiges Backend)

---

## 🐛 Debugging

### Browser DevTools

**React DevTools Extension:**
- Installieren für Chrome/Firefox
- Context-State in Echtzeit sehen

**Nützliche Console-Logs:**

```typescript
// In BookingPage.tsx
console.log('Available Therapists:', availableTherapists);
console.log('Total Price:', totalPrice);
```

**Common Issues:**

| Problem | Lösung |
|---------|--------|
| "Therapeut wird nicht angezeigt" | Prüfen, ob Therapeut die richtige `skill` hat |
| "Übersetzung fehlt" | Key in `translations.ts` hinzufügen |
| "Buchung wird nicht gespeichert" | Normal! Ist Mock-Daten (nur im RAM) |
| "Google Maps zeigt nichts" | Normal! Ist Mock-Hook (keine echte API) |

---

## 📦 Dependencies Übersicht

```json
{
  "react": "^19.2.0",              // UI Framework
  "react-router-dom": "^7.9.6",    // Routing
  "lucide-react": "^0.554.0",      // Icons
  "@supabase/supabase-js": "^2.83.0", // Backend (vorbereitet)
  "vite": "^6.2.0",                // Build Tool
  "typescript": "~5.8.2"           // Type Safety
}
```

**Keine weiteren Dependencies nötig!** (Lean & Fast)

---

## 🚀 Next Steps für Entwickler

**Quick Wins:**
- [ ] Übersetzungen vervollständigen (translations.ts)
- [ ] Mehr Mock-Services hinzufügen
- [ ] Therapeuten-Profile erweitern (Fotos, Zertifikate)

**Medium Complexity:**
- [ ] Filter/Sortierung für Services (z.B. nach Preis)
- [ ] Favoriten-System für Therapeuten
- [ ] Bewertungs-System implementieren

**Advanced:**
- [ ] Supabase Integration (siehe DEPLOYMENT.md)
- [ ] Google Maps API aktivieren
- [ ] Payment Gateway (Stripe)
- [ ] Push Notifications (Firebase Cloud Messaging)

---

## 📞 Support & Fragen

Bei Fragen oder Problemen:
- **GitHub Issues:** https://github.com/Spezzo-sudo/Koh-Phangan---Massagen/issues
- **Code Review:** Pull Requests sind willkommen!

---

**Happy Coding! 🚀**
