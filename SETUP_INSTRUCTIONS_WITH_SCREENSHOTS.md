# 📋 Visuelle Schritt-für-Schritt Anleitung

## Schritt 1️⃣: Datenbank-Trigger aktivieren

### 1. Supabase Dashboard öffnen
- Gehe zu: https://app.supabase.com
- Melde dich an
- Öffne dein Projekt "ivguwigzwnsvowbrxvqo"

### 2. SQL Editor öffnen
```
Linkes Menü → SQL Editor → (+ New Query)
```

### 3. Komplettes Setup-Script kopieren und einfügen

**Kopiere diesen Code und füge ihn in den SQL Editor ein:**

```sql
-- COPY-PASTE THIS ENTIRE BLOCK INTO SUPABASE SQL EDITOR
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text check (role in ('customer', 'therapist', 'admin')),
  full_name text,
  phone text,
  avatar_url text,
  is_verified boolean default false,
  location_base text,
  bio text,
  available boolean default true,
  skills text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Service role can insert profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles
  for select
  using (
    auth.uid() in (
      select id from public.profiles where role = 'admin'
    )
  );

create policy "Service role can insert profiles"
  on public.profiles
  for insert
  with check (true);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can update all profiles"
  on public.profiles
  for update
  using (
    auth.uid() in (
      select id from public.profiles where role = 'admin'
    )
  )
  with check (true);
```

### 4. Query ausführen
- Klick auf den **Play-Button** (oben rechts) ODER
- Drücke `Ctrl+Enter`

### 5. Auf Erfolg prüfen
Du solltest diese Message sehen:
```
✓ Query executed successfully
```

Falls keine Fehler:
- ✅ Trigger ist aktiv!
- ✅ RLS Policies sind gesetzt
- ✅ Profiles Tabelle existiert

---

## Schritt 2️⃣: Email Confirmation ausschalten (für lokale Entwicklung)

### 1. Authentication Settings öffnen
```
Supabase Dashboard → Authentication (linkes Menü) → Providers
```

### 2. Email Provider öffnen
- Klick auf **"Email"**

### 3. "Confirm email" deaktivieren
Suche nach dem Toggle **"Confirm email"**:
- Aktuelle Position: Vermutlich **ON** (blau)
- Aktion: **Klick auf den Toggle** → wird grau/OFF
- Klick **"Save"**

### 4. Bestätigung
Seite sollte neuladen. Toggle sollte jetzt **OFF** sein.

**Ergebnis:** User können sich registrieren und sofort einloggen! 🎉

---

## Schritt 3️⃣: Lokale App testen

### Test 1: Customer Registration

1. Öffne deine App: `http://localhost:5174`
2. Klick auf die **"Customer"** Karte
3. Klick **"Sign up here"**
4. Füll das Formular aus:
   ```
   Full Name: Test Customer
   Email: testcustomer@example.com
   Password: Test123456
   ```
5. Klick **"Create Account"**

### Erwartetes Ergebnis:
- ✅ Keine Error-Meldung
- ✅ Du siehst eine Success-Message ODER wirst zur Login-Seite weitergeleitet
- ✅ Du kannst dich mit testcustomer@example.com / Test123456 einloggen
- ✅ Du wirst zum **Customer Dashboard** weitergeleitet

**Falls du NICHT eingeloggt wirst:**
- Das bedeutet, Email Confirmation ist noch ON
- Gehe zurück zu Schritt 2 und stelle sicher, dass Toggle OFF ist

---

### Test 2: Therapist Registration

1. Gehe zurück zur Auswahl (Login Screen)
2. Klick auf **"Therapist"** Karte
3. Klick **"Sign up here"**
4. Füll aus:
   ```
   Full Name: Test Therapist
   Email: testtherapist@example.com
   Password: Test123456
   ```
5. Klick **"Create Account"**

### Erwartetes Ergebnis:
- ✅ User wird erstellt
- ✅ Profil mit `role = 'therapist'` wird automatisch erstellt (durch Trigger!)
- ✅ Du kannst dich einloggen
- ✅ Du siehst das **Therapist Dashboard** (mit Buchungsanfragen)

---

### Test 3: Admin Zugriff

#### Option A: Bestehenden Admin verwenden
1. Melde dich mit einem Admin-Account an:
   - Email: hugobot777@proton.me
   - Passwort: (dein Admin-Passwort)
2. Du solltest zum **Admin Dashboard** weitergeleitet werden
3. Dort siehst du den "Team Management" Tab

#### Option B: Neuen Admin erstellen
1. Erstelle einen neuen User (als Customer)
2. Gehe zu Supabase Dashboard → **Table Editor** → `profiles`
3. Finde die Zeile mit deinem neuen User
4. Ändere die `role` Spalte von `'customer'` zu `'admin'`
5. Melde dich in der App an
6. Du solltest automatisch zum **Admin Dashboard** gehen

---

## Schritt 4️⃣: Debugging (falls etwas nicht funktioniert)

### Problem: "Email not confirmed" Error beim Login

**Symptom:** Ich sehe eine Error-Meldung "Email not confirmed"

**Lösung:**
1. Gehe zu Supabase → **Authentication** → **Providers** → **Email**
2. Stelle sicher, dass **"Confirm email"** Toggle **OFF** ist
3. Relade die App: `Ctrl+Shift+R` (Hard Refresh)
4. Versuche es erneut

---

### Problem: "violates foreign key constraint" Error

**Symptom:** Beim Registrieren erscheint: `violates foreign key constraint`

**Lösung:**
1. Gehe zu Supabase → **SQL Editor**
2. Führe folgende Befehle aus:
   ```sql
   drop trigger if exists on_auth_user_created on auth.users;
   drop function if exists public.handle_new_user();
   ```
3. Dann führe **Schritt 1** (oben) erneut aus
4. Versuche die Registrierung erneut

---

### Problem: Trigger wurde nicht erstellt

**Symptom:** Neue User werden erstellt, aber ihr Profil nicht

**Lösung:**
1. Gehe zu Supabase → **SQL Editor**
2. Prüfe, ob der Trigger existiert:
   ```sql
   select * from information_schema.triggers
   where trigger_name = 'on_auth_user_created';
   ```
3. Falls die Query nichts zurückgibt: Trigger existiert nicht
4. Führe **Schritt 1** (oben) erneut aus

---

### Problem: "table 'profiles' doesn't exist"

**Symptom:** Error: `relation "public.profiles" does not exist`

**Lösung:**
1. Gehe zu Supabase → **Table Editor**
2. Du solltest eine Tabelle `profiles` sehen
3. Falls nicht: Führe **Schritt 1** (oben) aus
4. Warte 5 Sekunden
5. Relade die Seite (F5)

---

## ✅ Checkliste: Alles sollte jetzt funktionieren!

- [ ] Supabase SQL Script ausgeführt (Schritt 1)
- [ ] Email Confirmation OFF (Schritt 2)
- [ ] Customer Registration funktioniert (Schritt 3, Test 1)
- [ ] Therapist Registration funktioniert (Schritt 3, Test 2)
- [ ] Admin kann sein Dashboard sehen (Schritt 3, Test 3)
- [ ] Profile werden automatisch in Supabase erstellt
- [ ] Role (customer/therapist/admin) wird korrekt gesetzt

---

## 🎉 Nächste Schritte

Sobald Registrierung und Login funktionieren:

1. **Booking erstellen testen**
   - Als Customer eine Massage buchen
   - Prüfen, dass Buchung in Supabase `bookings` Tabelle auftaucht

2. **Admin Panel testen**
   - Als Admin anmelden
   - In "Team Management" Tab gehen
   - Therapeuten freigeben/blockieren

3. **Email System konfigurieren** (falls gewünscht)
   - Brevo SMTP in Supabase einrichten
   - Email Confirmation wieder ON schalten
   - Confirmation Emails testen

---

## 📞 Falls noch Fragen

Prüfe:
1. Deine `.env` Datei hat die richtigen Supabase Keys
2. Du bist im richtigen Supabase Projekt angemeldet
3. Das SQL Script wurde ohne Fehler ausgeführt
4. Die Browser-Console zeigt keine JavaScript-Fehler (F12 öffnen)

