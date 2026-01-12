'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Prompt {
  id: string;
  titel: string;
  plattformenUndModelle: { [plattform: string]: string[] };
  outputFormate: string[];
  anwendungsfaelle: string[];
  bewertungen: { [emoji: string]: number };
  nutzungsanzahl: number;
  erstelltVon: string;
  erstelltVonRolle?: string;
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
      const promptsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(prompt => !prompt.deleted) as Prompt[]; // ← Filtere gelöschte Prompts!
      
      setPrompts(promptsData);
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

  // Prompts pro Anwendungsfall
  const promptsProAnwendungsfall: { [key: string]: number } = {};
  prompts.forEach(p => {
    (p.anwendungsfaelle || []).forEach(fall => {
      promptsProAnwendungsfall[fall] = (promptsProAnwendungsfall[fall] || 0) + 1;
    });
  });

  // Prompts pro Rolle
  const promptsProRolle: { [key: string]: number } = {};
  prompts.forEach(p => {
    const rolle = p.erstelltVonRolle || '🔧 Sonstige';
    promptsProRolle[rolle] = (promptsProRolle[rolle] || 0) + 1;
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
              📊 Admin Dashboard
            </h1>
            <p style={{ opacity: 0.9 }}>
              Übersicht über alle Prompts und Statistiken
            </p>
            <p style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '0.25rem' }}>
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(promptsProFormat)
                .sort((a, b) => b[1] - a[1])
                .map(([format, anzahl]) => (
                  <div key={format} style={{
                    padding: '1rem',
                    background: 'var(--light-blue)',
                    borderRadius: '0.5rem',
                    borderLeft: '4px solid var(--primary-blue)'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                      {anzahl}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--gray-dark)' }}>
                      {format}
                    </div>
                  </div>
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(promptsProPlattform)
                .sort((a, b) => b[1] - a[1])
                .map(([plattform, anzahl]) => (
                  <div key={plattform} style={{
                    padding: '1rem',
                    background: 'var(--gray-light)',
                    borderRadius: '0.5rem',
                    borderLeft: '4px solid var(--purple)'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--purple)' }}>
                      {anzahl}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--gray-dark)' }}>
                      {plattform}
                    </div>
                  </div>
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(promptsProAnwendungsfall)
                .sort((a, b) => b[1] - a[1])
                .map(([fall, anzahl]) => (
                  <div key={fall} style={{
                    padding: '1rem',
                    background: '#ecfdf5',
                    borderRadius: '0.5rem',
                    borderLeft: '4px solid var(--green)'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--green)' }}>
                      {anzahl}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--gray-dark)' }}>
                      {fall}
                    </div>
                  </div>
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(promptsProRolle)
                .sort((a, b) => b[1] - a[1])
                .map(([rolle, anzahl]) => (
                  <div key={rolle} style={{
                    padding: '1rem',
                    background: '#fef3c7',
                    borderRadius: '0.5rem',
                    borderLeft: '4px solid var(--orange)'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--orange)' }}>
                      {anzahl}
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--gray-dark)' }}>
                      {rolle}
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
            <div style={{ display: 'grid', gap: '1rem' }}>
              {beliebtestePrompts.map((prompt, index) => {
                const gesamtBewertung = Object.values(prompt.bewertungen || {}).reduce((s, v) => s + v, 0);
                return (
                  <div key={prompt.id} style={{
                    padding: '1rem',
                    background: 'var(--light-blue)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '1rem' }}>
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
                  </div>
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
            <div style={{ display: 'grid', gap: '1rem' }}>
              {meistGenutzt.map((prompt, index) => (
                <div key={prompt.id} style={{
                  padding: '1rem',
                  background: '#ecfdf5',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1rem' }}>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
