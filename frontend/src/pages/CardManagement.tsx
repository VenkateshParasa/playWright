/**
 * Card Management Page
 * Main page for browsing, editing, and managing flashcard decks and cards
 */

import React, { useEffect, useState } from 'react';
import { useCardManagementStore } from '../stores/cardManagementStore';
import CardBrowser from '../components/flashcards/CardBrowser';
import CardFilters from '../components/flashcards/CardFilters';
import CardSearch from '../components/flashcards/CardSearch';
import BulkActions from '../components/flashcards/BulkActions';
import CardEditor from '../components/flashcards/CardEditor';
import CardPreviewModal from '../components/flashcards/CardPreviewModal';
import CardImportExport from '../components/flashcards/CardImportExport';
import DeckBrowser from '../components/flashcards/DeckBrowser';

const CardManagement: React.FC = () => {
  const {
    cards,
    selectedCards,
    viewMode,
    setViewMode,
    loadCards,
    loadDecks,
    isLoading,
    totalCards,
  } = useCardManagementStore();

  const [showEditor, setShowEditor] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showDeckBrowser, setShowDeckBrowser] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewCardId, setPreviewCardId] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadCards();
    loadDecks();
  }, [loadCards, loadDecks]);

  const handleCreateCard = () => {
    setEditingCardId(null);
    setShowEditor(true);
  };

  const handleEditCard = (id: string) => {
    setEditingCardId(id);
    setShowEditor(true);
  };

  const handlePreviewCard = (id: string) => {
    setPreviewCardId(id);
    setShowPreview(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingCardId(null);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewCardId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Card Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Browse and manage your flashcard collection
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeckBrowser(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  📚 Decks
                </button>

                <button
                  onClick={() => setShowImportExport(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  📥 Import/Export
                </button>

                <button
                  onClick={handleCreateCard}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + New Card
                </button>
              </div>
            </div>

            {/* Statistics Overview */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Total Cards
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                  {totalCards}
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Mastered
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                  {cards.filter(c => c.status === 'mastered').length}
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  In Review
                </div>
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">
                  {cards.filter(c => c.status === 'review').length}
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Selected
                </div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                  {selectedCards.size}
                </div>
              </div>
            </div>
          </div>

          {/* Search and View Controls */}
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-2xl">
                <CardSearch />
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Grid view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="List view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Filters Sidebar */}
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-240px)]">
            <CardFilters />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Bulk Actions */}
            {selectedCards.size > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                <BulkActions />
              </div>
            )}

            {/* Card Browser */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <CardBrowser
                  onEditCard={handleEditCard}
                  onPreviewCard={handlePreviewCard}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditor && (
        <CardEditor
          cardId={editingCardId}
          onClose={handleCloseEditor}
          onSave={() => {
            handleCloseEditor();
            loadCards();
          }}
        />
      )}

      {showPreview && previewCardId && (
        <CardPreviewModal
          cardId={previewCardId}
          onClose={handleClosePreview}
          onEdit={() => {
            handleClosePreview();
            handleEditCard(previewCardId);
          }}
        />
      )}

      {showImportExport && (
        <CardImportExport
          onClose={() => setShowImportExport(false)}
          onImportComplete={() => {
            setShowImportExport(false);
            loadCards();
          }}
        />
      )}

      {showDeckBrowser && (
        <DeckBrowser
          onClose={() => setShowDeckBrowser(false)}
          onDeckSelect={(deck) => {
            setShowDeckBrowser(false);
            // Filter by deck
          }}
        />
      )}
    </div>
  );
};

export default CardManagement;
