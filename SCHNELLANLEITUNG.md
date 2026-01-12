# 🚀 Schnellanleitung (15 Minuten)

## 1. Firebase Setup (5 Min)

1. **Firebase Projekt erstellen**: [console.firebase.google.com](https://console.firebase.google.com)
   - "Projekt hinzufügen" → Name eingeben → Erstellen

2. **Web-App registrieren**:
   - Web-Icon (`</>`) → App-Name → Registrieren
   - **Config-Werte kopieren** (brauchst du in Schritt 3!)

3. **Firestore aktivieren**:
   - "Firestore Database" → "Datenbank erstellen"
   - "Testmodus" → Standort: `europe-west` → Aktivieren

4. **Sicherheitsregeln** (Tab "Regeln"):
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
Klicke "Veröffentlichen"

## 2. Lokale Installation (3 Min)

```bash
# 1. Projekt-Ordner öffnen
cd prompt-manager

# 2. Dependencies installieren
npm install

# 3. .env.local erstellen
cp .env.local.template .env.local
```

**Öffne `.env.local` und füge deine Firebase-Werte ein:**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=dein-key-hier
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dein-projekt-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 3. Lokal testen (2 Min)

```bash
npm run dev
```

Öffne: [http://localhost:3000](http://localhost:3000)

**Teste das neue Login-System:**
1. **Automatischer Code** wird generiert (z.B. `A3K9X2`)
2. **Name eingeben** (z.B. "Max Mustermann")
3. **"Los geht's!" klicken**
4. **Prompt erstellen** und testen
5. **Seite neu laden** → Du bist automatisch eingeloggt! ✅

**Code-Sharing testen:**
1. Notiere dir deinen Code (steht im Header)
2. Browser-Daten löschen oder Inkognito-Fenster öffnen
3. "Code ändern" klicken
4. Deinen notierten Code eingeben
5. Du siehst die gleichen Prompts! 🎉

## 4. GitHub hochladen (2 Min)

```bash
# 1. Git initialisieren (falls noch nicht geschehen)
git init
git add .
git commit -m "Initial commit"

# 2. GitHub Repository erstellen (auf github.com)
# 3. Remote hinzufügen und pushen
git remote add origin https://github.com/DEIN-USERNAME/DEIN-REPO.git
git push -u origin main
```

## 5. Vercel Deployment (3 Min)

1. **Gehe zu** [vercel.com/new](https://vercel.com/new)

2. **GitHub verbinden:**
   - "Import Git Repository"
   - Dein Repository auswählen
   - "Import" klicken

3. **Environment Variables setzen:**
   - Alle Werte aus `.env.local` eingeben
   - **WICHTIG**: Namen exakt übernehmen (mit `NEXT_PUBLIC_`)
   
   Variablen:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY = dein-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = dein-projekt.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID = dein-projekt-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = dein-projekt.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 123456789
   NEXT_PUBLIC_FIREBASE_APP_ID = 1:123456789:web:abcdef
   ```

4. **Deploy klicken** → Warte 2 Minuten → **Fertig!** 🎉

## ✅ Checkliste

- [ ] Firebase Projekt erstellt
- [ ] Firestore aktiviert
- [ ] Sicherheitsregeln gesetzt
- [ ] `.env.local` konfiguriert
- [ ] Lokal getestet
- [ ] Auf GitHub gepusht
- [ ] Auf Vercel deployed
- [ ] Environment Variables in Vercel gesetzt

## 🎯 Nächste Schritte

- **Team-Code teilen**: Alle mit gleichem Code sehen gleiche Prompts
- **Prompts erstellen**: Mindestens Titel, Text, Plattform, Format, Anwendungsfall
- **Bewerten & Nutzen**: Emojis klicken, "Kopieren" nutzt

## 🆘 Probleme?

### Fehler: "Firebase is not configured"
→ `.env.local` überprüfen, Server neu starten (`npm run dev`)

### Fehler: "Missing permissions"
→ Firestore Rules auf `allow read, write: if true;` setzen

### Build schlägt fehl
→ `rm -rf node_modules && npm install && npm run build`

### Environment Variables in Vercel vergessen
→ Settings → Environment Variables → Alle hinzufügen → Redeploy

---

**Geschafft? Glückwunsch!** 🎉

Deine App läuft jetzt unter: `https://dein-projekt.vercel.app`
