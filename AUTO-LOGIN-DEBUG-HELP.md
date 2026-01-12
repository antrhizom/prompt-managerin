# 🔍 AUTO-LOGIN FUNKTIONIERT NICHT? DEBUG-ANLEITUNG

## ❌ Problem: Name lädt nicht automatisch beim Login mit bestehendem Code

---

## 🧪 SCHRITT 1: Browser Console öffnen

**Wichtig:** IMMER mit offener Console testen!

1. Öffne App: https://prompt-managerin.vercel.app
2. Drücke **F12** (oder Rechtsklick → "Untersuchen")
3. Klicke auf Tab **"Console"**

---

## 🧪 SCHRITT 2: Test durchführen

### Login mit bestehendem Code:

1. Klicke "🔑 Ich habe schon einen Code"
2. **Tippe Code ein:** z.B. `1ZBPQL`
3. **Schaue Console!**

---

## ✅ Was du sehen SOLLTEST (wenn es funktioniert):

```
🔄 Suche Name für Code: 1ZBPQL
🔍 Suche User mit Code: 1ZBPQL
✅ User gefunden: Dein Name
```

→ Name-Feld wird grün + disabled
→ Text: "✅ Name automatisch geladen: Dein Name"

---

## ❌ Fehlerfall 1: "User existiert noch nicht in Firebase"

```
🔄 Suche Name für Code: 1ZBPQL
🔍 Suche User mit Code: 1ZBPQL
⚠️ User existiert noch nicht in Firebase
```

**Problem:** User wurde beim ersten Login NICHT in Firebase gespeichert!

**Ursache:** Firebase Security Rules wurden nicht deployed!

**Lösung:**

### Via Firebase Console (EINFACH):

1. https://console.firebase.google.com
2. Projekt: `prompt-managerin`
3. Firestore Database → Rules
4. Prüfe ob `users` Collection existiert:
   ```javascript
   match /users/{userId} {
     allow read: if true;
     allow create: if ...;
   }
   ```
5. Falls NICHT → Kopiere Rules aus `firestore.rules` und Publish!

### Via CLI (wenn lokal entwickelst):

```bash
firebase deploy --only firestore:rules
```

---

## ❌ Fehlerfall 2: Permission Denied Error

```
❌ Fehler beim Laden des Users: FirebaseError: Missing or insufficient permissions
```

**Problem:** Firebase Rules blockieren Zugriff!

**Lösung:** Rules deployen (siehe oben)

---

## ❌ Fehlerfall 3: Keine Console Logs

**Problem:** Code läuft nicht / JavaScript Fehler

**Lösung:**
1. Schaue Console nach Fehlermeldungen (rot)
2. Hard Refresh: `Strg + Shift + R` (leert Cache)
3. Prüfe ob App aktuell deployed ist auf Vercel

---

## 🔧 LÖSUNG: User manuell in Firebase erstellen (TEST)

**Um zu testen ob es grundsätzlich funktioniert:**

1. Firebase Console → Firestore Database
2. Klicke "Start Collection"
3. Collection ID: `users`
4. Document ID: `1ZBPQL` (dein Test-Code)
5. Fields:
   - `username` (string): "Test User"
   - `createdAt` (timestamp): (aktuelles Datum)
6. Save

**Jetzt teste Login mit Code `1ZBPQL`:**
→ Name sollte jetzt laden!

---

## 📋 KOMPLETTE DIAGNOSE-CHECKLISTE:

### Check 1: Firebase Rules deployed?
```bash
firebase deploy --only firestore:rules
```

### Check 2: users Collection existiert in Firestore?
- Firebase Console → Firestore → Sollte "users" sehen

### Check 3: Test-User erstellen und testen
- Manuell User in Firebase erstellen (siehe oben)
- Mit Code einloggen → Name sollte laden

### Check 4: Browser Console zeigt Logs?
- F12 → Console Tab
- Bei Code-Eingabe sollten Logs erscheinen

### Check 5: Neuestes Deployment?
- Vercel Dashboard checken
- Letztes Deployment sollte erfolgreich sein

---

## 🎯 MOST LIKELY PROBLEM:

**Firebase Security Rules wurden nicht deployed!**

**Quick-Fix:**

1. Gehe zu: https://console.firebase.google.com/project/prompt-managerin/firestore/rules
2. Kopiere komplett aus deiner lokalen `firestore.rules` Datei
3. Paste in Firebase Console
4. Klicke "Publish"
5. Warte 10 Sekunden
6. Teste nochmal!

---

## ✅ So weißt du dass es funktioniert:

### In Firestore Console:
```
users/
  1ZBPQL/
    username: "Max Mustermann"
    createdAt: 2026-01-12T...
```

### Im Browser Console:
```
✅ User gefunden: Max Mustermann
```

### In der App:
- Name-Feld ist grün
- Name ist drin und disabled
- Text: "✅ Name automatisch geladen: Max Mustermann"

---

## 🆘 Immer noch Probleme?

**Schicke mir Screenshots von:**

1. Browser Console (F12) beim Login-Versuch
2. Firebase Console → Firestore → users Collection
3. Firebase Console → Firestore → Rules

**Dann kann ich genau sehen wo das Problem ist!**

---

## 💡 Workaround (falls es gar nicht geht):

**User localStorage statt Firebase:**

Das ist nicht ideal, aber als Backup:

```javascript
// Im handleLoginAbschliessen nach Zeile 319:
localStorage.setItem(`user_${userCode}`, username.trim());

// Im checkAndLoadUser ändern zu:
const savedName = localStorage.getItem(`user_${code}`);
if (savedName) return savedName;
```

→ Dann wird Name im Browser gespeichert
→ Funktioniert nur auf gleichem Gerät/Browser
→ Aber besser als nichts!

---

**Die wahrscheinlichste Lösung: Firebase Rules deployen! 🚀**
