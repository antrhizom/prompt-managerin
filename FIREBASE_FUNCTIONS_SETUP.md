# 🔥 Firebase Functions Setup - Die ECHTE Webhook-Lösung!

## 🎯 Wie es funktioniert

```
User meldet Prompt
    ↓
Firestore: deletionRequests[] wird aktualisiert
    ↓
Firebase Functions: onUpdate() Trigger feuert automatisch
    ↓
E-Mail wird an Admin gesendet (Gmail SMTP)
```

**Das ist die BESTE Lösung weil:**
- ✅ Kein CORS-Problem
- ✅ Automatisch getriggert
- ✅ Server-seitig (sicher)
- ✅ Keine API Routes nötig
- ✅ Firebase verwaltet alles

---

## 📋 Voraussetzungen

1. **Firebase Projekt** (hast du schon)
2. **Blaze Plan** (Pay-as-you-go) für Functions
3. **Gmail App-Passwort** für E-Mail-Versand

---

## 🚀 Step-by-Step Setup

### 1. Firebase CLI installieren

```bash
npm install -g firebase-tools
```

### 2. Firebase Login

```bash
firebase login
```

### 3. Firebase Projekt initialisieren

```bash
# Im Projekt-Ordner
firebase init functions

# Wähle:
# - Use existing project → Wähle dein Projekt
# - JavaScript
# - ESLint: No (oder Yes, egal)
# - Install dependencies: Yes
```

### 4. Gmail App-Passwort erstellen

#### 📧 Gmail einrichten:

1. Gehe zu https://myaccount.google.com/security
2. Aktiviere **2-Faktor-Authentifizierung** (falls noch nicht)
3. Gehe zu https://myaccount.google.com/apppasswords
4. Wähle:
   - App: "Mail"
   - Gerät: "Anderes" → "Prompt Manager"
5. **Kopiere das 16-stellige Passwort** (z.B. `abcd efgh ijkl mnop`)

### 5. Firebase Functions konfigurieren

Öffne `functions/index.js` und ändere:

```javascript
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: 'antrhizom@gmail.com',  // <-- DEINE Gmail-Adresse
    pass: 'abcd efgh ijkl mnop'   // <-- DEIN App-Passwort (16 Zeichen)
  }
};

const ADMIN_EMAIL = 'antrhizom@gmail.com'; // <-- ADMIN E-Mail
```

### 6. Firebase Functions deployen

```bash
# Installiere Dependencies
cd functions
npm install

# Deploy Functions
cd ..
firebase deploy --only functions
```

Das dauert 1-2 Minuten. Du siehst dann:

```
✔  functions[sendDeletionRequestEmail(us-central1)]: Successful create operation.
Function URL: https://us-central1-xxx.cloudfunctions.net/sendDeletionRequestEmail
```

### 7. Testen!

1. Öffne deine App: https://prompt-managerin.vercel.app
2. Login mit Code **1ZBPQL**
3. Klicke bei einem **fremden** Prompt auf 🚨
4. Gib einen Grund ein
5. ✅ E-Mail wird automatisch gesendet!

---

## 📂 Dateien-Struktur

```
prompt-manager/
├── functions/
│   ├── index.js          ← Firebase Functions (E-Mail Trigger)
│   ├── package.json      ← Dependencies
│   └── .eslintrc.js     
├── firebase.json         ← Firebase Config
├── .firebaserc          ← Projekt ID
└── app/
    └── page.tsx         ← deletionRequests statt Webhook
```

---

## 🧪 Debugging

### Functions Logs anschauen:

```bash
firebase functions:log
```

### Oder im Firebase Console:
1. https://console.firebase.google.com
2. Dein Projekt → Functions → Logs

### Häufige Fehler:

**"Firebase requires billing"**
→ Aktiviere Blaze Plan (kostenlos bis 2M Aufrufe/Monat)

**"Invalid login"**
→ Prüfe Gmail App-Passwort (16 Zeichen, mit Leerzeichen)

**"ECONNREFUSED"**
→ Gmail blockiert. Prüfe:
  - 2FA aktiviert?
  - App-Passwort korrekt?
  - Richtige Gmail-Adresse?

**E-Mail kommt nicht an:**
→ Prüfe Spam-Ordner
→ Prüfe Functions Logs: `firebase functions:log`

---

## 💰 Kosten

**Firebase Functions (Blaze Plan):**
- Erste 2 Millionen Aufrufe: **KOSTENLOS**
- Danach: $0.40 pro Million
- Für deine Schule: **Praktisch kostenlos!**

**Beispiel:**
- 100 Meldungen/Monat = 100 Function Calls
- Kosten: **$0.00**

---

## 🔧 Weitere Commands

### Functions neu deployen:
```bash
firebase deploy --only functions
```

### Nur eine Function deployen:
```bash
firebase deploy --only functions:sendDeletionRequestEmail
```

### Lokales Testen:
```bash
firebase emulators:start --only functions
```

### Functions löschen:
```bash
firebase functions:delete sendDeletionRequestEmail
```

---

## 📧 E-Mail Template

Die Firebase Function sendet eine professionelle HTML-E-Mail mit:

- ✅ Prompt-Details (ID, Titel, Text)
- ✅ Melder-Info (Name, Code)
- ✅ Grund der Meldung
- ✅ Anzahl bisheriger Anfragen
- ✅ Nutzungsstatistiken
- ✅ Link zur App

---

## ✅ Fertig!

Jetzt funktioniert die **echte Webhook-Lösung** mit Firebase Functions!

**Vorteile gegenüber direktem Webhook:**
- ✅ Kein CORS
- ✅ Automatisch getriggert bei DB-Änderung
- ✅ Server-seitig = sicherer
- ✅ Firebase verwaltet Skalierung
- ✅ Integrierte Logs

**Das ist die professionelle Lösung! 🎉**
