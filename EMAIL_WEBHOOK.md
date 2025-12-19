# Schnelle Email-Lösung mit Webhook (Ohne Firebase Functions)

## Option: Make.com (ehemals Integromat) - KOSTENLOS

Diese Lösung ist **viel einfacher** als Firebase Functions und funktioniert ohne Code!

---

## Schritt 1: Make.com Account (2 Minuten)

1. Gehe zu [make.com](https://www.make.com)
2. Kostenlos registrieren
3. **Free Plan**: 1.000 Operations/Monat (mehr als genug!)

---

## Schritt 2: Webhook erstellen (3 Minuten)

### 1. Neues Scenario
- Klicke **"Create a new scenario"**

### 2. Webhook hinzufügen
- Suche **"Webhooks"**
- Wähle **"Custom webhook"**
- Klicke **"Create a webhook"**
- Name: "Prompt Manager Löschanfragen"
- **Kopiere die Webhook URL!** (sieht aus wie: `https://hook.eu1.make.com/xxxxx`)

### 3. Email-Modul hinzufügen
- Klicke auf das **+** nach dem Webhook
- Suche **"Email"**
- Wähle **"Send an Email"**

### 4. Email konfigurieren
```
To: admin@deine-schule.de
Subject: ⚠️ Neue Löschanfrage für Prompt
Body:
Hallo,

ein User hat eine Löschanfrage gestellt:

Prompt-ID: {{promptId}}
User: {{userName}}
Kategorie: {{category}}
Prompt: {{promptText}}

Anzahl Anfragen: {{requestCount}}

Zur App: https://deine-domain.vercel.app

---
Diese Email wurde automatisch generiert.
```

### 5. Scenario aktivieren
- Klicke **"Save"**
- Toggle rechts oben auf **"ON"**

---

## Schritt 3: Code anpassen (1 Minute)

In deiner `app/page.tsx`, ersetze die `requestDeletion` Funktion:

```typescript
const requestDeletion = async (promptId: string) => {
  const prompt = prompts.find(p => p.id === promptId);
  if (!prompt) return;

  if (prompt.deletionRequests?.includes(currentUserId)) {
    alert('Du hast bereits eine Löschanfrage für diesen Prompt gestellt.');
    return;
  }

  if (!confirm('Du kannst diesen Prompt nicht löschen, da du ihn nicht erstellt hast. Möchtest du eine Löschanfrage stellen?')) return;

  try {
    const updatedRequests = [...(prompt.deletionRequests || []), currentUserId];
    await updateDoc(doc(db, 'prompts', promptId), {
      deletionRequests: updatedRequests
    });

    // Webhook aufrufen
    const webhookUrl = 'https://hook.eu1.make.com/xxxxx'; // DEINE WEBHOOK URL HIER!
    
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promptId: promptId,
        userName: currentUserName,
        category: prompt.category,
        promptText: prompt.text.substring(0, 200),
        requestCount: updatedRequests.length
      })
    }).catch(err => console.error('Webhook Fehler:', err));

    alert('Löschanfrage wurde gestellt. Der Admin wurde per Email benachrichtigt.');
  } catch (err) {
    console.error('Error requesting deletion:', err);
    alert('Fehler beim Stellen der Löschanfrage');
  }
};
```

---

## Schritt 4: Testen

1. Gehe zur App
2. Versuche fremden Prompt zu löschen
3. Bestätige Löschanfrage
4. **Check Email!** ✉️

---

## Vorteile dieser Lösung

✅ **Einfach**: Kein Server, keine Functions
✅ **Schnell**: 5 Minuten Setup
✅ **Kostenlos**: 1.000 Emails/Monat free
✅ **Keine Code-Änderungen** in Firebase nötig
✅ **Visuell**: Alles per Drag & Drop

---

## Erweiterungen

### Andere Email-Provider
In Make.com kannst du auch nutzen:
- Gmail
- Outlook / Microsoft 365
- SendGrid
- Mailgun
- Beliebige SMTP Server

### Zusätzliche Aktionen
- Slack-Benachrichtigung
- Google Sheets Log
- Discord Nachricht
- SMS via Twilio

---

## Alternative: Zapier

Wenn du lieber Zapier magst:

1. [zapier.com](https://zapier.com) Account
2. "Create Zap"
3. Trigger: **"Webhooks by Zapier"** → "Catch Hook"
4. Action: **"Email by Zapier"** → "Send Email"
5. Webhook URL kopieren
6. In Code einfügen (wie oben)

---

## Kosten-Vergleich

| Lösung | Free Tier | Danach |
|--------|-----------|--------|
| Make.com | 1.000/Monat | $9/Monat für 10.000 |
| Zapier | 100/Monat | $20/Monat für 750 |
| Firebase Functions | 2 Mio/Monat | $0.40/1 Mio |

**Für Schulen: Make.com Free Tier reicht locker!**

---

## Support

- Make.com Docs: [make.com/en/help](https://www.make.com/en/help)
- Community: [community.make.com](https://community.make.com)

**Fertig in 5 Minuten!** ⚡
