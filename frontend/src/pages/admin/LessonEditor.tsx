import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  Eye,
  Upload,
  Plus,
  X,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import useAdminContentStore from '../../stores/adminContentStore';
import MarkdownEditor from '../../components/admin/MarkdownEditor';
import MediaUploader from '../../components/admin/MediaUploader';
import PublishSettings from '../../components/admin/PublishSettings';
import ContentPreview from '../../components/admin/ContentPreview';
import type { LessonContent } from '../../stores/adminContentStore';

const LessonEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentLesson,
    setCurrentLesson,
    updateLessonField,
    saveLessonDraft,
    publishLesson,
    hasUnsavedChanges,
    lastAutoSave,
    isLoading,
    error,
  } = useAdminContentStore();

  const [showPreview, setShowPreview] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [newObjective, setNewObjective] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      saveLessonDraft();
    }, 30000);

    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, saveLessonDraft]);

  // Load lesson if editing
  useEffect(() => {
    if (id && id !== 'new') {
      // Load lesson from API
      fetch(`/api/admin/lessons/${id}`)
        .then((res) => res.json())
        .then((lesson) => setCurrentLesson(lesson))
        .catch((err) => console.error('Failed to load lesson:', err));
    } else if (id === 'new') {
      // Initialize new lesson
      setCurrentLesson({
        id: '',
        title: '',
        description: '',
        content: '',
        duration: 30,
        difficulty: 'beginner',
        category: '',
        tags: [],
        prerequisites: [],
        learningObjectives: [],
        images: [],
        videos: [],
        status: 'draft',
        version: 1,
        versionHistory: [],
      });
    }

    return () => {
      setCurrentLesson(null);
    };
  }, [id, setCurrentLesson]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading lesson...</p>
        </div>
      </div>
    );
  }

  const handleSaveDraft = async () => {
    setIsSaving(true);
    saveLessonDraft();
    setTimeout(() => setIsSaving(false), 500);
  };

  const handlePublish = async () => {
    if (!currentLesson.title || !currentLesson.content) {
      alert('Please fill in title and content before publishing');
      return;
    }

    if (confirm('Are you sure you want to publish this lesson?')) {
      await publishLesson();
      navigate('/admin/content');
    }
  };

  const addLearningObjective = () => {
    if (newObjective.trim()) {
      updateLessonField('learningObjectives', [
        ...currentLesson.learningObjectives,
        newObjective.trim(),
      ]);
      setNewObjective('');
    }
  };

  const removeLearningObjective = (index: number) => {
    updateLessonField(
      'learningObjectives',
      currentLesson.learningObjectives.filter((_, i) => i !== index)
    );
  };

  const addTag = () => {
    if (newTag.trim() && !currentLesson.tags.includes(newTag.trim())) {
      updateLessonField('tags', [...currentLesson.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    updateLessonField(
      'tags',
      currentLesson.tags.filter((t) => t !== tag)
    );
  };

  const handleMediaUploadComplete = (urls: string[]) => {
    updateLessonField('images', [...currentLesson.images, ...urls]);
    setShowMediaUploader(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (
                    hasUnsavedChanges &&
                    !confirm('You have unsaved changes. Are you sure you want to leave?')
                  ) {
                    return;
                  }
                  navigate('/admin/content');
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {id === 'new' ? 'Create New Lesson' : 'Edit Lesson'}
                </h1>
                {lastAutoSave && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last saved: {new Date(lastAutoSave).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Unsaved changes
                </span>
              )}

              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>

              <button
                onClick={handleSaveDraft}
                disabled={isSaving || !hasUnsavedChanges}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                onClick={handlePublish}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                {currentLesson.status === 'published' ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Basic Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={currentLesson.title}
                  onChange={(e) => updateLessonField('title', e.target.value)}
                  placeholder="Enter lesson title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={currentLesson.description}
                  onChange={(e) => updateLessonField('description', e.target.value)}
                  placeholder="Brief description of the lesson"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={currentLesson.duration}
                    onChange={(e) =>
                      updateLessonField('duration', parseInt(e.target.value) || 0)
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={currentLesson.difficulty}
                    onChange={(e) =>
                      updateLessonField(
                        'difficulty',
                        e.target.value as 'beginner' | 'intermediate' | 'advanced'
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={currentLesson.category}
                  onChange={(e) => updateLessonField('category', e.target.value)}
                  placeholder="e.g., Playwright Basics"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Lesson Content *
                </h2>
                <button
                  onClick={() => setShowMediaUploader(true)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                >
                  <Upload className="w-4 h-4" />
                  Upload Media
                </button>
              </div>

              <MarkdownEditor
                value={currentLesson.content}
                onChange={(content) => updateLessonField('content', content)}
                placeholder="Write your lesson content in Markdown..."
                height="600px"
                allowImages
              />
            </div>

            {/* Learning Objectives */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Learning Objectives
              </h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLearningObjective()}
                  placeholder="Add a learning objective"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={addLearningObjective}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {currentLesson.learningObjectives.length > 0 && (
                <ul className="space-y-2">
                  {currentLesson.learningObjectives.map((objective, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span className="text-gray-900 dark:text-white">{objective}</span>
                      <button
                        onClick={() => removeLearningObjective(index)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Column - Metadata & Settings */}
          <div className="space-y-6">
            {/* Publishing Settings */}
            <PublishSettings
              status={currentLesson.status}
              scheduledFor={currentLesson.scheduledFor}
              track={currentLesson.track}
              onStatusChange={(status) => updateLessonField('status', status)}
              onScheduleChange={(date) => updateLessonField('scheduledFor', date)}
              onTrackChange={(track) => updateLessonField('track', track)}
            />

            {/* Tags */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add a tag"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {currentLesson.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentLesson.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Media */}
            {currentLesson.images.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Uploaded Media
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {currentLesson.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Media ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        onClick={() =>
                          updateLessonField(
                            'images',
                            currentLesson.images.filter((_, i) => i !== index)
                          )
                        }
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Uploader Modal */}
      {showMediaUploader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upload Media
              </h2>
              <button
                onClick={() => setShowMediaUploader(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <MediaUploader
              accept="image/*"
              maxSize={10}
              maxFiles={5}
              onUploadComplete={handleMediaUploadComplete}
            />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <ContentPreview
          content={currentLesson}
          type="lesson"
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default LessonEditor;
