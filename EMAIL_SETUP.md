# Email-Benachrichtigungen mit Firebase Cloud Functions

## Voraussetzungen

- Firebase Blaze Plan (Pay-as-you-go, kostenlos bis ~10.000 Anfragen/Monat)
- Node.js installiert
- Firebase CLI installiert

---

## Schritt 1: Firebase Functions Setup (5 Minuten)

### 1. Firebase CLI installieren
```bash
npm install -g firebase-tools
```

### 2. Firebase Login
```bash
firebase login
```

### 3. Projekt initialisieren
```bash
cd prompt-manager
firebase init functions
```

**Während Setup:**
- "Use existing project" → Wähle dein Projekt
- Language: **JavaScript** (einfacher)
- ESLint: Ja
- Install dependencies: Ja

---

## Schritt 2: Email Function erstellen

### 1. Dependencies installieren
```bash
cd functions
npm install nodemailer
```

### 2. `functions/index.js` bearbeiten

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Email-Konfiguration (Gmail Beispiel)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'deine-email@gmail.com', // Deine Gmail-Adresse
    pass: 'dein-app-passwort'       // NICHT dein normales Passwort!
  }
});

// Bei Löschanfrage Email senden
exports.sendDeletionRequestEmail = functions.firestore
  .document('prompts/{promptId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    
    // Check ob neue Löschanfrage hinzugekommen ist
    const newRequests = newData.deletionRequests || [];
    const oldRequests = oldData.deletionRequests || [];
    
    if (newRequests.length > oldRequests.length) {
      const promptId = context.params.promptId;
      const promptText = newData.text.substring(0, 150);
      const category = newData.category;
      
      const mailOptions = {
        from: 'Prompt Manager <deine-email@gmail.com>',
        to: 'admin@deine-schule.de', // Admin-Email hier eintragen
        subject: '⚠️ Neue Löschanfrage für Prompt',
        html: `
          <h2>Neue Löschanfrage eingegangen</h2>
          
          <p><strong>Prompt-ID:</strong> ${promptId}</p>
          <p><strong>Kategorie:</strong> ${category}</p>
          <p><strong>Ersteller:</strong> ${newData.userName}</p>
          <p><strong>Anzahl Anfragen:</strong> ${newRequests.length}</p>
          
          <h3>Prompt-Text:</h3>
          <p>${promptText}${newData.text.length > 150 ? '...' : ''}</p>
          
          <h3>Tags:</h3>
          <p>${newData.tags.join(', ')}</p>
          
          <p><a href="https://deine-domain.vercel.app" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Zur App</a></p>
          
          <hr style="margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">Diese Email wurde automatisch generiert vom Prompt Manager System.</p>
        `
      };
      
      try {
        await transporter.sendMail(mailOptions);
        console.log('Löschanfrage-Email erfolgreich gesendet');
      } catch (error) {
        console.error('Fehler beim Email-Versand:', error);
      }
    }
  });

// Optional: Täglicher Report über alle Löschanfragen
exports.sendDailyDeletionReport = functions.pubsub
  .schedule('0 9 * * *') // Jeden Tag um 9 Uhr
  .timeZone('Europe/Berlin')
  .onRun(async (context) => {
    const snapshot = await admin.firestore()
      .collection('prompts')
      .where('deletionRequests', '!=', [])
      .get();
    
    if (snapshot.empty) {
      console.log('Keine ausstehenden Löschanfragen');
      return null;
    }
    
    let reportHTML = '<h2>Täglicher Löschanfragen-Report</h2>';
    reportHTML += `<p>${snapshot.size} Prompt(s) mit ausstehenden Löschanfragen:</p><ul>`;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      reportHTML += `
        <li>
          <strong>${data.category}</strong>: ${data.text.substring(0, 100)}...
          <br><small>${data.deletionRequests.length} Anfrage(n) | Erstellt von: ${data.userName}</small>
        </li>
      `;
    });
    
    reportHTML += '</ul>';
    
    const mailOptions = {
      from: 'Prompt Manager <deine-email@gmail.com>',
      to: 'admin@deine-schule.de',
      subject: `📊 Täglicher Löschanfragen-Report (${snapshot.size} ausstehend)`,
      html: reportHTML
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Täglicher Report gesendet');
    } catch (error) {
      console.error('Fehler beim Report-Versand:', error);
    }
    
    return null;
  });
```

---

## Schritt 3: Gmail App-Passwort erstellen

**WICHTIG:** Nutze NICHT dein normales Gmail-Passwort!

### 1. Google Account Security
- Gehe zu [myaccount.google.com/security](https://myaccount.google.com/security)
- Aktiviere **"2-Schritt-Verifizierung"** (falls noch nicht)

### 2. App-Passwort generieren
- [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- App: "Mail"
- Gerät: "Anderes" → "Prompt Manager"
- Klicke **"Generieren"**
- Kopiere das 16-stellige Passwort

### 3. In Code einfügen
```javascript
auth: {
  user: 'deine-email@gmail.com',
  pass: 'abcd efgh ijkl mnop' // Das generierte App-Passwort
}
```

---

## Schritt 4: Deployen

```bash
# Im functions Verzeichnis
cd functions

# Deployen
firebase deploy --only functions
```

**Warte ~2 Minuten**

---

## Schritt 5: Testen

1. Gehe zur App
2. Versuche einen fremden Prompt zu löschen
3. Bestätige Löschanfrage
4. **Check deine Admin-Email!** ✉️

---

## Kosten

### Firebase Blaze Plan:
- **Kostenlos** bis 2 Millionen Aufrufe/Monat
- Danach: ~$0.40 pro 1 Million Aufrufe
- Für Schulen: Normalerweise **komplett kostenlos**

### Gmail:
- **Kostenlos** bis 500 Emails/Tag
- Mehr als genug für Schulzwecke

---

## Alternative Email-Provider

### Nicht Gmail? Kein Problem!

#### Microsoft 365 / Outlook:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'deine-email@schule.de',
    pass: 'dein-passwort'
  }
});
```

#### SendGrid (Professionell):
```bash
npm install @sendgrid/mail
```

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('dein-sendgrid-api-key');

const msg = {
  to: 'admin@schule.de',
  from: 'noreply@deine-schule.de',
  subject: 'Neue Löschanfrage',
  html: '...'
};

await sgMail.send(msg);
```

#### Mailgun, Amazon SES, etc.
Siehe [Nodemailer Docs](https://nodemailer.com/smtp/)

---

## Troubleshooting

### "Authentication failed"
- Check App-Passwort (nicht normales Passwort)
- 2FA aktiviert?
- Richtiger Gmail-Account?

### Function wird nicht ausgelöst
```bash
# Logs checken
firebase functions:log
```

### "Insufficient permissions"
- Firebase Blaze Plan aktiviert?
- Functions korrekt deployed?

---

## Nächste Schritte

### Optional: Erweiterte Features

1. **HTML Email Templates**
   - Besseres Design mit CSS
   - Logo einbinden
   - Responsive Emails

2. **Mehrere Admins**
   ```javascript
   to: ['admin1@schule.de', 'admin2@schule.de']
   ```

3. **Email-Einstellungen in Firestore**
   ```javascript
   const settings = await admin.firestore()
     .collection('settings')
     .doc('email')
     .get();
   
   const adminEmail = settings.data().adminEmail;
   ```

4. **Benachrichtigungen auch für neue Prompts**
   - Bei jedem neuen Prompt Email an Admin
   - Wöchentlicher Digest

---

## Support

Bei Problemen:
- Firebase Functions Logs: `firebase functions:log`
- Firebase Console: Error-Messages
- [Firebase Support](https://firebase.google.com/support)

**Viel Erfolg!** ✉️
