# Prompting Manager v2.1 📝

Eine interaktive Web-Anwendung zum Verwalten, Bewerten und Teilen von KI-Prompts für Bildungszwecke.

## 🎯 Neue Features in v2.1

### 1. Hashtag-Suche 🏷️
- **Tag-Filter**: Eigener Dropdown mit allen verwendeten Tags
- **#-Suche**: Gib `#tag` in die Suche ein → sucht nur in Tags
- **Smart-Suche**: Normale Suche durchsucht alles, Hashtag-Suche nur Tags

### 2. Verbessertes Admin-Dashboard
- **Refresh-Button**: "🔄 Aktualisieren" für neueste Daten
- **Letztes Update**: Zeigt wann die Daten zuletzt geladen wurden
- **Cache-Hinweis**: Info-Box falls gelöschte Prompts noch sichtbar sind

## 🎯 Features v2.0

### 1. Individuelles Login-System
- **Persönlicher Code**: Jeder Nutzer erhält einen einzigartigen 8-stelligen Code (z.B. `USER-A3K9X2B7`)
- **Automatischer Login**: Beim nächsten Besuch automatisch eingeloggt
- **Keine Team-Freigabe**: Jeder Code ist privat und nicht zum Teilen gedacht
- **Multi-Device**: Automatischer Login auf allen eigenen Geräten

### 2. Accordion-System für Modellauswahl
- **11 Plattformen** mit insgesamt über 60 Modellen (Stand Januar 2026):
  - ChatGPT / OpenAI (GPT-5.2, GPT-4.1, o3, etc.)
  - Claude / Anthropic (Claude Opus 4.5, Sonnet 4.5, etc.)
  - Gemini / Google (Gemini 3 Pro, Gemini 2.5 Flash, etc.)
  - fobizz (15 verschiedene Modelle)
  - Copilot / Microsoft
  - Perplexity
  - DeepL Write
  - Meta Llama
  - Mistral AI
  - Qwen / Alibaba
  - DeepSeek
- **Pro Plattform mehrere Modelle** auswählbar
- **Übersichtliche Darstellung** in aufklappbaren Accordions

### 3. Admin-Dashboard
- **Übersicht-Statistiken**:
  - Anzahl registrierter Nutzer
  - Anzahl Prompts gesamt
  - Gesamte Bewertungen (Likes)
  - Gesamte Nutzungen (Kopiert)
- **Detaillierte Analysen**:
  - Prompts pro Output-Format
  - Prompts pro Plattform
  - Top 10 Modelle
  - Prompts pro Anwendungsfall
  - Top 5 aktivste Nutzer
  - Top 5 beliebteste Prompts
  - Top 5 meist genutzte Prompts

## ✨ Bestehende Features

- **Cloud-Speicherung** mit Firebase Firestore
- **Echtzeit-Synchronisation**
- **26+ Lern-Anwendungsfälle** (6 Kategorien)
- **12 Output-Formate** (Text, HTML, PDF, Bild, Video, etc.)
- **Bewertungssystem** (5 Emoji-Bewertungen)
- **Nutzungs-Tracking**
- **Such- & Filter-Funktionen**
- **Löschanfragen per E-Mail** für fremde Prompts
- **Tags** für bessere Organisation

## 🚀 Installation & Setup

### 1. Firebase einrichten (10 Min)

#### Firebase Projekt erstellen
1. Gehe zu [console.firebase.google.com](https://console.firebase.google.com)
2. Klicke auf "Projekt hinzufügen"
3. Projektname eingeben
4. "Projekt erstellen" klicken

#### Firestore Database aktivieren
1. Linkes Menü: "Build" → "Firestore Database"
2. "Datenbank erstellen" klicken
3. "Im Testmodus starten" wählen
4. Standort: `europe-west` (für Europa)
5. "Aktivieren" klicken

#### Sicherheitsregeln setzen
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

#### Web-App registrieren
1. Firebase Projekt → Web-Icon (`</>`)
2. App-Name eingeben
3. "App registrieren"
4. **Config-Werte kopieren**

### 2. Projekt konfigurieren (5 Min)

```bash
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

### 3. Lokal testen (2 Min)

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

### 4. Auf Vercel deployen (5 Min)

#### Option A: GitHub Integration (Empfohlen)

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

1. Gehe zu [vercel.com/new](https://vercel.com/new)
2. GitHub Repository auswählen
3. "Import" klicken
4. **Environment Variables** hinzufügen (alle aus `.env.local`)
5. "Deploy" klicken

#### Option B: Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

## 📖 Verwendung

### Erster Besuch
1. **Automatischer Code**: System generiert deinen persönlichen Code
2. **Name eingeben**: Gib deinen Namen ein
3. **Los geht's**: Du bist eingeloggt!

### Wiederkehrender Besuch
- **Automatischer Login**: Sofort eingeloggt mit gespeichertem Code & Namen

### Prompt erstellen
1. **Titel** (Pflicht)
2. **Beschreibung** (Optional)
3. **Prompt-Text** (Pflicht)
4. **Plattformen & Modelle** (Pflicht) - Per Accordion auswählbar
5. **Output-Formate** (Pflicht)
6. **Anwendungsfälle** (Pflicht)
7. **Tags** (Optional)
8. **Kommentar** (Optional)

### Admin-Dashboard aufrufen
- Klicke auf "📊 Dashboard" im Header
- Oder navigiere zu `/admin`

### Prompts nutzen
- **Suchen**: 
  - Normale Suche: Durchsucht Titel, Beschreibung, Prompt-Text und Tags
  - Hashtag-Suche: `#mathematik` → sucht nur in Tags
- **Filtern**: 
  - Nach Plattform (z.B. "ChatGPT / OpenAI")
  - Nach Output-Format (z.B. "PDF")
  - Nach Anwendungsfall (z.B. "Übungsaufgaben erstellen")
  - Nach Tag (Dropdown mit allen verwendeten Tags)
- **Filter zurücksetzen**: Button erscheint automatisch wenn Filter aktiv sind
- **Bewerten**: Emoji-Bewertungen (👍 ❤️ 🔥 ⭐ 💡)
- **Kopieren**: "📋 Kopieren" → Prompt in Zwischenablage + Nutzung zählt

## 🏗️ Technologie-Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Deployment**: Vercel
- **Styling**: Inline CSS

## 📊 Datenstruktur

### Prompt-Interface
```typescript
interface Prompt {
  id: string;
  titel: string;
  beschreibung: string;
  promptText: string;
  plattformenUndModelle: { [plattform: string]: string[] };
  outputFormate: string[];
  anwendungsfaelle: string[];
  tags: string[];
  kommentar: string;
  bewertungen: { [emoji: string]: number };
  nutzungsanzahl: number;
  erstelltVon: string;  // User-Code
  erstelltAm: Timestamp;
}
```

### Beispiel-Daten
```javascript
{
  titel: "Mathe-Textaufgaben erstellen",
  plattformenUndModelle: {
    "ChatGPT / OpenAI": ["GPT-4o", "GPT-5.2"],
    "Claude / Anthropic": ["Claude Sonnet 4.5"]
  },
  outputFormate: ["Text", "PDF"],
  anwendungsfaelle: ["Übungsaufgaben erstellen"],
  tags: ["Mathematik", "7. Klasse"],
  erstelltVon: "USER-A3K9X2B7"
}
```

## 🔐 Sicherheit

### Production Deployment

Für echte Nutzung Firebase Rules verschärfen:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prompts/{promptId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if resource.data.erstelltVon == request.auth.uid;
    }
  }
}
```

**Hinweis**: Die App nutzt derzeit keine Firebase Authentication. Für echte Nutzer-Authentifizierung sollte Firebase Auth integriert werden.

## 🐛 Troubleshooting

### "Firebase is not configured"
- `.env.local` existiert?
- Alle Variablen beginnen mit `NEXT_PUBLIC_`?
- Server neu starten: `npm run dev`

### "Missing or insufficient permissions"
- Firestore Rules auf `allow read, write: if true;` setzen
- Firebase Console überprüfen

### Build-Fehler
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Admin-Dashboard zeigt keine Daten
- Mindestens 1 Prompt muss erstellt sein
- Firebase-Verbindung prüfen

### Gelöschte Prompts werden noch angezeigt
- **Im Dashboard**: Klicke auf "🔄 Aktualisieren"
- **Hauptseite**: Seite neu laden (F5 / Cmd+R)
- **Ursache**: Firebase Real-time Cache
- **Lösung**: Nach einigen Sekunden automatisch aktualisiert

## 💰 Firebase Kosten

### Free Tier (Spark Plan)
- ✅ 50.000 Reads/Tag
- ✅ 20.000 Writes/Tag
- ✅ 1 GB Storage

**Für Schulen (< 100 Nutzer)**: Völlig ausreichend!

### Blaze Plan (Pay-as-you-go)
- ~$0.06 pro 100.000 Reads
- Für die meisten: < $1/Monat

## 📚 Projektstruktur

```
prompt-manager/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin Dashboard
│   ├── layout.tsx             # Root Layout
│   ├── page.tsx               # Hauptseite
│   └── globals.css            # Globale Styles
├── lib/
│   └── firebase.ts            # Firebase Config
├── .env.local.template        # Env Template
├── .gitignore
├── next.config.js
├── package.json
├── README.md
└── tsconfig.json
```

## 🆘 Support

Bei Problemen:
1. README.md durchlesen
2. Troubleshooting-Sektion checken
3. Firebase Console überprüfen
4. GitHub Issue erstellen

---

**Version 2.0** - Mit individuellem Login, Accordion-Modellauswahl und Admin-Dashboard 🚀
