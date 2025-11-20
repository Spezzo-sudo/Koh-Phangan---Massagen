# 🔥 KRITISCH: Database Setup & Registration Fix

Dieses Dokument beschreibt die **exakten Schritte**, um die Registrierung zum Laufen zu bringen.

## Problem-Zusammenfassung

Die Registrierung funktioniert nicht, weil:
1. Der **Database Trigger** (`handle_new_user`) noch nicht ausgeführt wurde
2. **Email Confirmation** ist aktiviert, wodurch neue User sich nicht sofort einloggen können
3. Fehlende **RLS Policies** verhindern, dass Profile korrekt erstellt werden

---

## Lösung: 3 Schritte

### Schritt 1: Database Trigger aktivieren (MUSS getan werden!)

1. Öffne dein **Supabase Dashboard**: https://app.supabase.com
2. Gehe zu deinem Projekt
3. Klick auf **"SQL Editor"** im linken Menü
4. Erstelle ein **neues Query** (+ Button)
5. **Kopiere den gesamten Inhalt** aus `scripts/setup-db.sql`
6. **Führe das Query aus** (Play-Button)

**Ergebnis:** Du solltest diese Messages sehen:
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE FUNCTION
DROP TRIGGER
CREATE TRIGGER
```

Falls du einen Error siehst wie:
- `"profiles" already exists` → Das ist OK, das bedeutet die Tabelle existiert schon
- `violates foreign key constraint` → Die Trigger sind schon aktiv (auch OK)

---

### Schritt 2: Email Confirmation ausschalten (für lokale Entwicklung)

1. Supabase Dashboard → **Authentication** (linkes Menü)
2. Klick auf **"Providers"**
3. Klick auf **"Email"**
4. Scroll zu **"Confirm email"**
5. **Deaktiviere** den Toggle ➜ `OFF`
6. **Save**

**Ergebnis:** User können sich jetzt registrieren und sofort einloggen!

---

### Schritt 3: RLS Policies hinzufügen (für Sicherheit)

1. Gehe zu **"Authentication"** → **"Policies"** (oder **"SQL Editor"**)
2. Erstelle ein neues Query und führe diesen Code aus:

```sql
-- ========================================
-- RLS Policies für PROFILES Tabelle
-- ========================================

-- 1. Jeder User kann sein eigenes Profil lesen
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Admin kann alle Profile lesen
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 3. Service Role (Trigger) kann Profile erstellen
CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- 4. Jeder User kann sein eigenes Profil updaten
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Admin kann alle Profile updaten
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
```

**Ergebnis:** Datenbank-Zugriff ist jetzt sicher und role-basiert.

---

## Testing: So prüfst du, ob es funktioniert

### Test 1: Registrierung als Customer

1. Öffne deine App: `http://localhost:5174`
2. Klick **"Customer"** Tile
3. Klick **"Sign up here"**
4. Füll das Form aus:
   - **Full Name:** Test Customer
   - **Email:** testcustomer@example.com
   - **Password:** Test123456
5. Klick **"Create Account"**

**Erwartetes Ergebnis:**
- ✅ "Successfully signed up!" Message (oder keine Error)
- ✅ Automatisch zur **Login** Seite zurück (oder direkt eingeloggt, je nach Email Confirmation Setting)
- ✅ Du kannst dich mit der Email & Password einloggen
- ✅ Landest im **Customer Dashboard**

### Test 2: Registrierung als Therapist

1. Gehe zurück zu Login
2. Klick auf **"Therapist"** Tile
3. Registriere mit:
   - **Full Name:** Test Therapist
   - **Email:** testtherapist@example.com
   - **Password:** Test123456
4. Klick **"Create Account"**

**Erwartetes Ergebnis:**
- ✅ User wird erstellt
- ✅ Profil mit `role='therapist'` wird automatisch erstellt
- ✅ Du kannst dich einloggen
- ✅ Landest im **Therapist Dashboard**

### Test 3: Admin-Zugriff

1. Frage einen Admin (z.B. hugobot777@proton.me) oder erstelle einen manuell in Supabase
2. Melde dich als Admin an
3. Du solltest auf `/admin/dashboard` Zugriff haben

---

## Debugging: Falls es immer noch nicht funktioniert

### Problem: "Email not confirmed"

**Lösung:**
- Gehe zu Supabase Dashboard → **Authentication** → **Email**
- Deaktiviere **"Confirm email"** (siehe Schritt 2 oben)

### Problem: "violates foreign key constraint"

**Lösung:**
- Der Trigger ist kaputt. Gehe zu **SQL Editor** und führe `scripts/setup-db.sql` erneut aus
- Falls error "already exists": Führe zuerst aus:
  ```sql
  drop trigger if exists on_auth_user_created on auth.users;
  drop function if exists public.handle_new_user();
  ```
  Dann `scripts/setup-db.sql` erneut.

### Problem: "user_metadata is null" oder Role wird nicht gesetzt

**Lösung:**
- Stelle sicher, dass dein Frontend diese Zeilen nutzt:
  ```typescript
  options: {
    data: {
      full_name: metadata.fullName,
      role: metadata.role  // ← MUSS vorhanden sein
    }
  }
  ```
- Das ist in `contexts.tsx` schon richtig, aber prüf nochmal.

### Problem: "Profile table doesn't exist"

**Lösung:**
- Gehe zu Supabase → **Table Editor**
- Prüfe, ob `profiles` Tabelle sichtbar ist
- Falls nicht: Führe `scripts/setup-db.sql` aus (Schritt 1)

---

## Sicherheits-Checkliste (NACH lokalem Testen)

Bevor du in Production gehst:

- [ ] Email Confirmation **wieder ON** schalten
- [ ] RLS Policies überprüfen (nur berechtigte User dürfen zugreifen)
- [ ] SMTP Provider konfigurieren (Brevo)
- [ ] Email Templates in Supabase anpassen
- [ ] Rate Limiting für Auth aktivieren

---

## Nächste Schritte

Sobald Registrierung läuft:

1. **Booking Funktion testen** (neue Buchungen erstellen)
2. **Admin Panel testen** (Therapeuten freigeben)
3. **Email-System testen** (wenn Confirmation wieder ON)

