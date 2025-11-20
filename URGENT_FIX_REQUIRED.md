# 🔥 URGENT: Trigger ist nicht aktiv - Schnelle Behebung

## Das Problem

Du bekommst diesen Fehler:
```
TypeError: Cannot read properties of undefined (reading 'profile')
```

Das bedeutet: **Der Database Trigger erstellt KEINE Profile mehr!**

Nach der Registrierung:
1. User wird in `auth.users` erstellt ✅
2. Trigger sollte ein Profil in `public.profiles` erstellen ❌ **PASSIERT NICHT**
3. Frontend versucht, das Profil zu laden → `undefined` → CRASH

## Die Ursache

Wahrscheinlich:
- Die RLS Policies blockieren den Service Role beim Schreiben
- Der Trigger wurde nicht korrekt erstellt
- Es gibt einen Fehler im Trigger, der silent fehlschlägt

## Die Lösung (JETZT MACHEN!)

### Option A: Schnelle Fix (1 Minute)

1. Öffne: https://app.supabase.com → Dein Projekt
2. Gehe zu: **SQL Editor** → **Neue Query**
3. Öffne die Datei: `scripts/fix-trigger-and-rls.sql`
4. Kopiere den **GANZEN** Inhalt
5. Füge es in Supabase ein
6. **RUN**

Das Script wird:
- ✅ RLS temporär deaktivieren
- ✅ Den alten Trigger löschen
- ✅ Einen NEUEN, besseren Trigger erstellen
- ✅ RLS wieder aktivieren mit besseren Policies
- ✅ Service Role Permissions setzen

---

### Option B: Manuell Debuggen (wenn du sehen willst, ob Trigger existiert)

Führe diese Query aus:
```sql
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  action_orientation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Falls diese Query nichts zurückgibt:** Trigger existiert nicht! → Mache Option A

---

## Nach dem Fix: Testen

### Test 1: Registriere einen NEW User

1. App öffnen
2. Wähle **"Customer"**
3. **Sign up**:
   - Name: TestUser123
   - Email: testuser123@example.com
   - Password: Test123456
4. Klick **"Create Account"**

**Erwartet:**
- ✅ Keine Error
- ✅ Direkt zur Login-Seite
- ✅ Mit Email & Password einloggen funktioniert
- ✅ Du wirst zum Dashboard weitergeleitet

**Falls immer noch Fehler:**
- Gehe zu Supabase → **Table Editor** → `profiles`
- Prüfe: Existiert ein Eintrag mit der Email testuser123@example.com?
- Falls JA: Das Profil WURDE erstellt! Das Problem ist beim Lesen
- Falls NEIN: Der Trigger funktioniert immer noch nicht

---

## Debugging: Falls der Trigger immer noch nicht läuft

### Schritt 1: Trigger-Logs prüfen

Führe aus:
```sql
-- Prüfe, ob es Error-Logs gibt
SELECT *
FROM storage.migrations
WHERE name LIKE '%handle_new_user%'
ORDER BY created_at DESC
LIMIT 10;
```

### Schritt 2: Trigger Status prüfen

```sql
-- Ist RLS aktiviert?
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'profiles';
```

Falls `relrowsecurity` = `true` aber es gibt trotzdem Fehler:
- Die RLS Policies sind zu restriktiv
- Mache **Option A** nochmal

### Schritt 3: Manuell Profile erstellen (zum Testen)

Wenn der Trigger nicht funktioniert, kannst du für Tests ein Profil manuell erstellen:

```sql
-- ERSETZE xxxxx mit einer echten User ID aus auth.users
INSERT INTO public.profiles (id, email, role, full_name)
VALUES (
  'xxxxx-replace-with-real-uuid',
  'testuser@example.com',
  'customer',
  'Test User'
);
```

---

## Warum passiert das?

In Supabase gibt es eine **Sicherheitsebene**: Row Level Security (RLS).

```
User Registration:
  1. auth.users Entry erstellt (Supabase Auth)
  2. Trigger feuert → public.profiles INSERT
  3. Aber: RLS blockiert INSERT wenn Policy zu restriktiv
  4. Result: Trigger schlägt silent fehl (kein Error Log!)
```

Das neue Script macht:
- Service Role bekommt ALLE Permissions
- INSERT Policy ist `WITH CHECK (true)` (immer erlaubt)
- Trigger kann jetzt ungehindert schreiben

---

## Checkliste zum Abhaken

- [ ] `scripts/fix-trigger-and-rls.sql` in Supabase ausgeführt
- [ ] Keine Error-Messages beim Ausführen
- [ ] Neue User registrieren sich erfolgreich
- [ ] Profile werden automatisch in Supabase erstellt
- [ ] Login funktioniert sofort nach Signup

---

## Falls IMMER NOCH Probleme

Das bedeutet, dass etwas **noch tieferes** nicht stimmt:

1. **Deine `.env` ist falsch** → Prüfe VITE_SUPABASE_URL und KEY
2. **Du bist im falschen Supabase Projekt** → Gehe zu https://app.supabase.com und prüfe URL
3. **Die profiles Tabelle existiert nicht** → Gehe zu Table Editor und schau nach

Falls gar nichts hilft, erstelle ein **Test-Script** manuell:

```sql
-- Manuell einen User und Profil erstellen (für Tests)
-- Lösche erst alte Test-Daten
DELETE FROM public.profiles WHERE email = 'manual-test@example.com';
DELETE FROM auth.users WHERE email = 'manual-test@example.com';

-- Erstelle neuen Test-User direkt
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'manual-test@example.com',
  crypt('Test123456', gen_salt('bf')),
  NOW(),
  '{"full_name":"Manual Test","role":"customer"}'::jsonb,
  NOW(),
  NOW()
);
```

Diese Methode umgeht den Trigger komplett - wenn das funktioniert, weißt du, dass das Frontend OK ist und der Trigger das Problem ist.

---

## Nächster Schritt

**Mache JETZT Option A!** Führe `scripts/fix-trigger-and-rls.sql` in Supabase aus.

Dann teste Registrierung erneut.

Schreib mir Bescheid, ob es funktioniert! 🚀
