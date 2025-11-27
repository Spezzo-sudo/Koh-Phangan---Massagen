# Projekt-Prompt: Phangan Serenity - Mobile Massage & Beauty Plattform

Du bist ein erfahrener Full-Stack-Entwickler und UI/UX-Designer. Deine Aufgabe ist es, eine komplette Webanwendung für **"Phangan Serenity"** zu entwickeln, einen mobilen Massage- und Schönheitsservice auf der Insel Koh Phangan, Thailand.

Das Ziel ist eine **hochwertige, visuell beeindruckende und technisch robuste Plattform**, die es Touristen und Expats ermöglicht, Dienstleistungen direkt zu ihrer Villa oder ihrem Hotel zu buchen.

## 1. Projektübersicht & Design-Philosophie
*   **Name:** Phangan Serenity
*   **Vibe:** Premium, tropisch, entspannend, luxuriös ("Serenity").
*   **Design-Stil:**
    *   **Farben:** Teal (#0d9488), Sand/Beige (#f5f5f4), Gold-Akzente (#d97706), dunkles Grün für Kontraste.
    *   **Typografie:** Modern und elegant (z.B. "Outfit" für UI, "Playfair Display" für Überschriften).
    *   **UI-Elemente:** Glassmorphismus, weiche Schatten, abgerundete Ecken, hochwertige Bilder, sanfte Animationen (Framer Motion).
    *   **Mobile-First:** Die App muss sich auf Smartphones wie eine native App anfühlen.

## 2. Technologie-Stack
*   **Frontend:** React (neueste Version), Vite, TypeScript.
*   **Styling:** Tailwind CSS (nutze `tailwind-merge` und `clsx` für dynamische Klassen).
*   **Icons:** Lucide React.
*   **State Management & Data Fetching:** TanStack Query (React Query) - **Zwingend erforderlich** für Caching und Synchronisation.
*   **Backend / Datenbank:** Supabase (PostgreSQL).
    *   Auth (E-Mail/Passwort).
    *   Database (Tabellen, Relations, RLS Policies).
    *   Realtime (für Live-Updates bei Buchungen).
    *   Storage (für Profilbilder und Service-Fotos).
*   **Maps:** Google Maps API (für Standortauswahl und Distanzberechnung).
*   **Internationalisierung:** i18n (Unterstützung für Englisch, Deutsch, Thai, Russisch, Chinesisch).

## 3. Kernfunktionen & User Flows

### A. Rollen & Berechtigungen
Das System muss drei Rollen unterscheiden (gesteuert über `public.profiles` Tabelle):
1.  **Customer (Kunde):** Kann Services suchen, buchen, bezahlen, Buchungen verwalten.
2.  **Therapist (Therapeut):** Kann Verfügbarkeit setzen, Buchungsanfragen annehmen/ablehnen, Route zum Kunden sehen.
3.  **Admin:** Volle Kontrolle über Services, Therapeuten, Buchungen, Finanzen.

### B. Buchungssystem (Herzstück der App)
1.  **Service-Auswahl:** Kategorien (Massage, Nägel, Pakete). Detaillierte Ansicht mit Preis, Dauer, Beschreibung.
2.  **Therapeuten-Wahl (Optional):** Kunde kann "Beliebiger Therapeut" oder einen spezifischen wählen.
3.  **Terminwahl:** Kalenderansicht mit verfügbaren Slots (Echtzeit-Check gegen Datenbank).
4.  **Standort:** Integration von Google Maps. Kunde setzt Pin oder sucht Hotelnamen.
5.  **Zusammenfassung & Checkout:** Übersicht der Kosten. (Später: Stripe Integration).
6.  **Status-Updates:** Buchung startet als `pending`. Therapeut akzeptiert -> `confirmed`. Therapeut unterwegs -> `on_way`. Fertig -> `completed`.

### C. Dashboards
*   **Customer Dashboard:** Aktive Buchungen, Historie, Favoriten.
*   **Therapist Dashboard:**
    *   "Meine Aufträge": Liste der anstehenden Buchungen.
    *   "Verfügbarkeit": Toggle für Online/Offline oder Kalender-Blocker.
    *   Einnahmen-Übersicht.
*   **Admin Dashboard:**
    *   CRUD für Services (Titel, Preis, Bild).
    *   Therapeuten-Management (Verifizierung, Provision).
    *   Buchungs-Übersicht (Kalenderansicht aller Termine).

### D. Shop (E-Commerce)
*   Verkauf von physischen Produkten (Öle, Gutscheine).
*   Warenkorb-Funktionalität.

## 4. Datenbank-Schema (Supabase)
Die Anwendung muss auf folgendem Schema basieren (vereinfacht):
*   `profiles`: id (PK), email, role, full_name, avatar_url, location_base.
*   `services`: id (PK), title, description, price, duration, category, image_url.
*   `bookings`: id (PK), customer_id, therapist_id, service_id, status, scheduled_date, location_gps, total_price.
*   **Wichtig:** Nutze Row Level Security (RLS), damit Kunden nur ihre eigenen Daten sehen und Therapeuten nur ihre Aufträge.

## 5. Qualitätsanforderungen
1.  **Keine Mock-Daten:** Die App muss von Anfang an so gebaut sein, dass sie echte Daten aus Supabase lädt.
2.  **Fehlerbehandlung:** Graceful Error Handling (z.B. "Keine Internetverbindung", "Slot nicht mehr verfügbar").
3.  **Performance:** Lazy Loading für Seiten (`React.lazy`), optimierte Bilder.
4.  **Code-Struktur:**
    *   `/src/components`: Wiederverwendbare UI-Komponenten (Button, Card, Input).
    *   `/src/pages`: Hauptansichten.
    *   `/src/lib`: Supabase Client, Hilfsfunktionen, Hooks.
    *   `/src/hooks`: Custom React Hooks (z.B. `useAuth`, `useBookings`).

## 6. Deine Aufgabe
Erstelle den vollständigen Code für dieses Projekt. Beginne mit der Projektstruktur, richte Tailwind und Supabase ein und implementiere dann Schritt für Schritt die Features, beginnend mit der Authentifizierung und dem Buchungs-Flow. Der Code muss sauber, typisiert (TypeScript) und gut dokumentiert sein.
