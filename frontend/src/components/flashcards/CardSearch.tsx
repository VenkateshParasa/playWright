/**
 * Card Search Component
 * Provides search functionality for cards
 */

import React, { useState, useEffect, useRef } from 'react';
import { useCardManagementStore } from '../../stores/cardManagementStore';

const CardSearch: React.FC = () => {
  const { searchQuery, setSearchQuery, loadCards } = useCardManagementStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setLocalQuery(value);

    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setSearchQuery(value);
      loadCards();
    }, 300);
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    loadCards();
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={localQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search cards..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="absolute left-3 top-2.5 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default CardSearch;
