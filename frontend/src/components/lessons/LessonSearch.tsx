import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface LessonSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  initialValue?: string;
}

export default function LessonSearch({
  onSearch,
  placeholder = 'Search lessons by title or topic...',
  debounceMs = 300,
  className = '',
  initialValue = '',
}: LessonSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onSearch(query);
      }, debounceMs);
    },
    [onSearch, debounceMs]
  );

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Clear search
  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to clear search
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex items-center bg-white border-2 rounded-lg px-4 py-2.5 transition-all duration-200 ${
          isFocused
            ? 'border-blue-500 shadow-lg ring-2 ring-blue-100'
            : 'border-gray-200 shadow-sm hover:border-gray-300'
        }`}
      >
        <Search
          className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${
            isFocused ? 'text-blue-500' : 'text-gray-400'
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 outline-none text-gray-900 placeholder-gray-400 bg-transparent"
          aria-label="Search lessons"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="ml-2 p-1 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Keyboard shortcut hint */}
      {!isFocused && !searchQuery && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
            {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}K
          </kbd>
        </div>
      )}

      {/* Search result count (optional, can be passed from parent) */}
      {searchQuery && (
        <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
          Searching for "{searchQuery}"
        </div>
      )}
    </div>
  );
}

// Compact version for mobile or tight spaces
export function CompactLessonSearch({
  onSearch,
  placeholder = 'Search...',
  className = '',
}: Omit<LessonSearchProps, 'debounceMs' | 'initialValue'>) {
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center bg-white border border-gray-200 rounded-md px-3 py-2">
        <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent"
        />
        {searchQuery && (
          <button onClick={handleClear} className="ml-2" aria-label="Clear search">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}
