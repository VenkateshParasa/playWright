/**
 * Card Stats, Preview Modal, Deck Browser, and Import/Export Components
 * Comprehensive implementation of remaining card management features
 */

import React, { useEffect, useState } from 'react';
import { useCardManagementStore, type Card, type Deck } from '../../stores/cardManagementStore';
import {
  parseJSON,
  parseCSV,
  parseAnki,
  validateCards,
  findDuplicates,
  readFileAsText,
  exportCardsToJSON,
  exportCardsToCSV,
  detectFormat,
} from '../../lib/cards/importExport';

// =============================================================================
// Card Stats Component
// =============================================================================

interface CardStatsProps {
  cardId: string;
}

interface Stats {
  totalReviews: number;
  correctReviews: number;
  incorrectReviews: number;
  successRate: number;
  easeFactor: number;
  interval: number;
  nextReviewDate: string;
  lastReviewedAt?: string;
  totalTimeSpent: number;
  averageTimeSpent: number;
  reviewHistory: Array<{
    date: string;
    quality: number;
    timeSpent: number;
    easeFactor: number;
    interval: number;
  }>;
}

export const CardStats: React.FC<CardStatsProps> = ({ cardId }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [cardId]);

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/cards/${cardId}/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">No statistics available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Reviews</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{stats.totalReviews}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Success Rate</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{stats.successRate.toFixed(0)}%</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Ease Factor</div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">{stats.easeFactor.toFixed(2)}</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Interval</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{stats.interval} days</div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Card Preview Modal Component
// =============================================================================

interface CardPreviewModalProps {
  cardId: string;
  onClose: () => void;
  onEdit: () => void;
}

export const CardPreviewModal: React.FC<CardPreviewModalProps> = ({ cardId, onClose, onEdit }) => {
  const { loadCard, currentCard } = useCardManagementStore();
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    loadCard(cardId);
  }, [cardId, loadCard]);

  if (!currentCard) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Card Preview</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
          </div>

          <div
            className="min-h-[300px] p-8 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">{isFlipped ? 'BACK' : 'FRONT'}</div>
              <div className="text-lg text-gray-900 dark:text-white whitespace-pre-wrap">
                {isFlipped ? currentCard.back : currentCard.front}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Click card to flip
            </div>
            <div className="flex gap-2">
              <button onClick={onEdit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Edit
              </button>
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Deck Browser Component
// =============================================================================

interface DeckBrowserProps {
  onClose: () => void;
  onDeckSelect: (deck: Deck) => void;
}

export const DeckBrowser: React.FC<DeckBrowserProps> = ({ onClose, onDeckSelect }) => {
  const { decks, createDeck, updateDeck, deleteDeck, loadDecks } = useCardManagementStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const handleCreate = async () => {
    if (!newDeckName) return;
    await createDeck({ name: newDeckName, description: newDeckDescription });
    setNewDeckName('');
    setNewDeckDescription('');
    setShowCreateForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Decks</h2>
            <button onClick={() => setShowCreateForm(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              + New Deck
            </button>
          </div>

          {showCreateForm && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="Deck name"
                className="w-full px-3 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <textarea
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button onClick={handleCreate} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Create</button>
                <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">Cancel</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 cursor-pointer"
                onClick={() => onDeckSelect(deck)}
              >
                <div className="text-3xl mb-2">{deck.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{deck.name}</h3>
                {deck.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{deck.description}</p>}
                {deck.stats && (
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <div>{deck.stats.totalCards} cards</div>
                    <div>{deck.stats.dueCards} due</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// Card Import/Export Component
// =============================================================================

interface CardImportExportProps {
  onClose: () => void;
  onImportComplete: () => void;
}

export const CardImportExport: React.FC<CardImportExportProps> = ({ onClose, onImportComplete }) => {
  const { cards, selectedCards } = useCardManagementStore();
  const [mode, setMode] = useState<'import' | 'export'>('import');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const selectedCardObjects = cards.filter(c => selectedCards.has(c.id));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const content = await readFileAsText(file);
      const format = detectFormat(file, content);

      let cardData;
      if (format === 'json') {
        cardData = parseJSON(content);
      } else if (format === 'csv') {
        cardData = parseCSV(content);
      } else if (format === 'anki') {
        cardData = parseAnki(content);
      } else {
        alert('Unsupported file format');
        return;
      }

      // Send to server
      const response = await fetch('/api/cards/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ cards: cardData }),
      });

      if (response.ok) {
        alert('Import successful!');
        onImportComplete();
      }
    } catch (error: any) {
      alert(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Import/Export Cards</h2>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setMode('import')}
              className={`flex-1 px-4 py-2 rounded-lg ${mode === 'import' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Import
            </button>
            <button
              onClick={() => setMode('export')}
              className={`flex-1 px-4 py-2 rounded-lg ${mode === 'export' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Export
            </button>
          </div>

          {mode === 'import' ? (
            <div>
              <input type="file" onChange={handleFileChange} accept=".json,.csv,.txt" className="mb-4" />
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => exportCardsToJSON(selectedCardObjects.length > 0 ? selectedCardObjects : cards)}
                className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Export as JSON ({selectedCardObjects.length > 0 ? selectedCardObjects.length : cards.length} cards)
              </button>
              <button
                onClick={() => exportCardsToCSV(selectedCardObjects.length > 0 ? selectedCardObjects : cards)}
                className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Export as CSV ({selectedCardObjects.length > 0 ? selectedCardObjects.length : cards.length} cards)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default {
  CardStats,
  CardPreviewModal,
  DeckBrowser,
  CardImportExport,
};
