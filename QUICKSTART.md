# 🚀 Quick Start Guide - In 15 Minuten live!

## Was du bekommst
✅ Vollständig funktionsfähige Prompt-Manager-Webseite
✅ Responsive Design (Desktop + Mobile)
✅ **Cloud-Sync mit Firebase** - Zugriff von überall
✅ Echtzeit-Updates über alle Geräte
✅ Automatisches Deployment via GitHub + Vercel
✅ Kostenlos hosten

## Voraussetzungen
- [ ] GitHub Account ([kostenlos erstellen](https://github.com/join))
- [ ] Vercel Account ([kostenlos mit GitHub](https://vercel.com/signup))
- [ ] Google Account für Firebase ([google.com](https://google.com))
- [ ] Git installiert ([Download](https://git-scm.com/downloads))

---

## Schritt 1: Firebase einrichten (5 Minuten)

### ⚠️ WICHTIG: Firebase zuerst!
Firebase muss VOR dem Deployment eingerichtet werden.

**Siehe [FIREBASE_SETUP.md](FIREBASE_SETUP.md) für detaillierte Anleitung!**

### Schnell-Version:
1. Gehe zu [console.firebase.google.com](https://console.firebase.google.com)
2. "Projekt hinzufügen" → Name: `prompt-manager`
3. **Firestore Database** → "Datenbank erstellen" → **Testmodus**
4. **Web-App** (</>) registrieren → Config kopieren
5. Im Projekt: Erstelle `.env.local` mit deinen Firebase-Werten:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=dein-wert-hier
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dein-wert-hier
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dein-wert-hier
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dein-wert-hier
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=dein-wert-hier
NEXT_PUBLIC_FIREBASE_APP_ID=dein-wert-hier
```

✅ **Firebase läuft?** Weiter zu Schritt 2!

---

## Schritt 2: Lokal testen (2 Minuten)

```bash
# Im Projektordner
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

✅ Funktioniert? Super!
❌ Fehler? Siehe [FIREBASE_SETUP.md](FIREBASE_SETUP.md) Troubleshooting

---

## Schritt 3: Zu GitHub hochladen (3 Minuten)

### 1. Terminal öffnen
**Windows**: Rechtsklick im Ordner → "Git Bash Here"
**Mac/Linux**: Rechtsklick → "Terminal öffnen"

### 2. Hochladen
```bash
# Git initialisieren
git init

# Dateien hinzufügen (.env.local wird NICHT hochgeladen - ist in .gitignore)
git add .

# Ersten Commit
git commit -m "Initial commit"

# Mit GitHub verbinden (ersetze USERNAME/REPO)
git remote add origin https://github.com/USERNAME/REPO.git

# Hochladen
git branch -M main
git push -u origin main
```

**Noch kein GitHub Repo?**
1. [github.com/new](https://github.com/new)
2. Name: `prompt-manager`
3. "Create repository"
4. URL kopieren und oben nutzen

---

## Schritt 4: Auf Vercel deployen (4 Minuten)

1. Gehe zu [vercel.com/new](https://vercel.com/new)
2. "Continue with GitHub"
3. Wähle dein `prompt-manager` Repository
4. **WICHTIG - Environment Variables hinzufügen**:
   - Klicke **"Environment Variables"** aufklappen
   - Füge ALLE 6 Variablen einzeln hinzu:
   
   ```
   Name: NEXT_PUBLIC_FIREBASE_API_KEY
   Value: [dein-api-key]
   
   Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   Value: [dein-auth-domain]
   
   Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
   Value: [dein-project-id]
   
   Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   Value: [dein-storage-bucket]
   
   Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   Value: [deine-sender-id]
   
   Name: NEXT_PUBLIC_FIREBASE_APP_ID
   Value: [deine-app-id]
   ```

5. Klicke **"Deploy"**
6. Warte 1-2 Minuten ☕
7. **FERTIG!** 🎉

Du bekommst eine URL: `https://prompt-manager-xyz.vercel.app`

---

## Schritt 5: Testen (1 Minute)

1. Öffne deine Vercel-URL
2. Füge einen Prompt hinzu
3. Öffne die Seite auf einem anderen Gerät
4. → Der Prompt erscheint dort auch! 🔄

---

## Automatische Updates

Ab jetzt deployt jeder Push automatisch:

```bash
# Änderungen machen, dann:
git add .
git commit -m "Meine Änderung"
git push
```

Vercel updated automatisch in 1-2 Minuten!

---

## Häufige Probleme

### "Firebase is not configured"
➡️ Environment Variables in Vercel vergessen?
➡️ Lösung: Vercel Dashboard → Settings → Environment Variables → Alle hinzufügen → Redeploy

### "Missing or insufficient permissions"
➡️ Firestore nicht im Testmodus?
➡️ Lösung: Firebase Console → Firestore → Rules → "Testmodus starten"

### "git: command not found"
➡️ Git nicht installiert
➡️ Lösung: [git-scm.com/downloads](https://git-scm.com/downloads)

### Build Error auf Vercel
➡️ Environment Variables falsch
➡️ Lösung: Checke alle 6 Variablen in Vercel → müssen mit `NEXT_PUBLIC_` beginnen

### Prompts werden nicht gespeichert
➡️ Firebase Config falsch
➡️ Lösung: Öffne Browser Console (F12) → Checke Fehler → Siehe FIREBASE_SETUP.md

---

## Nächste Schritte

✅ App läuft? Awesome!

**Erweiterungen:**
- [ ] [Custom Domain](FIREBASE_SETUP.md) (optional)
- [ ] [Security Rules](FIREBASE_SETUP.md) anpassen (nach 30 Tagen)
- [ ] [Authentication](FIREBASE_SETUP.md) für private Prompts (optional)
- [ ] Eigenes Styling anpassen

---

## Support

📖 **Dokumentation**:
- [README.md](README.md) - Projekt-Übersicht
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Detaillierte Firebase-Anleitung
- [FEATURES.md](FEATURES.md) - Alle Features

🐛 **Probleme**:
- GitHub Issues erstellen
- Vercel Build Logs checken
- Firebase Console Logs checken

---

## Zeitplan

- ⏱️ Firebase Setup: 5 Minuten
- ⏱️ Lokal testen: 2 Minuten
- ⏱️ GitHub Upload: 3 Minuten
- ⏱️ Vercel Deploy: 4 Minuten
- ⏱️ Testen: 1 Minute

**Gesamt: ~15 Minuten** ⚡

---

## Fertig! 🎉

Deine Prompt-Manager-Webseite ist jetzt:
- ✅ Live im Internet
- ✅ Mit Cloud-Sync (Firebase)
- ✅ Echtzeit-Updates
- ✅ Auf GitHub versioniert
- ✅ Automatisch deployed (Vercel)
- ✅ Kostenlos gehostet

**Viel Erfolg mit deinen Prompts!** 🚀
