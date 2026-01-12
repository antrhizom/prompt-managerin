# 📧 E-MAIL SETUP - SCHRITT FÜR SCHRITT

## ⚠️ PROBLEM: Keine E-Mails kommen an?

**Wahrscheinlich fehlt das Gmail App-Passwort!**

---

## ✅ LÖSUNG - 5 einfache Schritte:

### SCHRITT 1: Gmail 2FA aktivieren

1. Öffne: https://myaccount.google.com/security
2. Klicke auf: **"2-Schritt-Verifizierung"**
3. Falls noch nicht aktiv → **Aktivieren**
4. Falls schon aktiv → ✅ Gut, weiter zu Schritt 2

---

### SCHRITT 2: App-Passwort erstellen

1. Öffne: https://myaccount.google.com/apppasswords

2. Wähle:
   - **App:** Mail
   - **Gerät:** Anderes (benutzerdefinierter Name)

3. Name eingeben: **Prompt Manager**

4. Klicke: **Erstellen**

5. **KOPIERE DAS PASSWORT!**
   ```
   Beispiel: abcd efgh ijkl mnop
   ```
   (16 Zeichen mit Leerzeichen)

---

### SCHRITT 3: Passwort in Code eintragen

1. Öffne die Datei:
   ```
   functions/index.js
   ```

2. Suche Zeile 23 (oder STRG+F: "xxxx xxxx"):
   ```javascript
   pass: 'xxxx xxxx xxxx xxxx'
   ```

3. **Ersetze mit deinem App-Passwort:**
   ```javascript
   pass: 'abcd efgh ijkl mnop'  // Dein echtes Passwort hier!
   ```

4. **Speichern!** (STRG+S)

---

### SCHRITT 4: Functions deployen

```bash
firebase deploy --only functions
```

**Warte bis du siehst:**
```
✔  Deploy complete!
```

(Dauert 1-2 Minuten)

---

### SCHRITT 5: Testen!

1. **Öffne die App:**
   ```bash
   npm run dev
   ```

2. **Melde einen Prompt:**
   - Klicke auf 🚨 bei einem fremden Prompt
   - Gib einen Grund ein
   - Bestätige

3. **Schaue die Logs:**
   ```bash
   firebase functions:log
   ```

4. **Du solltest nach 30-60 Sekunden sehen:**
   ```
   ✅ Löschanfrage-Email erfolgreich gesendet
   ```

5. **Checke deine E-Mails!**
   - Posteingang
   - **SPAM-Ordner!** ⚠️

---

## 🐛 Fehler beheben:

### Fehler: "Invalid login"
```
Error: Invalid login: 535-5.7.8
```

**Lösung:**
- App-Passwort ist falsch
- Neu erstellen und nochmal eintragen
- Mit Leerzeichen kopieren!

---

### Fehler: "Missing credentials"
```
Error: Missing credentials for "PLAIN"
```

**Lösung:**
- App-Passwort fehlt
- Steht noch "xxxx" in functions/index.js?
- Echtes Passwort eintragen!

---

### Fehler: "Username and Password not accepted"
```
Error: Username and Password not accepted
```

**Lösung:**
- 2-Faktor-Authentifizierung nicht aktiv
- Gehe zu Schritt 1 und aktiviere 2FA

---

### Gar keine Logs?

```bash
firebase functions:log
```

**Zeigt nichts?**

**Lösung:**
1. Prüfe ob Functions deployed:
   ```bash
   firebase functions:list
   ```

2. Sollte zeigen:
   ```
   sendDeletionRequestEmail(us-central1)
   ```

3. Wenn nicht:
   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```

---

## ✅ So weißt du dass es funktioniert:

### 1. Logs zeigen Erfolg:
```bash
firebase functions:log
```
```
✅ Löschanfrage-Email erfolgreich gesendet für Prompt abc123
```

### 2. E-Mail kommt an:
- Betreff: "🚨 Neue Löschanfrage: [Titel]"
- Von: Prompt Manager <antrhizom@gmail.com>
- An: antrhizom@gmail.com

### 3. E-Mail enthält:
- Prompt-Titel
- Prompt-Text
- Wer gemeldet hat
- Grund der Meldung
- Link zur App

---

## 📋 Checkliste:

- [ ] 2FA bei Gmail aktiviert
- [ ] App-Passwort erstellt (16 Zeichen)
- [ ] App-Passwort in `functions/index.js` Zeile 23 eingetragen
- [ ] Datei gespeichert
- [ ] `firebase deploy --only functions` ausgeführt
- [ ] Deploy erfolgreich (✔ Deploy complete)
- [ ] Prompt gemeldet
- [ ] `firebase functions:log` zeigt "✅ Email gesendet"
- [ ] E-Mail angekommen (Posteingang ODER Spam)

---

## 🆘 Immer noch keine E-Mail?

### Letzte Checks:

1. **Gmail blockiert?**
   - Gehe zu: https://myaccount.google.com/lesssecureapps
   - Sollte aus sein (App-Passwörter verwenden!)

2. **Richtige E-Mail?**
   - `functions/index.js` Zeile 21: `user: 'antrhizom@gmail.com'`
   - Ist das richtig?

3. **Spam-Ordner gecheckt?**
   - Sehr wichtig! Erste E-Mails landen oft im Spam!

4. **Logs prüfen:**
   ```bash
   firebase functions:log --only sendDeletionRequestEmail
   ```
   - Zeigt Fehler?
   - Zeigt gar nichts? → Functions nicht deployed!

---

## 💡 Quick-Test:

Füge diese Test-Function in `functions/index.js` am Ende ein:

```javascript
// TEST FUNCTION
exports.testEmail = functions.https.onRequest(async (req, res) => {
  try {
    await transporter.sendMail({
      from: EMAIL_CONFIG.auth.user,
      to: ADMIN_EMAIL,
      subject: '🧪 Test E-Mail von Prompt Manager',
      text: 'Wenn du das liest, funktioniert der E-Mail-Versand!'
    });
    res.send('✅ Test-E-Mail gesendet!');
  } catch (error) {
    res.status(500).send('❌ Fehler: ' + error.message);
  }
});
```

Deploy:
```bash
firebase deploy --only functions
```

Öffne im Browser:
```
https://us-central1-DEIN-PROJECT-ID.cloudfunctions.net/testEmail
```

(Ersetze DEIN-PROJECT-ID mit deiner Firebase Project ID)

Sollte zeigen: "✅ Test-E-Mail gesendet!"

Checke E-Mail!

---

**Wenn Test-E-Mail funktioniert aber Meldungen nicht:**
→ Problem ist in der Trigger-Function (onUpdate)
→ Schick mir die Logs!

**Wenn Test-E-Mail NICHT funktioniert:**
→ Problem ist Gmail-Config
→ App-Passwort prüfen!
