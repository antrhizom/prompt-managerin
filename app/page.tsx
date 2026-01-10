'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================
// INTERFACES
// ============================================

interface Prompt {
  id: string;
  titel: string;
  beschreibung: string;
  promptText: string;
  plattformenUndModelle: { [plattform: string]: string[] };
  outputFormate: string[];
  anwendungsfaelle: string[];
  tags: string[];
  kommentar: string;
  bewertungen: { [emoji: string]: number };
  nutzungsanzahl: number;
  erstelltVon: string;
  erstelltAm: Timestamp;
}

// ============================================
// KONSTANTEN - Plattformen mit Modellen
// ============================================

const PLATTFORMEN_MIT_MODELLEN: { [key: string]: string[] } = {
  'ChatGPT / OpenAI': [
    'GPT-5.2',
    'GPT-5.1',
    'GPT-4.1',
    'GPT-4o',
    'GPT-4o mini',
    'o3',
    'o3-mini',
    'o3-pro'
  ],
  'Claude / Anthropic': [
    'Claude Opus 4.5',
    'Claude Sonnet 4.5',
    'Claude Opus 4',
    'Claude Sonnet 4',
    'Claude Haiku 4.5',
    'Claude 4',
    'Claude 4.5'
  ],
  'Gemini / Google': [
    'Gemini 3 Pro',
    'Gemini 3 Flash',
    'Gemini 2.5 Pro',
    'Gemini 2.5 Flash'
  ],
  'fobizz': [
    'Mistral mini',
    'Llama 3',
    'Llama 3 mini',
    'GPT-OSS',
    'GPT-OSS small',
    'DeepSeek R1',
    'Qwen 3',
    'GPT-5',
    'GPT-5 mini',
    'GPT-4o',
    'GPT-4o mini',
    'GPT o3-mini',
    'Claude 4',
    'Claude 4.5',
    'Mistral'
  ],
  'Copilot / Microsoft': [
    'GPT-5',
    'GPT-4.1',
    'Claude Sonnet 4',
    'Phi-4'
  ],
  'Perplexity': [
    'Sonar',
    'Sonar-Pro',
    'Sonar-Reasoning'
  ],
  'DeepL Write': [
    'DeepL Write'
  ],
  'Meta Llama': [
    'Llama 4 Scout',
    'Llama 4 Maverick',
    'Llama 3.3 70B',
    'Llama 3.2 Vision',
    'Llama 3.1 405B'
  ],
  'Mistral AI': [
    'Mistral Large 3',
    'Mistral Small 3.2',
    'Ministral 3'
  ],
  'Qwen / Alibaba': [
    'Qwen3-235B',
    'Qwen3-Max',
    'QwQ-32B',
    'Qwen3-VL'
  ],
  'DeepSeek': [
    'DeepSeek-V3.2',
    'DeepSeek-R1'
  ]
};

const EMOJIS = ['👍', '❤️', '🔥', '⭐', '💡'];

const OUTPUT_FORMATE = [
  'Text', 'HTML', 'Markdown', 'PDF', 'Bild', 'Video', 
  'Audio', 'Präsentation', 'Tabelle', 'Code', 'JSON', 'Quiz'
];

const ANWENDUNGSFAELLE = {
  'Verstehen & Erfassen': [
    'Texte vereinfachen', 'Zusammenfassen', 'Konzepte erklären', 
    'Beispiele generieren', 'Analogien bilden'
  ],
  'Üben & Anwenden': [
    'Übungsaufgaben erstellen', 'Prüfungsvorbereitung', 'Lernkarten generieren', 
    'Quiz erstellen', 'Selbsttest'
  ],
  'Erstellen & Gestalten': [
    'Präsentationen', 'Arbeitsblätter', 'Projekte planen', 
    'Kreatives Schreiben', 'Visualisierungen'
  ],
  'Feedback & Reflexion': [
    'Texte korrigieren', 'Feedback geben', 'Selbstreflexion', 
    'Peer-Review', 'Verbesserungsvorschläge'
  ],
  'Organisation & Planung': [
    'Lernpläne', 'Zeitmanagement', 'Zielsetzung', 
    'Projektmanagement', 'Notizen strukturieren'
  ],
  'Recherche & Analyse': [
    'Informationen suchen', 'Quellen bewerten', 'Daten analysieren', 
    'Vergleichen', 'Argumentieren'
  ]
};

// ============================================
// KOMPONENTE
// ============================================

export default function Home() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [userCode, setUserCode] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  // Prompts State
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  // Neuer Prompt State
  const [neuerTitel, setNeuerTitel] = useState('');
  const [neueBeschreibung, setNeueBeschreibung] = useState('');
  const [neuerPromptText, setNeuerPromptText] = useState('');
  const [neuePlattformenUndModelle, setNeuePlattformenUndModelle] = useState<{ [key: string]: string[] }>({});
  const [neueOutputFormate, setNeueOutputFormate] = useState<string[]>([]);
  const [neueAnwendungsfaelle, setNeueAnwendungsfaelle] = useState<string[]>([]);
  const [neueTags, setNeueTags] = useState('');
  const [neuerKommentar, setNeuerKommentar] = useState('');

  // Filter & Search State
  const [suchbegriff, setSuchbegriff] = useState('');
  const [filterPlattform, setFilterPlattform] = useState('');
  const [filterOutputFormat, setFilterOutputFormat] = useState('');
  const [filterAnwendungsfall, setFilterAnwendungsfall] = useState('');
  const [sortierung, setSortierung] = useState<'nutzung' | 'bewertung' | 'aktuell'>('aktuell');

  // ============================================
  // CODE GENERIEREN (INDIVIDUELL - KEIN SHARING)
  // ============================================
  
  const generiereIndividuellenCode = () => {
    const zeichen = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'USER-';
    for (let i = 0; i < 8; i++) {
      code += zeichen.charAt(Math.floor(Math.random() * zeichen.length));
    }
    return code;
  };

  // ============================================
  // AUTHENTIFIZIERUNG
  // ============================================

  useEffect(() => {
    const gespeicherterUsername = localStorage.getItem('username');
    const gespeicherterCode = localStorage.getItem('userCode');
    
    if (gespeicherterUsername && gespeicherterCode) {
      setUsername(gespeicherterUsername);
      setUserCode(gespeicherterCode);
      setIsAuthenticated(true);
    } else if (gespeicherterCode) {
      setUserCode(gespeicherterCode);
      setShowNameInput(true);
    } else {
      const neuerCode = generiereIndividuellenCode();
      setUserCode(neuerCode);
      localStorage.setItem('userCode', neuerCode);
      setShowNameInput(true);
    }
  }, []);

  const handleNameSpeichern = () => {
    if (username.trim()) {
      localStorage.setItem('username', username);
      setIsAuthenticated(true);
      setShowNameInput(false);
    } else {
      alert('Bitte gib einen Namen ein!');
    }
  };

  const handleLogout = () => {
    if (confirm('Möchtest du dich wirklich abmelden? Deine Daten bleiben gespeichert.')) {
      localStorage.removeItem('username');
      setUsername('');
      setIsAuthenticated(false);
      setShowNameInput(true);
    }
  };

  // ============================================
  // FIREBASE ECHTZEIT-UPDATES
  // ============================================

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, 'prompts'), orderBy('erstelltAm', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const promptsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Prompt[];
        
        setPrompts(promptsData);
        setLoading(false);
      }, (error) => {
        console.error('Firebase Fehler:', error);
        alert('Fehler beim Laden der Daten. Überprüfe deine Firebase-Konfiguration.');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Firebase Setup Fehler:', error);
      alert('Firebase ist nicht konfiguriert. Siehe README.md für Setup-Anleitung.');
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ============================================
  // MODELL-TOGGLE HELPER
  // ============================================

  const toggleModell = (plattform: string, modell: string) => {
    setNeuePlattformenUndModelle(prev => {
      const aktuelleModelle = prev[plattform] || [];
      const neueModelle = aktuelleModelle.includes(modell)
        ? aktuelleModelle.filter(m => m !== modell)
        : [...aktuelleModelle, modell];
      
      if (neueModelle.length === 0) {
        const { [plattform]: _, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [plattform]: neueModelle };
    });
  };

  const toggleOutputFormat = (format: string) => {
    setNeueOutputFormate(prev => 
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };

  const toggleAnwendungsfall = (fall: string) => {
    setNeueAnwendungsfaelle(prev => 
      prev.includes(fall) ? prev.filter(f => f !== fall) : [...prev, fall]
    );
  };

  // ============================================
  // PROMPT HINZUFÜGEN
  // ============================================

  const handlePromptHinzufuegen = async () => {
    if (!neuerTitel.trim() || !neuerPromptText.trim()) {
      alert('Titel und Prompt-Text sind Pflichtfelder!');
      return;
    }

    if (Object.keys(neuePlattformenUndModelle).length === 0) {
      alert('Bitte mindestens eine Plattform mit Modell auswählen!');
      return;
    }

    if (neueOutputFormate.length === 0) {
      alert('Bitte mindestens ein Output-Format auswählen!');
      return;
    }

    if (neueAnwendungsfaelle.length === 0) {
      alert('Bitte mindestens einen Anwendungsfall auswählen!');
      return;
    }

    try {
      await addDoc(collection(db, 'prompts'), {
        titel: neuerTitel.trim(),
        beschreibung: neueBeschreibung.trim(),
        promptText: neuerPromptText.trim(),
        plattformenUndModelle: neuePlattformenUndModelle,
        outputFormate: neueOutputFormate,
        anwendungsfaelle: neueAnwendungsfaelle,
        tags: neueTags.split(',').map(t => t.trim()).filter(t => t),
        kommentar: neuerKommentar.trim(),
        bewertungen: { '👍': 0, '❤️': 0, '🔥': 0, '⭐': 0, '💡': 0 },
        nutzungsanzahl: 0,
        erstelltVon: userCode,
        erstelltAm: serverTimestamp()
      });

      setNeuerTitel('');
      setNeueBeschreibung('');
      setNeuerPromptText('');
      setNeuePlattformenUndModelle({});
      setNeueOutputFormate([]);
      setNeueAnwendungsfaelle([]);
      setNeueTags('');
      setNeuerKommentar('');

      alert('✅ Prompt erfolgreich gespeichert!');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern des Prompts.');
    }
  };

  // ============================================
  // BEWERTUNG & NUTZUNG
  // ============================================

  const handleBewertung = async (promptId: string, emoji: string) => {
    try {
      const prompt = prompts.find(p => p.id === promptId);
      if (!prompt) return;

      const neueBewertungen = {
        ...prompt.bewertungen,
        [emoji]: (prompt.bewertungen[emoji] || 0) + 1
      };

      await updateDoc(doc(db, 'prompts', promptId), {
        bewertungen: neueBewertungen
      });
    } catch (error) {
      console.error('Fehler beim Bewerten:', error);
    }
  };

  const handleNutzung = async (promptId: string) => {
    try {
      const prompt = prompts.find(p => p.id === promptId);
      if (!prompt) return;

      await updateDoc(doc(db, 'prompts', promptId), {
        nutzungsanzahl: prompt.nutzungsanzahl + 1
      });
    } catch (error) {
      console.error('Fehler beim Zählen:', error);
    }
  };

  // ============================================
  // LÖSCHEN
  // ============================================

  const handleLoeschen = async (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;

    if (prompt.erstelltVon === userCode) {
      if (confirm('Möchtest du diesen Prompt wirklich löschen?')) {
        try {
          await deleteDoc(doc(db, 'prompts', promptId));
          alert('✅ Prompt gelöscht!');
        } catch (error) {
          console.error('Fehler beim Löschen:', error);
          alert('Fehler beim Löschen.');
        }
      }
    } else {
      if (confirm('Du kannst nur eigene Prompts löschen. Möchtest du eine Löschanfrage senden?')) {
        const grund = window.prompt('Warum möchtest du diesen Prompt löschen?');
        if (!grund) return;
        
        try {
          const response = await fetch('https://hook.eu1.make.com/1qc0oua02l1ry7jyitimxeqfdtja54xa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              promptId: promptId,
              titel: prompt.titel,
              angefordertVon: username,
              grund: grund
            })
          });

          if (response.ok) {
            alert('✅ Löschanfrage gesendet!');
          } else {
            alert('❌ Fehler beim Senden der Anfrage.');
          }
        } catch (error) {
          console.error('Fehler beim Senden der Löschanfrage:', error);
          alert('❌ Fehler beim Senden der Anfrage.');
        }
      }
    }
  };

  // ============================================
  // FILTERN & SORTIEREN
  // ============================================

  const gefiltertePrompts = prompts.filter(prompt => {
    const suchMatch = suchbegriff === '' || 
      prompt.titel.toLowerCase().includes(suchbegriff.toLowerCase()) ||
      prompt.beschreibung.toLowerCase().includes(suchbegriff.toLowerCase()) ||
      prompt.promptText.toLowerCase().includes(suchbegriff.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(suchbegriff.toLowerCase()));

    const plattformMatch = filterPlattform === '' || 
      Object.keys(prompt.plattformenUndModelle).includes(filterPlattform);
    
    const outputMatch = filterOutputFormat === '' || 
      prompt.outputFormate.includes(filterOutputFormat);
    
    const anwendungMatch = filterAnwendungsfall === '' || 
      prompt.anwendungsfaelle.includes(filterAnwendungsfall);

    return suchMatch && plattformMatch && outputMatch && anwendungMatch;
  });

  const sortiertePrompts = [...gefiltertePrompts].sort((a, b) => {
    if (sortierung === 'nutzung') {
      return b.nutzungsanzahl - a.nutzungsanzahl;
    } else if (sortierung === 'bewertung') {
      const summeA = Object.values(a.bewertungen).reduce((sum, val) => sum + val, 0);
      const summeB = Object.values(b.bewertungen).reduce((sum, val) => sum + val, 0);
      return summeB - summeA;
    } else {
      return b.erstelltAm.seconds - a.erstelltAm.seconds;
    }
  });

  // ============================================
  // RENDER: NAME EINGEBEN
  // ============================================

  if (showNameInput) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '1rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '500px'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--dark-blue)', textAlign: 'center' }}>
            Willkommen! 👋
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--gray-medium)', marginBottom: '2rem' }}>
            Dein persönlicher Zugang wurde erstellt
          </p>

          <div style={{
            background: 'var(--light-blue)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            marginBottom: '2rem',
            textAlign: 'center',
            border: '2px dashed var(--primary-blue)'
          }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--gray-medium)', marginBottom: '0.5rem', fontWeight: '500' }}>
              Dein persönlicher Code:
            </div>
            <div style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: 'var(--primary-blue)',
              letterSpacing: '0.2rem',
              fontFamily: 'monospace'
            }}>
              {userCode}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--gray-medium)', marginTop: '0.75rem' }}>
              💡 Dieser Code ist nur für dich -<br />
              automatischer Login auf deinen Geräten
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--gray-dark)' }}>
              Wie möchtest du genannt werden?
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Dein Name (z.B. Anna Schmidt)"
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--gray-light)',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleNameSpeichern()}
            />
          </div>

          <button
            onClick={handleNameSpeichern}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Los geht's! 🚀
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: HAUPTAPP
  // ============================================

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1.5rem 2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              Prompting Manager
            </h1>
            <p style={{ opacity: 0.9 }}>
              Willkommen, {username}!
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.125rem' }}>
                Dein Code:
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                letterSpacing: '0.1rem',
                fontFamily: 'monospace'
              }}>
                {userCode}
              </div>
            </div>

            <Link 
              href="/admin"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              📊 Dashboard
            </Link>

            <button
              onClick={handleLogout}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '0.5rem',
                fontWeight: '600'
              }}
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Neuen Prompt erstellen */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: 'var(--shadow)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--dark-blue)' }}>
            Neuen Prompt erstellen
          </h2>

          {/* Titel */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Titel *
            </label>
            <input
              type="text"
              value={neuerTitel}
              onChange={(e) => setNeuerTitel(e.target.value)}
              placeholder="z.B. Mathe-Textaufgaben erstellen"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--gray-light)',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Beschreibung */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Beschreibung
            </label>
            <textarea
              value={neueBeschreibung}
              onChange={(e) => setNeueBeschreibung(e.target.value)}
              placeholder="Kurze Beschreibung des Prompts..."
              rows={2}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--gray-light)',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Prompt-Text */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Prompt-Text *
            </label>
            <textarea
              value={neuerPromptText}
              onChange={(e) => setNeuerPromptText(e.target.value)}
              placeholder="Der eigentliche Prompt..."
              rows={5}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--gray-light)',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Plattformen & Modelle ACCORDION */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Plattformen & Modelle * 
              <span style={{ color: 'var(--gray-medium)', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                ({Object.keys(neuePlattformenUndModelle).length} Plattformen, {Object.values(neuePlattformenUndModelle).flat().length} Modelle)
              </span>
            </label>
            <div style={{
              border: '2px solid var(--gray-light)',
              borderRadius: '0.5rem',
              padding: '1rem',
              background: 'var(--gray-light)'
            }}>
              {Object.entries(PLATTFORMEN_MIT_MODELLEN).map(([plattform, modelle]) => (
                <details key={plattform} style={{ marginBottom: '0.75rem' }}>
                  <summary style={{
                    padding: '0.75rem',
                    background: 'white',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    color: neuePlattformenUndModelle[plattform]?.length > 0 ? 'var(--green)' : 'var(--gray-dark)'
                  }}>
                    {plattform} 
                    {neuePlattformenUndModelle[plattform]?.length > 0 && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                        ({neuePlattformenUndModelle[plattform].length})
                      </span>
                    )}
                  </summary>
                  <div style={{
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '0 0 0.5rem 0.5rem',
                    marginTop: '0.25rem'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '0.5rem'
                    }}>
                      {modelle.map(modell => (
                        <label key={modell} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          background: neuePlattformenUndModelle[plattform]?.includes(modell) 
                            ? 'var(--light-blue)' 
                            : 'transparent',
                          borderRadius: '0.375rem',
                          transition: 'background 0.2s'
                        }}>
                          <input
                            type="checkbox"
                            checked={neuePlattformenUndModelle[plattform]?.includes(modell) || false}
                            onChange={() => toggleModell(plattform, modell)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '0.9rem' }}>{modell}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Output-Formate */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Output-Formate * <span style={{ color: 'var(--gray-medium)', fontWeight: 'normal' }}>({neueOutputFormate.length} ausgewählt)</span>
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '0.5rem',
              padding: '1rem',
              background: 'var(--gray-light)',
              borderRadius: '0.5rem'
            }}>
              {OUTPUT_FORMATE.map(format => (
                <label key={format} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={neueOutputFormate.includes(format)}
                    onChange={() => toggleOutputFormat(format)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.95rem' }}>{format}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Anwendungsfälle */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Anwendungsfälle * <span style={{ color: 'var(--gray-medium)', fontWeight: 'normal' }}>({neueAnwendungsfaelle.length} ausgewählt)</span>
            </label>
            {Object.entries(ANWENDUNGSFAELLE).map(([kategorie, faelle]) => (
              <div key={kategorie} style={{ marginBottom: '1rem' }}>
                <h4 style={{
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  color: 'var(--purple)',
                  fontWeight: '600'
                }}>
                  {kategorie}
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: 'var(--gray-light)',
                  borderRadius: '0.5rem'
                }}>
                  {faelle.map(fall => (
                    <label key={fall} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={neueAnwendungsfaelle.includes(fall)}
                        onChange={() => toggleAnwendungsfall(fall)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.9rem' }}>{fall}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Tags
            </label>
            <input
              type="text"
              value={neueTags}
              onChange={(e) => setNeueTags(e.target.value)}
              placeholder="Komma-getrennt: Mathematik, Algebra, 7. Klasse"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--gray-light)',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Kommentar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Kommentar
            </label>
            <textarea
              value={neuerKommentar}
              onChange={(e) => setNeuerKommentar(e.target.value)}
              placeholder="Zusätzliche Hinweise, Tipps, etc..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--gray-light)',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            onClick={handlePromptHinzufuegen}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: 'var(--shadow)'
            }}
          >
            ✅ Prompt hinzufügen
          </button>
        </div>

        {/* Filter & Suche */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: 'var(--shadow)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--dark-blue)' }}>
            Prompts durchsuchen ({sortiertePrompts.length})
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            <input
              type="text"
              value={suchbegriff}
              onChange={(e) => setSuchbegriff(e.target.value)}
              placeholder="🔍 Suchen..."
              style={{
                padding: '0.75rem',
                border: '2px solid var(--gray-light)',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />

            <select
              value={filterPlattform}
              onChange={(e) => setFilterPlattform(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '2px solid var(--gray-light)',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <option value="">Alle Plattformen</option>
              {Object.keys(PLATTFORMEN_MIT_MODELLEN).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={filterOutputFormat}
              onChange={(e) => setFilterOutputFormat(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '2px solid var(--gray-light)',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <option value="">Alle Formate</option>
              {OUTPUT_FORMATE.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            <select
              value={filterAnwendungsfall}
              onChange={(e) => setFilterAnwendungsfall(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '2px solid var(--gray-light)',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <option value="">Alle Anwendungsfälle</option>
              {Object.values(ANWENDUNGSFAELLE).flat().map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            <select
              value={sortierung}
              onChange={(e) => setSortierung(e.target.value as any)}
              style={{
                padding: '0.75rem',
                border: '2px solid var(--gray-light)',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <option value="aktuell">Neueste zuerst</option>
              <option value="nutzung">Meist genutzt</option>
              <option value="bewertung">Best bewertet</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--gray-medium)' }}>
              Lade Prompts...
            </p>
          </div>
        )}

        {/* Keine Prompts */}
        {!loading && sortiertePrompts.length === 0 && (
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '1rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow)'
          }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--gray-medium)' }}>
              {suchbegriff || filterPlattform || filterOutputFormat || filterAnwendungsfall
                ? 'Keine Prompts gefunden.'
                : 'Noch keine Prompts vorhanden. Erstelle den ersten!'}
            </p>
          </div>
        )}

        {/* Prompts Liste */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {sortiertePrompts.map(prompt => (
            <div key={prompt.id} style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '1rem',
              boxShadow: 'var(--shadow)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '1rem'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '1.3rem',
                    color: 'var(--dark-blue)',
                    marginBottom: '0.25rem'
                  }}>
                    {prompt.titel}
                  </h3>
                  {prompt.beschreibung && (
                    <p style={{
                      color: 'var(--gray-medium)',
                      fontSize: '0.95rem'
                    }}>
                      {prompt.beschreibung}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleLoeschen(prompt.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: prompt.erstelltVon === userCode ? 'var(--red)' : 'var(--orange)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  {prompt.erstelltVon === userCode ? '🗑️ Löschen' : '📧 Löschanfrage'}
                </button>
              </div>

              {/* Prompt Text */}
              <div style={{
                background: 'var(--gray-light)',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.95rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {prompt.promptText}
              </div>

              {/* Metadata */}
              <div style={{ marginBottom: '1rem' }}>
                {/* Plattformen & Modelle */}
                {Object.keys(prompt.plattformenUndModelle).length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', marginRight: '0.5rem' }}>
                      Plattformen & Modelle:
                    </strong>
                    {Object.entries(prompt.plattformenUndModelle).map(([plattform, modelle]) => (
                      <div key={plattform} style={{ marginBottom: '0.5rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          background: 'var(--purple)',
                          color: 'white',
                          borderRadius: '1rem',
                          fontSize: '0.85rem',
                          marginRight: '0.5rem',
                          marginBottom: '0.25rem',
                          fontWeight: '600'
                        }}>
                          {plattform}
                        </span>
                        {modelle.map(modell => (
                          <span key={modell} style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            background: 'var(--light-blue)',
                            color: 'var(--primary-blue)',
                            borderRadius: '1rem',
                            fontSize: '0.8rem',
                            marginRight: '0.5rem',
                            marginBottom: '0.25rem'
                          }}>
                            {modell}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Output-Formate */}
                {prompt.outputFormate.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', marginRight: '0.5rem' }}>
                      Formate:
                    </strong>
                    {prompt.outputFormate.map(f => (
                      <span key={f} style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: 'var(--teal)',
                        color: 'white',
                        borderRadius: '1rem',
                        fontSize: '0.85rem',
                        marginRight: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {/* Anwendungsfälle */}
                {prompt.anwendungsfaelle.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', marginRight: '0.5rem' }}>
                      Anwendung:
                    </strong>
                    {prompt.anwendungsfaelle.map(a => (
                      <span key={a} style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: 'var(--green)',
                        color: 'white',
                        borderRadius: '1rem',
                        fontSize: '0.85rem',
                        marginRight: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                {/* Tags */}
                {prompt.tags.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '0.9rem', marginRight: '0.5rem' }}>
                      Tags:
                    </strong>
                    {prompt.tags.map((tag, i) => (
                      <span key={i} style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: 'var(--light-blue)',
                        color: 'var(--dark-blue)',
                        borderRadius: '1rem',
                        fontSize: '0.85rem',
                        marginRight: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Kommentar */}
              {prompt.kommentar && (
                <div style={{
                  background: '#fffbeb',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  borderLeft: '3px solid var(--orange)'
                }}>
                  <strong style={{ fontSize: '0.9rem' }}>💬 Kommentar:</strong>
                  <p style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>
                    {prompt.kommentar}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid var(--gray-light)'
              }}>
                {/* Bewertungen */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleBewertung(prompt.id, emoji)}
                      style={{
                        padding: '0.5rem',
                        background: 'var(--gray-light)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                      title={`${emoji} ${prompt.bewertungen[emoji] || 0}`}
                    >
                      {emoji}
                      <span style={{ fontSize: '0.85rem', color: 'var(--gray-medium)' }}>
                        {prompt.bewertungen[emoji] || 0}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Nutzung */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--gray-medium)' }}>
                    📊 {prompt.nutzungsanzahl}x genutzt
                  </span>
                  <button
                    onClick={() => {
                      handleNutzung(prompt.id);
                      navigator.clipboard.writeText(prompt.promptText);
                      alert('✅ Prompt kopiert!');
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--primary-blue)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    📋 Kopieren
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
