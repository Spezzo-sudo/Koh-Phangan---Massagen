# 🔍 FINAL DEBUG: Finde EXAKT was in Supabase kaputt ist

Das Problem ist **100% in der Datenbank**, nicht im Frontend-Code.

## Der Test (2 Minuten)

### Schritt 1: Öffne Supabase SQL Editor
- https://app.supabase.com → Dein Projekt
- **SQL Editor** → Neue Query

### Schritt 2: Kopiere diesen Code und führe ihn aus

```sql
-- Schritt 1: Zeige ALLE Trigger
SELECT
  trigger_name,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND event_object_schema = 'auth';

-- Schritt 2: Zähle User vs. Profiles
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users u LEFT JOIN public.profiles p ON u.id = p.id WHERE p.id IS NULL) as users_without_profile;

-- Schritt 3: Spezifisch für marco.speth
SELECT
  u.email,
  p.id as profile_exists,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'marco.speth@googlemail.com';
```

### Schritt 3: Was zeigt dir die Query?

**Szenario A: Trigger existiert NICHT**
```
(No rows returned für die erste Query)
```
**Lösung:** Gehe zu "LÖSUNG A" unten

**Szenario B: Trigger existiert, aber 3 User, 0 Profiles**
```
total_users: 3
total_profiles: 0
users_without_profile: 3
```
**Lösung:** Gehe zu "LÖSUNG B" unten

**Szenario C: Trigger existiert, 3 User, 3 Profiles (aber marco hat keins)**
```
total_users: 3
total_profiles: 3
users_without_profile: 1

For marco:
profile_exists: (NULL)
```
**Lösung:** Gehe zu "LÖSUNG C" unten

**Szenario D: PERFEKT! Trigger funktioniert!**
```
total_users: 3
total_profiles: 3
users_without_profile: 0

For marco:
profile_exists: (UUID)
profile_role: customer
profile_name: (sein Name)
```
**Super!** Das bedeutet der Trigger funktioniert. Problem ist woanders!

---

## LÖSUNG A: Trigger existiert NICHT

Der Trigger wurde NICHT erstellt. Das ist das Hauptproblem!

### Schritt 1: Öffne SQL Editor
### Schritt 2: Kopiere & füge ein

```sql
-- CREATE TRIGGER (komplett neu)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old stuff
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### Schritt 3: RUN

Du solltest ein Ergebnis sehen:
```
on_auth_user_created
```

Falls ja: **Trigger ist jetzt aktiv!** ✅

---

## LÖSUNG B: Trigger existiert, aber erstellt KEINE Profile

Der Trigger ist kaputt oder RLS blockiert ihn.

### Schritt 1: Disable RLS temporär

```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

### Schritt 2: Erstelle Profiles für alle bestehenden User manuell

```sql
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  COALESCE(u.raw_user_meta_data->>'role', 'customer')
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

### Schritt 3: Re-enable RLS

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### Schritt 4: Test

Versuche dich einzuloggen mit marco.speth@googlemail.com.

Falls funktioniert: **Problem gelöst!** 🎉

Falls immer noch nicht: Trigger ist defekt → mache LÖSUNG A

---

## LÖSUNG C: Marco hat kein Profil (andere User schon)

Das ist ein Timing-Problem oder nur marco hat keins.

### Schritt 1: Erstelle sein Profil manuell

```sql
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  COALESCE(u.raw_user_meta_data->>'role', 'customer')
FROM auth.users u
WHERE u.email = 'marco.speth@googlemail.com'
ON CONFLICT (id) DO NOTHING;
```

### Schritt 2: Test

Login mit marco.speth@googlemail.com

Sollte jetzt funktionieren! ✅

---

## LÖSUNG D: Perfekt! Aber Login funktioniert nicht trotzdem?

Falls der Trigger funktioniert und Profiles existieren, aber Login gibt immer noch 400 Error:

Das ist dann ein **Email Confirmation Problem**!

### Prüfe in Supabase:
1. Authentication → Providers → Email
2. Ist **"Confirm email"** ON?

Falls ja: **Schalte es AUS!**

```
Authentication → Providers → Email → Toggle "Confirm email" → OFF
```

Dann test sofort erneut.

---

## Checkliste

Bevor du die Lösungen versuchst, prüfe:

- [ ] Du bist im **richtigen Supabase Projekt** (ivguwigzwnsvowbrxvqo)
- [ ] Du bist im **SQL Editor**
- [ ] Die `.env` in deinem Projekt hat die **richtigen Keys**
- [ ] Die Browser-Console zeigt nur React Router Warnings, keine echten Fehler

---

## Schnelle Zusammenfassung

| Problem | Lösung |
|---------|--------|
| Trigger existiert nicht | LÖSUNG A |
| Trigger existiert, erstellt aber KEINE Profiles | LÖSUNG B |
| Nur einzelne User haben kein Profil | LÖSUNG C |
| Alles existiert, aber Login funktioniert nicht | LÖSUNG D |

---

## Nächster Schritt

**JETZT:**
1. Führe die Test-Query aus
2. Schau welches Szenario zutrifft
3. Mache die entsprechende Lösung
4. Test sofort

Schreib mir die Ergebnisse der Test-Query! Dann kann ich dir die genaue Lösung geben! 🔥
