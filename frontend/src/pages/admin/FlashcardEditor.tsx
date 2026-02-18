import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Eye, Plus, X, Clock, AlertCircle, CheckCircle, Upload, Download } from 'lucide-react';
import useAdminContentStore from '../../stores/adminContentStore';
import PublishSettings from '../../components/admin/PublishSettings';
import ContentPreview from '../../components/admin/ContentPreview';
import type { FlashcardDeck, FlashcardItem } from '../../stores/adminContentStore';

const FlashcardEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentFlashcardDeck,
    setCurrentFlashcardDeck,
    updateFlashcardDeckField,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    bulkImportFlashcards,
    saveFlashcardDeckDraft,
    publishFlashcardDeck,
    hasUnsavedChanges,
    lastAutoSave,
    isLoading,
    error,
  } = useAdminContentStore();

  const [showPreview, setShowPreview] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const timer = setTimeout(() => saveFlashcardDeckDraft(), 30000);
    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, saveFlashcardDeckDraft]);

  useEffect(() => {
    if (id && id !== 'new') {
      fetch(`/api/admin/flashcards/${id}`)
        .then((res) => res.json())
        .then((deck) => setCurrentFlashcardDeck(deck))
        .catch((err) => console.error('Failed to load deck:', err));
    } else if (id === 'new') {
      setCurrentFlashcardDeck({
        id: '',
        title: '',
        description: '',
        category: '',
        tags: [],
        cards: [],
        status: 'draft',
        difficulty: 'beginner',
      });
    }
    return () => setCurrentFlashcardDeck(null);
  }, [id, setCurrentFlashcardDeck]);

  if (!currentFlashcardDeck) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading flashcard deck...</p>
        </div>
      </div>
    );
  }

  const handleSaveDraft = async () => {
    setIsSaving(true);
    saveFlashcardDeckDraft();
    setTimeout(() => setIsSaving(false), 500);
  };

  const handlePublish = async () => {
    if (!currentFlashcardDeck.title || currentFlashcardDeck.cards.length === 0) {
      alert('Please add a title and at least one card before publishing');
      return;
    }
    if (confirm('Are you sure you want to publish this flashcard deck?')) {
      await publishFlashcardDeck();
      navigate('/admin/content');
    }
  };

  const handleAddCard = () => {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      alert('Please fill in both front and back of the card');
      return;
    }
    addFlashcard({
      id: `card-${Date.now()}`,
      front: newCard.front.trim(),
      back: newCard.back.trim(),
    });
    setNewCard({ front: '', back: '' });
  };

  const handleBulkImport = () => {
    try {
      // Parse JSON format: [{"front": "...", "back": "..."}, ...]
      const cards = JSON.parse(importText);
      if (!Array.isArray(cards)) throw new Error('Invalid format');

      const validCards = cards.filter(c => c.front && c.back);
      if (validCards.length === 0) throw new Error('No valid cards found');

      bulkImportFlashcards(validCards);
      setImportText('');
      setShowImportDialog(false);
      alert(`Imported ${validCards.length} cards successfully`);
    } catch (error) {
      alert('Failed to import cards. Please check the format.\nExpected: [{"front": "Question", "back": "Answer"}, ...]');
    }
  };

  const exportCards = () => {
    const dataStr = JSON.stringify(currentFlashcardDeck.cards, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentFlashcardDeck.title || 'flashcards'}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (hasUnsavedChanges && !confirm('You have unsaved changes. Are you sure?')) return;
                  navigate('/admin/content');
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {id === 'new' ? 'Create New Flashcard Deck' : 'Edit Flashcard Deck'}
                </h1>
                {lastAutoSave && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last saved: {new Date(lastAutoSave).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Unsaved changes
                </span>
              )}
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={isSaving || !hasUnsavedChanges}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handlePublish}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Deck Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={currentFlashcardDeck.title}
                  onChange={(e) => updateFlashcardDeckField('title', e.target.value)}
                  placeholder="Enter deck title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={currentFlashcardDeck.description}
                  onChange={(e) => updateFlashcardDeckField('description', e.target.value)}
                  placeholder="Brief description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={currentFlashcardDeck.category}
                    onChange={(e) => updateFlashcardDeckField('category', e.target.value)}
                    placeholder="e.g., Playwright Basics"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                  <select
                    value={currentFlashcardDeck.difficulty}
                    onChange={(e) => updateFlashcardDeckField('difficulty', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Add New Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Card</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Front (Question) *</label>
                <textarea
                  value={newCard.front}
                  onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                  placeholder="Enter the question or term"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Back (Answer) *</label>
                <textarea
                  value={newCard.back}
                  onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                  placeholder="Enter the answer or definition"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
              <button
                onClick={handleAddCard}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Card
              </button>
            </div>

            {/* Bulk Import/Export */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Operations</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowImportDialog(true)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import JSON
                </button>
                <button
                  onClick={exportCards}
                  disabled={currentFlashcardDeck.cards.length === 0}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
              </div>
            </div>

            {/* Existing Cards */}
            {currentFlashcardDeck.cards.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cards ({currentFlashcardDeck.cards.length})
                </h2>
                <div className="space-y-2">
                  {currentFlashcardDeck.cards.map((card, index) => (
                    <div
                      key={card.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="mb-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Front:</p>
                            <p className="text-sm text-gray-900 dark:text-white">{card.front}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Back:</p>
                            <p className="text-sm text-gray-900 dark:text-white">{card.back}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteFlashcard(card.id)}
                          className="flex-shrink-0 p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <PublishSettings
              status={currentFlashcardDeck.status}
              scheduledFor={currentFlashcardDeck.scheduledFor}
              onStatusChange={(status) => updateFlashcardDeckField('status', status)}
              onScheduleChange={(date) => updateFlashcardDeckField('scheduledFor', date)}
            />
          </div>
        </div>
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Import Cards from JSON</h2>
              <button
                onClick={() => setShowImportDialog(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paste JSON array of cards. Format: [{"{"}"front": "Question", "back": "Answer"{"}"}]
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='[{"front": "What is Playwright?", "back": "A test automation framework"}]'
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none font-mono text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowImportDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkImport}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <ContentPreview
          content={currentFlashcardDeck}
          type="flashcard"
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default FlashcardEditor;
