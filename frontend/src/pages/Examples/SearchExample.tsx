/**
 * Search Examples - Live Route
 * All search functionality patterns using real store data.
 */

import { useNavigate } from 'react-router-dom';
import {
  BasicSearchExample,
  DirectStoreExample,
  KeyboardShortcutExample,
  RecentSearchesExample,
  FilterControlExample,
  KeyboardNavigationExample,
  RouterIntegrationExample,
} from '../../examples/SearchExamples';

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-0.5 mb-4">{description}</p>
      {children}
    </section>
  );
}

export default function SearchExample() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/examples')} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Examples
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search Examples</h1>
          <p className="text-sm text-gray-500 mt-0.5">All search functionality patterns — live store data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Basic Search" description="useSearch() hook: run a search and read results.">
          <BasicSearchExample />
        </Section>

        <Section title="Direct Store Access" description="Set query, apply filters, and open the search modal programmatically.">
          <DirectStoreExample />
        </Section>

        <Section title="Keyboard Shortcut" description="useSearchShortcut() sets up Cmd/Ctrl+K globally.">
          <KeyboardShortcutExample />
        </Section>

        <Section title="Recent Searches" description="Read and manage the list of recent searches from the store.">
          <RecentSearchesExample />
        </Section>

        <Section title="Filter Control" description="Programmatically set and reset search filters.">
          <FilterControlExample />
        </Section>

        <Section title="Keyboard Navigation" description="Arrow-key navigation through search results via store.">
          <KeyboardNavigationExample />
        </Section>

        <Section title="Router Integration" description="Close search modal and navigate to result URL.">
          <RouterIntegrationExample />
        </Section>
      </div>
    </div>
  );
}
