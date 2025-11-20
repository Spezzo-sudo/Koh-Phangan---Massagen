# Phangan Serenity – Mobile Wellness Platform

<div align="center">

![Status](https://img.shields.io/badge/Status-MVP%20%2F%20Prototyp-orange)
![Tech](https://img.shields.io/badge/Tech-React%20%2B%20TypeScript-blue)
![Platform](https://img.shields.io/badge/Platform-Web%20%2F%20Mobile-green)

**"Uber für Massagen auf Koh Phangan"**

*Premium mobile massage, spa & beauty services delivered to your villa or hotel.*

</div>

---

## 🚧 Projektstatus: PROTOTYP / MVP (Entwicklungsphase)

> **⚠️ Wichtiger Hinweis:**
> Diese Anwendung befindet sich aktuell im **Prototyp-Status**.
> Das bedeutet, dass die Benutzeroberfläche (Frontend) und die Geschäftslogik vollständig implementiert sind, aber noch keine Verbindung zu externen Live-Diensten (Datenbank, Google Maps API, Payment-Provider) besteht.

- **Datenhaltung:** Alle Buchungen und Warenkörbe werden aktuell im Browser-Speicher (RAM) simuliert. Nach einem Neuladen der Seite (Refresh) wird der Ursprungszustand wiederhergestellt.
- **APIs:** Google Maps und Datenbank-Abfragen sind durch intelligente "Mock-Funktionen" ersetzt, um eine reibungslose Entwicklung und Tests ohne laufende API-Kosten zu ermöglichen.

---

## 📖 Das Konzept (Business Logic)

Phangan Serenity ist eine **Web-Applikation für mobile Wellness-Dienstleistungen**. Anders als bei klassischen Spa-Webseiten bucht der Kunde keinen Ort, sondern eine Dienstleistung **zu sich nach Hause** (Hotel, Villa, Bungalow).

### Kern-Mechanik
- **On-Demand Buchungssystem** für mobile Therapeuten
- **Zielgruppe:** Touristen und Expats auf Koh Phangan (daher 8+ Sprachen)
- **Zahlungsmodell:** "Cash on Arrival" (Barzahlung vor Ort beim Therapeuten)
- **Hybrid-Modell:** Neben Massagen werden auch Beauty-Services (Nägel) und physische Produkte (Öle) angeboten

---

## ✨ Funktionsumfang (Bereits implementiert)

### 🌍 Frontend & UX
- ✅ **Mobile-First Design:** Optimiert für Smartphones (Sticky Buttons, Slide-Over Menüs)
- ✅ **Internationalisierung (i18n):** Volle Unterstützung für **8 Sprachen** (EN, DE, TH, FR, ES, CN, HI, AR)
- ✅ **Auth-Guard:** Schutz sensibler Bereiche (Checkout, Dashboards) durch Login-Zwang
- ✅ **Responsive Layout:** Desktop, Tablet und Mobile optimiert

### 📅 Buchungsprozess (Der Kern)
- ✅ **Smartes Matching:** Filtert Therapeuten basierend auf Skills (z. B. zeigt bei "Maniküre" nur Nagel-Spezialisten an)
- ✅ **Zeit-Logik:** Vergangene Uhrzeiten sind gesperrt; Verfügbarkeitsprüfung in Echtzeit (simuliert)
- ✅ **Standort:** Integration von Browser-GPS zur Standortübermittlung oder manuelle Eingabe mit Autocomplete-Vorschlägen
- ✅ **Preiskalkulation:** Dynamischer Gesamtpreis (Dauer + Extras + Anfahrt)
- ✅ **Add-ons System:** Tiger Balm, Premium Öle, Nail Art, etc.
- ✅ **Multi-Step-Formular:** Geführter Buchungsprozess mit Fortschrittsanzeige

### 🛒 Integrierter Shop
- ✅ **"Bring-Service" Logik:** Produkte werden nicht versendet, sondern vom Therapeuten zum Termin mitgebracht
- ✅ **Warenkorb:** Slide-Over Cart mit Mengenanpassung
- ✅ **Produktkategorien:** Öle, Balsame, Aromatherapie

### 👥 Rollen-basierte Dashboards

**Kunde:**
- Buchungshistorie
- Live-Status-Timeline (Gebucht → Unterwegs → Angekommen → In Behandlung → Abgeschlossen)
- Profilverwaltung

**Therapeut / Mitarbeiter:**
- Job-Liste (Annehmen/Ablehnen)
- Status-Schalter (Online/Offline)
- Einnahmen-Übersicht (was muss beim Kunden kassiert werden)
- Navigation zum Kunden

---

## 🏗️ Technische Architektur & Mocks

Um die Entwicklung **schnell und kosteneffizient** zu halten, nutzen wir das **Service-Layer-Pattern**. Wir haben Schnittstellen gebaut, die aktuell "Dummy-Daten" liefern, aber mit einer einzigen Zeile Code auf "Echte Daten" umgeschaltet werden können.

| Funktion | Status im Prototyp | Geplante Live-Lösung | Vorbereitet? |
|----------|-------------------|---------------------|--------------|
| **Datenbank** | DataContext (React State & Mock Arrays) | Supabase (PostgreSQL) | ✅ Ja, Schema liegt bereit |
| **Karten / Orte** | Lokale Liste (constants.ts) | Google Maps Places API | ✅ Ja, Hook ist fertig |
| **Authentifizierung** | Simulierter Login | Supabase Auth / JWT | ✅ Ja, UI steht |
| **Server** | Client-Side Logic | Edge Functions / Node.js | ⏳ Teils vorbereitet |

### Tech Stack
- **Frontend:** React 19 + TypeScript
- **Routing:** React Router v7
- **Build Tool:** Vite 6
- **Icons:** Lucide React
- **Backend (geplant):** Supabase
- **Maps (geplant):** Google Maps JavaScript API
- **Deployment (geplant):** Vercel / Netlify

---

## 🚀 Quick Start (Lokale Entwicklung)

### Voraussetzungen
- Node.js (v18 oder höher)
- npm oder yarn

### Installation

```bash
# Repository klonen
git clone https://github.com/Spezzo-sudo/Koh-Phangan---Massagen.git
cd Koh-Phangan---Massagen

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App läuft dann auf `http://localhost:5173`

### Build für Produktion

```bash
npm run build
npm run preview
```

---

## 📂 Projektstruktur

```
/
├── pages/              # Hauptseiten (Home, Booking, Dashboards, etc.)
│   ├── Home.tsx
│   ├── BookingPage.tsx
│   ├── CustomerDashboard.tsx
│   ├── TherapistDashboard.tsx
│   └── ...
├── contexts.tsx        # React Context (Auth, Language, Data)
├── constants.ts        # Services, Therapeuten, Produkte (Mock-Daten)
├── types.ts           # TypeScript Interfaces & Enums
├── translations.ts    # i18n Übersetzungen (8 Sprachen)
├── lib/
│   ├── supabase.ts    # Supabase Client (vorbereitet)
│   └── googleMaps.ts  # Google Maps Loader (vorbereitet)
├── hooks/
│   └── usePlacesAutocomplete.ts  # Google Places Hook (Mock)
└── App.tsx            # Haupt-App-Komponente
```

---

## 🔄 Nächste Schritte zur Live-Schaltung

Sobald der Prototyp final abgenommen ist, müssen nur noch folgende Schritte erfolgen, um die App "scharf" zu schalten:

### 1️⃣ Supabase Setup
- [ ] Supabase Projekt erstellen
- [ ] SQL-Schema einspielen (siehe `types.ts` für DB-Struktur)
- [ ] Row Level Security (RLS) Policies konfigurieren
- [ ] Auth Provider aktivieren (Email/Password, OAuth)

### 2️⃣ API Keys eintragen
- [ ] `.env.local` Datei erstellen
- [ ] Google Maps API Key hinzufügen
- [ ] Supabase Keys hinzufügen

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 3️⃣ Domain & Hosting
- [ ] Domain registrieren (z.B. `phanganserenity.com`)
- [ ] Deployment auf Vercel oder Netlify
- [ ] SSL-Zertifikat einrichten
- [ ] Analytics integrieren (Google Analytics, Plausible)

### 4️⃣ Business Setup
- [ ] Zahlungsmethode festlegen (Stripe für Online-Payments als Option)
- [ ] Therapeuten onboarden (Accounts erstellen)
- [ ] AGB & Datenschutzerklärung erstellen
- [ ] Impressum hinzufügen

---

## 🌐 Mehrsprachigkeit

Die App unterstützt folgende Sprachen:
- 🇬🇧 English (EN)
- 🇩🇪 Deutsch (DE)
- 🇹🇭 ไทย (TH)
- 🇫🇷 Français (FR)
- 🇪🇸 Español (ES)
- 🇨🇳 中文 (ZH)
- 🇮🇳 हिन्दी (HI)
- 🇸🇦 العربية (AR)

Übersetzungen werden in `translations.ts` gepflegt. Die Sprachauswahl ist persistent (localStorage).

---

## 📊 Features im Detail

### Buchungsprozess (5 Steps)
1. **Service wählen** (mit Kategorie-Filter: Massage / Nails / Packages)
2. **Add-ons hinzufügen** (Tiger Balm, Premium Öle, etc.)
3. **Datum & Zeit wählen** (mit Verfügbarkeitsprüfung)
4. **Therapeut auswählen** (gefiltert nach Skills + Bewertungen)
5. **Details eingeben** (Standort mit GPS/Autocomplete, Kontaktdaten)

### Therapeuten-Matching-Logik
- Zeigt nur Therapeuten, die die Skills für den gewählten Service haben
- Sortiert nach Bewertung (höchste zuerst)
- Zeigt Verfügbarkeit an
- "Top Rated" Badge bei >50 Reviews

### Status-Tracking (Timeline)
Kunden können in Echtzeit sehen:
- ✅ Buchung bestätigt
- 🚗 Therapeut unterwegs
- 📍 Therapeut angekommen
- 💆‍♀️ Behandlung läuft
- ✨ Abgeschlossen

---

## 🎨 Design System

### Farben (Tailwind Custom)
```js
{
  'brand-teal': '#2dd4bf',    // Primärfarbe (CTA, Highlights)
  'brand-dark': '#0f172a',    // Dunkles Grau (Texte, Buttons)
  'brand-sand': '#fef3c7',    // Warmer Sand-Ton (Backgrounds)
  'brand-light': '#f0fdfa',   // Helles Teal (Hover-States)
  'brand-gold': '#fbbf24'     // Gold (Bewertungen)
}
```

### Typography
- **Headings:** Serif Font (elegante Überschriften)
- **Body:** Sans-Serif (lesbar auf mobilen Geräten)

---

## 📝 Lizenz

Proprietär – Alle Rechte vorbehalten.
Dieses Projekt ist nicht Open Source und darf nicht ohne Genehmigung verwendet werden.

---

## 👨‍💻 Entwicklung & Support

**Projekt erstellt von:** Spezzo-sudo
**Kontakt:** [GitHub Issues](https://github.com/Spezzo-sudo/Koh-Phangan---Massagen/issues)

---

## 💡 Zusammenfassung

Diese Applikation ist aktuell eine voll funktionsfähige **"High-Fidelity" Simulation**. Sie verhält sich für den Tester genau so wie die fertige App, speichert aber noch keine Daten dauerhaft. Das ermöglicht uns, **Design und Abläufe perfekt zu schleifen**, bevor wir technische Infrastruktur-Kosten verursachen.

**Status:** ✅ Prototyp abgeschlossen, bereit für Live-Schaltung
**Nächster Schritt:** Supabase Integration + Google Maps API Aktivierung
