import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCommunityStore } from '../../stores/communityStore';
import { MessageSquare, TrendingUp, HelpCircle, Star, Plus, Search, Filter } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All Discussions', icon: MessageSquare },
  { id: 'general', name: 'General', icon: MessageSquare },
  { id: 'help', name: 'Help', icon: HelpCircle },
  { id: 'show-and-tell', name: 'Show & Tell', icon: Star },
  { id: 'announcements', name: 'Announcements', icon: TrendingUp },
];

const SORT_OPTIONS = [
  { id: 'recent', name: 'Recent' },
  { id: 'popular', name: 'Popular' },
  { id: 'unanswered', name: 'Unanswered' },
  { id: 'trending', name: 'Trending' },
];

export default function Forum() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { threads, setThreads, isLoading, setLoading } = useCommunityStore();
  const [searchQuery, setSearchQuery] = useState('');

  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'recent';

  useEffect(() => {
    loadThreads();
  }, [category, sort]);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      params.append('sort', sort);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/community/forum/threads?${params}`);
      const data = await response.json();

      if (data.success) {
        setThreads([...data.data.pinned, ...data.data.threads]);
      }
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSearchParams({ category: categoryId, sort });
  };

  const handleSortChange = (sortId: string) => {
    setSearchParams({ category, sort: sortId });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadThreads();
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Community Forum
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Connect, learn, and grow together
            </p>
          </div>
          <Link
            to="/community/forum/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            New Thread
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
                Categories
              </h2>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      category === cat.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <cat.icon size={18} />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Filter size={18} />
                Sort By
              </h2>
              <div className="space-y-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSortChange(option.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      sort === option.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-sm font-medium">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Thread List */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading threads...</p>
              </div>
            ) : threads.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No threads found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Be the first to start a discussion!
                </p>
                <Link
                  to="/community/forum/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={20} />
                  Create Thread
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {threads.map((thread) => (
                  <Link
                    key={thread._id}
                    to={`/community/forum/thread/${thread._id}`}
                    className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition p-5"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={thread.author.avatar || `https://ui-avatars.com/api/?name=${thread.author.firstName}+${thread.author.lastName}`}
                        alt={`${thread.author.firstName} ${thread.author.lastName}`}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {thread.isPinned && (
                            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-medium rounded">
                              Pinned
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                            thread.category === 'help'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                              : thread.category === 'announcements'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                              : thread.category === 'show-and-tell'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                          }`}>
                            {thread.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {thread.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                          {thread.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>
                            by {thread.author.firstName} {thread.author.lastName}
                          </span>
                          <span>•</span>
                          <span>{formatTimeAgo(thread.lastActivityAt)}</span>
                          <span>•</span>
                          <span>{thread.views} views</span>
                          <span>•</span>
                          <span>{thread.replyCount} replies</span>
                          {thread.bestAnswer && (
                            <>
                              <span>•</span>
                              <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                <Star size={14} className="fill-current" />
                                Solved
                              </span>
                            </>
                          )}
                        </div>
                        {thread.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {thread.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-1 text-sm">
                        <span className="text-gray-900 dark:text-white font-semibold">
                          {thread.upvotes.length - thread.downvotes.length}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          votes
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
