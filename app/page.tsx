'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: number;
}

interface Prompt {
  id: string;
  text: string;
  tags: string[];
  category: string;
  comment: string;
  rating: { [emoji: string]: number };
  usageCount: number;
  createdAt: number;
  userId: string;
  userName: string;
  comments: Comment[];
  deletionRequests?: string[];
}

const EMOJIS = ['👍', '❤️', '🔥', '⭐', '💡'];

// Praxisorientierte Anwendungsbereiche für Lehrende UND Lernende
const CATEGORIES = [
  // Für Lernende (Student Agency)
  'Hausaufgaben & Übungen',
  'Prüfungsvorbereitung',
  'Zusammenfassungen erstellen',
  'Texte verbessern',
  'Referate & Präsentationen',
  'Recherche & Quellen',
  'Lernstrategien',
  'Kreatives Schreiben',
  'Mathe & Naturwissenschaften',
  'Sprachen lernen',
  'Projektarbeit (Lernende)',
  'Zeitmanagement',
  
  // Für Lehrende
  'Unterrichtsplanung',
  'Differenzierung',
  'Feedback & Bewertung',
  'Elternkommunikation',
  'Klassenmanagement',
  'Material-Erstellung',
  'Lernziele formulieren',
  'Projektarbeit (Lehrende)',
  'Inklusion & Förderung',
  'Digitale Tools',
  'Prüfungen erstellen',
  'Konfliktlösung',
  'Motivation',
  'Kreative Aufgaben',
  
  // Für beide
  'Sonstiges'
];

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newComment, setNewComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'usage' | 'rating' | 'recent'>('usage');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // User Management
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [showUserSetup, setShowUserSetup] = useState(false);
  
  // Comment Management
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
  const [newCommentText, setNewCommentText] = useState<{[key: string]: string}>({});
  
  // Tag Management
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Admin Email für Löschanfragen
  const ADMIN_EMAIL = 'admin@prompt-manager.com';

  // User Setup beim Start
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedUserName = localStorage.getItem('userName');
    
    if (savedUserId && savedUserName) {
      setCurrentUserId(savedUserId);
      setCurrentUserName(savedUserName);
    } else {
      setShowUserSetup(true);
    }
  }, []);

  // Lade Prompts aus Firebase
  useEffect(() => {
    try {
      const q = query(collection(db, 'prompts'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const promptsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Prompt[];
        
        setPrompts(promptsData);
        
        // Sammle alle einzigartigen Tags
        const tagsSet = new Set<string>();
        promptsData.forEach(prompt => {
          prompt.tags.forEach(tag => tagsSet.add(tag));
        });
        setAllTags(Array.from(tagsSet).sort());
        
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error('Firebase Error:', err);
        setError('Fehler beim Laden der Daten. Überprüfe deine Firebase-Konfiguration.');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Firebase Setup Error:', err);
      setError('Firebase ist nicht konfiguriert. Siehe README.md für Setup-Anleitung.');
      setLoading(false);
    }
  }, []);

  const setupUser = () => {
    const name = window.prompt('Wie möchtest du genannt werden?');
    if (!name?.trim()) return;

    const userId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', name);
    
    setCurrentUserId(userId);
    setCurrentUserName(name);
    setShowUserSetup(false);
  };

  const addTagToInput = (tag: string) => {
    const currentTags = newTags.split(',').map(t => t.trim()).filter(t => t);
    if (!currentTags.includes(tag)) {
      setNewTags([...currentTags, tag].join(', '));
    }
  };

  const getTagSuggestions = () => {
    const currentTags = newTags.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
    return allTags.filter(tag => 
      !currentTags.includes(tag.toLowerCase()) &&
      (newTags === '' || tag.toLowerCase().includes(newTags.split(',').pop()?.trim().toLowerCase() || ''))
    ).slice(0, 10);
  };

  const addPrompt = async () => {
    if (!newPrompt.trim()) {
      alert('Bitte gib einen Prompt ein');
      return;
    }
    if (!newCategory) {
      alert('Bitte wähle einen Anwendungsbereich aus');
      return;
    }

    try {
      const promptData = {
        text: newPrompt,
        tags: newTags.split(',').map(t => t.trim()).filter(t => t),
        category: newCategory,
        comment: newComment,
        rating: {},
        usageCount: 0,
        createdAt: Date.now(),
        userId: currentUserId,
        userName: currentUserName,
        comments: [],
        deletionRequests: [],
      };

      await addDoc(collection(db, 'prompts'), promptData);
      
      setNewPrompt('');
      setNewTags('');
      setNewCategory('');
      setNewComment('');
    } catch (err) {
      console.error('Error adding prompt:', err);
      alert('Fehler beim Speichern des Prompts');
    }
  };

  const addRating = async (promptId: string, emoji: string) => {
    try {
      const prompt = prompts.find(p => p.id === promptId);
      if (!prompt) return;

      const newRating = { ...prompt.rating };
      newRating[emoji] = (newRating[emoji] || 0) + 1;

      await updateDoc(doc(db, 'prompts', promptId), {
        rating: newRating
      });
    } catch (err) {
      console.error('Error updating rating:', err);
    }
  };

  const incrementUsage = async (promptId: string) => {
    try {
      const prompt = prompts.find(p => p.id === promptId);
      if (!prompt) return;

      await updateDoc(doc(db, 'prompts', promptId), {
        usageCount: prompt.usageCount + 1
      });
    } catch (err) {
      console.error('Error updating usage:', err);
    }
  };

  const deletePrompt = async (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;

    // Wenn User der Ersteller ist, direkt löschen
    if (prompt.userId === currentUserId) {
      if (!confirm('Möchtest du diesen Prompt wirklich löschen?')) return;
      
      try {
        await deleteDoc(doc(db, 'prompts', promptId));
      } catch (err) {
        console.error('Error deleting prompt:', err);
        alert('Fehler beim Löschen des Prompts');
      }
    } else {
      // Andernfalls Löschanfrage stellen
      await requestDeletion(promptId);
    }
  };

  const requestDeletion = async (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;

    // Check ob User bereits angefragt hat
    if (prompt.deletionRequests?.includes(currentUserId)) {
      alert('Du hast bereits eine Löschanfrage für diesen Prompt gestellt.');
      return;
    }

    if (!confirm('Du kannst diesen Prompt nicht löschen, da du ihn nicht erstellt hast. Möchtest du eine Löschanfrage stellen? Der Admin wird per Email benachrichtigt.')) return;

    try {
      const updatedRequests = [...(prompt.deletionRequests || []), currentUserId];
      await updateDoc(doc(db, 'prompts', promptId), {
        deletionRequests: updatedRequests
      });

      console.log(`Löschanfrage gesendet an ${ADMIN_EMAIL} für Prompt ${promptId} von User ${currentUserName}`);
      
      alert('Löschanfrage wurde gestellt. Der Admin wurde benachrichtigt.');
    } catch (err) {
      console.error('Error requesting deletion:', err);
      alert('Fehler beim Stellen der Löschanfrage');
    }
  };

  const addComment = async (promptId: string) => {
    const commentText = newCommentText[promptId];
    if (!commentText?.trim()) return;

    try {
      const prompt = prompts.find(p => p.id === promptId);
      if (!prompt) return;

      const newComment: Comment = {
        id: Date.now().toString(),
        userId: currentUserId,
        userName: currentUserName,
        text: commentText,
        createdAt: Date.now(),
      };

      const updatedComments = [...(prompt.comments || []), newComment];
      await updateDoc(doc(db, 'prompts', promptId), {
        comments: updatedComments
      });

      setNewCommentText({ ...newCommentText, [promptId]: '' });
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Fehler beim Hinzufügen des Kommentars');
    }
  };

  const getTotalRating = (rating: { [emoji: string]: number }) => {
    return Object.values(rating).reduce((sum, count) => sum + count, 0);
  };

  const filteredAndSortedPrompts = prompts
    .filter(p => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        p.text.toLowerCase().includes(searchLower) ||
        p.tags.some(t => t.toLowerCase().includes(searchLower)) ||
        p.comment.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
      );
      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      const matchesTag = !tagFilter || p.tags.some(t => t.toLowerCase() === tagFilter.toLowerCase());
      return matchesSearch && matchesCategory && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'usage') {
        return b.usageCount - a.usageCount;
      } else if (sortBy === 'rating') {
        return getTotalRating(b.rating) - getTotalRating(a.rating);
      } else {
        return b.createdAt - a.createdAt;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* User Setup Modal */}
        {showUserSetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                👋 Willkommen!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Bitte gib deinen Namen ein, um Prompts zu erstellen und zu kommentieren.
              </p>
              <button
                onClick={setupUser}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Namen eingeben
              </button>
            </div>
          </div>
        )}

        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
            📝 Prompt Manager für Bildung
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Sammle, bewerte und teile erfolgreiche KI-Prompts – für Lernende & Lehrende
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            🔄 Echtzeit-Sync über alle Geräte | 🎓 Student Agency im Fokus
          </p>
          {currentUserName && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Angemeldet als: <strong>{currentUserName}</strong>
            </p>
          )}
        </header>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-6 py-4 rounded-2xl mb-8">
            <p className="font-bold mb-2">⚠️ Firebase Fehler</p>
            <p>{error}</p>
            <p className="mt-2 text-sm">
              Siehe <code className="bg-red-200 dark:bg-red-800 px-2 py-1 rounded">README.md</code> für Setup-Anleitung.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Lade Prompts...</p>
          </div>
        )}

        {!loading && !error && (
          <>
        {/* Neuen Prompt hinzufügen */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            ✨ Neuen Prompt hinzufügen
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Anwendungsbereich *
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Bitte wählen...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prompt Text *
              </label>
              <textarea
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="Gib hier deinen erfolgreichen Prompt ein..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (kommagetrennt)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  placeholder="z.B. Mathe, Grundschule, Gruppenarbeit"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                
                {/* Tag Vorschläge */}
                {showTagSuggestions && getTagSuggestions().length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                      Vorhandene Tags (klicken zum Hinzufügen):
                    </div>
                    {getTagSuggestions().map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={() => addTagToInput(tag)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-800 dark:text-white"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Häufigste Tags */}
              {allTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Beliebte Tags:</span>
                  {allTags.slice(0, 8).map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addTagToInput(tag)}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Beschreibung / Notizen
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Beschreibe, wann und wie dieser Prompt am besten funktioniert..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                rows={3}
              />
            </div>

            <button
              onClick={addPrompt}
              disabled={!currentUserId}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prompt hinzufügen
            </button>
          </div>
        </div>

        {/* Suche und Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Suche nach Prompts, Tags, Kategorien oder Beschreibungen..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Alle Anwendungsbereiche</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Alle Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full md:w-auto px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="usage">Nach Nutzung</option>
                  <option value="rating">Nach Bewertung</option>
                  <option value="recent">Neueste zuerst</option>
                </select>
              </div>
            </div>
            
            {/* Aktive Filter anzeigen */}
            {(categoryFilter || tagFilter) && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Aktive Filter:</span>
                {categoryFilter && (
                  <button
                    onClick={() => setCategoryFilter('')}
                    className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-purple-200 dark:hover:bg-purple-800"
                  >
                    {categoryFilter} <span className="text-lg">×</span>
                  </button>
                )}
                {tagFilter && (
                  <button
                    onClick={() => setTagFilter('')}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    {tagFilter} <span className="text-lg">×</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setCategoryFilter('');
                    setTagFilter('');
                  }}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Alle Filter zurücksetzen
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {filteredAndSortedPrompts.length} Prompt(s) gefunden
          </div>
        </div>

        {/* Prompt Liste */}
        <div className="space-y-6">
          {filteredAndSortedPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-bold">
                      {prompt.category}
                    </span>
                    {prompt.tags.map((tag, idx) => (
                      <button
                        key={idx}
                        onClick={() => setTagFilter(tag)}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
                        title={`Nach "${tag}" filtern`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-gray-800 dark:text-white text-lg whitespace-pre-wrap mb-3">
                    {prompt.text}
                  </p>
                  
                  {prompt.comment && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm italic mb-2">
                      💬 {prompt.comment}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Erstellt von: <strong>{prompt.userName}</strong>
                  </p>
                  
                  {prompt.deletionRequests && prompt.deletionRequests.length > 0 && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      ⚠️ {prompt.deletionRequests.length} Löschanfrage(n) ausstehend
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => deletePrompt(prompt.id)}
                  className="ml-4 text-red-500 hover:text-red-700 text-xl"
                  title={prompt.userId === currentUserId ? "Löschen" : "Löschung beantragen"}
                >
                  {prompt.userId === currentUserId ? '🗑️' : '🚫'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => incrementUsage(prompt.id)}
                    className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors font-medium"
                  >
                    ✓ Verwendet ({prompt.usageCount})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addRating(prompt.id, emoji)}
                      className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
                      title={`Mit ${emoji} bewerten`}
                    >
                      <span className="text-xl">{emoji}</span>
                      {prompt.rating[emoji] && (
                        <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {prompt.rating[emoji]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                  Gesamt: {getTotalRating(prompt.rating)} Bewertungen
                </div>
              </div>

              {/* Kommentare Bereich */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowComments({...showComments, [prompt.id]: !showComments[prompt.id]})}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  💬 Kommentare ({prompt.comments?.length || 0})
                  {showComments[prompt.id] ? ' ▼' : ' ▶'}
                </button>

                {showComments[prompt.id] && (
                  <div className="mt-4 space-y-3">
                    {/* Bestehende Kommentare */}
                    {prompt.comments && prompt.comments.length > 0 && (
                      <div className="space-y-2">
                        {prompt.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {comment.userName}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200">
                              {comment.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Neuen Kommentar hinzufügen */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCommentText[prompt.id] || ''}
                        onChange={(e) => setNewCommentText({...newCommentText, [prompt.id]: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && addComment(prompt.id)}
                        placeholder="Kommentar hinzufügen..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        disabled={!currentUserId}
                      />
                      <button
                        onClick={() => addComment(prompt.id)}
                        disabled={!currentUserId || !newCommentText[prompt.id]?.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        Senden
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredAndSortedPrompts.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {searchTerm || categoryFilter ? (
                <>
                  <p className="text-xl mb-2">🔍 Keine Prompts gefunden</p>
                  <p>Versuche einen anderen Suchbegriff oder Filter</p>
                </>
              ) : (
                <>
                  <p className="text-xl mb-2">📝 Noch keine Prompts</p>
                  <p>Füge deinen ersten erfolgreichen Prompt hinzu!</p>
                </>
              )}
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}
