# 🔒 Firebase Security Rules

## ⚠️ WICHTIG: Strenge Sicherheitsregeln

Die neuen Security Rules schützen deine Datenbank vor:
- ❌ Unbefugtem Löschen
- ❌ Manipulation fremder Prompts
- ❌ Ungültigen Daten
- ❌ SQL-Injection-ähnlichen Angriffen

---

## 📋 Was die Rules erlauben:

### ✅ LESEN (READ)
- **Jeder** kann Prompts lesen (öffentliche App)

### ✅ ERSTELLEN (CREATE)
- Nur mit **gültigen Pflichtfeldern**
- Validierung aller Datentypen:
  - Titel: 1-200 Zeichen
  - Prompt-Text: 1-10.000 Zeichen
  - Beschreibung: max. 500 Zeichen
  - Kommentar: max. 500 Zeichen
  - Mindestens 1 Plattform
  - Mindestens 1 Output-Format
  - Mindestens 1 Anwendungsfall

### ✅ BEARBEITEN (UPDATE)
**Fall 1: Eigener Prompt**
- Nur wenn `erstelltVon` gleich bleibt
- Pflichtfelder müssen vorhanden sein
- `erstelltAm` kann nicht geändert werden

**Fall 2: Soft Delete**
- Setzt `deleted: true` statt echtem Löschen
- Fügt `deletedAt` und `deletedBy` hinzu

**Fall 3: Bewertungen**
- Jeder kann bewerten

**Fall 4: Nutzungsanzahl**
- Jeder kann um max. +1 erhöhen

**Fall 5: Meldungen**
- Jeder kann `deletionRequests` hinzufügen

### ❌ LÖSCHEN (DELETE)
- **Verboten!** Nur Admin kann in Firebase Console löschen
- Nutzer verwenden "Soft Delete" (`deleted: true`)

---

## 🚀 Security Rules deployen

### 1. Firebase CLI installieren
```bash
npm install -g firebase-tools
```

### 2. Login
```bash
firebase login
```

### 3. Projekt initialisieren (falls noch nicht)
```bash
firebase init firestore

# Wähle:
# - Use existing project
# - Firestore Rules: firestore.rules
# - Firestore Indexes: firestore.indexes.json
```

### 4. Rules deployen
```bash
firebase deploy --only firestore:rules
```

Du siehst dann:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/...
```

---

## 🧪 Rules testen

### Test 1: Lesen ✅
```javascript
// Sollte funktionieren
const prompts = await getDocs(collection(db, 'prompts'));
```

### Test 2: Erstellen ohne Pflichtfelder ❌
```javascript
// Sollte fehlschlagen
await addDoc(collection(db, 'prompts'), {
  titel: 'Test'
  // Fehler: Missing required fields
});
```

### Test 3: Fremden Prompt bearbeiten ❌
```javascript
// Sollte fehlschlagen
await updateDoc(doc(db, 'prompts', 'fremder-prompt'), {
  titel: 'Geänderter Titel'
  // Fehler: Permission denied
});
```

### Test 4: Eigenen Prompt löschen (Soft Delete) ✅
```javascript
// Sollte funktionieren
await updateDoc(doc(db, 'prompts', 'eigener-prompt'), {
  deleted: true,
  deletedAt: serverTimestamp(),
  deletedBy: userCode
});
```

### Test 5: Direkt löschen ❌
```javascript
// Sollte fehlschlagen
await deleteDoc(doc(db, 'prompts', 'prompt-id'));
// Fehler: Permission denied
```

---

## 🔍 Firebase Console öffnen

```bash
firebase open
# Wähle: Firestore Database
```

Oder direkt: https://console.firebase.google.com

---

## ⚠️ Wichtige Hinweise

### Soft Delete statt Hard Delete
- Die App löscht Prompts nicht mehr direkt
- Stattdessen wird `deleted: true` gesetzt
- Gelöschte Prompts werden **automatisch ausgeblendet**
- Admin kann in Firebase Console endgültig löschen

### Ohne Firebase Authentication
- Die Rules sind **nicht perfekt sicher** ohne echtes Auth
- Empfehlung: Später Firebase Authentication einbauen
- Aktuell: Rules schützen vor den meisten Angriffen

### Admin-Zugriff
- Admin muss in **Firebase Console** löschen
- Oder: Firebase Admin SDK verwenden
- Normale Nutzer können nicht direkt löschen

---

## 📊 Rules Struktur

```
firestore.rules
├── prompts/{promptId}
│   ├── read: ✅ Alle
│   ├── create: ✅ Mit Validierung
│   ├── update: ✅ 5 Fälle
│   │   ├── Eigener Prompt bearbeiten
│   │   ├── Soft Delete
│   │   ├── Bewertungen
│   │   ├── Nutzungsanzahl
│   │   └── Meldungen
│   └── delete: ❌ Verboten
└── ** (alle anderen): ❌ Verboten
```

---

## 🐛 Fehlerbehandlung

**Fehler: "Missing or insufficient permissions"**
→ Rules wurden noch nicht deployed oder sind zu streng

**Fehler: "Document does not exist"**
→ Prompt wurde (soft) gelöscht oder existiert nicht

**Fehler: "PERMISSION_DENIED"**
→ Du versuchst etwas zu tun, das die Rules verbieten

---

## ✅ Deployment Checklist

- [ ] `firebase login` ausgeführt
- [ ] `firebase init firestore` ausgeführt
- [ ] `firestore.rules` Datei vorhanden
- [ ] `firebase deploy --only firestore:rules` ausgeführt
- [ ] Rules in Firebase Console überprüft
- [ ] App getestet (Lesen, Erstellen, Bearbeiten)

---

## 🔐 Sicherheits-Level

**Aktuell: Mittel** 🟡
- ✅ Validierung aller Felder
- ✅ Soft Delete statt Hard Delete
- ✅ Meldungen ohne Löschen
- ⚠️ Ohne echtes Authentication

**Zukünftig: Hoch** 🟢
- Firebase Authentication einbauen
- `request.auth.uid` verwenden
- Token-basierte Validierung

---

**Jetzt sind deine Daten besser geschützt! 🔒**
