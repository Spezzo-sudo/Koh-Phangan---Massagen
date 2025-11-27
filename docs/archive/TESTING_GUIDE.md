# 🧪 Test-Anleitung: Funktioniert alles?

Nachdem du das SQL-Skript ausgeführt hast, sollten die kritischen Fehler behoben sein. Hier ist dein Schritt-für-Schritt-Plan, um das zu prüfen.

## 1. Test: Registrierung & Login (Das Wichtigste)
*   **Ziel:** Prüfen, ob der Datenbank-Trigger funktioniert.
*   **Schritte:**
    1.  Öffne die App im Browser (`npm run dev`).
    2.  Gehe auf "Login" -> "Sign up".
    3.  Registriere einen **neuen** Benutzer (z.B. `test@test.com`).
    4.  **Erwartung:** Du wirst **sofort** eingeloggt und landest auf dem Dashboard.
    5.  **Gegenprobe:** Schau in Supabase in die Tabelle `public.profiles`. Dort muss jetzt eine Zeile mit der ID und E-Mail dieses Users sein.
    *   *Wenn das Profil fehlt, funktioniert der Trigger nicht.*

## 2. Test: Eine Buchung machen
*   **Ziel:** Prüfen, ob RLS (Sicherheitsregeln) das Schreiben erlauben.
*   **Schritte:**
    1.  Logge dich als Kunde ein.
    2.  Klicke auf "Book Now".
    3.  Wähle Service, Datum, Zeit und klicke dich bis zum Ende durch.
    4.  Klicke auf "Confirm Booking".
    5.  **Erwartung:** Du siehst die Erfolgs-Seite ("Booking Confirmed").
    6.  **Gegenprobe:** Schau in Supabase in die Tabelle `public.bookings`. Die Buchung muss dort erscheinen.

## 3. Test: Therapeuten-Ansicht
*   **Ziel:** Prüfen, ob Therapeuten ihre Aufträge sehen.
*   **Schritte:**
    1.  Erstelle einen zweiten User (z.B. `therapist@test.com`).
    2.  **Manuell in Supabase:** Ändere in der Tabelle `public.profiles` die Rolle (`role`) dieses Users von `customer` auf `therapist`.
    3.  Logge dich in der App mit diesem User ein.
    4.  Gehe auf `/therapist/dashboard`.
    5.  **Erwartung:** Du siehst das Dashboard. Wenn du dem Therapeuten eine Buchung zugewiesen hast (manuell oder per Buchung), sollte sie hier auftauchen.

---

## ⚠️ Was ist noch "am Konflikten"? (Bekannte Probleme)

Auch wenn die Datenbank jetzt geht, gibt es im Code noch "Unsauberkeiten", die wir als nächstes angehen müssen:

1.  **Doppelte Wahrheit in `contexts.tsx`:**
    *   Der Code versucht oft noch, Dinge lokal zu speichern (`setBookings(...)`), obwohl sie schon in der Datenbank sind. Das kann zu Verwirrung führen (z.B. man sieht eine Buchung, lädt die Seite neu, und sie ist weg, weil sie nie in der DB ankam).
    *   *Lösung:* Wir müssen den Code zwingen, **nur** noch Supabase zu vertrauen.

2.  **Verfügbarkeits-Logik:**
    *   Die App prüft manchmal lokal "Ist der Slot frei?", hat aber vielleicht gar nicht alle Buchungen geladen.
    *   *Lösung:* Die Prüfung muss immer strikt über die Datenbank laufen (`rpc` call oder Query), bevor eine Buchung zugelassen wird.

3.  **Admin-Bereich:**
    *   Die Seite `/admin/dashboard` existiert, ist aber wahrscheinlich noch nicht voll mit der Datenbank verdrahtet.

## Nächste Schritte für dich

1.  Führe die Tests 1-3 oben durch.
2.  Wenn Test 1 (Login) klappt, ist der größte Brocken weg! 🎉
3.  Sag mir Bescheid, ob die Buchung (Test 2) geklappt hat. Dann räume ich den Code auf (`contexts.tsx`).
