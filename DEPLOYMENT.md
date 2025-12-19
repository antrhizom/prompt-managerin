# Deployment Anleitung 🚀

## Schritt 1: GitHub Repository erstellen

### 1.1 Auf GitHub
1. Gehe zu [github.com](https://github.com)
2. Klicke auf "+" oben rechts → "New repository"
3. Repository Name: `prompt-manager` (oder eigener Name)
4. Wähle "Public" oder "Private"
5. **NICHT** "Initialize with README" anklicken
6. Klicke auf "Create repository"

### 1.2 Lokal hochladen
Öffne Terminal/Command Prompt im `prompt-manager` Ordner:

```bash
# Git initialisieren
git init

# Alle Dateien hinzufügen
git add .

# Ersten Commit erstellen
git commit -m "Initial commit: Prompt Manager App"

# Mit GitHub verbinden (ersetze DEIN-USERNAME und DEIN-REPO)
git remote add origin https://github.com/DEIN-USERNAME/DEIN-REPO.git

# Branch umbenennen zu main
git branch -M main

# Code hochladen
git push -u origin main
```

**Hinweis**: Wenn nach Login gefragt wird, nutze:
- Username: Dein GitHub Username
- Password: Personal Access Token (erstelle einen unter Settings → Developer settings → Personal access tokens)

## Schritt 2: Mit Vercel verbinden

### 2.1 Vercel Account
1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke auf "Sign Up" oder "Login"
3. Wähle "Continue with GitHub"
4. Autorisiere Vercel für GitHub

### 2.2 Projekt deployen
1. Im Vercel Dashboard: Klicke auf "Add New..." → "Project"
2. Wähle dein `prompt-manager` Repository
3. Vercel erkennt automatisch Next.js
4. **Keine Einstellungen ändern** - die Standardeinstellungen sind perfekt
5. Klicke auf "Deploy"
6. Warte 1-2 Minuten ☕

### 2.3 Fertig! 🎉
- Du erhältst eine URL wie: `https://prompt-manager-abc123.vercel.app`
- Diese URL kannst du sofort nutzen und teilen

## Schritt 3: Automatische Updates

Ab jetzt wird **jeder Git Push automatisch deployed**:

```bash
# Änderungen machen
# Dann:
git add .
git commit -m "Beschreibung der Änderung"
git push
```

Nach 1-2 Minuten ist die neue Version online!

## Schritt 4: Custom Domain (Optional)

### In Vercel:
1. Gehe zu deinem Projekt
2. Settings → Domains
3. Füge deine Domain hinzu
4. Folge den DNS-Anweisungen

### Kostenlose Domain Optionen:
- [Freenom](https://www.freenom.com) - Kostenlose Domains (.tk, .ml, etc.)
- [InfinityFree](https://infinityfree.com) - Mit kostenlosen Subdomains
- Vercel gibt dir automatisch eine `.vercel.app` Domain

## Troubleshooting 🔧

### Problem: "git: command not found"
**Lösung**: Installiere Git von [git-scm.com](https://git-scm.com)

### Problem: "Permission denied"
**Lösung**: Nutze Personal Access Token statt Passwort
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token → Wähle "repo" scope
3. Nutze Token als Passwort beim Push

### Problem: Build Error auf Vercel
**Lösung**: Überprüfe die Build Logs in Vercel
- Meist fehlt eine Dependency
- Vercel zeigt dir genau, was fehlt

### Problem: Seite lädt nicht
**Lösung**: 
1. Checke Vercel Dashboard für Error Logs
2. Öffne Browser Console (F12)
3. Teste lokal mit `npm run dev`

## Vercel CLI (Alternative) 💻

Wenn du lieber die Kommandozeile nutzt:

```bash
# Vercel CLI installieren
npm install -g vercel

# In Projektordner navigieren
cd prompt-manager

# Erstes Deployment
vercel

# Für Production
vercel --prod

# Status checken
vercel ls
```

## Environment Variables (Für Firebase)

Falls du später Firebase hinzufügst:

1. Vercel Dashboard → Dein Projekt → Settings → Environment Variables
2. Füge alle `NEXT_PUBLIC_*` Variablen hinzu
3. Redeploy triggern

## Wichtige URLs 📌

- **Deine App**: `https://dein-projekt.vercel.app`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **GitHub Repo**: `https://github.com/username/prompt-manager`
- **Vercel Docs**: `https://vercel.com/docs`

## Performance Tipps ⚡

Vercel bietet automatisch:
- ✅ Global CDN
- ✅ Automatisches Caching
- ✅ Image Optimization
- ✅ Edge Functions
- ✅ SSL Zertifikate

Keine weitere Konfiguration nötig!

## Kostenlos? 💰

Ja! Vercel Free Tier beinhaltet:
- Unlimited Deployments
- 100 GB Bandwidth/Monat
- Automatische HTTPS
- Custom Domains
- GitHub Integration

Perfekt für persönliche Projekte!
