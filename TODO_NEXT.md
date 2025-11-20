# 🗺️ Roadmap: From Prototype to Live (TODO_NEXT)

This document outlines the steps for the AI Agent to finalize the project.

## Phase 1: Database Connection (Supabase)
- [ ] **Setup:** Execute the SQL Schema (found in `TECH_SPEC.md`) in the Supabase SQL Editor.
- [ ] **Env Vars:** Create `.env` file (see `.env.example`) and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [ ] **Migration (contexts.tsx):**
    - [ ] Modify `DataProvider` to fetch `bookings` from Supabase on mount.
    - [ ] Update `addBooking` to insert into Supabase table.
    - [ ] Update `updateBookingStatus` to write to Supabase.
    - [ ] *Keep `constants.ts` as a fallback if fetch fails.*

## Phase 2: Google Maps Integration
- [ ] **Env Vars:** Add `VITE_GOOGLE_MAPS_API_KEY` to `.env`.
- [ ] **Enable API:** Ensure "Places API" and "Maps JavaScript API" are enabled in Google Cloud Console.
- [ ] **Activation:** In `hooks/usePlacesAutocomplete.ts`, remove the comment block to enable the real `AutocompleteService`.

## Phase 3: Authentication
- [ ] **Auth Provider:** Switch `AuthProvider` in `contexts.tsx` to use `supabase.auth`.
- [ ] **Login Page:** Connect the inputs to `supabase.auth.signInWithPassword`.
- [ ] **Register Page:** Create a registration form (currently simulated).

## Phase 4: Polish & Deployment
- [ ] **Performance:** Code splitting for pages.
- [ ] **SEO:** Add meta tags for Koh Phangan keywords.
- [ ] **Deploy:** Push to Vercel/Netlify.
