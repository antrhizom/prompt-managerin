# ⚠️ WARUM LÄDT DER NAME NICHT AUTOMATISCH?

## 🎯 Das Hauptproblem: Firebase Security Rules!

**Wenn das Namensfeld IMMER erscheint, dann funktioniert Auto-Login nicht!**

---

## 🔍 Ursache:

Der User existiert NICHT in der Firebase `users` Collection!

**Warum nicht?**
→ Firebase Security Rules wurden **NICHT deployed!**

**Ohne Rules:**
- App kann User NICHT in Firebase speichern
- App kann User NICHT aus Firebase laden
- Name muss immer manuell eingegeben werden ❌

**Mit Rules:**
- App speichert User beim ersten Login ✅
- App lädt Name beim zweiten Login ✅
- Namensfeld verschwindet, grüne Box erscheint ✅

---

## ✅ LÖSUNG: Firebase Rules deployen

### SCHRITT 1: Öffne Firebase Console

```
https://console.firebase.google.com/project/prompt-managerin/firestore/rules
```

### SCHRITT 2: Kopiere diese Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /prompts/{promptId} {
      allow read: if true;
      allow create: if 
        request.resource.data.titel is string &&
        request.resource.data.titel.size() >= 1 &&
        request.resource.data.titel.size() <= 200 &&
        request.resource.data.promptText is string &&
        request.resource.data.promptText.size() >= 1 &&
        request.resource.data.promptText.size() <= 10000 &&
        request.resource.data.erstelltVon is string &&
        request.resource.data.erstelltVon.size() >= 6 &&
        request.resource.data.erstelltVon.size() <= 20 &&
        request.resource.data.erstelltAm is timestamp &&
        request.resource.data.plattformenUndModelle is map &&
        request.resource.data.outputFormate is list &&
        request.resource.data.anwendungsfaelle is list;
      allow update: if 
        request.resource.data.erstelltVon == resource.data.erstelltVon &&
        request.resource.data.erstelltAm == resource.data.erstelltAm;
      allow delete: if false;
    }
    
    // ⬇️⬇️⬇️ DAS HIER IST WICHTIG FÜR AUTO-LOGIN! ⬇️⬇️⬇️
    match /users/{userId} {
      allow read: if true;
      allow create: if 
        request.resource.data.username is string &&
        request.resource.data.username.size() >= 1 &&
        request.resource.data.username.size() <= 100 &&
        request.resource.data.createdAt is timestamp;
      allow update: if 
        request.resource.data.username is string &&
        request.resource.data.username.size() >= 1 &&
        request.resource.data.username.size() <= 100;
      allow delete: if false;
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### SCHRITT 3: In Firebase einfügen

1. Alles markieren (Strg+A)
2. Löschen (Entf)
3. Rules einfügen (Strg+V)
4. **"Veröffentlichen"** klicken
5. Warten 10 Sekunden

### SCHRITT 4: Testen!

1. **F12 drücken** (Console öffnen)
2. **Neuen User erstellen:**
   - Login → "Neuen Account erstellen"
   - Code wird generiert
   - Name eingeben
   - Erstellen
3. **Console sollte zeigen:**
   ```
   💾 Speichere User: ABC123 Max Mustermann
   ✅ User erfolgreich gespeichert!
   ```
4. **Logout**
5. **Login mit gleichem Code:**
   - Console zeigt: `✅ User gefunden: Max Mustermann`
   - **Namensfeld verschwindet!**
   - **Grüne Box erscheint:** "✅ Angemeldet als: Max Mustermann"

---

## 📋 So erkennst du ob Rules deployed sind:

### In Firebase Console:
```
Firestore Database → Rules → Sollte "users" Collection sehen
```

### In App Console (F12):
**Wenn Rules NICHT deployed:**
```
⚠️ User existiert noch nicht in Firebase
```
oder
```
❌ Missing or insufficient permissions
```

**Wenn Rules deployed:**
```
✅ User gefunden: Max Mustermann
```

### In Firestore Database:
```
users/
  ABC123/
    username: "Max Mustermann"
    createdAt: 2026-01-12...
```

---

## 🎯 Zusammenfassung:

```
PROBLEM: Namensfeld erscheint immer
    ↓
URSACHE: Firebase Rules nicht deployed
    ↓
LÖSUNG: Rules copy & paste in Firebase Console
    ↓
RESULTAT: Auto-Login funktioniert! ✅
```

---

## 💡 Nach Rules Deployment:

**Beim ersten Login:**
- Code wird generiert: `ABC123`
- Name eingeben: "Max"
- → Wird in Firebase gespeichert ✅

**Beim zweiten Login:**
- Code eingeben: `ABC123`
- → Name lädt automatisch: "Max" ✅
- → **Namensfeld verschwindet!**
- → Grüne Box: "✅ Angemeldet als: Max"

---

## 🚨 WICHTIG:

**Ohne Firebase Rules funktioniert Auto-Login NICHT!**

Das ist der häufigste Grund warum es nicht klappt!

**Deploy die Rules JETZT!** 🚀

```
https://console.firebase.google.com/project/prompt-managerin/firestore/rules
```
