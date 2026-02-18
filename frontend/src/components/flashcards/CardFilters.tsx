/**
 * Card Filters Component
 * Provides filtering options for the card browser
 */

import React, { useState, useEffect } from 'react';
import { useCardManagementStore, type CardStatus, type CardDifficulty } from '../../stores/cardManagementStore';

const CardFilters: React.FC = () => {
  const {
    filters,
    setFilters,
    clearFilters,
    decks,
    loadDecks,
  } = useCardManagementStore();

  const [categories, setCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    loadDecks();
    // TODO: Load categories and tags from API
    setCategories(['Playwright Basics', 'Selenium Advanced', 'Testing Best Practices']);
    setAllTags(['automation', 'testing', 'locators', 'async', 'debugging']);
  }, [loadDecks]);

  const statuses: CardStatus[] = ['new', 'learning', 'review', 'mastered', 'suspended'];
  const difficulties: CardDifficulty[] = ['easy', 'medium', 'hard'];

  const handleStatusToggle = (status: CardStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    setFilters({ status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handleDifficultyToggle = (difficulty: CardDifficulty) => {
    const currentDifficulties = filters.difficulty || [];
    const newDifficulties = currentDifficulties.includes(difficulty)
      ? currentDifficulties.filter(d => d !== difficulty)
      : [...currentDifficulties, difficulty];
    setFilters({ difficulty: newDifficulties.length > 0 ? newDifficulties : undefined });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setFilters({ tags: newTags.length > 0 ? newTags : undefined });
  };

  const activeFilterCount = [
    filters.deckId ? 1 : 0,
    filters.category ? 1 : 0,
    (filters.tags?.length || 0),
    (filters.status?.length || 0),
    (filters.difficulty?.length || 0),
    filters.dueOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Deck Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Deck
        </label>
        <select
          value={filters.deckId || ''}
          onChange={(e) => setFilters({ deckId: e.target.value || undefined })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="">All Decks</option>
          {decks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.icon} {deck.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select
          value={filters.category || ''}
          onChange={(e) => setFilters({ category: e.target.value || undefined })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <div className="space-y-2">
          {statuses.map((status) => (
            <label key={status} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.status?.includes(status) || false}
                onChange={() => handleStatusToggle(status)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                {status}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Difficulty
        </label>
        <div className="space-y-2">
          {difficulties.map((difficulty) => (
            <label key={difficulty} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.difficulty?.includes(difficulty) || false}
                onChange={() => handleDifficultyToggle(difficulty)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                {difficulty}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        <div className="space-y-2">
          {allTags.map((tag) => (
            <label key={tag} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.tags?.includes(tag) || false}
                onChange={() => handleTagToggle(tag)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {tag}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Due Only Filter */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.dueOnly || false}
            onChange={(e) => setFilters({ dueOnly: e.target.checked || undefined })}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Show only due cards
          </span>
        </label>
      </div>
    </div>
  );
};

export default CardFilters;
