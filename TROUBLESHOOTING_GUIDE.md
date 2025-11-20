# 🔧 TROUBLESHOOTING GUIDE - Häufige Fehler & Schnell-Lösungen

## Problem 1: 500 Internal Server Error bei API Calls

**Symptom:**
```
GET https://...supabase.co/rest/v1/profiles 500 (Internal Server Error)
infinite recursion detected in policy
```

**SOFORT-Diagnose:** RLS Policy Recursion
- Admin-Policy versucht `profiles` zu lesen
- RLS ist aktiviert
- Verursacht Endlosschleife

**SOFORT-Fix:**
```sql
-- 1. Alle Policies löschen
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
-- ... etc

-- 2. RLS disable/enable
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Neue EINFACHE Policies (OHNE role checks!)
CREATE POLICY "Anyone can read profiles"
  ON public.profiles
  FOR SELECT
  USING (true);
```

**Merkregel:** Policies sollten KEINE Recursive Queries machen!

---

## Problem 2: Cannot read properties of undefined (reading 'profile')

**Symptom:**
```
TypeError: Cannot read properties of undefined (reading 'profile')
at onUpdate-profile
```

**Ursachen (in dieser Reihenfolge):**
1. ❌ Profile existiert nicht (Trigger hat nicht funktioniert)
2. ❌ RLS blockiert Lesezugriff (Recursion oder zu restriktiv)
3. ❌ User ist nicht eingeloggt

**SOFORT-Check:**
```sql
-- Hat der User ein Profil?
SELECT u.email, p.id as profile_exists
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'DEINE_EMAIL';
```

**SOFORT-Fix wenn Profil fehlt:**
```sql
-- Erstelle Profil manuell
INSERT INTO public.profiles (id, email, role, full_name)
SELECT id, email, 'customer', 'User'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = u.id)
ON CONFLICT DO NOTHING;
```

---

## Problem 3: Login gibt 400 Bad Request

**Symptom:**
```
POST https://...supabase.co/auth/v1/token?grant_type=password 400 (Bad Request)
❌ Invalid email or password
```

**Ursachen (in dieser Reihenfolge):**
1. ❌ Email Confirmation ist AN (User hat Email nicht bestätigt)
2. ❌ Falsches Passwort
3. ❌ Falsches Email

**SOFORT-Check:**
```sql
-- Ist Email bestätigt?
SELECT email, email_confirmed_at
FROM auth.users
WHERE email = 'DEINE_EMAIL';
```

**SOFORT-Fix:**
1. Gehe zu **Authentication** → **Providers** → **Email**
2. Stelle sicher: **"Enable Email provider"** ist **ON** (grün)
3. Stelle sicher: **Email Confirmation** ist **AUS** (grau) für Development

---

## Problem 4: Admin Dashboard zeigt Team Management nicht

**Symptom:**
- User ist eingeloggt
- Hat Role `admin` in Database
- Aber "Team Management" Tab ist nicht sichtbar

**Ursachen (in dieser Reihenfolge):**
1. ❌ Role wurde nach Login nicht neu geladen (Browser Cache)
2. ❌ RLS blockiert Lesezugriff auf Therapist-Daten
3. ❌ useTherapists() Query gibt 500 Error zurück

**SOFORT-Fix:**
1. Hard-Reload: `Ctrl+Shift+R`
2. Logout & Login nochmal
3. Falls immer noch nicht: Check RLS Recursion (Problem 1)

---

## Problem 5: Registrierung erstellt kein Profil

**Symptom:**
```
✅ User signed up: email@example.com
❌ Aber Profile existiert nicht
```

**Ursachen (in dieser Reihenfolge):**
1. ❌ Trigger existiert nicht
2. ❌ Trigger existiert aber RLS blockiert INSERT
3. ❌ raw_user_meta_data ist falsch

**SOFORT-Check:**
```sql
-- Existiert Trigger?
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Wie viele User vs Profiles?
SELECT
  (SELECT COUNT(*) FROM auth.users) as users,
  (SELECT COUNT(*) FROM public.profiles) as profiles;
```

**SOFORT-Fix (wenn Trigger fehlt):**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Debugging Checklist (in dieser Reihenfolge!)

Wenn ETWAS nicht funktioniert, checke in dieser Reihenfolge:

- [ ] **Browser Console (F12)** - Welche Error-Messages?
  - `500 Internal Server Error` → RLS Recursion (Problem 1)
  - `undefined` → Profile fehlt (Problem 2)
  - `400 Bad Request` → Email Confirmation oder Password falsch (Problem 3)

- [ ] **Email Provider aktiv?**
  - Supabase → Authentication → Providers → Email
  - "Enable Email provider" sollte **ON** sein

- [ ] **Email Confirmation richtig?**
  - Für **Development**: OFF (Grau)
  - Für **Production**: ON (Grün, mit SMTP konfiguriert)

- [ ] **RLS Policies OK?**
  ```sql
  SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
  ```
  Falls zu kompliziert: Löschen und neu erstellen (Problem 1)

- [ ] **Trigger existiert?**
  ```sql
  SELECT trigger_name FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created';
  ```

- [ ] **User/Profile in Sync?**
  ```sql
  SELECT u.email, p.id FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id;
  ```

---

## Golden Rules

1. **RLS Policies sollten EINFACH sein** - Keine Recursive Queries!
2. **Email Provider muss ON sein** - Sonst funktioniert Registrierung nicht
3. **Hard-Reload nach jeder Änderung** - Browser Cache ist Feind #1
4. **Trigger muss existieren** - Das ist der Garant für Profil-Erstellung
5. **Immer erst SQL checken** - Bevor du Frontend-Code debuggst

---

## Schnell-Links für häufige Lösungen

- **RLS Recursion beheben**: Problem 1
- **Profil fehlt**: Problem 2 + Problem 5
- **Kann nicht einloggen**: Problem 3
- **Admin Dashboard broken**: Problem 4
- **Registrierung funktioniert nicht**: Problem 5

