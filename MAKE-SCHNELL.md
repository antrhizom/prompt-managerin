# Make.com in 3 Minuten einrichten 🚀

Deine E-Mail: antrhizom@gmail.com
Deine Webhook-URL: https://hook.eu1.make.com/1qc0oua02l1ry7jyitimxeqfdtja54xa

## ✅ Schritt 1: Zu Make.com gehen (30 Sekunden)

1. Gehe zu: https://www.make.com/en/login
2. Melde dich an mit deinem Account
3. Du siehst jetzt dein Dashboard

## ✅ Schritt 2: Dein bestehendes Szenario öffnen (30 Sekunden)

Du hast vermutlich schon ein Szenario mit diesem Webhook erstellt.

**So findest du es:**
1. Links im Menü: Klicke auf **"Scenarios"**
2. Suche nach einem Szenario das diesen Webhook nutzt
3. Oder: Erstelle ein neues (siehe unten)

**WICHTIG:** Oben rechts muss der Toggle auf **ON** (blau) stehen!

```
[OFF] [ON] ← Muss hier sein (blau)!
```

Wenn OFF → Klicke drauf um es zu aktivieren!

## ✅ Schritt 3: E-Mail-Modul hinzufügen (1 Minute)

**Falls noch KEIN E-Mail-Modul da ist:**

1. Klicke auf das **"+"** nach dem Webhook
2. Suche: **"Gmail"** (wenn du Gmail nutzt) ODER **"Email"**
3. Wähle: **"Send an Email"**
4. Wenn Gmail: **Verbinde deinen Google Account** (einmalig)

## ✅ Schritt 4: E-Mail konfigurieren (1 Minute)

Im E-Mail-Modul trage ein:

**To (Empfänger):**
```
antrhizom@gmail.com
```

**Subject (Betreff):**
```
🚨 Prompt-Meldung: {{1.titel}}
```

**Text (Nachricht):**
```
Ein Prompt wurde gemeldet!

📝 Prompt-ID: {{1.promptId}}
📝 Titel: {{1.titel}}
📝 Text: {{1.promptText}}

👤 Gemeldet von: {{1.melderName}} ({{1.melderCode}})

⚠️ Grund:
{{1.grund}}

🔗 Link: {{1.url}}
⏰ Zeit: {{1.timestamp}}
```

**WICHTIG:** Die `{{1.titel}}`, `{{1.grund}}` etc. sind **Platzhalter**!
- Tippe sie genau so ein, ODER
- Klicke auf die Felder und wähle sie aus der Liste

## ✅ Schritt 5: Speichern & Aktivieren (30 Sekunden)

1. Klicke unten links auf **"Save"** (Disketten-Symbol)
2. Toggle oben rechts auf **ON** schalten (falls noch nicht)
3. ✅ Fertig!

## 🧪 Schritt 6: TESTEN (30 Sekunden)

1. Klicke unten links auf **"Run once"**
2. Das Szenario wartet jetzt...
3. Gehe auf deine Website
4. Klicke "📧 Melden" bei einem Prompt
5. Gib einen Grund ein (z.B. "Test")
6. Zurück zu Make.com → Siehst du die Daten? ✅
7. Check deine E-Mail (antrhizom@gmail.com) → E-Mail da? ✅

## 🆘 Falls es nicht funktioniert

### Problem: "Kein E-Mail-Modul kann hinzugefügt werden"

**Lösung:** Du hast vielleicht schon eins! Klicke drauf und konfiguriere es.

### Problem: "Webhook empfängt keine Daten"

**Lösung:** 
1. Webhook-URL ist: https://hook.eu1.make.com/1qc0oua02l1ry7jyitimxeqfdtja54xa
2. Stelle sicher, dass diese URL im Code steht (app/page.tsx Zeile 8)
3. Hast du die neue Version deployed?

### Problem: "E-Mail kommt nicht an"

**Lösung:**
1. Spam-Ordner checken!
2. Gmail → Einstellungen → Filter → Make.com nicht blockiert?
3. Make.com History → Zeigt es einen Fehler?

## 📱 Alternative: Gmail direkt nutzen

Statt "Email" Modul kannst du direkt **Gmail** nutzen:

1. Lösche das Email-Modul
2. "+" klicken
3. **"Gmail"** auswählen
4. "Send an Email"
5. Google Account verbinden
6. Gleiche Felder wie oben eintragen
7. ✅ Funktioniert zuverlässiger!

---

## 🎯 Das Wichtigste zusammengefasst

1. ✅ Webhook-URL ist schon im Code: `1qc0oua02l1ry7jyitimxeqfdtja54xa`
2. ✅ Deine E-Mail ist schon im Code: `antrhizom@gmail.com`
3. ⚠️ Du musst nur noch in Make.com:
   - Szenario auf **ON** schalten
   - E-Mail-Modul hinzufügen/konfigurieren
   - Speichern

**Zeit:** 3-5 Minuten
**Schwierigkeit:** Sehr einfach

Bei Fragen: Screenshot vom Make.com Szenario schicken, dann kann ich dir genau sagen was fehlt!
