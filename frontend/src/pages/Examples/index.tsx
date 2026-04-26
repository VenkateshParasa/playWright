import { useNavigate } from 'react-router-dom';

const examples = [
  {
    path: '/examples/dashboard',
    title: 'Dashboard Showcase',
    description: 'All dashboard components: welcome card, progress overview, streak, upcoming reviews, achievements, study time chart, and quick actions — powered by live store data.',
    badge: 'Live Data',
    color: 'indigo',
  },
  {
    path: '/examples/lessons',
    title: 'Lesson Components',
    description: 'Lesson cards, compact cards, progress badges, search, filters, and list views with grid/list/grouped modes. Uses real lessons data.',
    badge: 'Live Data',
    color: 'blue',
  },
  {
    path: '/examples/exercises',
    title: 'Exercise Usage',
    description: 'Load all exercises, filter by difficulty, view exercise details, use the code editor, reveal hints, track progress and attempt history.',
    badge: 'Live Data',
    color: 'green',
  },
  {
    path: '/examples/achievements',
    title: 'Achievement Integration',
    description: 'Track lesson completions, quiz results, flashcard reviews, exercise completions, XP awards, recent achievements, daily challenges and stats.',
    badge: 'Live Data',
    color: 'purple',
  },
  {
    path: '/examples/search',
    title: 'Search Examples',
    description: 'Basic search, store access, keyboard shortcuts (Cmd/Ctrl+K), recent searches, custom index search, analytics tracking, filter control and keyboard navigation.',
    badge: 'Live Data',
    color: 'yellow',
  },
  {
    path: '/examples/notifications',
    title: 'Notification System',
    description: 'Send SRS review, lesson, quiz, achievement, feedback and streak notifications. Custom notifications, push notification subscription, and live notification list.',
    badge: 'Live Data',
    color: 'red',
  },
];

const colorMap: Record<string, string> = {
  indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400 group-hover:text-indigo-700',
  blue: 'bg-blue-50 border-blue-200 hover:border-blue-400 group-hover:text-blue-700',
  green: 'bg-green-50 border-green-200 hover:border-green-400 group-hover:text-green-700',
  purple: 'bg-purple-50 border-purple-200 hover:border-purple-400 group-hover:text-purple-700',
  yellow: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400 group-hover:text-yellow-700',
  red: 'bg-red-50 border-red-200 hover:border-red-400 group-hover:text-red-700',
};

const badgeColorMap: Record<string, string> = {
  indigo: 'bg-indigo-100 text-indigo-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
};

export default function ExamplesIndex() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Component Examples</h1>
        <p className="mt-2 text-gray-600">
          Live demonstrations of all major UI components, each connected to real store data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examples.map((ex) => (
          <button
            key={ex.path}
            onClick={() => navigate(ex.path)}
            className={`group text-left p-6 rounded-xl border-2 transition-all ${colorMap[ex.color]}`}
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                {ex.title}
              </h2>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ml-2 shrink-0 ${badgeColorMap[ex.color]}`}>
                {ex.badge}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{ex.description}</p>
            <div className="mt-4 text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
              View example →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
