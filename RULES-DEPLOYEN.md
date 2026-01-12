# 🚀 Firebase Rules JETZT deployen

## Methode 1: Firebase Console (EINFACHSTE)

1. **Öffne Firebase Console:**
   ```
   https://console.firebase.google.com
   ```

2. **Wähle dein Projekt aus**

3. **Gehe zu Firestore Database** (linkes Menü)

4. **Klicke auf "Rules" (oben)**

5. **Kopiere den Inhalt von `firestore.rules`** und füge ihn ein

6. **Klicke "Publish"** ✅

---

## Methode 2: Firebase CLI

```bash
# Im Projektordner
firebase deploy --only firestore:rules
```

---

## ✅ Prüfen ob Rules aktiv sind:

1. Gehe zu Firebase Console → Firestore → Rules
2. Schaue ob dort steht:
   ```
   allow update: if 
     request.resource.data.erstelltVon == resource.data.erstelltVon &&
     request.resource.data.erstelltAm == resource.data.erstelltAm;
   ```

3. Wenn da steht `allow read, write: if true;` → **ALTE RULES!**

---

## 🎯 Das solltest du sehen:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prompts/{promptId} {
      allow read: if true;
      allow create: if [... lange Validierung ...]
      allow update: if 
        request.resource.data.erstelltVon == resource.data.erstelltVon &&
        request.resource.data.erstelltAm == resource.data.erstelltAm;
      allow delete: if false;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

**Wichtig:** Nach dem Deployen dauert es ca. 10 Sekunden bis die neuen Rules aktiv sind!
