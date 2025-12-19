# ⚡ Firebase Functions Schnellstart

## In 15 Minuten zu Email-Benachrichtigungen!

---

## Schritt 1: Blaze Plan (2 Min)

1. [Firebase Console](https://console.firebase.google.com) → `prompt-managerin`
2. Links unten: **"Upgrade"** → **"Blaze Plan"**
3. Kreditkarte hinzufügen
4. Optional: **Budget Alert** setzen (5€/Monat)

💰 **Kostenlos bis 2 Mio Aufrufe/Monat** (für Schulen immer kostenlos!)

---

## Schritt 2: Gmail App-Passwort (3 Min)

1. [myaccount.google.com/security](https://myaccount.google.com/security)
2. **2-Faktor-Auth** aktivieren (falls nicht schon)
3. [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. App: "Mail", Gerät: "Other" → "Prompt Manager"
5. **Kopiere das 16-stellige Passwort!** (z.B. `abcd efgh ijkl mnop`)

---

## Schritt 3: Code konfigurieren (2 Min)

### Öffne `functions/index.js`

**Zeile 12-17:** Ersetze:

```javascript
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: 'schule.prompts@gmail.com',     // <-- DEINE GMAIL
    pass: 'abcd efgh ijkl mnop'            // <-- DEIN APP-PASSWORT
  }
};

const ADMIN_EMAIL = 'direktor@meine-schule.ch'; // <-- ADMIN-EMAIL
```

**Speichern!**

---

## Schritt 4: Zu GitHub (1 Min)

```bash
git add .
git commit -m "Add Firebase Functions"
git push
```

---

## Schritt 5: Firebase CLI (2 Min)

```bash
# Installieren (falls noch nicht)
npm install -g firebase-tools

# Login
firebase login
```

---

## Schritt 6: Deployen (5 Min)

```bash
# Im prompt-manager Verzeichnis

# Dependencies installieren
cd functions
npm install
cd ..

# Functions deployen
firebase deploy --only functions
```

⏳ **Warte 2-3 Minuten...**

---

## Schritt 7: Testen! (1 Min)

1. Gehe zu deiner App
2. Versuche fremden Prompt zu löschen (🚫 Button)
3. Bestätige Löschanfrage

**Check deine Admin-Email!** ✉️

---

## ✅ Fertig!

Du bekommst jetzt automatisch Emails bei jeder Löschanfrage mit:
- 📧 Professionelles HTML-Design
- 📊 Alle Prompt-Details
- 🔗 Link zur App

**Bonus:** Jeden Tag um 9 Uhr ein Report über alle ausstehenden Anfragen!

---

## Troubleshooting

### Keine Email?

```bash
# Logs checken
firebase functions:log
```

**Häufigste Fehler:**
- App-Passwort falsch → Neu generieren
- Admin-Email falsch → In `functions/index.js` korrigieren
- Blaze Plan nicht aktiviert → Upgrade machen

### Detaillierte Hilfe

Siehe **FIREBASE_FUNCTIONS_SETUP.md** für ausführliche Anleitung!

---

## Commands

```bash
# Logs ansehen
firebase functions:log

# Functions auflisten  
firebase functions:list

# Erneut deployen
firebase deploy --only functions
```

---

**Du hast es geschafft!** 🎉
