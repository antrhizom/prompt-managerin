# Prompt Managerin v3.0 📝

Eine öffentliche Bildungsplattform zum Durchsuchen, Bewerten und Teilen von KI-Prompts.

## 🎯 Neue Architektur v3.0

### 🌍 Öffentlich zugänglich (ohne Login)
- ✅ **Alle Prompts ansehen** - Vollständige Bibliothek
- ✅ **Dashboard ansehen** - Alle Statistiken
- ✅ **Suchen & Filtern** - Vollständige Suchfunktion inkl. Hashtags
- ✅ **Bewerten** - Mit Emojis (👍 ❤️ 🔥 ⭐ 💡)
- ✅ **Kopieren** - Prompts direkt nutzen

### 🔐 Mit Login (optional)
- ✅ **Prompts erstellen** - Neue Prompts hinzufügen
- ✅ **Eigene Prompts bearbeiten** - Jederzeit anpassen
- ✅ **Eigene Prompts löschen** - Volle Kontrolle
- ✅ **Marker für eigene Prompts** - "Dein Prompt" Badge

**→ Perfekt für Schulen & Bildungseinrichtungen!**

## ✨ Features

### Öffentliche Features
- **66+ KI-Modelle** über 11 Plattformen (ChatGPT, Claude, Gemini, fobizz, etc.)
- **Accordion-Auswahl** - Modelle pro Plattform organisiert
- **12 Output-Formate** - Text, PDF, Bild, Video, Code, etc.
- **26+ Lern-Anwendungsfälle** - 6 Kategorien
- **Hashtag-Suche** - `#tag` für gezielte Tag-Suche
- **Tag-Filter** - Dropdown mit allen verwendeten Tags
- **Bewertungssystem** - 5 Emoji-Reaktionen
- **Nutzungs-Tracking** - Zeigt Popularität
- **Admin-Dashboard** - Umfassende Statistiken

### Login-Features
- **6-stelliger Code** - Einfache Anmeldung (z.B. `A3K9X2`)
- **Prompt erstellen** - Mit allen Metadaten
- **Prompt bearbeiten** - Eigene Prompts anpassen
- **Prompt löschen** - Eigene Prompts entfernen
- **Multi-Device** - Automatischer Login auf eigenen Geräten

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

#### Sicherheitsregeln setzen (Öffentlich lesen, Schreiben nur mit Code)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prompts/{promptId} {
      allow read: if true;  // Öffentlich lesbar
      allow create: if true; // Jeder kann erstellen (Code wird gespeichert)
      allow update: if true; // Jeder kann aktualisieren
      allow delete: if resource.data.erstelltVon == request.resource.data.erstelltVon;
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

### Als Besucher (ohne Login)
1. **Stöbern**: Alle Prompts durchsuchen
2. **Filtern**: Nach Plattform, Format, Tags, Anwendungsfall
3. **Suchen**: Text-Suche oder Hashtag-Suche (`#mathe`)
4. **Bewerten**: Emoji-Reaktionen geben
5. **Kopieren**: Prompts nutzen (📋 Button)
6. **Dashboard**: Statistiken ansehen

### Als Ersteller (mit Login)
1. **Anmelden**: Klick auf "🔐 Anmelden"
2. **Code erhalten**: 6-stelliger Code (z.B. `A3K9X2`)
3. **Namen eingeben**: Einmalig
4. **Prompt erstellen**: "➕ Prompt erstellen" Button
5. **Bearbeiten**: "✏️ Bearbeiten" bei eigenen Prompts
6. **Löschen**: "🗑️ Löschen" bei eigenen Prompts

### Hashtag-Suche
```
Normale Suche: "mathematik"
→ Sucht in: Titel, Beschreibung, Prompt-Text, Tags

Hashtag-Suche: "#mathematik"
→ Sucht NUR in: Tags
```

### Prompt erstellen
1. **Titel** (Pflicht)
2. **Beschreibung** (Optional)
3. **Prompt-Text** (Pflicht)
4. **Plattformen & Modelle** (Pflicht) - Per Accordion auswählbar
5. **Output-Formate** (Pflicht)
6. **Anwendungsfälle** (Pflicht)
7. **Tags** (Optional)
8. **Kommentar** (Optional)

### Prompt bearbeiten
- Nur eigene Prompts
- Klick auf "✏️ Bearbeiten"
- Alle Felder änderbar
- "✅ Aktualisieren" zum Speichern

## 🏗️ Technologie-Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore (öffentlich lesbar)
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
  erstelltVon: string;  // User-Code (6-stellig)
  erstelltAm: Timestamp;
}
```

## 🔐 Sicherheit & Datenschutz

### Öffentliche Datenbank
- ✅ **Alle Prompts sind öffentlich** - Ideal für Bildung
- ✅ **Keine persönlichen Daten** - Nur Codes gespeichert
- ✅ **Kein Account erforderlich** zum Lesen
- ✅ **Optionaler Login** zum Erstellen

### Login-System
- **Codes sind lokal gespeichert** (localStorage)
- **Keine E-Mail/Passwort** nötig
- **6-stelliger Code** (z.B. `A3K9X2`)
- **Automatischer Login** auf eigenen Geräten

### Best Practices
```javascript
// Production Firebase Rules (empfohlen)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prompts/{promptId} {
      allow read: if true;
      allow create: if request.resource.data.erstelltVon is string;
      allow update: if request.resource.data.erstelltVon == resource.data.erstelltVon;
      allow delete: if request.resource.data.erstelltVon == resource.data.erstelltVon;
    }
  }
}
```

## 🐛 Troubleshooting

### "Firebase is not configured"
- `.env.local` existiert?
- Alle Variablen beginnen mit `NEXT_PUBLIC_`?
- Server neu starten: `npm run dev`

### "Missing or insufficient permissions"
- Firestore Rules auf öffentlich lesen setzen
- Firebase Console überprüfen

### Gelöschte Prompts werden noch angezeigt
- **Dashboard**: Klick auf "🔄 Aktualisieren"
- **Hauptseite**: F5 / Seite neu laden
- **Ursache**: Firebase Real-time Cache

### Kann keine Prompts erstellen
- Bist du angemeldet? (🔐 Anmelden)
- "➕ Prompt erstellen" Button sichtbar?

### Kann fremde Prompts nicht bearbeiten
- ✅ **Das ist richtig!** - Nur eigene Prompts bearbeitbar
- Eigene Prompts haben "Dein Prompt" Badge
- Fremde Prompts: "📧 Melden" statt "🗑️ Löschen"

## 💰 Firebase Kosten

### Free Tier (Spark Plan)
- ✅ 50.000 Reads/Tag
- ✅ 20.000 Writes/Tag
- ✅ 1 GB Storage

**Für Schulen (< 200 Nutzer)**: Völlig ausreichend!

### Blaze Plan (Pay-as-you-go)
- ~$0.06 pro 100.000 Reads
- Für mittelgroße Schulen: < $2/Monat

## 📚 Projektstruktur

```
prompt-manager/
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin Dashboard (öffentlich)
│   ├── layout.tsx             # Root Layout
│   ├── page.tsx               # Hauptseite (öffentlich)
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

## 🎓 Für Bildungseinrichtungen

### Vorteile
- ✅ **Keine Accounts nötig** - Niedrige Einstiegshürde
- ✅ **Öffentlich zugänglich** - Alle können lernen
- ✅ **Einfache Codes** - Statt Passwörter
- ✅ **Kollaborativ** - Gemeinsame Bibliothek
- ✅ **Kostenlos** - Firebase Free Tier ausreichend

### Empfohlene Nutzung
1. **Lehrer**: Erstellen Beispiel-Prompts
2. **Schüler**: Durchsuchen, bewerten, nutzen
3. **Fortgeschrittene**: Erstellen eigene Prompts
4. **Alle**: Profitieren von gemeinsamer Bibliothek

## 🆘 Support

Bei Problemen:
1. README.md durchlesen
2. Troubleshooting-Sektion checken
3. Firebase Console überprüfen
4. GitHub Issue erstellen

---

**Version 3.0** - Öffentliche Bildungsplattform mit optionalem Login 🎓
