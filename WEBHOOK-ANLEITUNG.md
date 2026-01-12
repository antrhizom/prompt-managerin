# 🔗 Webhook-Lösung - Wie es funktioniert

## ✅ Das Problem (und die Lösung)

**Problem:** Browser blockieren direkte Requests zu Make.com (CORS-Fehler)

**Lösung:** Next.js API Route als Proxy!

```
Browser → Next.js API (/api/melden) → Make.com Webhook → E-Mail
```

## 📁 Dateien

### 1. `/app/api/melden/route.ts` 
- **Neue Datei!** Server-seitige API Route
- Nimmt Meldung vom Browser entgegen
- Leitet sie an Make.com weiter
- Kein CORS-Problem! ✅

### 2. `/app/page.tsx`
- Ruft jetzt `/api/melden` auf (nicht direkt Make.com)
- Webhook funktioniert zuverlässig
- Fallback auf E-Mail wenn's schief geht

## 🧪 So testest du es:

### Lokal testen:
```bash
npm run dev
```

1. Öffne http://localhost:3000
2. Klicke bei einem fremden Prompt auf 🚨
3. Gib einen Grund ein
4. ✅ Webhook wird gesendet!

### Webhook prüfen:
1. Gehe zu Make.com → Dein Szenario
2. Klicke "Run once" 
3. Melde einen Prompt in der App
4. Schaue ob Daten ankommen

## ⚙️ Make.com Einrichtung

Dein Webhook ist bereits konfiguriert:
```
https://hook.eu1.make.com/1qc0oua02l1ry7jyitimxeqfdtja54xa
```

**Empfangene Daten:**
```json
{
  "promptId": "abc123",
  "titel": "Prompt-Titel",
  "promptText": "Text...",
  "melderName": "Max Mustermann",
  "melderCode": "1ZBPQL",
  "grund": "Unangemessen",
  "timestamp": "2025-01-11T...",
  "url": "https://..."
}
```

**In Make.com:**
1. **Webhook** → Empfängt Daten
2. **Email** → Sendet an `antrhizom@gmail.com`

**E-Mail Template:**
```
Betreff: 🚨 Prompt-Meldung: {{1.titel}}

Hallo,

ein Prompt wurde gemeldet:

📝 PROMPT:
ID: {{1.promptId}}
Titel: {{1.titel}}
Text: {{1.promptText}}

👤 GEMELDET VON:
Name: {{1.melderName}}
Code: {{1.melderCode}}

⚠️ GRUND:
{{1.grund}}

🔗 Link: {{1.url}}
⏰ Zeit: {{1.timestamp}}
```

## 🚀 Deploy

```bash
git add app/api/melden/route.ts
git add app/page.tsx
git commit -m "Fix: Webhook via API Route (CORS-fix)"
git push
```

Vercel deployt automatisch! ✅

## 🐛 Debugging

**Fehler: "Webhook failed"**
- Prüfe Make.com Szenario ist aktiv (ON)
- Prüfe Webhook-URL ist korrekt
- Schaue in Make.com "History"

**Fehler: "Internal Server Error"**
- Schaue in Vercel Logs
- API Route hat Problem mit Make.com

**E-Mail kommt nicht an:**
- Prüfe Spam-Ordner
- Prüfe E-Mail in Make.com korrekt
- Schaue Make.com "Execution history"

## 💡 Vorteile dieser Lösung

✅ Kein CORS-Problem
✅ Server-seitig = sicherer
✅ Zuverlässiger
✅ Fallback auf E-Mail
✅ Einfach zu debuggen

---

**Webhook funktioniert jetzt! 🎉**
