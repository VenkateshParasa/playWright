/**
 * Card Browser Component
 * Displays flashcards in grid or list view with sorting and pagination
 */

import React from 'react';
import { useCardManagementStore, type Card } from '../../stores/cardManagementStore';

interface CardBrowserProps {
  onEditCard: (id: string) => void;
  onPreviewCard: (id: string) => void;
}

const CardBrowser: React.FC<CardBrowserProps> = ({ onEditCard, onPreviewCard }) => {
  const {
    cards,
    selectedCards,
    viewMode,
    selectCard,
    deselectCard,
    sortBy,
    sortOrder,
    setSortBy,
    toggleSortOrder,
    page,
    totalPages,
    setPage,
    deleteCard,
    suspendCard,
  } = useCardManagementStore();

  const handleCardClick = (id: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (selectedCards.has(id)) {
        deselectCard(id);
      } else {
        selectCard(id);
      }
    } else {
      onPreviewCard(id);
    }
  };

  const handleSelectToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCards.has(id)) {
      deselectCard(id);
    } else {
      selectCard(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'learning':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'review':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'mastered':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'suspended':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No cards found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Create your first card or adjust your filters
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {cards.length} cards
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="nextReviewDate">Due Date</option>
            <option value="createdAt">Creation Date</option>
            <option value="difficulty">Difficulty</option>
            <option value="totalReviews">Review Count</option>
            <option value="successRate">Success Rate</option>
          </select>

          <button
            onClick={toggleSortOrder}
            className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 transition-all cursor-pointer ${
                selectedCards.has(card.id)
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={(e) => handleCardClick(card.id, e)}
            >
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedCards.has(card.id)}
                  onChange={(e) => handleSelectToggle(card.id, e as any)}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="p-4 pt-10">
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-3">
                    {card.front}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(card.status)}`}>
                    {card.status}
                  </span>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {card.category}
                </div>

                {card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {card.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div>Reviews: {card.totalReviews}</div>
                  <div>Due: {new Date(card.nextReviewDate).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCard(card.id);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    suspendCard(card.id);
                  }}
                  className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline"
                >
                  Suspend
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this card?')) {
                      deleteCard(card.id);
                    }
                  }}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all cursor-pointer ${
                selectedCards.has(card.id)
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
              onClick={(e) => handleCardClick(card.id, e)}
            >
              <div className="p-4 flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedCards.has(card.id)}
                  onChange={(e) => handleSelectToggle(card.id, e as any)}
                  className="w-5 h-5 text-blue-600 rounded"
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {card.front}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {card.category} • {card.totalReviews} reviews • Due: {new Date(card.nextReviewDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(card.status)}`}>
                    {card.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCard(card.id);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CardBrowser;
