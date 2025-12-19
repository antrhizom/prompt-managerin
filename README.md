# Prompt Manager 📝

Eine interaktive Webseite zum Sammeln, Bewerten und Verwalten erfolgreicher KI-Prompts mit **Cloud-Sync über Firebase**.

## Features ✨

- **Prompts hinzufügen**: Speichere deine erfolgreichen Prompts mit Tags und Kommentaren
- **Emoji-Bewertungen**: Bewerte Prompts mit 5 verschiedenen Emojis (👍 ❤️ 🔥 ⭐ 💡)
- **Nutzungszähler**: Tracke, wie oft du jeden Prompt verwendet hast
- **Intelligente Suche**: Durchsuche Prompts, Tags und Kommentare
- **Flexible Sortierung**: Sortiere nach Nutzung, Bewertung oder Aktualität
- **🔄 Echtzeit-Sync**: Änderungen erscheinen sofort auf allen Geräten
- **☁️ Cloud-Speicherung**: Zugriff von überall, automatisches Backup
- **Responsive Design**: Funktioniert auf Desktop und Mobile
- **Dark Mode**: Automatische Anpassung an dein System-Theme

## Schnellstart 🚀

### 1. Projekt herunterladen
```bash
# Entpacke prompt-manager.zip
# Oder clone von GitHub
git clone https://github.com/USERNAME/prompt-manager.git
cd prompt-manager
```

### 2. Firebase einrichten (5 Minuten)
Siehe **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** für detaillierte Anleitung!

**Kurzversion**:
1. Firebase Projekt erstellen auf [console.firebase.google.com](https://console.firebase.google.com)
2. Firestore Database aktivieren (Testmodus)
3. Web-App Config kopieren
4. `.env.local` erstellen mit deinen Firebase-Werten

### 3. Lokal testen
```bash
npm install
npm run dev
```
Öffne [http://localhost:3000](http://localhost:3000)

### 4. Auf Vercel deployen
```bash
# Code zu GitHub pushen
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# Auf vercel.com/new importieren
# Environment Variables hinzufügen (aus .env.local)
# Deploy klicken!
```

**Siehe [QUICKSTART.md](QUICKSTART.md) für Schritt-für-Schritt Anleitung!**

## Technologie-Stack 💻

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Sprache**: TypeScript
- **Database**: Firebase Firestore
- **Hosting**: Vercel
- **Features**: Echtzeit-Sync, Cloud-Speicherung

## Verwendung 📖

1. **Prompt hinzufügen**: Fülle das Formular aus und klicke auf "Prompt hinzufügen"
2. **Prompts bewerten**: Klicke auf die Emoji-Buttons
3. **Nutzung tracken**: Klicke auf "Verwendet", wenn du den Prompt nutzt
4. **Suchen**: Nutze die Suchleiste für schnellen Zugriff
5. **Sortieren**: Wähle die gewünschte Sortierung aus
6. **Geräteübergreifend**: Änderungen erscheinen automatisch auf allen Geräten

## Automatisches Deployment 🔄

Jeder Push zu GitHub triggert automatisch ein neues Deployment auf Vercel:

```bash
git add .
git commit -m "Update prompts"
git push
```

## Lizenz 📄

MIT License - Nutze das Projekt frei für deine Zwecke!

## Support 💬

Bei Fragen oder Problemen erstelle ein Issue auf GitHub.
