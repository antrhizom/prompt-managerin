# 🔥 Firebase Setup - Schritt für Schritt

## Warum Firebase?

Mit Firebase erhältst du:
- ✅ **Cloud-Speicherung**: Deine Prompts sind überall verfügbar
- ✅ **Echtzeit-Sync**: Änderungen erscheinen sofort auf allen Geräten
- ✅ **Multi-User**: Mehrere Nutzer können die gleiche Datenbank nutzen
- ✅ **Automatisches Backup**: Deine Daten sind sicher gespeichert
- ✅ **Kostenlos**: Bis zu 50.000 Reads/Tag im Free Tier

---

## Teil 1: Firebase Projekt erstellen (5 Minuten)

### Schritt 1: Firebase Console
1. Gehe zu [console.firebase.google.com](https://console.firebase.google.com)
2. Klicke auf **"Projekt hinzufügen"** / **"Add project"**
3. Projektname: `prompt-manager` (oder eigener Name)
4. **Google Analytics**: Kannst du deaktivieren (optional)
5. Klicke **"Projekt erstellen"**
6. Warte ~30 Sekunden

### Schritt 2: Web-App registrieren
1. Im Firebase Projekt: Klicke auf das **Web-Icon** (</>) "Web-App hinzufügen"
2. App-Spitzname: `Prompt Manager Web`
3. **NICHT** "Firebase Hosting" aktivieren
4. Klicke **"App registrieren"**

### Schritt 3: Config-Daten kopieren
Du siehst jetzt einen Code-Block wie:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "prompt-manager-xxxxx.firebaseapp.com",
  projectId: "prompt-manager-xxxxx",
  storageBucket: "prompt-manager-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

**Kopiere diese Werte!** Du brauchst sie gleich.

---

## Teil 2: Firestore Database aktivieren (2 Minuten)

### Schritt 1: Firestore erstellen
1. Im linken Menü: **"Build"** → **"Firestore Database"**
2. Klicke **"Datenbank erstellen"** / **"Create database"**

### Schritt 2: Sicherheitsregeln wählen
Wähle **"Im Testmodus starten"** / **"Start in test mode"**

⚠️ **WICHTIG**: Testmodus läuft 30 Tage, dann musst du Regeln anpassen (siehe unten)

### Schritt 3: Standort wählen
- Wähle einen Standort in deiner Nähe:
  - `europe-west` (Belgien) für Europa
  - `us-central` für USA
  - `asia-northeast` für Asien

Klicke **"Aktivieren"**

---

## Teil 3: Lokale Konfiguration (3 Minuten)

### Schritt 1: .env.local erstellen
In deinem Projektordner, erstelle eine Datei `.env.local`:

**Windows**: Rechtsklick → Neue Datei → `.env.local`
**Mac/Linux**: `touch .env.local`

### Schritt 2: Config einfügen
Öffne `.env.local` und füge deine Firebase-Werte ein:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prompt-manager-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prompt-manager-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prompt-manager-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

**Ersetze alle Werte** mit deinen aus Schritt "Config-Daten kopieren"!

### Schritt 3: Testen
```bash
# Installiere Dependencies
npm install

# Starte Development Server
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

✅ Wenn alles funktioniert, siehst du "🔄 Echtzeit-Sync über alle Geräte"
❌ Bei Fehlern, siehe "Troubleshooting" unten

---

## Teil 4: Auf Vercel deployen (2 Minuten)

### Schritt 1: Environment Variables hinzufügen
1. Gehe zu [vercel.com/dashboard](https://vercel.com/dashboard)
2. Wähle dein Projekt
3. **Settings** → **Environment Variables**
4. Füge **alle** Variablen aus `.env.local` hinzu:

```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: AIzaSy...

Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: prompt-manager-xxxxx.firebaseapp.com

... (alle anderen auch)
```

### Schritt 2: Redeploy
1. Im Vercel Dashboard: **Deployments** Tab
2. Bei letztem Deployment: **⋯** (3 Punkte) → **Redeploy**
3. Warte ~1 Minute

✅ **Fertig!** Deine App ist jetzt mit Firebase verbunden!

---

## Teil 5: Firestore Security Rules (WICHTIG!)

Nach 30 Tagen läuft der Testmodus ab. Setze dann diese Rules:

### Option A: Public (Jeder kann alles)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prompts/{promptId} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Achtung**: Jeder kann deine Prompts sehen und ändern!

### Option B: Nur Lesen für alle
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prompts/{promptId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

**Für mehr Sicherheit**: Siehe Firebase Authentication unten.

### Rules aktivieren:
1. Firebase Console → **Firestore Database** → **Rules**
2. Ersetze den Code
3. Klicke **"Veröffentlichen"**

---

## Optional: Firebase Authentication (Für private Prompts)

### Warum Auth?
- 👤 Jeder User hat seine eigenen Prompts
- 🔒 Niemand kann fremde Prompts sehen/ändern
- 📊 Multi-User fähig

### Quick Setup:
1. Firebase Console → **Authentication** → **Get started**
2. **Sign-in method** → **Email/Password** → **Aktivieren**
3. Oder: **Google** / **GitHub** für Social Login

### Security Rules mit Auth:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prompts/{promptId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Code-Änderungen nötig**: Für Auth brauchst du zusätzlichen Code. Siehe [Firebase Auth Docs](https://firebase.google.com/docs/auth/web/start)

---

## Troubleshooting 🔧

### Problem: "Firebase is not configured"
**Lösung**: 
- Überprüfe `.env.local` existiert
- Alle Variablen beginnen mit `NEXT_PUBLIC_`
- Server neu starten: `npm run dev`

### Problem: "Missing or insufficient permissions"
**Lösung**:
- Firestore Rules überprüfen (siehe Teil 5)
- Im Testmodus? Läuft noch 30 Tage?

### Problem: "Network error" / "Failed to fetch"
**Lösung**:
- Internet-Verbindung prüfen
- Firebase Projekt-Status: [status.firebase.google.com](https://status.firebase.google.com)
- Browser-Cache leeren

### Problem: "Invalid API key"
**Lösung**:
- API Key in Firebase Console überprüfen
- Neu kopieren und in `.env.local` einfügen
- In Vercel: Environment Variables prüfen

### Problem: Daten erscheinen nicht sofort
**Lösung**:
- Das ist normal - Echtzeit-Sync kann 1-2 Sekunden dauern
- Bei langsamen Verbindungen länger

### Problem: "Quota exceeded"
**Lösung**:
- Firebase Free Tier: 50.000 Reads/Tag
- Überprüfe Usage: Firebase Console → Usage
- Upgrade zu Blaze Plan (Pay-as-you-go) für mehr

---

## Firebase Kosten 💰

### Free Tier (Spark Plan):
- ✅ 50.000 Document Reads/Tag
- ✅ 20.000 Document Writes/Tag
- ✅ 20.000 Document Deletes/Tag
- ✅ 1 GB Storage

**Für kleine Teams (< 10 Nutzer)**: Mehr als genug!

### Blaze Plan (Pay-as-you-go):
- Nur zahlen wenn Free Tier überschritten
- ~$0.06 pro 100.000 Reads
- Für die meisten: < $1/Monat

---

## Best Practices 🌟

### 1. Environment Variables sichern
```bash
# .env.local NIE zu Git pushen!
# Ist bereits in .gitignore
```

### 2. Backup erstellen
Firebase Console → **Firestore** → **Import/Export**

### 3. Monitoring
Firebase Console → **Analytics** → **Dashboards**

### 4. Limits beachten
- Max 1 MB pro Document
- Max 500 Writes/Sekunde zu gleicher Collection

---

## Nächste Schritte

✅ Firebase läuft? Perfekt!

**Erweiterte Features**:
- [ ] User Authentication implementieren
- [ ] Security Rules verfeinern
- [ ] Cloud Functions für Business Logic
- [ ] Firebase Storage für Dateien
- [ ] Firebase Analytics für Tracking

**Ressourcen**:
- 📚 [Firebase Docs](https://firebase.google.com/docs)
- 🎥 [Firebase YouTube](https://www.youtube.com/firebase)
- 💬 [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

---

## Support

Bei Fragen:
1. Checke [Firebase Docs](https://firebase.google.com/docs/firestore)
2. Suche [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
3. Erstelle ein GitHub Issue

**Viel Erfolg mit Firebase!** 🔥
