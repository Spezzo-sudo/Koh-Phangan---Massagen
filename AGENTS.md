
# 🧠 AI Context & Business Logic (AGENTS.md)

## 1. Project Vision
**Phangan Serenity** is a mobile service platform.
*   **Core Concept:** Customers book treatments (Massage, Nails) to their *current location* (Hotel, Villa).
*   **Analogy:** "Uber/Grab for Wellness".
*   **Location:** Koh Phangan, Thailand.
*   **Payment:** Cash on Arrival (currently).

## 2. Domain Specifics (The "Rules of the Island")

### A. Service Categories & Teams
There is a strict separation in the UI and Logic between:
1.  **Massage Team:** Offers Thai, Oil, Deep Tissue.
2.  **Beauty Team:** Offers Nails (Manicure/Pedicure), Makeup.
*   *Why?* Different skill sets. A filter is implemented in `BookingPage` and `TherapistsPage`.

### B. Multi-Staff Packages (Bridal Glow)
*   Some packages (like "Bridal Glow") require **2 specialists** (1 Massage + 1 Nail Artist).
*   **Logic:** The `Service` type has a `staffRequired` field.
*   **Customer Flow:** The customer selects a "Lead Specialist". The system (and the UI) explicitly states that a partner is automatically assigned.
*   **Implementation:** In `BookingPage.tsx`, if `staffRequired > 1`, we show a badge and change the instruction text.

### C. The "Bring-Service" Shop
*   The `ShopPage` is **NOT** a standard e-commerce shipping store.
*   **Logic:** Customers order items (Oils, Balms). These items are **delivered by the therapist** during the appointment.
*   **Checkout:** No shipping address required, just a confirmation that it's added to the next booking.

### D. Location Logic
*   Addresses on the island are messy.
*   **Input:** We use a text field combined with GPS coordinates (`navigator.geolocation`).
*   **Future:** Google Places Autocomplete is prepared in `hooks/usePlacesAutocomplete.ts`.

### E. Legal & PDPA (Thailand)
*   **Cookie Banner:** Mandatory in Thailand. State is stored in LocalStorage (`cookie-consent`).
*   **Privacy:** Must mention collection of GPS and Health data.
*   **LINE:** The primary communication channel in Thailand. A floating LINE button is present globally.

## 3. Architecture & State
*   **Data Source:** Currently `constants.ts` (In-Memory).
*   **Persistence:** None (Refreshes reset data).
*   **Switching to Live:** The app is architected to switch to Supabase by updating `contexts.tsx` and `lib/supabase.ts`.

## 4. Tone & Design
*   **Vibe:** Relaxing, Premium, Tropical, Clean.
*   **Colors:** Teal (`#0d9488`), Sand (`#f5f5f4`), Gold Accents.
*   **Mobile First:** Sticky footers, slide-over drawers, touch-friendly targets.
