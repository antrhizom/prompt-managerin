# Prompt Manager für Bildung 🎓

## Spezielle Features für den Bildungsbereich

Diese Version des Prompt Managers ist speziell für Lehrer:innen und Bildungseinrichtungen optimiert.

---

## Neue Features

### 1. 📚 Praxisorientierte Anwendungsbereiche

Statt klassischer Fächer-Kategorien haben wir **praxisorientierte Anwendungsbereiche**:

- **Unterrichtsplanung** - Prompts für Stundenplanung, Jahresplanung
- **Differenzierung** - Anpassung für verschiedene Lernniveaus
- **Feedback & Bewertung** - Bewertungsraster, konstruktives Feedback
- **Elternkommunikation** - Elternbriefe, Gesprächsleitfäden
- **Klassenmanagement** - Klassenregeln, Konfliktlösung
- **Material-Erstellung** - Arbeitsblätter, Präsentationen
- **Lernziele formulieren** - Kompetenzorientierte Lernziele
- **Projektarbeit** - Projektideen, Bewertungskriterien
- **Inklusion & Förderung** - Individuelle Förderung, Nachteilsausgleich
- **Digitale Tools** - Integration von EdTech
- **Prüfungen erstellen** - Tests, Klausuren, mündliche Prüfungen
- **Konfliktlösung** - Mediation, Klassenrat
- **Motivation** - Motivationsstrategien, Gamification
- **Kreative Aufgaben** - Kreativitätsfördernde Aufgaben
- **Sonstiges** - Alles andere

Diese Kategorien sind **pflichtfelder** beim Erstellen eines Prompts.

---

### 2. 👤 User-System

#### Beim ersten Besuch:
- User wird nach seinem Namen gefragt
- Name wird lokal gespeichert (localStorage)
- Jeder Prompt wird dem Ersteller zugeordnet

#### Vorteile:
- Jeder weiß, wer welchen Prompt erstellt hat
- Autor kann seine eigenen Prompts bearbeiten/löschen
- Community-Gefühl durch Namens-Anzeige

#### Namen ändern:
```javascript
// Im Browser Console (F12):
localStorage.removeItem('userId');
localStorage.removeItem('userName');
// Seite neu laden
```

---

### 3. 🗑️ Intelligente Löschrechte

#### Eigene Prompts:
- **Direktes Löschen**: Du kannst deine eigenen Prompts sofort löschen
- Symbol: 🗑️ (Mülleimer)

#### Fremde Prompts:
- **Löschanfrage stellen**: Andere Prompts können nicht direkt gelöscht werden
- Symbol: 🚫 (Verboten)
- Löschanfrage wird im System gespeichert
- Admin-Email wird benachrichtigt (Log in Console)
- Anzahl der Löschanfragen wird angezeigt

#### Admin-Email konfigurieren:
In `app/page.tsx` Zeile ~86:
```typescript
const ADMIN_EMAIL = 'deine-admin-email@schule.de';
```

Für echte Email-Benachrichtigungen brauchst du eine Firebase Cloud Function (siehe unten).

---

### 4. 💬 Kommentar-Funktion

#### Features:
- Alle User können Kommentare zu jedem Prompt hinzufügen
- Kommentare zeigen Author und Datum
- Kommentare sind einklappbar (💬 Kommentare (X) ▶)
- Echtzeit-Sync über Firebase

#### Use Cases:
- "Habe das mit 7. Klasse ausprobiert - super!"
- "Funktioniert auch für Englisch-Unterricht"
- "Tipp: Mit Beispielen ergänzen"
- Fragen stellen
- Erfahrungen teilen

---

## Workflow-Beispiele

### Beispiel 1: Lehrkraft erstellt Prompt

```
1. Besucht die Seite → Gibt Namen ein: "Frau Müller"
2. Klickt "Neuen Prompt hinzufügen"
3. Wählt "Differenzierung"
4. Prompt: "Erstelle 3 Versionen dieser Aufgabe..."
5. Tags: "Mathe, Klasse 5, Bruchrechnung"
6. Beschreibung: "Funktioniert super für heterogene Gruppen"
7. Speichert
```

### Beispiel 2: Kollege findet Prompt hilfreich

```
1. Sucht nach "Differenzierung"
2. Findet Frau Müllers Prompt
3. Klickt "Verwendet" (Counter +1)
4. Bewertet mit ❤️
5. Schreibt Kommentar: "Habe das gestern ausprobiert - klasse!"
```

### Beispiel 3: Problematischer Prompt

```
1. Herr Schmidt findet einen unpassenden Prompt
2. Klickt auf 🚫 (Löschanfrage)
3. Bestätigt Anfrage
4. Admin wird benachrichtigt
5. System zeigt: "⚠️ 1 Löschanfrage(n) ausstehend"
```

---

## Sicherheit & Datenschutz

### Was wird gespeichert?

#### In Firebase (Cloud):
- Prompt-Text
- Tags, Kategorie, Beschreibung
- Bewertungen & Nutzungszähler
- **User-Name des Erstellers** (nicht Email!)
- **User-ID** (anonymisiert)
- Kommentare mit Namen

#### Lokal im Browser:
- User-ID (zufällig generiert)
- User-Name (frei wählbar)

### Datenschutz-Tipps:

1. **Keine Klarnamen erzwingen**: User können Pseudonyme wählen
2. **Keine persönlichen Daten in Prompts**: Achte darauf in Schulungen
3. **Firestore Rules anpassen** (siehe unten)
4. **DSGVO-konform**: Keine Email-Adressen erforderlich

---

## Firebase Security Rules für Schulen

### Empfohlene Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prompts/{promptId} {
      // Jeder kann lesen
      allow read: if true;
      
      // Nur authentifizierte Requests
      allow create: if request.resource.data.userName is string
                    && request.resource.data.userId is string
                    && request.resource.data.category in [
                      'Unterrichtsplanung', 'Differenzierung', 
                      'Feedback & Bewertung', 'Elternkommunikation',
                      'Klassenmanagement', 'Material-Erstellung',
                      'Lernziele formulieren', 'Projektarbeit',
                      'Inklusion & Förderung', 'Digitale Tools',
                      'Prüfungen erstellen', 'Konfliktlösung',
                      'Motivation', 'Kreative Aufgaben', 'Sonstiges'
                    ];
      
      // Update nur für Ratings, Usage, Comments, Deletion Requests
      allow update: if true;
      
      // Löschen nur vom Ersteller oder Admin
      allow delete: if request.auth != null; // TODO: Admin-Check hinzufügen
    }
  }
}
```

---

## Email-Benachrichtigungen einrichten

### Firebase Cloud Function für Löschanfragen:

1. **Firebase Functions aktivieren**:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init functions
   ```

2. **Function erstellen** (`functions/index.js`):
   ```javascript
   const functions = require('firebase-functions');
   const admin = require('firebase-admin');
   const nodemailer = require('nodemailer');
   
   admin.initializeApp();
   
   // Email-Transport konfigurieren
   const transporter = nodemailer.createTransport({
     service: 'gmail', // oder dein Email-Provider
     auth: {
       user: 'deine-email@gmail.com',
       pass: 'dein-app-passwort'
     }
   });
   
   // Bei Löschanfrage Email senden
   exports.sendDeletionRequestEmail = functions.firestore
     .document('prompts/{promptId}')
     .onUpdate(async (change, context) => {
       const newData = change.after.data();
       const oldData = change.before.data();
       
       // Check ob neue Löschanfrage
       if (newData.deletionRequests.length > oldData.deletionRequests.length) {
         const promptId = context.params.promptId;
         const promptText = newData.text.substring(0, 100);
         
         const mailOptions = {
           from: 'Prompt Manager <deine-email@gmail.com>',
           to: 'admin@schule.de',
           subject: 'Neue Löschanfrage für Prompt',
           html: `
             <h2>Neue Löschanfrage</h2>
             <p><strong>Prompt-ID:</strong> ${promptId}</p>
             <p><strong>Prompt:</strong> ${promptText}...</p>
             <p><strong>Anzahl Anfragen:</strong> ${newData.deletionRequests.length}</p>
             <p><strong>Link:</strong> <a href="https://deine-domain.vercel.app">Zur App</a></p>
           `
         };
         
         await transporter.sendMail(mailOptions);
       }
     });
   ```

3. **Deployen**:
   ```bash
   firebase deploy --only functions
   ```

---

## Best Practices für Schulen

### 1. Einführung im Kollegium

- **Schulung**: 15-Minuten Workshop
- **Demo**: Live-Vorführung mit Beispiel-Prompts
- **Handout**: Gedruckte Anleitung
- **Support**: Ansprechpartner benennen

### 2. Kategorien anpassen

Falls du andere Kategorien brauchst, ändere in `app/page.tsx`:

```typescript
const CATEGORIES = [
  'Deine Kategorie 1',
  'Deine Kategorie 2',
  // ...
];
```

### 3. Qualitätssicherung

- **Regelmäßige Reviews**: Admin prüft Prompts
- **Community-Moderation**: Löschanfragen ernst nehmen
- **Best Practices teilen**: Top-bewertete Prompts hervorheben

### 4. Zusammenarbeit fördern

- **Fachgruppen-Treffen**: Prompts gemeinsam erstellen
- **Prompt-Challenge**: Wöchentlich bester Prompt küren
- **Feedback-Kultur**: Kommentare erwünscht machen

---

## Technische Anpassungen

### Admin-Dashboard (Optional)

Für ein Admin-Interface könntest du eine separate Seite erstellen:

```typescript
// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminPage() {
  const [deletionRequests, setDeletionRequests] = useState([]);
  
  useEffect(() => {
    loadDeletionRequests();
  }, []);
  
  const loadDeletionRequests = async () => {
    const q = query(
      collection(db, 'prompts'),
      where('deletionRequests', '!=', [])
    );
    const snapshot = await getDocs(q);
    setDeletionRequests(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })));
  };
  
  // ... Rest des Admin-Interface
}
```

---

## Support & Community

### Für Fragen:

- 📖 Siehe Haupt-README.md
- 🔥 Firebase Setup: FIREBASE_SETUP.md
- 💬 GitHub Issues

### Feedback willkommen:

- Feature-Wünsche
- Bug-Reports
- Verbesserungsvorschläge

---

## Lizenz

MIT - Frei nutzbar für Bildungseinrichtungen!

**Viel Erfolg beim Prompting!** 🚀📚
