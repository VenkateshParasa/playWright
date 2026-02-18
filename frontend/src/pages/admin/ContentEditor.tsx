import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  CheckSquare,
  Square,
  Globe,
  FileText,
  HelpCircle,
  Code,
  Layers,
} from 'lucide-react';
import useAdminContentStore from '../../stores/adminContentStore';
import type { ContentType, ContentStatus } from '../../stores/adminContentStore';

const ContentEditor: React.FC = () => {
  const navigate = useNavigate();
  const {
    contentList,
    filteredContent,
    filters,
    selectedContentIds,
    setContentList,
    setFilters,
    applyFilters,
    selectContent,
    deselectContent,
    selectAllContent,
    deselectAllContent,
    bulkPublish,
    bulkUnpublish,
    bulkDelete,
  } = useAdminContentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Load content list from API
    fetch('/api/admin/content')
      .then((res) => res.json())
      .then((data) => {
        setContentList(data);
        applyFilters();
      })
      .catch((err) => console.error('Failed to load content:', err));
  }, [setContentList]);

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters({ search: query });
  };

  const handleTypeFilter = (type: ContentType | undefined) => {
    setFilters({ type });
  };

  const handleStatusFilter = (status: ContentStatus | undefined) => {
    setFilters({ status });
  };

  const handleBulkPublish = async () => {
    if (selectedContentIds.length === 0) return;
    if (confirm(`Publish ${selectedContentIds.length} selected items?`)) {
      await bulkPublish(selectedContentIds);
      // Reload content
      fetch('/api/admin/content')
        .then((res) => res.json())
        .then((data) => setContentList(data));
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedContentIds.length === 0) return;
    if (confirm(`Unpublish ${selectedContentIds.length} selected items?`)) {
      await bulkUnpublish(selectedContentIds);
      fetch('/api/admin/content')
        .then((res) => res.json())
        .then((data) => setContentList(data));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContentIds.length === 0) return;
    if (confirm(`Delete ${selectedContentIds.length} selected items? This cannot be undone!`)) {
      await bulkDelete(selectedContentIds);
      fetch('/api/admin/content')
        .then((res) => res.json())
        .then((data) => setContentList(data));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await fetch(`/api/admin/content/${id}`, { method: 'DELETE' });
      fetch('/api/admin/content')
        .then((res) => res.json())
        .then((data) => setContentList(data));
    }
  };

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'lesson':
        return <FileText className="w-5 h-5" />;
      case 'quiz':
        return <HelpCircle className="w-5 h-5" />;
      case 'exercise':
        return <Code className="w-5 h-5" />;
      case 'flashcard':
        return <Layers className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'archived':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Content Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage lessons, quizzes, exercises, and flashcards
              </p>
            </div>

            {/* Create New Dropdown */}
            <div className="relative group">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create New
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={() => navigate('/admin/lessons/new')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 rounded-t-lg"
                >
                  <FileText className="w-4 h-4" />
                  Lesson
                </button>
                <button
                  onClick={() => navigate('/admin/quizzes/new')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Quiz
                </button>
                <button
                  onClick={() => navigate('/admin/exercises/new')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Code className="w-4 h-4" />
                  Exercise
                </button>
                <button
                  onClick={() => navigate('/admin/flashcards/new')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 rounded-b-lg"
                >
                  <Layers className="w-4 h-4" />
                  Flashcard Deck
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search content..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                  showFilters ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => handleTypeFilter(undefined)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      !filters.type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => handleTypeFilter('lesson')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.type === 'lesson'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Lessons
                  </button>
                  <button
                    onClick={() => handleTypeFilter('quiz')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.type === 'quiz'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Quizzes
                  </button>
                  <button
                    onClick={() => handleTypeFilter('exercise')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.type === 'exercise'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Exercises
                  </button>
                  <button
                    onClick={() => handleTypeFilter('flashcard')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.type === 'flashcard'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Flashcards
                  </button>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleStatusFilter(undefined)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      !filters.status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    All Status
                  </button>
                  <button
                    onClick={() => handleStatusFilter('draft')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.status === 'draft'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    onClick={() => handleStatusFilter('published')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.status === 'published'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Published
                  </button>
                  <button
                    onClick={() => handleStatusFilter('scheduled')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.status === 'scheduled'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Scheduled
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedContentIds.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="flex items-center gap-3">
                <button
                  onClick={deselectAllContent}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Deselect All
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedContentIds.length} item(s) selected
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkPublish}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                >
                  Publish
                </button>
                <button
                  onClick={handleBulkUnpublish}
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                >
                  Unpublish
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No content found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedContentIds.length > 0 &&
                        selectedContentIds.length === filteredContent.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAllContent();
                        } else {
                          deselectAllContent();
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredContent.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedContentIds.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            selectContent(item.id);
                          } else {
                            deselectContent(item.id);
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span className="text-sm capitalize text-gray-900 dark:text-white">
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </p>
                        {item.category && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.category}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/${item.type}s/${item.id}`)
                          }
                          className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentEditor;
