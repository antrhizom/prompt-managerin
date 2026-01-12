# Make.com Webhook einrichten 📧

Diese Anleitung zeigt dir, wie du Make.com einrichtest um E-Mail-Benachrichtigungen für Prompt-Meldungen zu erhalten.

## 🎯 Was du brauchst

- [ ] Make.com Account (kostenlos)
- [ ] Deine E-Mail-Adresse

## 📝 Schritt-für-Schritt Anleitung

### Schritt 1: Make.com Szenario erstellen

1. Gehe zu [make.com](https://www.make.com)
2. Melde dich an (kostenloser Account reicht)
3. Klicke auf **"Create a new scenario"**

### Schritt 2: Webhook hinzufügen

1. Klicke auf das große **"+"** in der Mitte
2. Suche nach **"Webhooks"**
3. Wähle **"Custom webhook"**
4. Klicke auf **"Add"** (neuer Webhook)
5. **Webhook name:** `Prompt Meldungen`
6. Klicke **"Save"**
7. **WICHTIG:** Kopiere die Webhook-URL!

Die URL sieht so aus:
```
https://hook.eu1.make.com/abc123xyz789
```

### Schritt 3: Webhook testen (optional aber empfohlen)

1. Klicke auf **"Run once"** unten links
2. Der Webhook wartet jetzt auf Daten
3. Öffne ein neues Browser-Tab
4. Öffne die Browser-Konsole (F12)
5. Führe diesen Test-Code aus:

```javascript
fetch('https://hook.eu1.make.com/DEINE-WEBHOOK-URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    promptId: 'test-123',
    titel: 'Test Prompt',
    promptText: 'Dies ist ein Test...',
    melderName: 'Test User',
    melderCode: 'TEST01',
    grund: 'Test-Meldung',
    timestamp: new Date().toISOString(),
    url: 'https://test.de'
  })
})
```

6. Zurück zu Make.com → Du solltest die Test-Daten sehen!

### Schritt 4: E-Mail-Modul hinzufügen

1. Klicke auf das **"+"** nach dem Webhook-Modul
2. Suche nach **"Email"** oder nutze **"Gmail"** (wenn du Gmail hast)
3. Wähle **"Send an Email"**

#### Email konfigurieren:

**To (An):**
```
deine-email@beispiel.de
```

**Subject (Betreff):**
```
🚨 Prompt-Meldung: {{1.titel}}
```

**Body (Nachricht):**
```
Ein Prompt wurde gemeldet!

📝 PROMPT-DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━
ID:          {{1.promptId}}
Titel:       {{1.titel}}
Prompt-Text: {{1.promptText}}

👤 GEMELDET VON:
━━━━━━━━━━━━━━━━━━━━━━━━
Name:        {{1.melderName}}
Code:        {{1.melderCode}}

⚠️ GRUND DER MELDUNG:
━━━━━━━━━━━━━━━━━━━━━━━━
{{1.grund}}

🔗 DIREKTER LINK:
━━━━━━━━━━━━━━━━━━━━━━━━
{{1.url}}

⏰ ZEITSTEMPEL:
━━━━━━━━━━━━━━━━━━━━━━━━
{{1.timestamp}}

---
Diese E-Mail wurde automatisch von der Prompt Managerin gesendet.
```

### Schritt 5: Szenario speichern & aktivieren

1. Klicke unten links auf **"Save"** (Speichern-Symbol)
2. Gib einen Namen ein: `Prompt Meldungen`
3. Toggle den Schalter auf **ON** (oben rechts)
4. ✅ Fertig!

### Schritt 6: Webhook-URL in Code eintragen

1. Öffne dein Projekt
2. Öffne die Datei `app/page.tsx`
3. Suche nach (ganz oben, Zeile 8):
   ```typescript
   const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/1qc0oua02l1ry7jyitimxeqfdtja54xa';
   ```
4. Ersetze die URL mit deiner kopierten Webhook-URL
5. Trage auch deine E-Mail ein (Zeile 12):
   ```typescript
   const ADMIN_EMAIL = 'deine-email@beispiel.de';
   ```

### Schritt 7: Deployen & Testen

```bash
git add app/page.tsx
git commit -m "Configure Make.com webhook"
git push
```

Nach dem Deployment (2-3 Minuten):
1. Gehe auf deine Website
2. Klicke bei einem Prompt auf "📧 Melden"
3. Gib einen Grund ein
4. ✅ Du solltest eine E-Mail erhalten!

## 🔧 Troubleshooting

### Webhook funktioniert nicht

**Problem:** Keine E-Mail kommt an

**Lösung:**
1. Make.com Szenario ist **ON**? (Toggle oben rechts)
2. Webhook-URL richtig kopiert?
3. E-Mail-Adresse korrekt?
4. Spam-Ordner checken!
5. Make.com → "Execution history" ansehen

### CORS-Fehler im Browser

**Problem:** Browser blockt Webhook-Request

**Lösung:**
- Das ist normal wenn vom lokalen Test (localhost)
- Auf der echten Website (vercel.app) sollte es funktionieren
- Fallback (E-Mail-Client) springt automatisch ein

### E-Mail-Client öffnet nicht

**Problem:** Fallback öffnet kein E-Mail-Programm

**Lösung:**
- Standard-E-Mail-Client in Browser-Einstellungen setzen
- Oder: Meldung manuell kopieren und senden

## 💡 Tipps

### Gmail verwenden (empfohlen)

Statt "Email" Modul kannst du auch direkt **"Gmail"** nutzen:
1. Wähle "Gmail" → "Send an Email"
2. Verbinde deinen Google-Account (einmalig)
3. Gleiche Konfiguration wie oben
4. ✅ Zuverlässiger Versand

### Slack-Benachrichtigung zusätzlich

Du kannst auch Slack-Benachrichtigungen hinzufügen:
1. Nach dem E-Mail-Modul: **"+"** klicken
2. "Slack" → "Create a Message"
3. Kanal auswählen
4. Nachricht formatieren
5. ✅ Du bekommst E-Mail UND Slack-Nachricht!

## ✅ Fertig!

Nach dem Setup erhältst du bei jeder Meldung automatisch eine E-Mail mit allen Details!

Bei Fragen: README.md checken oder GitHub Issue erstellen.
