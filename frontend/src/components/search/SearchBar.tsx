import { Search, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchStore } from '../../stores/searchStore';
import { debounce } from '../../lib/search';

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

export default function SearchBar({
  placeholder = 'Search lessons, exercises, flashcards...',
  autoFocus = true,
  onSearch,
  className = '',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, isLoading, setQuery } = useSearchStore();
  const [localQuery, setLocalQuery] = useState(query);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      setQuery(searchQuery);
      onSearch?.(searchQuery);
    }, 300),
    [setQuery, onSearch]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setLocalQuery(newQuery);
    debouncedSearch(newQuery);
  };

  // Handle clear
  const handleClear = () => {
    setLocalQuery('');
    setQuery('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  // Auto-focus input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Sync with store
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-12 pr-20 py-3 text-base border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-transparent"
          aria-label="Search"
          autoComplete="off"
          spellCheck="false"
        />

        {/* Clear Button */}
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>

      {/* Keyboard shortcut hint */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        {!localQuery && !isLoading && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-600 font-mono">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
            </kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-600 font-mono">
              K
            </kbd>
          </div>
        )}
      </div>
    </div>
  );
}
