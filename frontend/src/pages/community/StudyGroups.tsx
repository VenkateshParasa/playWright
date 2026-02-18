import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCommunityStore } from '../../stores/communityStore';
import { Users, Lock, Plus, Search, TrendingUp } from 'lucide-react';

export default function StudyGroups() {
  const { studyGroups, setStudyGroups, isLoading, setLoading } = useCommunityStore();
  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    loadStudyGroups();
  }, []);

  const loadStudyGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/community/study-groups/groups');
      const data = await response.json();

      if (data.success) {
        setStudyGroups(data.data.groups);
      }
    } catch (error) {
      console.error('Error loading study groups:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Groups</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Find your study community</p>
          </div>
          <Link
            to="/community/study-groups/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Create Group
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search study groups..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyGroups.filter(g =>
              g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              g.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((group) => (
              <Link
                key={group._id}
                to={`/community/study-groups/${group._id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {group.banner && (
                  <img src={group.banner} alt={group.name} className="w-full h-32 object-cover" />
                )}
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={group.avatar || '/default-group-avatar.png'}
                      alt={group.name}
                      className="w-12 h-12 rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {group.name}
                        {group.isPrivate && <Lock size={14} className="inline ml-2 text-gray-400" />}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Users size={16} />
                      {group.memberCount} members
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-medium rounded">
                      {group.category}
                    </span>
                  </div>

                  {group.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {group.tags.slice(0, 3).map((tag) => (
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
