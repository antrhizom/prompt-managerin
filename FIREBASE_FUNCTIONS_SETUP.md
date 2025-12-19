# 🔥 Firebase Functions Setup - Komplette Anleitung

## Was du bekommst

✅ Automatische Email-Benachrichtigungen bei Löschanfragen
✅ Optional: Täglicher Report um 9 Uhr
✅ Professionelle HTML-Emails
✅ Alles über GitHub deployed

---

## Voraussetzungen (5 Minuten)

### 1. Firebase Blaze Plan aktivieren

**WICHTIG:** Functions brauchen den Blaze Plan (Pay-as-you-go)

1. Gehe zu [Firebase Console](https://console.firebase.google.com)
2. Wähle dein Projekt `prompt-managerin`
3. Links unten: **"Upgrade"** klicken
4. Wähle **"Blaze Plan"**
5. Zahlungsmethode hinzufügen (Kreditkarte)

**💰 Kosten:**
- **Kostenlos** bis 2 Millionen Aufrufe/Monat
- Für Schulen: Normalerweise **0€**
- Du kannst ein **Spending Limit** setzen

**Spending Limit setzen:**
- In Firebase Console → ⚙️ Settings → Usage and Billing
- "Set Budget Alert" → z.B. 5€/Monat
- Du wirst per Email gewarnt

### 2. Node.js & Firebase CLI installieren

```bash
# Node.js (falls noch nicht installiert)
# Download von: https://nodejs.org (LTS Version)

# Firebase CLI installieren
npm install -g firebase-tools

# Prüfen ob installiert
firebase --version
```

---

## Teil 1: Gmail App-Passwort erstellen (3 Minuten)

### Schritt 1: 2-Faktor-Authentifizierung aktivieren

1. Gehe zu [myaccount.google.com/security](https://myaccount.google.com/security)
2. Suche **"2-Schritt-Verifizierung"**
3. Falls nicht aktiv: **Aktivieren**
4. Folge den Schritten (SMS oder Authenticator App)

### Schritt 2: App-Passwort generieren

1. Gehe zu [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Falls nicht sichtbar: Suche in Settings nach "App passwords"
3. **App auswählen**: Wähle "Mail"
4. **Gerät auswählen**: Wähle "Other" → Gib ein: "Prompt Manager"
5. Klicke **"Generate"**
6. **Kopiere das 16-stellige Passwort** (z.B. `abcd efgh ijkl mnop`)

⚠️ **WICHTIG:** Dieses Passwort erscheint nur EINMAL! Speichere es sicher.

---

## Teil 2: Code konfigurieren (2 Minuten)

### Öffne `functions/index.js`

Finde diese Zeilen (ganz oben):

```javascript
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: 'deine-email@gmail.com',  // <-- HIER ÄNDERN
    pass: 'xxxx xxxx xxxx xxxx'      // <-- HIER ÄNDERN
  }
};

const ADMIN_EMAIL = 'admin@deine-schule.de'; // <-- HIER ÄNDERN
```

**Ersetze:**
- `deine-email@gmail.com` → Deine Gmail-Adresse (die du für das App-Passwort genutzt hast)
- `xxxx xxxx xxxx xxxx` → Dein 16-stelliges App-Passwort (MIT Leerzeichen!)
- `admin@deine-schule.de` → Die Email, die Benachrichtigungen empfangen soll

**Beispiel:**
```javascript
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: 'schule.prompts@gmail.com',
    pass: 'abcd efgh ijkl mnop'  // Dein echtes App-Passwort!
  }
};

const ADMIN_EMAIL = 'direktor@meine-schule.ch';
```

**Speichern!**

---

## Teil 3: Zu GitHub pushen (2 Minuten)

```bash
# Im prompt-manager Verzeichnis

# Alle Dateien hinzufügen
git add .

# Commit
git commit -m "Add Firebase Functions for email notifications"

# Push zu GitHub
git push
```

**Das war's für GitHub!** Die App auf Vercel läuft weiter wie gewohnt.

---

## Teil 4: Firebase Functions deployen (5 Minuten)

### Schritt 1: Firebase Login

```bash
# Im prompt-manager Verzeichnis
firebase login
```

- Browser öffnet sich
- Wähle deinen Google Account
- Erlaube Zugriff

### Schritt 2: Projekt prüfen

```bash
firebase projects:list
```

Du solltest `prompt-managerin` in der Liste sehen.

Falls nicht:
```bash
firebase use prompt-managerin
```

### Schritt 3: Functions deployen

```bash
# Im prompt-manager Verzeichnis
cd functions
npm install
cd ..

# Functions deployen
firebase deploy --only functions
```

**Das dauert 2-3 Minuten...**

Du siehst:
```
✔  functions: Finished running predeploy script.
i  functions: preparing codebase default for deployment
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
✔  functions: functions folder uploaded successfully
i  functions: creating Node.js 18 function sendDeletionRequestEmail...
✔  functions[sendDeletionRequestEmail]: Successful create operation.
i  functions: creating Node.js 18 function sendDailyDeletionReport...
✔  functions[sendDailyDeletionReport]: Successful create operation.

✔  Deploy complete!
```

---

## Teil 5: Testen (1 Minute)

1. Gehe zu deiner App: `https://prompt-managerin.vercel.app`
2. Versuche einen **fremden Prompt zu löschen**
3. Klicke auf 🚫 (bei einem Prompt von jemand anderem)
4. Bestätige die Löschanfrage

**Check deine Email!** ✉️

Du solltest innerhalb von 30 Sekunden eine Email bekommen mit:
- ⚠️ Neue Löschanfrage Betreff
- Alle Prompt-Details
- Schönes HTML-Design
- Link zur App

---

## Optional: Täglichen Report aktivieren

Der tägliche Report ist bereits deployed, aber standardmäßig aktiviert!

**Um zu deaktivieren:**
```bash
firebase functions:delete sendDailyDeletionReport
```

**Zeitplan ändern:**

In `functions/index.js` Zeile ~120:
```javascript
.schedule('0 9 * * *') // Jeden Tag um 9:00 Uhr
```

**Optionen:**
- `0 8 * * *` = 8:00 Uhr
- `0 17 * * 1-5` = 17:00 Uhr, Montag-Freitag
- `0 9 * * 1` = 9:00 Uhr, nur Montags

Nach Änderung:
```bash
firebase deploy --only functions:sendDailyDeletionReport
```

---

## Logs & Debugging

### Logs in Echtzeit ansehen

```bash
firebase functions:log
```

### Logs in Firebase Console

1. [Firebase Console](https://console.firebase.google.com)
2. Dein Projekt → **Functions** (linkes Menü)
3. Klicke auf eine Function
4. Reiter **"Logs"**

### Test-Email manuell auslösen

In Firebase Console:
1. **Firestore Database**
2. Wähle einen Prompt mit `deletionRequests`
3. Ändere ein anderes Feld (z.B. füge ein Tag hinzu)
4. Speichern → Function wird ausgelöst → Email kommt!

---

## Troubleshooting

### "Error: Authentication failed"

**Problem:** Gmail App-Passwort falsch

**Lösung:**
1. Gehe zurück zu [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. **Lösche** das alte App-Passwort
3. Erstelle ein **neues** App-Passwort
4. Kopiere es in `functions/index.js`
5. Deploy erneut: `firebase deploy --only functions`

### "Error: Billing account not configured"

**Problem:** Blaze Plan nicht aktiviert

**Lösung:**
1. [Firebase Console](https://console.firebase.google.com)
2. Links unten: **"Upgrade"**
3. Blaze Plan wählen
4. Zahlungsmethode hinzufügen

### "Error: Permission denied"

**Problem:** Falsches Firebase-Projekt

**Lösung:**
```bash
firebase use prompt-managerin
firebase deploy --only functions
```

### Function läuft nicht

**Check:**
```bash
# Logs ansehen
firebase functions:log

# Function-Status prüfen
firebase functions:list
```

**Manuell testen:**
1. Firebase Console → Functions
2. Klicke auf `sendDeletionRequestEmail`
3. Prüfe Status: Sollte "Active" sein

### Keine Email kommt

**Checklist:**
- [ ] Gmail App-Passwort korrekt in `functions/index.js`?
- [ ] Admin-Email korrekt?
- [ ] Function erfolgreich deployed? (Check Firebase Console)
- [ ] Logs checken: `firebase functions:log`
- [ ] Spam-Ordner checken!
- [ ] Gmail "Weniger sichere Apps" aktiviert? (nicht mehr nötig mit App-Passwort)

**Test:**
```javascript
// In functions/index.js temporär hinzufügen:
console.log('EMAIL_CONFIG:', EMAIL_CONFIG);
console.log('ADMIN_EMAIL:', ADMIN_EMAIL);
```

Deploy → Check Logs → Siehst du die Config?

---

## Kosten-Übersicht

### Realistische Nutzung (Schule mit 50 Lehrern):

| Aktion | Aufrufe/Monat | Kosten |
|--------|---------------|--------|
| 10 Löschanfragen/Monat | 10 | **€0,00** |
| Täglicher Report | 30 | **€0,00** |
| **TOTAL** | **40** | **€0,00** |

**Free Tier:** 2.000.000 Aufrufe/Monat

**Du müsstest 50.000 Löschanfragen/Monat haben um zu zahlen!**

### Wenn du das Free Tier überschreitest:

- €0,40 pro 1 Million Aufrufe
- Bei 3 Millionen Aufrufen: €0,40
- **Praxis:** Wird nie passieren

---

## Alternative Email-Provider

### Nicht Gmail? Kein Problem!

#### Outlook / Microsoft 365

```javascript
const EMAIL_CONFIG = {
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'deine-email@schule.ch',
    pass: 'dein-passwort'
  }
};
```

#### Eigener SMTP-Server

```javascript
const EMAIL_CONFIG = {
  host: 'mail.deine-schule.ch',
  port: 587,
  secure: false, // true für 465
  auth: {
    user: 'prompts@deine-schule.ch',
    pass: 'passwort'
  }
};
```

Nach Änderung:
```bash
firebase deploy --only functions
```

---

## Updates & Änderungen

### Email-Design ändern

Bearbeite `functions/index.js` → HTML im `mailOptions`

```bash
# Deploy nur die Functions
firebase deploy --only functions

# Deploy nur eine bestimmte Function
firebase deploy --only functions:sendDeletionRequestEmail
```

### Neue Function hinzufügen

1. In `functions/index.js` neue Function schreiben
2. `firebase deploy --only functions`

### Function löschen

```bash
firebase functions:delete FUNCTION_NAME
```

---

## Support & Hilfe

### Firebase Functions Dokumentation

- [Official Docs](https://firebase.google.com/docs/functions)
- [Nodemailer Docs](https://nodemailer.com)

### Commands Übersicht

```bash
# Login
firebase login

# Projekt auswählen
firebase use prompt-managerin

# Functions deployen
firebase deploy --only functions

# Logs ansehen
firebase functions:log

# Functions auflisten
firebase functions:list

# Function löschen
firebase functions:delete FUNCTION_NAME

# Lokale Emulation (Testen ohne Deployment)
firebase emulators:start --only functions
```

---

## Checkliste

- [ ] Blaze Plan aktiviert
- [ ] Node.js & Firebase CLI installiert
- [ ] Gmail 2FA aktiviert
- [ ] App-Passwort generiert
- [ ] `functions/index.js` konfiguriert (Email & Passwort)
- [ ] Code zu GitHub gepusht
- [ ] Firebase Login: `firebase login`
- [ ] Functions deployed: `firebase deploy --only functions`
- [ ] Test-Löschanfrage gestellt
- [ ] Email erhalten! ✅

---

**Fertig! Du hast jetzt professionelle Email-Benachrichtigungen!** 🎉

Bei Fragen: Check die Firebase Console Logs oder erstelle ein GitHub Issue.
