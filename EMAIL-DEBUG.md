# 🐛 E-Mail funktioniert nicht - DEBUG

## Schritt 1: Sind Firebase Functions deployed?

```bash
firebase functions:list
```

**Solltest du sehen:**
```
✔ sendDeletionRequestEmail(us-central1)
```

**Wenn NICHT:** Functions deployen!
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

---

## Schritt 2: Ist Gmail App-Passwort eingetragen?

Öffne `functions/index.js`:

```javascript
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: 'antrhizom@gmail.com',  // ✅ Deine E-Mail
    pass: 'xxxx xxxx xxxx xxxx'   // ❌ HIER MUSS DEIN APP-PASSWORT REIN!
  }
};
```

### Gmail App-Passwort erstellen:

1. **Gehe zu:** https://myaccount.google.com/apppasswords
2. **App wählen:** Mail
3. **Gerät wählen:** Anderes → "Prompt Manager"
4. **Kopiere das 16-stellige Passwort** (z.B. `abcd efgh ijkl mnop`)
5. **Trage es ein** in `functions/index.js` Zeile 17
6. **Deploy nochmal:**
   ```bash
   firebase deploy --only functions
   ```

---

## Schritt 3: Logs prüfen

```bash
firebase functions:log
```

**Was du sehen willst:**
```
✅ Löschanfrage-Email erfolgreich gesendet für Prompt abc123
```

**Fehler-Meldungen:**

### "Invalid login"
→ App-Passwort falsch oder 2FA nicht aktiviert

### "Missing credentials"
→ App-Passwort fehlt in `functions/index.js`

### "ECONNREFUSED"
→ Gmail blockiert. Prüfe:
  - 2FA aktiviert?
  - App-Passwort korrekt?
  - Richtige Gmail-Adresse?

---

## Schritt 4: Manuelle Test-Funktion

Füge in `functions/index.js` am Ende hinzu:

```javascript
// TEST-FUNKTION (zum Debuggen)
exports.testEmail = functions.https.onRequest(async (req, res) => {
  try {
    await transporter.sendMail({
      from: EMAIL_CONFIG.auth.user,
      to: ADMIN_EMAIL,
      subject: '🧪 Test E-Mail',
      text: 'Wenn du das liest, funktioniert der E-Mail-Versand!'
    });
    res.send('✅ E-Mail gesendet!');
  } catch (error) {
    res.status(500).send('❌ Fehler: ' + error.message);
  }
});
```

Deploy und teste:
```bash
firebase deploy --only functions
firebase functions:log --only testEmail
```

Rufe auf: https://us-central1-DEIN-PROJECT.cloudfunctions.net/testEmail

---

## Schritt 5: Function URL finden

```bash
firebase functions:config:get
```

Oder in Firebase Console:
1. Functions → sendDeletionRequestEmail
2. Kopiere die URL
3. Teste mit:
   ```bash
   curl https://us-central1-xxx.cloudfunctions.net/sendDeletionRequestEmail
   ```

---

## ✅ Checklist:

- [ ] `firebase functions:list` zeigt Function
- [ ] Gmail App-Passwort eingetragen (16 Zeichen)
- [ ] 2FA bei Gmail aktiviert
- [ ] Functions deployed: `firebase deploy --only functions`
- [ ] Logs prüfen: `firebase functions:log`
- [ ] Spam-Ordner checken
- [ ] Test-Function ausprobieren

---

## 🎯 Häufigste Fehler:

1. **App-Passwort vergessen** (Zeile 17 in functions/index.js)
2. **2FA nicht aktiviert** bei Gmail
3. **Functions nicht deployed** (`firebase deploy --only functions`)
4. **E-Mail landet im Spam**

---

**Tipp:** Wenn gar nichts hilft, erstelle ein neues Gmail App-Passwort und deploye nochmal!
