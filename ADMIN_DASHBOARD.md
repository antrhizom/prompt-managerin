# Einfachste Lösung: Admin-Dashboard mit Browser-Notifications

## Keine Emails? Kein Problem!

Erstelle ein **Admin-Dashboard** direkt in der App - viel einfacher als Emails!

---

## Option 1: Admin-Seite erstellen (10 Minuten)

### Erstelle `app/admin/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Prompt {
  id: string;
  text: string;
  category: string;
  tags: string[];
  userName: string;
  deletionRequests: string[];
  usageCount: number;
  rating: any;
}

export default function AdminPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Einfaches Passwort-System (für Produktion: Firebase Auth nutzen!)
  const ADMIN_PASSWORD = 'dein-geheimes-passwort'; // ÄNDERE DIES!

  const login = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Falsches Passwort!');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadDeletionRequests();
  }, [isAuthenticated]);

  const loadDeletionRequests = async () => {
    try {
      const q = query(
        collection(db, 'prompts'),
        where('deletionRequests', '!=', [])
      );
      const snapshot = await getDocs(q);
      const promptsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Prompt[];
      
      setPrompts(promptsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading deletion requests:', err);
      setLoading(false);
    }
  };

  const approveAndDelete = async (promptId: string) => {
    if (!confirm('Prompt wirklich löschen?')) return;
    
    try {
      await deleteDoc(doc(db, 'prompts', promptId));
      setPrompts(prompts.filter(p => p.id !== promptId));
      alert('Prompt wurde gelöscht!');
    } catch (err) {
      console.error('Error deleting prompt:', err);
      alert('Fehler beim Löschen');
    }
  };

  const rejectRequest = async (promptId: string) => {
    if (!confirm('Löschanfrage ablehnen?')) return;
    
    try {
      await updateDoc(doc(db, 'prompts', promptId), {
        deletionRequests: []
      });
      setPrompts(prompts.filter(p => p.id !== promptId));
      alert('Löschanfrage wurde abgelehnt!');
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Fehler beim Ablehnen');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            🔐 Admin Login
          </h1>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && login()}
            placeholder="Admin-Passwort"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={login}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              🛡️ Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Löschanfragen verwalten
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={loadDeletionRequests}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              🔄 Aktualisieren
            </button>
            <a
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              ← Zur App
            </a>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : prompts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
            <p className="text-2xl text-gray-600 dark:text-gray-400">
              ✅ Keine ausstehenden Löschanfragen!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-3">
                      <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-bold">
                        {prompt.category}
                      </span>
                      {prompt.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-lg text-gray-800 dark:text-white mb-2">
                      {prompt.text}
                    </p>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Erstellt von: <strong>{prompt.userName}</strong>
                    </p>
                    
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      ⚠️ {prompt.deletionRequests.length} Löschanfrage(n)
                    </p>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Nutzung: {prompt.usageCount}× | Bewertungen: {Object.values(prompt.rating || {}).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => approveAndDelete(prompt.id)}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
                  >
                    ✓ Prompt löschen
                  </button>
                  <button
                    onClick={() => rejectRequest(prompt.id)}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                  >
                    ✗ Anfrage ablehnen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Verwendung

### 1. Passwort setzen
In der Datei oben, ändere:
```typescript
const ADMIN_PASSWORD = 'dein-geheimes-passwort'; // z.B. "Schule2024!"
```

### 2. Admin-Seite aufrufen
```
https://deine-domain.vercel.app/admin
```

### 3. Einloggen
- Passwort eingeben
- Wird im localStorage gespeichert
- Bleibt eingeloggt

### 4. Löschanfragen verwalten
- Alle Prompts mit Löschanfragen sehen
- ✓ Löschen oder ✗ Ablehnen
- 🔄 Aktualisieren Button

---

## Option 2: Browser-Benachrichtigungen (5 Minuten)

Füge das zu `app/page.tsx` hinzu:

```typescript
// Nach den anderen useEffects:
useEffect(() => {
  // Nur für Admins aktivieren
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  if (!isAdmin) return;

  // Browser Notifications erlauben
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  // Check für neue Löschanfragen alle 30 Sekunden
  const interval = setInterval(async () => {
    const q = query(
      collection(db, 'prompts'),
      where('deletionRequests', '!=', [])
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty && Notification.permission === 'granted') {
      new Notification('Neue Löschanfrage(n)', {
        body: `${snapshot.size} Prompt(s) mit ausstehenden Löschanfragen`,
        icon: '/icon.png' // Optional
      });
    }
  }, 30000); // 30 Sekunden

  return () => clearInterval(interval);
}, []);

// Admin aktivieren:
// localStorage.setItem('isAdmin', 'true');
```

---

## Option 3: Email-Digest (Täglich)

Nutze einen Cron-Service:

1. [cron-job.org](https://cron-job.org) Account
2. Erstelle Endpoint: `https://deine-domain.vercel.app/api/daily-report`
3. Cron: Täglich um 9 Uhr

Erstelle `app/api/daily-report/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  // Admin-Token prüfen
  const authHeader = request.headers.get('authorization');
  if (authHeader !== 'Bearer dein-geheimer-token') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Firebase Query
  // Email senden
  
  return NextResponse.json({ success: true });
}
```

---

## Vergleich

| Lösung | Setup | Vorteile | Nachteile |
|--------|-------|----------|-----------|
| **Admin-Dashboard** | 10 Min | Keine Emails nötig, Visuell | Muss manuell checken |
| **Browser-Notifications** | 5 Min | Echtzeit-Alerts | Nur wenn Browser offen |
| **Email (Webhook)** | 5 Min | Emails überall | Webhook-Service nötig |
| **Firebase Functions** | 15 Min | Professionell | Blaze Plan nötig |

---

## Empfehlung

**Für Schulen:** Starte mit **Admin-Dashboard**!
- Kein Email-Setup nötig
- Alles unter Kontrolle
- Visuell übersichtlich
- Sofort einsatzbereit

Später upgrade zu Emails wenn nötig.

---

**Los geht's!** 🚀
