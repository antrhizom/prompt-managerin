# 🐛 Auto-Login Name DEBUG

## Problem: Name wird nicht automatisch geladen

### ✅ So sollte es funktionieren:

1. **Erster Login mit neuem Code:**
   ```
   Login → "Neuen Account erstellen"
   → Code: ABC123
   → Name eingeben: "Max Mustermann"
   → Account erstellen
   → ✅ User wird in Firebase gespeichert
   ```

2. **Zweiter Login mit gleichem Code:**
   ```
   Login → "Ich habe schon einen Code"
   → Code eingeben: ABC123
   → ✅ Name "Max Mustermann" lädt automatisch!
   ```

---

## 🔍 DEBUG - Browser Console öffnen

### Schritt 1: Console öffnen

**Chrome/Edge:**
- `F12` oder `Rechtsklick → Untersuchen`
- Tab "Console"

**Firefox:**
- `F12` oder `Rechtsklick → Element untersuchen`
- Tab "Konsole"

### Schritt 2: Neuen User erstellen

1. Login → "Neuen Account erstellen"
2. Code wird generiert: z.B. `XYZ789`
3. Name eingeben: "Test User"
4. Klicke "Account erstellen"

**In Console solltest du sehen:**
```
💾 Speichere User: XYZ789 Test User
✅ User erfolgreich gespeichert!
```

### Schritt 3: Logout & Wieder einloggen

1. Logout
2. Login → "Ich habe schon einen Code"
3. Code eingeben: `XYZ789`

**In Console solltest du sehen:**
```
🔄 Lade Name für Code: XYZ789
🔍 Suche User mit Code: XYZ789
✅ User gefunden: Test User
✅ Name automatisch geladen: Test User
```

**Im Formular:**
- Name-Feld sollte grün sein
- Text: "Test User"
- Hinweis: "✅ Name automatisch geladen"

---

## ❌ Fehler-Szenarien

### Fall 1: "User existiert noch nicht in Firebase"

**Console zeigt:**
```
🔍 Suche User mit Code: ABC123
⚠️ User existiert noch nicht in Firebase
ℹ️ Kein gespeicherter Name - bitte eingeben
```

**Bedeutet:**
- User wurde beim ersten Login NICHT gespeichert
- Prüfe Firebase Console → Firestore → Collection `users`
- Sollte dort sein: `users/ABC123/username: "..."`

**Lösung:**
- Firebase Rules deployed? (`firebase deploy --only firestore:rules`)
- Neuen User erstellen und in Console prüfen ob "User erfolgreich gespeichert" kommt

### Fall 2: "Permission denied"

**Console zeigt:**
```
❌ Fehler beim Laden des Users: FirebaseError: Missing or insufficient permissions
```

**Bedeutet:**
- Firebase Rules blockieren das Lesen
- Rules NICHT deployed!

**Lösung:**
```bash
firebase deploy --only firestore:rules
```

Oder in Firebase Console:
1. Firestore → Rules
2. Prüfe ob Section `users/{userId}` existiert
3. Sollte sein: `allow read: if true;`

### Fall 3: Nichts passiert

**Console zeigt:**
- Gar nichts

**Bedeutet:**
- useEffect wird nicht getriggert
- Prüfe: Bist du wirklich im "Ich habe schon einen Code" Modus?
- Prüfe: Ist der Code mindestens 6 Zeichen lang?

**Lösung:**
- F5 (Seite neu laden)
- Code erneut eingeben
- Schaue ob Console-Meldung kommt

---

## 🔧 Firebase Console prüfen

### Prüfe ob Users gespeichert werden:

1. https://console.firebase.google.com
2. Dein Projekt
3. Firestore Database
4. Solltest sehen:

```
prompts/          ← Deine Prompts
users/            ← 👈 DIESE COLLECTION MUSS EXISTIEREN!
  ├─ ABC123/
  │   ├─ username: "Max Mustermann"
  │   └─ createdAt: ...
  └─ XYZ789/
      ├─ username: "Test User"
      └─ createdAt: ...
```

**Wenn Collection `users` NICHT existiert:**
→ Users werden nicht gespeichert!
→ Prüfe Console-Logs beim Login

---

## 📝 Test-Szenario

### Vollständiger Test:

1. **Öffne Browser Console** (F12)

2. **Erstelle neuen User:**
   - Login → "Neuen Account erstellen"
   - Code: (wird generiert)
   - Name: "Debug Test"
   - Klicke "Account erstellen"
   - **Prüfe Console:** "✅ User erfolgreich gespeichert!"

3. **Prüfe Firebase:**
   - Firebase Console → Firestore
   - Schaue ob `users/DEIN-CODE` existiert

4. **Logout:**
   - Klicke Logout (👋)

5. **Login mit bestehendem Code:**
   - Login → "Ich habe schon einen Code"
   - Gib DEINEN-CODE ein
   - **Prüfe Console:** "✅ Name automatisch geladen: Debug Test"
   - **Prüfe Formular:** Name-Feld grün + "Debug Test" drin

---

## ✅ Erfolg!

Wenn du siehst:
- ✅ "User erfolgreich gespeichert"
- ✅ "Name automatisch geladen"
- ✅ Grünes Name-Feld

→ **Alles funktioniert!** 🎉

---

## 💡 Häufige Ursachen:

1. **Firebase Rules nicht deployed**
   → `firebase deploy --only firestore:rules`

2. **User wird nicht gespeichert**
   → Schaue Console beim ersten Login
   → Muss zeigen: "✅ User erfolgreich gespeichert"

3. **useEffect wird nicht getriggert**
   → Modus muss "Ich habe schon einen Code" sein
   → Code muss mindestens 6 Zeichen sein

4. **Browser Cache**
   → Strg+Shift+Delete → Cache leeren
   → Oder Inkognito-Fenster testen

---

## 🆘 Wenn nichts hilft:

Schicke mir diese Infos:
1. Screenshot der Browser Console
2. Screenshot von Firebase Console → Firestore → users
3. Welcher Code wird verwendet?
4. Was steht in der Console?
