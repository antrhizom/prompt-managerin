'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Konstanten für ALLE Kategorien (auch wenn 0 Prompts)
const ALLE_ROLLEN = [
  '👨‍🏫 Lehrperson',
  '🎓 Lernende',
  '👨‍🎓 Schüler*in',
  '📚 Student*in',
  '🏭 Berufsbildner*in',
  '🏢 Schulverwaltung',
  '📖 Angestellte Mediothek',
  '🔧 Sonstige'
];

const ALLE_BILDUNGSSTUFEN = [
  '🎨 Primar',
  '📐 Sekundar I',
  '🏭 Berufsfachschule',
  '🏛️ Gymnasium',
  '🎓 Fachhochschule',
  '📚 Höhere Fachschule',
  '🏫 Universität',
  '⚙️ ETH'
];

const ALLE_ANWENDUNGSFAELLE = [
  // Interaktive Internetseiten
  'Formative Lernkontrolle',
  'Summative Lernkontrolle',
  'Lernfeedback',
  'Visualisierung von Lerninhalten',
  // Design Office Programme
  'Word',
  'Excel',
  'Powerpoint',
  // Lerndossier Text
  'Aufgabenblatt',
  'Übungsblatt',
  // Projektmanagement
  'Aktivitätsdossier',
  'Aufgabenübersicht',
  // Administration
  'E-Mail-Texte',
  'Informationsbroschüren',
  'Flyer',
  // Prüfungen
  'Fragenvielfalt',
  'Fragenarchiv',
  // KI-Assistenten
  'Custom Prompt',
  'Lern-Bot',
  'Gesprächsbot',
  'Organisationsbot',
  'Korrekturbot',
  // Fotos
  'Photoshop',
  'Fotoreportagen',
  // Grafik und Infografik/Diagramme
  'HTML-Grafik',
  'Bild-Grafik',
  // Social Media Inhalte
  'Reel',
  'Gif',
  'Memes'
];

interface Prompt {
  id: string;
  titel: string;
  plattformenUndModelle: { [plattform: string]: string[] };
  outputFormate: string[];
  anwendungsfaelle: string[];
  tags?: string[];
  bewertungen: { [emoji: string]: number };
  nutzungsanzahl: number;
  erstelltVon: string;
  erstelltVonRolle?: string;
  bildungsstufe?: string;
  erstelltAm: { seconds: number };
  deleted?: boolean; // ← Für Soft Delete
}

export default function AdminDashboard() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = () => {
    setLoading(true);
    setLastRefresh(new Date());
    // onSnapshot wird automatisch neu geladen
    setTimeout(() => setLoading(false), 500);
  };

  useEffect(() => {
    const q = query(collection(db, 'prompts'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allPrompts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Prompt[];
      
      // Filtere gelöschte Prompts
      const activePrompts = allPrompts.filter(prompt => !prompt.deleted);
      
      setPrompts(activePrompts);
      setLoading(false);
    }, (error) => {
      console.error('Firebase Fehler:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // STATISTIKEN BERECHNEN
  // ============================================

  // Anzahl eindeutige Nutzer
  const anzahlNutzer = new Set(prompts.map(p => p.erstelltVon)).size;

  // Gesamte Bewertungen
  const gesamtBewertungen = prompts.reduce((sum, p) => 
    sum + Object.values(p.bewertungen || {}).reduce((s, v) => s + v, 0), 0
  );

  // Gesamte Nutzungen
  const gesamtNutzungen = prompts.reduce((sum, p) => sum + p.nutzungsanzahl, 0);

  // Prompts pro Output-Format
  const promptsProFormat: { [key: string]: number } = {};
  prompts.forEach(p => {
    (p.outputFormate || []).forEach(format => {
      promptsProFormat[format] = (promptsProFormat[format] || 0) + 1;
    });
  });

  // Prompts pro Plattform
  const promptsProPlattform: { [key: string]: number } = {};
  prompts.forEach(p => {
    Object.keys(p.plattformenUndModelle || {}).forEach(plattform => {
      promptsProPlattform[plattform] = (promptsProPlattform[plattform] || 0) + 1;
    });
  });

  // Prompts pro Modell (Top 10)
  const promptsProModell: { [key: string]: number } = {};
  prompts.forEach(p => {
    Object.values(p.plattformenUndModelle || {}).flat().forEach(modell => {
      promptsProModell[modell] = (promptsProModell[modell] || 0) + 1;
    });
  });
  const topModelle = Object.entries(promptsProModell)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Prompts pro Anwendungsfall (zeige ALLE neuen Kategorien, auch mit 0 Prompts)
  const promptsProAnwendungsfall: { [key: string]: number } = {};
  // Initialisiere alle neuen Anwendungsfälle mit 0
  ALLE_ANWENDUNGSFAELLE.forEach(fall => {
    promptsProAnwendungsfall[fall] = 0;
  });
  // Zähle tatsächliche Prompts (auch alte Kategorien werden mitgezählt)
  prompts.forEach(p => {
    (p.anwendungsfaelle || []).forEach(fall => {
      if (promptsProAnwendungsfall[fall] !== undefined) {
        promptsProAnwendungsfall[fall]++;
      } else {
        // Alte Kategorien die nicht in ALLE_ANWENDUNGSFAELLE sind
        promptsProAnwendungsfall[fall] = (promptsProAnwendungsfall[fall] || 0) + 1;
      }
    });
  });

  // Prompts pro Rolle (zeige ALLE Rollen, auch mit 0 Prompts)
  const promptsProRolle: { [key: string]: number } = {};
  // Initialisiere alle Rollen mit 0
  ALLE_ROLLEN.forEach(rolle => {
    promptsProRolle[rolle] = 0;
  });
  // Zähle tatsächliche Prompts
  prompts.forEach(p => {
    const rolle = p.erstelltVonRolle || '🔧 Sonstige';
    if (promptsProRolle[rolle] !== undefined) {
      promptsProRolle[rolle]++;
    } else {
      // Falls eine Rolle in Daten existiert die nicht in ALLE_ROLLEN ist
      promptsProRolle[rolle] = 1;
    }
  });

  // Prompts pro Bildungsstufe (NEU)
  const promptsProBildungsstufe: { [key: string]: number } = {};
  // Initialisiere alle Bildungsstufen mit 0
  ALLE_BILDUNGSSTUFEN.forEach(stufe => {
    promptsProBildungsstufe[stufe] = 0;
  });
  // Zähle tatsächliche Prompts
  prompts.forEach(p => {
    if (p.bildungsstufe) {
      if (promptsProBildungsstufe[p.bildungsstufe] !== undefined) {
        promptsProBildungsstufe[p.bildungsstufe]++;
      } else {
        // Falls eine Stufe in Daten existiert die nicht in ALLE_BILDUNGSSTUFEN ist
        promptsProBildungsstufe[p.bildungsstufe] = 1;
      }
    }
  });

  // Aktivste Nutzer (Top 5)
  const promptsProNutzer: { [key: string]: number } = {};
  prompts.forEach(p => {
    promptsProNutzer[p.erstelltVon] = (promptsProNutzer[p.erstelltVon] || 0) + 1;
  });
  const aktivsteNutzer = Object.entries(promptsProNutzer)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Beliebteste Prompts (Top 5 nach Bewertungen)
  const beliebtestePrompts = [...prompts]
    .sort((a, b) => {
      const summeA = Object.values(a.bewertungen || {}).reduce((s, v) => s + v, 0);
      const summeB = Object.values(b.bewertungen || {}).reduce((s, v) => s + v, 0);
      return summeB - summeA;
    })
    .slice(0, 5);

  // Meist genutzte Prompts (Top 5)
  const meistGenutzt = [...prompts]
    .sort((a, b) => (b.nutzungsanzahl || 0) - (a.nutzungsanzahl || 0))
    .slice(0, 5);

  // Häufigste Hashtags (Top 15)
  const hashtagZaehler: { [tag: string]: number } = {};
  prompts.forEach(p => {
    (p.tags || []).forEach((tag: string) => {
      if (tag && tag.trim()) {
        const cleanTag = tag.trim().toLowerCase();
        hashtagZaehler[cleanTag] = (hashtagZaehler[cleanTag] || 0) + 1;
      }
    });
  });
  const topHashtags = Object.entries(hashtagZaehler)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ fontSize: '1.5rem', color: 'var(--gray-medium)' }}>
          Lade Dashboard...
        </p>
      </div>
    );
  }

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
              📊 Dashboard Aktivität
            </h1>
            <p style={{ opacity: 0.9, marginBottom: '0.5rem' }}>
              Übersicht über alle Prompts und Aktivitäten
            </p>
            <div style={{ 
              background: 'rgba(255,255,255,0.15)', 
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginTop: '0.75rem',
              fontSize: '0.9rem',
              lineHeight: '1.6'
            }}>
              <strong>💡 So funktioniert's:</strong> Hier siehst du alle Aktivitäten und Statistiken.
              <strong> Klicke auf eine Rolle</strong> (z.B. "Lehrperson" oder "Lernende"), 
              um zur Startseite zu springen und nur Prompts dieser Rolle zu sehen.
            </div>
            <p style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Letztes Update: {lastRefresh.toLocaleTimeString('de-DE')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleRefresh}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: loading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '🔄 Lädt...' : '🔄 Aktualisieren'}
            </button>
            <Link 
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid white',
                borderRadius: '0.5rem',
                fontWeight: '600'
              }}
            >
              ← Zurück
            </Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Hinweis bei Cache-Problemen */}
        {prompts.length > 0 && (
          <div style={{
            background: '#fef3c7',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            border: '2px solid var(--orange)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span>
            <div style={{ flex: 1 }}>
              <strong>Hinweis:</strong> Falls gelöschte Prompts noch angezeigt werden, klicke auf "🔄 Aktualisieren" um die neuesten Daten zu laden.
            </div>
          </div>
        )}

        {/* Übersicht-Karten */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {anzahlNutzer}
            </div>
            <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>
              Registrierte Nutzer
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {prompts.length}
            </div>
            <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>
              Prompts gesamt
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {gesamtBewertungen}
            </div>
            <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>
              Bewertungen (Likes)
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {gesamtNutzungen}
            </div>
            <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>
              Kopiert & Genutzt
            </div>
          </div>
        </div>

        {/* Detaillierte Statistiken */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Output-Formate */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--dark-blue)' }}>
              Prompts pro Output-Format
            </h2>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'var(--gray-dark)', 
              marginBottom: '1rem',
              background: 'var(--gray-light)',
              padding: '0.75rem',
              borderRadius: '0.5rem'
            }}>
              💡 <strong>Tipp:</strong> Klicke auf ein Format, um zur Startseite zu springen und nur Prompts mit diesem Output-Format zu sehen.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(promptsProFormat)
                .sort((a, b) => b[1] - a[1])
                .map(([format, anzahl]) => (
                  <Link 
                    key={format} 
                    href={`/?format=${encodeURIComponent(format)}`}
                    style={{
                      padding: '1rem',
                      background: 'var(--light-blue)',
                      borderRadius: '0.5rem',
                      borderLeft: '4px solid var(--primary-blue)',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                      {anzahl}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', marginBottom: '0.25rem' }}>
                      {format}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-medium)', marginTop: '0.5rem' }}>
                      → Klicken zum Filtern
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Plattformen */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--dark-blue)' }}>
              Prompts pro Plattform
            </h2>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'var(--gray-dark)', 
              marginBottom: '1rem',
              background: 'var(--gray-light)',
              padding: '0.75rem',
              borderRadius: '0.5rem'
            }}>
              💡 <strong>Tipp:</strong> Klicke auf eine Plattform, um zur Startseite zu springen und nur Prompts dieser Plattform zu sehen.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(promptsProPlattform)
                .sort((a, b) => b[1] - a[1])
                .map(([plattform, anzahl]) => (
                  <Link 
                    key={plattform} 
                    href={`/?plattform=${encodeURIComponent(plattform)}`}
                    style={{
                      padding: '1rem',
                      background: 'var(--gray-light)',
                      borderRadius: '0.5rem',
                      borderLeft: '4px solid var(--purple)',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--purple)' }}>
                      {anzahl}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', marginBottom: '0.25rem' }}>
                      {plattform}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-medium)', marginTop: '0.5rem' }}>
                      → Klicken zum Filtern
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Top 10 Modelle */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--dark-blue)' }}>
              Top 10 Modelle
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {topModelle.map(([modell, anzahl], index) => (
                <div key={modell} style={{
                    padding: '1rem',
                    background: index < 3 ? '#fef3c7' : 'var(--gray-light)',
                    borderRadius: '0.5rem',
                    borderLeft: `4px solid ${index < 3 ? 'var(--orange)' : 'var(--teal)'}`
                  }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem'
                  }}>
                    {index < 3 && (
                      <span style={{ fontSize: '1.2rem' }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: index < 3 ? 'var(--orange)' : 'var(--teal)'
                    }}>
                      {anzahl}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--gray-dark)' }}>
                    {modell}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 15 Häufigste Hashtags */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--dark-blue)' }}>
              🏷️ Top 15 Häufigste Hashtags
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '1rem'
            }}>
              {topHashtags.map(([tag, anzahl], index) => (
                <div key={tag} style={{
                  padding: '0.75rem',
                  background: index < 3 ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'var(--gray-light)',
                  borderRadius: '0.5rem',
                  borderLeft: `4px solid ${index < 3 ? '#d97706' : 'var(--teal)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '0.9rem',
                    color: index < 3 ? '#78350f' : 'var(--gray-dark)',
                    fontWeight: index < 3 ? '600' : '500',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    #{tag}
                  </div>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: index < 3 ? '#92400e' : 'var(--teal)',
                    marginLeft: '0.5rem',
                    flexShrink: 0
                  }}>
                    {anzahl}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anwendungsfälle */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--dark-blue)' }}>
              Prompts pro Anwendungsfall
            </h2>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'var(--gray-dark)', 
              marginBottom: '1rem',
              background: 'var(--gray-light)',
              padding: '0.75rem',
              borderRadius: '0.5rem'
            }}>
              💡 <strong>Tipp:</strong> Klicke auf einen Anwendungsfall, um zur Startseite zu springen und nur Prompts mit diesem Anwendungsfall zu sehen.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(promptsProAnwendungsfall)
                .sort((a, b) => b[1] - a[1])
                .map(([fall, anzahl]) => (
                  <Link 
                    key={fall} 
                    href={`/?anwendungsfall=${encodeURIComponent(fall)}`}
                    style={{
                      padding: '1rem',
                      background: '#ecfdf5',
                      borderRadius: '0.5rem',
                      borderLeft: '4px solid var(--green)',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--green)' }}>
                      {anzahl}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', marginBottom: '0.25rem' }}>
                      {fall}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-medium)', marginTop: '0.5rem' }}>
                      → Klicken zum Filtern
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Prompts pro Rolle */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--dark-blue)' }}>
              👥 Prompts pro Rolle
            </h2>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'var(--gray-dark)', 
              marginBottom: '1rem',
              background: 'var(--gray-light)',
              padding: '0.75rem',
              borderRadius: '0.5rem'
            }}>
              💡 <strong>Tipp:</strong> Klicke auf eine Rolle, um zur Startseite zu springen und nur Prompts dieser Rolle zu sehen.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(promptsProRolle)
                .sort((a, b) => b[1] - a[1])
                .map(([rolle, anzahl]) => (
                  <Link 
                    key={rolle} 
                    href={`/?rolle=${encodeURIComponent(rolle)}`}
                    style={{
                      padding: '1rem',
                      background: '#fef3c7',
                      borderRadius: '0.5rem',
                      borderLeft: '4px solid var(--orange)',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--orange)' }}>
                      {anzahl}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', marginBottom: '0.25rem' }}>
                      {rolle}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-medium)', marginTop: '0.5rem' }}>
                      → Klicken zum Filtern
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Prompts pro Bildungsstufe */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--dark-blue)' }}>
              🎓 Prompts pro Bildungsstufe
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(promptsProBildungsstufe)
                .sort((a, b) => b[1] - a[1])
                .map(([stufe, anzahl]) => (
                  <div 
                    key={stufe}
                    style={{
                      padding: '1rem',
                      background: '#dbeafe',
                      borderRadius: '0.5rem',
                      borderLeft: '4px solid #3b82f6'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1d4ed8' }}>
                      {anzahl}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--gray-dark)' }}>
                      {stufe}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Top 5 Aktivste Nutzer */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--dark-blue)' }}>
              Top 5 Aktivste Nutzer
            </h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {aktivsteNutzer.map(([userId, anzahl], index) => (
                <div key={userId} style={{
                  padding: '1rem',
                  background: 'var(--gray-light)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                        {userId}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--gray-medium)' }}>
                        User ID
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--primary-blue)'
                  }}>
                    {anzahl} Prompts
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Beliebteste Prompts */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--dark-blue)' }}>
              Top 5 Beliebteste Prompts (Bewertungen)
            </h2>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'var(--gray-dark)', 
              marginBottom: '1rem',
              background: 'var(--gray-light)',
              padding: '0.75rem',
              borderRadius: '0.5rem'
            }}>
              💡 <strong>Tipp:</strong> Klicke auf einen Prompt, um ihn auf der Startseite zu finden.
            </p>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {beliebtestePrompts.map((prompt, index) => {
                const gesamtBewertung = Object.values(prompt.bewertungen || {}).reduce((s, v) => s + v, 0);
                return (
                  <Link
                    key={prompt.id}
                    href={`/?suche=${encodeURIComponent(prompt.titel)}`}
                    style={{
                      padding: '1rem',
                      background: 'var(--light-blue)',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--dark-blue)' }}>
                          {prompt.titel}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--gray-medium)', marginTop: '0.25rem' }}>
                          {Object.entries(prompt.bewertungen || {})
                            .filter(([_, count]) => count > 0)
                            .map(([emoji, count]) => `${emoji} ${count}`)
                            .join(' · ')}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: 'var(--primary-blue)'
                    }}>
                      ❤️ {gesamtBewertung}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Top 5 Meist Genutzte Prompts */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--dark-blue)' }}>
              Top 5 Meist Genutzte Prompts (Kopiert)
            </h2>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'var(--gray-dark)', 
              marginBottom: '1rem',
              background: 'var(--gray-light)',
              padding: '0.75rem',
              borderRadius: '0.5rem'
            }}>
              💡 <strong>Tipp:</strong> Klicke auf einen Prompt, um ihn auf der Startseite zu finden.
            </p>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {meistGenutzt.map((prompt, index) => (
                <Link
                  key={prompt.id}
                  href={`/?suche=${encodeURIComponent(prompt.titel)}`}
                  style={{
                    padding: '1rem',
                    background: '#ecfdf5',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--dark-blue)' }}>
                        {prompt.titel}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--green)'
                  }}>
                    📋 {prompt.nutzungsanzahl}×
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
