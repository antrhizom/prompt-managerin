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
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ============================================
// KONFIGURATION
// ============================================

// Make.com Webhook für Meldungen
// Trage hier deine Webhook-URL von Make.com ein!
const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/1qc0oua02l1ry7jyitimxeqfdtja54xa';

// Admin E-Mail für Fallback (wenn Webhook nicht funktioniert)
const ADMIN_EMAIL = 'antrhizom@gmail.com';

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
  erstelltVonRolle?: string;
  erstelltAm: Timestamp;
  deleted?: boolean;
  deletedAt?: Timestamp;
  deletedBy?: string;
  deletionRequests?: Array<{
    userCode: string;
    userName: string;
    grund: string;
    timestamp: string;
  }>;
}

// ============================================
// KONSTANTEN - Rollen
// ============================================

const ROLLEN = [
  '👨‍🏫 Lehrperson',
  '🎓 Lernende Berufsschule',
  '📚 Lernende Allgemein',
  '🏛️ Lernende Gymnasium',
  '🏢 Verwaltung',
  '🔧 Sonstige'
];

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
  ],
  'Manus': [
    'Manus AI'
  ],
  'Kimi': [
    'Kimi AI'
  ],
  '🎥 Video-Plattformen': [
    'Synthesia.io',
    'HeyGen',
    'Krea',
    'NotebookLM',
    'Sonstige'
  ],
  '🎵 Audio-Plattformen': [
    'ElevenLabs.io',
    'Sonstige'
  ]
};

const EMOJIS = ['👍', '❤️', '🔥', '⭐', '💡'];

const OUTPUT_FORMATE = [
  'Text', 'HTML', 'Markdown', 'PDF', 'Bild', 'Video', 
  'Audio', 'Präsentation', 'Tabelle', 'Code', 'JSON', 'Quiz'
];

const ANWENDUNGSFAELLE = {
  'Interaktive Internetseiten': [],
  'Design Office Programme': [],
  'Lerndossier Text': [],
  'Projektmanagement': [],
  'Administration': [],
  'Prüfungen': [],
  'KI-Assistenten': [],
  'Fotos': [
    'Photoshop',
    'Fotoreportagen'
  ],
  'Grafik und Infografik/Diagramme': [
    'HTML-Grafik'
  ],
  'Social Media Inhalte': [
    'Reel',
    'Gif',
    'Memes'
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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState<'choose' | 'existing' | 'new'>('choose');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Prompts State
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);

  // Neuer Prompt State
  const [neuerTitel, setNeuerTitel] = useState('');
  const [neueBeschreibung, setNeueBeschreibung] = useState('');
  const [neuerPromptText, setNeuerPromptText] = useState('');
  const [neuePlattformenUndModelle, setNeuePlattformenUndModelle] = useState<{ [key: string]: string[] }>({});
  const [neueOutputFormate, setNeueOutputFormate] = useState<string[]>([]);
  const [neueAnwendungsfaelle, setNeueAnwendungsfaelle] = useState<string[]>([]);
  const [neueTags, setNeueTags] = useState('');
  const [neuerKommentar, setNeuerKommentar] = useState('');
  const [neueRolle, setNeueRolle] = useState('');

  // Filter & Search State
  const [suchbegriff, setSuchbegriff] = useState('');
  const [filterPlattform, setFilterPlattform] = useState('');
  const [filterOutputFormat, setFilterOutputFormat] = useState('');
  const [filterAnwendungsfall, setFilterAnwendungsfall] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterRolle, setFilterRolle] = useState(''); // ← NEU: Filter nach Rolle
  const [sortierung, setSortierung] = useState<'nutzung' | 'bewertung' | 'aktuell'>('aktuell');

  // ============================================
  // CODE GENERIEREN (INDIVIDUELL - KEIN SHARING)
  // ============================================
  
  const generiereIndividuellenCode = () => {
    const zeichen = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += zeichen.charAt(Math.floor(Math.random() * zeichen.length));
    }
    return code;
  };

  // ============================================
  // AUTHENTIFIZIERUNG (Optional)
  // ============================================

  useEffect(() => {
    const gespeicherterUsername = localStorage.getItem('username');
    let gespeicherterCode = localStorage.getItem('userCode');
    
    // 🔄 MIGRATION: Alte "user_ABC123" Codes zu "ABC123" konvertieren
    if (gespeicherterCode && gespeicherterCode.startsWith('user_')) {
      gespeicherterCode = gespeicherterCode.replace('user_', '');
      localStorage.setItem('userCode', gespeicherterCode);
      console.log('✅ Alter Code migriert:', gespeicherterCode);
    }
    
    if (gespeicherterUsername && gespeicherterCode) {
      setUsername(gespeicherterUsername);
      setUserCode(gespeicherterCode);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setLoginMode('choose');
    setUserCode('');
    setUsername('');
    setShowLoginModal(true);
  };

  // Prüfe ob User existiert und lade Namen
  const checkAndLoadUser = async (code: string) => {
    if (!code || code.length < 6) return null;
    
    console.log('🔍 Suche User mit Code:', code);
    
    try {
      const userDoc = await getDoc(doc(db, 'users', code));
      if (userDoc.exists()) {
        const loadedName = userDoc.data().username;
        console.log('✅ User gefunden:', loadedName);
        return loadedName;
      } else {
        console.log('⚠️ User existiert noch nicht in Firebase');
        return null;
      }
    } catch (error) {
      console.error('❌ Fehler beim Laden des Users:', error);
      return null;
    }
  };

  // Speichere User in Firebase
  const saveUser = async (code: string, name: string) => {
    console.log('💾 Speichere User:', code, name);
    
    try {
      await setDoc(doc(db, 'users', code), {
        username: name,
        createdAt: serverTimestamp()
      });
      console.log('✅ User erfolgreich gespeichert!');
    } catch (error) {
      console.error('❌ Fehler beim Speichern des Users:', error);
    }
  };

  const handleLoginAbschliessen = async () => {
    if (!username.trim()) {
      alert('Bitte gib einen Namen ein!');
      return;
    }
    
    // Speichere/Update User in Firebase (auch wenn er schon existiert - Name könnte geändert sein)
    await saveUser(userCode, username.trim());
    
    localStorage.setItem('username', username.trim());
    localStorage.setItem('userCode', userCode);
    setIsAuthenticated(true);
    setShowLoginModal(false);
    setShowCreateForm(true);
  };

  const handleLogout = () => {
    if (confirm('Möchtest du dich wirklich abmelden?')) {
      localStorage.removeItem('username');
      localStorage.removeItem('userCode');
      setUsername('');
      setUserCode('');
      setIsAuthenticated(false);
      setShowCreateForm(false);
    }
  };

  // ============================================
  // HILFSFUNKTION: Prüfe ob Prompt dem User gehört
  // ============================================
  
  const istEigenerPrompt = (prompt: Prompt): boolean => {
    if (!isAuthenticated || !userCode) return false;
    // Akzeptiere sowohl neue Codes ("ABC123") als auch alte Codes ("user_ABC123")
    return prompt.erstelltVon === userCode || prompt.erstelltVon === `user_${userCode}`;
  };

  // ============================================
  // FIREBASE ECHTZEIT-UPDATES (Immer aktiv)
  // ============================================

  // URL-Parameter lesen (z.B. ?rolle=Lehrperson vom Dashboard)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      
      // Alle möglichen Filter-Parameter auslesen
      const rolleParam = params.get('rolle');
      const plattformParam = params.get('plattform');
      const formatParam = params.get('format');
      const anwendungsfallParam = params.get('anwendungsfall');
      
      // Filter setzen wenn Parameter vorhanden
      if (rolleParam) {
        setFilterRolle(decodeURIComponent(rolleParam));
      }
      if (plattformParam) {
        setFilterPlattform(decodeURIComponent(plattformParam));
      }
      if (formatParam) {
        setFilterOutputFormat(decodeURIComponent(formatParam));
      }
      if (anwendungsfallParam) {
        setFilterAnwendungsfall(decodeURIComponent(anwendungsfallParam));
      }
      
      // Scrolle zu den Prompts wenn irgendein Filter gesetzt wurde
      if (rolleParam || plattformParam || formatParam || anwendungsfallParam) {
        setTimeout(() => {
          document.getElementById('prompts-liste')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, []);

  useEffect(() => {
    try {
      const q = query(collection(db, 'prompts'), orderBy('erstelltAm', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const promptsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Prompt[];
        
        // Filter gelöschte Prompts aus
        const aktivePrompts = promptsData.filter(p => !p.deleted);
        
        setPrompts(aktivePrompts);
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
  }, []); // Nicht mehr abhängig von isAuthenticated!

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
  // PROMPT BEARBEITEN
  // ============================================

  const handleBearbeitenStarten = (prompt: Prompt) => {
    if (!isAuthenticated || prompt.erstelltVon !== userCode) {
      return;
    }

    setEditingPromptId(prompt.id);
    setNeuerTitel(prompt.titel);
    setNeueBeschreibung(prompt.beschreibung);
    setNeuerPromptText(prompt.promptText);
    setNeuePlattformenUndModelle(prompt.plattformenUndModelle || {});
    setNeueOutputFormate(prompt.outputFormate || []);
    setNeueAnwendungsfaelle(prompt.anwendungsfaelle || []);
    setNeueTags(prompt.tags?.join(', ') || '');
    setNeuerKommentar(prompt.kommentar);
    setNeueRolle(prompt.erstelltVonRolle || '');
    setShowCreateForm(true);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBearbeitenAbbrechen = () => {
    setEditingPromptId(null);
    setNeuerTitel('');
    setNeueBeschreibung('');
    setNeuerPromptText('');
    setNeuePlattformenUndModelle({});
    setNeueOutputFormate([]);
    setNeueAnwendungsfaelle([]);
    setNeueTags('');
    setNeuerKommentar('');
    setNeueRolle('');
  };

  const handlePromptAktualisieren = async () => {
    if (!editingPromptId) return;

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
      await updateDoc(doc(db, 'prompts', editingPromptId), {
        titel: neuerTitel.trim(),
        beschreibung: neueBeschreibung.trim(),
        promptText: neuerPromptText.trim(),
        plattformenUndModelle: neuePlattformenUndModelle,
        outputFormate: neueOutputFormate,
        anwendungsfaelle: neueAnwendungsfaelle,
        tags: neueTags.split(',').map(t => t.trim()).filter(t => t),
        kommentar: neuerKommentar.trim()
      });

      handleBearbeitenAbbrechen();
      setShowCreateForm(false);
      alert('✅ Prompt erfolgreich aktualisiert!');
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      alert('Fehler beim Aktualisieren des Prompts.');
    }
  };

  // ============================================
  // PROMPT HINZUFÜGEN
  // ============================================

  const handlePromptHinzufuegen = async () => {
    if (!neuerTitel.trim() || !neuerPromptText.trim()) {
      alert('Titel und Prompt-Text sind Pflichtfelder!');
      return;
    }

    if (!neueRolle) {
      alert('Bitte wähle deine Rolle aus!');
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
        erstelltVonRolle: neueRolle,
        erstelltAm: serverTimestamp()
      });

      handleBearbeitenAbbrechen(); // Nutze die gleiche Reset-Funktion
      setShowCreateForm(false);

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
        ...(prompt.bewertungen || {}),
        [emoji]: ((prompt.bewertungen || {})[emoji] || 0) + 1
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
        nutzungsanzahl: (prompt.nutzungsanzahl || 0) + 1
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

    if (istEigenerPrompt(prompt)) {
      // Eigener Prompt - als gelöscht markieren (Soft Delete)
      if (confirm('Möchtest du diesen Prompt wirklich löschen?')) {
        try {
          await updateDoc(doc(db, 'prompts', promptId), {
            deleted: true,
            deletedAt: serverTimestamp(),
            deletedBy: userCode
          });
          alert('✅ Prompt gelöscht!');
        } catch (error) {
          console.error('Fehler beim Löschen:', error);
          alert('❌ Fehler beim Löschen.');
        }
      }
    } else {
      // Fremder Prompt - Löschanfrage via Firebase Functions
      // Check ob User bereits eine Anfrage gestellt hat
      const deletionRequests = prompt.deletionRequests || [];
      if (deletionRequests.some(req => req.userCode === userCode)) {
        alert('Du hast bereits eine Löschanfrage für diesen Prompt gestellt.');
        return;
      }

      const grund = window.prompt(
        'Warum möchtest du diesen Prompt melden?\n\n' +
        'Gründe können sein:\n' +
        '• Unangemessener Inhalt\n' +
        '• Fehlerhafte Information\n' +
        '• Spam\n' +
        '• Sonstiges\n\n' +
        'Der Admin wird automatisch per E-Mail benachrichtigt.'
      );
      
      if (!grund || !grund.trim()) return;

      try {
        // Füge deletionRequest hinzu - Firebase Functions sendet automatisch E-Mail!
        const updatedRequests = [
          ...deletionRequests,
          {
            userCode: userCode,
            userName: username || 'Anonym',
            grund: grund.trim(),
            timestamp: new Date().toISOString()
          }
        ];

        await updateDoc(doc(db, 'prompts', promptId), {
          deletionRequests: updatedRequests
        });

        alert('✅ Löschanfrage wurde gestellt!\n\nDer Admin wurde automatisch per E-Mail benachrichtigt und wird den Prompt prüfen.');
      } catch (error) {
        console.error('Fehler beim Senden der Löschanfrage:', error);
        alert('❌ Fehler beim Senden der Anfrage. Bitte versuche es später erneut.');
      }
    }
  };

  // ============================================
  // FILTERN & SORTIEREN
  // ============================================

  // Alle verwendeten Tags sammeln
  const alleTags = Array.from(new Set(
    prompts.flatMap(p => p.tags || [])
  )).sort();

  const gefiltertePrompts = prompts.filter(prompt => {
    // Hashtag-Suche: Wenn # am Anfang, nur in Tags suchen
    let suchMatch = true;
    if (suchbegriff.startsWith('#')) {
      const tagSuche = suchbegriff.slice(1).toLowerCase();
      suchMatch = (prompt.tags || []).some(tag => tag.toLowerCase().includes(tagSuche));
    } else {
      suchMatch = suchbegriff === '' || 
        prompt.titel.toLowerCase().includes(suchbegriff.toLowerCase()) ||
        prompt.beschreibung.toLowerCase().includes(suchbegriff.toLowerCase()) ||
        prompt.promptText.toLowerCase().includes(suchbegriff.toLowerCase()) ||
        (prompt.tags || []).some(tag => tag.toLowerCase().includes(suchbegriff.toLowerCase()));
    }

    const plattformMatch = filterPlattform === '' || 
      Object.keys(prompt.plattformenUndModelle || {}).includes(filterPlattform);
    
    const outputMatch = filterOutputFormat === '' || 
      (prompt.outputFormate || []).includes(filterOutputFormat);
    
    const anwendungMatch = filterAnwendungsfall === '' || 
      (prompt.anwendungsfaelle || []).includes(filterAnwendungsfall) ||
      // Wenn Hauptkategorie gefiltert wird, auch Unterkategorien matchen
      (prompt.anwendungsfaelle || []).some((anw: string) => {
        for (const [hauptkat, unterkat] of Object.entries(ANWENDUNGSFAELLE) as [string, string[]][]) {
          if (hauptkat === filterAnwendungsfall && unterkat.includes(anw)) {
            return true;
          }
        }
        return false;
      });

    const tagMatch = filterTag === '' ||
      (prompt.tags || []).includes(filterTag);

    const rolleMatch = filterRolle === '' ||
      prompt.erstelltVonRolle === filterRolle;

    return suchMatch && plattformMatch && outputMatch && anwendungMatch && tagMatch && rolleMatch;
  });

  const sortiertePrompts = [...gefiltertePrompts].sort((a, b) => {
    if (sortierung === 'nutzung') {
      return (b.nutzungsanzahl || 0) - (a.nutzungsanzahl || 0);
    } else if (sortierung === 'bewertung') {
      const summeA = Object.values(a.bewertungen || {}).reduce((sum, val) => sum + val, 0);
      const summeB = Object.values(b.bewertungen || {}).reduce((sum, val) => sum + val, 0);
      return summeB - summeA;
    } else {
      // Handle null/undefined timestamps
      const aTime = a.erstelltAm?.seconds || 0;
      const bTime = b.erstelltAm?.seconds || 0;
      return bTime - aTime;
    }
  });

  // ============================================
  // RENDER: HAUPTAPP (Öffentlich zugänglich)
  // ============================================

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
      {/* Login Modal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            width: '100%',
            maxWidth: '500px'
          }}>
            {/* MODUS: Auswahl */}
            {loginMode === 'choose' && (
              <>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--dark-blue)' }}>
                  Willkommen! 👋
                </h2>
                <p style={{ color: 'var(--gray-medium)', marginBottom: '2rem' }}>
                  Erstelle einen Account oder melde dich mit deinem Code an
                </p>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  <button
                    onClick={() => {
                      setLoginMode('existing');
                      setUserCode('');
                    }}
                    style={{
                      padding: '1.5rem',
                      background: 'white',
                      border: '2px solid var(--primary-blue)',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--light-blue)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔑</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--dark-blue)', marginBottom: '0.25rem' }}>
                      Ich habe schon einen Code
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--gray-medium)' }}>
                      Melde dich mit deinem bestehenden Zugangscode an
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setLoginMode('new');
                      setUserCode(generiereIndividuellenCode());
                    }}
                    style={{
                      padding: '1.5rem',
                      background: 'white',
                      border: '2px solid var(--green)',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#ecfdf5'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--dark-blue)', marginBottom: '0.25rem' }}>
                      Neuen Account erstellen
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--gray-medium)' }}>
                      Erhalte einen neuen Zugangscode
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setShowLoginModal(false)}
                  style={{
                    width: '100%',
                    marginTop: '1.5rem',
                    padding: '0.75rem',
                    background: 'var(--gray-light)',
                    color: 'var(--gray-dark)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Abbrechen
                </button>
              </>
            )}

            {/* MODUS: Bestehender Code */}
            {loginMode === 'existing' && (
              <>
                <button
                  onClick={() => setLoginMode('choose')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-blue)',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    marginBottom: '1rem',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  ← Zurück
                </button>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--dark-blue)' }}>
                  🔑 Mit Code anmelden
                </h2>
                <p style={{ color: 'var(--gray-medium)', marginBottom: '1.5rem' }}>
                  Gib deinen bestehenden Zugangscode ein
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Zugangscode:
                  </label>
                  <input
                    type="text"
                    value={userCode}
                    onChange={async (e) => {
                      const code = e.target.value.toUpperCase();
                      setUserCode(code);
                      
                      // Auto-load Name wenn Code 6+ Zeichen hat
                      if (code.length >= 6) {
                        console.log('🔄 Suche Name für Code:', code);
                        const loadedName = await checkAndLoadUser(code);
                        if (loadedName) {
                          setUsername(loadedName);
                        } else {
                          // Nur leeren wenn aktuell ein geladener Name drin ist
                          if (username) {
                            console.log('ℹ️ Code geändert, Name zurücksetzen');
                          }
                        }
                      } else {
                        // Code zu kurz, Name leeren
                        if (username) setUsername('');
                      }
                    }}
                    placeholder="z.B. ABC123"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: 'var(--primary-blue)',
                      letterSpacing: '0.3rem',
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      border: '2px solid var(--primary-blue)',
                      borderRadius: '0.5rem'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && userCode && username && handleLoginAbschliessen()}
                  />
                </div>

                {/* FALL 1: Name wurde automatisch geladen → Grüne Bestätigungs-Box */}
                {username && userCode.length >= 6 ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ 
                      padding: '1rem', 
                      background: '#ecfdf5', 
                      border: '2px solid var(--green)',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>✅</span>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--gray-medium)' }}>Angemeldet als:</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--green)' }}>{username}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setUsername('')}
                        style={{
                          background: 'var(--primary-blue)',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}
                      >
                        Name ändern
                      </button>
                    </div>
                  </div>
                ) : userCode.length >= 6 ? (
                  /* FALL 2: Code eingegeben, aber Name nicht geladen → Input-Feld zeigen */
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Dein Name:
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="z.B. Anna Schmidt"
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid var(--gray-light)',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        background: 'white'
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && username && userCode && handleLoginAbschliessen()}
                    />
                    <div style={{ fontSize: '0.85rem', color: 'var(--orange)', marginTop: '0.5rem' }}>
                      ℹ️ Neuer Code - bitte Namen eingeben
                    </div>
                  </div>
                ) : null /* FALL 3: Code noch nicht eingegeben (< 6 Zeichen) → NICHTS zeigen */
                }

                <button
                  onClick={handleLoginAbschliessen}
                  disabled={!username || !userCode}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: (!username || !userCode) ? 'var(--gray-light)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: (!username || !userCode) ? 'var(--gray-medium)' : 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: (!username || !userCode) ? 'not-allowed' : 'pointer'
                  }}
                >
                  Anmelden 🚀
                </button>
              </>
            )}

            {/* MODUS: Neuer Account */}
            {loginMode === 'new' && (
              <>
                <button
                  onClick={() => setLoginMode('choose')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-blue)',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    marginBottom: '1rem',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  ← Zurück
                </button>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--dark-blue)' }}>
                  ✨ Neuer Account
                </h2>
                <p style={{ color: 'var(--gray-medium)', marginBottom: '1.5rem' }}>
                  Dein persönlicher Zugangscode wurde erstellt
                </p>

                <div style={{
                  background: 'var(--light-blue)',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  border: '2px solid var(--primary-blue)'
                }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-medium)', marginBottom: '0.5rem' }}>
                    Dein Zugangscode:
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: 'var(--primary-blue)',
                    letterSpacing: '0.5rem',
                    fontFamily: 'monospace',
                    marginBottom: '0.75rem'
                  }}>
                    {userCode}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--orange)', fontWeight: '500' }}>
                    💡 Speichere diesen Code! Du brauchst ihn zum Anmelden.
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Dein Name:
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="z.B. Anna Schmidt"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid var(--gray-light)',
                      borderRadius: '0.5rem',
                      fontSize: '1rem'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && username && handleLoginAbschliessen()}
                  />
                </div>

                <button
                  onClick={handleLoginAbschliessen}
                  disabled={!username}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: !username ? 'var(--gray-light)' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: !username ? 'var(--gray-medium)' : 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: !username ? 'not-allowed' : 'pointer'
                  }}
                >
                  Account erstellen 🚀
                </button>
              </>
            )}
          </div>
        </div>
      )}

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
              Prompt Managerin
            </h1>
            <p style={{ opacity: 0.9 }}>
              {isAuthenticated ? `Willkommen, ${username}!` : 'Öffentliche Prompt-Bibliothek'}
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {isAuthenticated && (
              <>
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

                <button
                  onClick={() => {
                    setShowCreateForm(!showCreateForm);
                    if (!showCreateForm) {
                      handleBearbeitenAbbrechen();
                    }
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: showCreateForm ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '2px solid white',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  {showCreateForm ? '✖️ Schließen' : '➕ Prompt erstellen'}
                </button>
              </>
            )}

            {!isAuthenticated && (
              <button
                onClick={handleLogin}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                ➕ Prompt erstellen
              </button>
            )}

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
              📊 Dashboard Aktivität
            </Link>

            {isAuthenticated && (
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
            )}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Info-Banner für nicht angemeldete Nutzer */}
        {!isAuthenticated && (
          <div style={{
            background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
            padding: '1.5rem',
            borderRadius: '1rem',
            marginBottom: '2rem',
            border: '2px solid var(--primary-blue)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>📚</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--dark-blue)', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Willkommen zur öffentlichen Prompt-Bibliothek!
                </h3>
                <p style={{ color: 'var(--gray-dark)', marginBottom: '0.75rem', lineHeight: '1.6' }}>
                  Hier findest du eine Sammlung erprobter KI-Prompts für Bildungszwecke. 
                  Du kannst alle Prompts <strong>durchsuchen, bewerten und nutzen</strong> – ganz ohne Anmeldung!
                </p>
                <div style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '2px dashed var(--primary-blue)',
                  marginTop: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>💡</span>
                    <strong style={{ color: 'var(--dark-blue)' }}>
                      Möchtest du eigene Prompts teilen?
                    </strong>
                  </div>
                  <p style={{ color: 'var(--gray-medium)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                    Klicke auf <strong>"➕ Prompt erstellen"</strong> und melde dich mit einem einfachen Code an (keine E-Mail nötig!).
                    So kannst du Prompts hinzufügen, bearbeiten und mit anderen teilen.
                  </p>
                  <button
                    onClick={handleLogin}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    🔐 Jetzt anmelden
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info für angemeldete Nutzer */}
        {isAuthenticated && !showCreateForm && (
          <div style={{
            background: '#ecfdf5',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            marginBottom: '2rem',
            border: '2px solid var(--green)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <div style={{ flex: 1 }}>
              <strong style={{ color: 'var(--green)' }}>Du bist angemeldet!</strong>
              <span style={{ color: 'var(--gray-dark)', marginLeft: '0.5rem' }}>
                Klicke auf <strong>"➕ Prompt erstellen"</strong> um einen neuen Prompt zu teilen.
              </span>
            </div>
          </div>
        )}

        {/* Create/Edit Form - nur für eingeloggte Nutzer */}
        {isAuthenticated && showCreateForm && (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: 'var(--shadow)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--dark-blue)' }}>
                {editingPromptId ? '✏️ Prompt bearbeiten' : '➕ Neuen Prompt erstellen'}
              </h2>
              {editingPromptId && (
                <button
                  onClick={() => {
                    handleBearbeitenAbbrechen();
                    setShowCreateForm(false);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--gray-light)',
                    color: 'var(--gray-dark)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  ✖️ Abbrechen
                </button>
              )}
            </div>

            {/* Allgemeine Erklärung */}
            {!editingPromptId && (
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                border: '2px solid var(--primary-blue)'
              }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>🎓</span>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--dark-blue)' }}>
                      Teile deine Erfahrung mit anderen!
                    </h3>
                    <p style={{ color: 'var(--gray-dark)', marginBottom: '0.75rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
                      Die Angaben zu <strong>Plattformen, Modellen und Output-Formaten</strong> helfen anderen zu verstehen:
                    </p>
                    <ul style={{ marginLeft: '1.5rem', marginBottom: '0', color: 'var(--gray-dark)', fontSize: '0.95rem', lineHeight: '1.8' }}>
                      <li><strong>Welche KI</strong> du verwendet hast (z.B. ChatGPT GPT-4o, Claude Sonnet 4.5)</li>
                      <li><strong>Welches Ergebnis</strong> die KI ausgegeben hat (Text, PDF, Bild, etc.)</li>
                      <li><strong>Wofür</strong> der Prompt nützlich ist (Übungen, Feedback, Recherche, etc.)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

          {/* Rolle - PFLICHTFELD */}
          <div style={{ 
            marginBottom: '1.5rem',
            padding: '1rem',
            background: '#fef3c7',
            borderRadius: '0.75rem',
            border: '2px solid var(--orange)'
          }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--dark-blue)' }}>
              👤 Deine Rolle * <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>(Pflichtfeld)</span>
            </label>
            <select
              value={neueRolle}
              onChange={(e) => setNeueRolle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: neueRolle ? '2px solid var(--green)' : '2px solid #ef4444',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                background: 'white'
              }}
            >
              <option value="">-- Bitte wähle deine Rolle --</option>
              {ROLLEN.map(rolle => (
                <option key={rolle} value={rolle}>{rolle}</option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-medium)', marginTop: '0.5rem' }}>
              💡 Hilft uns zu verstehen, wer welche Prompts erstellt (für Statistiken)
            </div>
          </div>

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
              Beschreibung <span style={{ fontSize: '0.85rem', color: 'var(--gray-medium)' }}>(optional - Kurze Zusammenfassung)</span>
            </label>
            <textarea
              value={neueBeschreibung}
              onChange={(e) => setNeueBeschreibung(e.target.value)}
              placeholder="z.B. 'Erstellt Mathe-Textaufgaben für die 7. Klasse mit Lösungsweg'"
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
              background: '#fef3c7',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '0.75rem',
              border: '1px solid var(--orange)',
              fontSize: '0.9rem',
              color: 'var(--gray-dark)',
              lineHeight: '1.5'
            }}>
              <strong>💡 Warum ist das wichtig?</strong> Teile mit anderen, <strong>mit welchen KI-Plattformen und Modellen</strong> du diesen Prompt getestet hast. 
              So wissen andere Nutzer:innen, welche KI sie verwenden können und welche Ergebnisse zu erwarten sind.
            </div>
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
              background: '#e0f2fe',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '0.75rem',
              border: '1px solid var(--primary-blue)',
              fontSize: '0.9rem',
              color: 'var(--gray-dark)',
              lineHeight: '1.5'
            }}>
              <strong>📄 Warum ist das wichtig?</strong> Zeige anderen, <strong>in welchem Format</strong> die KI das Ergebnis ausgegeben hat. 
              War es ein Text, ein PDF, Code oder ein Bild? So können andere einschätzen, ob der Prompt für ihr Ziel passt.
            </div>
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
            <div style={{
              background: '#ecfdf5',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '0.75rem',
              border: '1px solid var(--green)',
              fontSize: '0.9rem',
              color: 'var(--gray-dark)',
              lineHeight: '1.5'
            }}>
              <strong>🎯 Warum ist das wichtig?</strong> Kategorisiere deinen Prompt nach <strong>Lernzielen und Einsatzzweck</strong>. 
              So finden andere den Prompt leichter, wenn sie nach bestimmten Anwendungen suchen (z.B. "Übungsaufgaben erstellen" oder "Feedback geben").
            </div>
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
                  {faelle.length > 0 ? (
                    /* Hat Unterkategorien → Zeige diese */
                    faelle.map(fall => (
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
                    ))
                  ) : (
                    /* Keine Unterkategorien → Zeige Hauptkategorie */
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={neueAnwendungsfaelle.includes(kategorie)}
                        onChange={() => toggleAnwendungsfall(kategorie)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{kategorie}</span>
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Tags <span style={{ fontSize: '0.85rem', color: 'var(--gray-medium)' }}>(optional - Komma-getrennt)</span>
            </label>
            <input
              type="text"
              value={neueTags}
              onChange={(e) => setNeueTags(e.target.value)}
              placeholder="Mathematik, Algebra, 7. Klasse, Textaufgaben"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--gray-light)',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            />
            <div style={{ 
              fontSize: '0.85rem', 
              color: 'var(--gray-dark)', 
              marginTop: '0.5rem',
              background: 'var(--gray-light)',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem'
            }}>
              <strong>💡 Tipp:</strong> Trenne mehrere Tags mit <strong>Komma</strong> → andere können dann mit <strong>#Mathematik</strong> suchen
              {neueTags.trim() && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <strong>Deine Tags:</strong>
                  {neueTags.split(',').map((tag, i) => tag.trim() && (
                    <span key={i} style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      background: 'var(--primary-blue)',
                      color: 'white',
                      borderRadius: '1rem',
                      fontSize: '0.85rem'
                    }}>
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Kommentar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Kommentar <span style={{ fontSize: '0.85rem', color: 'var(--gray-medium)' }}>(optional - z.B. Tipps zur Nutzung)</span>
            </label>
            <textarea
              value={neuerKommentar}
              onChange={(e) => setNeuerKommentar(e.target.value)}
              placeholder="z.B. 'Funktioniert besonders gut für Textaufgaben bis 8. Klasse' oder 'Am besten mehrmals durchlaufen lassen'"
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
            onClick={editingPromptId ? handlePromptAktualisieren : handlePromptHinzufuegen}
            style={{
              padding: '1rem 2rem',
              background: editingPromptId 
                ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                : 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: 'var(--shadow)'
            }}
          >
            {editingPromptId ? '✅ Aktualisieren' : '✅ Prompt hinzufügen'}
          </button>
        </div>
        )}

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
            <div>
              <input
                type="text"
                value={suchbegriff}
                onChange={(e) => setSuchbegriff(e.target.value)}
                placeholder="🔍 Suchen... (Tipp: #tag für Hashtags)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--gray-light)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
              {suchbegriff.startsWith('#') && (
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--green)',
                  marginTop: '0.25rem',
                  fontWeight: '500'
                }}>
                  🏷️ Suche nur in Tags
                </div>
              )}
            </div>

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
              {Object.entries(ANWENDUNGSFAELLE).map(([kategorie, unterkategorien]) => (
                <optgroup key={kategorie} label={kategorie}>
                  {/* Hauptkategorie als Option */}
                  <option value={kategorie}>{kategorie}</option>
                  {/* Unterkategorien (falls vorhanden) */}
                  {unterkategorien.map(uk => (
                    <option key={uk} value={uk}>→ {uk}</option>
                  ))}
                </optgroup>
              ))}
            </select>

            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '2px solid var(--gray-light)',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <option value="">Alle Tags 🏷️</option>
              {alleTags.map(tag => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>

            <select
              value={filterRolle}
              onChange={(e) => setFilterRolle(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '2px solid var(--gray-light)',
                borderRadius: '0.5rem',
                fontSize: '1rem'
              }}
            >
              <option value="">Alle Rollen 👥</option>
              {ROLLEN.map(rolle => (
                <option key={rolle} value={rolle}>{rolle}</option>
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

          {/* Filter zurücksetzen Button */}
          {(suchbegriff || filterPlattform || filterOutputFormat || filterAnwendungsfall || filterTag || filterRolle) && (
            <button
              onClick={() => {
                setSuchbegriff('');
                setFilterPlattform('');
                setFilterOutputFormat('');
                setFilterAnwendungsfall('');
                setFilterTag('');
                setFilterRolle('');
              }}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: 'var(--gray-light)',
                color: 'var(--gray-dark)',
                border: '2px solid var(--gray-medium)',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ✖️ Filter zurücksetzen
            </button>
          )}
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
        <div id="prompts-liste" style={{ display: 'grid', gap: '1.5rem' }}>
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
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{
                      fontSize: '1.3rem',
                      color: 'var(--dark-blue)'
                    }}>
                      {prompt.titel}
                    </h3>
                    {istEigenerPrompt(prompt) && (
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: 'var(--green)',
                        color: 'white',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        Dein Prompt
                      </span>
                    )}
                  </div>
                  {prompt.beschreibung && (
                    <p style={{
                      color: 'var(--gray-medium)',
                      fontSize: '0.95rem'
                    }}>
                      {prompt.beschreibung}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {istEigenerPrompt(prompt) && (
                    <button
                      onClick={() => handleBearbeitenStarten(prompt)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--orange)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      ✏️ Bearbeiten
                    </button>
                  )}
                  <button
                    onClick={() => handleLoeschen(prompt.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: istEigenerPrompt(prompt) ? 'var(--red)' : 'var(--gray-light)',
                      color: istEigenerPrompt(prompt) ? 'white' : 'var(--gray-dark)',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {istEigenerPrompt(prompt) ? '🗑️ Löschen' : '📧 Melden'}
                  </button>
                </div>
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
                {Object.keys(prompt.plattformenUndModelle || {}).length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', marginRight: '0.5rem' }}>
                      Plattformen & Modelle:
                    </strong>
                    {Object.entries(prompt.plattformenUndModelle || {}).map(([plattform, modelle]) => (
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
                {(prompt.outputFormate || []).length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', marginRight: '0.5rem' }}>
                      Formate:
                    </strong>
                    {(prompt.outputFormate || []).map(f => (
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
                {(prompt.anwendungsfaelle || []).length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', marginRight: '0.5rem' }}>
                      Anwendung:
                    </strong>
                    {(prompt.anwendungsfaelle || []).map(a => (
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
                {(prompt.tags || []).length > 0 && (
                  <div>
                    <strong style={{ fontSize: '0.9rem', marginRight: '0.5rem' }}>
                      Tags:
                    </strong>
                    {(prompt.tags || []).map((tag, i) => (
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
                      title={`${emoji} ${(prompt.bewertungen || {})[emoji] || 0}`}
                    >
                      {emoji}
                      <span style={{ fontSize: '0.85rem', color: 'var(--gray-medium)' }}>
                        {(prompt.bewertungen || {})[emoji] || 0}
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
