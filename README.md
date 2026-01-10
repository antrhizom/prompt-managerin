# Prompting Manager 📝

Eine interaktive Web-Anwendung zum Verwalten, Bewerten und Teilen von KI-Prompts für Bildungszwecke.

## ✨ Features

### 🎯 Kern-Features
- **Cloud-Speicherung** mit Firebase Firestore
- **Code-basierte Authentifizierung** - Teams teilen einen Zugangscode
- **Echtzeit-Synchronisation** - Änderungen erscheinen sofort auf allen Geräten
- **Multi-Plattform** - 15+ KI-Tools unterstützt (ChatGPT, Claude, Gemini, fobizz, etc.)
- **26+ Lern-Anwendungsfälle** - Kategorisiert nach Lernzielen
- **Output-Formate** - 12 verschiedene Formate (Text, HTML, PDF, Bild, etc.)

### 👥 Benutzer-Verwaltung
- **Eigene Prompts löschen** - Volle Kontrolle über eigene Inhalte
- **Löschanfragen** - Andere Prompts können per E-Mail zur Löschung angefragt werden
- **Bewertungssystem** - 5 Emoji-Bewertungen
- **Nutzungs-Tracking** - Sehe welche Prompts am häufigsten verwendet werden

### 🔍 Such- & Filter-Funktionen
- Volltextsuche
- Filter nach Plattform
- Filter nach Output-Format
- Filter nach Anwendungsfall
- Sortierung (Neueste, Meist genutzt, Best bewertet)

## 🚀 Installation & Setup

### 1. Firebase einrichten (10 Minuten)

#### Schritt 1: Firebase Projekt erstellen
1. Gehe zu [console.firebase.google.com](https://console.firebase.google.com)
2. Klicke auf **"Projekt hinzufügen"**
3. Projektname eingeben (z.B. `prompting-manager`)
4. Google Analytics optional deaktivieren
5. **"Projekt erstellen"** klicken

#### Schritt 2: Web-App registrieren
1. Im Firebase Projekt: Klicke auf **Web-Icon** (`</>`)
2. App-Name: `Prompting Manager`
3. **Firebase Hosting NICHT aktivieren**
4. **"App registrieren"** klicken
5. **Config-Werte kopieren** (brauchst du gleich!)

#### Schritt 3: Firestore Database aktivieren
1. Linkes Menü: **"Build"** → **"Firestore Database"**
2. **"Datenbank erstellen"** klicken
3. **"Im Testmodus starten"** wählen
4. Standort wählen: `europe-west` (für Europa)
5. **"Aktivieren"** klicken

#### Schritt 4: Sicherheitsregeln anpassen
1. In Firestore: Tab **"Regeln"**
2. Ersetze die Regeln mit:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prompts/{promptId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if true;
    }
  }
}
```

3. **"Veröffentlichen"** klicken

⚠️ **WICHTIG**: Diese Regeln erlauben allen Zugriff. Für Production solltest du Authentifizierung hinzufügen!

### 2. Projekt klonen & konfigurieren (5 Minuten)

```bash
# Repository klonen (oder ZIP herunterladen)
git clone dein-repository-url
cd prompt-manager

# Dependencies installieren
npm install

# .env.local erstellen
cp .env.local.template .env.local
```

Öffne `.env.local` und füge deine Firebase-Werte ein:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=deine-werte-hier
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dein-projekt-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 3. Lokal testen (2 Minuten)

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

**Test-Schritte:**
1. Name eingeben (z.B. "Max Mustermann")
2. Zugangscode eingeben (z.B. "schule2024")
3. "Anmelden" klicken
4. Prompt erstellen und speichern
5. Prüfen ob Prompt angezeigt wird

### 4. Auf Vercel deployen (5 Minuten)

#### Option A: GitHub Integration (Empfohlen)

1. **Code zu GitHub pushen:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Vercel importieren:**
   - Gehe zu [vercel.com/new](https://vercel.com/new)
   - GitHub Repository auswählen
   - **"Import"** klicken

3. **Environment Variables setzen:**
   - In Vercel: **"Environment Variables"** Tab
   - Füge alle Werte aus `.env.local` hinzu
   - Für jede Variable: Name + Wert eingeben
   - **WICHTIG**: Alle müssen mit `NEXT_PUBLIC_` beginnen!

4. **Deploy:**
   - **"Deploy"** klicken
   - Warte ~2 Minuten
   - Fertig! 🎉

#### Option B: Vercel CLI

```bash
# Vercel CLI installieren (einmalig)
npm i -g vercel

# Deployen
vercel --prod

# Environment Variables setzen (in der Vercel UI)
```

## 📖 Verwendung

### Erster Besuch - Automatisches Setup
1. **Automatischer Code**: Beim ersten Besuch wird dir automatisch ein 6-stelliger Team-Code zugewiesen (z.B. `A3K9X2`)
2. **Name eingeben**: Gib deinen Namen ein (z.B. "Anna Schmidt")
3. **Fertig!**: Du bist eingeloggt und kannst loslegen

### Wiederkehrender Besuch
- **Automatischer Login**: Beim nächsten Besuch wirst du automatisch mit deinem gespeicherten Namen und Code eingeloggt
- **Kein Passwort nötig**: Deine Daten bleiben im Browser gespeichert

### Team-Code teilen
1. **Code anzeigen**: Dein Team-Code wird im Header angezeigt
2. **Code teilen**: Teile deinen Code mit Kollegen (z.B. per E-Mail)
3. **Code eingeben**: Andere klicken auf "Code ändern" und geben deinen Code ein
4. **Gleiche Datenbank**: Alle mit dem gleichen Code sehen die gleichen Prompts!

### Code wechseln
- **"🔄 Code ändern"** im Header klicken
- Neuen Team-Code eingeben
- Jetzt nutzt du eine andere Team-Datenbank

### Anmelden
1. **Titel** (Pflicht): Kurzer, beschreibender Titel
2. **Beschreibung** (Optional): Zusätzliche Erklärung
3. **Prompt-Text** (Pflicht): Der eigentliche Prompt
4. **Plattformen** (Pflicht): Mindestens eine wählen
5. **Output-Formate** (Pflicht): Mindestens ein Format
6. **Anwendungsfälle** (Pflicht): Mindestens einen Zweck
7. **Tags** (Optional): Komma-getrennt
8. **Kommentar** (Optional): Zusätzliche Tipps

### Prompts nutzen
- **Suchen**: Volltextsuche über alle Felder
- **Filtern**: Nach Plattform, Format, Anwendungsfall
- **Bewerten**: Klicke auf Emoji (👍 ❤️ 🔥 ⭐ 💡)
- **Kopieren**: "📋 Kopieren" klickt = Prompt in Zwischenablage + Nutzung zählt

### Löschen
- **Eigene Prompts**: Direkt löschen
- **Fremde Prompts**: "📧 Löschanfrage" sendet E-Mail

## 🔧 Anpassungen

### Anwendungsfälle ändern
Datei: `app/page.tsx` - Zeile ~47

```typescript
const ANWENDUNGSFAELLE = {
  'Deine Kategorie': [
    'Anwendungsfall 1',
    'Anwendungsfall 2',
  ],
  // ...
};
```

### Plattformen hinzufügen
Datei: `app/page.tsx` - Zeile ~27

```typescript
const PLATTFORMEN = [
  'ChatGPT',
  'Deine neue Plattform',
  // ...
];
```

### Make.com Webhook ändern
Datei: `app/page.tsx` - Zeile ~376

```typescript
const response = await fetch('DEINE-WEBHOOK-URL', {
  // ...
});
```

## 🐛 Troubleshooting

### "Firebase is not configured"
- Überprüfe `.env.local` existiert
- Alle Variablen beginnen mit `NEXT_PUBLIC_`
- Server neu starten: `npm run dev`

### "Missing or insufficient permissions"
- Firestore Rules auf `allow read, write: if true;` setzen
- Im Firebase Console überprüfen

### Prompts werden nicht angezeigt
1. F12 drücken → Console öffnen
2. Fehlermeldung suchen
3. Firebase Config überprüfen

### Build-Fehler
```bash
# Node modules neu installieren
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📊 Firebase Kosten

### Free Tier (Spark Plan)
- ✅ 50.000 Reads/Tag
- ✅ 20.000 Writes/Tag
- ✅ 1 GB Storage

**Für kleine Schulen (< 50 Nutzer)**: Völlig ausreichend!

### Blaze Plan (Pay-as-you-go)
- Nur zahlen wenn Free Tier überschritten
- ~$0.06 pro 100.000 Reads
- Für die meisten Schulen: < $1/Monat

## 🔐 Sicherheit

### Production Deployment

Für echte Nutzung solltest du:

1. **Firebase Authentication hinzufügen**
2. **Firestore Rules verschärfen**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prompts/{promptId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null 
                    && resource.data.erstelltVon == request.auth.uid;
    }
  }
}
```

3. **API Keys schützen** (nur für autorisierte Domains)

## 📚 Technologie-Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Deployment**: Vercel
- **Styling**: Inline CSS (kein Framework)

## 🤝 Beitragen

Bugs oder Feature-Wünsche? Erstelle ein GitHub Issue!

## 📄 Lizenz

MIT License - Frei verwendbar für Bildungszwecke

## 🆘 Support

Bei Problemen:
1. README.md durchlesen
2. Troubleshooting-Sektion checken
3. Firebase Console überprüfen
4. GitHub Issue erstellen

---

**Viel Erfolg mit deinem Prompting Manager!** 🚀
