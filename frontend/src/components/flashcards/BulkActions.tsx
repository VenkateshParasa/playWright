/**
 * Bulk Actions Component
 * Provides bulk operations toolbar
 */

import React, { useState } from 'react';
import { useCardManagementStore } from '../../stores/cardManagementStore';
import { exportCardsToJSON, exportCardsToCSV } from '../../lib/cards/importExport';

const BulkActions: React.FC = () => {
  const {
    selectedCards,
    cards,
    deselectAll,
    bulkSuspend,
    bulkResume,
    bulkReset,
    bulkDelete,
    bulkChangeCategory,
    bulkChangeDeck,
    decks,
    isLoading,
  } = useCardManagementStore();

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showDeckDialog, setShowDeckDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newDeckId, setNewDeckId] = useState('');

  const selectedCardObjects = cards.filter(c => selectedCards.has(c.id));
  const count = selectedCards.size;

  const handleBulkSuspend = async () => {
    if (confirm(`Suspend ${count} selected cards?`)) {
      await bulkSuspend(Array.from(selectedCards));
      deselectAll();
    }
  };

  const handleBulkResume = async () => {
    if (confirm(`Resume ${count} selected cards?`)) {
      await bulkResume(Array.from(selectedCards));
      deselectAll();
    }
  };

  const handleBulkReset = async () => {
    if (confirm(`Reset progress for ${count} selected cards? This cannot be undone.`)) {
      await bulkReset(Array.from(selectedCards));
      deselectAll();
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${count} selected cards? This cannot be undone.`)) {
      await bulkDelete(Array.from(selectedCards));
      deselectAll();
    }
  };

  const handleChangeCategory = async () => {
    if (!newCategory) return;
    await bulkChangeCategory(Array.from(selectedCards), newCategory);
    setShowCategoryDialog(false);
    setNewCategory('');
    deselectAll();
  };

  const handleChangeDeck = async () => {
    await bulkChangeDeck(Array.from(selectedCards), newDeckId || null);
    setShowDeckDialog(false);
    setNewDeckId('');
    deselectAll();
  };

  const handleExportJSON = () => {
    exportCardsToJSON(selectedCardObjects);
  };

  const handleExportCSV = () => {
    exportCardsToCSV(selectedCardObjects);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {count} selected
          </span>

          <button
            onClick={deselectAll}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Deselect all
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkSuspend}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Suspend
          </button>

          <button
            onClick={handleBulkResume}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Resume
          </button>

          <button
            onClick={handleBulkReset}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Reset
          </button>

          <button
            onClick={() => setShowCategoryDialog(true)}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Change Category
          </button>

          <button
            onClick={() => setShowDeckDialog(true)}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Move to Deck
          </button>

          <div className="relative group">
            <button className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600">
              Export
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                JSON
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                CSV
              </button>
            </div>
          </div>

          <button
            onClick={handleBulkDelete}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Category Dialog */}
      {showCategoryDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Change Category
            </h3>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCategoryDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeCategory}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deck Dialog */}
      {showDeckDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Move to Deck
            </h3>
            <select
              value={newDeckId}
              onChange={(e) => setNewDeckId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
            >
              <option value="">No Deck</option>
              {decks.map(deck => (
                <option key={deck.id} value={deck.id}>
                  {deck.icon} {deck.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeckDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeDeck}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;
